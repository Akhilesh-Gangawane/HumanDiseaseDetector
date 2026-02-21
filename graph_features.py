import pandas as pd
import numpy as np
import networkx as nx
from node2vec import Node2Vec
import joblib
import os

def generate_graph_features(co_occurrence_path="eda_outputs/symptom_co_occurrence.csv", output_path="symptom_embeddings.joblib"):
    print(f"Loading co-occurrence matrix from {co_occurrence_path}...")
    co_occurrence = pd.read_csv(co_occurrence_path, index_col=0)
    symptoms = co_occurrence.index.tolist()
    
    print("Building graph...")
    G = nx.Graph()
    
    # Add nodes
    for s in symptoms:
        G.add_node(s)
        
    # Add weighted edges
    # To reduce computation, only add edges above a small threshold
    threshold = 1.0 # At least one co-occurrence
    for i in range(len(symptoms)):
        for j in range(i + 1, len(symptoms)):
            weight = co_occurrence.iloc[i, j]
            if weight > threshold:
                G.add_edge(symptoms[i], symptoms[j], weight=weight)
                
    print(f"Graph built with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")
    
    # Initialize Node2Vec model
    print("Initializing Node2Vec...")
    # dimensions=32 is a good balance for this size of graph
    node2vec = Node2Vec(G, dimensions=32, walk_length=30, num_walks=200, workers=4)
    
    # Train the model
    print("Training Node2Vec model (this may take a minute)...")
    model = node2vec.fit(window=10, min_count=1, batch_words=4)
    
    # Extract embeddings
    embeddings = {node: model.wv[node] for node in G.nodes()}
    
    print(f"Saving embeddings to {output_path}...")
    joblib.dump(embeddings, output_path)
    print("Done!")
    return embeddings

def aggregate_embeddings(active_symptoms, embeddings, dim=32):
    """
    Combines symptom embeddings into a single feature vector for a patient.
    - active_symptoms: list of symptom names that are '1' for the patient
    - embeddings: dict of {symptom_name: ndarray}
    """
    if not active_symptoms:
        return np.zeros(dim)
    
    # Filter for symptoms that actually have embeddings
    valid_embeddings = [embeddings[s] for s in active_symptoms if s in embeddings]
    
    if not valid_embeddings:
        return np.zeros(dim)
    
    # Use mean aggregation as requested/common practice
    return np.mean(valid_embeddings, axis=0)

if __name__ == "__main__":
    embeddings = generate_graph_features()
    
    # Example demo
    test_patient_symptoms = ["itching", "skin_rash"]
    vec = aggregate_embeddings(test_patient_symptoms, embeddings)
    print(f"Aggregated vector for {test_patient_symptoms}:")
    print(vec[:5], "...") # Show first 5 dimensions
