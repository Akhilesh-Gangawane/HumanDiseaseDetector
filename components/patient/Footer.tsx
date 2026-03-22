'use client';

import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                <Activity size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Dhanvantari</span>
            </div>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              Your trusted AI-powered healthcare partner — providing intelligent medical services and clinical support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Doctors', 'Lab Tests', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-blue-200/70 hover:text-white transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-4">Services</h3>
            <ul className="space-y-2">
              {['Consult Doctor', 'Pathology Tests', 'Buy Medicine', 'AI Predictions', 'Telemedicine'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-blue-200/70 hover:text-white transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-blue-200/70 text-sm">
                <Phone size={15} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <span>1800-123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-blue-200/70 text-sm">
                <Mail size={15} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <span>support@dhanvantari.ai</span>
              </li>
              <li className="flex items-start gap-2 text-blue-200/70 text-sm">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <span>123 Healthcare Street, Medical District, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-200/50 text-sm">
            © {new Date().getFullYear()} Dhanvantari AI. All rights reserved.
          </p>
          <div className="flex gap-3">
            {[
              { icon: <Facebook size={16} />, href: '#' },
              { icon: <Twitter size={16} />, href: '#' },
              { icon: <Instagram size={16} />, href: '#' },
              { icon: <Linkedin size={16} />, href: '#' },
            ].map((social, i) => (
              <Link
                key={i}
                href={social.href}
                className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-teal-500 rounded-lg flex items-center justify-center transition-all duration-300"
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
