'use client';

import { useState, useRef, useEffect } from 'react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import Footer from '@/components/patient/Footer';
import PathologyScroll from '@/components/patient/PathologyScroll';
import { BookingTimeSelector, BookingStatusTracker, QueueDisplay } from '@/components/patient/PathologyBookingSystem';
import Swal from 'sweetalert2';
import {
  FlaskConical, Calendar, FileText, Clock, ArrowLeft,
  Search, Star, Shield, Zap, HeartPulse,
  Microscope, TestTube, BarChart3, Download,
  CheckCircle, Users, Award, Phone, MapPin,
  Droplets, Activity, Beaker, ShoppingCart, X, Plus, Minus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Test {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  time: string;
  popular: boolean;
  color: string;
  description: string;
  preparation?: string;
  category: string;
}

interface Package {
  id: number;
  name: string;
  tests: number;
  price: number;
  originalPrice?: number;
  icon: JSX.Element;
  color: string;
  bg: string;
  testList: string[];
  description: string;
}

interface CartItem extends Test {
  quantity: number;
  type: 'test' | 'package';
}

interface BookingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  preferredDate: string;
  preferredTime: string;
}

interface PaymentDetails {
  method: 'card' | 'upi' | 'netbanking' | 'cod';
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  bank?: string;
}

interface Booking {
  bookingId: string;
  items: CartItem[];
  total: number;
  address: BookingAddress;
  payment: PaymentDetails;
  bookingDate: Date;
  sampleCollectionDate: Date;
  status: 'pending' | 'confirmed' | 'collected' | 'completed';
}

const TESTS: Test[] = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 299, originalPrice: 399, time: '6 hrs', popular: true, color: '#2563eb', description: 'Measures different components of blood', preparation: 'No fasting required', category: 'Blood' },
  { id: 2, name: 'Lipid Profile', price: 499, originalPrice: 699, time: '12 hrs', popular: false, color: '#0d9488', description: 'Cholesterol and triglycerides test', preparation: '12 hours fasting required', category: 'Blood' },
  { id: 3, name: 'Liver Function Test', price: 599, time: '24 hrs', popular: false, color: '#7c3aed', description: 'Evaluates liver health', preparation: '8 hours fasting recommended', category: 'Blood' },
  { id: 4, name: 'Kidney Function Test', price: 549, time: '24 hrs', popular: false, color: '#db2777', description: 'Assesses kidney performance', preparation: 'No special preparation', category: 'Blood' },
  { id: 5, name: 'Thyroid Profile (T3/T4/TSH)', price: 799, originalPrice: 999, time: '24 hrs', popular: true, color: '#ea580c', description: 'Complete thyroid function assessment', preparation: 'Morning sample preferred', category: 'Hormone' },
  { id: 6, name: 'Diabetes Screening (HbA1c)', price: 449, time: '6 hrs', popular: false, color: '#16a34a', description: '3-month average blood sugar', preparation: 'No fasting required', category: 'Blood' },
  { id: 7, name: 'Vitamin D & B12 Panel', price: 899, originalPrice: 1199, time: '48 hrs', popular: true, color: '#ca8a04', description: 'Essential vitamin levels', preparation: 'No special preparation', category: 'Vitamin' },
  { id: 8, name: 'COVID-19 RT-PCR', price: 699, time: '8 hrs', popular: false, color: '#dc2626', description: 'COVID-19 detection test', preparation: 'No eating 1 hour before', category: 'Infection' },
  { id: 9, name: 'Iron Studies', price: 349, time: '12 hrs', popular: false, color: '#0891b2', description: 'Iron levels and storage', preparation: 'Morning sample preferred', category: 'Blood' },
  { id: 10, name: 'Urine Routine Analysis', price: 199, time: '4 hrs', popular: false, color: '#7c3aed', description: 'Complete urine examination', preparation: 'First morning sample', category: 'Urine' },
  { id: 11, name: 'Calcium & Phosphorus', price: 399, time: '12 hrs', popular: false, color: '#059669', description: 'Bone health markers', preparation: 'No special preparation', category: 'Blood' },
  { id: 12, name: 'Full Body Health Checkup', price: 1999, originalPrice: 2999, time: '48 hrs', popular: true, color: '#1a4fba', description: 'Comprehensive health screening', preparation: '12 hours fasting required', category: 'Package' },
];

const PACKAGES: Package[] = [
  { 
    id: 101, 
    name: 'Basic Wellness', 
    tests: 8, 
    price: 799, 
    originalPrice: 1299,
    icon: <HeartPulse size={22} />, 
    color: '#2563eb', 
    bg: '#eff6ff',
    testList: ['CBC', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid', 'Vitamin D', 'Urine Analysis'],
    description: 'Essential health screening package'
  },
  { 
    id: 102, 
    name: 'Advanced Health', 
    tests: 18, 
    price: 1499, 
    originalPrice: 2499,
    icon: <Activity size={22} />, 
    color: '#0d9488', 
    bg: '#f0fdfa',
    testList: ['All Basic Tests', 'HbA1c', 'Iron Studies', 'Calcium', 'Vitamin B12', 'ECG', 'Chest X-Ray', 'More...'],
    description: 'Comprehensive health assessment'
  },
  { 
    id: 103, 
    name: 'Complete Body', 
    tests: 32, 
    price: 2999, 
    originalPrice: 4999,
    icon: <Microscope size={22} />, 
    color: '#7c3aed', 
    bg: '#f5f3ff',
    testList: ['All Advanced Tests', 'Cardiac Markers', 'Tumor Markers', 'Hormone Panel', 'Allergy Tests', 'More...'],
    description: 'Full body diagnostic package'
  },
  { 
    id: 104, 
    name: 'Diabetes Care', 
    tests: 12, 
    price: 999, 
    originalPrice: 1599,
    icon: <Droplets size={22} />, 
    color: '#db2777', 
    bg: '#fdf2f8',
    testList: ['HbA1c', 'Fasting Sugar', 'PP Sugar', 'Lipid Profile', 'Kidney Function', 'Liver Function', 'More...'],
    description: 'Diabetes monitoring package'
  },
];

export default function PathologyPage() {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Cart and Booking States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showBookingStatus, setShowBookingStatus] = useState(false);
  const [showQueueDisplay, setShowQueueDisplay] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'time' | 'address' | 'payment' | 'review' | 'success'>('cart');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; time: string; isWaitlist: boolean } | null>(null);
  const [address, setAddress] = useState<BookingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'card'
  });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

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
  }, [showDashboard]);

  const filtered = TESTS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeTab === 'all' || (activeTab === 'popular' && t.popular))
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const collectionFee = 0; // Free home collection
  const finalTotal = cartTotal + collectionFee - discount;

  const addToCart = (item: Test | Package, type: 'test' | 'package') => {
    const cartItem: CartItem = {
      ...item,
      quantity: 1,
      type,
      time: 'time' in item ? item.time : '48 hrs'
    };
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === type);
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, cartItem];
    });
  };

  const removeFromCart = (id: number, type: 'test' | 'package') => {
    setCart(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const updateQuantity = (id: number, type: 'test' | 'package', delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.type === type) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'HEALTH25') {
      setDiscount(cartTotal * 0.25);
    } else if (promoCode.toUpperCase() === 'LAB10') {
      setDiscount(cartTotal * 0.10);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Promo Code',
        text: 'The promo code you entered is not valid. Try HEALTH25 or LAB10.',
        confirmButtonColor: '#0d9488',
      });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowTimeSelector(true);
  };

  const handleTimeSlotSelect = (date: string, time: string, isWaitlist: boolean) => {
    setSelectedTimeSlot({ date, time, isWaitlist });
    setAddress({ ...address, preferredDate: date, preferredTime: time });
    setShowTimeSelector(false);
    setCheckoutStep('address');
  };

  const placeBooking = () => {
    const bookingId = 'LAB' + Date.now().toString().slice(-8);
    const bookingDate = new Date();
    const sampleCollectionDate = new Date(address.preferredDate);

    const booking: Booking = {
      bookingId,
      items: [...cart],
      total: finalTotal,
      address: { ...address },
      payment: { ...payment },
      bookingDate,
      sampleCollectionDate,
      status: 'confirmed',
      queuePosition: selectedTimeSlot?.isWaitlist ? Math.floor(Math.random() * 10) + 1 : undefined,
      estimatedTime: selectedTimeSlot?.isWaitlist ? undefined : '30-45 mins',
      isWaitlisted: selectedTimeSlot?.isWaitlist
    };

    setCurrentBooking(booking);
    setCheckoutStep('success');
    setCart([]);
    setDiscount(0);
    setPromoCode('');
    
    // Show queue display if not waitlisted
    if (!selectedTimeSlot?.isWaitlist) {
      setShowQueueDisplay(true);
    }
  };

  if (!showDashboard) {
    return (
      <>
        <PathologyScroll onScrollComplete={() => setShowDashboard(true)} />
      </>
    );
  }

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      {/* Hero Section with Mouse Animation */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-700 to-teal-600 pt-32 pb-20"
      >
        {/* Mouse-controlled floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-purple-400/30 rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: `translate(-50%, -50%) scale(${1 + mousePosition.y * 0.3})`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-teal-400/20 rounded-full blur-3xl transition-all duration-700 ease-out"
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
          <FlaskConical className="w-16 h-16 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-700 ease-out opacity-20"
          style={{
            right: `${15 + mousePosition.x * 10}%`,
            top: `${40 + mousePosition.y * 15}%`,
            transform: `rotate(${-mousePosition.y * 20}deg)`,
          }}
        >
          <Microscope className="w-20 h-20 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-600 ease-out opacity-20"
          style={{
            left: `${60 + mousePosition.y * 10}%`,
            bottom: `${20 + mousePosition.x * 10}%`,
            transform: `rotate(${mousePosition.y * 15}deg)`,
          }}
        >
          <TestTube className="w-14 h-14 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 transition-transform duration-300"
              style={{
                transform: `translateY(${mousePosition.y * -10}px)`,
              }}
            >
              Precision Pathology
              <span className="block text-purple-200">At Your Doorstep</span>
            </h1>
            <p 
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto transition-transform duration-500"
              style={{
                transform: `translateY(${mousePosition.y * -5}px)`,
              }}
            >
              Book 200+ lab tests online. Free home sample collection. Accurate digital reports — trusted by 2M+ patients across India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white">
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">NABL Certified</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-400 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">Same-Day Results</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <HeartPulse className="w-5 h-5" />
                <span className="font-medium">99.9% Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Back Button and Cart */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/patient-dashboard')}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">Back to Home</span>
          </button>

          <button
            onClick={() => setShowCart(true)}
            className="relative px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {[
            { val: '2M+', label: 'Patients Served', icon: <Users size={20} /> },
            { val: '200+', label: 'Tests Available', icon: <FlaskConical size={20} /> },
            { val: '99.9%', label: 'Accuracy Rate', icon: <Award size={20} /> },
            { val: '4.9★', label: 'Average Rating', icon: <Star size={20} /> },
            { val: '50+', label: 'Cities Covered', icon: <MapPin size={20} /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-2 text-purple-600">{s.icon}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{s.val}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Health Packages */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Health Packages</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((p, i) => (
              <div key={i} className="rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer" style={{ background: p.bg, border: `2px solid ${p.color}22` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${p.color}22`, color: p.color }}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{p.tests} tests included</p>
                <div className="text-2xl font-bold mb-4" style={{ color: p.color }}>{p.price}</div>
                <button 
                  type="button"
                  onClick={() => addToCart(p, 'package')}
                  className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: p.color }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available Tests */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Available Tests</h2>
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {['all', 'popular'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'all' ? 'All Tests' : '⭐ Popular'}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-6 border border-gray-200 max-w-md">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>

          {/* Test List */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No tests found for "{search}"</div>
            ) : filtered.map((t, i) => (
              <div 
                key={i} 
                className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors gap-4"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${t.color}15`, color: t.color }}
                >
                  <FlaskConical size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{t.name}</span>
                    {t.popular && (
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Clock size={12} /> {t.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: t.color }}>{t.price}</div>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(t, 'test')}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  style={{ background: t.color }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-teal-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: 1, title: 'Book Online', desc: 'Select your tests and schedule', icon: <Calendar size={24} /> },
              { n: 2, title: 'Sample Collection', desc: 'Home visit by trained staff', icon: <TestTube size={24} /> },
              { n: 3, title: 'Lab Processing', desc: 'NABL-accredited analysis', icon: <Beaker size={24} /> },
              { n: 4, title: 'Get Results', desc: 'Digital reports delivered', icon: <FileText size={24} /> },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {s.n}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/80 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-white rounded-3xl p-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Your Health Journey Today</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Free home collection · Reports in 4–48 hrs · Digital access forever
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button type="button" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center gap-2">
              <Calendar size={18} /> Book Now — It's Free
            </button>
            <button type="button" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
              <Phone size={18} /> 1800-123-4567
            </button>
          </div>
        </div>
      </div>

      {/* Cart Drawer - Similar to Medicine */}
      {showCart && checkoutStep === 'cart' && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={`${item.id}-${item.type}`} className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      <FlaskConical />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.time} turnaround</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.type)}
                        aria-label="Remove from cart"
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.type, -1)}
                          aria-label="Decrease quantity"
                          className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.type, 1)}
                          aria-label="Increase quantity"
                          className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Home Collection:</span>
                    <span>FREE</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-2xl text-gray-800">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Select Time Slot</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Slot Selector */}
      {showTimeSelector && (
        <BookingTimeSelector
          onSelectSlot={handleTimeSlotSelect}
          onClose={() => {
            setShowTimeSelector(false);
            setShowCart(true);
          }}
        />
      )}

      {/* Booking Status Tracker */}
      {showBookingStatus && currentBooking && (
        <BookingStatusTracker
          booking={currentBooking}
          onClose={() => setShowBookingStatus(false)}
        />
      )}

      {/* Queue Display */}
      {showQueueDisplay && currentBooking && !currentBooking.isWaitlisted && (
        <QueueDisplay
          currentPosition={currentBooking.queuePosition || 1}
          totalInQueue={15}
          estimatedWaitTime={currentBooking.estimatedTime || '30 mins'}
          onClose={() => setShowQueueDisplay(false)}
        />
      )}

      <Footer />
    </NeuralNetworkContainer>
  );
}
