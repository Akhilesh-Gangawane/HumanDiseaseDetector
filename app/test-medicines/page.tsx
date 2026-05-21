'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function TestMedicinesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing sync API...');
      const response = await fetch('/api/medicines/sync', { method: 'POST' });
      const data = await response.json();
      console.log('Sync response:', data);
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing fetch API...');
      const response = await fetch('/api/public/medicines');
      const data = await response.json();
      console.log('Fetch response:', data);
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Fetch failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Medicine API Test Page
          </h1>

          <div className="space-y-4 mb-8">
            <button
              onClick={testSync}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Test Sync API (POST /api/medicines/sync)</span>
                </>
              )}
            </button>

            <button
              onClick={testFetch}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Test Fetch API (GET /api/public/medicines)</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-800 mb-2">Success!</h3>
                  {result.count !== undefined && (
                    <p className="text-green-700 mb-2">
                      <strong>Count:</strong> {result.count} medicines
                    </p>
                  )}
                  {result.message && (
                    <p className="text-green-700 mb-2">
                      <strong>Message:</strong> {result.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 overflow-auto max-h-96">
                <h4 className="font-semibold text-gray-800 mb-2">Full Response:</h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.medicines && result.medicines.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Sample Medicines ({result.medicines.length} total):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.medicines.slice(0, 6).map((med: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="font-semibold text-gray-800">{med.name}</div>
                        <div className="text-sm text-gray-600">{med.category}</div>
                        <div className="text-sm font-bold text-green-600">₹{med.price}</div>
                      </div>
                    ))}
                  </div>
                  {result.medicines.length > 6 && (
                    <p className="text-sm text-gray-500 mt-2">
                      ...and {result.medicines.length - 6} more medicines
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Click "Test Sync API" to add medicines to database</li>
              <li>Click "Test Fetch API" to retrieve medicines from database</li>
              <li>Check the results below</li>
              <li>Open browser console (F12) for detailed logs</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/buy-medicine"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Go to Buy Medicine Page →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
