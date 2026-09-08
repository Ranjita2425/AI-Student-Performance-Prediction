import joblib
import pandas as pd
import shap

# Load trained model
model = joblib.load("models/student_performance_model.pkl")

# Load feature names
feature_names = joblib.load("models/feature_names.pkl")

# Create SHAP explainer
explainer = shap.TreeExplainer(model)

print("SHAP Explainable AI module loaded successfully!")
print("Number of model features:", len(feature_names))