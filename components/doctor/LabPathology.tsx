'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker, Microscope, CheckCircle2, Clock, Plus, Share2, Printer,
  TestTube, Droplet, ChevronDown, Calendar, Users
} from 'lucide-react';
import { useDoctorState, TestRequest } from './DoctorStateContext';

export default function LabPathology() {
  const { getTestsByDoctor, setTestRequests, testRequests, patients } = useDoctorState();
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<number | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    patientId: '',
    testName: '',
    priority: 'Normal' as TestRequest['priority'],
    reason: ''
  });

  const currentDoctorId = 1;
  const allTests = getTestsByDoctor(currentDoctorId);
  const pendingTests = allTests.filter(t => t.status === 'Pending');
  const inProgressTests = allTests.filter(t => t.status === 'In Progress');
  const completedTests = allTests.filter(t => t.status === 'Completed');

  const getDisplayTests = () => {
    switch (activeTab) {
      case 'pending': return pendingTests;
      case 'in-progress': return inProgressTests;
      case 'completed': return completedTests;
      default: return [];
    }
  };

  const displayTests = getDisplayTests();

  const testsByPatient = patients.map(patient => ({
    patient,
    tests: allTests.filter(t => t.patientId === patient.id)
  })).filter(group => group.tests.length > 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.patientId || !newOrder.testName) return;
    const patient = patients.find(p => p.id.toString() === newOrder.patientId);
    if (!patient) return;

    const newTest: TestRequest = {
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      patientName: patient.name,
      testName: newOrder.testName,
      requestedByDoctorId: currentDoctorId,
      requestedByDoctorName: 'Dr. Sarah Johnson',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: newOrder.priority,
      diagnosisReason: newOrder.reason || 'Routine check',
      labValues: []
    };

    setTestRequests(prev => [newTest, ...prev]);
    setShowOrderModal(false);
    setNewOrder({ patientId: '', testName: '', priority: 'Normal', reason: '' });
    setActiveTab('pending');
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingTests.length },
    { id: 'in-progress', label: 'In Progress', icon: Microscope, count: inProgressTests.length },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedTests.length },
    { id: 'records', label: 'Patient Records', icon: Users, count: testsByPatient.length },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-gray-900 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.05)] border border-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col">
        <div className="p-8 pb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/20">
            <Beaker className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">My Test Results</h1>
          <p className="text-gray-500 text-sm font-medium">Tests requested by you.</p>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white border border-gray-200 shadow-sm text-indigo-700 font-bold'
                  : 'text-gray-600 font-semibold hover:bg-gray-100/50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            <TestTube className="w-8 h-8 text-indigo-400 mb-4" />
            <h4 className="font-bold text-lg mb-1">Test Overview</h4>
            <p className="text-indigo-200 text-xs mb-4">Total: {allTests.length} tests</p>
            <button
              type="button"
              onClick={() => setShowOrderModal(true)}
              className="w-full py-2 bg-white/10 hover:bg-white/25 rounded-xl text-sm font-semibold transition backdrop-blur-sm"
            >
              Request New Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="h-24 px-8 md:px-12 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-2xl z-10 shrink-0">
          <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight">
            {activeTab.replace('-', ' ')} Tests
          </h2>
          <div className="flex items-center gap-3">
            <button type="button" className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition" aria-label="Print">
              <Printer className="w-5 h-5" />
            </button>
            <button type="button" className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition" aria-label="Share">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              type="button"
              onClick={() => setShowOrderModal(true)}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-gray-900/10"
            >
              <Plus className="w-4 h-4" /> Request Test
            </button>
          </div>
        </div>

        <div className="p-8 md:px-12 py-8 flex-1 bg-gray-50/30">
          {activeTab === 'records' ? (
            <div className="space-y-4">
              {testsByPatient.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No patient records found.</div>
              ) : testsByPatient.map(({ patient, tests }) => (
                <div key={patient.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                  <div
                    onClick={() => setExpandedPatient(expandedPatient === patient.id ? null : patient.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{patient.name}</h3>
                        <p className="text-sm text-gray-500">{tests.length} tests total</p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: expandedPatient === patient.id ? 180 : 0 }}>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {expandedPatient === patient.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-3"
                      >
                        {tests.map(test => (
                          <div key={test.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                              <div className="flex gap-2 items-center mb-1">
                                <span className="font-mono text-xs font-bold text-indigo-600">{test.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  test.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>{test.status}</span>
                              </div>
                              <p className="font-semibold text-gray-900">{test.testName}</p>
                              <p className="text-xs text-gray-500">{test.requestDate}</p>
                            </div>
                            {test.status === 'Completed' && test.labValues && (
                              <p className="text-sm text-gray-500">{test.labValues.length} metrics recorded</p>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : displayTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TestTube className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab.replace('-', ' ')} tests</h3>
              <p className="text-gray-500">There are no tests in this category yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {displayTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                      className="p-6 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                          {test.testName.includes('Blood') || test.testName.includes('Metabolic') ? (
                            <Droplet className="w-6 h-6 text-rose-500" />
                          ) : (
                            <TestTube className="w-6 h-6 text-indigo-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-3 items-center mb-2">
                            <span className="font-mono text-xs font-black text-indigo-600 tracking-wider bg-indigo-50 px-2 py-1 rounded-md">{test.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              test.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                              test.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>{test.priority}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              test.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              test.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{test.status}</span>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 mb-2">{test.testName}</h4>
                          <p className="text-sm font-medium text-gray-600">Patient: <span className="font-semibold text-gray-900">{test.patientName}</span></p>
                          <p className="text-xs text-gray-500 mt-1">Reason: <span className="font-semibold text-gray-700">{test.diagnosisReason}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-600">{test.requestDate}</span>
                        </div>
                        <motion.div animate={{ rotate: expandedTest === test.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTest === test.id && test.labValues && test.labValues.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-100 bg-gray-50/50 px-6 py-6"
                        >
                          <h5 className="font-bold text-gray-900 mb-4">Lab Values</h5>
                          <div className="space-y-3">
                            {test.labValues.map((value, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                <div>
                                  <p className="font-semibold text-gray-900">{value.name}</p>
                                  <p className="text-xs text-gray-500">Reference: {value.referenceRange}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold text-lg ${
                                    value.status === 'Normal' ? 'text-green-600' :
                                    value.status === 'Abnormal' ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>
                                    {value.value} {value.unit}
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    value.status === 'Normal' ? 'text-green-600' :
                                    value.status === 'Abnormal' ? 'text-amber-600' :
                                    'text-red-600'
                                  }`}>{value.status}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {expandedTest === test.id && (!test.labValues || test.labValues.length === 0) && (
                      <div className="border-t border-gray-100 bg-blue-50 px-6 py-6 text-center">
                        <p className="text-blue-700 font-semibold">Test is {test.status.toLowerCase()}. Results will appear once completed.</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Request Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">Request Lab Test</h2>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label htmlFor="lab-patient" className="block text-sm font-semibold text-gray-700 mb-1">Patient</label>
                  <select
                    id="lab-patient"
                    value={newOrder.patientId}
                    onChange={e => setNewOrder({ ...newOrder, patientId: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="lab-test-name" className="block text-sm font-semibold text-gray-700 mb-1">Test Name</label>
                  <input
                    id="lab-test-name"
                    type="text"
                    value={newOrder.testName}
                    onChange={e => setNewOrder({ ...newOrder, testName: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="e.g. Complete Blood Count"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lab-priority" className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    id="lab-priority"
                    value={newOrder.priority}
                    onChange={e => setNewOrder({ ...newOrder, priority: e.target.value as TestRequest['priority'] })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="lab-reason" className="block text-sm font-semibold text-gray-700 mb-1">Reason / Notes</label>
                  <textarea
                    id="lab-reason"
                    value={newOrder.reason}
                    onChange={e => setNewOrder({ ...newOrder, reason: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                    placeholder="Why is this test needed?"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                  >
                    Submit Order
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
