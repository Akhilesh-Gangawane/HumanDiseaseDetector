'use client';

import { useRouter } from 'next/navigation';
import { Package, Pill, FlaskConical, Stethoscope, FileText, Bell } from 'lucide-react';

export default function QuickAccessButtons() {
  const router = useRouter();

  const quickActions = [
    {
      title: 'My Orders',
      description: 'Track your orders & bookings',
      icon: <Package className="w-6 h-6" />,
      color: 'from-blue-500 to-teal-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      route: '/patient-dashboard/orders',
      badge: null
    },
    {
      title: 'Buy Medicine',
      description: 'Order medicines online',
      icon: <Pill className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      route: '/buy-medicine',
      badge: null
    },
    {
      title: 'Book Lab Tests',
      description: 'Schedule pathology tests',
      icon: <FlaskConical className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      route: '/pathology',
      badge: null
    },
    {
      title: 'Consult Doctor',
      description: 'Book doctor appointments',
      icon: <Stethoscope className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      route: '/consult-doctor',
      badge: null
    },
    {
      title: 'Health Records',
      description: 'View doctor-shared records',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      route: '/patient-dashboard/records',
      badge: null
    },
    {
      title: 'Notifications',
      description: 'Updates from your doctor',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      route: '/patient-dashboard/notifications',
      badge: null
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quick Access</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your health journey with easy access to all your important services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              type="button"
              onClick={() => router.push(action.route)}
              className="group relative bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 text-left"
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {action.badge}
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={action.iconColor}>
                  {action.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {action.description}
              </p>

              {/* Arrow */}
              <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                <span>View Details</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} style={{ padding: '2px' }}>
                <div className="w-full h-full bg-white rounded-2xl"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Lab Tests Done</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Consultations</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 mb-1">98%</div>
            <div className="text-sm text-gray-600">Health Score</div>
          </div>
        </div>
      </div>
    </section>
  );
}
