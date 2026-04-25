'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, MessageSquare, X } from 'lucide-react';
import ChatAssistant from './ChatAssistant';
import { ScrollLock } from '@/hooks/useScrollLock';

export default function FeatureCards() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {/* Feature Cards Grid */}
      <section className="relative py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Disease Prediction Card */}
            <div
              onClick={() => router.push('/disease-prediction')}
              className="group cursor-pointer backdrop-blur-xl bg-white/60 rounded-3xl shadow-xl border border-white/30 p-12 hover:shadow-2xl hover:scale-105 hover:bg-white/80 hover:border-blue-300 transition-all duration-500"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Disease Prediction</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  Get AI-powered disease predictions based on your symptoms with instant analysis
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Start Prediction
                </button>
              </div>
            </div>

            {/* AI Medical Assistant Card */}
            <div
              onClick={() => setShowChat(true)}
              className="group cursor-pointer backdrop-blur-xl bg-white/60 rounded-3xl shadow-xl border border-white/30 p-12 hover:shadow-2xl hover:scale-105 hover:bg-white/80 hover:border-teal-300 transition-all duration-500"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300">AI Medical Assistant</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  Chat with our intelligent medical assistant for health advice and medical information
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Assistant Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <ScrollLock />
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
