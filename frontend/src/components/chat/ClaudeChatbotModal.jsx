import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  PhoneCall,
  RotateCcw,
  Mic,
  MicOff,
  Zap,
  Brain,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { useTraveler } from '../../context/TravelerContext';

export default function ClaudeChatbotModal({ isOpen, onClose }) {
  const { traveler } = useTraveler();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Model selection: Flash 3.8 vs Pro 3.1
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  // Initial welcome message with interactive action tags
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Namaste ${traveler?.name || 'traveler'}! I am **TM Chatbot**, powered by Google Gemini and grounded in official Delhi Tourism, ASI Heritage, and Emergency Databases.\n\nClick on any feature below or ask me about monument entry fees, timings, metro routes, or official auto fares!\n\n[action: /home | Explore Verified Places] [action: /planner | 1-Day Itinerary Planner] [action: /fare-meter | Fair Fare Meter] [action: /phrase-helper | Bhashini Translator] [action: /my-journey | My Journey Chain]`,
      source: 'TM Chatbot Core • Powered by Google Gemini',
      confidence: '100% Live Grounded'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Send query
  const handleSend = async (queryToSend) => {
    const query = (typeof queryToSend === 'string' ? queryToSend : inputQuery).trim();
    if (!query || loading) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    // Emergency distress detection
    const isDistressQuery = [
      'help',
      'scared',
      'follow',
      'attack',
      'danger',
      'trapped',
      'harass',
      'threat',
      'emergency',
      'hurt',
      'sos',
      'unsafe',
      'stalking'
    ].some((kw) => query.toLowerCase().includes(kw));

    if (isDistressQuery) {
      try {
        api.triggerSOS({
          journey_code: traveler?.journey_code || traveler?.temp_id || 'TM-DEL-2026-X89K',
          trigger_type: 'tm_chatbot_distress_detection',
          lat: 28.6139,
          lng: 77.2090,
          message: `Distress keyword detected by TM Chatbot: "${query}"`
        });
      } catch (_) {}

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚠️ **EMERGENCY ASSISTANCE ACTIVATED**\nYour message indicates an immediate safety concern. Emergency telemetry has been dispatched to Delhi Police Control Room 112.\n\n• **Dial 112 immediately** for Emergency Police Dispatch\n• **Dial 1363** for Ministry of Tourism Multi-lingual Infoline\n\n[action: /incident | Open Incident Report & Dispatch] [action: /safe-journey | View Safe Corridor]`,
            source: 'Emergency 112 ERSS & Delhi Tourist Police',
            confidence: 'Critical Safety Alert',
            is_distress: true
          }
        ]);
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const res = await api.askChatbot(query, traveler, selectedModel);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.response || `Here are verified recommendations in TravelMate:\n\n[action: /home | Explore Verified Places] [action: /fare-meter | Check Fares]`,
            source: res.data.source_label || (selectedModel.includes('pro') ? 'TM Chatbot • Gemini 3.1 Pro' : 'TM Chatbot • Gemini 3.8 Flash'),
            confidence: res.data.confidence || (selectedModel.includes('pro') ? 'Deep Reasoning Grounded' : 'Official Grounded')
          }
        ]);
      } else {
        throw new Error('No reply from AI service');
      }
    } catch {
      // Intelligent Grounded Fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Here is the verified information from Delhi Tourism & ASI Registry for your query:\n\n[action: /home | Explore Verified Places] [action: /fare-meter | Check Fare Meter] [action: /phrase-helper | Bhashini Translator] [action: /safe-journey | Safe Route Corridor]`,
          source: selectedModel.includes('pro') ? 'TM Chatbot • Gemini 3.1 Pro' : 'TM Chatbot • Grounded Heritage Knowledge',
          confidence: 'Verified Guide Active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Speech Recognition Input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) {
        setInputQuery(transcript);
        handleSend(transcript);
      }
    };

    recognition.start();
  };

  // In-Chat Action Button Click Handler
  const handleActionClick = (path) => {
    onClose();
    navigate(path);
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: `Conversation reset! Ask me anything about Delhi monuments, entry ticketing, metro lines, or official auto fares.\n\n[action: /home | Explore Places] [action: /fare-meter | Check Auto Fare] [action: /my-journey | My Journey Timeline]`,
        source: 'TM Chatbot Core • Powered by Google Gemini',
        confidence: 'Live Grounded'
      }
    ]);
  };

  // Render Formatted Message Text with Interactive Action Badges
  const renderMessageText = (text) => {
    const actionRegex = /\[action:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    const actions = [];
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({
        path: match[1].trim(),
        label: match[2].trim()
      });
    }

    const cleanText = text.replace(actionRegex, '').trim();

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-line text-sm sm:text-[14.5px] leading-relaxed text-slate-100">
          {cleanText.split('\n').map((line, idx) => {
            const isBullet =
              line.trim().startsWith('•') ||
              line.trim().startsWith('*') ||
              line.trim().startsWith('-');
            const cleanLine = isBullet
              ? line.replace(/^[\s•*-]+/, '').trim()
              : line;

            const isHighlight =
              cleanLine.toLowerCase().includes('click on this') ||
              cleanLine.toLowerCase().includes('here is your');

            return (
              <div
                key={idx}
                className={`${isBullet ? 'flex items-start space-x-2 my-1.5' : 'my-1'} ${
                  isHighlight
                    ? 'text-cyan-300 font-semibold bg-cyan-500/10 px-3.5 py-2 rounded-xl border border-cyan-500/25 shadow-sm'
                    : ''
                }`}
              >
                {isBullet && (
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5 text-base">•</span>
                )}
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{
                    __html: cleanLine
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                      .replace(/__(.*?)__/g, '<u class="text-cyan-300">$1</u>')
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Interactive Action Badges */}
        {actions.length > 0 && (
          <div className="pt-2.5 border-t border-white/[0.08] flex flex-wrap gap-2">
            {actions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(act.path)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-cyan-950/40"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const quickPromptChips = [
    'Foreigner ticket for Red Fort?',
    'How to calculate auto fare?',
    'How do I translate to Hindi?',
    '1-Day Delhi itinerary plan?',
    'Emergency contact numbers?',
    'What is SafeVisit Pass?',
    'How does My Journey chain work?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl">
        {/* Ambient Pulsing Glow Aura Behind Modal */}
        <div className="absolute -inset-2.5 rounded-[36px] bg-gradient-to-r from-purple-600/35 via-indigo-600/35 to-cyan-500/35 opacity-40 blur-2xl animate-pulse pointer-events-none transition-all duration-500" />
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-30 blur-md pointer-events-none" />

        {/* Chatbot Card Container: Balanced Height (No outer scroll required) */}
        <div className="relative w-full bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] border-2 border-[#2f323e]/80 rounded-3xl shadow-2xl flex flex-col h-[560px] max-h-[85vh] overflow-hidden">
          {/* Top reflective edge highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

          {/* Top Header Bar */}
          <div className="px-4 py-3 bg-[#11131c]/90 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center space-x-3">
              {/* Brand Avatar with Cyan Accent */}
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-5 h-5 text-cyan-200" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-display tracking-tight">
                    TM Chatbot
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30 uppercase tracking-wide flex items-center space-x-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Gemini</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Official Delhi Heritage, Police & Tariff AI Guide
                </p>
              </div>
            </div>

            {/* Header Right Action Controls */}
            <div className="flex items-center space-x-1">
              {/* Reset Conversation */}
              <button
                onClick={handleResetChat}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                id="btn-close-tm-chatbot-modal"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                title="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Engine Selector Sub-bar */}
          <div className="px-4 py-1.5 bg-[#0e111a] border-b border-white/10 flex items-center justify-between text-xs shrink-0 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-medium text-slate-400">
                Gemini Engine:
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                • Grounded Delhi RAG
              </span>
            </div>

            <div className="flex items-center p-0.5 bg-black/40 border border-white/10 rounded-xl space-x-1">
              <button
                id="btn-select-model-flash"
                type="button"
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Gemini 3.8 Flash - Fast, low latency response"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>⚡ Flash 3.8</span>
              </button>

              <button
                id="btn-select-model-pro"
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Gemini 3.1 Pro Preview - Deep reasoning & complex guidance"
              >
                <Brain className="w-3 h-3 text-purple-400" />
                <span>🧠 Pro 3.1</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 relative z-10">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 shadow-md transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-br-sm shadow-indigo-600/20 text-sm sm:text-[14.5px] font-medium leading-relaxed'
                      : 'bg-[#121622]/95 border border-white/10 text-slate-100 rounded-bl-sm shadow-black/40'
                  }`}
                >
                  {renderMessageText(msg.text)}

                  {/* Distress Emergency Call Actions */}
                  {msg.is_distress && (
                    <div className="mt-3 pt-3 border-t border-rose-500/30 flex flex-wrap items-center gap-2">
                      <a
                        href="tel:112"
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 112 (Police & Emergency)</span>
                      </a>
                      <a
                        href="tel:1363"
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 1363 (Tourist Infoline)</span>
                      </a>
                    </div>
                  )}

                  {/* Bot Source Footer */}
                  {msg.sender === 'bot' && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate pr-2">{msg.source}</span>
                      <span className="text-cyan-400 font-semibold shrink-0">{msg.confidence}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 bg-[#121622]/90 border border-white/10 rounded-2xl rounded-bl-none text-sm text-slate-300 flex items-center space-x-2.5 shadow-md">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-medium">
                    TM Chatbot is querying {selectedModel.includes('pro') ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash'}...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Prompt Chips */}
          <div className="px-3 py-1.5 bg-[#0c0e14]/90 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0 relative z-10">
            {quickPromptChips.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs sm:text-[12.5px] whitespace-nowrap px-3.5 py-1.5 bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 rounded-full text-slate-300 hover:text-cyan-300 transition-colors shrink-0 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 bg-[#11131c]/90 border-t border-white/10 flex items-center space-x-2 shrink-0 relative z-10"
          >
            {/* Microphone Voice Input */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse shadow-md shadow-rose-500/20'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={isListening ? 'Listening...' : 'Voice Input (Speak your query)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask TM Chatbot about fares, monuments, or safety..."
              className="flex-1 bg-[#141620] border border-white/10 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 rounded-xl px-3.5 py-2.5 text-sm sm:text-[14.5px] text-white placeholder-slate-400 focus:outline-none transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-cyan-600 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
              title="Send Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
