import pandas as pd

df = pd.read_csv("dataset/student_data_raw.csv")

print("Dataset loaded:", df.shape)
# Handle missing values
df["Teacher_Quality"] = df["Teacher_Quality"].fillna(
    df["Teacher_Quality"].mode()[0]
)
df["Parental_Education_Level"] = df["Parental_Education_Level"].fillna(
    df["Parental_Education_Level"].mode()[0]
)
df["Distance_from_Home"] = df["Distance_from_Home"].fillna(
    df["Distance_from_Home"].mode()[0]
)

# Convert categorical columns to numbers
df = pd.get_dummies(df, drop_first=True)

# Separate features and target
X = df.drop("Exam_Score", axis=1)
y = df["Exam_Score"]

print("Features:", X.shape)
print("Target:", y.shape)
from sklearn.model_selection import train_test_split

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)
from sklearn.ensemble import RandomForestRegressor

# Create the model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train the model
model.fit(X_train, y_train)

print("Random Forest model trained successfully!")
# Make predictions on test data
y_pred = model.predict(X_test)

print("\nFirst 10 predictions:")
print(y_pred[:10])
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\nModel Performance:")
print("MAE:", round(mae, 2))
print("MSE:", round(mse, 2))
print("R2 Score:", round(r2, 2))
import joblib

# Save the trained model
joblib.dump(model, "models/student_performance_model.pkl")

print("\nModel saved successfully!")
# Save feature names used by the model
joblib.dump(X.columns.tolist(), "models/feature_names.pkl")

print("Feature names saved successfully!")