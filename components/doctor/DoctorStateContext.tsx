'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// --- Type Definitions ---
export type Patient = {
  id: number;
  userId?: string;
  name: string;
  age: number;
  symptoms: string;
  disease: string;
  confidence: number;
  risk: 'High' | 'Medium' | 'Low';
  avatar: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  patientId?: string | null;
  time: string;
  date: string;
  type: string;
  mode: 'Online' | 'Offline';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  avatar: string;
  reason?: string;
  initiatedBy?: string;
  meetLink?: string | null;
};

export type Prediction = {
  id: string;
  patient: string;
  disease: string;
  confidence: number;
  symptoms: string[];
  explanation: string;
  status: 'Pending' | 'Approved' | 'Modified';
};

export type LabResult = {
  id: number;
  patient: string;
  test: string;
  date: string;
  status: 'Completed' | 'Pending';
  result: string;
};

export type TestRequest = {
  id: string;
  patientId: string | null;
  patientName: string;
  testName: string;
  requestedByDoctorId: number;
  requestedByDoctorName: string;
  requestDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Normal' | 'High' | 'Urgent';
  diagnosisReason: string;
  labValues?: {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
  }[];
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'appointment' | 'system' | 'result';
  read: boolean;
};

export type PatientMetric = {
  id: string;
  patientId: string | null;
  date: string;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  glucose: number;
  temperature: number;
};

// --- Context ---
interface DoctorContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  predictions: Prediction[];
  setPredictions: React.Dispatch<React.SetStateAction<Prediction[]>>;
  labResults: LabResult[];
  setLabResults: React.Dispatch<React.SetStateAction<LabResult[]>>;
  testRequests: TestRequest[];
  setTestRequests: React.Dispatch<React.SetStateAction<TestRequest[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  metrics: PatientMetric[];
  setMetrics: React.Dispatch<React.SetStateAction<PatientMetric[]>>;
  loading: boolean;
  addNotification: (noti: Omit<Notification, 'id' | 'read' | 'time'>) => Promise<void>;
  getTestsByDoctor: (doctorId: number) => TestRequest[];
  refreshAll: () => Promise<void>;
}

const DoctorStateContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorStateProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<PatientMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, predictionsRes, testsRes, vitalsRes, notifsRes] = await Promise.all([
        fetch('/api/doctor/patients'),
        fetch('/api/doctor/appointments'),
        fetch('/api/doctor/predictions'),
        fetch('/api/doctor/lab-tests'),
        fetch('/api/doctor/vitals'),
        fetch('/api/doctor/notifications'),
      ]);

      if (patientsRes.ok) {
        const d = await patientsRes.json();
        setPatients(d.patients ?? []);
      }
      if (appointmentsRes.ok) {
        const d = await appointmentsRes.json();
        setAppointments(d.appointments ?? []);
      }      if (predictionsRes.ok) {
        const d = await predictionsRes.json();
        setPredictions(d.predictions ?? []);
      }
      if (testsRes.ok) {
        const d = await testsRes.json();
        setTestRequests(d.tests ?? []);
      }
      if (vitalsRes.ok) {
        const d = await vitalsRes.json();
        setMetrics(d.metrics ?? []);
      }
      if (notifsRes.ok) {
        const d = await notifsRes.json();
        setNotifications(d.notifications ?? []);
      }
    } catch (err) {
      console.error('Failed to load doctor data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addNotification = useCallback(async (noti: Omit<Notification, 'id' | 'read' | 'time'>) => {
    // Optimistic update
    const temp: Notification = { ...noti, id: `temp-${Date.now()}`, read: false, time: 'Just now' };
    setNotifications(prev => [temp, ...prev]);

    // Persist to DB
    try {
      await fetch('/api/doctor/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noti),
      });
    } catch { /* non-critical */ }
  }, []);

  const getTestsByDoctor = useCallback((_doctorId: number) => testRequests, [testRequests]);

  return (
    <DoctorStateContext.Provider value={{
      patients, setPatients,
      appointments, setAppointments,
      predictions, setPredictions,
      labResults, setLabResults,
      testRequests, setTestRequests,
      notifications, setNotifications,
      metrics, setMetrics,
      loading,
      addNotification,
      getTestsByDoctor,
      refreshAll: fetchAll,
    }}>
      {children}
    </DoctorStateContext.Provider>
  );
}

export function useDoctorState() {
  const context = useContext(DoctorStateContext);
  if (context === undefined) throw new Error('useDoctorState must be used within a DoctorStateProvider');
  return context;
}
