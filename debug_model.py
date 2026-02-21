import joblib
import os
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import numpy as np

base_dir = "."
try:
    pipeline = joblib.load(os.path.join(base_dir, "best_pipeline.joblib"))
    print("Pipeline loaded.")
    
    # Inspect preprocessor
    preprocessor = pipeline.named_steps['preprocessor']
    print(f"Preprocessor: {type(preprocessor)}")
    
    # Preprocessor is ColumnTransformer
    # numeric_transformer is the first transformer
    num_transformer = preprocessor.transformers_[0][1]
    print(f"Num Transformer: {type(num_transformer)}")
    
    # It's a Pipeline: [('imputer', SimpleImputer(...))]
    imputer = num_transformer.named_steps['imputer']
    print(f"Imputer: {type(imputer)}")
    print(f"Imputer strategy: {imputer.strategy}")
    print(f"Imputer fill_value: {imputer.fill_value} (type: {type(imputer.fill_value)})")
    
    if hasattr(imputer, 'statistics_'):
        print(f"Imputer statistics_ dtype: {imputer.statistics_.dtype}")

except Exception as e:
    print(f"Error: {e}")
