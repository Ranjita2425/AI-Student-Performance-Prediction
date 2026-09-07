import pandas as pd

df = pd.read_csv("dataset/StudentPerformanceFactors.csv")

print("Dataset Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 Rows:")
print(df.head())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())

# Save a copy for preprocessing
df.to_csv("dataset/student_data_raw.csv", index=False)

print("\nRaw dataset copy saved successfully!")