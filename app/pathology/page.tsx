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
  Droplets, Activity, Beaker, ShoppingCart, X, Plus, Minus, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Test {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  turnaround_hours: number;
  type: 'test' | 'package';
  description: string;
  // UI-only fields assigned client-side
  color?: string;
  popular?: boolean;
}

interface CartItem extends Test {
  quantity: number;
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
  queuePosition?: number;
  estimatedTime?: string;
  isWaitlisted?: boolean;
}

// Color palette for tests (assigned by index)
const TEST_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#ca8a04', '#dc2626', '#0891b2', '#7c3aed', '#059669', '#1a4fba'];
const PACKAGE_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777'];
const PACKAGE_BG = ['#eff6ff', '#f0fdfa', '#f5f3ff', '#fdf2f8'];
const PACKAGE_ICONS = [<HeartPulse key="hp" size={22} />, <Activity key="ac" size={22} />, <Microscope key="mi" size={22} />, <Droplets key="dr" size={22} />];

export default function PathologyPage() {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Dynamic data from API
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  
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

  // Fetch tests and packages from API
  useEffect(() => {
    fetch('/api/public/lab-tests')
      .then(r => r.json())
      .then(d => {
        const coloredTests = (d.tests ?? []).map((t: Test, i: number) => ({
          ...t,
          color: TEST_COLORS[i % TEST_COLORS.length],
          popular: i < 4, // mark first 4 as popular
        }));
        const coloredPackages = (d.packages ?? []).map((p: Test, i: number) => ({
          ...p,
          color: PACKAGE_COLORS[i % PACKAGE_COLORS.length],
        }));
        setTests(coloredTests);
        setPackages(coloredPackages);
      })
      .catch(() => {})
      .finally(() => setLoadingTests(false));
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
  }, [showDashboard]);

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeTab === 'all' || (activeTab === 'popular' && t.popular))
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const collectionFee = 0; // Free home collection
  const finalTotal = cartTotal + collectionFee - discount;

  const addToCart = (item: Test, type: 'test' | 'package') => {
    const cartItem: CartItem = {
      ...item,
      quantity: 1,
      type,
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

  const removeFromCart = (id: string, type: 'test' | 'package') => {
    setCart(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  const updateQuantity = (id: string, type: 'test' | 'package', delta: number) => {
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

  const placeBooking = async () => {
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

    // Save lab bookings to DB so doctor can see them
    await fetch('/api/patient/lab-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tests: booking.items.map(i => ({ name: i.name, price: i.price })),
      }),
    }).catch(() => { /* non-critical */ });

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
          {loadingTests ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((p, i) => {
                const color = PACKAGE_COLORS[i % PACKAGE_COLORS.length];
                const bg = PACKAGE_BG[i % PACKAGE_BG.length];
                const icon = PACKAGE_ICONS[i % PACKAGE_ICONS.length];
                return (
                  <div key={p.id} className="rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer" style={{ background: bg, border: `2px solid ${color}22` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}22`, color }}>
                      {icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{p.description}</p>
                    <div className="text-2xl font-bold mb-1" style={{ color }}>₹{p.price}</div>
                    {p.original_price && (
                      <div className="text-sm text-gray-400 line-through mb-3">₹{p.original_price}</div>
                    )}
                    <div className="text-xs text-gray-500 mb-4">
                      <Clock size={12} className="inline mr-1" />{p.turnaround_hours} hrs turnaround
                    </div>
                    <button 
                      type="button"
                      onClick={() => addToCart(p, 'package')}
                      className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ background: color }}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
            {loadingTests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No tests found{search ? ` for "${search}"` : ''}</div>
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
                    <Clock size={12} /> {t.turnaround_hours} hrs
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: t.color }}>₹{t.price}</div>
                  {t.original_price && (
                    <div className="text-xs text-gray-400 line-through">₹{t.original_price}</div>
                  )}
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
                      <p className="text-xs text-gray-500">{item.turnaround_hours} hrs turnaround</p>
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
          booking={currentBooking as any}
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
