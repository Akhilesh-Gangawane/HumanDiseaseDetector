from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, create_model
import joblib
import pandas as pd
import os
from typing import Dict, Any

app = FastAPI(title="Disease Prediction API")

# Global variables for model artifacts
pipeline = None
label_encoder = None
feature_names = None

@app.on_event("startup")
def load_artifacts():
    global pipeline, label_encoder, feature_names
    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        pipeline = joblib.load(os.path.join(base_dir, "best_pipeline.joblib"))
        label_encoder = joblib.load(os.path.join(base_dir, "label_encoder.joblib"))
        feature_names = joblib.load(os.path.join(base_dir, "feature_names.joblib"))
        print("Successfully loaded model artifacts!")
    except Exception as e:
        print(f"Error loading artifacts. Have you run the training script? {e}")

class PredictionRequest(BaseModel):
    # dynamic dictionary of symptom presence, e.g., {"itching": 1, "skin_rash": 0}
    symptoms: Dict[str, int]

@app.post("/predict")
def predict(request: PredictionRequest):
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
        
    symptoms_dict = request.symptoms
    
    # Create input DataFrame with all zeros initially for all expected features
    input_data = {feat: [0.0] for feat in feature_names}
    
    # Update with provided symptoms
    for symptom, value in symptoms_dict.items():
        if symptom in input_data:
            input_data[symptom] = [float(value)]
            
    df_input = pd.DataFrame(input_data).astype(float)
    
    try:
        pred_idx = pipeline.predict(df_input)[0]
        disease = label_encoder.inverse_transform([pred_idx])[0]
        
        # Optional: Probabilities if ensemble supports it
        probs = pipeline.predict_proba(df_input)[0]
        max_prob = float(probs[pred_idx])
        
        return {
            "prediction": str(disease),
            "confidence": max_prob
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": pipeline is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
