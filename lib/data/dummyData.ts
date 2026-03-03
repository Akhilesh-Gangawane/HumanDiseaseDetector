// Dummy data for the dashboard

export const patients = [
  {
    id: 1,
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    symptoms: ['Fatigue', 'Increased thirst', 'Frequent urination', 'Blurred vision'],
    disease: 'Diabetes Type 2',
    confidence: 94,
    risk: 'High',
    lastVisit: '2024-02-20',
    phone: '+1 234-567-8901',
    email: 'john.doe@email.com',
  },
  {
    id: 2,
    name: 'Emma Wilson',
    age: 32,
    gender: 'Female',
    symptoms: ['Headache', 'Dizziness', 'Chest pain', 'Shortness of breath'],
    disease: 'Hypertension',
    confidence: 87,
    risk: 'Medium',
    lastVisit: '2024-02-19',
    phone: '+1 234-567-8902',
    email: 'emma.wilson@email.com',
  },
  {
    id: 3,
    name: 'Michael Brown',
    age: 58,
    gender: 'Male',
    symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue', 'Irregular heartbeat'],
    disease: 'Heart Disease',
    confidence: 92,
    risk: 'High',
    lastVisit: '2024-02-18',
    phone: '+1 234-567-8903',
    email: 'michael.brown@email.com',
  },
];

export const doctors = [
  { id: 1, name: 'Dr. Michael Chen', specialty: 'Cardiologist', available: true },
  { id: 2, name: 'Dr. Emily Roberts', specialty: 'Endocrinologist', available: true },
  { id: 3, name: 'Dr. James Wilson', specialty: 'Neurologist', available: false },
  { id: 4, name: 'Dr. Lisa Anderson', specialty: 'General Physician', available: true },
];

export const medicines = [
  {
    id: 1,
    name: 'Metformin XR 500mg',
    composition: 'Metformin Hydrochloride',
    usage: 'Oral, twice daily with meals',
    sideEffects: 'Nausea, diarrhea, stomach upset',
    research:
      'Extensively studied for Type 2 Diabetes management. Shows 25% reduction in HbA1c levels with minimal side effects.',
    approved: false,
  },
  {
    id: 2,
    name: 'Lisinopril 10mg',
    composition: 'Lisinopril (ACE Inhibitor)',
    usage: 'Oral, once daily',
    sideEffects: 'Dry cough, dizziness, headache',
    research:
      'Proven effective for hypertension and heart failure. Reduces cardiovascular events by 20% in clinical trials.',
    approved: false,
  },
];

export const appointments = [
  {
    id: 1,
    patientName: 'John Doe',
    time: '09:00 AM',
    date: '2024-02-23',
    type: 'Follow-up',
    status: 'Confirmed',
  },
  {
    id: 2,
    patientName: 'Emma Wilson',
    time: '10:30 AM',
    date: '2024-02-23',
    type: 'Consultation',
    status: 'Confirmed',
  },
  {
    id: 3,
    patientName: 'Michael Brown',
    time: '02:00 PM',
    date: '2024-02-23',
    type: 'Emergency',
    status: 'Pending',
  },
];
