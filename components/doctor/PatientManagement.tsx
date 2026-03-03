'use client';

import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import ProgressBar from './ProgressBar';

const patients = [
  {
    id: 1,
    name: 'John Doe',
    age: 45,
    symptoms: 'Fatigue, Increased thirst',
    disease: 'Diabetes Type 2',
    confidence: 94,
    risk: 'High',
  },
  {
    id: 2,
    name: 'Emma Wilson',
    age: 32,
    symptoms: 'Headache, Dizziness',
    disease: 'Hypertension',
    confidence: 87,
    risk: 'Medium',
  },
  {
    id: 3,
    name: 'Michael Brown',
    age: 58,
    symptoms: 'Chest pain, Shortness of breath',
    disease: 'Heart Disease',
    confidence: 92,
    risk: 'High',
  },
  {
    id: 4,
    name: 'Sarah Davis',
    age: 28,
    symptoms: 'Cough, Fever',
    disease: 'Respiratory Infection',
    confidence: 78,
    risk: 'Low',
  },
  {
    id: 5,
    name: 'Robert Johnson',
    age: 51,
    symptoms: 'Joint pain, Stiffness',
    disease: 'Arthritis',
    confidence: 85,
    risk: 'Medium',
  },
];

export default function PatientManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'All' || patient.risk === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Management</h1>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              aria-label="Filter by risk level"
              title="Filter by risk level"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Patient Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Age</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Symptoms</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">AI Predicted Disease</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Confidence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Risk Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{patient.age}</td>
                  <td className="px-6 py-4 text-gray-700">{patient.symptoms}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{patient.disease}</td>
                  <td className="px-6 py-4">
                    <ProgressBar value={patient.confidence} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                        patient.risk
                      )}`}
                    >
                      {patient.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
