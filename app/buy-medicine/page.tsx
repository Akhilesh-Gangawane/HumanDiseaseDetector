'use client';

import { useState } from 'react';
import MedicineScroll from '@/components/patient/MedicineScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import { Pill, Search, ShoppingCart, Package, Clock, CheckCircle } from 'lucide-react';

export default function BuyMedicinePage() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <MedicineScroll onScrollComplete={() => setShowDashboard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <PatientNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Buy Medicine Online</h1>
        <p className="text-gray-600 mb-8">Order genuine medicines with fast delivery</p>
        
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for medicines, health products..."
              className="w-full px-6 py-4 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Order Medicines</h3>
            <p className="text-gray-600 mb-4">Browse and order from our catalog</p>
            <button type="button" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Catalog
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Track Orders</h3>
            <p className="text-gray-600 mb-4">Check your order status</p>
            <button type="button" className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              Track Now
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Order History</h3>
            <p className="text-gray-600 mb-4">View past orders</p>
            <button type="button" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Popular Medicines */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Medicines</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Paracetamol 500mg', category: 'Pain Relief', price: '$5.99', inStock: true },
              { name: 'Amoxicillin 250mg', category: 'Antibiotic', price: '$12.99', inStock: true },
              { name: 'Ibuprofen 400mg', category: 'Pain Relief', price: '$7.99', inStock: true },
              { name: 'Cetirizine 10mg', category: 'Allergy', price: '$8.99', inStock: false },
              { name: 'Omeprazole 20mg', category: 'Digestive', price: '$10.99', inStock: true },
              { name: 'Vitamin D3 1000IU', category: 'Supplement', price: '$15.99', inStock: true },
            ].map((medicine, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  {medicine.inStock && (
                    <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      In Stock
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{medicine.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{medicine.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">{medicine.price}</span>
                  <button 
                    type="button"
                    disabled={!medicine.inStock}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      medicine.inStock 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {medicine.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
