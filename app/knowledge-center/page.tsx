'use client';

import { useState } from 'react';
import KnowledgeScroll from '@/components/patient/KnowledgeScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import { BookOpen, Brain, Heart, Pill, Activity, Search } from 'lucide-react';

export default function KnowledgeCenterPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <KnowledgeScroll onScrollComplete={() => setShowDashboard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <PatientNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Knowledge Center</h1>
        <p className="text-gray-600 mb-8">Explore comprehensive medical information and health articles</p>
        
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for diseases, symptoms, treatments..."
              className="w-full px-6 py-4 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Cardiology</h3>
            <p className="text-sm text-gray-600 mt-2">Heart health & diseases</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Neurology</h3>
            <p className="text-sm text-gray-600 mt-2">Brain & nervous system</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Pill className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Medications</h3>
            <p className="text-sm text-gray-600 mt-2">Drug information & usage</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Wellness</h3>
            <p className="text-sm text-gray-600 mt-2">Healthy lifestyle tips</p>
          </div>
        </div>

        {/* Featured Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Understanding Diabetes',
                category: 'Endocrinology',
                readTime: '5 min read',
                description: 'Learn about types, symptoms, and management of diabetes'
              },
              {
                title: 'Heart Health Tips',
                category: 'Cardiology',
                readTime: '4 min read',
                description: 'Essential tips for maintaining a healthy heart'
              },
              {
                title: 'Mental Wellness Guide',
                category: 'Psychology',
                readTime: '6 min read',
                description: 'Strategies for better mental health and well-being'
              },
              {
                title: 'Nutrition Basics',
                category: 'Nutrition',
                readTime: '7 min read',
                description: 'Complete guide to balanced diet and nutrition'
              },
              {
                title: 'Exercise & Fitness',
                category: 'Wellness',
                readTime: '5 min read',
                description: 'Effective workout routines for all fitness levels'
              },
              {
                title: 'Sleep Disorders',
                category: 'Sleep Medicine',
                readTime: '6 min read',
                description: 'Understanding and treating common sleep problems'
              },
            ].map((article, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">{article.category}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{article.description}</p>
                <button type="button" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Read More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
