'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, User, Activity, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  prediction?: {
    disease: string;
    confidence: number;
  };
}

// Common symptoms for detection
const SYMPTOM_KEYWORDS = [
  'fever', 'cough', 'headache', 'pain', 'fatigue', 'nausea', 'vomiting',
  'diarrhea', 'rash', 'itching', 'swelling', 'breathing', 'chest pain',
  'dizziness', 'weakness', 'cold', 'flu', 'sore throat', 'runny nose'
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Medical Assistant. I can help you with:\n\n• Disease prediction based on symptoms\n• General health advice\n• Medical information\n\nJust describe your symptoms and I\'ll analyze them!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiUrl] = useState('http://localhost:8000');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract symptoms from user message
  const extractSymptoms = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const foundSymptoms: string[] = [];
    
    // Simple keyword matching - you can make this more sophisticated
    if (lowerText.includes('fever') || lowerText.includes('temperature')) foundSymptoms.push('high_fever');
    if (lowerText.includes('cough')) foundSymptoms.push('cough');
    if (lowerText.includes('headache') || lowerText.includes('head pain')) foundSymptoms.push('headache');
    if (lowerText.includes('fatigue') || lowerText.includes('tired')) foundSymptoms.push('fatigue');
    if (lowerText.includes('nausea')) foundSymptoms.push('nausea');
    if (lowerText.includes('vomit')) foundSymptoms.push('vomiting');
    if (lowerText.includes('diarrhea') || lowerText.includes('loose stool')) foundSymptoms.push('diarrhoea');
    if (lowerText.includes('stomach pain') || lowerText.includes('abdominal pain')) foundSymptoms.push('stomach_pain');
    if (lowerText.includes('chest pain')) foundSymptoms.push('chest_pain');
    if (lowerText.includes('dizzy') || lowerText.includes('dizziness')) foundSymptoms.push('dizziness');
    if (lowerText.includes('weakness')) foundSymptoms.push('weakness_in_limbs');
    if (lowerText.includes('breathless') || lowerText.includes('breathing')) foundSymptoms.push('breathlessness');
    if (lowerText.includes('rash') || lowerText.includes('skin rash')) foundSymptoms.push('skin_rash');
    if (lowerText.includes('itch')) foundSymptoms.push('itching');
    if (lowerText.includes('sore throat') || lowerText.includes('throat pain')) foundSymptoms.push('throat_irritation');
    if (lowerText.includes('runny nose')) foundSymptoms.push('runny_nose');
    if (lowerText.includes('congestion')) foundSymptoms.push('congestion');
    if (lowerText.includes('joint pain')) foundSymptoms.push('joint_pain');
    if (lowerText.includes('back pain')) foundSymptoms.push('back_pain');
    if (lowerText.includes('muscle pain')) foundSymptoms.push('muscle_pain');
    
    return foundSymptoms;
  };

  // Check if message contains symptom-related keywords
  const containsSymptoms = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return SYMPTOM_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  // Get disease prediction from API
  const getPrediction = async (symptoms: string[]): Promise<{ disease: string; confidence: number } | null> => {
    if (symptoms.length === 0) return null;

    try {
      // Create symptoms dictionary
      const symptomsDict: Record<string, number> = {};
      
      // Set all to 0 first
      const allSymptoms = [
        'itching', 'skin_rash', 'continuous_sneezing', 'shivering', 'chills',
        'joint_pain', 'stomach_pain', 'acidity', 'vomiting', 'fatigue',
        'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss',
        'restlessness', 'lethargy', 'cough', 'high_fever', 'breathlessness',
        'sweating', 'dehydration', 'indigestion', 'headache', 'nausea',
        'loss_of_appetite', 'back_pain', 'constipation', 'abdominal_pain',
        'diarrhoea', 'mild_fever', 'chest_pain', 'weakness_in_limbs',
        'dizziness', 'throat_irritation', 'runny_nose', 'congestion',
        'muscle_pain', 'neck_pain'
      ];
      
      allSymptoms.forEach(s => symptomsDict[s] = 0);
      symptoms.forEach(s => symptomsDict[s] = 1);

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsDict }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        disease: data.prediction,
        confidence: Math.round(data.confidence * 100)
      };
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // Check if message contains symptoms
    const hasSymptoms = containsSymptoms(userInput);
    const extractedSymptoms = extractSymptoms(userInput);

    let aiResponse = '';
    let prediction = null;

    if (hasSymptoms && extractedSymptoms.length > 0) {
      // Try to get prediction
      prediction = await getPrediction(extractedSymptoms);
      
      if (prediction) {
        aiResponse = `Based on the symptoms you described (${extractedSymptoms.map(s => s.replace(/_/g, ' ')).join(', ')}), here's my analysis:\n\n`;
        aiResponse += `🔍 **Predicted Condition:** ${prediction.disease}\n`;
        aiResponse += `📊 **Confidence:** ${prediction.confidence}%\n\n`;
        aiResponse += `⚠️ **Important:** This is an AI prediction and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.\n\n`;
        aiResponse += `Would you like to:\n• Describe more symptoms for a better analysis\n• Find a doctor for consultation\n• Learn more about this condition`;
      } else {
        aiResponse = `I detected you mentioned some symptoms. However, I need more specific information to provide an accurate prediction. Could you describe your symptoms in more detail?\n\nFor example:\n• What symptoms are you experiencing?\n• How long have you had them?\n• How severe are they?`;
      }
    } else {
      // General response
      aiResponse = `I'm here to help! If you're experiencing any health concerns, please describe your symptoms and I'll analyze them for you.\n\nYou can also ask me about:\n• General health information\n• Finding doctors\n• Booking appointments\n• Medical advice`;
    }

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        prediction: prediction || undefined
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="backdrop-blur-md bg-white/70 rounded-3xl shadow-xl border border-white/20 p-8 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800">AI Medical Assistant</h3>
          <p className="text-xs text-gray-600">Powered by AI Disease Prediction</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-teal-500' 
                  : 'bg-gradient-to-br from-teal-500 to-blue-500'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                  : 'bg-white/80 text-gray-800 border border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                
                {/* Prediction Badge */}
                {message.prediction && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-800">AI Prediction</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disease:</span>
                        <span className="font-semibold text-gray-800">{message.prediction.disease}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Confidence:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${message.prediction.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-800">{message.prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-teal-500 to-blue-500">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/80 border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptoms or ask a question..."
            className="w-full px-4 py-3 pr-12 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Voice input"
            title="Voice input"
          >
            <Mic className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label="Send message"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
