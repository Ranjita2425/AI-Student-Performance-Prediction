import shap
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def home():
    return {"message": "AI Student Performance Prediction API is running"}

import joblib

model = joblib.load("models/student_performance_model.pkl")
feature_names = joblib.load("models/feature_names.pkl")

print("ML model loaded successfully!")

from pydantic import BaseModel

class StudentData(BaseModel):
    Hours_Studied: int
    Attendance: int
    Sleep_Hours: int
    Previous_Scores: int
    Tutoring_Sessions: int
    Physical_Activity: int

@app.post("/predict")
def predict(data: StudentData):
    input_data = {
        "Hours_Studied": data.Hours_Studied,
        "Attendance": data.Attendance,
        "Sleep_Hours": data.Sleep_Hours,
        "Previous_Scores": data.Previous_Scores,
        "Tutoring_Sessions": data.Tutoring_Sessions,
        "Physical_Activity": data.Physical_Activity
    }

    input_df = pd.DataFrame([input_data])

    for feature in feature_names:
        if feature not in input_df.columns:
            input_df[feature] = 0

    input_df = input_df[feature_names]

    prediction = model.predict(input_df)[0]

    if prediction < 60:
        risk_level = "High"
    elif prediction < 70:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    recommendations = []

    if data.Attendance < 75:
        recommendations.append("Improve attendance")

    if data.Hours_Studied < 20:
        recommendations.append("Increase daily study hours")

    if data.Tutoring_Sessions < 2:
        recommendations.append("Consider additional tutoring sessions")

    if data.Sleep_Hours < 7:
        recommendations.append("Maintain at least 7 hours of sleep")

    if not recommendations:
        recommendations.append("Keep up the current study habits")

    return {
        "predicted_exam_score": round(float(prediction), 2),
        "risk_level": risk_level,
        "recommendations": recommendations
}
@app.post("/what-if")
def what_if(data: StudentData):

    # Current student data
    current_data = {
        "Hours_Studied": data.Hours_Studied,
        "Attendance": data.Attendance,
        "Sleep_Hours": data.Sleep_Hours,
        "Previous_Scores": data.Previous_Scores,
        "Tutoring_Sessions": data.Tutoring_Sessions,
        "Physical_Activity": data.Physical_Activity
    }

    current_df = pd.DataFrame([current_data])

    for feature in feature_names:
        if feature not in current_df.columns:
            current_df[feature] = 0

    current_df = current_df[feature_names]

    current_prediction = model.predict(current_df)[0]

    # Improved scenario
    improved_data = current_data.copy()

    improved_data["Hours_Studied"] += 5
    improved_data["Attendance"] = min(
        improved_data["Attendance"] + 5, 100
    )
    improved_data["Tutoring_Sessions"] += 1

    improved_df = pd.DataFrame([improved_data])

    for feature in feature_names:
        if feature not in improved_df.columns:
            improved_df[feature] = 0

    improved_df = improved_df[feature_names]

    improved_prediction = model.predict(improved_df)[0]

    improvement = improved_prediction - current_prediction

    return {
        "current_score": round(float(current_prediction), 2),
        "improved_score": round(float(improved_prediction), 2),
        "expected_improvement": round(float(improvement), 2),
        "changes": [
            "Increase study hours by 5",
            "Improve attendance by 5%",
            "Add 1 tutoring session"
        ]
    }
@app.post("/explain")
def explain_prediction(data: StudentData):

    input_data = {
        "Hours_Studied": data.Hours_Studied,
        "Attendance": data.Attendance,
        "Sleep_Hours": data.Sleep_Hours,
        "Previous_Scores": data.Previous_Scores,
        "Tutoring_Sessions": data.Tutoring_Sessions,
        "Physical_Activity": data.Physical_Activity
    }

    input_df = pd.DataFrame([input_data])

    for feature in feature_names:
        if feature not in input_df.columns:
            input_df[feature] = 0

    input_df = input_df[feature_names]

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_df)

    explanation = []

    for i, feature in enumerate(feature_names):
        impact = float(shap_values[0][i])

        if impact != 0:
            explanation.append({
                "feature": feature,
                "impact": round(impact, 3)
            })

    explanation.sort(key=lambda x: abs(x["impact"]), reverse=True)

    return {
        "prediction": round(float(model.predict(input_df)[0]), 2),
        "explanation": explanation[:5]
    }