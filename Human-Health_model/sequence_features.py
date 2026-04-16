"""
Sequence-Based Feature Engineering Module

Treats each patient's active symptoms as a "sentence" and trains Word2Vec
to learn symptom embeddings from their contextual co-occurrence patterns.
Each symptom is embedded into a 32-dimensional dense vector.
"""

import pandas as pd
import numpy as np
from gensim.models import Word2Vec
import joblib
import os


def generate_sequence_features(
    csv_path="Final_dataset.csv",
    output_path="models/word2vec_embeddings.joblib",
    dimensions=64,
    window=5,
    min_count=1,
    epochs=50
):
    """
    Train Word2Vec on patient symptom sequences.

    Each patient's active symptoms are treated as a sentence.
    Word2Vec learns which symptoms appear in similar contexts.

    Args:
        csv_path: Path to the raw dataset.
        output_path: Where to save the learned embeddings.
        dimensions: Embedding dimensionality (default: 32).
        window: Context window size for Word2Vec.
        min_count: Minimum frequency to include a symptom.
        epochs: Number of training epochs.

    Returns:
        dict: {symptom_name: np.ndarray of shape (dimensions,)}
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("  Loading dataset for sequence extraction...")
    df = pd.read_csv(csv_path)
    target_col = 'prognosis'

    symptom_cols = [c for c in df.columns if c != target_col]
    numeric_cols = df[symptom_cols].select_dtypes(include=[np.number]).columns.tolist()

    print(f"  Building symptom sentences from {len(numeric_cols)} symptom columns (Vectorized)...")
    
    # Fast vectorized sentence extraction (~1-2 seconds vs 20+ minutes)
    X = df[numeric_cols].values
    cols_arr = np.array(numeric_cols)
    sentences = [cols_arr[row].tolist() for row in (X == 1)]
    sentences = [s for s in sentences if s] # Remove empty sentences

    print(f"  Generated {len(sentences)} patient sentences (avg length: "
          f"{np.mean([len(s) for s in sentences]):.1f} symptoms)")

    print("  Training Word2Vec model...")
    model = Word2Vec(
        sentences=sentences,
        vector_size=dimensions,
        window=window,
        min_count=min_count,
        workers=4,
        epochs=epochs,
        seed=42
    )

    embeddings = {word: model.wv[word] for word in model.wv.key_to_index}

    joblib.dump(embeddings, output_path)
    print(f"  Saved {len(embeddings)} embeddings to {output_path}")
    return embeddings


if __name__ == "__main__":
    embeddings = generate_sequence_features()

    test_symptoms = ["itching", "skin_rash"]
    valid = [embeddings[s] for s in test_symptoms if s in embeddings]
    if valid:
        vec = np.mean(valid, axis=0)
        print(f"Sample embedding for {test_symptoms}: {vec[:5]}...")
