'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Share2, Loader2, Pill } from 'lucide-react';
import { useDoctorState } from './DoctorStateContext';

interface PrescriptionMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
}

interface Prescription {
  id: string;
  patient_name: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  issued_date?: string;
}

export default function MedicineReview() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/prescriptions')
      .then(r => r.json())
      .then(d => setPrescriptions(d.prescriptions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Medicine Review</h1>
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-600">No prescriptions issued yet</p>
          <p className="text-sm text-gray-400 mt-1">Prescriptions you generate will appear here for review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Medicine Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{rx.patient_name}</h2>
              {rx.issued_date && (
                <span className="text-xs text-gray-400">{rx.issued_date}</span>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {rx.medicines.map((med, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    {med.dosage && <span>Dosage: {med.dosage}</span>}
                    {med.frequency && <span>Frequency: {med.frequency}</span>}
                  </div>
                </div>
              ))}
            </div>

            {rx.notes && (
              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Notes</h3>
                <p className="text-blue-800 text-sm">{rx.notes}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <FileText className="w-4 h-4" />
                Add Note
              </button>
              <button
                type="button"
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
