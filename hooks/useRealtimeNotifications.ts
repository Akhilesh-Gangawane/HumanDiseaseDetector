'use client';

/**
 * useRealtimeNotifications
 *
 * Subscribes to Supabase Realtime INSERT events on either
 * `doctor_notifications` or `patient_notifications` and calls
 * `onNew` whenever a row arrives that belongs to the current user.
 *
 * Usage (doctor):
 *   useRealtimeNotifications({ table: 'doctor_notifications', userId, onNew })
 *
 * Usage (patient):
 *   useRealtimeNotifications({ table: 'patient_notifications', userId, onNew })
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
}

interface Options {
  /** Which table to subscribe to */
  table: 'doctor_notifications' | 'patient_notifications';
  /** The users.id of the current user — used to filter rows */
  userId: string | null | undefined;
  /** Called with the new notification whenever one arrives */
  onNew: (notification: RealtimeNotification) => void;
}

export function useRealtimeNotifications({ table, userId, onNew }: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onNewRef   = useRef(onNew);

  // Keep the callback ref fresh without re-subscribing
  useEffect(() => { onNewRef.current = onNew; }, [onNew]);

  useEffect(() => {
    if (!userId) return;

    // Determine the column name that holds the owner's user id
    const ownerCol = table === 'doctor_notifications' ? 'doctor_id' : 'patient_id';

    const channel = supabase
      .channel(`${table}:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table,
          filter: `${ownerCol}=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const notification: RealtimeNotification = {
            id:      row.id      as string,
            title:   row.title   as string,
            message: row.message as string,
            type:    row.type    as string,
            read:    false,
            time:    new Date(row.created_at as string).toLocaleString(),
          };
          onNewRef.current(notification);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId]);
}
