'use client';

import { ArrowRight, Stethoscope, Brain, Activity } from 'lucide-react';
import { PulsePattern } from '@/components/ui/BackgroundPatterns';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 text-blue-400">
        <PulsePattern />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">AI-Powered Healthcare Platform</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
                AI-Powered Medical Disease Prediction
              </span>
              <br />
              <span className="text-gray-800">and Smart Healthcare Assistant</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Leveraging artificial intelligence to provide early disease detection, personalized health insights, 
              and intelligent medical support for better healthcare outcomes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>Start Prediction</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-600 rounded-xl font-semibold border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                Consult Doctor
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">50K+</div>
                <div className="text-sm text-gray-600">Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Medical AI Illustration */}
          <div className="relative">
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* Central brain/head illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Brain className="w-40 h-40 text-blue-500" />
                  
                  {/* Floating medical icons */}
                  <div className="absolute top-10 left-10 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center animate-float">
                    <Activity className="w-8 h-8 text-teal-500" />
                  </div>
                  
                  <div className="absolute top-20 right-10 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center animate-float-delayed">
                    <Stethoscope className="w-8 h-8 text-blue-500" />
                  </div>
                  
                  <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center animate-float">
                    <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center animate-float-delayed">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
