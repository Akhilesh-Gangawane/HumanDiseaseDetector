'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, AlertCircle, CheckCircle2, X, Stethoscope, ArrowRight, ArrowLeft, Activity, Sparkles } from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';

// Common symptoms list
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

export default function DiseasePredictionPage() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');

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
      const symptomsDict: Record<string, number> = {};
      COMMON_SYMPTOMS.forEach(symptom => {
        symptomsDict[symptom] = selectedSymptoms.includes(symptom) ? 1 : 0;
      });

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
      
      setPrediction({
        prediction: data.prediction,
        confidence: Math.round(data.confidence * 100)
      });
    } catch (err) {
      let errorMessage = 'Failed to get prediction. ';
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage += `Cannot connect to API at ${apiUrl}. Please ensure the FastAPI server is running.`;
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

  const handleConsultDoctor = () => {
    router.push('/consult-doctor');
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
    setError(null);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <PatientNavbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/patient-dashboard')}
            className="mb-4 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">AI Disease Prediction</h1>
                <p className="text-gray-600 mt-1">Select your symptoms and get instant AI-powered analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Prediction Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Select Symptoms</h2>
              </div>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Symptom Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Symptoms
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search symptoms..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                  {searchTerm && filteredSymptoms.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Selected Symptoms {selectedSymptoms.length > 0 && `(${selectedSymptoms.length})`}
                </label>
                <div className="min-h-[120px] p-4 bg-gradient-to-br from-blue-50/50 to-teal-50/50 rounded-xl border-2 border-blue-100 max-h-48 overflow-y-auto">
                  {selectedSymptoms.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No symptoms selected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <span>{symptom.replace(/_/g, ' ')}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Predict Button */}
              <button
                type="button"
                onClick={handlePredict}
                disabled={loading || selectedSymptoms.length === 0}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Predict Disease</span>
                  </>
                )}
              </button>

              {/* API URL (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
                  Advanced Settings
                </summary>
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    API URL
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm"
                  />
                </div>
              </details>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Prediction Results</h2>
            </div>

            {!prediction && !loading && (
              <div className="flex flex-col items-center justify-center h-[500px] text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Prediction Yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">Select your symptoms and click "Predict Disease" to get AI-powered analysis</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Analyzing your symptoms...</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-teal-50 rounded-2xl border-2 border-blue-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Analysis Complete</h3>
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                  </div>
                  
                  <div className="p-5 bg-white rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Predicted Disease</span>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{prediction.prediction}</p>
                  </div>
                  
                  <div className="p-5 bg-white rounded-xl border border-blue-100">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confidence Level</span>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-gray-800 min-w-[60px]">{prediction.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-bold mb-1">⚠️ Medical Disclaimer</p>
                      <p className="leading-relaxed">This is an AI prediction and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleConsultDoctor}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 group"
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span>Consult a Doctor</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border-2 border-gray-200"
                  >
                    New Prediction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
