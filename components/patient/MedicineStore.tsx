'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Heart, Star, TrendingUp, Package, Clock, Shield, X, Plus, Minus, Pill, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  rating?: number;
  reviews?: number;
  in_stock: boolean;
  prescription_required: boolean;
  manufacturer?: string;
  description?: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

export default function MedicineStore() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch('/api/public/medicines')
      .then(r => r.json())
      .then(d => setMedicines(d.medicines ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(medicines.map(m => m.category).filter(Boolean)))];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (med.category ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) return prev.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

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
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MediStore</h1>
                <p className="text-xs text-gray-500">Your Health, Our Priority</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Home</span>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Free Delivery</div>
              <div className="text-xs text-gray-500">On orders above â‚¹500</div>
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

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Medicine Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {medicines.length === 0 ? 'No medicines in catalogue yet' : 'No medicines found'}
            </h3>
            <p className="text-gray-600">
              {medicines.length === 0 ? 'The medicine catalogue will appear here once added.' : 'Try adjusting your search or filters'}
            </p>
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
      </div>

      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          total={cartTotal}
        />
      )}
    </div>
  );
}

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
}

function MedicineCard({ medicine, onAddToCart, onToggleWishlist, isWishlisted }: MedicineCardProps) {
  const discount = medicine.original_price
    ? Math.round((1 - medicine.price / medicine.original_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 p-8 flex items-center justify-center h-48">
        <div className="text-6xl">ðŸ’Š</div>
        <button
          type="button"
          onClick={() => onToggleWishlist(medicine.id)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {discount}% OFF
          </div>
        )}
        {medicine.prescription_required && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
            Rx Required
          </div>
        )}
      </div>
      <div className="p-4">
        {medicine.category && (
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {medicine.category}
            </span>
          </div>
        )}
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{medicine.name}</h3>
        {medicine.manufacturer && <p className="text-xs text-gray-500 mb-2">{medicine.manufacturer}</p>}
        {medicine.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medicine.description}</p>}
        {medicine.rating != null && (
          <div className="flex items-center space-x-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-800">{medicine.rating}</span>
            {medicine.reviews != null && <span className="text-xs text-gray-500">({medicine.reviews})</span>}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-800">â‚¹{medicine.price}</div>
            {medicine.original_price && (
              <div className="text-sm text-gray-400 line-through">â‚¹{medicine.original_price}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(medicine)}
            disabled={!medicine.in_stock}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              medicine.in_stock
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg hover:scale-105'
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
}

function CartDrawer({ cart, onClose, onRemove, onUpdateQuantity, total }: CartDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close cart">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl flex items-center justify-center text-3xl">ðŸ’Š</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                {item.manufacturer && <p className="text-xs text-gray-500">{item.manufacturer}</p>}
                <p className="text-lg font-bold text-gray-800 mt-1">â‚¹{item.price}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <button type="button" onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 transition-colors" aria-label="Remove from cart">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                  <button type="button" onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors" aria-label="Decrease quantity">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-3 font-semibold text-gray-800">{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors" aria-label="Increase quantity">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-gray-800">â‚¹{total.toFixed(2)}</span>
            </div>
            <button type="button" className="w-full py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

