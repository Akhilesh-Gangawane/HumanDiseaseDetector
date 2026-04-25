'use client';

import { X, CheckCircle2, Download, Calendar, Truck, MapPin, CreditCard, Package, Phone, Mail } from 'lucide-react';
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
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  manufacturer?: string;
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

// Order Review Modal
interface OrderReviewModalProps {
  cart: CartItem[];
  address: Address;
  payment: PaymentDetails;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  onBack: () => void;
  onPlaceOrder: () => void;
}

export function OrderReviewModal({
  cart, address, payment, subtotal, deliveryFee, discount, total, onBack, onPlaceOrder
}: OrderReviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onBack}
          aria-label="Close review modal"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Review Your Order</h2>
            <p className="text-gray-600 text-sm">Please verify all details before placing order</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items ({cart.length})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl flex items-center justify-center text-3xl">
                  {item.image ?? '💊'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">Delivery Address</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{address.fullName}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p className="flex items-center space-x-2 mt-2">
              <Phone className="w-4 h-4" />
              <span>{address.phone}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{address.email}</span>
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800">Payment Method</h3>
          </div>
          <p className="text-sm text-gray-700 font-semibold">
            {payment.method === 'card' && 'Credit/Debit Card'}
            {payment.method === 'upi' && `UPI (${payment.upiId})`}
            {payment.method === 'netbanking' && `Net Banking (${payment.bank})`}
            {payment.method === 'cod' && 'Cash on Delivery'}
          </p>
          {payment.method === 'card' && payment.cardNumber && (
            <p className="text-sm text-gray-600 mt-1">
              Card ending in {payment.cardNumber.slice(-4)}
            </p>
          )}
        </div>

        {/* Price Summary */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Price Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee:</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount:</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-blue-300 pt-2 flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-2xl text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onPlaceOrder}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Place Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Order Success Modal
interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  onViewReceipt: () => void;
}

export function OrderSuccessModal({ order, onClose, onViewReceipt }: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <button
          onClick={onClose}
          aria-label="Close success modal"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. We'll deliver it soon!</p>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-bold text-gray-800">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="text-lg font-bold text-gray-800">
                  {order.orderDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-green-600">₹{order.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="text-lg font-bold text-gray-800">
                  {order.estimatedDelivery.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-6 text-blue-600">
            <Truck className="w-5 h-5" />
            <p className="text-sm font-medium">
              Your order will be delivered in 2-3 business days
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onViewReceipt}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>View Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Receipt Modal
interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  const handleDownload = () => { window.print(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <ScrollLock />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close receipt modal"
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors print:hidden"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div id="receipt-content">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Dhanvantari AI
            </h1>
            <p className="text-gray-600">Your Online Pharmacy</p>
            <p className="text-sm text-gray-500 mt-2">
              Email: support@dhanvantari.com | Phone: +91 1800-123-4567
            </p>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Receipt</h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-bold text-gray-800">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-bold text-gray-800">
                  {order.orderDate.toLocaleDateString()} {order.orderDate.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-bold text-gray-800">
                  {order.payment.method === 'card' && 'Credit/Debit Card'}
                  {order.payment.method === 'upi' && 'UPI'}
                  {order.payment.method === 'netbanking' && 'Net Banking'}
                  {order.payment.method === 'cod' && 'Cash on Delivery'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="font-bold text-green-600 capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Delivery Address</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="font-semibold text-gray-800">{order.address.fullName}</p>
              <p className="text-sm text-gray-700">{order.address.addressLine1}</p>
              {order.address.addressLine2 && (
                <p className="text-sm text-gray-700">{order.address.addressLine2}</p>
              )}
              <p className="text-sm text-gray-700">
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p className="text-sm text-gray-700 mt-2">Phone: {order.address.phone}</p>
              <p className="text-sm text-gray-700">Email: {order.address.email}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Item</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Qty</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.manufacturer && (
                          <p className="text-xs text-gray-500">{item.manufacturer}</p>
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-700">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee:</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-6">
            <p className="mb-2">Thank you for shopping with Dhanvantari AI!</p>
            <p>For any queries, contact us at support@dhanvantari.com or call +91 1800-123-4567</p>
            <p className="mt-4 text-xs text-gray-500">
              This is a computer-generated receipt and does not require a signature.
            </p>
          </div>
        </div>

        <div className="mt-6 print:hidden">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
