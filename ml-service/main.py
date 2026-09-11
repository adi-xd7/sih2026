import io
import os
import cv2
import gdown
import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from torchvision import models

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

app = FastAPI(
    title="DR Severity Grading API",
    description="Explainable AI for Diabetic Retinopathy Screening",
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "dr_grading_model.pt"
# Replace with your actual Google Drive File ID
GDRIVE_FILE_ID = "1IkGlBxmnxAFuOAk7yoZ92DnulxJtzxiz"
IMG_SIZE = 300

DR_CLASS_NAMES = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
]

# ---------------------------------------------------------------------------
# Architecture & Diagnostics
# ---------------------------------------------------------------------------

def build_model(n_classes=5):
    """Reconstructs the exact EfficientNet-B3 architecture from training."""
    model = models.efficientnet_b3(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, n_classes)
    return model


def download_model_if_missing():
    """Downloads model weights from Google Drive if not locally present."""
    if not os.path.exists(MODEL_PATH):
        print(f"[INFO] '{MODEL_PATH}' not found. Downloading from Google Drive...")
        url = f"https://drive.google.com/uc?id={GDRIVE_FILE_ID}"
        try:
            gdown.download(url, MODEL_PATH, quiet=False)
            print("[SUCCESS] Model downloaded successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to download model: {e}")


download_model_if_missing()
model = build_model(n_classes=5)

if os.path.exists(MODEL_PATH):
    try:
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
        
        # Check if weight keys match perfectly
        missing, unexpected = model.load_state_dict(state_dict, strict=False)
        if missing or unexpected:
            print(f"[WARNING] Weight mismatch! Missing: {len(missing)}, Unexpected: {len(unexpected)}")
        else:
            print("[SUCCESS] All model weights loaded with 100% exact match.")
            
        model.to(DEVICE)
        model.eval()
    except Exception as e:
        print(f"[ERROR] Loading model failed: {e}")
else:
    print(f"[WARNING] '{MODEL_PATH}' not found in current directory.")


# ---------------------------------------------------------------------------
# Preprocessing Engine (OpenCV-based to match training)
# ---------------------------------------------------------------------------

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Uses OpenCV to match the exact training preprocessing pipeline."""
    # 1. Decode bytes with OpenCV
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image file.")

    # 2. Convert BGR -> RGB (Crucial: matches training APTOSDataset)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # 3. Resize and scale to [0.0, 1.0]
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0

    # 4. ImageNet Normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img = (img - mean) / std

    # 5. Transpose HWC -> CHW tensor
    img_tensor = torch.from_numpy(img.transpose(2, 0, 1)).float().unsqueeze(0).to(DEVICE)

    # Debug print statement
    print(f"[DEBUG Tensor] Min: {img_tensor.min().item():.2f} | Max: {img_tensor.max().item():.2f}")
    return img_tensor


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {
        "status": "online",
        "device": DEVICE,
        "model_exists": os.path.exists(MODEL_PATH),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        contents = await file.read()
        tensor = preprocess_image(contents)

        model.eval()
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

        pred_class = int(np.argmax(probs))
        confidence = float(probs[pred_class])

        print(f"[DEBUG Prediction] Logits: {logits.cpu().numpy()[0]}")
        print(f"[DEBUG Prediction] Probabilities: {probs}")

        return {
            "class_idx": pred_class,
            "class_name": DR_CLASS_NAMES[pred_class],
            "referable_dr": bool(pred_class >= 2),
            "confidence": round(confidence * 100, 2),
            "probabilities": {
                DR_CLASS_NAMES[i]: round(float(p) * 100, 2)
                for i, p in enumerate(probs)
            },
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
