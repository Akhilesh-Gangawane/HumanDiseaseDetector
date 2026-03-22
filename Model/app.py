from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import re
from typing import Dict, List, Optional
import pipeline  # Required for unpickling custom transformers

app = FastAPI(title="Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Artifacts ────────────────────────────────────────────────────────────────
ml_pipeline = None
label_encoder = None
feature_names = None

@app.on_event("startup")
def load_artifacts():
    global ml_pipeline, label_encoder, feature_names
    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        ml_pipeline   = joblib.load(os.path.join(base_dir, "best_pipeline.joblib"))
        label_encoder = joblib.load(os.path.join(base_dir, "label_encoder.joblib"))
        feature_names = joblib.load(os.path.join(base_dir, "feature_names.joblib"))
        print("Model artifacts loaded successfully.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

# ── RAG Knowledge Base ────────────────────────────────────────────────────────
DISEASE_KB: Dict[str, Dict] = {
    "Fungal infection":      {"precautions": ["Keep skin dry","Use antifungal cream","Avoid sharing personal items","Wear breathable clothing"], "specialist": "Dermatologist", "urgency": "low"},
    "Allergy":               {"precautions": ["Avoid allergens","Take antihistamines","Carry epinephrine if severe","Consult allergist"], "specialist": "Allergist", "urgency": "medium"},
    "GERD":                  {"precautions": ["Avoid spicy/fatty foods","Eat smaller meals","Don't lie down after eating","Elevate head while sleeping"], "specialist": "Gastroenterologist", "urgency": "low"},
    "Chronic cholestasis":   {"precautions": ["Avoid alcohol","Follow low-fat diet","Take prescribed medications","Regular liver function tests"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Drug Reaction":         {"precautions": ["Stop the suspected drug","Seek immediate medical help","Carry allergy card","Inform all doctors of allergy"], "specialist": "Emergency/Allergist", "urgency": "high"},
    "Peptic ulcer disease":  {"precautions": ["Avoid NSAIDs","Reduce stress","Avoid spicy food","Take prescribed antacids"], "specialist": "Gastroenterologist", "urgency": "medium"},
    "AIDS":                  {"precautions": ["Take antiretroviral therapy","Practice safe sex","Regular CD4 count monitoring","Avoid infections"], "specialist": "Infectious Disease Specialist", "urgency": "high"},
    "Diabetes":              {"precautions": ["Monitor blood sugar","Follow diabetic diet","Exercise regularly","Take prescribed medication"], "specialist": "Endocrinologist", "urgency": "high"},
    "Gastroenteritis":       {"precautions": ["Stay hydrated","Eat bland foods","Rest","Wash hands frequently"], "specialist": "General Physician", "urgency": "medium"},
    "Bronchial Asthma":      {"precautions": ["Avoid triggers","Carry inhaler","Monitor peak flow","Follow action plan"], "specialist": "Pulmonologist", "urgency": "high"},
    "Hypertension":          {"precautions": ["Reduce salt intake","Exercise regularly","Monitor BP daily","Take prescribed medication"], "specialist": "Cardiologist", "urgency": "high"},
    "Migraine":              {"precautions": ["Identify triggers","Rest in dark quiet room","Stay hydrated","Take prescribed medication"], "specialist": "Neurologist", "urgency": "medium"},
    "Cervical spondylosis":  {"precautions": ["Maintain good posture","Do neck exercises","Use ergonomic furniture","Avoid heavy lifting"], "specialist": "Orthopedist", "urgency": "low"},
    "Paralysis (brain hemorrhage)": {"precautions": ["Seek emergency care immediately","Control blood pressure","Rehabilitation therapy","Regular follow-up"], "specialist": "Neurologist", "urgency": "critical"},
    "Jaundice":              {"precautions": ["Rest","Stay hydrated","Avoid alcohol","Follow prescribed diet"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Malaria":               {"precautions": ["Take antimalarial drugs","Use mosquito nets","Apply insect repellent","Complete full course of treatment"], "specialist": "Infectious Disease Specialist", "urgency": "high"},
    "Chicken pox":           {"precautions": ["Isolate from others","Avoid scratching","Take antivirals if prescribed","Keep skin clean"], "specialist": "General Physician", "urgency": "medium"},
    "Dengue":                {"precautions": ["Rest and hydrate","Monitor platelet count","Avoid aspirin/NSAIDs","Seek hospital care if severe"], "specialist": "General Physician", "urgency": "high"},
    "Typhoid":               {"precautions": ["Take prescribed antibiotics","Drink boiled water","Eat freshly cooked food","Rest"], "specialist": "Infectious Disease Specialist", "urgency": "high"},
    "Hepatitis A":           {"precautions": ["Rest","Avoid alcohol","Eat nutritious food","Practice good hygiene"], "specialist": "Gastroenterologist", "urgency": "medium"},
    "Hepatitis B":           {"precautions": ["Antiviral therapy","Avoid alcohol","Regular liver monitoring","Vaccinate close contacts"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Hepatitis C":           {"precautions": ["Antiviral treatment","Avoid alcohol","Don't share needles","Regular liver function tests"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Hepatitis D":           {"precautions": ["Treat underlying Hepatitis B","Avoid alcohol","Regular monitoring","Supportive care"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Hepatitis E":           {"precautions": ["Rest and hydrate","Avoid alcohol","Eat safe food","Seek care if pregnant"], "specialist": "General Physician", "urgency": "medium"},
    "Alcoholic hepatitis":   {"precautions": ["Stop alcohol immediately","Nutritional support","Prescribed steroids","Regular liver tests"], "specialist": "Gastroenterologist", "urgency": "high"},
    "Tuberculosis":          {"precautions": ["Complete full antibiotic course","Cover mouth when coughing","Isolate during infectious period","Regular sputum tests"], "specialist": "Pulmonologist", "urgency": "high"},
    "Common Cold":           {"precautions": ["Rest","Stay hydrated","Take OTC cold medicine","Wash hands frequently"], "specialist": "General Physician", "urgency": "low"},
    "Pneumonia":             {"precautions": ["Take prescribed antibiotics","Rest","Stay hydrated","Monitor oxygen levels"], "specialist": "Pulmonologist", "urgency": "high"},
    "Dimorphic hemmorhoids(piles)": {"precautions": ["Eat high-fiber diet","Stay hydrated","Avoid straining","Sitz baths"], "specialist": "Gastroenterologist", "urgency": "low"},
    "Heart attack":          {"precautions": ["Call emergency services immediately","Chew aspirin if not allergic","Rest","Do not drive yourself"], "specialist": "Cardiologist", "urgency": "critical"},
    "Varicose veins":        {"precautions": ["Elevate legs","Wear compression stockings","Exercise regularly","Avoid prolonged standing"], "specialist": "Vascular Surgeon", "urgency": "low"},
    "Hypothyroidism":        {"precautions": ["Take levothyroxine as prescribed","Regular TSH monitoring","Eat iodine-rich foods","Avoid goitrogens"], "specialist": "Endocrinologist", "urgency": "medium"},
    "Hyperthyroidism":       {"precautions": ["Take antithyroid medication","Avoid iodine-rich foods","Regular thyroid function tests","Manage stress"], "specialist": "Endocrinologist", "urgency": "medium"},
    "Hypoglycemia":          {"precautions": ["Eat regular meals","Carry glucose tablets","Monitor blood sugar","Avoid skipping meals"], "specialist": "Endocrinologist", "urgency": "high"},
    "Osteoarthritis":        {"precautions": ["Low-impact exercise","Maintain healthy weight","Physical therapy","Pain management"], "specialist": "Orthopedist", "urgency": "low"},
    "Arthritis":             {"precautions": ["Anti-inflammatory medication","Physical therapy","Joint protection","Regular exercise"], "specialist": "Rheumatologist", "urgency": "medium"},
    "Vertigo":               {"precautions": ["Avoid sudden movements","Epley maneuver","Stay hydrated","Avoid caffeine/alcohol"], "specialist": "ENT Specialist", "urgency": "medium"},
    "Acne":                  {"precautions": ["Keep skin clean","Avoid touching face","Use non-comedogenic products","Prescribed topical treatment"], "specialist": "Dermatologist", "urgency": "low"},
    "Urinary tract infection": {"precautions": ["Drink plenty of water","Take prescribed antibiotics","Urinate frequently","Maintain hygiene"], "specialist": "Urologist", "urgency": "medium"},
    "Psoriasis":             {"precautions": ["Moisturize regularly","Avoid triggers","Use prescribed topical treatments","Manage stress"], "specialist": "Dermatologist", "urgency": "low"},
    "Impetigo":              {"precautions": ["Keep area clean","Take prescribed antibiotics","Avoid touching sores","Wash hands frequently"], "specialist": "Dermatologist", "urgency": "medium"},
}

# ── Symptom NLP Map ───────────────────────────────────────────────────────────
SYMPTOM_NLP_MAP = {
    "fever": ["high_fever", "mild_fever"], "temperature": ["high_fever"],
    "cough": ["cough"], "phlegm": ["phlegm"], "mucus": ["mucoid_sputum"],
    "headache": ["headache"], "head pain": ["headache"],
    "fatigue": ["fatigue"], "tired": ["fatigue"], "lethargy": ["lethargy"],
    "nausea": ["nausea"], "vomit": ["vomiting"], "vomiting": ["vomiting"],
    "diarrhea": ["diarrhoea"], "loose stool": ["diarrhoea"],
    "stomach pain": ["stomach_pain", "abdominal_pain"], "belly pain": ["belly_pain"],
    "abdominal pain": ["abdominal_pain"], "chest pain": ["chest_pain"],
    "dizzy": ["dizziness"], "dizziness": ["dizziness"],
    "weakness": ["weakness_in_limbs"], "weak": ["fatigue"],
    "breathless": ["breathlessness"], "breathing": ["breathlessness"], "shortness of breath": ["breathlessness"],
    "rash": ["skin_rash"], "skin rash": ["skin_rash"],
    "itch": ["itching"], "itching": ["itching"],
    "sore throat": ["throat_irritation"], "throat pain": ["throat_irritation"],
    "runny nose": ["runny_nose"], "congestion": ["congestion"],
    "joint pain": ["joint_pain"], "back pain": ["back_pain"],
    "muscle pain": ["muscle_pain"], "neck pain": ["neck_pain"],
    "swelling": ["swelling_joints"], "swollen": ["swelled_lymph_nodes"],
    "yellow skin": ["yellowish_skin"], "yellow eyes": ["yellowing_of_eyes"],
    "dark urine": ["dark_urine"], "yellow urine": ["yellow_urine"],
    "weight loss": ["weight_loss"], "weight gain": ["weight_gain"],
    "anxiety": ["anxiety"], "depression": ["depression"],
    "palpitation": ["palpitations"], "fast heart": ["fast_heart_rate"],
    "blurred vision": ["blurred_and_distorted_vision"],
    "loss of appetite": ["loss_of_appetite"], "no appetite": ["loss_of_appetite"],
    "constipation": ["constipation"], "indigestion": ["indigestion"],
    "sweating": ["sweating"], "chills": ["chills"], "shivering": ["shivering"],
    "dehydration": ["dehydration"], "sunken eyes": ["sunken_eyes"],
    "stiff neck": ["stiff_neck"], "knee pain": ["knee_pain"],
    "hip pain": ["hip_joint_pain"], "muscle weakness": ["muscle_weakness"],
    "blood in stool": ["bloody_stool"], "rectal pain": ["pain_in_anal_region"],
    "burning urination": ["burning_micturition"], "frequent urination": ["polyuria"],
    "bladder": ["bladder_discomfort"], "foul urine": ["foul_smell_of_urine"],
    "acidity": ["acidity"], "ulcer": ["ulcers_on_tongue"],
    "skin peeling": ["skin_peeling"], "blackheads": ["blackheads"],
    "pimples": ["pus_filled_pimples"], "blister": ["blister"],
    "loss of smell": ["loss_of_smell"], "loss of balance": ["loss_of_balance"],
    "spinning": ["spinning_movements"], "unsteady": ["unsteadiness"],
    "slurred speech": ["slurred_speech"], "altered consciousness": ["altered_sensorium"],
    "red spots": ["red_spots_over_body"], "red eyes": ["redness_of_eyes"],
    "watery eyes": ["watering_from_eyes"], "sinus": ["sinus_pressure"],
    "enlarged thyroid": ["enlarged_thyroid"], "brittle nails": ["brittle_nails"],
    "excessive hunger": ["excessive_hunger"], "increased appetite": ["increased_appetite"],
    "irritability": ["irritability"], "mood swings": ["mood_swings"],
    "restless": ["restlessness"], "malaise": ["malaise"],
    "obesity": ["obesity"], "bruising": ["bruising"], "cramps": ["cramps"],
}

GENERAL_HEALTH_QA = {
    "hello": "Hello! I'm your AI Medical Assistant. Describe your symptoms and I'll analyze them, or ask me any health question.",
    "hi": "Hi there! Tell me your symptoms and I'll help identify possible conditions.",
    "help": "I can help with:\n• Disease prediction from symptoms\n• Precautions and specialist recommendations\n• General health information\n\nJust describe what you're feeling!",
    "what can you do": "I analyze your symptoms using an AI model trained on medical data, predict possible conditions, suggest precautions, and recommend the right specialist.",
    "doctor": "I can recommend which specialist to see based on your symptoms. Describe what you're experiencing!",
    "appointment": "To book an appointment, use the 'Consult Doctor' feature in the navigation menu.",
    "medicine": "For medicine purchases, visit the 'Buy Medicine' section. Always consult a doctor before starting any medication.",
    "emergency": "⚠️ If this is a medical emergency, please call emergency services (911) immediately or go to the nearest emergency room.",
}

def extract_symptoms_from_text(text: str) -> List[str]:
    """NLP-based symptom extraction from free text."""
    lower = text.lower()
    found = set()
    for phrase, symptoms in SYMPTOM_NLP_MAP.items():
        if phrase in lower:
            found.update(symptoms)
    return list(found)

def run_prediction(symptoms: List[str]) -> Optional[Dict]:
    """Run ML prediction for given symptom list."""
    if ml_pipeline is None or not symptoms:
        return None
    input_data = {feat: [0.0] for feat in feature_names}
    for s in symptoms:
        if s in input_data:
            input_data[s] = [1.0]
    df = pd.DataFrame(input_data).astype(float)
    try:
        pred_idx = ml_pipeline.predict(df)[0]
        disease = label_encoder.inverse_transform([pred_idx])[0]
        probs = ml_pipeline.predict_proba(df)[0]
        confidence = float(probs[pred_idx])
        return {"disease": str(disease), "confidence": confidence}
    except Exception:
        return None

def build_rag_response(user_message: str, history: List[Dict]) -> Dict:
    """Core RAG logic: extract symptoms → predict → enrich with KB → generate response."""
    lower = user_message.lower().strip()

    # Check general QA first
    for key, answer in GENERAL_HEALTH_QA.items():
        if key in lower:
            return {"type": "general", "message": answer, "prediction": None, "symptoms_found": []}

    # Extract symptoms
    symptoms = extract_symptoms_from_text(user_message)

    # Also carry forward symptoms from recent history (last 3 turns)
    for turn in history[-3:]:
        if turn.get("role") == "user":
            symptoms += extract_symptoms_from_text(turn.get("content", ""))
    symptoms = list(set(symptoms))

    if not symptoms:
        # No symptoms detected — ask clarifying question
        return {
            "type": "clarify",
            "message": (
                "I didn't detect specific symptoms in your message. Could you describe:\n\n"
                "• What symptoms are you experiencing?\n"
                "• How long have you had them?\n"
                "• Any other discomfort?\n\n"
                "For example: 'I have fever, headache and fatigue for 2 days.'"
            ),
            "prediction": None,
            "symptoms_found": [],
        }

    # Run prediction
    result = run_prediction(symptoms)
    if not result:
        return {
            "type": "error",
            "message": "I detected symptoms but couldn't run the prediction model. Please ensure the backend is running.",
            "prediction": None,
            "symptoms_found": symptoms,
        }

    disease = result["disease"]
    confidence = result["confidence"]
    kb = DISEASE_KB.get(disease, {})
    precautions = kb.get("precautions", ["Consult a doctor for proper diagnosis"])
    specialist = kb.get("specialist", "General Physician")
    urgency = kb.get("urgency", "medium")

    urgency_msg = {
        "critical": "🚨 CRITICAL — Seek emergency care immediately.",
        "high":     "⚠️ HIGH — Please consult a doctor as soon as possible.",
        "medium":   "🔶 MODERATE — Schedule a doctor visit soon.",
        "low":      "🟢 LOW — Monitor symptoms; see a doctor if they worsen.",
    }.get(urgency, "")

    symptom_labels = [s.replace("_", " ") for s in symptoms]

    message = (
        f"Based on your symptoms ({', '.join(symptom_labels)}), here's my analysis:\n\n"
        f"🔍 Predicted Condition: {disease}\n"
        f"📊 Confidence: {round(confidence * 100)}%\n"
        f"🏥 Recommended Specialist: {specialist}\n"
        f"{urgency_msg}\n\n"
        f"📋 Precautions:\n" + "\n".join(f"  • {p}" for p in precautions) +
        "\n\n⚠️ This is an AI prediction — not a medical diagnosis. Please consult a healthcare professional."
    )

    return {
        "type": "prediction",
        "message": message,
        "prediction": {
            "disease": disease,
            "confidence": round(confidence * 100),
            "specialist": specialist,
            "urgency": urgency,
            "precautions": precautions,
        },
        "symptoms_found": symptom_labels,
    }


# ── Request / Response Models ─────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    symptoms: Dict[str, int]

class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.post("/predict")
def predict(request: PredictionRequest):
    if ml_pipeline is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    input_data = {feat: [0.0] for feat in feature_names}
    for symptom, value in request.symptoms.items():
        if symptom in input_data:
            input_data[symptom] = [float(value)]
    df_input = pd.DataFrame(input_data).astype(float)
    try:
        pred_idx = ml_pipeline.predict(df_input)[0]
        disease = label_encoder.inverse_transform([pred_idx])[0]
        probs = ml_pipeline.predict_proba(df_input)[0]
        return {"prediction": str(disease), "confidence": float(probs[pred_idx])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")


@app.post("/chat")
def chat(request: ChatRequest):
    """RAG-powered conversational medical assistant endpoint."""
    history = [{"role": m.role, "content": m.content} for m in request.history]
    result = build_rag_response(request.message, history)
    return result


@app.get("/symptoms")
def get_symptoms():
    """Return all known symptom names for frontend autocomplete."""
    if feature_names is None:
        return {"symptoms": list(SYMPTOM_NLP_MAP.keys())}
    return {"symptoms": list(feature_names)}


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": ml_pipeline is not None}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
