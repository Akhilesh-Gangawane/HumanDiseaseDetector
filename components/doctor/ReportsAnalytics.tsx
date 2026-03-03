'use client';

import { BarChart3, TrendingUp, Activity } from 'lucide-react';

const diseaseData = [
  { disease: 'Diabetes', count: 245, color: 'bg-blue-500' },
  { disease: 'Hypertension', count: 198, color: 'bg-purple-500' },
  { disease: 'Heart Disease', count: 156, color: 'bg-red-500' },
  { disease: 'Respiratory', count: 134, color: 'bg-green-500' },
  { disease: 'Arthritis', count: 98, color: 'bg-orange-500' },
];

const weeklyData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 48 },
  { day: 'Thu', count: 61 },
  { day: 'Fri', count: 55 },
  { day: 'Sat', count: 38 },
  { day: 'Sun', count: 32 },
];

export default function ReportsAnalytics() {
  const maxCount = Math.max(...diseaseData.map((d) => d.count));
  const maxWeekly = Math.max(...weeklyData.map((d) => d.count));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      {/* AI Accuracy Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Prediction Accuracy</h2>
            <p className="text-blue-100">Based on 1,284 verified predictions</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold mb-2">92.4%</div>
            <div className="flex items-center gap-2 justify-end">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg">+2.3% this month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Diseases */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Most Common Diseases
          </h2>
          <div className="space-y-4">
            {diseaseData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.disease}</span>
                  <span className="font-bold text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Patient Count */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-500" />
            Weekly Patient Count
          </h2>
          <div className="flex items-end justify-between h-64 gap-4">
            {weeklyData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-48">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer relative group"
                    style={{ height: `${(item.count / maxWeekly) * 100}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
