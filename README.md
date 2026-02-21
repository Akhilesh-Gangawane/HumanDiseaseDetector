# Production-Ready Disease Prediction System

A high-performance multiclass classification system designed to predict final disease outcomes from binary symptom features. The system utilizes a multi-model ensemble (XGBoost, LightGBM, Random Forest) with GPU acceleration and serves predictions via a FastAPI service.

## 🚀 Features
- **Multi-Model Ensemble**: Combines the strengths of XGBoost, LightGBM, and Random Forest for robust generalization.
- **GPU Acceleration**: Optimized for NVIDIA GPU using `tree_method='hist'` and CUDA support.
- **Graph-Based Feature Engineering**: Learns symptom relationships via co-occurrence networks and Node2Vec embeddings.
- **Production-Ready API**: FastAPI based inference service with input validation and health checks.
- **Explainable AI (XAI)**: Feature importance analysis and SHAP values to identify top predictive symptoms.
- **Robust Preprocessing**: End-to-end `sklearn` pipeline handling imputation and feature engineering.

## 📂 Project Structure
```text
├── Final_dataset.csv       # Training dataset (260k+ rows)
├── app.py                   # FastAPI Application
├── train_optuna.py          # Main training script (with subsampling & GPU support)
├── symptom_relationships.py # Co-occurrence analysis and network visualization
├── graph_features.py        # Node2Vec embedding generation and pipeline
├── pipeline.py              # Modular data processing and EDA utilities
├── test_app.py              # Sample client for API testing
├── requirements.txt         # Project dependencies
├── walkthrough.md           # Detailed results and performance analysis
├── best_pipeline.joblib     # (Generated) Trained ensemble pipeline
└── eda_outputs/             # (Generated) Visualizations, Network Plots, and SHAP
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
   *Note: Ensure you have the correct PyTorch CUDA build for GPU support.*

## 📈 Usage

### 1. Training & Analysis
- **Graph Analysis**: Generate symptom co-occurrence matrix and network diagrams:
  ```bash
  python symptom_relationships.py
  ```
- **Feature Engineering**: Generate Node2Vec symptom embeddings:
  ```bash
  python graph_features.py
  ```
- **Model Training**: Re-train the ensemble model:
  ```bash
  python train_optuna.py
  ```

### 2. Running the API
Start the production server:
```bash
python app.py
```
*(Uses Uvicorn to host the API on port 8000).*

### 3. Testing Inference
With the server running, execute:
```bash
python test_app.py
```

## 📊 Performance Summary
- **Classification Accuracy**: ~80%
- **Target Count**: 669 unique diseases
- **Input Features**: 500+ binary symptom indicators + 32D Node2Vec Embeddings (Extracted via pipeline).

## ⚖️ License
Internal Project - Senior Machine Learning Engineering Assessment.
