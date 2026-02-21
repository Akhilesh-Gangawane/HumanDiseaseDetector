import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import xgboost as xgb
import lightgbm as lgb
from sklearn.utils.class_weight import compute_sample_weight
import optuna
import shap
import joblib
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

def perform_eda(df, output_dir="eda_outputs"):
    print("--- Starting EDA ---")
    os.makedirs(output_dir, exist_ok=True)
    target_col = 'prognosis'
    
    plt.figure(figsize=(12, 8))
    sns.countplot(y=df[target_col], order=df[target_col].value_counts().index)
    plt.title("Class Distribution")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "class_distribution.png"))
    plt.close()

    missing = df.isnull().sum()
    if len(missing[missing > 0]) > 0:
        missing[missing > 0].plot(kind="bar", figsize=(10, 5))
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, "missing_values.png"))
        plt.close()
        
    constant_cols = [col for col in df.columns if df[col].nunique() <= 1]
    print(f"Number of constant columns: {len(constant_cols)}")

def build_preprocessor(numeric_features):
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value=0.0)),
        # No scaling needed as everything is binary
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features)
        ],
        remainder='drop')
    return preprocessor

def get_base_models(random_state=42):
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=random_state, n_jobs=-1)
    rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=random_state, n_jobs=-1)
    
    # GPU XGBoost
    xgb_model = xgb.XGBClassifier(
        tree_method='hist',
        device='cuda',
        n_estimators=100,
        random_state=random_state,
        eval_metric='mlogloss'
    )
    
    # GPU LightGBM
    lgb_model = lgb.LGBMClassifier(
        device='gpu',
        n_estimators=100,
        class_weight='balanced',
        random_state=random_state,
        verbose=-1
    )
    
    return {
        'LogisticRegression': lr,
        'RandomForest': rf,
        'XGBoost': xgb_model,
        'LightGBM': lgb_model
    }

def train_and_evaluate(df):
    target_col = 'prognosis'
    
    # Filter classes with < 2 instances
    class_counts = df[target_col].value_counts()
    valid_classes = class_counts[class_counts >= 2].index
    print(f"Dropping {len(class_counts) - len(valid_classes)} classes with < 2 samples.")
    df = df[df[target_col].isin(valid_classes)]
    
    X = df.drop(columns=[target_col])
    
    # Drop constant columns to speed up training
    constant_cols = [col for col in X.columns if X[col].nunique() <= 1]
    X = X.drop(columns=constant_cols)
    print(f"Dropped {len(constant_cols)} constant columns. Remaining features: {X.shape[1]}")
    
    y = df[target_col]
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    joblib.dump(le, "label_encoder.joblib")
    print("Label encoder saved to label_encoder.joblib")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42)
    
    preprocessor = build_preprocessor(X.columns.tolist())
    
    sample_weights_train = compute_sample_weight('balanced', y_train)
    
    models = get_base_models()
    results = {}
    
    print("\n--- Training Base Models ---")
    for name, model in models.items():
        print(f"Training {name}...")
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', model)])
        
        try:
            if name == 'XGBoost':
                pipeline.fit(X_train, y_train, classifier__sample_weight=sample_weights_train)
            else:
                pipeline.fit(X_train, y_train)
                
            preds = pipeline.predict(X_test)
            acc = accuracy_score(y_test, preds)
            macro_f1 = f1_score(y_test, preds, average='macro')
            results[name] = {'Accuracy': acc, 'Macro_F1': macro_f1}
            print(f"{name} - Accuracy: {acc:.4f}, Macro F1: {macro_f1:.4f}")
        except Exception as e:
            print(f"Failed to train {name}: {e}")
            results[name] = {'Accuracy': 0, 'Macro_F1': 0}
        
    print("\n--- Model Comparison ---")
    results_df = pd.DataFrame(results).T
    print(results_df)

if __name__ == "__main__":
    df = pd.read_csv("Final_dataset.csv")
    perform_eda(df)
    train_and_evaluate(df)
