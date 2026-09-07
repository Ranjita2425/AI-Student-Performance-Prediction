import pandas as pd

df = pd.read_csv("dataset/student_data_raw.csv")

print("Dataset loaded successfully!")
print("Shape:", df.shape)
# Handle missing values
df["Teacher_Quality"] = df["Teacher_Quality"].fillna(df["Teacher_Quality"].mode()[0])
df["Parental_Education_Level"] = df["Parental_Education_Level"].fillna(
    df["Parental_Education_Level"].mode()[0]
)
df["Distance_from_Home"] = df["Distance_from_Home"].fillna(
    df["Distance_from_Home"].mode()[0]
)

print("\nMissing values after cleaning:")
print(df.isnull().sum())
print("\nCleaned dataset shape:", df.shape)
# Convert categorical columns into numbers
df = pd.get_dummies(df, drop_first=True)

print("\nAfter encoding:")
print("Shape:", df.shape)
print("\nColumn names after encoding:")
print(df.columns.tolist())
# Separate features and target
X = df.drop("Exam_Score", axis=1)
y = df["Exam_Score"]

print("\nFeatures shape:", X.shape)
print("Target shape:", y.shape)
from sklearn.model_selection import train_test_split

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("\nTraining data:", X_train.shape)
print("Testing data:", X_test.shape)