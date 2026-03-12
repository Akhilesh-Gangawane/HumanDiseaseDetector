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

interface PredictionFormProps {
  onClose?: () => void;
}

export default function PredictionForm({ onClose }: PredictionFormProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 opacity-50">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative h-full max-h-[90vh] overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8 animate-fade-in">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800">AI Disease Prediction</h3>
                <p className="text-gray-600 text-sm mt-1">Powered by advanced machine learning</p>
              </div>
            </div>

            <div className="space-y-6">
        {/* API URL Configuration */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            API URL (optional)
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm"
          />
        </div>

        {/* Symptom Search */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search and Select Symptoms
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search symptoms..."
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-base"
            />
            {searchTerm && filteredSymptoms.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in">
                {filteredSymptoms.slice(0, 10).map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => addSymptom(symptom)}
                    className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 border-b border-gray-100 last:border-0"
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
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selected Symptoms ({selectedSymptoms.length})
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
              {selectedSymptoms.map((symptom, index) => (
                <span
                  key={symptom}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span>{symptom.replace(/_/g, ' ')}</span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    aria-label={`Remove ${symptom.replace(/_/g, ' ')}`}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3 animate-fade-in shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Predict Button */}
        <button
          type="button"
          onClick={handlePredict}
          disabled={loading || selectedSymptoms.length === 0}
          className="w-full px-8 py-5 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analyzing Symptoms...</span>
            </>
          ) : (
            <span>Predict Disease</span>
          )}
        </button>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-white to-teal-50 rounded-2xl border-2 border-blue-200 space-y-6 animate-scale-in shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-bold text-gray-800">Prediction Result</h4>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="space-y-5">
              <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Predicted Disease:</span>
                <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{prediction.prediction}</p>
              </div>
              
              <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Confidence Level:</span>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000 rounded-full shadow-lg"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-gray-800 min-w-[60px]">{prediction.confidence}%</span>
                </div>
              </div>
              
              <div className="p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-2 text-base">⚠️ Important Medical Disclaimer:</p>
                    <p className="leading-relaxed">This is an AI prediction and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
