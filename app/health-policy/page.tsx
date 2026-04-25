'use client';

import { useState, useRef, useEffect } from 'react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import Footer from '@/components/patient/Footer';
import { Shield, FileText, Heart, Users, Lock, CheckCircle, ArrowLeft, Award, Clock, Phone, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InsurancePlan {
  id: string;
  name: string;
  price_per_year: number;
  coverage_amount: number;
  is_popular: boolean;
  features: string[];
}

export default function HealthPolicyPage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetch('/api/public/insurance-plans')
      .then(r => r.json())
      .then(d => setPlans(d.plans ?? []))
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      {/* Hero Section with Mouse Animation */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 pt-32 pb-20"
      >
        {/* Mouse-controlled floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: `translate(-50%, -50%) scale(${1 + mousePosition.y * 0.3})`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl transition-all duration-700 ease-out"
          style={{
            left: `${(1 - mousePosition.x) * 100}%`,
            top: `${(1 - mousePosition.y) * 100}%`,
            transform: `translate(-50%, -50%) scale(${1 + mousePosition.x * 0.3})`,
          }}
        />
        
        {/* Floating medical icons */}
        <div 
          className="absolute transition-all duration-500 ease-out opacity-20"
          style={{
            left: `${20 + mousePosition.x * 10}%`,
            top: `${30 + mousePosition.y * 10}%`,
            transform: `rotate(${mousePosition.x * 20}deg)`,
          }}
        >
          <Shield className="w-16 h-16 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-700 ease-out opacity-20"
          style={{
            right: `${15 + mousePosition.x * 10}%`,
            top: `${40 + mousePosition.y * 15}%`,
            transform: `rotate(${-mousePosition.y * 20}deg)`,
          }}
        >
          <Heart className="w-20 h-20 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-600 ease-out opacity-20"
          style={{
            left: `${60 + mousePosition.y * 10}%`,
            bottom: `${20 + mousePosition.x * 10}%`,
            transform: `rotate(${mousePosition.y * 15}deg)`,
          }}
        >
          <FileText className="w-14 h-14 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 transition-transform duration-300"
              style={{
                transform: `translateY(${mousePosition.y * -10}px)`,
              }}
            >
              Health Insurance Policy
              <span className="block text-emerald-200">Your Health, Our Commitment</span>
            </h1>
            <p 
              className="text-xl text-cyan-100 mb-8 max-w-3xl mx-auto transition-transform duration-500"
              style={{
                transform: `translateY(${mousePosition.y * -5}px)`,
              }}
            >
              Comprehensive health insurance plans designed to protect you and your family. Get coverage for medical expenses, hospitalization, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white">
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">100% Coverage</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-400 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Award className="w-5 h-5" />
                <span className="font-medium">Cashless Claims</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Back to Home</span>
        </button>

        {/* Policy Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <Shield size={32} />,
              title: 'Comprehensive Coverage',
              description: 'Full medical coverage including hospitalization, surgery, and emergency care',
              color: 'emerald'
            },
            {
              icon: <Award size={32} />,
              title: 'Cashless Treatment',
              description: 'Network of 10,000+ hospitals for hassle-free cashless treatment',
              color: 'teal'
            },
            {
              icon: <Users size={32} />,
              title: 'Family Protection',
              description: 'Cover your entire family under one comprehensive policy',
              color: 'cyan'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4 text-${feature.color}-600`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Policy Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Choose Your Plan</h2>
          {loadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, i) => {
                const colorMap = ['blue', 'emerald', 'teal'];
                const color = colorMap[i % colorMap.length];
                return (
                  <div 
                    key={plan.id} 
                    className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                      plan.is_popular ? 'border-2 border-emerald-500 transform scale-105' : 'border border-gray-200'
                    }`}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800">
                        ₹{plan.price_per_year.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-600">/year</span>
                    </div>
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Coverage up to</span>
                      <div className="text-2xl font-bold text-emerald-600">
                        ₹{(plan.coverage_amount / 100000).toFixed(0)} Lakhs
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {(plan.features ?? []).map((feature, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      type="button"
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        plan.is_popular
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coverage Details */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What's Covered</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Hospitalization', items: ['Room rent', 'ICU charges', 'Doctor fees', 'Nursing expenses'] },
              { title: 'Medical Procedures', items: ['Surgery costs', 'Diagnostic tests', 'Medicines', 'Medical equipment'] },
              { title: 'Pre & Post Care', items: ['60 days pre-hospitalization', '90 days post-hospitalization', 'Follow-up consultations', 'Medications'] },
              { title: 'Additional Benefits', items: ['Ambulance service', 'Organ donor expenses', 'Alternative treatments', 'Second opinion'] }
            ].map((section, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-gray-700 pl-7">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Health?</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Get instant quotes and compare plans. Our experts are available 24/7 to help you choose the right policy.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button type="button" className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-100 transition-colors font-bold flex items-center gap-2">
              <FileText size={20} />
              Get Free Quote
            </button>
            <button type="button" className="px-8 py-4 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-bold flex items-center gap-2">
              <Phone size={20} />
              Talk to Expert
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </NeuralNetworkContainer>
  );
}
