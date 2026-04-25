'use client';

import { X, MapPin, CreditCard, CheckCircle2, Download, Calendar, Truck, Home, Building, User, Phone, Mail } from 'lucide-react';
import { ScrollLock } from '@/hooks/useScrollLock';

interface Address {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
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

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  orderId: string;
  items: CartItem[];
  total: number;
  address: Address;
  payment: PaymentDetails;
  orderDate: Date;
  estimatedDelivery: Date;
  status: string;
}

// Address Modal
interface AddressModalProps {
  address: Address;
  onAddressChange: (address: Address) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function AddressModal({ address, onAddressChange, onBack, onContinue }: AddressModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onBack}
          aria-label="Close address modal"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Delivery Address</h2>
            <p className="text-gray-600 text-sm">Where should we deliver your order?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => onAddressChange({ ...address, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => onAddressChange({ ...address, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={address.email}
              onChange={(e) => onAddressChange({ ...address, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={address.addressLine1}
              onChange={(e) => onAddressChange({ ...address, addressLine1: e.target.value })}
              placeholder="House No., Building Name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={address.addressLine2}
              onChange={(e) => onAddressChange({ ...address, addressLine2: e.target.value })}
              placeholder="Road Name, Area, Colony"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => onAddressChange({ ...address, state: e.target.value })}
                placeholder="Maharashtra"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => onAddressChange({ ...address, pincode: e.target.value })}
                placeholder="400001"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Type
            </label>
            <div className="flex space-x-4">
              {(['home', 'work', 'other'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onAddressChange({ ...address, addressType: type })}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    address.addressType === type
                      ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  {type === 'home' && <Home className="w-5 h-5 inline mr-2" />}
                  {type === 'work' && <Building className="w-5 h-5 inline mr-2" />}
                  {type === 'other' && <MapPin className="w-5 h-5 inline mr-2" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Cart
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Modal
interface PaymentModalProps {
  payment: PaymentDetails;
  onPaymentChange: (payment: PaymentDetails) => void;
  total: number;
  onBack: () => void;
  onContinue: () => void;
}

export function PaymentModal({ payment, onPaymentChange, total, onBack, onContinue }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onBack}
          aria-label="Close payment modal"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
            <p className="text-gray-600 text-sm">Choose your preferred payment option</p>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { method: 'card' as const, label: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> },
            { method: 'upi' as const, label: 'UPI', icon: <Phone className="w-5 h-5" /> },
            { method: 'netbanking' as const, label: 'Net Banking', icon: <Building className="w-5 h-5" /> },
            { method: 'cod' as const, label: 'Cash on Delivery', icon: <Truck className="w-5 h-5" /> },
          ].map((option) => (
            <button
              key={option.method}
              type="button"
              onClick={() => onPaymentChange({ ...payment, method: option.method })}
              className={`flex items-center space-x-3 px-4 py-4 rounded-xl border-2 transition-all ${
                payment.method === option.method
                  ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Payment Details Forms */}
        <div className="space-y-4">
          {payment.method === 'card' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={payment.cardNumber || ''}
                  onChange={(e) => onPaymentChange({ ...payment, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={payment.cardName || ''}
                  onChange={(e) => onPaymentChange({ ...payment, cardName: e.target.value })}
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    value={payment.expiryDate || ''}
                    onChange={(e) => onPaymentChange({ ...payment, expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="password"
                    value={payment.cvv || ''}
                    onChange={(e) => onPaymentChange({ ...payment, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {payment.method === 'upi' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                value={payment.upiId || ''}
                onChange={(e) => onPaymentChange({ ...payment, upiId: e.target.value })}
                placeholder="yourname@upi"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {payment.method === 'netbanking' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Bank *
              </label>
              <select
                value={payment.bank || ''}
                onChange={(e) => onPaymentChange({ ...payment, bank: e.target.value })}
                aria-label="Select your bank"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {payment.method === 'cod' && (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Cash on Delivery:</strong> Pay when you receive your order. Please keep exact change ready.
              </p>
            </div>
          )}
        </div>

        {/* Total Amount */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Amount to Pay:</span>
            <span className="text-3xl font-bold text-purple-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Review Order
          </button>
        </div>
      </div>
    </div>
  );
}
