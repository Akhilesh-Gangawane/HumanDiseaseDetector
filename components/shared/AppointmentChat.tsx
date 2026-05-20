'use client';

/**
 * AppointmentChat
 * Real-time chat between a doctor and patient for a specific appointment.
 * Uses Supabase Realtime (postgres_changes INSERT on messages table).
 * Works for both roles — pass senderRole='doctor' or 'patient'.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageSquare, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'doctor' | 'patient';
  content: string;
  created_at: string;
}

interface AppointmentChatProps {
  appointmentId: string;
  currentUserId: string;          // users.id of the logged-in user
  currentUserName: string;
  senderRole: 'doctor' | 'patient';
  otherPersonName: string;        // "Dr. Smith" or patient name
  onClose: () => void;
}

export default function AppointmentChat({
  appointmentId,
  currentUserId,
  currentUserName,
  senderRole,
  otherPersonName,
  onClose,
}: AppointmentChatProps) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);
  const messagesRef               = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while chat is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing messages
  useEffect(() => {
    setLoading(true);
    fetch(`/api/messages?appointmentId=${appointmentId}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appointmentId]);

  // Supabase Realtime — listen for new messages on this appointment
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        (payload) => {
          const row = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates (optimistic insert already added it)
            if (prev.some(m => m.id === row.id)) return prev;
            return [...prev, row];
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appointmentId]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Optimistic insert
    const optimistic: Message = {
      id:          `opt-${Date.now()}`,
      sender_id:   currentUserId,
      sender_name: currentUserName,
      sender_role: senderRole,
      content:     text,
      created_at:  new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ appointmentId, content: text }),
      });
      if (res.ok) {
        const { message } = await res.json();
        // Replace optimistic with real row
        setMessages(prev => prev.map(m => m.id === optimistic.id ? message : m));
      }
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, appointmentId, currentUserId, currentUserName, senderRole]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Chat panel — stop propagation so clicks inside don't close */}
      <div
        className="
          w-full sm:max-w-lg bg-white
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl flex flex-col
          h-[85dvh] sm:h-[600px]
          max-h-[85dvh] sm:max-h-[90vh]
          overflow-hidden
        "
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{otherPersonName}</p>
              <p className="text-xs text-teal-100 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse inline-block" />
                Live chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages — this is the scrollable area */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 bg-gray-50 [--webkit-overflow-scrolling:touch]"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation below</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isMe && (
                      <span className="text-xs text-gray-500 font-medium px-1">{msg.sender_name}</span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl flex items-center justify-center hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {sending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
