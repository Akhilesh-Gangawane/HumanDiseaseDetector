'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Type Definitions ---
export type Patient = {
    id: number;
    name: string;
    age: number;
    symptoms: string;
    disease: string;
    confidence: number;
    risk: 'High' | 'Medium' | 'Low';
    avatar: string;
};

export type Appointment = {
    id: number;
    patientName: string;
    time: string;
    date: string;
    type: string;
    mode: 'Online' | 'Offline';
    status: 'Confirmed' | 'Pending' | 'Cancelled';
    avatar: string;
};

export type Prediction = {
    id: number;
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
    patientId: number;
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
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'alert' | 'appointment' | 'system' | 'result';
    read: boolean;
};

export type PatientMetric = {
    id: string;
    patientId: number;
    date: string;
    heartRate: number;
    bloodPressure: {
        systolic: number;
        diastolic: number;
    };
    glucose: number;
    temperature: number;
};

// --- Initial Mock Data ---
const initialPatients: Patient[] = [
    { id: 1, name: 'Emma Watson', age: 34, symptoms: 'Headache', disease: 'Migraine', confidence: 85, risk: 'Low', avatar: '' },
    { id: 2, name: 'Marcus Jenkins', age: 45, symptoms: 'Chest Pain', disease: 'Angina', confidence: 90, risk: 'High', avatar: '' },
    { id: 3, name: 'Sarah Connor', age: 28, symptoms: 'Fatigue', disease: 'Anemia', confidence: 75, risk: 'Medium', avatar: '' },
    { id: 4, name: 'John Doe', age: 50, symptoms: 'Fever', disease: 'Flu', confidence: 80, risk: 'Low', avatar: '' },
    { id: 5, name: 'Lisa Anderson', age: 41, symptoms: 'Nausea', disease: 'Gastroenteritis', confidence: 88, risk: 'Medium', avatar: '' },
];

const initialAppointments: Appointment[] = [
    { id: 1, patientName: "Eleanor Pena", time: "10:30 AM", date: "2024-03-09", type: "Cardiology Follow-up", mode: "Online", status: "Confirmed", avatar: "" },
    { id: 2, patientName: "Jerome Bell", time: "11:15 AM", date: "2024-03-09", type: "Initial Consultation", mode: "Online", status: "Confirmed", avatar: "" },
    { id: 3, patientName: "Courtney Henry", time: "01:00 PM", date: "2024-03-09", type: "Post-Op Check", mode: "Offline", status: "Confirmed", avatar: "" },
];

const initialPredictions: Prediction[] = [
    {
        id: 1,
        patient: 'John Doe',
        disease: 'Diabetes Type 2',
        confidence: 94,
        symptoms: ['Fatigue', 'Increased thirst', 'Frequent urination', 'Blurred vision'],
        explanation: 'Based on the symptoms and patient history, the AI model predicts Type 2 Diabetes with high confidence.',
        status: 'Pending'
    },
    {
        id: 2,
        patient: 'Emma Wilson',
        disease: 'Hypertension',
        confidence: 87,
        symptoms: ['Headache', 'Dizziness'],
        explanation: 'Model suggests moderate risk of Hypertension. Requires blood pressure monitoring.',
        status: 'Pending'
    },
];

const initialLabResults: LabResult[] = [];

const initialTestRequests: TestRequest[] = [
    {
        id: 'TR-001', patientId: 1, patientName: 'Emma Watson', testName: 'Comprehensive Metabolic Panel',
        requestedByDoctorId: 1, requestedByDoctorName: 'Dr. Michael Chen', requestDate: '2024-03-08',
        status: 'Completed', priority: 'High', diagnosisReason: 'Follow-up for diabetes screening',
        labValues: [
            { name: 'Glucose', value: '115', unit: 'mg/dL', referenceRange: '70-100', status: 'Abnormal' },
            { name: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7-1.3', status: 'Normal' },
        ]
    },
    {
        id: 'TR-002', patientId: 2, patientName: 'Marcus Jenkins', testName: 'Lipid Profile',
        requestedByDoctorId: 1, requestedByDoctorName: 'Dr. Michael Chen', requestDate: '2024-03-07',
        status: 'Completed', priority: 'Normal', diagnosisReason: 'Cardiovascular risk assessment',
        labValues: [
            { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', referenceRange: '<200', status: 'Abnormal' },
            { name: 'LDL Cholesterol', value: '145', unit: 'mg/dL', referenceRange: '<100', status: 'Abnormal' },
        ]
    },
    {
        id: 'TR-003', patientId: 3, patientName: 'Sarah Connor', testName: 'Complete Blood Count',
        requestedByDoctorId: 1, requestedByDoctorName: 'Dr. Michael Chen', requestDate: '2024-03-09',
        status: 'In Progress', priority: 'Urgent', diagnosisReason: 'Suspected anemia and infection screening', labValues: []
    },
];

const initialNotifications: Notification[] = [
    { id: 1, title: 'High Risk Alert', message: 'Patient Michael Brown requires immediate attention.', time: '10 mins ago', type: 'alert', read: false },
    { id: 2, title: 'New Appointment', message: 'Emma Wilson scheduled a Consultation.', time: '1 hour ago', type: 'appointment', read: false },
    { id: 3, title: 'Lab Result Ready', message: 'Results for Complete Blood Count (John Doe) are ready.', time: '2 hours ago', type: 'result', read: true },
];

const initialMetrics: PatientMetric[] = [
    { id: 'M1', patientId: 1, date: '2024-03-09', heartRate: 72, bloodPressure: { systolic: 118, diastolic: 78 }, glucose: 95, temperature: 98.4 },
    { id: 'M2', patientId: 1, date: '2024-03-08', heartRate: 75, bloodPressure: { systolic: 120, diastolic: 80 }, glucose: 98, temperature: 98.6 },
    { id: 'M4', patientId: 2, date: '2024-03-09', heartRate: 88, bloodPressure: { systolic: 145, diastolic: 95 }, glucose: 130, temperature: 99.1 },
    { id: 'M6', patientId: 3, date: '2024-03-09', heartRate: 68, bloodPressure: { systolic: 110, diastolic: 70 }, glucose: 88, temperature: 98.0 },
    { id: 'M7', patientId: 4, date: '2024-03-09', heartRate: 80, bloodPressure: { systolic: 130, diastolic: 85 }, glucose: 110, temperature: 98.8 },
];

// --- Context Setup ---
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
    addNotification: (noti: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    getTestsByDoctor: (doctorId: number) => TestRequest[];
}

const DoctorStateContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorStateProvider({ children }: { children: ReactNode }) {
    const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [predictions, setPredictions] = useState<Prediction[]>(initialPredictions);
    const [labResults, setLabResults] = useState<LabResult[]>(initialLabResults);
    const [testRequests, setTestRequests] = useState<TestRequest[]>(initialTestRequests);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [metrics, setMetrics] = useState<PatientMetric[]>(initialMetrics);

    const addNotification = (noti: Omit<Notification, 'id' | 'read' | 'time'>) => {
        const newNoti: Notification = { ...noti, id: Date.now(), read: false, time: 'Just now' };
        setNotifications(prev => [newNoti, ...prev]);
    };

    const getTestsByDoctor = (doctorId: number) => {
        return testRequests.filter(test => test.requestedByDoctorId === doctorId);
    };

    return (
        <DoctorStateContext.Provider value={{
            patients, setPatients, appointments, setAppointments,
            predictions, setPredictions, labResults, setLabResults,
            testRequests, setTestRequests, notifications, setNotifications,
            metrics, setMetrics, addNotification, getTestsByDoctor
        }}>
            {children}
        </DoctorStateContext.Provider>
    );
}

export function useDoctorState() {
    const context = useContext(DoctorStateContext);
    if (context === undefined) {
        throw new Error('useDoctorState must be used within a DoctorStateProvider');
    }
    return context;
}
