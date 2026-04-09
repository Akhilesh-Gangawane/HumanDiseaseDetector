"""
Disease Prediction API - Finalized PyTorch Edition
FastAPI application serving the Apex Deep Residual Network + RAG chat from CSV datasets.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, sys, csv, ast

# ── Windows DLL fix ──────────────────────────────────────────────
if sys.platform == "win32":
    import site
    _python_dir = os.path.dirname(sys.executable)
    if os.path.isdir(_python_dir):
        os.add_dll_directory(_python_dir)
    _lib_bin = os.path.join(_python_dir, "Library", "bin")
    if os.path.isdir(_lib_bin):
        os.add_dll_directory(_lib_bin)
    for _sp in site.getsitepackages():
        _torch_lib = os.path.join(_sp, "torch", "lib")
        if os.path.isdir(_torch_lib):
            os.add_dll_directory(_torch_lib)
            break

import torch
import torch.nn as nn
import joblib
import numpy as np
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Disease Prediction API", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4200",
                   "http://127.0.0.1:3000", "http://127.0.0.1:4200"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ─── Model Architecture ────────────────────────────────────────
class ResidualBlock(nn.Module):
    def __init__(self, dim, dropout=0.3):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, dim), nn.BatchNorm1d(dim), nn.GELU(), nn.Dropout(dropout),
            nn.Linear(dim, dim), nn.BatchNorm1d(dim),
        )
        self.act = nn.GELU()
        self.dropout = nn.Dropout(dropout * 0.5)
    def forward(self, x):
        return self.act(self.dropout(self.block(x) + x))

class FeatureAttention(nn.Module):
    def __init__(self, dim, reduction=16):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(dim, dim // reduction, bias=False), nn.BatchNorm1d(dim // reduction),
            nn.GELU(), nn.Linear(dim // reduction, dim, bias=False), nn.Sigmoid()
        )
    def forward(self, x):
        return x * self.attn(x)

class DiseaseResNet(nn.Module):
    def __init__(self, input_dim, num_classes, hidden_dim=1024, num_blocks=6, dropout=0.3):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim), nn.BatchNorm1d(hidden_dim),
            nn.GELU(), nn.Dropout(dropout), FeatureAttention(hidden_dim)
        )
        self.blocks = nn.Sequential(*[ResidualBlock(hidden_dim, dropout) for _ in range(num_blocks)])
        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2), nn.BatchNorm1d(hidden_dim // 2),
            nn.GELU(), nn.Dropout(dropout * 0.5), nn.Linear(hidden_dim // 2, num_classes),
        )
    def forward(self, x):
        return self.head(self.blocks(self.input_proj(x)))

# ─── Global model state ────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None
_label_encoder = None
_feature_names = None
_idf = None
_n2v_matrix = None
_w2v_matrix = None

# ─── RAG: CSV dataset loaders ─────────────────────────────────
_RAG_BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'RAG', 'dataset')

def _load_csv_dict(path, key_col, val_col):
    data = {}
    if not os.path.exists(path):
        print(f"WARNING: RAG dataset not found: {path}")
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            data[row[key_col].strip()] = row[val_col].strip()
    return data

def _load_csv_list(path, key_col, val_cols):
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            k = row[key_col].strip()
            data[k] = [row[c].strip() for c in val_cols if row.get(c, '').strip()]
    return data

def _load_workout(path):
    data: Dict[str, List[str]] = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            d = row['disease'].strip()
            data.setdefault(d, []).append(row['workout'].strip())
    return data

def _parse_list(val):
    try:
        return ast.literal_eval(val)
    except Exception:
        return [val] if val else []

# Load all four datasets
_descriptions = _load_csv_dict(os.path.join(_RAG_BASE, 'description.csv'),   'Disease', 'Description')
_diets        = _load_csv_dict(os.path.join(_RAG_BASE, 'diets.csv'),          'Disease', 'Diet')
_precautions  = _load_csv_list(os.path.join(_RAG_BASE, 'precautions_df.csv'), 'Disease',
                                ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4'])
_workouts     = _load_workout(os.path.join(_RAG_BASE, 'workout_df.csv'))

# Normalised lookup: lowercase → canonical name
_disease_index: Dict[str, str] = {d.lower(): d for d in _descriptions}

def _find_disease(name: str) -> Optional[str]:
    q = name.lower().strip()
    if q in _disease_index:
        return _disease_index[q]
    for key, canonical in _disease_index.items():
        if key in q or q in key:
            return canonical
    return None

def _build_context(disease: str) -> str:
    desc  = _descriptions.get(disease, '')
    diet  = _parse_list(_diets.get(disease, '[]'))
    prec  = _precautions.get(disease, [])
    work  = _workouts.get(disease, [])
    parts = []
    if desc:
        parts.append(f"Description: {desc}")
    if prec:
        parts.append(f"Precautions: {'; '.join(prec)}")
    if diet:
        parts.append(f"Recommended Diet: {', '.join(diet)}")
    if work:
        parts.append(f"Lifestyle & Workout Tips: {', '.join(work[:8])}")
    return "\n".join(parts) if parts else "No detailed information available."

# ─── TF-IDF RAG index ─────────────────────────────────────────
_rag_vectorizer: Optional[TfidfVectorizer] = None
_rag_matrix = None
_rag_diseases: List[str] = []
_rag_docs:    List[str] = []

def build_rag_index():
    global _rag_vectorizer, _rag_matrix, _rag_diseases, _rag_docs
    _rag_diseases.clear()
    _rag_docs.clear()
    for disease in _descriptions:
        _rag_diseases.append(disease)
        _rag_docs.append(f"{disease} {_build_context(disease)}")
    if not _rag_docs:
        print("WARNING: RAG dataset empty — check RAG/dataset/ path.")
        return
    _rag_vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
    _rag_matrix = _rag_vectorizer.fit_transform(_rag_docs)
    print(f"RAG index built: {len(_rag_diseases)} diseases from CSV datasets.")

def _retrieve(disease_hint: Optional[str] = None, query: str = "") -> Optional[str]:
    # Prediction context → use exact disease from dataset
    if disease_hint:
        canonical = _find_disease(disease_hint)
        if canonical:
            return _build_context(canonical)
    # No context → TF-IDF search
    if _rag_vectorizer is None or not _rag_docs:
        return None
    q_vec = _rag_vectorizer.transform([query])
    scores = cosine_similarity(q_vec, _rag_matrix).flatten()
    best = int(scores.argmax())
    return _build_context(_rag_diseases[best]) if scores[best] > 0.01 else None

# ─── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
def load_artifacts():
    global _model, _label_encoder, _feature_names, _idf, _n2v_matrix, _w2v_matrix
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    try:
        _label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))
        _feature_names = joblib.load(os.path.join(model_dir, "feature_names.joblib"))
        _idf           = joblib.load(os.path.join(model_dir, "idf.joblib"))
        n2v = joblib.load(os.path.join(model_dir, "symptom_embeddings.joblib"))
        n2v_dim = len(next(iter(n2v.values())))
        _n2v_matrix = np.array([n2v.get(s, np.zeros(n2v_dim)) for s in _feature_names])
        w2v = joblib.load(os.path.join(model_dir, "word2vec_embeddings.joblib"))
        w2v_dim = len(next(iter(w2v.values())))
        _w2v_matrix = np.array([w2v.get(s, np.zeros(w2v_dim)) for s in _feature_names])
        chkpt = torch.load(os.path.join(model_dir, "disease_resnet.pt"), map_location=DEVICE, weights_only=True)
        _model = DiseaseResNet(
            input_dim=chkpt['input_dim'], num_classes=chkpt['num_classes'],
            hidden_dim=chkpt.get('hidden_dim', 1024), num_blocks=chkpt.get('num_blocks', 6),
            dropout=chkpt.get('dropout', 0.3)
        ).to(DEVICE)
        _model.load_state_dict(chkpt['model_state_dict'])
        _model.eval()
        print("Neural Network loaded successfully.")
    except Exception as e:
        print(f"Error loading model artifacts: {e}")
    build_rag_index()

# ─── Pydantic models ──────────────────────────────────────────
class PredictionRequest(BaseModel):
    symptoms: Dict[str, int]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatContext(BaseModel):
    disease: str
    confidence: float
    symptoms: List[str]

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    context: Optional[ChatContext] = None

# ─── Chat endpoint — llama3.2 + RAG ──────────────────────────
@app.post("/chat")
def chat(request: ChatRequest):
    ctx = request.context
    disease_hint = ctx.disease if ctx else None

    # 1. Retrieve relevant knowledge from CSV datasets
    knowledge = _retrieve(disease_hint=disease_hint, query=request.message)

    # 2. Build system prompt: medical assistant persona + RAG context
    system_parts = [
        "You are a knowledgeable and empathetic AI medical assistant for the Dhanvantari AI healthcare platform.",
        "Your job is to answer ANY medical question the user asks — clearly, accurately, and helpfully.",
        "Never refuse a medical question. Always provide a thorough, informative answer.",
        "Use the patient context and dataset knowledge provided to give personalised, relevant answers.",
        "At the end of your answer, briefly remind the user to consult a doctor for personalised care.",
        "Do not say you cannot answer. Do not say you are not a doctor. Just answer the question well.",
    ]

    if ctx:
        system_parts.append(
            f"\nPatient context from AI prediction:\n"
            f"- Predicted Disease: {ctx.disease}\n"
            f"- Confidence: {ctx.confidence:.0f}%\n"
            f"- Reported Symptoms: {', '.join(ctx.symptoms)}"
        )

    if knowledge:
        system_parts.append(f"\nRelevant medical knowledge from dataset:\n{knowledge}")

    system_prompt = "\n".join(system_parts)

    # 3. Build message list: system + conversation history + current question
    messages = [{"role": "system", "content": system_prompt}]

    # Include last 6 turns of history for continuity
    for h in request.history[-6:]:
        messages.append({"role": h.role, "content": h.content})

    # Current user question in the structured format
    messages.append({
        "role": "user",
        "content": f"context:\n{system_prompt}\n\nquestion:\n{request.message}"
    })

    # 4. Call llama3.2 via Ollama
    try:
        import ollama as _ollama
        response = _ollama.chat(model="llama3.2", messages=messages)
        reply = response.message.content
    except Exception as e:
        # Fallback to RAG-only answer if Ollama is unavailable
        print(f"Ollama error: {e}")
        if knowledge:
            reply = knowledge
            if ctx:
                reply += f"\n\n⚕️ (AI model unavailable — showing dataset info for **{ctx.disease}**)"
        else:
            reply = "I'm having trouble connecting to the AI model. Please try again shortly."

    return {"message": reply, "type": "general"}

# ─── Predict endpoint ─────────────────────────────────────────
@app.post("/predict")
def predict(request: PredictionRequest):
    if _model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")
    try:
        x_raw = np.zeros(len(_feature_names), dtype=np.float32)
        for sym, val in request.symptoms.items():
            if sym in _feature_names:
                x_raw[_feature_names.index(sym)] = float(val)
        x_raw = x_raw.reshape(1, -1)
        x_tfidf = x_raw * _idf
        w_sum = x_tfidf.sum(axis=1, keepdims=True)
        w_sum[w_sum == 0] = 1.0
        n2v_feat = (x_tfidf @ _n2v_matrix) / w_sum
        w2v_feat = (x_tfidf @ _w2v_matrix) / w_sum
        x_combined = np.concatenate([x_tfidf, n2v_feat, w2v_feat], axis=1)
        with torch.no_grad():
            logits = _model(torch.FloatTensor(x_combined).to(DEVICE))
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
        pred_idx = np.argmax(probs)
        return {
            "prediction": str(_label_encoder.inverse_transform([pred_idx])[0]),
            "confidence": float(probs[pred_idx]),
            "method": "Deep Residual Neural Network (86.7%)"
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": _model is not None,
            "rag_diseases": len(_rag_diseases)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
