'use client';

/**
 * PatientStateContext
 *
 * Provides shared realtime state for the patient dashboard:
 *   - notifications (with live unread count)
 *   - appointments (with live status updates)
 *
 * Wrap the patient layout with <PatientStateProvider> so all child
 * pages and the navbar share a single Supabase subscription.
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react';
import { useRealtimeNotifications, type RealtimeNotification } from '@/hooks/useRealtimeNotifications';
import { useRealtimeAppointments, type RealtimeAppointment } from '@/hooks/useRealtimeAppointments';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PatientNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
}

export interface PatientAppointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  mode: 'Online' | 'Offline';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  reason: string;
  initiatedBy: string;
  meetLink: string | null;
  calendarEventId: string | null;
  calendarEventLink: string | null;
}

interface PatientContextType {
  userId: string | null;
  patientRowId: string | null;
  notifications: PatientNotification[];
  appointments: PatientAppointment[];
  setAppointments: React.Dispatch<React.SetStateAction<PatientAppointment[]>>;
  unreadCount: number;
  loadingNotifs: boolean;
  loadingApts: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────

export const PatientStateContext = createContext<PatientContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function PatientStateProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId]               = useState<string | null>(null);
  const [patientRowId, setPatientRowId]   = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [appointments, setAppointments]   = useState<PatientAppointment[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingApts, setLoadingApts]     = useState(true);

  // ── Bootstrap ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const responses = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/patient/notifications'),
          fetch('/api/patient/appointments'),
        ]);

        const [pData, nData, aData] = await Promise.all(
          responses.map(res => res.ok ? res.json() : Promise.resolve({}))
        );

        if (pData.userId)       setUserId(pData.userId);
        if (pData.patientRowId) setPatientRowId(pData.patientRowId);
        if (nData.notifications) setNotifications(nData.notifications);
        if (aData.appointments)  setAppointments(aData.appointments);
      } catch (err) {
        console.error('[PatientStateProvider] init error:', err);
      } finally {
        setLoadingNotifs(false);
        setLoadingApts(false);
      }
    }
    init();
  }, []);

  // ── Realtime: new notifications ────────────────────────────────────────
  useRealtimeNotifications({
    table: 'patient_notifications',
    userId,
    onNew: useCallback((n: RealtimeNotification) => {
      setNotifications(prev => {
        if (prev.some(x => x.id === n.id)) return prev;
        return [n, ...prev];
      });
    }, []),
  });

  // ── Realtime: appointment updates ──────────────────────────────────────
  useRealtimeAppointments({
    role: 'patient',
    rowId: patientRowId,
    onUpdate: useCallback((apt: RealtimeAppointment, eventType: 'INSERT' | 'UPDATE') => {
      setAppointments(prev => {
        if (eventType === 'INSERT') {
          if (prev.some(x => x.id === apt.id)) return prev;
          return [{
            id:               apt.id,
            doctorName:       apt.doctorName ?? 'Doctor',
            date:             apt.date,
            time:             apt.time,
            type:             apt.type,
            mode:             apt.mode,
            status:           apt.status,
            reason:           apt.reason ?? '',
            initiatedBy:      apt.initiatedBy ?? 'doctor',
            meetLink:         apt.meetLink ?? null,
            calendarEventId:  apt.calendarEventId ?? null,
            calendarEventLink: apt.calendarEventLink ?? null,
          }, ...prev];
        }
        return prev.map(x =>
          x.id === apt.id
            ? {
                ...x,
                status:           apt.status,
                meetLink:         apt.meetLink ?? x.meetLink,
                calendarEventLink: apt.calendarEventLink ?? x.calendarEventLink,
              }
            : x,
        );
      });
    }, []),
  });

  // ── Notification actions ───────────────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await fetch('/api/patient/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch('/api/patient/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch('/api/patient/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, delete: true }),
    });
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    await fetch('/api/patient/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearAll: true }),
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PatientStateContext.Provider value={{
      userId,
      patientRowId,
      notifications,
      appointments,
      setAppointments,
      unreadCount,
      loadingNotifs,
      loadingApts,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </PatientStateContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/** Throws if used outside PatientStateProvider — use inside /patient-dashboard */
export function usePatientState() {
  const ctx = useContext(PatientStateContext);
  if (!ctx) throw new Error('usePatientState must be used within a PatientStateProvider');
  return ctx;
}

/**
 * Safe version — returns a minimal fallback when used outside PatientStateProvider.
 * Use this in shared components like PatientNavbar that appear on many routes.
 */
export function usePatientStateSafe() {
  const ctx = useContext(PatientStateContext);
  return ctx ?? {
    unreadCount: 0,
    notifications: [],
    appointments: [],
    setAppointments: () => {},
    userId: null,
    patientRowId: null,
    loadingNotifs: false,
    loadingApts: false,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
    clearAll: async () => {},
  };
}
