'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Loader2, Search } from 'lucide-react';
import { useDoctorState } from './DoctorStateContext';
import standardSymptomsData from '../../lib/symptoms.json';

const standardSymptoms = standardSymptomsData as string[];

export default function AIPredictionReview() {
  const { predictions, setPredictions, addNotification } = useDoctorState();
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');

  const filteredSymptoms = standardSymptoms.filter(s =>
    s.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  const toggleSymptom = (s: string) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter(sym => sym !== s));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || selectedSymptoms.length === 0) return;

    setLoading(true);
    try {
      const symDict: Record<string, number> = {};
      selectedSymptoms.forEach(s => symDict[s] = 1);

      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symDict })
      });

      const data = await res.json();
      if (data.prediction) {
        const newPrediction = {
          id: Date.now(),
          patient: patientName,
          disease: data.prediction,
          confidence: data.confidence || 85,
          symptoms: selectedSymptoms,
          explanation: `Prediction based on ${selectedSymptoms.length} reported symptoms`,
          status: 'Pending' as const
        };
        setPredictions([newPrediction, ...predictions]);
        addNotification({ title: 'New Prediction', message: `Prediction ready for ${patientName}`, type: 'system' });
      }
    } catch {
      const demoPrediction = {
        id: Date.now(),
        patient: patientName,
        disease: 'Infection (Local Demo)',
        confidence: 82,
        symptoms: selectedSymptoms,
        explanation: `Fallback Local Prediction based on ${selectedSymptoms.length} symptoms`,
        status: 'Pending' as const
      };
      setPredictions([demoPrediction, ...predictions]);
      addNotification({ title: 'New Prediction (Demo)', message: `Demo prediction for ${patientName}`, type: 'system' });
    } finally {
      setIsPredicting(false);
      setPatientName('');
      setSelectedSymptoms([]);
      setLoading(false);
    }
  };

  const updatePredictionStatus = (id: number, status: 'Approved' | 'Modified') => {
    setPredictions(predictions.map(p => p.id === id ? { ...p, status } : p));
    if (status === 'Approved') {
      const p = predictions.find(p => p.id === id);
      addNotification({ title: 'Prediction Approved', message: `You approved the prediction for ${p?.patient}`, type: 'system' });
    } else if (status === 'Modified') {
      const p = predictions.find(p => p.id === id);
      if (p) {
        setPatientName(p.patient);
        setSelectedSymptoms(p.symptoms);
        setIsPredicting(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Prediction Review</h1>
        <button
          type="button"
          onClick={() => setIsPredicting(!isPredicting)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          {isPredicting ? 'Cancel Prediction' : <><Plus className="w-5 h-5" /> Make New Prediction</>}
        </button>
      </div>

      {isPredicting && (
        <form onSubmit={handlePredict} className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Run AI Health Analysis</h2>
          <div className="mb-4">
            <label htmlFor="ai-patient-name" className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
            <input
              id="ai-patient-name"
              type="text"
              required
              placeholder="Enter patient name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Symptoms ({selectedSymptoms.length} selected)
            </label>
            <div className="relative mb-3 md:w-1/2">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search standard symptoms..."
                value={symptomSearch}
                onChange={(e) => setSymptomSearch(e.target.value)}
                aria-label="Search symptoms"
                className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-wrap gap-2">
              {filteredSymptoms.map(symptom => (
                <label key={symptom} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-colors border ${selectedSymptoms.includes(symptom) ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{symptom}</span>
                </label>
              ))}
              {filteredSymptoms.length === 0 && (
                <div className="text-gray-500 py-4 w-full text-center">No matching symptoms found.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || selectedSymptoms.length === 0 || !patientName}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Generate Prediction
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{prediction.disease}</h2>
                  {prediction.status !== 'Pending' && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${prediction.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {prediction.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">Patient: {prediction.patient}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Confidence Score</span>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{prediction.confidence}%</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Symptoms Submitted</h3>
              <div className="flex flex-wrap gap-2">
                {prediction.symptoms?.map((symptom, index) => (
                  <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {prediction.status === 'Pending' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => updatePredictionStatus(prediction.id, 'Approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Recommendation
                </button>
                <button
                  type="button"
                  onClick={() => updatePredictionStatus(prediction.id, 'Modified')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <XCircle className="w-5 h-5" />
                  Modify Recommendation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
