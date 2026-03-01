'use client';

import { useState } from 'react';
import { Brain, MessageSquare, X } from 'lucide-react';
import PredictionForm from './PredictionForm';
import ChatAssistant from './ChatAssistant';
import { BrainAIBackground, SecurityGridBackground } from './CardBackgrounds';

export default function FeatureCards() {
  const [showPrediction, setShowPrediction] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {/* Feature Cards Grid */}
      <section className="relative py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Disease Prediction Card */}
            <div
              onClick={() => setShowPrediction(true)}
              className="group cursor-pointer backdrop-blur-md bg-white/70 rounded-3xl shadow-xl border border-white/20 p-12 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Disease Prediction</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get AI-powered disease predictions based on your symptoms, age, and medical history
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Start Prediction
                </button>
              </div>
            </div>

            {/* AI Medical Assistant Card */}
            <div
              onClick={() => setShowChat(true)}
              className="group cursor-pointer backdrop-blur-md bg-white/70 rounded-3xl shadow-xl border border-white/20 p-12 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">AI Medical Assistant</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chat with our intelligent medical assistant for health advice and medical information
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Prediction Modal */}
      {showPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrediction(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <PredictionForm />
          </div>
        </div>
      )}

      {/* AI Chat Assistant Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl h-[90vh]">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <ChatAssistant />
          </div>
        </div>
      )}
    </>
  );
}
