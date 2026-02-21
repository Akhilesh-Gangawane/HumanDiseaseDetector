import pandas as pd
import numpy as np
import os

try:
    print("Testing with 1000 rows...")
    df = pd.read_csv("Final_dataset.csv", nrows=1000)
    symptoms = [col for col in df.select_dtypes(include=[np.number]).columns]
    X = df[symptoms].fillna(0)
    co_occurrence = X.T @ X
    print(f"Success! Matrix shape: {co_occurrence.shape}")
    co_occurrence.to_csv("test_co_occurrence.csv")
    print("Saved test_co_occurrence.csv")
except Exception as e:
    with open("error_trace.txt", "w") as f:
        import traceback
        f.write(str(e) + "\n")
        f.write(traceback.format_exc())
    print(f"Failed: {e}")
