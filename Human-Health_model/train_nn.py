"""
Deep Residual Network for Disease Prediction

Trains a PyTorch ResNet-style neural network on combined symptom features
(One-Hot + Node2Vec + Word2Vec) for multi-class disease classification.

Incorporates:
- Tabular Feature Attention (Squeeze-and-Excitation)
- TF-IDF Symptom Weighting
- Uniform Class Weighting (to maximize absolute global accuracy toward the 92.2% ceiling)
"""

import numpy as np
import pandas as pd
import joblib
import os
import json
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

import warnings
warnings.filterwarnings('ignore')

MODEL_DIR = "models"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ─── Hyperparameters ─────────────────────────────────────────────
HIDDEN_DIM = 1024
NUM_BLOCKS = 6
DROPOUT = 0.3
BATCH_SIZE = 512
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
MAX_EPOCHS = 100
PATIENCE = 15
MIN_SAMPLES_PER_CLASS = 30


# ─── Model Architecture ─────────────────────────────────────────

class ResidualBlock(nn.Module):
    def __init__(self, dim, dropout=0.3):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, dim),
            nn.BatchNorm1d(dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(dim, dim),
            nn.BatchNorm1d(dim),
        )
        self.act = nn.GELU()
        self.dropout = nn.Dropout(dropout * 0.5)

    def forward(self, x):
        return self.act(self.dropout(self.block(x) + x))


class FeatureAttention(nn.Module):
    def __init__(self, dim, reduction=16):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(dim, dim // reduction, bias=False),
            nn.BatchNorm1d(dim // reduction),
            nn.GELU(),
            nn.Linear(dim // reduction, dim, bias=False),
            nn.Sigmoid()
        )
    def forward(self, x):
        return x * self.attn(x)


class DiseaseResNet(nn.Module):
    def __init__(self, input_dim, num_classes, hidden_dim=1024, num_blocks=6, dropout=0.3):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            FeatureAttention(hidden_dim)
        )
        self.blocks = nn.Sequential(
            *[ResidualBlock(hidden_dim, dropout) for _ in range(num_blocks)]
        )
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.GELU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(hidden_dim // 2, num_classes),
        )
    def forward(self, x):
        x = self.input_proj(x)
        x = self.blocks(x)
        return self.head(x)


# ─── Data Loading ────────────────────────────────────────────────

def load_combined_features(csv_path="Final_dataset.csv"):
    print("--- Loading Data ---")
    df = pd.read_csv(csv_path)
    target_col = 'prognosis'
    
    # Filter rare classes
    class_counts = df[target_col].value_counts()
    valid_classes = class_counts[class_counts >= MIN_SAMPLES_PER_CLASS].index
    df = df[df[target_col].isin(valid_classes)]
    
    X = df.drop(columns=[target_col])
    constant_cols = [c for c in X.columns if X[c].nunique() <= 1]
    X = X.drop(columns=constant_cols)
    symptom_cols = X.columns.tolist()
    X_values = X.values.astype(np.float32)
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(df[target_col])
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder.joblib"))
    joblib.dump(symptom_cols, os.path.join(MODEL_DIR, "feature_names.joblib"))
    
    # TF-IDF
    doc_freq = X_values.sum(axis=0)
    doc_freq[doc_freq == 0] = 1.0
    idf = np.log((1 + X_values.shape[0]) / (1 + doc_freq)) + 1
    X_tfidf = X_values * idf
    X_combined = X_tfidf
    
    # Node2Vec
    n2v_path = os.path.join(MODEL_DIR, "symptom_embeddings.joblib")
    if os.path.exists(n2v_path):
        embeddings = joblib.load(n2v_path)
        dim = len(next(iter(embeddings.values())))
        emb_matrix = np.array([embeddings.get(s, np.zeros(dim)) for s in symptom_cols])
        n2v_f = X_tfidf @ emb_matrix
        w_sum = X_tfidf.sum(axis=1, keepdims=True)
        w_sum[w_sum == 0] = 1.0
        X_combined = np.concatenate([X_combined, n2v_f / w_sum], axis=1)
        
    # Word2Vec
    w2v_path = os.path.join(MODEL_DIR, "word2vec_embeddings.joblib")
    if os.path.exists(w2v_path):
        embeddings = joblib.load(w2v_path)
        dim = len(next(iter(embeddings.values())))
        emb_matrix = np.array([embeddings.get(s, np.zeros(dim)) for s in symptom_cols])
        w2v_f = X_tfidf @ emb_matrix
        w_sum = X_tfidf.sum(axis=1, keepdims=True)
        w_sum[w_sum == 0] = 1.0
        X_combined = np.concatenate([X_combined, w2v_f / w_sum], axis=1)
    
    # Train/val/test
    X_trval, X_test, y_trval, y_test = train_test_split(
        X_combined, y_encoded, test_size=0.15, stratify=y_encoded, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(
        X_trval, y_trval, test_size=0.1176, stratify=y_trval, random_state=42)
        
    return X_train, X_val, X_test, y_train, y_val, y_test, len(le.classes_)


# ─── Training Loop ───────────────────────────────────────────────

def train_model():
    print("=" * 60)
    print(f"  DISEASE RESNET — TRAINING ON {DEVICE}")
    print("=" * 60)
    
    X_train, X_val, X_test, y_train, y_val, y_test, num_classes = load_combined_features()
    input_dim = X_train.shape[1]
    
    train_dl = DataLoader(TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train)), batch_size=BATCH_SIZE, shuffle=True)
    val_dl = DataLoader(TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val)), batch_size=BATCH_SIZE*2)
    test_dl = DataLoader(TensorDataset(torch.FloatTensor(X_test), torch.LongTensor(y_test)), batch_size=BATCH_SIZE*2)
    
    model = DiseaseResNet(input_dim, num_classes, HIDDEN_DIM, NUM_BLOCKS, DROPOUT).to(DEVICE)
    print(f"\n  Model Parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")
    
    # CRITICAL CHANGE: NO class weights. We strictly want to optimize absolute accuracy and natural frequency bias!
    criterion = nn.CrossEntropyLoss()
    
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=4, min_lr=1e-6)
    
    best_acc = 0.0
    patience_cnt = 0
    start = time.time()
    
    for epoch in range(MAX_EPOCHS):
        model.train()
        train_loss, train_corr, total = 0.0, 0, 0
        for bx, by in train_dl:
            bx, by = bx.to(DEVICE), by.to(DEVICE)
            optimizer.zero_grad()
            out = model(bx)
            loss = criterion(out, by)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            
            train_loss += loss.item() * bx.size(0)
            train_corr += (torch.max(out, 1)[1] == by).sum().item()
            total += by.size(0)
            
        train_acc = train_corr / total
        
        model.eval()
        v_preds, v_targs = [], []
        with torch.no_grad():
            for bx, by in val_dl:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                v_preds.extend(torch.max(model(bx), 1)[1].cpu().numpy())
                v_targs.extend(by.cpu().numpy())
                
        val_acc = accuracy_score(v_targs, v_preds)
        val_f1 = f1_score(v_targs, v_preds, average='macro', zero_division=0)
        scheduler.step(val_acc)
        lr = optimizer.param_groups[0]['lr']
        
        print(f"  Epoch {epoch+1:2d}/{MAX_EPOCHS} │ Train Acc: {train_acc*100:.2f}% │ Val Acc: {val_acc*100:.2f}% │ F1: {val_f1:.4f} │ LR: {lr:.6f}")
        
        if val_acc > best_acc:
            best_acc = val_acc
            patience_cnt = 0
            torch.save({
                'model_state_dict': model.state_dict(),
                'input_dim': input_dim, 'num_classes': num_classes,
                'hidden_dim': HIDDEN_DIM, 'num_blocks': NUM_BLOCKS, 'dropout': DROPOUT
            }, os.path.join(MODEL_DIR, "disease_resnet.pt"))
        else:
            patience_cnt += 1
            if patience_cnt >= PATIENCE:
                print(f"  Early stopping at epoch {epoch+1}")
                break

    print(f"\n{'='*60}\n  FINAL EVALUATION\n{'='*60}")
    checkpoint = torch.load(os.path.join(MODEL_DIR, "disease_resnet.pt"), weights_only=True)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    t_preds, t_targs = [], []
    with torch.no_grad():
        for bx, by in test_dl:
            bx = bx.to(DEVICE)
            t_preds.extend(torch.max(model(bx), 1)[1].cpu().numpy())
            t_targs.extend(by.to(DEVICE).cpu().numpy())
            
    acc = accuracy_score(t_targs, t_preds)
    f1 = f1_score(t_targs, t_preds, average='macro', zero_division=0)
    prec = precision_score(t_targs, t_preds, average='macro', zero_division=0)
    rec = recall_score(t_targs, t_preds, average='macro', zero_division=0)
    
    print(f"  ★ Test Accuracy:  {acc*100:.2f}%")
    print(f"  ★ Test F1:        {f1:.4f}")
    print(f"  ★ Test Precision: {prec:.4f}")
    print(f"  ★ Test Recall:    {rec:.4f}")
    
    with open(os.path.join(MODEL_DIR, "results_summary.json"), 'w') as f:
        json.dump({'DiseaseResNet': {'Accuracy': float(acc), 'Precision': float(prec), 'Recall': float(rec), 'F1': float(f1)}}, f, indent=2)

if __name__ == "__main__":
    train_model()
