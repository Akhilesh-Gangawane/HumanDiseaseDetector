'use client';

import { CheckCircle, FileText, Share2 } from 'lucide-react';

const medicines = [
  {
    id: 1,
    name: 'Metformin XR 500mg',
    composition: 'Metformin Hydrochloride',
    usage: 'Oral, twice daily with meals',
    sideEffects: 'Nausea, diarrhea, stomach upset',
    research:
      'Extensively studied for Type 2 Diabetes management. Shows 25% reduction in HbA1c levels with minimal side effects.',
  },
  {
    id: 2,
    name: 'Lisinopril 10mg',
    composition: 'Lisinopril (ACE Inhibitor)',
    usage: 'Oral, once daily',
    sideEffects: 'Dry cough, dizziness, headache',
    research:
      'Proven effective for hypertension and heart failure. Reduces cardiovascular events by 20% in clinical trials.',
  },
];

export default function MedicineReview() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Medicine Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {medicines.map((medicine) => (
          <div key={medicine.id} className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{medicine.name}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Composition</h3>
                <p className="text-gray-900">{medicine.composition}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Usage</h3>
                <p className="text-gray-900">{medicine.usage}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Side Effects</h3>
                <p className="text-gray-900">{medicine.sideEffects}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Research Summary</h3>
                <p className="text-blue-800 text-sm">{medicine.research}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <FileText className="w-4 h-4" />
                Add Note
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                aria-label="Share with colleague"
                title="Share with colleague"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
