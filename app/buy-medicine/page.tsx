'use client';

import { useState, useRef, useEffect } from 'react';
import MedicineScroll from '@/components/patient/MedicineScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import Footer from '@/components/patient/Footer';
import { AddressModal, PaymentModal } from '@/components/patient/CheckoutModals';
import { OrderReviewModal, OrderSuccessModal, ReceiptModal } from '@/components/patient/OrderModals';
import Swal from 'sweetalert2';
import { ShoppingCart, Search, Heart, Star, TrendingUp, Package, Clock, Shield, X, Plus, Minus, Pill, ArrowLeft, Zap, Award, CreditCard, Truck, MapPin, Phone, Mail, User, CheckCircle2, Download, Calendar, Home, Building, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  requires_prescription: boolean;
  image: string;
  manufacturer: string;
  description: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

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

interface Order {
  orderId: string;
  items: CartItem[];
  total: number;
  address: Address;
  payment: PaymentDetails;
  orderDate: Date;
  estimatedDelivery: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

export default function BuyMedicinePage() {
  const router = useRouter();
  const [showStore, setShowStore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Dynamic data from API
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [medicineStats, setMedicineStats] = useState({ total: '10K+', orders: '50K+', rating: '4.8★' });
  
  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'review' | 'success'>('cart');
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home'
  });
  const [payment, setPayment] = useState<PaymentDetails>({
    method: 'card'
  });
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch medicines from API
  useEffect(() => {
    fetch('/api/public/medicines')
      .then(r => r.json())
      .then(d => {
        const meds = (d.medicines ?? []).map((m: Medicine) => ({ ...m, image: '💊' }));
        setMedicines(meds);
      })
      .catch(() => {})
      .finally(() => setLoadingMedicines(false));
  }, []);

  // Fetch platform stats
  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => {
        if (d.medicines) {
          setMedicineStats({
            total: d.medicines > 1000 ? `${Math.floor(d.medicines / 1000)}K+` : `${d.medicines}+`,
            orders: d.predictions > 1000 ? `${Math.floor(d.predictions / 1000)}K+` : `${d.predictions}+`,
            rating: '4.8★',
          });
        }
      })
      .catch(() => {});
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
  }, [showStore]);

  // Derive categories dynamically from fetched medicines
  const categories = ['All', ...Array.from(new Set(medicines.map(m => m.category).filter(Boolean)))];

  if (!showStore) {
    return (
      <>
        <MedicineScroll onScrollComplete={() => setShowStore(true)} />
      </>
    );
  }

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         med.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cartTotal >= 500 ? 0 : 50;
  const finalTotal = cartTotal + deliveryFee - discount;

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'HEALTH25') {
      setDiscount(cartTotal * 0.25);
    } else if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(cartTotal * 0.10);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Promo Code',
        text: 'The promo code you entered is not valid. Try HEALTH25 or SAVE10.',
        confirmButtonColor: '#0d9488',
      });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep('address');
    setShowCart(false);
  };

  const validateAddress = (): boolean => {
    return !!(
      address.fullName &&
      address.phone &&
      address.email &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.pincode
    );
  };

  const validatePayment = (): boolean => {
    if (payment.method === 'cod') return true;
    if (payment.method === 'upi') return !!payment.upiId;
    if (payment.method === 'netbanking') return !!payment.bank;
    if (payment.method === 'card') {
      return !!(
        payment.cardNumber &&
        payment.cardName &&
        payment.expiryDate &&
        payment.cvv
      );
    }
    return false;
  };

  const placeOrder = async () => {
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    const orderDate = new Date();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const order: Order = {
      orderId,
      items: [...cart],
      total: finalTotal,
      address: { ...address },
      payment: { ...payment },
      orderDate,
      estimatedDelivery,
      status: 'confirmed'
    };

    setCurrentOrder(order);
    setCheckoutStep('success');
    setCart([]);
    setDiscount(0);
    setPromoCode('');

    // Save to DB
    await fetch('/api/patient/medicine-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, manufacturer: i.manufacturer })),
        total: finalTotal,
        address: `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`,
        paymentMethod: payment.method,
      }),
    }).catch(() => { /* non-critical */ });
  };

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      {/* Hero Section with Mouse Animation */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 pt-32 pb-20"
      >
        {/* Mouse-controlled floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-green-400/30 rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: `translate(-50%, -50%) scale(${1 + mousePosition.y * 0.3})`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-blue-400/20 rounded-full blur-3xl transition-all duration-700 ease-out"
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
          <Pill className="w-16 h-16 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-700 ease-out opacity-20"
          style={{
            right: `${15 + mousePosition.x * 10}%`,
            top: `${40 + mousePosition.y * 15}%`,
            transform: `rotate(${-mousePosition.y * 20}deg)`,
          }}
        >
          <ShoppingCart className="w-20 h-20 text-white" />
        </div>
        <div 
          className="absolute transition-all duration-600 ease-out opacity-20"
          style={{
            left: `${60 + mousePosition.y * 10}%`,
            bottom: `${20 + mousePosition.x * 10}%`,
            transform: `rotate(${mousePosition.y * 15}deg)`,
          }}
        >
          <Package className="w-14 h-14 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 transition-transform duration-300"
              style={{
                transform: `translateY(${mousePosition.y * -10}px)`,
              }}
            >
              Your Online Pharmacy
              <span className="block text-green-200">Delivered to Your Door</span>
            </h1>
            <p 
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto transition-transform duration-500"
              style={{
                transform: `translateY(${mousePosition.y * -5}px)`,
              }}
            >
              Order genuine medicines online with free home delivery. 10,000+ products, verified quality, and same-day delivery available.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white">
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Free Delivery</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-400 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">100% Genuine</span>
              </div>
              <div 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-white/20 hover:scale-105"
                style={{
                  transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px)`,
                }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Same-Day Delivery</span>
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
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors">Back to Home</span>
          </button>

          <button
            onClick={() => setShowCart(true)}
            className="relative px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { val: medicineStats.total, label: 'Products', icon: <Pill size={20} /> },
            { val: medicineStats.orders, label: 'Orders Delivered', icon: <Package size={20} /> },
            { val: medicineStats.rating, label: 'Customer Rating', icon: <Star size={20} /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-2 text-green-600">{s.icon}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{s.val}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-800">Special Offer:</span>
          <span className="text-gray-600">Use code <span className="font-bold text-yellow-700">HEALTH25</span> for 25% off on first order!</span>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Free Delivery</div>
              <div className="text-xs text-gray-500">On orders above ₹500</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Same Day</div>
              <div className="text-xs text-gray-500">Delivery available</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">100% Genuine</div>
              <div className="text-xs text-gray-500">Verified products</div>
            </div>
          </div>
        </div>

        {/* Medicine Grid */}
        {loadingMedicines ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedicines.map(medicine => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(medicine.id)}
              />
            ))}
          </div>
        )}

        {!loadingMedicines && filteredMedicines.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No medicines found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && checkoutStep === 'cart' && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          total={cartTotal}
          deliveryFee={deliveryFee}
          discount={discount}
          finalTotal={finalTotal}
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          onApplyPromo={applyPromoCode}
          onCheckout={handleCheckout}
        />
      )}

      {/* Address Modal */}
      {checkoutStep === 'address' && (
        <AddressModal
          address={address}
          onAddressChange={setAddress}
          onBack={() => {
            setCheckoutStep('cart');
            setShowCart(true);
          }}
          onContinue={() => {
            if (validateAddress()) {
              setCheckoutStep('payment');
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Missing Details',
                text: 'Please fill all required address fields before continuing.',
                confirmButtonColor: '#0d9488',
              });
            }
          }}
        />
      )}

      {/* Payment Modal */}
      {checkoutStep === 'payment' && (
        <PaymentModal
          payment={payment}
          onPaymentChange={setPayment}
          total={finalTotal}
          onBack={() => setCheckoutStep('address')}
          onContinue={() => {
            if (validatePayment()) {
              setCheckoutStep('review');
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Incomplete Payment',
                text: 'Please fill all payment details before continuing.',
                confirmButtonColor: '#0d9488',
              });
            }
          }}
        />
      )}

      {/* Order Review Modal */}
      {checkoutStep === 'review' && (
        <OrderReviewModal
          cart={cart}
          address={address}
          payment={payment}
          subtotal={cartTotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={finalTotal}
          onBack={() => setCheckoutStep('payment')}
          onPlaceOrder={placeOrder}
        />
      )}

      {/* Order Success Modal */}
      {checkoutStep === 'success' && currentOrder && (
        <OrderSuccessModal
          order={currentOrder}
          onClose={() => {
            setCheckoutStep('cart');
            setCurrentOrder(null);
          }}
          onViewReceipt={() => setShowReceipt(true)}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && currentOrder && (
        <ReceiptModal
          order={currentOrder}
          onClose={() => setShowReceipt(false)}
        />
      )}

      <Footer />
    </NeuralNetworkContainer>
  );
}


interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
}

function MedicineCard({ medicine, onAddToCart, onToggleWishlist, isWishlisted }: MedicineCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative bg-gradient-to-br from-green-50 to-teal-50 p-8 flex items-center justify-center h-48">
        <div className="text-6xl">{medicine.image}</div>
        
        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => onToggleWishlist(medicine.id)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* Discount Badge */}
        {medicine.original_price && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {Math.round((1 - medicine.price / medicine.original_price) * 100)}% OFF
          </div>
        )}

        {/* Prescription Badge */}
        {medicine.requires_prescription && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
            Rx Required
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {medicine.category}
          </span>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{medicine.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{medicine.manufacturer}</p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-800">{medicine.rating}</span>
          <span className="text-xs text-gray-500">({medicine.reviews_count})</span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-800">₹{medicine.price}</div>
            {medicine.original_price && (
              <div className="text-sm text-gray-400 line-through">₹{medicine.original_price}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(medicine)}
            disabled={!medicine.in_stock}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              medicine.in_stock
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {medicine.in_stock ? 'Add' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  total: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromo: () => void;
  onCheckout: () => void;
}

function CartDrawer({ cart, onClose, onRemove, onUpdateQuantity, total, deliveryFee, discount, finalTotal, promoCode, onPromoCodeChange, onApplyPromo, onCheckout }: CartDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl flex items-center justify-center text-3xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.manufacturer}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove from cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Promo Code */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={onApplyPromo}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Apply
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
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
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-2xl text-gray-800">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
