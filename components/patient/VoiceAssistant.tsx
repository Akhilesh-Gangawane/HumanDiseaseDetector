'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import {
  Mic, Phone, PhoneOff,
  Clock, Volume2, Sparkles, AlertCircle, Loader2,
  MessageSquare, User, Bot, CheckCircle2, Calendar, FlaskConical, Pill,
  ShoppingBag, XCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
type Intent = 'appointment' | 'lab' | 'prescription' | 'general';

interface TranscriptLine {
  role: 'user' | 'assistant';
  text: string;
}

interface ActionResult {
  type: 'appointment' | 'lab' | 'medicine';
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface CallLog {
  id: string;
  startedAt: string;
  duration: number;
  transcript: TranscriptLine[];
  summary: string;
  intent: Intent;
  actions?: ActionResult[];
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Guess intent from transcript text */
function detectIntent(lines: TranscriptLine[]): Intent {
  const text = lines.map(l => l.text).join(' ').toLowerCase();
  if (/\b(appointment|consult|book|schedule|doctor|visit)\b/.test(text)) return 'appointment';
  if (/\b(lab|test|blood|urine|pathology|sample|report)\b/.test(text)) return 'lab';
  if (/\b(prescription|medicine|tablet|drug|refill|dosage)\b/.test(text)) return 'prescription';
  return 'general';
}

/** Build a short summary from the last assistant message */
function buildSummary(lines: TranscriptLine[]): string {
  const assistantLines = lines.filter(l => l.role === 'assistant');
  if (assistantLines.length === 0) return '';
  return assistantLines[assistantLines.length - 1].text.slice(0, 300);
}

const INTENT_META: Record<Intent, { label: string; color: string; icon: React.ReactNode }> = {
  appointment: { label: 'Appointment', color: 'text-indigo-400 bg-indigo-500/20 border-indigo-400/30', icon: <Calendar className="w-3.5 h-3.5" /> },
  lab:         { label: 'Lab Test',    color: 'text-teal-400 bg-teal-500/20 border-teal-400/30',     icon: <FlaskConical className="w-3.5 h-3.5" /> },
  prescription:{ label: 'Prescription',color: 'text-purple-400 bg-purple-500/20 border-purple-400/30',icon: <Pill className="w-3.5 h-3.5" /> },
  general:     { label: 'General',     color: 'text-blue-400 bg-blue-500/20 border-blue-400/30',     icon: <MessageSquare className="w-3.5 h-3.5" /> },
};

/* ─── Volume-driven waveform ─────────────────────────────── */
function Waveform({ volume }: { volume: number }) {
  const active = volume > 0.01;
  return (
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: 12 }).map((_, i) => {
        const base = 6;
        const peak = base + volume * 22 * (0.5 + 0.5 * Math.sin(i * 1.2));
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${active ? 'bg-white' : 'bg-white/20'}`}
            style={{ height: `${active ? peak : base}px` }}
          />
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function VoiceAssistant() {
  const [callState, setCallState]       = useState<'idle' | 'connecting' | 'active'>('idle');
  const [volume, setVolume]             = useState(0);
  const [elapsed, setElapsed]           = useState(0);
  const [statusMsg, setStatusMsg]       = useState('Ready to connect');
  const [error, setError]               = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptLine[]>([]);
  const [callLogs, setCallLogs]         = useState<CallLog[]>([]);
  const [saving, setSaving]             = useState(false);
  const [savedOk, setSavedOk]           = useState(false);
  const [activeLog, setActiveLog]       = useState<string | null>(null);
  const [lastActions, setLastActions]   = useState<ActionResult[]>([]);

  const vapiRef       = useRef<Vapi | null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef    = useRef(0);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const startedAtRef  = useRef('');
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  /* ── Keep refs in sync ── */
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => {
    transcriptRef.current = liveTranscript;
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  /* ── Init Vapi once on mount ── */
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) { setError('NEXT_PUBLIC_VAPI_API_KEY is not configured.'); return; }

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setCallState('active');
      setError(null);
      setStatusMsg('Call connected');
      setLiveTranscript([]);
      setSavedOk(false);
      startedAtRef.current = new Date().toISOString();
      startTimer();
    });

    vapi.on('call-end', () => {
      setCallState('idle');
      setVolume(0);
      setStatusMsg('Call ended');
      stopTimer();
      saveCallLog();
    });

    // Capture real-time transcript from Vapi message events
    vapi.on('message', (msg: any) => {
      // Vapi emits { type: 'transcript', role: 'user'|'assistant', transcriptType: 'final'|'partial', transcript: string }
      if (msg?.type === 'transcript' && msg?.transcriptType === 'final' && msg?.transcript) {
        const line: TranscriptLine = {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          text: msg.transcript,
        };
        setLiveTranscript(prev => [...prev, line]);
      }
    });

    vapi.on('volume-level', (v: number) => setVolume(v));

    vapi.on('call-start-failed', (e: any) => {
      const msg = typeof e?.error === 'string' ? e.error : `Call failed at stage: ${e?.stage ?? 'unknown'}`;
      setError(msg);
      setCallState('idle');
      setStatusMsg('Ready to connect');
      stopTimer();
      console.error('[Vapi call-start-failed]', e);
    });

    vapi.on('error', (e: any) => {
      const msg: string =
        typeof e === 'string' ? e
        : typeof e?.msg === 'string' ? e.msg
        : typeof e?.message === 'string' ? e.message
        : typeof e?.error === 'string' ? e.error
        : typeof e?.details === 'string' ? e.details
        : e != null ? JSON.stringify(e)
        : 'An unknown error occurred';

      if (msg.toLowerCase().includes('meeting has ended') || msg.toLowerCase().includes('ejection')) {
        console.debug('[Vapi] call ended normally (Daily.co ejection):', msg);
        return;
      }

      console.error('[Vapi error]', e);
      setError(msg);
      setCallState('idle');
      setStatusMsg('Ready to connect');
      stopTimer();
    });

    return () => { vapi.stop(); stopTimer(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Timer ── */
  function startTimer() {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  /* ── Save call log to DB + notify doctor + execute actions ── */
  async function saveCallLog() {
    const lines = transcriptRef.current;
    if (lines.length === 0) return;

    setSaving(true);
    const intent  = detectIntent(lines);
    const summary = buildSummary(lines);
    const duration = elapsedRef.current;
    const transcriptText = lines.map(l => `${l.role === 'user' ? 'Patient' : 'Assistant'}: ${l.text}`).join('\n');

    let executedActions: ActionResult[] = [];

    try {
      // 1. Save the call log (notifies doctor)
      await fetch('/api/patient/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, transcript: transcriptText, summary, intent }),
      });

      // 2. Parse transcript and execute real actions (book appointments, labs, medicines)
      const actionsRes = await fetch('/api/patient/voice-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        executedActions = actionsData.actions ?? [];
        setLastActions(executedActions);
      }

      setSavedOk(true);
      const newLog: CallLog = {
        id: crypto.randomUUID(),
        startedAt: startedAtRef.current,
        duration,
        transcript: lines,
        summary,
        intent,
        actions: executedActions,
      };
      setCallLogs(prev => [newLog, ...prev]);
      setActiveLog(newLog.id);
    } catch (err) {
      console.error('[call-log save]', err);
    } finally {
      setSaving(false);
    }
  }

  /* ── Call controls ── */
  const startCall = useCallback(async () => {
    if (!vapiRef.current || callState !== 'idle') return;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) { setError('NEXT_PUBLIC_VAPI_ASSISTANT_ID is not configured.'); return; }
    setError(null);
    setCallState('connecting');
    setStatusMsg('Connecting…');
    try {
      await vapiRef.current.start(assistantId);
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Failed to start call';
      setError(msg);
      setCallState('idle');
      setStatusMsg('Ready to connect');
    }
  }, [callState]);

  const endCall = useCallback(() => { vapiRef.current?.stop(); }, []);

  const isActive     = callState === 'active';
  const isConnecting = callState === 'connecting';

  /* ─────────────────────────────────────────────────────── */
  return (
    <section id="voice-assistant" className="py-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Medical Voice Receptionist</h2>
          <p className="text-blue-200/70 max-w-xl mx-auto">
            Speak naturally with our AI receptionist — book appointments, request lab tests, or ask health questions. Your doctor is notified automatically.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-8 flex items-start gap-3 px-5 py-4 bg-red-500/10 border border-red-400/30 rounded-2xl text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Saved banner */}
        {savedOk && !isActive && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-400/30 rounded-2xl text-green-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Call log saved and your doctor has been notified.
            </div>

            {/* Action result cards */}
            {lastActions.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/50 text-xs uppercase tracking-wider px-1">Actions taken from your call</p>
                {lastActions.map((action, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-5 py-4 rounded-2xl border text-sm ${
                      action.success
                        ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                        : 'bg-red-500/10 border-red-400/30 text-red-300'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {action.success
                        ? action.type === 'appointment' ? <Calendar className="w-5 h-5" />
                          : action.type === 'lab' ? <FlaskConical className="w-5 h-5" />
                          : <ShoppingBag className="w-5 h-5" />
                        : <XCircle className="w-5 h-5" />
                      }
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold capitalize">
                        {action.success ? '✅' : '❌'}{' '}
                        {action.type === 'appointment' ? 'Appointment Booked'
                          : action.type === 'lab' ? 'Lab Tests Booked'
                          : 'Medicine Order Placed'}
                      </p>
                      <p className="text-xs opacity-80 mt-0.5">{action.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Call Card ── */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500" />

            <div className="p-8 flex flex-col items-center gap-6">

              {/* Avatar */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full animate-ping bg-blue-500/20" />
                    <div className="absolute w-32 h-32 rounded-full animate-pulse bg-teal-500/20" />
                  </>
                )}
                <div className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                  isActive     ? 'bg-gradient-to-br from-blue-500 to-teal-500 scale-110'
                  : isConnecting ? 'bg-gradient-to-br from-blue-700 to-teal-700'
                  : 'bg-gradient-to-br from-slate-700 to-slate-600'
                }`}>
                  {isConnecting
                    ? <Loader2 className="w-12 h-12 text-white animate-spin" />
                    : isActive
                    ? <Volume2 className="w-12 h-12 text-white" />
                    : <Mic className="w-12 h-12 text-slate-300" />
                  }
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    isActive ? 'bg-green-400 animate-pulse'
                    : isConnecting ? 'bg-yellow-400 animate-pulse'
                    : 'bg-slate-500'
                  }`} />
                  <span className="text-white/80 text-sm font-medium">{statusMsg}</span>
                </div>
                {isActive && (
                  <div className="text-2xl font-mono font-bold text-white tracking-widest mt-1">
                    {formatDuration(elapsed)}
                  </div>
                )}
              </div>

              {/* Waveform */}
              <div className="h-10 flex items-center justify-center">
                <Waveform volume={isActive ? volume : 0} />
              </div>

              {/* Live transcript (during call) */}
              {isActive && liveTranscript.length > 0 && (
                <div className="w-full max-h-40 overflow-y-auto space-y-2 px-1">
                  {liveTranscript.map((line, i) => (
                    <div key={i} className={`flex gap-2 text-xs ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {line.role === 'assistant' && <Bot className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />}
                      <span className={`px-3 py-1.5 rounded-xl max-w-[80%] leading-relaxed ${
                        line.role === 'user'
                          ? 'bg-blue-500/30 text-blue-100'
                          : 'bg-white/10 text-white/80'
                      }`}>{line.text}</span>
                      {line.role === 'user' && <User className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}

              {/* Call button */}
              {!isActive ? (
                <button
                  type="button"
                  onClick={startCall}
                  disabled={isConnecting || saving}
                  className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-green-500/40 hover:scale-105 disabled:scale-100 transition-all duration-300"
                >
                  {isConnecting
                    ? <><Loader2 className="w-6 h-6 animate-spin" /> Connecting…</>
                    : saving
                    ? <><Loader2 className="w-6 h-6 animate-spin" /> Saving log…</>
                    : <><Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Start Call</>
                  }
                </button>
              ) : (
                <button
                  type="button"
                  onClick={endCall}
                  className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-red-500/40 hover:scale-105 transition-all duration-300"
                >
                  <PhoneOff className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
                  End Call
                </button>
              )}

              {/* Capability tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  { label: 'Book Appointment', icon: <Calendar className="w-3 h-3" /> },
                  { label: 'Lab Tests',         icon: <FlaskConical className="w-3 h-3" /> },
                  { label: 'Prescription Info', icon: <Pill className="w-3 h-3" /> },
                  { label: 'Health Queries',    icon: <MessageSquare className="w-3 h-3" /> },
                ].map(({ label, icon }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs text-blue-200">
                    {icon}{label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Call Logs Panel ── */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-400 to-teal-500" />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Call Logs</h3>
                  <p className="text-blue-200/60 text-xs">Sent to your doctor after each call</p>
                </div>
                {callLogs.length > 0 && (
                  <span className="ml-auto px-2.5 py-0.5 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-xs font-bold">
                    {callLogs.length}
                  </span>
                )}
              </div>

              {callLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm">No call logs yet</p>
                  <p className="text-slate-500 text-xs max-w-xs">
                    After a call, a summary is saved here and your doctor is notified automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {callLogs.map(log => {
                    const meta = INTENT_META[log.intent];
                    const isOpen = activeLog === log.id;
                    return (
                      <div key={log.id} className="rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/30 transition-all duration-300 overflow-hidden">
                        {/* Log header — click to expand */}
                        <button
                          type="button"
                          onClick={() => setActiveLog(isOpen ? null : log.id)}
                          className="w-full text-left p-4 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
                                {meta.icon}{meta.label}
                              </span>
                              <span className="text-white/40 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />{formatDuration(log.duration)}
                              </span>
                            </div>
                            <p className="text-white/60 text-xs">{formatDate(log.startedAt)}</p>
                            {log.summary && (
                              <p className="text-white/70 text-xs mt-1.5 line-clamp-2 leading-relaxed">{log.summary}</p>
                            )}
                          </div>
                          <span className="text-white/30 text-xs shrink-0 mt-1">{isOpen ? '▲' : '▼'}</span>
                        </button>

                        {/* Expanded transcript + actions */}
                        {isOpen && (
                          <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-4">
                            {/* Actions taken */}
                            {log.actions && log.actions.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-white/40 text-xs uppercase tracking-wider">Actions Taken</p>
                                {log.actions.map((action, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs border ${
                                      action.success
                                        ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300'
                                        : 'bg-red-500/10 border-red-400/20 text-red-300'
                                    }`}
                                  >
                                    {action.type === 'appointment' ? <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      : action.type === 'lab' ? <FlaskConical className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      : <ShoppingBag className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                    <span>{action.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Transcript */}
                            {log.transcript.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-white/40 text-xs uppercase tracking-wider">Transcript</p>
                                {log.transcript.map((line, i) => (
                                  <div key={i} className={`flex gap-2 text-xs ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {line.role === 'assistant' && <Bot className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />}
                                    <span className={`px-3 py-1.5 rounded-xl max-w-[85%] leading-relaxed ${
                                      line.role === 'user'
                                        ? 'bg-blue-500/30 text-blue-100'
                                        : 'bg-white/10 text-white/80'
                                    }`}>{line.text}</span>
                                    {line.role === 'user' && <User className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
