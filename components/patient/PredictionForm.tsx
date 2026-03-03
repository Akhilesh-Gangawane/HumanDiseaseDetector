'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

// Common symptoms list (you can expand this based on your model's features)
const COMMON_SYMPTOMS = [
  'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
  'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue',
  'muscle_wasting', 'vomiting', 'burning_micturition', 'spotting_urination', 'fatigue',
  'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss',
  'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough',
  'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
  'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
  'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain',
  'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure',
  'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision',
  'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose',
  'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
  'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
  'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes',
  'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts',
  'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness',
  'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements', 'loss_of_balance',
  'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine',
  'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)',
  'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
  'belly_pain', 'abnormal_menstruation', 'dischromic_patches', 'watering_from_eyes', 'increased_appetite',
  'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration',
  'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
  'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'fluid_overload',
  'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations', 'painful_walking',
  'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting',
  'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose',
  'yellow_crust_ooze'
];

interface PredictionResult {
  prediction: string;
  confidence: number;
}

export default function PredictionForm() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');

  // Filter symptoms based on search
  const filteredSymptoms = COMMON_SYMPTOMS.filter(symptom =>
    symptom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSymptoms.includes(symptom)
  );

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
      setSearchTerm('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Create symptoms dictionary with all symptoms set to 0, then set selected ones to 1
      const symptomsDict: Record<string, number> = {};
      COMMON_SYMPTOMS.forEach(symptom => {
        symptomsDict[symptom] = selectedSymptoms.includes(symptom) ? 1 : 0;
      });

      console.log('Sending request to:', `${apiUrl}/predict`);
      console.log('Selected symptoms:', selectedSymptoms);

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptomsDict
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prediction response:', data);
      
      setPrediction({
        prediction: data.prediction,
        confidence: Math.round(data.confidence * 100)
      });
    } catch (err) {
      console.error('Prediction error:', err);
      
      let errorMessage = 'Failed to get prediction. ';
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage += `Cannot connect to API at ${apiUrl}. Please ensure:\n1. The FastAPI server is running (python Model/app.py)\n2. The API URL is correct\n3. CORS is enabled on the backend`;
      } else if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/70 rounded-3xl shadow-xl border border-white/20 p-8 h-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">AI Disease Prediction</h3>
      </div>

      <div className="space-y-6">
        {/* API URL Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API URL (optional)
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Symptom Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search and Select Symptoms
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search symptoms..."
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && filteredSymptoms.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredSymptoms.slice(0, 10).map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => addSymptom(symptom)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-sm"
                  >
                    {symptom.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Symptoms ({selectedSymptoms.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <span>{symptom.replace(/_/g, ' ')}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    aria-label={`Remove ${symptom.replace(/_/g, ' ')}`}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Predict Button */}
        <button
          type="button"
          onClick={handlePredict}
          disabled={loading || selectedSymptoms.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Predict Disease</span>
          )}
        </button>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-800">Prediction Result</h4>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Predicted Disease:</span>
                <p className="text-xl font-bold text-blue-600">{prediction.prediction}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{prediction.confidence}%</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important Notice:</p>
                    <p>This is an AI prediction and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
