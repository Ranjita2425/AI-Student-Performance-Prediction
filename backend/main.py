from fastapi import FastAPI
import pandas as pd

app = FastAPI()

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

    return {
        "current_predicted_score": round(float(prediction), 2),
        "message": "What-If analysis completed successfully"
    }