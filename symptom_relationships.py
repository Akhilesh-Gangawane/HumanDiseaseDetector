import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
import os

import traceback

def analyze_symptoms(csv_path="Final_dataset.csv", output_dir="eda_outputs", chunk_size=50000):
    try:
        print(f"Loading dataset from {csv_path} in chunks of {chunk_size}...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        co_occurrence = None
        symptoms = None
        chunk_count = 0
        
        # Read in chunks to be memory-efficient
        for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
            chunk_count += 1
            print(f"Processing chunk {chunk_count}...")
            
            if symptoms is None:
                # First chunk: define symptoms (numeric columns)
                symptoms = [col for col in chunk.select_dtypes(include=[np.number]).columns]
                print(f"Found {len(symptoms)} numeric symptoms.")
                co_occurrence = pd.DataFrame(0.0, index=symptoms, columns=symptoms)
                
            # Filter chunk for numeric symptoms only
            X = chunk[symptoms].fillna(0).values # using values to speed up and avoid index alignment overhead
            
            # Incremental update of co-occurrence matrix
            co_occurrence += X.T @ X
            
        print(f"Co-occurrence matrix calculated. Shape: {co_occurrence.shape}")
        print(f"Saving to {output_dir}/symptom_co_occurrence.csv")
        co_occurrence.to_csv(os.path.join(output_dir, "symptom_co_occurrence.csv"))
        
        # ... (rest of the visualization)
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        traceback.print_exc()
        raise
    top_n = 30
    # Symptoms with highest co-occurrence frequency (sum of row/col)
    top_symptoms = co_occurrence.sum().nlargest(top_n).index
    subset_matrix = co_occurrence.loc[top_symptoms, top_symptoms]
    
    plt.figure(figsize=(15, 12))
    sns.heatmap(subset_matrix, annot=False, cmap="YlGnBu")
    plt.title(f"Top {top_n} Symptoms - Co-occurrence Heatmap")
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "co_occurrence_heatmap.png"))
    plt.close()
    print(f"Heatmap saved to {output_dir}/co_occurrence_heatmap.png")
    
    # 3. Network Visualization
    print("Building symptom network...")
    G = nx.Graph()
    
    # Threshold for edges to avoid a "hairball"
    # Only connect symptoms that appear together at least X times
    threshold = co_occurrence.values.max() * 0.1  # 10% of max co-occurrence
    
    for i in range(len(symptoms)):
        G.add_node(symptoms[i])
        for j in range(i + 1, len(symptoms)):
            weight = co_occurrence.iloc[i, j]
            if weight > threshold:
                G.add_edge(symptoms[i], symptoms[j], weight=weight)
                
    # Remove isolated nodes
    G.remove_nodes_from(list(nx.isolates(G)))
                
    plt.figure(figsize=(16, 12))
    pos = nx.spring_layout(G, k=0.15, iterations=20)
    
    # Draw nodes
    nx.draw_networkx_nodes(G, pos, node_size=100, node_color='skyblue', alpha=0.8)
    
    # Draw edges with varying thickness
    weights = [G[u][v]['weight'] for u, v in G.edges()]
    max_weight = max(weights) if weights else 1
    edge_widths = [max(1, (w / max_weight) * 5) for w in weights]
    nx.draw_networkx_edges(G, pos, width=edge_widths, edge_color='gray', alpha=0.4)
    
    # Labels
    nx.draw_networkx_labels(G, pos, font_size=8, font_family='sans-serif')
    
    plt.title("Symptom Relationship Network (Filtered by co-occurrence threshold)")
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "symptom_network.png"))
    plt.close()
    print(f"Network diagram saved to {output_dir}/symptom_network.png")
    
    return co_occurrence, G

if __name__ == "__main__":
    analyze_symptoms()
