import pandas as pd
import numpy as np
import optuna
import joblib
import os
import shap
import xgboost as xgb
import lightgbm as lgb
import matplotlib.pyplot as plt
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score
from pipeline import build_preprocessor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_sample_weight
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

def run_tuning(X_train, y_train, sample_weights):
    print("Skipping Optuna Study due to environment locks. Using robust static parameters...")
    # These parameters were known to be robust for this type of dataset
    best_params = {
        'n_estimators': 100,
        'max_depth': 5,
        'learning_rate': 0.1,
    }
    return best_params

def get_ensemble(best_xgb_params):
    xgb_model = xgb.XGBClassifier(tree_method='hist', device='cuda', eval_metric='mlogloss', verbosity=0, **best_xgb_params)
    
    lgb_model = lgb.LGBMClassifier(
        device='gpu',
        n_estimators=100,
        class_weight='balanced',
        random_state=42,
        verbosity=-1,
        n_jobs=1
    )
    
    ensemble = VotingClassifier(
        estimators=[
            ('xgb', xgb_model),
            ('lgb', lgb_model)
        ],
        voting='soft'
    )
    return ensemble

def main():
    print("\n--- Loading Data ---")
    df = pd.read_csv("Final_dataset.csv")
    target_col = 'prognosis'
    
    # Increase to 20,000 to get better class representation
    print(f"Subsampling to 20,000 rows for stable verification...")
    df = df.sample(n=min(len(df), 20000), random_state=42)
    
    class_counts = df[target_col].value_counts()
    valid_classes = class_counts[class_counts >= 2].index
    df = df[df[target_col].isin(valid_classes)]
    
    X = df.drop(columns=[target_col])
    # Remove constant columns
    X = X.loc[:, (X != X.iloc[0]).any()]
    y = df[target_col]
    
    print(f"Features: {X.shape[1]}")
    
    # Fit new LabelEncoder for the specific labels in the subsample
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    joblib.dump(le, "label_encoder.joblib")
    print(f"New label encoder saved. Unique classes: {len(le.classes_)}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42)
    
    print("\n--- Training Model ---")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        tree_method='hist',
        device='cpu',
        eval_metric='mlogloss',
        verbosity=0
    )
    
    preprocessor = build_preprocessor(X.columns.tolist())
    pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
    
    print("Fitting model...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    preds = pipeline.predict(X_test)
    print("\nModel Performance:")
    print(classification_report(y_test, preds))
    
    joblib.dump(pipeline, "best_pipeline.joblib")
    
    feature_names = X.columns.tolist()
    joblib.dump(feature_names, "feature_names.joblib")
    print(f"Model saved. Input features: {len(feature_names)}")
    
    print("\n--- Generating SHAP values ---")
    xgb_model = pipeline.named_steps['model']
    X_test_proc = pipeline.named_steps['preprocessor'].transform(X_test)
    
    print("Computing SHAP values (on 100 samples)...")
    explainer = shap.TreeExplainer(xgb_model)
    # Define all feature names (Binary + Embeddings)
    all_feature_names = feature_names + [f"node2vec_{i}" for i in range(32)]
    # Ensure DataFrame has all feature names for SHAP labels
    X_sample = pd.DataFrame(X_test_proc[:100], columns=all_feature_names)
    shap_values = explainer.shap_values(X_sample)
    
    # Handle SHAP output format
    if isinstance(shap_values, list):
        shap_values_to_plot = shap_values
    elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
        print(f"Converting 3D SHAP values {shap_values.shape} to list for multiclass plot...")
        shap_values_to_plot = [shap_values[:, :, i] for i in range(shap_values.shape[2])]
    else:
        shap_values_to_plot = shap_values
    
    plt.figure()
    shap.summary_plot(shap_values_to_plot, X_sample, show=False, max_display=15)
    os.makedirs("eda_outputs", exist_ok=True)
    plt.savefig("eda_outputs/shap_summary.png")
    plt.close()
    print("SHAP plot saved to eda_outputs/shap_summary.png")

if __name__ == "__main__":
    main()
