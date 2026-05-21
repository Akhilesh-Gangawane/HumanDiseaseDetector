'use client';

import PatientNavbar from '@/components/patient/PatientNavbar';
import OrdersBookings from '@/components/patient/OrdersBookings';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import { ArrowLeft, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Package className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              My Medicine Orders
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Manage your medicine purchases, track deliveries, and keep your prescription history up to date
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => router.push('/patient-dashboard')}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
        </button>
      </div>

      <OrdersBookings />

      <Footer />
    </NeuralNetworkContainer>
  );
}
