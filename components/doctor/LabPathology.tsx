'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Calendar, FileText, Clock, ArrowLeft,
  Search, Star, Shield, Zap, HeartPulse,
  Microscope, TestTube, BarChart3,
  CheckCircle, Users, Award, Phone, MapPin,
  Droplets, Activity, Beaker, X, Plus, Minus,
  ChevronDown, Droplet, Printer, Share2, CheckCircle2,
} from 'lucide-react';
import { useDoctorState, TestRequest } from './DoctorStateContext';

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
  icon: React.ReactNode;
  color: string;
  bg: string;
  testList: string[];
  description: string;
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
    id: 101, name: 'Basic Wellness', tests: 8, price: 799, originalPrice: 1299,
    icon: <HeartPulse size={22} />, color: '#2563eb', bg: '#eff6ff',
    testList: ['CBC', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid', 'Vitamin D', 'Urine Analysis'],
    description: 'Essential health screening package',
  },
  {
    id: 102, name: 'Advanced Health', tests: 18, price: 1499, originalPrice: 2499,
    icon: <Activity size={22} />, color: '#0d9488', bg: '#f0fdfa',
    testList: ['All Basic Tests', 'HbA1c', 'Iron Studies', 'Calcium', 'Vitamin B12', 'ECG', 'Chest X-Ray', 'More...'],
    description: 'Comprehensive health assessment',
  },
  {
    id: 103, name: 'Complete Body', tests: 32, price: 2999, originalPrice: 4999,
    icon: <Microscope size={22} />, color: '#7c3aed', bg: '#f5f3ff',
    testList: ['All Advanced Tests', 'Cardiac Markers', 'Tumor Markers', 'Hormone Panel', 'Allergy Tests', 'More...'],
    description: 'Full body diagnostic package',
  },
  {
    id: 104, name: 'Diabetes Care', tests: 12, price: 999, originalPrice: 1599,
    icon: <Droplets size={22} />, color: '#db2777', bg: '#fdf2f8',
    testList: ['HbA1c', 'Fasting Sugar', 'PP Sugar', 'Lipid Profile', 'Kidney Function', 'Liver Function', 'More...'],
    description: 'Diabetes monitoring package',
  },
];

export default function LabPathology() {
  const { getTestsByDoctor, setTestRequests, testRequests, patients } = useDoctorState();

  // View state
  const [view, setView] = useState<'catalog' | 'requests'>('catalog');
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [prefilledTestName, setPrefilledTestName] = useState('');
  const [newOrder, setNewOrder] = useState({
    patientId: '',
    testName: '',
    priority: 'Normal' as TestRequest['priority'],
    reason: '',
  });

  const currentDoctorId = 1;
  const allTests = getTestsByDoctor(currentDoctorId);
  const pendingTests = allTests.filter(t => t.status === 'Pending');
  const inProgressTests = allTests.filter(t => t.status === 'In Progress');
  const completedTests = allTests.filter(t => t.status === 'Completed');
  const testsByPatient = patients.map(patient => ({
    patient,
    tests: allTests.filter(t => t.patientId === patient.userId),
  })).filter(g => g.tests.length > 0);

  const getDisplayTests = () => {
    switch (activeTab) {
      case 'pending': return pendingTests;
      case 'in-progress': return inProgressTests;
      case 'completed': return completedTests;
      default: return [];
    }
  };

  const filteredCatalog = TESTS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterTab === 'all' || (filterTab === 'popular' && t.popular))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    const el = heroRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      return () => el.removeEventListener('mousemove', handleMouseMove);
    }
  }, [view]);

  const openOrderModal = (testName = '') => {
    setPrefilledTestName(testName);
    setNewOrder({ patientId: '', testName, priority: 'Normal', reason: '' });
    setShowOrderModal(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.patientId || !newOrder.testName) return;
    const patient = patients.find(p => p.userId === newOrder.patientId);
    if (!patient) return;

    const res = await fetch('/api/doctor/lab-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient.userId,
        patientName: patient.name,
        testName: newOrder.testName,
        priority: newOrder.priority,
        reason: newOrder.reason,
      }),
    });

    if (res.ok) {
      const { test } = await res.json();
      setTestRequests(prev => [test, ...prev]);
    }

    setShowOrderModal(false);
    setNewOrder({ patientId: '', testName: '', priority: 'Normal', reason: '' });
    setView('requests');
    setActiveTab('pending');
  };

  const requestTabs = [
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingTests.length },
    { id: 'in-progress', label: 'In Progress', icon: Microscope, count: inProgressTests.length },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedTests.length },
    { id: 'records', label: 'Patient Records', icon: Users, count: testsByPatient.length },
  ];

  // ─── CATALOG VIEW ─────────────────────────────────────────────────────────
  if (view === 'catalog') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">

        {/* Hero */}
        <div
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-700 to-teal-600 pt-12 pb-16"
        >
          <div
            className="absolute w-96 h-96 bg-purple-400/30 rounded-full blur-3xl transition-all duration-500 ease-out pointer-events-none"
            style={{ left: `${mousePosition.x * 100}%`, top: `${mousePosition.y * 100}%`, transform: 'translate(-50%,-50%)' }}
          />
          <div
            className="absolute w-80 h-80 bg-teal-400/20 rounded-full blur-3xl transition-all duration-700 ease-out pointer-events-none"
            style={{ left: `${(1 - mousePosition.x) * 100}%`, top: `${(1 - mousePosition.y) * 100}%`, transform: 'translate(-50%,-50%)' }}
          />
          <div className="absolute opacity-20 transition-all duration-500 ease-out" style={{ left: `${20 + mousePosition.x * 10}%`, top: `${30 + mousePosition.y * 10}%`, transform: `rotate(${mousePosition.x * 20}deg)` }}>
            <FlaskConical className="w-16 h-16 text-white" />
          </div>
          <div className="absolute opacity-20 transition-all duration-700 ease-out" style={{ right: `${15 + mousePosition.x * 10}%`, top: `${40 + mousePosition.y * 15}%`, transform: `rotate(${-mousePosition.y * 20}deg)` }}>
            <Microscope className="w-20 h-20 text-white" />
          </div>
          <div className="absolute opacity-20 transition-all duration-500 ease-out" style={{ left: `${60 + mousePosition.y * 10}%`, bottom: `${20 + mousePosition.x * 10}%`, transform: `rotate(${mousePosition.y * 15}deg)` }}>
            <TestTube className="w-14 h-14 text-white" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ transform: `translateY(${mousePosition.y * -10}px)` }}>
                Lab & Pathology
                <span className="block text-purple-200">Order Tests for Patients</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto" style={{ transform: `translateY(${mousePosition.y * -5}px)` }}>
                Browse 200+ lab tests, order for your patients instantly, and track results — all in one place.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-white">
                {[
                  { icon: <Shield className="w-5 h-5" />, label: 'NABL Certified' },
                  { icon: <Zap className="w-5 h-5" />, label: 'Same-Day Results' },
                  { icon: <HeartPulse className="w-5 h-5" />, label: '99.9% Accuracy' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-300">
                    {b.icon}
                    <span className="font-medium">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">

          {/* Top action bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setView('requests'); setActiveTab('pending'); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all font-medium text-gray-700"
              >
                <BarChart3 className="w-4 h-4 text-purple-600" />
                My Test Requests
                {allTests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{allTests.length}</span>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => openOrderModal()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus className="w-4 h-4" />
              Request Test
            </button>
          </div>

          {/* Stats */}
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
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{p.description}</p>
                  <p className="text-sm text-gray-600 mb-4">{p.tests} tests included</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold" style={{ color: p.color }}>₹{p.price}</span>
                    {p.originalPrice && <span className="text-sm text-gray-400 line-through">₹{p.originalPrice}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => openOrderModal(p.name)}
                    className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    style={{ background: p.color }}
                  >
                    Order for Patient
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
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterTab === tab ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab === 'all' ? 'All Tests' : '⭐ Popular'}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No tests found for &quot;{search}&quot;</div>
              ) : filteredCatalog.map((t, i) => (
                <div key={i} className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}15`, color: t.color }}>
                    <FlaskConical size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{t.name}</span>
                      {t.popular && <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Popular</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {t.time}</span>
                      <span className="text-gray-300">|</span>
                      <span>{t.description}</span>
                    </div>
                  </div>
                  <div className="text-right mr-2">
                    <div className="text-lg font-bold" style={{ color: t.color }}>₹{t.price}</div>
                    {t.originalPrice && <div className="text-xs text-gray-400 line-through">₹{t.originalPrice}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => openOrderModal(t.name)}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium whitespace-nowrap"
                    style={{ background: t.color }}
                  >
                    Order for Patient
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
                { n: 1, title: 'Select Test', desc: 'Choose from 200+ tests or packages', icon: <FlaskConical size={24} /> },
                { n: 2, title: 'Assign Patient', desc: 'Pick the patient from your list', icon: <Users size={24} /> },
                { n: 3, title: 'Lab Processing', desc: 'NABL-accredited analysis', icon: <Beaker size={24} /> },
                { n: 4, title: 'View Results', desc: 'Digital reports in your dashboard', icon: <FileText size={24} /> },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-flex mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">{s.icon}</div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">{s.n}</div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/80 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─── REQUESTS VIEW ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView('catalog')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Catalog</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-800">Lab Test Requests</h1>
          </div>
          <button
            type="button"
            onClick={() => openOrderModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 border border-gray-200 w-fit">
          {requestTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Patient Records Tab */}
        {activeTab === 'records' ? (
          <div className="space-y-4">
            {testsByPatient.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200">
                No patient test records found.
              </div>
            ) : testsByPatient.map(({ patient, tests }) => (
              <div key={patient.userId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedPatient(expandedPatient === patient.userId ? null : (patient.userId ?? null))}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{patient.name}</div>
                      <div className="text-sm text-gray-500">{tests.length} test{tests.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedPatient === patient.userId ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedPatient === patient.userId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        {tests.map(test => (
                          <div key={test.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FlaskConical className="w-4 h-4 text-purple-500" />
                              <div>
                                <div className="font-medium text-gray-800 text-sm">{test.testName}</div>
                                <div className="text-xs text-gray-500">{test.orderedDate}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                test.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                test.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {test.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                test.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                test.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {test.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          /* Test list for pending / in-progress / completed */
          <div className="space-y-3">
            {getDisplayTests().length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200">
                No {activeTab} tests found.
              </div>
            ) : getDisplayTests().map(test => (
              <div key={test.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{test.testName}</div>
                      <div className="text-sm text-gray-500">{test.patientName} · {test.orderedDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      test.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                      test.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {test.priority}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      test.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      test.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {test.status}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedTest === test.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedTest === test.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Patient</div>
                          <div className="font-medium text-gray-800">{test.patientName}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Test</div>
                          <div className="font-medium text-gray-800">{test.testName}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Priority</div>
                          <div className="font-medium text-gray-800">{test.priority}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Ordered</div>
                          <div className="font-medium text-gray-800">{test.orderedDate}</div>
                        </div>
                        {test.reason && (
                          <div className="col-span-2 md:col-span-4">
                            <div className="text-gray-500 mb-1">Reason</div>
                            <div className="font-medium text-gray-800">{test.reason}</div>
                          </div>
                        )}
                        {test.result && (
                          <div className="col-span-2 md:col-span-4">
                            <div className="text-gray-500 mb-1">Result</div>
                            <div className="font-medium text-gray-800">{test.result}</div>
                          </div>
                        )}
                        <div className="col-span-2 md:col-span-4 flex gap-2 pt-2">
                          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Printer className="w-3.5 h-3.5" /> Print
                          </button>
                          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowOrderModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Request Lab Test</h2>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setShowOrderModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient *</label>
                  <select
                    value={newOrder.patientId}
                    onChange={e => setNewOrder(prev => ({ ...prev, patientId: e.target.value }))}
                    aria-label="Select patient"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                    required
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.userId} value={p.userId}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Name *</label>
                  <input
                    type="text"
                    value={newOrder.testName}
                    onChange={e => setNewOrder(prev => ({ ...prev, testName: e.target.value }))}
                    placeholder="e.g. Complete Blood Count"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(['Normal', 'High', 'Urgent'] as TestRequest['priority'][]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewOrder(prev => ({ ...prev, priority: p }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                          newOrder.priority === p
                            ? p === 'Urgent' ? 'bg-red-500 text-white border-red-500'
                              : p === 'High' ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Notes</label>
                  <textarea
                    value={newOrder.reason}
                    onChange={e => setNewOrder(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Clinical indication or notes..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
