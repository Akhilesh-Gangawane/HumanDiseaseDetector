'use client';

import { Stethoscope, Pill, FlaskConical, BookOpen } from 'lucide-react';
import { HexagonPattern } from '@/components/ui/BackgroundPatterns';
import { useRouter } from 'next/navigation';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
  backgroundImage?: string;
  onClick?: () => void;
}

function ServiceCard({ icon, title, features, backgroundImage, onClick }: ServiceCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group rounded-3xl shadow-lg border border-white/20 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      )}
      {/* Overlay for readability - no blur */}
      <div className="absolute inset-0 bg-white/40"></div>
      
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10">{title}</h3>
      <ul className="space-y-3 relative z-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center space-x-2 text-gray-600">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ServicesSection() {
  const router = useRouter();

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 text-blue-500">
        <HexagonPattern />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon={<Stethoscope className="w-8 h-8 text-white" />}
            title="Consult Doctor"
            features={[
              'Book appointments',
              'Video consultation',
              'Chat with doctors'
            ]}
            backgroundImage="/OPD.png"
            onClick={() => router.push('/consult-doctor')}
          />

          <ServiceCard
            icon={<Pill className="w-8 h-8 text-white" />}
            title="Buy Medicine"
            features={[
              'Search medicines',
              'View details',
              'Order online'
            ]}
            backgroundImage="/medicine.png"
            onClick={() => router.push('/buy-medicine')}
          />

          <ServiceCard
            icon={<FlaskConical className="w-8 h-8 text-white" />}
            title="Pathology Services"
            features={[
              'Book lab tests',
              'View reports',
              'Track status'
            ]}
            backgroundImage="/Microscope.png"
            onClick={() => router.push('/pathology')}
          />

          <ServiceCard
            icon={<BookOpen className="w-8 h-8 text-white" />}
            title="Knowledge Center"
            features={[
              'Medical articles',
              'Disease information',
              'AI-generated insights'
            ]}
            backgroundImage="/knowloged.jpg"
            onClick={() => router.push('/knowledge-center')}
          />
        </div>
      </div>
    </section>
  );
}
