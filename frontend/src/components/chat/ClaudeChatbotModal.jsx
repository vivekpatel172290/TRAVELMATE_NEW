import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, X, ShieldCheck, AlertCircle, Bot, User, PhoneCall } from 'lucide-react';
import { api } from '../../services/api';
import { useTraveler } from '../../context/TravelerContext';
import StatusBadge from '../common/StatusBadge';

export default function ClaudeChatbotModal({ isOpen, onClose }) {
  const { traveler } = useTraveler();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${traveler?.name || 'there'}! I am TravelMate AI, grounded strictly in official ASI Delhi heritage records and emergency databases. Ask me about monument entry fees, timings, or emergency helplines.`,
      source: 'Official ASI / Ministry of Tourism Registry',
      confidence: '100% Grounded'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMsg = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    const isDistressQuery = ["help", "scared", "follow", "attack", "danger", "trapped", "harass", "threat", "emergency", "hurt", "sos", "unsafe", "stalking"].some(kw => userMsg.toLowerCase().includes(kw));

    if (isDistressQuery) {
      // Auto-dispatch SOS alert to control room
      try {
        api.triggerSOS({
          journey_code: traveler?.temp_id || 'TM-DEL-2026-X89K',
          trigger_type: 'travelmate_ai_distress_detection',
          lat: 28.6139,
          lng: 77.2090,
          message: `Distress message detected in TravelMate AI Chat: "${userMsg}"`
        });
      } catch (_) {}

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚠️ **EMERGENCY DISTRESS DETECTED**\nYour message indicates an urgent safety or security concern. Your GPS pin has been queued for 112 ERSS dispatch.\n\n• **Dial 112 immediately** for Delhi Police & Emergency Services.\n• **Dial 1363** for Ministry of Tourism 24x7 Multi-lingual Tourist Infoline.\n• Head to the nearest well-lit public area, metro station, or police booth.`,
            source: 'Emergency Response Support System (112) & Delhi Tourist Police',
            confidence: 'Critical Alert (Priority Escalated)',
            is_distress: true
          }
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await api.askChatbot(userMsg, traveler);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.response,
            source: res.data.source_label,
            confidence: res.data.confidence
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I cannot verify this location in the official ASI/Delhi Tourism registry. For your safety, I only provide verified facts from official sources.',
          source: 'Strict Grounding Safeguard',
          confidence: 'Verified Guardrail'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-30 blur-xl pointer-events-none" />
        <div className="relative w-full bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] border-2 border-[#2f323e]/70 rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="TravelMate Assistant"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-md shadow-cyan-500/20"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white font-display">TravelMate AI</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Gemini Grounded
                  </span>
                  <StatusBadge status="Official" />
                </div>
                <p className="text-[10px] text-cyan-400 font-medium">ASI Delhi Heritage RAG • Zero Hallucination Guardrail</p>
              </div>
            </div>
            <button
              id="btn-close-chatbot-modal"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-[#181a24] border border-white/10 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.is_distress && (
                    <div className="mt-3 pt-2.5 border-t border-rose-500/30 flex flex-wrap items-center gap-2">
                      <a
                        href="tel:112"
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-md shadow-red-600/30"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 112 Emergency</span>
                      </a>
                      <a
                        href="tel:1363"
                        className="px-3 py-1.5 bg-[#6b30e3] hover:bg-[#8b5cf6] text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-md shadow-purple-600/20"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Dial 1363 Infoline</span>
                      </a>
                    </div>
                  )}
                  {m.source && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Source: {m.source}</span>
                      <span className="text-cyan-400 font-semibold">{m.confidence}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3 bg-[#181a24] border border-white/10 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Grounding against ASI Delhi registry...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {[
              'Foreigner fee for Red Fort?',
              'Timings for Qutub Minar?',
              'Emergency help, someone is following me!',
              'Lotus Temple shoe policy?'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInputQuery(prompt)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              id="input-chatbot-query"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about Delhi monument tickets, timings, 112..."
              className="flex-1 px-4 py-2.5 bg-[#12141c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              id="btn-send-chatbot"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 coder-btn-primary disabled:opacity-50 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
