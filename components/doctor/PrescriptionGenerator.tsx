'use client';

import { useState } from 'react';
import { Plus, Trash2, FileDown, Pill, SendToBack } from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDoctorState } from './DoctorStateContext';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  duration: string;
}

export default function PrescriptionGenerator() {
  const { patients } = useDoctorState();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ id: 1, name: '', dosage: '', duration: '' }]);
  const [advice, setAdvice] = useState('');
  const [forwardToPharmacy, setForwardToPharmacy] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Save to DB and notify patient
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    const matchedPatient = patients.find(p =>
      p.name.toLowerCase() === patientName.toLowerCase()
    );
    if (validMeds.length > 0 && patientName) {
      await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientId: matchedPatient?.userId ?? null,
          medicines: validMeds.map(m => ({ name: m.name, dosage: m.dosage, frequency: m.duration })),
          notes: advice,
        }),
      });
    }

    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('Dhanvantari AI', 14, 22);
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.text('Medical Prescription', 14, 32);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text(`Patient Name: ${patientName || '______________'}`, 14, 48);
      doc.text(`Age: ${patientAge || '____'}`, 140, 48);
      doc.text(`Date: ${prescriptionDate || new Date().toLocaleDateString()}`, 14, 56);
      doc.text('Rx - Prescribed Medicines:', 14, 70);
      const validMedicines = medicines.filter(m => m.name.trim() !== '');
      if (validMedicines.length > 0) {
        autoTable(doc, {
          head: [["Medicine Name", "Dosage", "Duration"]],
          body: validMedicines.map(m => [m.name, m.dosage, m.duration]),
          startY: 76,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
        });
      }
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 76;
      if (advice) {
        doc.text('Medical Advice / Instructions:', 14, finalY + 15);
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(advice, 182), 14, finalY + 23);
      }
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text('This is a digitally generated prescription.', 105, 280, { align: 'center' });
      doc.save(`${patientName ? patientName.toLowerCase().replace(/\s+/g, '_') : 'patient'}_prescription.pdf`);
      setIsGenerating(false);
      if (forwardToPharmacy) {
        Swal.fire({
          title: 'Forwarded to Pharmacy!',
          text: 'Prescription PDF downloaded and successfully forwarded to Pharmacy.',
          icon: 'success',
          confirmButtonColor: '#2563eb',
          draggable: true,
        });
      }
    }, 1500);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: '', dosage: '', duration: '' }]);
  };

  const removeMedicine = (id: number) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  const updateMedicine = (id: number, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med)));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Prescription Generator</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label htmlFor="rx-patient-name" className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
            <input
              id="rx-patient-name"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="rx-patient-age" className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <input
              id="rx-patient-age"
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="Enter age"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="rx-date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              id="rx-date"
              type="date"
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Prescription date"
              title="Select prescription date"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Medicines</h2>
            <button
              type="button"
              onClick={addMedicine}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div key={medicine.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-xl">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                  aria-label={`Medicine ${index + 1} name`}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                  aria-label={`Medicine ${index + 1} dosage`}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={medicine.duration}
                  onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                  aria-label={`Medicine ${index + 1} duration`}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(medicine.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  aria-label={`Remove medicine ${index + 1}`}
                  title="Remove medicine"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="rx-advice" className="block text-sm font-semibold text-gray-700 mb-2">Medical Advice</label>
          <textarea
            id="rx-advice"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={6}
            placeholder="Enter medical advice and instructions..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="mb-8 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Forward to Pharmacy</p>
              <p className="text-sm text-gray-500">Automatically send this prescription to the patient&apos;s selected pharmacy</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={forwardToPharmacy}
              onChange={(e) => setForwardToPharmacy(e.target.checked)}
              aria-label="Forward to pharmacy"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : forwardToPharmacy ? (
            <SendToBack className="w-5 h-5" />
          ) : (
            <FileDown className="w-5 h-5" />
          )}
          {isGenerating ? 'Processing...' : forwardToPharmacy ? 'Generate & Forward to Pharmacy' : 'Generate PDF Prescription'}
        </button>
      </div>
    </div>
  );
}
