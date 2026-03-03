'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const predictions = [
  {
    id: 1,
    patient: 'John Doe',
    disease: 'Diabetes Type 2',
    confidence: 94,
    symptoms: ['Fatigue', 'Increased thirst', 'Frequent urination', 'Blurred vision'],
    explanation:
      'Based on the symptoms and patient history, the AI model predicts Type 2 Diabetes with high confidence. Key indicators include elevated glucose levels and metabolic markers.',
  },
  {
    id: 2,
    patient: 'Emma Wilson',
    disease: 'Hypertension',
    confidence: 87,
    symptoms: ['Headache', 'Dizziness', 'Chest pain', 'Shortness of breath'],
    explanation:
      'The AI analysis indicates hypertension based on blood pressure readings and associated symptoms. Lifestyle factors and family history support this prediction.',
  },
];

export default function AIPredictionReview() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Prediction Review</h1>

      <div className="space-y-6">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {prediction.disease}
                </h2>
                <p className="text-gray-600">Patient: {prediction.patient}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Confidence Score</span>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {prediction.confidence}%
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Symptoms Submitted</h3>
              <div className="flex flex-wrap gap-2">
                {prediction.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">AI Explanation</h3>
              <p className="text-gray-700">{prediction.explanation}</p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <CheckCircle className="w-5 h-5" />
                Approve Recommendation
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <XCircle className="w-5 h-5" />
                Modify Recommendation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
