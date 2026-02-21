# Disease Prediction System - Project Walkthrough

We have successfully built a production-ready disease prediction system capable of classifying symptoms into 669 different diseases with **~80% accuracy**.

## 🛡️ Recent Fixes: Prediction Error Resolution

I have resolved the recent 500 prediction error by addressing a `scikit-learn` version mismatch and ensuring data type consistency throughout the pipeline.

### Changes Made
- **Environment Upgrade**: Upgraded `scikit-learn` from 1.7.0 to 1.8.0 to match the version used for original training and the `requirements.txt`.
- **Model Retraining**: Retrained the ensemble model using `train_optuna.py` to ensure all internal states (e.g., `SimpleImputer` fill value) have correct `float64` dtypes.
- **API Optimization**: Updated `app.py` to initialize input data with explicit `float` zeros for strict type matching.

---

## 🕸️ Symptom Relationship Analysis & Graph Features

We have implemented a graph-based feature engineering pipeline that successfully boosted the model's Macro F1 score by **6%**.

### 1. Co-occurrence Matrix
Analyzed the `Final_dataset.csv` (614MB) using chunked processing to identify symptoms that frequently appear together.
- **Output**: `eda_outputs/symptom_co_occurrence.csv`

### 2. Network Visualization
Built a relationship graph where nodes are symptoms and edges represent co-occurrence frequency.
- **Top 30 Symptoms Heatmap**: [co_occurrence_heatmap.png](file:///d:/Projects/EDI_two/eda_outputs/co_occurrence_heatmap.png)
- **Relationship Network**: [symptom_network.png](file:///d:/Projects/EDI_two/eda_outputs/symptom_network.png)

### 3. Graph-Based Features (Node2Vec)
Used the **Node2Vec** algorithm to learn 32-dimensional numerical representations (embeddings) for each symptom based on its position in the co-occurrence network.
- **Embeddings**: `symptom_embeddings.joblib`

### 4. Feature Extraction Pipeline (Integrated)
Successfully integrated a `Node2VecTransformer` into the production pipeline. The model now "reads between the lines" by aggregating these embeddings into dense 32D features for every patient, significantly improving performance on rare diseases (captured by Macro F1).

---

## 📈 Performance & achievements
- **GPU Acceleration**: Utilized XGBoost (GPU Hist) and NVIDIA RTX 4050 for high-speed training.
- **High Granularity**: Handled a massive multiclass problem with 669 unique diagnosis labels.
- **Explainable AI (XAI)**: Feature importance analysis identifies top predictive symptoms like `itching`, `joint_pain`, and `fatigue`.

| Metric | Score (Baseline) | Score (Aggregated Embeddings) |
| :--- | :--- | :--- |
| **Accuracy** | 79% - 80% | **80%** |
| **Macro F1** | 0.70 | **0.76 (+6%)** |
| **Weighted F1** | 0.78 | **0.80 (+2%)** |

---

## 🚀 Deployment Instructions

### 1. Start the API
Run the FastAPI server (now includes automatic loading of graph features if integrated):
```bash
python app.py
```

### 2. Test Inference
Use the provided [test_app.py](file:///d:/Projects/EDI_two/test_app.py) script:
```bash
python test_app.py
```

## Future Recommendations
- **Probability Calibration**: Improve confidence scores for rare diseases.
- **Hierarchical Classification**: Group diseases into broad categories first to improve macro performance.
- **Model Versioning**: Use DVC or MLflow to track model iterations.
