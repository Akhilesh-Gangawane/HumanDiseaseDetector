'use client';

import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'High-Risk Patient Alert',
    message: 'John Doe requires immediate attention',
    time: '5 mins ago',
    type: 'alert',
    read: false,
  },
  {
    id: 2,
    title: 'New AI Prediction',
    message: 'AI has analyzed Emma Wilson\'s symptoms',
    time: '15 mins ago',
    type: 'info',
    read: false,
  },
  {
    id: 3,
    title: 'Appointment Reminder',
    message: 'You have 3 appointments today',
    time: '1 hour ago',
    type: 'reminder',
    read: false,
  },
  {
    id: 4,
    title: 'Medicine Review',
    message: 'New medicine requires your approval',
    time: '2 hours ago',
    type: 'info',
    read: true,
  },
  {
    id: 5,
    title: 'Consultation Request',
    message: 'Dr. Michael Chen requested consultation',
    time: '3 hours ago',
    type: 'info',
    read: true,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifications);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-700';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors ${
                  !notif.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          notif.type
                        )}`}
                      >
                        {notif.type}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      aria-label="Mark notification as read"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
