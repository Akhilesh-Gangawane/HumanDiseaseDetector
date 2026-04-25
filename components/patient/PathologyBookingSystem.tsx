'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Users, AlertCircle, CheckCircle2, Download, MapPin, Phone, Mail, FlaskConical, Loader2, Bell, TrendingUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { ScrollLock } from '@/hooks/useScrollLock';

interface TimeSlot {
  time: string;
  available: number;
  total: number;
  status: 'available' | 'limited' | 'full' | 'closed';
  waitlist: number;
}

interface BookingSlot {
  date: string;
  slots: TimeSlot[];
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  time: string;
  color: string;
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
  status: 'pending' | 'confirmed' | 'collected' | 'processing' | 'completed';
  queuePosition?: number;
  estimatedTime?: string;
  isWaitlisted?: boolean;
}

// Generate time slots for next 7 days
const generateTimeSlots = (): BookingSlot[] => {
  const slots: BookingSlot[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const timeSlots: TimeSlot[] = [
      { time: '6:00 AM - 7:00 AM', available: 8, total: 10, status: 'available', waitlist: 0 },
      { time: '7:00 AM - 8:00 AM', available: 3, total: 10, status: 'limited', waitlist: 2 },
      { time: '8:00 AM - 9:00 AM', available: 0, total: 10, status: 'full', waitlist: 5 },
      { time: '9:00 AM - 10:00 AM', available: 5, total: 10, status: 'available', waitlist: 0 },
      { time: '10:00 AM - 11:00 AM', available: 7, total: 10, status: 'available', waitlist: 0 },
      { time: '11:00 AM - 12:00 PM', available: 2, total: 10, status: 'limited', waitlist: 1 },
      { time: '12:00 PM - 1:00 PM', available: 0, total: 10, status: 'closed', waitlist: 0 },
      { time: '1:00 PM - 2:00 PM', available: 6, total: 10, status: 'available', waitlist: 0 },
      { time: '2:00 PM - 3:00 PM', available: 4, total: 10, status: 'available', waitlist: 0 },
      { time: '3:00 PM - 4:00 PM', available: 1, total: 10, status: 'limited', waitlist: 3 },
      { time: '4:00 PM - 5:00 PM', available: 0, total: 10, status: 'full', waitlist: 7 },
      { time: '5:00 PM - 6:00 PM', available: 9, total: 10, status: 'available', waitlist: 0 },
    ];
    
    slots.push({ date: dateStr, slots: timeSlots });
  }
  
  return slots;
};

// Booking Time Slot Selector Modal
interface BookingTimeSelectorProps {
  onSelectSlot: (date: string, time: string, isWaitlist: boolean) => void;
  onClose: () => void;
}

export function BookingTimeSelector({ onSelectSlot, onClose }: BookingTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showWaitlistConfirm, setShowWaitlistConfirm] = useState(false);
  const bookingSlots = generateTimeSlots();

  const handleSlotClick = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedTime(slot.time);
    if (slot.status === 'full') {
      setShowWaitlistConfirm(true);
    } else if (slot.status === 'closed') {
      Swal.fire({ icon: 'info', title: 'Slot Closed', text: 'This time slot is closed. Please select another available time.', confirmButtonColor: '#0d9488' });
    } else {
      onSelectSlot(date, slot.time, false);
    }
  };

  const handleWaitlistConfirm = () => {
    onSelectSlot(selectedDate, selectedTime, true);
    setShowWaitlistConfirm(false);
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100';
      case 'limited': return 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100';
      case 'full': return 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100';
      case 'closed': return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4" />;
      case 'limited': return <AlertCircle className="w-4 h-4" />;
      case 'full': return <Users className="w-4 h-4" />;
      case 'closed': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close time selector"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Select Collection Time</h2>
            <p className="text-gray-600 text-sm">Choose your preferred date and time slot</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Limited Slots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Full (Waitlist Available)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">Closed</span>
          </div>
        </div>

        {/* Date Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {bookingSlots.map((slot, index) => {
            const date = new Date(slot.date);
            const isToday = index === 0;
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <button
                key={slot.date}
                type="button"
                onClick={() => setSelectedDate(slot.date)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl border-2 transition-all ${
                  selectedDate === slot.date
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500">{isToday ? 'Today' : dayName}</div>
                  <div className="text-lg font-bold">{dayNum}</div>
                  <div className="text-xs text-gray-500">{month}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Available Time Slots</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bookingSlots
                .find(s => s.date === selectedDate)
                ?.slots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotClick(selectedDate, slot)}
                    disabled={slot.status === 'closed'}
                    className={`p-4 rounded-xl border-2 transition-all ${getSlotColor(slot.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-4 h-4" />
                      {getStatusIcon(slot.status)}
                    </div>
                    <div className="text-sm font-semibold mb-1">{slot.time}</div>
                    <div className="text-xs">
                      {slot.status === 'closed' ? (
                        <span>Closed</span>
                      ) : slot.status === 'full' ? (
                        <span>Waitlist: {slot.waitlist}</span>
                      ) : (
                        <span>{slot.available}/{slot.total} slots</span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Please select a date to view available time slots</p>
          </div>
        )}

        {/* Waitlist Confirmation Modal */}
        {showWaitlistConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl p-6 max-w-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Join Waitlist?</h3>
                  <p className="text-sm text-gray-600">This slot is currently full</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                This time slot is fully booked. Would you like to join the waitlist? We'll notify you if a slot becomes available.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowWaitlistConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWaitlistConfirm}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Booking Status Tracker
interface BookingStatusTrackerProps {
  booking: Booking;
  onClose: () => void;
}

export function BookingStatusTracker({ booking, onClose }: BookingStatusTrackerProps) {
  const statusSteps = [
    { key: 'pending', label: 'Booking Confirmed', icon: <CheckCircle2 className="w-6 h-6" />, color: 'text-green-600' },
    { key: 'confirmed', label: 'Sample Collection Scheduled', icon: <Calendar className="w-6 h-6" />, color: 'text-blue-600' },
    { key: 'collected', label: 'Sample Collected', icon: <FlaskConical className="w-6 h-6" />, color: 'text-purple-600' },
    { key: 'processing', label: 'Lab Processing', icon: <Loader2 className="w-6 h-6 animate-spin" />, color: 'text-orange-600' },
    { key: 'completed', label: 'Report Ready', icon: <Download className="w-6 h-6" />, color: 'text-teal-600' },
  ];
  const currentStepIndex = statusSteps.findIndex(step => step.key === booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
        <button
          onClick={onClose}
          aria-label="Close status tracker"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Status</h2>
          <p className="text-gray-600">Booking ID: <span className="font-semibold">{booking.bookingId}</span></p>
        </div>

        {/* Status Timeline */}
        <div className="relative mb-8">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="relative flex items-start mb-8 last:mb-0">
                {/* Connector Line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-16 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
                
                {/* Icon */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  <div className={isCompleted ? step.color : 'text-gray-400'}>
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      isCompleted ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <div className="mt-2">
                      {booking.isWaitlisted ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Waitlist Position:</strong> #{booking.queuePosition}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            We'll notify you when a slot becomes available
                          </p>
                        </div>
                      ) : booking.queuePosition ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Queue Position:</strong> #{booking.queuePosition}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Estimated time: {booking.estimatedTime}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">In progress...</p>
                      )}
                    </div>
                  )}
                  {isCompleted && !isCurrent && (
                    <p className="text-sm text-green-600 mt-1">✓ Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collection Details */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Collection Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Collection Date & Time</p>
                <p className="text-gray-600">
                  {booking.sampleCollectionDate.toLocaleDateString()} at {booking.address.preferredTime}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Collection Address</p>
                <p className="text-gray-600">
                  {booking.address.addressLine1}, {booking.address.city}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Contact</p>
                <p className="text-gray-600">{booking.address.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {booking.status === 'completed' && (
            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Queue Management Display
interface QueueDisplayProps {
  currentPosition: number;
  totalInQueue: number;
  estimatedWaitTime: string;
  onClose: () => void;
}

export function QueueDisplay({ currentPosition, totalInQueue, estimatedWaitTime, onClose }: QueueDisplayProps) {
  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-6 shadow-2xl border-2 border-purple-200 z-50 animate-fade-in max-w-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Queue Status</h3>
            <p className="text-xs text-gray-600">Live updates</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close queue display"
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">#{currentPosition}</div>
            <div className="text-sm text-gray-600">Your Position</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{totalInQueue}</div>
            <div className="text-xs text-gray-600">In Queue</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{estimatedWaitTime}</div>
            <div className="text-xs text-gray-600">Est. Wait</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>Queue moving smoothly</span>
        </div>
      </div>
    </div>
  );
}
