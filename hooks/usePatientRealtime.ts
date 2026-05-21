'use client';

/**
 * usePatientRealtime
 *
 * Combines realtime notifications + appointment updates for the patient side.
 * Returns live notification count and appointment state.
 *
 * Usage:
 *   const { unreadCount, notifications, appointments, patientRowId } = usePatientRealtime();
 */

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeNotifications, type RealtimeNotification } from './useRealtimeNotifications';
import { useRealtimeAppointments, type RealtimeAppointment } from './useRealtimeAppointments';

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

export function usePatientRealtime() {
  const [userId, setUserId]           = useState<string | null>(null);
  const [patientRowId, setPatientRowId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [appointments, setAppointments]   = useState<PatientAppointment[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingApts, setLoadingApts]     = useState(true);

  // ── Bootstrap: fetch user IDs + initial data ──────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [profileRes, notifsRes, aptsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/patient/notifications'),
          fetch('/api/patient/appointments'),
        ]);

        if (profileRes.ok) {
          const d = await profileRes.json();
          if (d.userId)       setUserId(d.userId);
          if (d.patientRowId) setPatientRowId(d.patientRowId);
        }
        if (notifsRes.ok) {
          const d = await notifsRes.json();
          setNotifications(d.notifications ?? []);
        }
        if (aptsRes.ok) {
          const d = await aptsRes.json();
          setAppointments(d.appointments ?? []);
        }
      } catch (err) {
        console.error('[usePatientRealtime] init error:', err);
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
        // UPDATE — patch status and meetLink in place
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

  const unreadCount = notifications.filter(n => !n.read).length;

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

  return {
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
  };
}
