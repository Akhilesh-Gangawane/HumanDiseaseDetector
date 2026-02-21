# Production-Ready Disease Prediction System

A high-performance multiclass classification system designed to predict final disease outcomes from binary symptom features. The system utilizes a multi-model ensemble (XGBoost, LightGBM, Random Forest) with GPU acceleration and serves predictions via a FastAPI service.

## 🚀 Features
- **Multi-Model Ensemble**: Combines the strengths of XGBoost, LightGBM, and Random Forest for robust generalization.
- **GPU Acceleration**: Optimized for NVIDIA RTX 4050 using `tree_method='hist'` and CUDA support.
- **Production-Ready API**: FastAPI based inference service with input validation and health checks.
- **Explainable AI (XAI)**: Feature importance analysis to identify top predictive symptoms.
- **Robust Preprocessing**: End-to-end `sklearn` pipeline handling imputation and feature engineering.

## 📂 Project Structure
```text
├── Final_dataset.csv       # Training dataset (260k+ rows)
├── app.py                   # FastAPI Application
├── train_optuna.py          # Main training script (with subsampling & GPU support)
├── pipeline.py              # Modular data processing and EDA utilities
├── test_app.py              # Sample client for API testing
├── requirements.txt         # Project dependencies
├── walkthrough.md           # Detailed results and performance analysis
├── models/                  # (Generated) Directory for model checkpoints
└── eda_outputs/             # (Generated) Visualizations and SHAP/Importance plots
```

## 🛠️ Installation

1. **Clone the repository** and navigate to the project root.
2. **Set up a virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
   *Note: For GPU support, ensures you have the correct PyTorch CUDA build installed.*

## 📈 Usage

### 1. Training the Model
To re-train the model (currently set to a stable 20k row subsample setup):
```bash
python train_optuna.py
```
This generates `best_pipeline.joblib`, `label_encoder.joblib`, and `feature_names.joblib`.

### 2. Running the API
Start the production server:
```bash
python -m uvicorn app:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### 3. Testing Inference
With the server running, execute:
```bash
python test_app.py
```

## 📊 Performance Summary
- **Classification Accuracy**: ~80%
- **Target Count**: 669 unique diseases
- **Input Features**: 500+ binary symptom indicators

## ⚖️ License
Internal Project - Senior Machine Learning Engineering Assessment.
