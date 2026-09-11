import io
import cv2
import numpy as np
import torch
import torch.nn as nn

from fastapi import FastAPI, File, HTTPException, UploadFile
from torchvision import models


app = FastAPI(
    title="DR Severity Grading API",
    description="Explainable AI for Diabetic Retinopathy Screening",
)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = "dr_grading_model.pt"

IMG_SIZE = 300

DR_CLASS_NAMES = [
    "No DR",
    "Mild DR",
    "Moderate DR",
    "Severe DR",
    "Proliferative DR",
]


# ---------------------------------------------------------
# Model architecture
# ---------------------------------------------------------

def build_model(n_classes=5):

    model = models.efficientnet_b3(weights=None)

    in_features = model.classifier[1].in_features

    model.classifier[1] = nn.Linear(
        in_features,
        n_classes
    )

    return model


# ---------------------------------------------------------
# Load model
# ---------------------------------------------------------

model = build_model(n_classes=5)

try:

    state_dict = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    model.load_state_dict(state_dict)

    model.to(DEVICE)

    model.eval()

    print(
        f"Loaded model successfully onto {DEVICE}"
    )

except Exception as e:

    raise RuntimeError(
        f"Failed to load model '{MODEL_PATH}': {e}"
    )


# ---------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------

def preprocess_image(image_bytes: bytes) -> torch.Tensor:

    np_arr = np.frombuffer(
        image_bytes,
        np.uint8
    )

    img = cv2.imdecode(
        np_arr,
        cv2.IMREAD_COLOR
    )

    if img is None:

        raise ValueError(
            "Invalid image file"
        )

    img = cv2.cvtColor(
        img,
        cv2.COLOR_BGR2RGB
    )

    img = cv2.resize(
        img,
        (IMG_SIZE, IMG_SIZE)
    )

    img = img.astype(
        np.float32
    ) / 255.0

    # ImageNet normalization
    mean = np.array([
        0.485,
        0.456,
        0.406
    ])

    std = np.array([
        0.229,
        0.224,
        0.225
    ])

    img = (img - mean) / std

    # HWC -> CHW
    img_tensor = torch.from_numpy(
        img.transpose(2, 0, 1)
    ).float()

    # Add batch dimension
    img_tensor = img_tensor.unsqueeze(0)

    # Move to CPU/GPU
    img_tensor = img_tensor.to(DEVICE)

    return img_tensor


# ---------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    if (
        file.content_type
        and not file.content_type.startswith("image/")
    ):

        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image."
        )

    try:

        contents = await file.read()

        tensor = preprocess_image(
            contents
        )

        with torch.no_grad():

            logits = model(tensor)

            probs = torch.softmax(
                logits,
                dim=1
            ).cpu().numpy()[0]

        pred_class = int(
            np.argmax(probs)
        )

        confidence = float(
            probs[pred_class]
        )

        return {

            "class_idx": pred_class,

            "class_name":
                DR_CLASS_NAMES[pred_class],

            "referable_dr":
                pred_class >= 2,

            "confidence":
                round(
                    confidence * 100,
                    2
                ),

            "probabilities": {

                DR_CLASS_NAMES[i]:
                    round(
                        float(p) * 100,
                        2
                    )

                for i, p in enumerate(probs)
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Inference error: {str(e)}"
        )


# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------

@app.get("/")
def health_check():

    return {
        "status": "online",
        "device": DEVICE
    }