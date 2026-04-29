'use client';

/**
 * useRealtimeAppointments
 *
 * Subscribes to Supabase Realtime INSERT and UPDATE events on the
 * `appointments` table, filtered by either doctor_id or patient_id.
 *
 * Usage (doctor):
 *   useRealtimeAppointments({ role: 'doctor', rowId: doctorRowId, onUpdate })
 *
 * Usage (patient):
 *   useRealtimeAppointments({ role: 'patient', rowId: patientRowId, onUpdate })
 *
 * `rowId` must be the doctors.id / patients.id (the FK stored in appointments),
 * NOT the users.id.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeAppointment {
  id: string;
  patientName?: string;
  doctorName?: string;
  patientId?: string | null;
  date: string;
  time: string;
  type: string;
  mode: 'Online' | 'Offline';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  reason?: string;
  initiatedBy?: string;
  meetLink?: string | null;
  calendarEventId?: string | null;
  calendarEventLink?: string | null;
}

interface Options {
  role: 'doctor' | 'patient';
  /** The doctors.id or patients.id (FK in appointments table) */
  rowId: string | null | undefined;
  /** Called on INSERT or UPDATE with the mapped appointment */
  onUpdate: (appointment: RealtimeAppointment, eventType: 'INSERT' | 'UPDATE') => void;
}

function mapRow(row: Record<string, unknown>): RealtimeAppointment {
  return {
    id:               row.id               as string,
    patientName:      row.patient_name     as string | undefined,
    doctorName:       row.doctor_name      as string | undefined,
    patientId:        row.patient_id       as string | null | undefined,
    date:             row.appointment_date as string,
    time:             row.appointment_time as string,
    type:             row.type             as string,
    mode:             row.mode             as 'Online' | 'Offline',
    status:           row.status           as 'Confirmed' | 'Pending' | 'Cancelled',
    reason:           row.reason           as string | undefined,
    initiatedBy:      row.initiated_by     as string | undefined,
    meetLink:         row.meet_link        as string | null | undefined,
    calendarEventId:  row.calendar_event_id  as string | null | undefined,
    calendarEventLink: row.calendar_event_link as string | null | undefined,
  };
}

export function useRealtimeAppointments({ role, rowId, onUpdate }: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    if (!rowId) return;

    const filterCol = role === 'doctor' ? 'doctor_id' : 'patient_id';

    const channel = supabase
      .channel(`appointments:${role}:${rowId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'appointments',
          filter: `${filterCol}=eq.${rowId}`,
        },
        (payload) => {
          onUpdateRef.current(mapRow(payload.new as Record<string, unknown>), 'INSERT');
        },
      )
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'appointments',
          filter: `${filterCol}=eq.${rowId}`,
        },
        (payload) => {
          onUpdateRef.current(mapRow(payload.new as Record<string, unknown>), 'UPDATE');
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, rowId]);
}
