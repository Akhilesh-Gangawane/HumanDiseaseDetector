"""
Graph-Based Feature Engineering Module

Generates Node2Vec embeddings from symptom co-occurrence graphs.
Each symptom is embedded into a 32-dimensional dense vector that captures
its structural position in the symptom relationship network.
"""

import pandas as pd
import numpy as np
import networkx as nx
from node2vec import Node2Vec
import joblib
import os


def generate_graph_features(
    co_occurrence_path="eda_outputs/symptom_co_occurrence.csv",
    output_path="models/symptom_embeddings.joblib",
    dimensions=64,
    walk_length=50,
    num_walks=300
):
    """
    Build a co-occurrence graph and train Node2Vec to produce symptom embeddings.

    Args:
        co_occurrence_path: Path to the symptom co-occurrence CSV matrix.
        output_path: Where to save the resulting embeddings dictionary.
        dimensions: Embedding dimensionality (default: 32).
        walk_length: Length of random walks (default: 30).
        num_walks: Number of walks per node (default: 200).

    Returns:
        dict: {symptom_name: np.ndarray of shape (dimensions,)}
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print(f"  Loading co-occurrence matrix from {co_occurrence_path}...")
    co_occurrence = pd.read_csv(co_occurrence_path, index_col=0)
    symptoms = co_occurrence.index.tolist()

    print("  Constructing weighted graph...")
    G = nx.Graph()
    threshold = 1.0

    for s in symptoms:
        G.add_node(s)

    for i in range(len(symptoms)):
        for j in range(i + 1, len(symptoms)):
            weight = co_occurrence.iloc[i, j]
            if weight > threshold:
                G.add_edge(symptoms[i], symptoms[j], weight=weight)

    print(f"  Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    print("  Training Node2Vec...")
    node2vec = Node2Vec(G, dimensions=dimensions, walk_length=walk_length,
                        num_walks=num_walks, workers=4)
    model = node2vec.fit(window=10, min_count=1, batch_words=4)

    embeddings = {node: model.wv[node] for node in G.nodes()}

    joblib.dump(embeddings, output_path)
    print(f"  Saved {len(embeddings)} embeddings to {output_path}")
    return embeddings


def aggregate_embeddings(active_symptoms, embeddings, dim=32):
    """
    Combine multiple symptom embeddings into one patient-level vector.

    Uses mean aggregation over all active symptom embeddings.

    Args:
        active_symptoms: List of symptom names present for a patient.
        embeddings: Dictionary mapping symptom names to embedding vectors.
        dim: Expected embedding dimensionality.

    Returns:
        np.ndarray of shape (dim,)
    """
    if not active_symptoms:
        return np.zeros(dim)

    valid = [embeddings[s] for s in active_symptoms if s in embeddings]
    if not valid:
        return np.zeros(dim)

    return np.mean(valid, axis=0)


if __name__ == "__main__":
    embeddings = generate_graph_features()

    test_symptoms = ["itching", "skin_rash"]
    vec = aggregate_embeddings(test_symptoms, embeddings)
    print(f"Sample embedding for {test_symptoms}: {vec[:5]}...")
