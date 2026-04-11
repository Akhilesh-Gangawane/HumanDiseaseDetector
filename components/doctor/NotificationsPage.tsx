'use client';

import { Bell, Check, Clock, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { useDoctorState } from './DoctorStateContext';

export default function NotificationsPage() {
    const { notifications, setNotifications } = useDoctorState();

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case 'result':
                return <Check className="w-6 h-6 text-green-500" />;
            default:
                return <Bell className="w-6 h-6 text-blue-500" />;
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        await fetch('/api/doctor/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true }),
        });
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
        await fetch('/api/doctor/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, delete: true }),
        });
    };

    const markAllAsRead = async () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        await fetch('/api/doctor/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllRead: true }),
        });
    };

    const clearAll = async () => {
        setNotifications([]);
        await fetch('/api/doctor/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clearAll: true }),
        });
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">Review your recent clinic alerts and updates</p>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Mark all read
                    </button>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No new notifications</p>
                        </div>
                    ) : notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`flex items-start gap-4 p-4 border rounded-xl transition-colors duration-200 cursor-pointer ${notif.read ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50'}`}
                        >
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                                <p className="text-gray-600 mt-1">{notif.message}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {notif.time}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {!notif.read && (
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => deleteNotification(notif.id, e)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete notification"
                                    aria-label="Delete notification"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
