import joblib
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
import os

try:
    print("Loading model and features...")
    pipeline = joblib.load("best_pipeline.joblib")
    feature_names = joblib.load("feature_names.joblib")
    
    xgb_model = pipeline.named_steps['model']
    
    # Create dummy data matching 488 features
    X_sample_arr = np.zeros((100, 488))
    X_sample = pd.DataFrame(X_sample_arr, columns=feature_names)
    
    print("Computing SHAP values...")
    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer.shap_values(X_sample)
    
    print(f"SHAP type: {type(shap_values)}")
    
    # Apply the fix logic
    if isinstance(shap_values, list):
        shap_values_to_plot = shap_values
    elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
        print(f"Converting 3D SHAP values {shap_values.shape} to list...")
        # (samples, features, classes) -> list of (samples, features)
        shap_values_to_plot = [shap_values[:, :, i] for i in range(shap_values.shape[2])]
    else:
        shap_values_to_plot = shap_values
        
    print("Generating SHAP summary plot...")
    plt.figure()
    # Use max_display=10 to keep it fast
    shap.summary_plot(shap_values_to_plot, X_sample, show=False, max_display=10)
    
    os.makedirs("eda_outputs", exist_ok=True)
    plt.savefig("eda_outputs/test_shap_fix.png")
    plt.close()
    print("Success! SHAP plot saved to eda_outputs/test_shap_fix.png")

except Exception as e:
    import traceback
    traceback.print_exc()
