from ollama import chat
import csv
import ast
import os

BASE = os.path.dirname(os.path.abspath(__file__))
FRONTEND_MODEL = r'C:\Victus\SY-Sem 2\EDI\Frontend\Model'

def dataset(filename):
    return os.path.join(BASE, 'dataset', filename)

# --- Loaders ---
def load_csv_dict(path, key_col, val_col):
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            k = row[key_col].strip()
            data[k] = row[val_col].strip()
    return data

def load_csv_list(path, key_col, val_cols):
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            k = row[key_col].strip()
            vals = [row[c].strip() for c in val_cols if row.get(c, '').strip()]
            data[k] = vals
    return data

def load_workout(path):
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            d = row['disease'].strip()
            w = row['workout'].strip()
            data.setdefault(d, []).append(w)
    return data

def load_training_symptoms(path):
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        symptom_cols = [c for c in reader.fieldnames if c != 'prognosis']
        for row in reader:
            disease = row['prognosis'].strip()
            syms = [c.replace('_', ' ') for c in symptom_cols if row.get(c, '').strip() not in ('', '0', '0.0')]
            data.setdefault(disease, set()).update(syms)
    return {k: list(v) for k, v in data.items()}

# --- Load datasets ---
print("Loading datasets...")
descriptions = load_csv_dict(dataset('description.csv'), 'Disease', 'Description')
diets        = load_csv_dict(dataset('diets.csv'), 'Disease', 'Diet')
precautions  = load_csv_list(dataset('precautions_df.csv'), 'Disease', ['Precaution_1','Precaution_2','Precaution_3','Precaution_4'])
workouts     = load_workout(dataset('workout_df.csv'))

# Use Final_dataset.csv for symptom->disease mapping
training_path = os.path.join(FRONTEND_MODEL, 'Final_dataset.csv')
symptoms_map  = load_training_symptoms(training_path)

all_diseases = list(descriptions.keys()) or list(symptoms_map.keys())

def parse_list_field(val):
    try:
        return ast.literal_eval(val)
    except:
        return [val] if val else []

def find_disease(query):
    q = query.lower()
    for d in all_diseases:
        if d.lower() in q or q in d.lower():
            return d
    return None

def match_by_symptoms(query):
    q = query.lower().replace('-', ' ')
    scores = {}
    for disease, syms in symptoms_map.items():
        score = sum(1 for s in syms if s.lower() in q)
        if score > 0:
            scores[disease] = score
    return max(scores, key=scores.get) if scores else None

def build_context(disease):
    desc  = descriptions.get(disease, 'No description available.')
    diet  = parse_list_field(diets.get(disease, '[]'))
    prec  = precautions.get(disease, [])
    work  = workouts.get(disease, [])
    syms  = symptoms_map.get(disease, [])

    lines = [
        f"Disease: {disease}",
        f"Description: {desc}",
        f"Common Symptoms: {', '.join(syms[:12]) if syms else 'N/A'}",
        f"Diet Recommendations: {', '.join(diet) if diet else 'N/A'}",
        f"Precautions: {', '.join(prec) if prec else 'N/A'}",
        f"Workout/Lifestyle Tips: {', '.join(work[:5]) if work else 'N/A'}",
    ]
    return "\n".join(lines)

print("Ready! Ask about any disease or describe your symptoms.\n")

history = []

while True:
    user_input = input("You: ").strip()
    if not user_input:
        continue
    if user_input.lower() in ("exit", "quit"):
        break

    disease = find_disease(user_input) or match_by_symptoms(user_input)

    if disease:
        context = build_context(disease)
        system_prompt = f"""You are a helpful medical assistant. Use the data below to answer clearly and in a structured way.
Always cover: description, symptoms, diet, precautions, and workout/lifestyle tips.

{context}"""
    else:
        system_prompt = "You are a helpful medical assistant. Answer based on general medical knowledge. Ask the user to mention a specific disease or symptoms for detailed info."

    history.append({'role': 'user', 'content': user_input})

    # Keep only last 6 messages to avoid VRAM overflow
    trimmed_history = history[-6:]

    response = chat(
        model='llama3.2',
        messages=[{'role': 'system', 'content': system_prompt}] + trimmed_history,
    )

    reply = response.message.content
    history.append({'role': 'assistant', 'content': reply})
    print(f"\nAssistant: {reply}\n")
