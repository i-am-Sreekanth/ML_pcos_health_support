from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import numpy as np
from io import BytesIO
from PIL import Image
from keras.models import load_model
from keras.applications.mobilenet import preprocess_input
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module='sklearn')

# --------------------------
# Model Loading
# --------------------------

LR_MODEL_PATH = os.path.join(os.getcwd(), "model.sav")
SC_PATH = os.path.join(os.getcwd(), "sc.sav")

loaded_model = pickle.load(open(LR_MODEL_PATH, "rb"))
sc = pickle.load(open(SC_PATH, "rb"))

DL_MODEL_PATH = os.path.join(os.getcwd(), "bestmodel.h5")
dl_model = load_model(DL_MODEL_PATH)

# --------------------------
# FastAPI Setup
# --------------------------

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Input Schema (11 factors)
# --------------------------

class Parameters(BaseModel):
    age: float
    marriageStatus: float
    weight: float
    bmi: float
    regularCycle: float
    cycleLength: float
    skinDarkening: float
    hairGrowth: float
    weightGain: float
    pimples: float
    fastFood: float

# --------------------------
# Health Check
# --------------------------

@app.get("/")
async def health_check():
    return {"status": "Backend running"}

# --------------------------
# Clinical Metric Calculations
# --------------------------

def compute_hormonal_load(data):

    score = 0

    if data.skinDarkening == 1:
        score += 1

    if data.hairGrowth == 1:
        score += 1

    if data.pimples >= 2:
        score += 1

    if data.regularCycle == 0:
        score += 1

    if data.cycleLength > 35:
        score += 1

    return round((score / 5) * 100, 2)


def compute_metabolic_load(data):

    score = 0

    if data.bmi > 25:
        score += 1

    if data.weightGain > 5:
        score += 1

    if data.fastFood >= 2:
        score += 1

    if data.skinDarkening == 1:
        score += 1

    return round((score / 4) * 100, 2)


def compute_evidence_density(data):

    indicators = 0

    if data.regularCycle == 0:
        indicators += 1

    if data.cycleLength > 35:
        indicators += 1

    if data.bmi > 25:
        indicators += 1

    if data.skinDarkening == 1:
        indicators += 1

    if data.hairGrowth == 1:
        indicators += 1

    if data.pimples >= 2:
        indicators += 1

    if data.weightGain > 5:
        indicators += 1

    if data.fastFood >= 2:
        indicators += 1

    if indicators < 5:
        return "Level 1"
    else:
        return "Level 2"


def compute_contributors(data):

    factors = []

    if data.skinDarkening == 1:
        factors.append({"label": "Insulin Resistance", "impact": "High"})

    if data.hairGrowth == 1:
        factors.append({"label": "Hyperandrogenism", "impact": "High"})

    if data.regularCycle == 0:
        factors.append({"label": "Ovulatory Dysfunction", "impact": "High"})

    if data.bmi > 25:
        factors.append({"label": "Metabolic Stress", "impact": "Moderate"})

    if data.pimples >= 2:
        factors.append({"label": "Androgen Activity", "impact": "Moderate"})

    return factors


def compute_risk_level(score):

    if score <= 25:
        return "Low Risk"
    elif score <= 50:
        return "Moderate Risk"
    elif score <= 75:
        return "High Risk"
    else:
        return "Very High Risk"

# --------------------------
# Logistic Regression Endpoint
# --------------------------

@app.post("/predict")
async def get_prediction(patient: Parameters):

    features = [
        patient.skinDarkening,
        patient.hairGrowth,
        patient.weightGain,
        patient.fastFood,
        patient.pimples,
        patient.regularCycle,
        patient.weight,
        patient.bmi,
        patient.cycleLength,
        patient.age,
        patient.marriageStatus
    ]

    # Expand to 14 features expected by the scaler
    features_full = list(features)

    # Fill missing features with scaler mean
    for i in range(len(features), sc.n_features_in_):
        features_full.append(sc.mean_[i])

    features_scaled = sc.transform([features_full])

    prob = loaded_model.predict_proba(features_scaled)[0][1]

    confidence = round(prob * 100, 2)

    hormonal_load = compute_hormonal_load(patient)
    metabolic_load = compute_metabolic_load(patient)
    evidence_density = compute_evidence_density(patient)
    contributors = compute_contributors(patient)

    risk_level = compute_risk_level(confidence)

    return {
        "confidenceScore": confidence,
        "riskLevel": risk_level,
        "hormonalLoad": hormonal_load,
        "metabolicLoad": metabolic_load,
        "clinicalEvidenceDensity": evidence_density,
        "contributors": contributors
    }

# --------------------------
# Ultrasound Image Model
# --------------------------

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    contents = await file.read()

    try:
        img = Image.open(BytesIO(contents)).convert("RGB")
    except:
        raise HTTPException(status_code=400, detail="Invalid image file")

    img = img.resize((224, 224))

    img_array = np.array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    pred_prob = dl_model.predict(img_array)[0][0]

    if pred_prob < 0.5:
        label = "PCOS Detected"
        confidence = 1 - float(pred_prob)
    else:
        label = "No PCOS Detected"
        confidence = float(pred_prob)

    return {
        "prediction": label,
        "confidence": confidence
    }