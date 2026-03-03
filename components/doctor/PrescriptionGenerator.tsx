'use client';

import { useState } from 'react';
import { Plus, Trash2, FileDown } from 'lucide-react';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  duration: string;
}

export default function PrescriptionGenerator() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: '', dosage: '', duration: '' },
  ]);
  const [advice, setAdvice] = useState('');

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: '', dosage: '', duration: '' }]);
  };

  const removeMedicine = (id: number) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  const updateMedicine = (id: number, field: keyof Medicine, value: string) => {
    setMedicines(
      medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Prescription Generator</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient Name
            </label>
            <input
              type="text"
              placeholder="Enter patient name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <input
              type="number"
              placeholder="Enter age"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Prescription date"
              title="Select prescription date"
            />
          </div>
        </div>

        {/* Medicines */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Medicines</h2>
            <button
              onClick={addMedicine}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-xl"
              >
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={medicine.duration}
                  onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeMedicine(medicine.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  aria-label="Remove medicine"
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Medical Advice
          </label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={6}
            placeholder="Enter medical advice and instructions..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Generate Button */}
        <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
          <FileDown className="w-5 h-5" />
          Generate PDF Prescription
        </button>
      </div>
    </div>
  );
}
