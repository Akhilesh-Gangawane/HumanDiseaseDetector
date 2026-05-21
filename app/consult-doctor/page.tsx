'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import OpdScroll from '@/components/patient/OpdScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import Footer from '@/components/patient/Footer';
import { Video, MessageSquare, Calendar, User, Stethoscope, ArrowLeft, X, Star, Send, ChevronLeft, ChevronRight, Link2, CheckCircle2, Clock, CalendarCheck, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { openGoogleMeet } from '@/lib/videosdk';
import { ScrollLock } from '@/hooks/useScrollLock';

// Real doctor from DB
interface RealDoctor {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialty: string;
  experience: string | null;
  qualifications: string | null;
  licenseNumber: string | null;
}

// Legacy Doctor type kept for modal compatibility (book appointment / doctor details)
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  available: boolean;
  rating: number;
  reviews: number;
  experience: string;
  fee: number;
  nextSlot: string;
  qualifications: string;
  hospital: string;
  languages: string[];
  about: string;
  slots: string[];
  tags: string[];
  reviewList: Array<{
    author: string;
    text: string;
    rating: number;
    date: string;
  }>;
}

const DOCTORS: Doctor[] = [
  {
    id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiologist',
    available: true, rating: 4.9, reviews: 312, experience: '12 yrs',
    fee: 800, nextSlot: '10:30 AM', qualifications: 'MBBS, MD (Cardiology)',
    hospital: 'Apollo Hospital', languages: ['English', 'Hindi'],
    about: 'Expert in interventional cardiology and heart failure management with 300+ successful procedures.',
    slots: ['10:30 AM', '11:00 AM', '2:00 PM', '4:30 PM'],
    tags: ['Heart', 'ECG', 'Hypertension'],
    reviewList: [
      { author: 'Raj M.', text: 'Very thorough and explained everything clearly.', rating: 5, date: '2 days ago' },
      { author: 'Priya S.', text: 'Excellent diagnosis. Highly recommend!', rating: 5, date: '1 week ago' },
      { author: 'Amit K.', text: 'Professional and caring doctor.', rating: 4, date: '2 weeks ago' },
    ]
  },
  {
    id: 2, name: 'Dr. Michael Chen', specialty: 'Neurologist',
    available: true, rating: 4.8, reviews: 245, experience: '15 yrs',
    fee: 1000, nextSlot: '11:00 AM', qualifications: 'MBBS, DM (Neurology)',
    hospital: 'Fortis Hospital', languages: ['English', 'Marathi'],
    about: 'Specializes in epilepsy, migraine, and neurodegenerative disorders.',
    slots: ['11:00 AM', '1:00 PM', '3:30 PM', '5:00 PM'],
    tags: ['Migraine', 'Epilepsy', 'Brain'],
    reviewList: [
      { author: 'Sunita P.', text: 'Changed my life with proper migraine treatment.', rating: 5, date: '3 days ago' },
      { author: 'Vikram R.', text: 'Very knowledgeable, patient with questions.', rating: 5, date: '1 week ago' },
    ]
  },
  {
    id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrician',
    available: false, rating: 4.7, reviews: 189, experience: '9 yrs',
    fee: 600, nextSlot: 'Tomorrow 9:00 AM', qualifications: 'MBBS, MD (Pediatrics)',
    hospital: 'Rainbow Hospital', languages: ['English'],
    about: "Dedicated to children's health from newborn to adolescent care.",
    slots: [],
    tags: ['Child Care', 'Vaccines', 'Growth'],
    reviewList: [
      { author: 'Meena T.', text: 'My kids love her! So gentle and kind.', rating: 5, date: '5 days ago' },
    ]
  },
  {
    id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedic',
    available: true, rating: 4.6, reviews: 201, experience: '18 yrs',
    fee: 900, nextSlot: '12:00 PM', qualifications: 'MBBS, MS (Ortho)',
    hospital: 'Narayana Hospital', languages: ['English', 'Hindi'],
    about: 'Expert in joint replacement, sports injuries and spine surgery.',
    slots: ['12:00 PM', '2:30 PM', '4:00 PM'],
    tags: ['Joints', 'Sports', 'Spine'],
    reviewList: [
      { author: 'Rohit D.', text: 'Fixed my knee injury perfectly!', rating: 5, date: '1 week ago' },
      { author: 'Geeta N.', text: 'Excellent surgeon, minimal recovery time.', rating: 4, date: '3 weeks ago' },
    ]
  },
  {
    id: 5, name: 'Dr. Lisa Anderson', specialty: 'Dermatologist',
    available: true, rating: 4.8, reviews: 298, experience: '11 yrs',
    fee: 700, nextSlot: '10:00 AM', qualifications: 'MBBS, DVD',
    hospital: 'Skin & You Clinic', languages: ['English', 'Gujarati'],
    about: 'Specializes in acne, psoriasis, hair loss and cosmetic dermatology.',
    slots: ['10:00 AM', '11:30 AM', '3:00 PM'],
    tags: ['Acne', 'Hair', 'Skin'],
    reviewList: [
      { author: 'Pooja L.', text: 'My skin has never looked better!', rating: 5, date: '2 days ago' },
      { author: 'Kiran V.', text: 'Very effective treatment plan.', rating: 5, date: '1 week ago' },
    ]
  },
  {
    id: 6, name: 'Dr. Robert Brown', specialty: 'General Physician',
    available: true, rating: 4.5, reviews: 421, experience: '20 yrs',
    fee: 400, nextSlot: '9:30 AM', qualifications: 'MBBS, MRCP',
    hospital: 'City Medical Centre', languages: ['English', 'Hindi', 'Marathi'],
    about: 'Experienced in managing chronic diseases, preventive care and acute illnesses.',
    slots: ['9:30 AM', '10:30 AM', '1:30 PM', '4:00 PM', '5:30 PM'],
    tags: ['General', 'Diabetes', 'Fever'],
    reviewList: [
      { author: 'Arjun M.', text: 'Always available, very thorough.', rating: 5, date: '1 day ago' },
      { author: 'Sneha K.', text: 'Best GP in the city!', rating: 5, date: '4 days ago' },
      { author: 'Dinesh P.', text: 'Very affordable and effective.', rating: 4, date: '2 weeks ago' },
    ]
  },
];

export default function ConsultDoctorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showDashboard, setShowDashboard] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Real doctors from DB
  const [realDoctors, setRealDoctors] = useState<RealDoctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/doctors')
      .then(r => r.json())
      .then(d => setRealDoctors(d.doctors ?? []))
      .catch(() => {})
      .finally(() => setDoctorsLoading(false));
  }, []);
  
  // Modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedRealDoctorId, setSelectedRealDoctorId] = useState<string | null>(null);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  
  // Form states
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [consultationType, setConsultationType] = useState<'online' | 'inperson'>('online');
  const [meetLink, setMeetLink] = useState('');
  const [calendarEventLink, setCalendarEventLink] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user' | 'doctor', text: string}>>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showChatModal) setShowChatModal(false);
        if (showAppointmentModal) setShowAppointmentModal(false);
        if (showDoctorDetails) setShowDoctorDetails(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showChatModal, showAppointmentModal, showDoctorDetails]);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }

  function handleCalendarDayClick(day: number) {
    const d = new Date(calendarYear, calendarMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayMidnight) return;
    const iso = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setAppointmentDate(iso);
  }

  function isPastDay(day: number) {
    const d = new Date(calendarYear, calendarMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  }

  function isSelectedDay(day: number) {
    const iso = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointmentDate === iso;
  }

  function isToday(day: number) {
    return calendarYear === today.getFullYear() && calendarMonth === today.getMonth() && day === today.getDate();
  }

  function prevMonth() {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  }

  function nextMonth() {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  }

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

  const handleVideoConsult = () => {
    openGoogleMeet();
  };

  const handleChatConsult = () => {
    setShowChatModal(true);
    setChatMessages([
      { sender: 'doctor', text: 'Hello! How can I help you today?' }
    ]);
  };

  const handleBookAppointment = (doctor?: Doctor, realDoctorId?: string) => {
    if (doctor) {
      setSelectedDoctor(doctor);
    }
    setSelectedRealDoctorId(realDoctorId ?? null);
    setShowAppointmentModal(true);
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetails(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, { sender: 'user', text: chatMessage }]);
      setChatMessage('');
      
      // Simulate doctor response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          sender: 'doctor', 
          text: 'Thank you for your message. A doctor will respond shortly.' 
        }]);
      }, 1000);
    }
  };

  const handleSubmitAppointment = async () => {
    if (!appointmentDate || !appointmentTime || !appointmentReason) return;

    setBookingSuccess(true);
    setCalendarError('');
    setCalendarEventLink('');
    setMeetLink(''); // Clear any previous meet link

    // Save appointment to DB — status will be "Pending" until doctor confirms
    const response = await fetch('/api/patient/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorName: selectedDoctor?.name ?? null,
        doctorId: selectedRealDoctorId,
        date: appointmentDate,
        time: appointmentTime,
        type: 'Consultation',
        mode: consultationType === 'online' ? 'Online' : 'Offline',
        reason: appointmentReason,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store calendar event link if created
      if (data.calendarEventLink) {
        setCalendarEventLink(data.calendarEventLink);
      }
    } else {
      setCalendarError('Failed to book appointment. Please try again.');
    }

    setTimeout(() => {
      setShowAppointmentModal(false);
      setBookingSuccess(false);
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentReason('');
      setMeetLink('');
      setCalendarEventLink('');
      setCalendarError('');
      setSelectedDoctor(null);
      setSelectedRealDoctorId(null);
    }, 10000);
  };

  if (!showDashboard) {
    return (
      <>
        <OpdScroll onScrollComplete={() => setShowDashboard(true)} />
      </>
    );
  }

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />
      
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 pt-32 pb-20"
      >
        {/* Mouse-controlled floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-blue-400/30 rounded-full blur-3xl transition-all duration-500 ease-out"
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
          <Stethoscope className="w-16 h-16 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-700 ease-out opacity-20"
          style={{
            right: `${15 + mousePosition.x * 10}%`,
            top: `${40 + mousePosition.y * 15}%`,
            transform: `rotate(${-mousePosition.y * 20}deg)`,
          }}
        >
          <Video className="w-20 h-20 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-600 ease-out opacity-20"
          style={{
            left: `${60 + mousePosition.y * 10}%`,
            bottom: `${20 + mousePosition.x * 10}%`,
            transform: `rotate(${mousePosition.y * 15}deg)`,
          }}
        >
          <MessageSquare className="w-14 h-14 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 transition-transform duration-300"
              style={{
                transform: `translateY(${mousePosition.y * -10}px)`,
              }}
            >
              Expert Medical Care,
              <span className="block text-blue-200">Anytime, Anywhere</span>
            </h1>
            <p 
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto transition-transform duration-500"
              style={{
                transform: `translateY(${mousePosition.y * -5}px)`,
              }}
            >
              Connect with certified doctors through video, chat, or in-person appointments. 
              Get professional healthcare from the comfort of your home.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white">
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Stethoscope className="w-5 h-5" />
                <span className="font-medium">500+ Specialists</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-400 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Video className="w-5 h-5" />
                <span className="font-medium">24/7 Available</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Instant Consultation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Home</span>
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">Consult Doctor</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Video Consultation Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Video Consultation</h3>
            <p className="text-gray-600 mb-4">Connect with doctors via video call</p>
            <button 
              type="button" 
              onClick={handleVideoConsult}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Start Video Call
            </button>
          </div>

          {/* Chat Consultation Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chat with Doctor</h3>
            <p className="text-gray-600 mb-4">Get instant medical advice via chat</p>
            <button 
              type="button" 
              onClick={handleChatConsult}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Start Chat
            </button>
          </div>

          {/* Book Appointment Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Book Appointment</h3>
            <p className="text-gray-600 mb-4">Schedule an in-person visit</p>
            <button 
              type="button" 
              onClick={() => handleBookAppointment()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Available Doctors Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Specialists</h2>

          {doctorsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : realDoctors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-600">No specialists registered yet</p>
              <p className="text-sm text-gray-400 mt-1">Doctors will appear here once they sign up.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleBookAppointment({
                    id: 0, name: doctor.name, specialty: doctor.specialty,
                    available: true, rating: 0, reviews: 0,
                    experience: doctor.experience ?? '', fee: 0, nextSlot: '',
                    qualifications: doctor.qualifications ?? '',
                    hospital: '', languages: [], about: '', slots: [], tags: [], reviewList: [],
                  }, doctor.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{doctor.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Stethoscope className="w-4 h-4 mr-1 shrink-0" />
                        {doctor.specialty}
                      </p>
                      {doctor.experience && (
                        <p className="text-xs text-gray-500 mt-1">{doctor.experience} experience</p>
                      )}
                      {doctor.qualifications && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{doctor.qualifications}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookAppointment({
                        id: 0, name: doctor.name, specialty: doctor.specialty,
                        available: true, rating: 0, reviews: 0,
                        experience: doctor.experience ?? '', fee: 0, nextSlot: '',
                        qualifications: doctor.qualifications ?? '',
                        hospital: '', languages: [], about: '', slots: [], tags: [], reviewList: [],
                      }, doctor.id);
                    }}
                    className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Book Consultation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowChatModal(false)}
        >
          <ScrollLock />
          <div
            className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[85dvh] sm:h-[600px] max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Chat with Doctor</h2>
                  <p className="text-gray-600 text-sm">Online now</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                aria-label="Close chat modal"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  aria-label="Send message"
                  className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setShowAppointmentModal(false);
            setSelectedDoctor(null);
            setBookingSuccess(false);
          }}
        >
          <ScrollLock />
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowAppointmentModal(false);
                setSelectedDoctor(null);
                setBookingSuccess(false);
              }}
              aria-label="Close appointment modal"
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {!bookingSuccess ? (
              <>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
                    <p className="text-gray-600 text-sm">Schedule your consultation</p>
                  </div>
                </div>

                {selectedDoctor && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{selectedDoctor.name}</h3>
                        <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                        <p className="text-sm text-gray-700 font-semibold mt-1">Fee: ₹{selectedDoctor.fee}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Consultation Type Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setConsultationType('online')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${consultationType === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Video className="w-4 h-4" /> Online (Video)
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultationType('inperson')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${consultationType === 'inperson' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <User className="w-4 h-4" /> In-Person
                      </button>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                        <button type="button" onClick={prevMonth} aria-label="Previous month" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-800">{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                        <button type="button" onClick={nextMonth} aria-label="Next month" className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      {/* Day names */}
                      <div className="grid grid-cols-7 text-center px-2 pt-2">
                        {DAY_NAMES.map(d => (
                          <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
                        ))}
                      </div>
                      {/* Days grid */}
                      <div className="grid grid-cols-7 text-center px-2 pb-3 gap-y-1">
                        {getCalendarDays(calendarYear, calendarMonth).map((day, i) => (
                          <div key={i} className="flex items-center justify-center">
                            {day === null ? <span /> : (
                              <button
                                type="button"
                                onClick={() => handleCalendarDayClick(day)}
                                disabled={isPastDay(day)}
                                className={`w-8 h-8 rounded-full text-sm font-medium transition-all
                                  ${isSelectedDay(day) ? 'bg-purple-600 text-white shadow-md' :
                                    isToday(day) ? 'border-2 border-purple-400 text-purple-700' :
                                    isPastDay(day) ? 'text-gray-300 cursor-not-allowed' :
                                    'hover:bg-purple-50 text-gray-700'}`}
                              >
                                {day}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {appointmentDate && (
                      <p className="text-xs text-purple-600 font-medium mt-1 ml-1">
                        Selected: {new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Time
                    </label>
                    {selectedDoctor && selectedDoctor.slots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedDoctor.slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setAppointmentTime(slot)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              appointmentTime === slot
                                ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        aria-label="Select appointment time"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      placeholder="Describe your symptoms or reason for consultation..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setSelectedDoctor(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitAppointment}
                    disabled={!appointmentDate || !appointmentTime || !appointmentReason}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Appointment Request Sent!</h3>
                <p className="text-gray-600 mb-4">Your appointment request has been sent to the doctor</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2">
                  {selectedDoctor && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Doctor:</span> {selectedDoctor.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Date:</span> {appointmentDate && new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Time:</span> {appointmentTime}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Type:</span> {consultationType === 'online' ? 'Online (Video)' : 'In-Person'}
                  </p>
                  
                  {/* Status message */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-100 rounded-lg p-3">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Waiting for Doctor Confirmation</p>
                        <p className="text-xs text-blue-600 mt-1">
                          The doctor will review your request and confirm the appointment. 
                          {consultationType === 'online' && ' You will receive the video call link once confirmed.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Google Calendar section */}
                  {calendarEventLink && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <a
                        href={calendarEventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors w-full justify-center"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        View in Google Calendar
                      </a>
                    </div>
                  )}
                  
                  {calendarError && (
                    <p className="text-xs text-amber-600 text-center mt-2">{calendarError}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDoctorDetails && selectedDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setShowDoctorDetails(false);
            setSelectedDoctor(null);
          }}
        >
          <ScrollLock />
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowDoctorDetails(false);
                setSelectedDoctor(null);
              }}
              aria-label="Close doctor details modal"
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex items-start space-x-6 mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedDoctor.name}</h2>
                <p className="text-lg text-gray-600 flex items-center mb-2">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  {selectedDoctor.specialty}
                </p>
                <p className="text-sm text-gray-600 mb-2">{selectedDoctor.qualifications}</p>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-semibold text-gray-700 ml-1">{selectedDoctor.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({selectedDoctor.reviews} reviews)</span>
                  </div>
                  <span className="text-sm text-gray-600">{selectedDoctor.experience} experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${selectedDoctor.available ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedDoctor.available ? 'Available Now' : 'Currently Busy'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Consultation Fee</span>
                  <span className="text-2xl font-bold text-blue-600">₹{selectedDoctor.fee}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedDoctor.about}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Hospital</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedDoctor.hospital}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDoctor.slots.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Available Slots Today</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.slots.map((slot) => (
                      <span
                        key={slot}
                        className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center"
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Patient Reviews</h3>
                <div className="space-y-3">
                  {selectedDoctor.reviewList.map((review, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{review.author}</span>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{review.text}</p>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDoctorDetails(false);
                  handleChatConsult();
                }}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat Now</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDoctorDetails(false);
                  handleBookAppointment(selectedDoctor);
                }}
                disabled={!selectedDoctor.available}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </NeuralNetworkContainer>
  );
}
