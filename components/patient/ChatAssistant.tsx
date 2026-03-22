'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Activity, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Prediction {
  disease: string;
  confidence: number;
  specialist: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  precautions: string[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  prediction?: Prediction;
  symptomsFound?: string[];
  type?: 'prediction' | 'general' | 'clarify' | 'error';
}

interface ChatHistoryItem {
  role: string;
  content: string;
}

const URGENCY_CONFIG = {
  critical: { color: 'bg-red-50 border-red-300',    icon: AlertTriangle, iconColor: 'text-red-600',    label: 'Critical — Seek emergency care now' },
  high:     { color: 'bg-orange-50 border-orange-300', icon: AlertCircle,  iconColor: 'text-orange-600', label: 'High — See a doctor soon' },
  medium:   { color: 'bg-yellow-50 border-yellow-300', icon: Info,         iconColor: 'text-yellow-600', label: 'Moderate — Schedule a visit' },
  low:      { color: 'bg-green-50 border-green-300',  icon: CheckCircle,  iconColor: 'text-green-600',  label: 'Low — Monitor symptoms' },
};

const API_URL = 'http://localhost:8000';

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: "Hello! I'm your AI Medical Assistant.\n\nDescribe your symptoms and I'll analyze them using our disease prediction model. I can also answer general health questions.\n\nExample: \"I have fever, headache and fatigue for 2 days.\"",
    sender: 'ai',
    timestamp: new Date(),
    type: 'general',
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  // Build history for RAG context (last 6 messages)
  const buildHistory = (): ChatHistoryItem[] =>
    messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: buildHistory() }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'ai',
        timestamp: new Date(),
        type: data.type,
        prediction: data.prediction ?? undefined,
        symptomsFound: data.symptoms_found?.length ? data.symptoms_found : undefined,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "⚠️ Couldn't connect to the AI backend. Please ensure the model server is running:\n\n  cd Model && python app.py",
        sender: 'ai',
        timestamp: new Date(),
        type: 'error',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">AI Medical Assistant</h3>
          <p className="text-xs text-gray-500">RAG-powered symptom analysis</p>
        </div>
        <div className="ml-auto flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-teal-500' : 'bg-gradient-to-br from-teal-500 to-blue-500'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'bg-gray-50 text-gray-800 border border-gray-200'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Symptoms detected chips */}
                {msg.symptomsFound && msg.symptomsFound.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.symptomsFound.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                )}

                {/* Prediction card */}
                {msg.prediction && (() => {
                  const urg = URGENCY_CONFIG[msg.prediction.urgency] ?? URGENCY_CONFIG.medium;
                  const UrgIcon = urg.icon;
                  return (
                    <div className={`mt-3 p-3 rounded-xl border ${urg.color}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-gray-700">AI Prediction Result</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Condition</span>
                          <span className="font-semibold text-gray-800">{msg.prediction.disease}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Confidence</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${msg.prediction.confidence}%` }} />
                            </div>
                            <span className="font-semibold">{msg.prediction.confidence}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Specialist</span>
                          <span className="font-semibold text-blue-700">{msg.prediction.specialist}</span>
                        </div>
                        <div className={`flex items-center space-x-1 mt-1 ${urg.iconColor}`}>
                          <UrgIcon className="w-3.5 h-3.5" />
                          <span className="font-medium">{urg.label}</span>
                        </div>
                        {msg.prediction.precautions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-semibold text-gray-600 mb-1">Precautions:</p>
                            <ul className="space-y-0.5">
                              {msg.prediction.precautions.map((p, i) => (
                                <li key={i} className="text-gray-600">• {p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-500">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Describe your symptoms..."
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={toggleVoice}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
              isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-400'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Voice input'}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
