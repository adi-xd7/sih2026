import base64
import os
from datetime import datetime
import cv2
import gdown
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models

# ==========================================
# 1. SETUP & CONFIGURATION
# ==========================================

IMG_SIZE = 300
DR_CLASS_NAMES = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
]
MODEL_WEIGHTS_PATH = "dr_grading_model.pt"

# Paste your Google Drive File ID here
# (e.g., from https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view -> "1A2B3C4D5E6F7G8H9")
GDRIVE_FILE_ID = "YOUR_GOOGLE_DRIVE_FILE_ID_HERE"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running inference on device: {DEVICE}")


def download_model_from_gdrive(file_id, output_path):
    if not os.path.exists(output_path):
        print(
            f"Model weights not found locally. Downloading from Google Drive"
            f" (ID: {file_id})..."
        )
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, output_path, quiet=False)
        print("Download complete.")
    else:
        print(f"Found local model weights at '{output_path}'.")


app = FastAPI(
    title="Explainable AI for Diabetic Retinopathy Screening API", version="1.0"
)

# Enable CORS for web frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 2. STEP 1: IMAGE QUALITY ASSESSMENT
# ==========================================


def get_field_of_view_mask(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    kernel = np.ones((15, 15), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    return mask


def _check_circularity(mask):
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    if not contours:
        return 0.0, 0.0
    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    perimeter = cv2.arcLength(largest, True)
    if perimeter == 0 or area == 0:
        return 0.0, 0.0
    circularity = min((4 * np.pi * area) / (perimeter**2), 1.0)
    coverage_fraction = area / (mask.shape[0] * mask.shape[1])
    return circularity, coverage_fraction


def _check_fundus_color_signature(img, mask):
    valid = mask > 0
    if valid.sum() == 0:
        return False, 0.0
    b = img[:, :, 0][valid].mean()
    g = img[:, :, 1][valid].mean()
    r = img[:, :, 2][valid].mean()
    if b < 1:
        return False, 0.0
    red_blue_ratio = r / b
    is_plausible = (red_blue_ratio > 1.15) and (r >= g >= b * 0.9)
    return is_plausible, round(float(red_blue_ratio), 2)


def is_fundus_image(img):
    reasons = []
    mask = get_field_of_view_mask(img)
    circularity, coverage = _check_circularity(mask)
    color_ok, rb_ratio = _check_fundus_color_signature(img, mask)

    circularity_ok = circularity >= 0.55
    coverage_ok = 0.15 <= coverage <= 1.05

    if not circularity_ok:
        reasons.append(
            f"No circular retinal field detected (circularity={circularity:.2f})."
        )
    if not coverage_ok:
        reasons.append(
            f"Illuminated field covers {coverage*100:.1f}% of frame (expected"
            " 15-105%)."
        )
    if not color_ok:
        reasons.append(
            f"Color profile (R/B ratio={rb_ratio}) doesn't match fundus tissue"
            " signature."
        )

    is_valid = circularity_ok and coverage_ok and color_ok
    confidence = 0.0
    confidence += (
        40 * min(circularity / 0.55, 1.0)
        if circularity_ok
        else 40 * (circularity / 0.55)
    )
    confidence += 30 if coverage_ok else 0
    confidence += 30 if color_ok else 30 * min(rb_ratio / 1.15, 1.0)
    confidence = round(min(confidence, 100), 1)

    return {
        "is_fundus": is_valid,
        "confidence": confidence,
        "reasons": reasons,
        "diagnostics": {
            "circularity": round(float(circularity), 3),
            "coverage_fraction": round(float(coverage), 3),
            "red_blue_ratio": rb_ratio,
        },
    }


def check_blur(gray_img):
    lap_var = cv2.Laplacian(gray_img, cv2.CV_64F).var()
    return min(100, (lap_var / 150.0) * 100), float(lap_var)


def check_illumination(gray_img, mask):
    valid_pixels = gray_img[mask > 0]
    if len(valid_pixels) == 0:
        return 0, 0
    mean_brightness = valid_pixels.mean()
    if 80 <= mean_brightness <= 180:
        score = 100
    else:
        score = max(
            0,
            100 - min(abs(mean_brightness - 80), abs(mean_brightness - 180)),
        )
    return score, float(mean_brightness)


def check_contrast(gray_img, mask):
    valid_pixels = gray_img[mask > 0]
    if len(valid_pixels) == 0:
        return 0, 0
    std = valid_pixels.std()
    return min(100, (std / 50.0) * 100), float(std)


def check_field_of_view(mask, img_shape):
    h, w = img_shape[:2]
    expected_area = np.pi * (min(h, w) / 2) ** 2
    actual_area = np.sum(mask > 0)
    return min(100, (actual_area / expected_area) * 100)


def assess_quality_from_numpy(img):
    fundus_check = is_fundus_image(img)
    if not fundus_check["is_fundus"]:
        return {
            "error": "Not a fundus photo.",
            "is_fundus": False,
            **fundus_check,
        }

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fov_mask = get_field_of_view_mask(img)
    blur_score, lap_var = check_blur(gray)
    illum_score, brightness = check_illumination(gray, fov_mask)
    contrast_score, std = check_contrast(gray, fov_mask)
    fov_score = check_field_of_view(fov_mask, img.shape)

    overall = (
        0.35 * blur_score
        + 0.20 * illum_score
        + 0.20 * contrast_score
        + 0.25 * fov_score
    )
    suitable = overall >= 60

    result = {
        "is_fundus": True,
        "fundus_confidence": fundus_check["confidence"],
        "overall_score": round(float(overall), 1),
        "suitable_for_screening": bool(suitable),
        "sub_scores": {
            "blur": round(float(blur_score), 1),
            "illumination": round(float(illum_score), 1),
            "contrast": round(float(contrast_score), 1),
            "field_of_view": round(float(fov_score), 1),
        },
    }
    if not suitable:
        reasons = []
        if blur_score < 50:
            reasons.append("image too blurry")
        if illum_score < 50:
            reasons.append("poor illumination")
        if contrast_score < 50:
            reasons.append("low contrast")
        if fov_score < 50:
            reasons.append("partial retina visible - recapture")
        result["recapture_reasons"] = reasons

    return result


# ==========================================
# 3. STEP 3: MODEL DEFINITION & INFERENCE
# ==========================================


def build_model(n_classes=5):
    model = models.efficientnet_b3(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, n_classes)
    return model


def get_target_layer(model):
    return model.features[-1]


# Download model if not present, then load weights
download_model_from_gdrive(GDRIVE_FILE_ID, MODEL_WEIGHTS_PATH)
grading_model = build_model().to(DEVICE)
grading_model.load_state_dict(
    torch.load(MODEL_WEIGHTS_PATH, map_location=DEVICE)
)
print(f"Successfully loaded model weights from '{MODEL_WEIGHTS_PATH}'")
grading_model.eval()


def predict_severity_from_numpy(
    model, img_bgr, img_size=IMG_SIZE, device=DEVICE
):
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = (
        cv2.resize(img_rgb, (img_size, img_size)).astype(np.float32) / 255.0
    )
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_norm = (img_resized - mean) / std
    img_tensor = (
        torch.from_numpy(img_norm.transpose(2, 0, 1))
        .float()
        .unsqueeze(0)
        .to(device)
    )

    model.eval()
    with torch.no_grad():
        probs = torch.softmax(model(img_tensor), dim=1).cpu().numpy()[0]
    pred_class = int(np.argmax(probs))
    return {
        "class_idx": pred_class,
        "class_name": DR_CLASS_NAMES[pred_class],
        "confidence": round(float(probs[pred_class]) * 100, 1),
        "all_probs": {
            DR_CLASS_NAMES[i]: round(float(p) * 100, 1)
            for i, p in enumerate(probs)
        },
    }


# ==========================================
# 4. STEP 4: EXPLAINABILITY (GRAD-CAM)
# ==========================================


class GradCAM:

    def __init__(self, model, target_layer):
        self.model = model
        self.gradients = None
        self.activations = None
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, target_class=None):
        self.model.eval()
        output = self.model(input_tensor)
        if target_class is None:
            target_class = torch.argmax(output, dim=1).item()
        self.model.zero_grad()
        output[0, target_class].backward()

        weights = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = F.relu((weights * self.activations).sum(dim=1, keepdim=True))
        cam = cam.squeeze().cpu().numpy()
        cam = cv2.resize(cam, (input_tensor.shape[3], input_tensor.shape[2]))
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        return cam, target_class


def overlay_heatmap(original_img, cam, alpha=0.4):
    heatmap = cv2.applyColorMap(
        (cam * 255).astype(np.uint8), cv2.COLORMAP_JET
    )
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    return cv2.addWeighted(original_img, 1 - alpha, heatmap, alpha, 0)


def compute_lesion_correlation(cam, lesion_masks, threshold=0.5):
    high_activation = (cam >= threshold).astype(np.uint8)
    high_activation_area = np.sum(high_activation)
    if high_activation_area == 0 or not lesion_masks:
        return 0.0
    combined = np.zeros_like(high_activation)
    for lesion_info in lesion_masks.values():
        mask = cv2.resize(
            lesion_info["mask"],
            (high_activation.shape[1], high_activation.shape[0]),
        )
        combined = np.maximum(combined, (mask > 0).astype(np.uint8))
    overlap = np.sum(high_activation & combined)
    return round(float(overlap / high_activation_area), 3)


def generate_report(
    severity_result,
    lesion_masks,
    correlation_score,
    quality_result,
    patient_id="N/A",
):
    class_name = severity_result["class_name"]
    confidence = severity_result["confidence"]

    lesion_lines = []
    for name, info in lesion_masks.items():
        if info.get("count", 0) > 0:
            lesion_lines.append(
                f"  - {info['count']} {name.replace('_', ' ').title()}(s)"
                " detected"
            )
    if not lesion_lines:
        lesion_lines.append("  - No significant lesions detected")

    recommendations = {
        "No DR": "Routine annual screening recommended.",
        "Mild DR": "Follow-up screening recommended within 12 months.",
        "Moderate DR": "Consult an ophthalmologist within 2-4 weeks.",
        "Severe DR": (
            "Urgent ophthalmologist referral recommended within 1 week."
        ),
        "Proliferative DR": "Immediate ophthalmologist referral required.",
    }
    trust_flag = (
        "High correlation between AI attention and detected lesions."
        if correlation_score >= 0.5
        else "Low correlation - flag for manual review."
    )

    report = f"""
{'=' * 60}
DIABETIC RETINOPATHY SCREENING REPORT
{'=' * 60}
Patient ID: {patient_id}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}

IMAGE QUALITY: {quality_result['overall_score']}% - {'Suitable' if quality_result['suitable_for_screening'] else 'NOT SUITABLE - recapture'}

SEVERITY ASSESSMENT: {class_name}
Confidence: {confidence}%

CLINICAL EVIDENCE:
{chr(10).join(lesion_lines)}

EXPLAINABILITY CHECK:
{trust_flag}
(Lesion-attention overlap score: {correlation_score})

RECOMMENDATION:
{recommendations.get(class_name, 'Consult an ophthalmologist.')}
{'=' * 60}
"""
    return report.strip()


# ==========================================
# 5. FASTAPI API ENDPOINTS
# ==========================================


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Explainable AI DR Screening API",
        "device": DEVICE,
    }


@app.post("/api/screen")
async def screen_fundus_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Uploaded file is not an image."
        )

    # 1. Read input image into memory
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(
            status_code=400, detail="Invalid image file format."
        )

    # 2. Perform Image Quality Assessment
    quality_res = assess_quality_from_numpy(img_bgr)
    if not quality_res.get("is_fundus", False) or not quality_res.get(
        "suitable_for_screening", False
    ):
        return {
            "status": "rejected",
            "message": (
                "Image rejected during quality assessment. Please recapture."
            ),
            "quality": quality_res,
        }

    # 3. Severity Prediction
    severity_res = predict_severity_from_numpy(
        grading_model, img_bgr, device=DEVICE
    )

    # 4. Grad-CAM Explainability Generation
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_resized = (
        cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float32) / 255.0
    )
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_norm = (img_resized - mean) / std

    input_tensor = (
        torch.from_numpy(img_norm.transpose(2, 0, 1))
        .float()
        .unsqueeze(0)
        .to(DEVICE)
    )
    input_tensor.requires_grad_(True)

    gradcam = GradCAM(grading_model, get_target_layer(grading_model))
    cam, _ = gradcam.generate(
        input_tensor, target_class=severity_res["class_idx"]
    )

    display_img = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
    overlaid_rgb = overlay_heatmap(display_img, cam)
    overlaid_bgr = cv2.cvtColor(overlaid_rgb, cv2.COLOR_RGB2BGR)

    # Base64 encode heatmap image response
    _, buffer = cv2.imencode(".png", overlaid_bgr)
    heatmap_b64 = base64.b64encode(buffer).decode("utf-8")

    # 5. Generate Text Report
    dummy_lesions = {}
    correlation_score = compute_lesion_correlation(cam, dummy_lesions)
    report_text = generate_report(
        severity_res, dummy_lesions, correlation_score, quality_res
    )

    return {
        "status": "success",
        "quality": quality_res,
        "severity": severity_res,
        "heatmap_image": f"data:image/png;base64,{heatmap_b64}",
        "correlation_score": correlation_score,
        "report": report_text,
    }