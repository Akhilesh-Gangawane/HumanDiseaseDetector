import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.metrics import accuracy_score, classification_report, f1_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

def main():
    print("--- Loading Data and Models ---")
    df = pd.read_csv("Final_dataset.csv")
    target_col = 'prognosis'
    
    # Needs to apply same filtering
    class_counts = df[target_col].value_counts()
    valid_classes = class_counts[class_counts >= 2].index
    df = df[df[target_col].isin(valid_classes)]
    
    X = df.drop(columns=[target_col])
    # Drop constant columns
    constant_cols = [col for col in X.columns if X[col].nunique() <= 1]
    X = X.drop(columns=constant_cols)
    y = df[target_col]
    
    try:
        pipeline = joblib.load("best_pipeline.joblib")
        le = joblib.load("label_encoder.joblib")
    except Exception as e:
        print(f"Error loading models: {e}. Please ensure train_optuna.py has completed successfully.")
        return
        
    y_encoded = le.transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42)
    
    print("\n--- Evaluating on Test Set ---")
    preds = pipeline.predict(X_test)
    acc = accuracy_score(y_test, preds)
    macro_f1 = f1_score(y_test, preds, average='macro')
    
    print(f"Test Accuracy: {acc:.4f}")
    print(f"Test Macro F1: {macro_f1:.4f}")
    
    print("\nClassification Report (Test Set):")
    print(classification_report(y_test, preds))
    
    # Plot Learning Curves
    print("\n--- Generating Learning Curves (This may take a while) ---")
    # Subsampling X_train to 20,000 samples max for reasonable learning curve generation time
    max_samples = 20000
    if len(X_train) > max_samples:
        X_lc, _, y_lc, _ = train_test_split(X_train, y_train, train_size=max_samples, stratify=y_train, random_state=42)
    else:
        X_lc, y_lc = X_train, y_train
        
    train_sizes, train_scores, test_scores = learning_curve(
        pipeline, X_lc, y_lc, cv=3, scoring='f1_macro',
        train_sizes=np.linspace(0.1, 1.0, 5), n_jobs=-1, verbose=1
    )
    
    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)
    
    plt.figure(figsize=(10, 6))
    plt.plot(train_sizes, train_mean, label="Training Score")
    plt.plot(train_sizes, test_mean, label="Cross-Validation Score")
    
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1)
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.1)
    
    plt.title("Learning Curves (Voting Classifier)")
    plt.xlabel("Training Set Size")
    plt.ylabel("Macro F1 Score")
    plt.legend(loc="best")
    plt.tight_layout()
    os.makedirs("eda_outputs", exist_ok=True)
    plt.savefig("eda_outputs/learning_curves.png")
    plt.close()
    
    print("Learning curve saved to eda_outputs/learning_curves.png")

if __name__ == "__main__":
    main()
