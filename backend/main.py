import os
import joblib
import shap
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI-Based Student Performance Prediction System",
    description=(
        "AI system for student performance prediction, "
        "risk analysis, personalized recommendations, "
        "What-If analysis and Explainable AI."
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# MODEL PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "student_performance_model.pkl"
)

FEATURE_PATH = os.path.join(
    BASE_DIR,
    "models",
    "feature_names.pkl"
)


# ============================================================
# LOAD ML MODEL
# ============================================================

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURE_PATH)

print("ML model loaded successfully!")
print("Number of model features:", len(feature_names))


# ============================================================
# DATA MODEL
# ============================================================

class StudentData(BaseModel):

    Hours_Studied: int = Field(
        ...,
        ge=0,
        le=50,
        description="Number of study hours"
    )

    Attendance: int = Field(
        ...,
        ge=0,
        le=100,
        description="Attendance percentage"
    )

    Sleep_Hours: int = Field(
        ...,
        ge=0,
        le=24,
        description="Daily sleep hours"
    )

    Previous_Scores: int = Field(
        ...,
        ge=0,
        le=100,
        description="Previous academic score"
    )

    Tutoring_Sessions: int = Field(
        ...,
        ge=0,
        le=20,
        description="Number of tutoring sessions"
    )

    Physical_Activity: int = Field(
        ...,
        ge=0,
        le=24,
        description="Physical activity hours"
    )


class WhatIfRequest(BaseModel):

    # Current student information

    Hours_Studied: int = Field(..., ge=0, le=50)
    Attendance: int = Field(..., ge=0, le=100)
    Sleep_Hours: int = Field(..., ge=0, le=24)
    Previous_Scores: int = Field(..., ge=0, le=100)
    Tutoring_Sessions: int = Field(..., ge=0, le=20)
    Physical_Activity: int = Field(..., ge=0, le=24)

    # Desired scenario

    WhatIf_Hours_Studied: int = Field(..., ge=0, le=50)
    WhatIf_Attendance: int = Field(..., ge=0, le=100)
    WhatIf_Tutoring_Sessions: int = Field(..., ge=0, le=20)


# ============================================================
# HOME ENDPOINT
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Student Performance Prediction API is running",
        "status": "online"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "model_loaded": True,
        "features": len(feature_names)
    }


# ============================================================
# HELPER FUNCTION
# ============================================================

def prepare_input(data):

    input_data = {
        "Hours_Studied": data.Hours_Studied,
        "Attendance": data.Attendance,
        "Sleep_Hours": data.Sleep_Hours,
        "Previous_Scores": data.Previous_Scores,
        "Tutoring_Sessions": data.Tutoring_Sessions,
        "Physical_Activity": data.Physical_Activity
    }

    input_df = pd.DataFrame([input_data])

    # Add model features that are not supplied by the UI.
    #
    # The current trained model contains encoded categorical
    # variables. Since the current frontend collects only the
    # six numerical factors, missing encoded features are set
    # to zero.

    for feature in feature_names:

        if feature not in input_df.columns:
            input_df[feature] = 0

    # Keep exactly the same feature order used during training.

    input_df = input_df[feature_names]

    return input_df


# ============================================================
# RISK CLASSIFICATION
# ============================================================

def calculate_risk(prediction):

    if prediction < 60:
        return "High"

    elif prediction < 70:
        return "Medium"

    else:
        return "Low"


# ============================================================
# PERSONALIZED RECOMMENDATIONS
# ============================================================

def generate_recommendations(data):

    recommendations = []

    if data.Attendance < 75:

        recommendations.append(
            "Improve attendance to at least 75%"
        )

    elif data.Attendance < 85:

        recommendations.append(
            "Try to improve attendance further"
        )


    if data.Hours_Studied < 20:

        recommendations.append(
            "Increase daily study hours"
        )


    if data.Tutoring_Sessions < 2:

        recommendations.append(
            "Consider additional tutoring sessions"
        )


    if data.Sleep_Hours < 7:

        recommendations.append(
            "Maintain at least 7 hours of sleep"
        )


    if data.Previous_Scores < 65:

        recommendations.append(
            "Revise weak topics from previous assessments"
        )


    if data.Physical_Activity < 2:

        recommendations.append(
            "Include regular physical activity"
        )


    if not recommendations:

        recommendations.append(
            "Keep up the current study habits"
        )


    return recommendations


# ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
def predict(data: StudentData):

    input_df = prepare_input(data)

    prediction = model.predict(input_df)[0]

    risk_level = calculate_risk(prediction)

    recommendations = generate_recommendations(data)

    return {

        "predicted_exam_score": round(
            float(prediction),
            2
        ),

        "risk_level": risk_level,

        "recommendations": recommendations
    }


# ============================================================
# WHAT-IF ANALYSIS API
# ============================================================

@app.post("/what-if")
def what_if(data: WhatIfRequest):

    # --------------------------------------------------------
    # CURRENT SCENARIO
    # --------------------------------------------------------

    current_student = StudentData(

        Hours_Studied=data.Hours_Studied,

        Attendance=data.Attendance,

        Sleep_Hours=data.Sleep_Hours,

        Previous_Scores=data.Previous_Scores,

        Tutoring_Sessions=data.Tutoring_Sessions,

        Physical_Activity=data.Physical_Activity
    )

    current_df = prepare_input(current_student)

    current_prediction = model.predict(
        current_df
    )[0]


    # --------------------------------------------------------
    # WHAT-IF SCENARIO
    # --------------------------------------------------------

    improved_student = StudentData(

        Hours_Studied=data.WhatIf_Hours_Studied,

        Attendance=data.WhatIf_Attendance,

        Sleep_Hours=data.Sleep_Hours,

        Previous_Scores=data.Previous_Scores,

        Tutoring_Sessions=data.WhatIf_Tutoring_Sessions,

        Physical_Activity=data.Physical_Activity
    )

    improved_df = prepare_input(
        improved_student
    )

    improved_prediction = model.predict(
        improved_df
    )[0]


    # --------------------------------------------------------
    # IMPROVEMENT
    # --------------------------------------------------------

    improvement = (
        improved_prediction -
        current_prediction
    )


    changes = []

    if data.WhatIf_Hours_Studied != data.Hours_Studied:

        difference = (
            data.WhatIf_Hours_Studied -
            data.Hours_Studied
        )

        if difference > 0:

            changes.append(
                f"Increase study hours by {difference}"
            )

        else:

            changes.append(
                f"Decrease study hours by {abs(difference)}"
            )


    if data.WhatIf_Attendance != data.Attendance:

        difference = (
            data.WhatIf_Attendance -
            data.Attendance
        )

        if difference > 0:

            changes.append(
                f"Improve attendance by {difference}%"
            )

        else:

            changes.append(
                f"Attendance decreases by {abs(difference)}%"
            )


    if (
        data.WhatIf_Tutoring_Sessions
        != data.Tutoring_Sessions
    ):

        difference = (
            data.WhatIf_Tutoring_Sessions -
            data.Tutoring_Sessions
        )

        if difference > 0:

            changes.append(
                f"Add {difference} tutoring session(s)"
            )

        else:

            changes.append(
                f"Reduce tutoring sessions by {abs(difference)}"
            )


    if not changes:

        changes.append(
            "No changes were made"
        )


    return {

        "current_score": round(
            float(current_prediction),
            2
        ),

        "improved_score": round(
            float(improved_prediction),
            2
        ),

        "expected_improvement": round(
            float(improvement),
            2
        ),

        "current_risk": calculate_risk(
            current_prediction
        ),

        "improved_risk": calculate_risk(
            improved_prediction
        ),

        "changes": changes
    }


# ============================================================
# EXPLAINABLE AI / SHAP
# ============================================================

@app.post("/explain")
def explain_prediction(data: StudentData):

    input_df = prepare_input(data)

    prediction = model.predict(
        input_df
    )[0]


    # Create SHAP explainer

    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(
        input_df
    )


    explanation = []


    # SHAP values for one prediction

    for i, feature in enumerate(feature_names):

        impact = float(
            shap_values[0][i]
        )

        if impact != 0:

            explanation.append({

                "feature": feature,

                "impact": round(
                    impact,
                    3
                )
            })


    # Sort by absolute influence

    explanation.sort(
        key=lambda x: abs(x["impact"]),
        reverse=True
    )


    return {

        "prediction": round(
            float(prediction),
            2
        ),

        "explanation": explanation[:5]
    }