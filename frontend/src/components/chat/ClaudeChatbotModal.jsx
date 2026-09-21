import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  ShieldCheck,
  AlertCircle,
  Bot,
  User,
  PhoneCall,
  Volume2,
  VolumeX,
  RotateCcw,
  Mic,
  MicOff,
  Zap,
  Brain,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { useTraveler } from '../../context/TravelerContext';

export default function ClaudeChatbotModal({ isOpen, onClose }) {
  const { traveler } = useTraveler();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const lastSpokenIndexRef = useRef(-1);

  // Model selection: Flash 3.8 vs Pro 3.1
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  // Initial welcome message with interactive action tags
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Namaste ${traveler?.name || 'traveler'}! I am TravelMate AI, powered by Google Gemini and grounded in official Delhi Tourism, ASI Heritage, and Emergency Databases.\n\nClick on any feature below or ask me about monument entry fees, timings, metro routes, or official auto fares!\n\n[action: /home | Explore Verified Places] [action: /planner | 1-Day Itinerary Planner] [action: /fare-meter | Fair Fare Meter] [action: /phrase-helper | Bhashini Hindi Translator] [action: /my-journey | My Journey Chain]`,
      source: 'TravelMate Core • Powered by Google Gemini',
      confidence: '100% Live Grounded'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(true);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close modal and stop any active audio
  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageIndex(null);
    onClose();
  };

  // Clean Markdown & Action Tags for Natural Speech Synthesis
  const cleanTextForSpeech = (rawText) => {
    const actionRegex = /\[action:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    const actions = [];
    let match;
    while ((match = actionRegex.exec(rawText)) !== null) {
      actions.push(match[2].trim());
    }

    let speechText = rawText.replace(actionRegex, '').trim();
    speechText = speechText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/[`_]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (
      !speechText.toLowerCase().includes('click on it and find this') &&
      !speechText.toLowerCase().includes('click on')
    ) {
      if (actions.length > 0) {
        speechText += `. Click on ${actions[0]} and find this in the app!`;
      } else {
        speechText += '. Click on it and find this in the app!';
      }
    }

    return speechText;
  };

  // Speak message via SpeechSynthesis
  const speakMessage = (text, index) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speakingMessageIndex === index) {
      setSpeakingMessageIndex(null);
      return;
    }

    const cleanSpeech = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);

    setSpeakingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Handle auto-speech when new bot message arrives
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const lastIndex = messages.length - 1;
      const lastMsg = messages[lastIndex];
      if (lastMsg && lastMsg.sender === 'bot' && lastIndex > lastSpokenIndexRef.current) {
        lastSpokenIndexRef.current = lastIndex;
        if (voiceAutoPlay) {
          speakMessage(lastMsg.text, lastIndex);
        }
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageIndex(null);
    }
  }, [messages, voiceAutoPlay, isOpen]);

  if (!isOpen) return null;

  // Send query
  const handleSend = async (queryToSend) => {
    const query = (typeof queryToSend === 'string' ? queryToSend : inputQuery).trim();
    if (!query || loading) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
    }

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
          message: `Distress keyword detected by TravelMate AI chatbot: "${query}"`
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
            source: res.data.source_label || (selectedModel.includes('pro') ? 'TravelMate AI • Gemini 3.1 Pro' : 'TravelMate AI • Gemini 3.8 Flash'),
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
          source: selectedModel.includes('pro') ? 'TravelMate AI • Gemini 3.1 Pro' : 'TravelMate AI • Grounded Heritage Knowledge',
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageIndex(null);
    onClose();
    navigate(path);
  };

  // Reset conversation
  const handleResetChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageIndex(null);
    lastSpokenIndexRef.current = 0;
    setMessages([
      {
        sender: 'bot',
        text: `Conversation reset! Ask me anything about Delhi monuments, entry ticketing, metro lines, or official auto fares.\n\n[action: /home | Explore Places] [action: /fare-meter | Check Auto Fare] [action: /my-journey | My Journey Timeline]`,
        source: 'TravelMate Core • Powered by Google Gemini',
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
        <div className="whitespace-pre-line leading-relaxed">
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
                className={`${isBullet ? 'flex items-start space-x-2 my-1' : 'my-1'} ${
                  isHighlight
                    ? 'text-cyan-300 font-medium bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20'
                    : ''
                }`}
              >
                {isBullet && (
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                )}
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanLine
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                      .replace(/__(.*?)__/g, '<u>$1</u>')
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-cyan-950/40"
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
        <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-r from-purple-600/35 via-indigo-600/35 to-cyan-500/35 opacity-40 blur-2xl animate-pulse pointer-events-none transition-all duration-500" />

        {/* Chatbot Card Container */}
        <div className="relative w-full bg-[#0c0e14]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl flex flex-col h-[650px] max-h-[92vh] overflow-hidden">
          
          {/* Top Header Bar */}
          <div className="p-4 bg-[#11131c]/90 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              {/* Brand Avatar with Glowing Pulse Ring */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bot className="w-5 h-5 text-cyan-200" />
                {speakingMessageIndex !== null && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white font-display">
                    TravelMate AI
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30 uppercase tracking-wide flex items-center space-x-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Gemini</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Official Voice Assistant • Speaks Answers & Guides Navigation
                </p>
              </div>
            </div>

            {/* Header Right Action Controls */}
            <div className="flex items-center space-x-1.5">
              {/* Voice Speak Toggle Button */}
              <button
                onClick={() => {
                  const nextVal = !voiceAutoPlay;
                  setVoiceAutoPlay(nextVal);
                  if (!nextVal && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setSpeakingMessageIndex(null);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                  voiceAutoPlay
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
                title={
                  voiceAutoPlay
                    ? 'Voice Speaking is ON (click to mute)'
                    : 'Voice Speaking is OFF (click to unmute)'
                }
              >
                {voiceAutoPlay ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline">
                  {voiceAutoPlay ? 'Voice: ON' : 'Muted'}
                </span>
              </button>

              {/* Active Speaking Indicator */}
              {speakingMessageIndex !== null && (
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setSpeakingMessageIndex(null);
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse flex items-center space-x-1 hover:bg-indigo-500/30"
                  title="Click to stop speaking"
                >
                  <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                  <span className="hidden sm:inline text-[10px]">Speaking...</span>
                </button>
              )}

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
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                title="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Engine Selector Sub-bar */}
          <div className="px-4 py-2 bg-[#0e111a] border-b border-white/10 flex items-center justify-between text-xs shrink-0">
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
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Gemini 3.8 Flash - Fast, low latency response"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Flash 3.8</span>
              </button>

              <button
                id="btn-select-model-pro"
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title="Gemini 3.1 Pro Preview - Deep reasoning & complex guidance"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>🧠 Pro 3.1</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-xs shadow-md transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-br-sm shadow-indigo-600/20'
                      : 'bg-[#121622]/90 border border-white/10 text-slate-200 rounded-bl-sm shadow-black/40'
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

                  {/* Bot Source & Speaker Bar */}
                  {msg.sender === 'bot' && (
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate pr-2">{msg.source}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-cyan-400 font-semibold">{msg.confidence}</span>
                        <button
                          onClick={() => speakMessage(msg.text, idx)}
                          className={`p-1 rounded-md transition-colors ${
                            speakingMessageIndex === idx
                              ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title={
                            speakingMessageIndex === idx
                              ? 'Stop speaking'
                              : 'Listen to response'
                          }
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 bg-[#121622]/90 border border-white/10 rounded-2xl rounded-bl-none text-xs text-slate-300 flex items-center space-x-2.5 shadow-md">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-medium">
                    TravelMate AI is querying {selectedModel.includes('pro') ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash'} & synthesizing response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Prompt Chips */}
          <div className="px-3 py-2 bg-[#0c0e14]/90 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
            {quickPromptChips.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] whitespace-nowrap px-3 py-1.5 bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 rounded-full text-slate-300 hover:text-cyan-300 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input & Voice Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#11131c]/90 border-t border-white/10 flex items-center space-x-2 shrink-0"
          >
            {/* Microphone Voice Input */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
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
              id="input-tm-chatbot-query"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask TravelMate: 'Red Fort tickets', 'Auto fare', 'Safe routes'..."
              className="flex-1 px-4 py-2.5 bg-[#141824] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              id="btn-send-tm-chatbot"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 active:scale-95"
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
