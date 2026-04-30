'use client';

import { useState, useEffect } from 'react';
import { Package, FlaskConical, Stethoscope, Calendar, MapPin, Clock, Download, Eye, X, CheckCircle2, Truck, Loader2, AlertCircle, Video, Trash2 } from 'lucide-react';
import { ScrollLock } from '@/hooks/useScrollLock';
import Swal from 'sweetalert2';

interface OrderItem {
  name: string;
  quantity?: number;
  price: number;
}

interface Order {
  id: string;
  type: 'medicine' | 'pathology' | 'consultation';
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  meetLink?: string | null;
  collectionDate?: string | null;
  collectionTime?: string | null;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  trackingId?: string | null;
}

export default function OrdersBookings() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'medicine' | 'pathology' | 'consultation'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/public/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(o => o.type === selectedTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'shipped':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
      case 'confirmed':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medicine':
        return <Package className="w-5 h-5" />;
      case 'pathology':
        return <FlaskConical className="w-5 h-5" />;
      case 'consultation':
        return <Stethoscope className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medicine':
        return 'bg-green-100 text-green-700';
      case 'pathology':
        return 'bg-purple-100 text-purple-700';
      case 'consultation':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      await Swal.fire({
        icon: 'error',
        title: 'Cannot Delete',
        text: 'Only pending orders can be deleted',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Order?',
      text: `Are you sure you want to delete this ${order.type} order? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setDeletingOrderId(order.id);

    try {
      let endpoint = '';
      switch (order.type) {
        case 'medicine':
          endpoint = `/api/patient/medicine-orders?id=${order.id}`;
          break;
        case 'pathology':
          endpoint = `/api/patient/lab-bookings?id=${order.id}`;
          break;
        case 'consultation':
          endpoint = `/api/patient/appointments?id=${order.id}`;
          break;
      }

      const response = await fetch(endpoint, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: data.message || 'Order has been deleted successfully',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
      });

      // Refresh orders list
      fetchOrders();
      
      // Close modal if it's open
      if (showDetails && selectedOrder?.id === order.id) {
        setShowDetails(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to delete order',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">My Orders & Bookings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track all your medicine orders, lab test bookings, and doctor consultations in one place
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { key: 'all' as const, label: 'All Orders', count: orders.length },
            { key: 'medicine' as const, label: 'Medicine', count: orders.filter(o => o.type === 'medicine').length },
            { key: 'pathology' as const, label: 'Lab Tests', count: orders.filter(o => o.type === 'pathology').length },
            { key: 'consultation' as const, label: 'Consultations', count: orders.filter(o => o.type === 'consultation').length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600">You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${getTypeColor(order.type)}`}>
                      {getTypeIcon(order.type)}
                      <span className="text-sm font-semibold capitalize">{order.type}</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-semibold capitalize">{order.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Order ID: <span className="font-semibold text-gray-800">{order.id}</span></p>
                  <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>

                {/* Items */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 flex-1">
                          {item.name}
                          {item.quantity && <span className="text-gray-400"> x{item.quantity}</span>}
                        </span>
                        <span className="font-semibold text-gray-800">₹{item.price}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-blue-600 font-medium">+{order.items.length - 2} more items</p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 bg-gray-50">
                  {order.type === 'medicine' && order.deliveryAddress && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  )}
                  {order.type === 'pathology' && order.collectionDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>Collection: {new Date(order.collectionDate).toLocaleDateString()}{order.collectionTime ? ` at ${order.collectionTime}` : ''}</span>
                    </div>
                  )}
                  {order.type === 'consultation' && order.appointmentDate && (
                    <div className="space-y-2 mb-3">
                      {order.doctorName && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Stethoscope className="w-4 h-4" />
                          <span>{order.doctorName}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.appointmentDate).toLocaleDateString()}{order.appointmentTime ? ` at ${order.appointmentTime}` : ''}</span>
                      </div>
                      {order.meetLink && (
                        <a href={order.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-indigo-600 hover:underline">
                          <Video className="w-4 h-4" />
                          <span>Join Google Meet</span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-gray-800">₹{order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order);
                          }}
                          disabled={deletingOrderId === order.id}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete order"
                        >
                          {deletingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <ScrollLock />
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowDetails(false)}
                aria-label="Close order details"
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(selectedOrder.type)}`}>
                    {getTypeIcon(selectedOrder.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                    <p className="text-gray-600 text-sm">{selectedOrder.id}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-semibold capitalize">{selectedOrder.status}</span>
                </div>
              </div>
              <div className="mb-6 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.quantity && <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>}
                      </div>
                      <p className="text-lg font-bold text-gray-800">₹{item.price}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery/Collection Details */}
              {selectedOrder.deliveryAddress && (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedOrder.type === 'medicine' ? 'Delivery Address' : 'Collection Address'}
                    </h3>
                  </div>
                  <p className="text-gray-700">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.trackingId && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-sm text-gray-600">Tracking ID: <span className="font-semibold text-gray-800">{selectedOrder.trackingId}</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address for medicine orders */}
              {selectedOrder.type === 'medicine' && selectedOrder.deliveryAddress && (
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-800">Delivery Address</h3>
                  </div>
                  <p className="text-gray-700">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.paymentMethod && (
                    <p className="text-sm text-gray-500 mt-2">Payment: <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span></p>
                  )}
                </div>
              )}

              {/* Appointment Details */}
              {selectedOrder.type === 'consultation' && (
                <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    {selectedOrder.doctorName && (
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Doctor</p>
                          <p className="font-semibold text-gray-800">{selectedOrder.doctorName}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.appointmentDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Date &amp; Time</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(selectedOrder.appointmentDate).toLocaleDateString()}{selectedOrder.appointmentTime ? ` at ${selectedOrder.appointmentTime}` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.meetLink && (
                      <a href={selectedOrder.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-indigo-600 hover:underline">
                        <Video className="w-5 h-5" />
                        <span className="font-semibold">Join Google Meet</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                {selectedOrder.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder)}
                    disabled={deletingOrderId === selectedOrder.id}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingOrderId === selectedOrder.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Delete Order</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className={`px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors ${
                    selectedOrder.status !== 'pending' ? 'col-span-2' : ''
                  }`}
                >
                  Close
                </button>
                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed') && (
                  <button
                    type="button"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download {selectedOrder.type === 'pathology' ? 'Report' : 'Invoice'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
