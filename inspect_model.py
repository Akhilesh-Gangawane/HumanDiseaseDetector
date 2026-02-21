import joblib
import pandas as pd
import numpy as np

try:
    pipeline = joblib.load("best_pipeline.joblib")
    feature_names = joblib.load("feature_names.joblib")
    
    model = pipeline.named_steps['model']
    print(f"Num features in model (n_features_in_): {model.n_features_in_}")
    
    # Inspect the underlying booster
    booster = model.get_booster()
    print(f"Booster num_features: {booster.num_features()}")
    
    # Try to get shap values for a dummy sample
    import shap
    explainer = shap.TreeExplainer(model)
    X_dummy = np.zeros((10, 488)) # Use 10 samples
    shap_vals = explainer.shap_values(X_dummy)
    
    print(f"SHAP output type: {type(shap_vals)}")
    
    if isinstance(shap_vals, list):
        print(f"SHAP list length: {len(shap_vals)} (expected 669 classes)")
        print(f"SHAP[0] shape: {shap_vals[0].shape} (expected (10, 488))")
    elif isinstance(shap_vals, np.ndarray):
        print(f"SHAP ndarray shape: {shap_vals.shape}")
        # If (10, 488, 669), then it's (samples, features, classes)
        # If (669, 10, 488), then it's (classes, samples, features)
    
except Exception as e:
    import traceback
    traceback.print_exc()
