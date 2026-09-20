import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRightLeft,
  Car,
  Compass,
  ShieldAlert,
  ShoppingBag,
  Landmark,
  Utensils,
  Radio,
  RefreshCw,
  QrCode,
  Zap,
  ChevronDown,
  Settings,
  MessageSquare,
  Send,
  X,
  ShieldCheck,
  KeyRound,
  Trash2,
  User,
  VolumeX,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Headphones
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  PRELOADED_TOURIST_PHRASES,
  getBhashiniConfig,
  saveBhashiniConfig,
  clearBhashiniConfig,
  verifyBhashiniKey,
  translateText,
  playAudioSpeech,
  stopAudioSpeech,
} from '../services/bhashiniService';

export default function PhraseHelperPage() {
  const [searchParams] = useSearchParams();

  // Mode: 'convo' (Live Conversation Mode) or 'direct' (Quick Translation Cockpit)
  const [activeMode, setActiveMode] = useState('convo');

  // Auto-speak setting: automatically speaks translated audio out loud
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Speech rate: 0.88 for crisp clarity to non-native speakers, 1.0 for normal
  const [speechSpeed, setSpeechSpeed] = useState(0.88);

  // Language States
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Two-Way Conversation Dialogue History
  const [convoMessages, setConvoMessages] = useState([
    {
      id: 'msg-0',
      sender: 'tourist',
      text: 'Hello! Please take me to the Red Fort by meter.',
      lang: 'en',
      translatedText: 'नमस्ते! कृपया मुझे मीटर से लाल किले ले चलिए।',
      transliteration: 'Namaste! Kripya mujhe meter se Lal Qila le chaliye.',
      phonetic: 'Nuh-mus-tay! Krip-ya moo-jhay mee-tur say Laal Kee-la lay chuh-lee-ye.',
      targetLang: 'hi',
      timestamp: 'Just now'
    },
    {
      id: 'msg-1',
      sender: 'local',
      text: 'हाँ बैठिए, मैं मीटर से चलूँगा। लाहौरी गेट पर छोड़ दूँगा।',
      lang: 'hi',
      translatedText: 'Yes please sit, I will go by meter. I will drop you at Lahori Gate.',
      transliteration: 'Haan baithiye, main meter se chaloonga. Lahori Gate par chhod doonga.',
      phonetic: 'Haa-n bai-thi-ye, mai-n mee-tar se cha-loo-nga.',
      targetLang: 'en',
      timestamp: 'Just now'
    }
  ]);

  // Speech Recognition States
  const [isListeningTourist, setIsListeningTourist] = useState(false);
  const [isListeningLocal, setIsListeningLocal] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Audio Playback States
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Fullscreen Driver Card Overlay
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [bhashiniConfig, setBhashiniConfig] = useState(getBhashiniConfig());
  const [modalUserId, setModalUserId] = useState(bhashiniConfig.USER_ID || '');
  const [modalApiKey, setModalApiKey] = useState(bhashiniConfig.API_KEY || '');
  const [modalInferenceKey, setModalInferenceKey] = useState(bhashiniConfig.INFERENCE_API_KEY || '');
  const [keyVerifyStatus, setKeyVerifyStatus] = useState(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  // 1-Tap Quick Tourist Scenario Chips
  const quickTouristChips = [
    { label: 'Use Meter', text: 'Please turn on the meter.', icon: Car },
    { label: 'Nearest Metro', text: 'Where is the nearest metro station?', icon: Compass },
    { label: 'Official Fare', text: 'What is the official Delhi transport fare?', icon: ShoppingBag },
    { label: 'ASI Ticket Counter', text: 'Where is the official ASI ticket counter?', icon: Landmark },
    { label: 'Bottled Water', text: 'Is sealed bottled drinking water available here?', icon: Utensils },
    { label: 'Police Help (112)', text: 'I need police help. Please call 112 immediately.', icon: ShieldAlert },
    { label: 'Stop Here', text: 'Please stop here, I want to get off.', icon: Car },
    { label: 'Pay by QR/UPI', text: 'Can I pay using UPI or QR code?', icon: QrCode },
  ];

  // Refresh config state
  const refreshConfigState = () => {
    const cfg = getBhashiniConfig();
    setBhashiniConfig(cfg);
    setModalUserId(cfg.USER_ID || '');
    setModalApiKey(cfg.API_KEY || '');
    setModalInferenceKey(cfg.INFERENCE_API_KEY || '');
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        if (isListeningLocal) {
          setIsListeningLocal(false);
          await handleLocalMessage(transcript);
        } else {
          setIsListeningTourist(false);
          setInputText(transcript);
          if (activeMode === 'convo') {
            await handleTouristMessage(transcript);
          } else {
            await handleTranslate(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('[Bhashini Voice] Speech recognition error:', event.error);
        setIsListeningTourist(false);
        setIsListeningLocal(false);
      };

      recognition.onend = () => {
        setIsListeningTourist(false);
        setIsListeningLocal(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopAudioSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [sourceLang, targetLang, isListeningLocal, activeMode]);

  // Handle URL parameter ?voice=1 auto-trigger
  useEffect(() => {
    if (searchParams.get('voice') === '1' && speechSupported && recognitionRef.current) {
      const timer = setTimeout(() => {
        startListeningTourist();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, speechSupported]);

  // Start Voice Input for Tourist
  const startListeningTourist = () => {
    if (!recognitionRef.current) return;
    stopAudioSpeech();
    setIsListeningLocal(false);
    setIsListeningTourist(true);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
    recognitionRef.current.lang = langObj?.speechLang || 'en-IN';
    try {
      recognitionRef.current.start();
    } catch (_) {}
  };

  // Start Voice Input for Local Driver (Hindi / Local)
  const startListeningLocal = () => {
    if (!recognitionRef.current) return;
    stopAudioSpeech();
    setIsListeningTourist(false);
    setIsListeningLocal(true);

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
    recognitionRef.current.lang = langObj?.speechLang || 'hi-IN';
    try {
      recognitionRef.current.start();
    } catch (_) {}
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListeningTourist(false);
    setIsListeningLocal(false);
  };

  // Play Speech Audio
  const handlePlayAudio = (text, lang = 'hi', id = null) => {
    setPlayingAudioId(id || text);
    playAudioSpeech(text, lang);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 2800);
  };

  // Tourist sends a message in Two-Way Conversation Mode
  const handleTouristMessage = async (textToSend = inputText) => {
    const text = (textToSend || '').trim();
    if (!text) return;

    setIsTranslating(true);
    setInputText('');

    try {
      const res = await translateText({
        text,
        sourceLang,
        targetLang,
      });

      const newMsg = {
        id: `tourist-${Date.now()}`,
        sender: 'tourist',
        text,
        lang: sourceLang,
        translatedText: res.hindi || res.translated,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        targetLang,
        source: res.source,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConvoMessages((prev) => [...prev, newMsg]);
      setTranslationResult(res);

      // Auto-play local translation audio loudly if enabled
      if (autoSpeak) {
        handlePlayAudio(newMsg.translatedText, targetLang, newMsg.id);
      }
    } catch (err) {
      console.error('Tourist translate error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Local sends a message in Two-Way Conversation Mode
  const handleLocalMessage = async (localSpeech) => {
    const text = (localSpeech || '').trim();
    if (!text) return;

    setIsTranslating(true);
    try {
      const res = await translateText({
        text,
        sourceLang: targetLang,
        targetLang: sourceLang,
      });

      const newMsg = {
        id: `local-${Date.now()}`,
        sender: 'local',
        text,
        lang: targetLang,
        translatedText: res.english || res.translated,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        targetLang: sourceLang,
        source: res.source,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConvoMessages((prev) => [...prev, newMsg]);

      // Auto-play English/tourist audio for tourist if enabled
      if (autoSpeak) {
        handlePlayAudio(newMsg.translatedText, sourceLang, newMsg.id);
      }
    } catch (err) {
      console.error('Local speech translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Single Quick Translation
  const handleTranslate = async (textToTranslate = inputText) => {
    const query = (textToTranslate || '').trim();
    if (!query) return;

    setIsTranslating(true);
    try {
      const result = await translateText({
        text: query,
        sourceLang,
        targetLang,
      });
      setTranslationResult(result);
      if (autoSpeak) {
        handlePlayAudio(result.hindi || result.translated, targetLang);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Language Swap
  const handleSwapLanguages = () => {
    const tempSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempSource);
    setInputText('');
    setTranslationResult(null);
  };

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger quick scenario chip
  const handleSelectChip = async (chipText) => {
    setInputText(chipText);
    if (activeMode === 'convo') {
      await handleTouristMessage(chipText);
    } else {
      await handleTranslate(chipText);
    }
  };

  // Clear conversation history
  const handleClearConversation = () => {
    setConvoMessages([]);
  };

  // Verify and Save Bhashini API Key from modal
  const handleSaveModalKey = async () => {
    setIsVerifyingKey(true);
    setKeyVerifyStatus(null);

    const res = await verifyBhashiniKey({
      apiKey: modalApiKey,
      userId: modalUserId,
      inferenceApiKey: modalInferenceKey,
    });

    setIsVerifyingKey(false);
    setKeyVerifyStatus(res);

    if (res.success) {
      saveBhashiniConfig({
        apiKey: modalApiKey,
        userId: modalUserId,
        inferenceApiKey: modalInferenceKey,
      });
      refreshConfigState();
      setTimeout(() => {
        setIsKeyModalOpen(false);
        setKeyVerifyStatus(null);
      }, 1500);
    }
  };

  // Remove custom key and revert to system defaults
  const handleRemoveCustomKey = () => {
    clearBhashiniConfig();
    refreshConfigState();
    setKeyVerifyStatus({ success: true, message: 'Custom credentials cleared. Using system pipeline.' });
    setTimeout(() => {
      setIsKeyModalOpen(false);
      setKeyVerifyStatus(null);
    }, 1200);
  };

  // Categories for Filtering Curated Scenarios
  const categories = [
    { label: 'All', icon: Sparkles },
    { label: 'Transport & Meter', icon: Car },
    { label: 'Directions & Metro', icon: Compass },
    { label: 'Safety & Emergency', icon: ShieldAlert },
    { label: 'Fair Fare & Shopping', icon: ShoppingBag },
    { label: 'Heritage & Places', icon: Landmark },
    { label: 'Dining & Health', icon: Utensils },
  ];

  // Filtered Preloaded Phrases
  const filteredPhrases = PRELOADED_TOURIST_PHRASES.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.english.toLowerCase().includes(q) ||
      item.hindi.includes(q) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.context.toLowerCase().includes(q);
  });

  // Track the most recent messages for the two-column split cards
  const lastTouristMsg = [...convoMessages].reverse().find((m) => m.sender === 'tourist');
  const lastLocalMsg = [...convoMessages].reverse().find((m) => m.sender === 'local');

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      {/* Signature Coder Army Ambient Cyber Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-tr from-purple-600/30 via-indigo-600/25 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[700px] -left-48 w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] -right-48 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-300">

        {/* ===================================================================== */}
        {/* 1. FULLSCREEN "SHOW TO DRIVER" HIGH-CONTRAST DISPLAY OVERLAY          */}
        {/* ===================================================================== */}
        {fullscreenPhrase && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-in zoom-in-95">
            <button
              onClick={() => setFullscreenPhrase(null)}
              className="absolute top-6 right-6 p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none cursor-pointer"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-6 h-6" />
            </button>

            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs uppercase tracking-widest font-bold mb-6 animate-pulse">
              <Car className="w-4 h-4 mr-1 text-cyan-400" />
              <span>Show this high-contrast screen to Driver / Local</span>
            </div>

            <div className="w-full max-w-3xl bg-[#12151f] border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-12 shadow-2xl shadow-cyan-500/20 space-y-6">
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-amber-300 leading-tight font-display tracking-wide drop-shadow-lg">
                {fullscreenPhrase.hindi || fullscreenPhrase.translatedText || fullscreenPhrase.translated}
              </div>

              {fullscreenPhrase.transliteration && (
                <div className="text-lg sm:text-2xl font-mono text-cyan-300 bg-white/[0.04] py-3.5 px-4 rounded-2xl border border-white/10">
                  "{fullscreenPhrase.transliteration}"
                </div>
              )}

              {fullscreenPhrase.phonetic && (
                <div className="text-sm sm:text-base text-slate-300">
                  Say Aloud: <strong className="text-amber-300">{fullscreenPhrase.phonetic}</strong>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs sm:text-sm text-slate-300 text-left">
                  English Meaning: <strong className="text-white">{fullscreenPhrase.english || fullscreenPhrase.text || fullscreenPhrase.original}</strong>
                </span>

                <button
                  onClick={() => handlePlayAudio(fullscreenPhrase.hindi || fullscreenPhrase.translatedText || fullscreenPhrase.translated, 'hi')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-2xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-black" />
                  <span>Play Loud Hindi Audio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 2. IN-APP BHASHINI API KEY SETUP MODAL & GUIDE                        */}
        {/* ===================================================================== */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#121520] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 my-8">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white font-display">
                      Add & Configure Bhashini API Key
                    </h3>
                    <p className="text-xs text-slate-400">
                      Digital India Bhashini (MeitY National Language Mission)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step-by-Step Educational Guide Card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-cyan-300">
                  <BookOpen className="w-4 h-4" />
                  <span>How to get & connect your Bhashini API credentials:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
                  <li>Visit official Bhashini portal at <a href="https://dhruva.bhashini.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center">dhruva.bhashini.gov.in <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a> or <a href="https://bhashini.gov.in/ulca" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center">bhashini.gov.in/ulca <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a>.</li>
                  <li>Copy your <strong>User ID</strong> and <strong>API Key</strong> (or Inference API Key).</li>
                  <li>Paste below and click <strong>"Verify & Connect Live API"</strong> to test live MeitY inference.</li>
                  <li>Alternatively, add them directly to <code className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono">backend/.env</code> under <code className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono">BHASHINI_API_KEY</code>.</li>
                </ol>
              </div>

              {/* Input Form Fields */}
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bhashini User ID <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalUserId}
                    onChange={(e) => setModalUserId(e.target.value)}
                    placeholder="e.g. 7c34b1a2-90ab-4433-88bb-..."
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bhashini API Key / Authorization Key <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={modalApiKey}
                    onChange={(e) => setModalApiKey(e.target.value)}
                    placeholder="Paste your private Bhashini API Key"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    ULCA Inference API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={modalInferenceKey}
                    onChange={(e) => setModalInferenceKey(e.target.value)}
                    placeholder="Leave empty if your API Key is unified"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                {/* Verification result notification */}
                {keyVerifyStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                      keyVerifyStatus.success
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{keyVerifyStatus.message || keyVerifyStatus.error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {bhashiniConfig.isCustomKey ? (
                  <button
                    type="button"
                    onClick={handleRemoveCustomKey}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5 py-2 px-3 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>System Neural Pipeline Ready</span>
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModalKey}
                    disabled={isVerifyingKey || !modalApiKey || !modalUserId}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isVerifyingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with MeitY...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify & Connect Live API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. HERO BANNER WITH LIVE CONVERSATION & BHASHINI TALK HIGHLIGHTS      */}
        {/* ===================================================================== */}
        <div className="relative group">
          {/* Ambient Glow Backdrop */}
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-60 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />

          <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                {/* Trust / Bhashini Pill */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-semibold text-slate-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-cyan-300 font-bold">BHASHINI Talk (Smart Voice)</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-300 font-bold">Digital India Language Mission</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  Bhashini Translator &{' '}
                  <span className="coder-text-gradient">Live Conversation</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Bridge the real-time communication gap between international tourists and Delhi locals (auto-rickshaw drivers, street vendors, and police). Speak your native language; TravelMate translates and speaks aloud in colloquial Hindi with large, sunlight-ready driver screens.
                </p>
              </div>

              {/* Mode Toggle & API Key Badge */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 shrink-0">
                {/* Bhashini Key Settings Button */}
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-between space-x-2.5 cursor-pointer shadow-md"
                >
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Bhashini API:</span>
                    <span className="text-cyan-300 font-mono">
                      {bhashiniConfig.isCustomKey ? 'Custom Key Connected' : 'Live Neural Engine'}
                    </span>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Mode Switcher Tabs */}
                <div className="p-1 bg-[#0b0e14] border border-white/10 rounded-2xl flex items-center space-x-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setActiveMode('convo')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                      activeMode === 'convo'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Live Conversation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('direct')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                      activeMode === 'direct'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Quick Translate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. BHASHINI MULTI-LANGUAGE SELECTOR & AUDIO CONTROLS BAR              */}
        {/* ===================================================================== */}
        <div className="bg-[#121520] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tourist Language:</span>
            </span>

            {/* Quick tourist language pills */}
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'es', label: 'Spanish', flag: '🇪🇸' },
              { code: 'fr', label: 'French', flag: '🇫🇷' },
              { code: 'de', label: 'German', flag: '🇩🇪' },
              { code: 'ru', label: 'Russian', flag: '🇷🇺' },
              { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setSourceLang(item.code)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                  sourceLang === item.code
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/5'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            ))}

            {/* All Languages Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-[#181c2b] text-xs font-bold text-slate-200 pl-3 pr-7 py-1.5 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none"
              >
                <optgroup label="International Languages">
                  {SUPPORTED_LANGUAGES.filter((l) => !l.isIndian).map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#121520] text-white">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Bhashini Indian Languages">
                  {SUPPORTED_LANGUAGES.filter((l) => l.isIndian).map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#121520] text-white">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Audio Controls (Auto-Speak + Speed + Target) */}
          <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
            {/* Auto-Speak Vocalizer Toggle */}
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
                autoSpeak
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Toggle automatic loud voice reading on translation"
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span>{autoSpeak ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}</span>
            </button>

            <button
              onClick={handleSwapLanguages}
              title="Swap Languages"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            </button>

            <div className="px-3 py-1.5 text-xs font-black text-amber-300 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center space-x-1.5 shrink-0">
              <span>🇮🇳</span>
              <span>Local: {targetLang === 'hi' ? 'Hindi (हिन्दी)' : SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4B. BHASHINI API KEY QUICK CONNECT BANNER                             */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-cyan-950/30 via-[#121520] to-indigo-950/30 border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              <KeyRound className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-white">Have your own Bhashini API Key?</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {bhashiniConfig.isCustomKey ? 'Custom Key Active' : 'Ready to Connect'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Plug your official MeitY User ID & API Key for direct cloud pipeline inference, or use our built-in neural translator.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 hover:text-white transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-sm hover:scale-102"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>{bhashiniConfig.isCustomKey ? 'Manage Bhashini API' : 'Connect Your API Key'}</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* 5. 1-TAP TOURIST SITUATIONAL PRESETS                                  */}
        {/* ===================================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Tap Tourist Situations (Fast Speech)</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Tap any chip to instantly speak to local
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {quickTouristChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(chip.text)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 bg-[#14161f] hover:bg-[#1f2230] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-white shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 6. MAIN WORKSPACE: LIVE CONVERSATION OR DIRECT TRANSLATE              */}
        {/* ===================================================================== */}
        {activeMode === 'convo' ? (
          /* =================================================================== */
          /* MODE A: LIVE TWO-WAY CONVERSATION WORKSPACE (COMPACT SPLIT DESIGN)  */
          /* =================================================================== */
          <div className="relative group">
            {/* Ambient Glow Backdrop */}
            <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-50 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />

            <div className="relative rounded-3xl p-5 sm:p-7 border-2 border-cyan-500/30 bg-[#121520]/95 backdrop-blur-xl shadow-2xl space-y-5">
              
              {/* Top Conversation Header with Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-sm">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-white font-display flex items-center space-x-2">
                      <span>Live Conversation Mode</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                        Face-to-Face
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Hold to speak. The other person hears your translated voice in real-time.
                    </p>
                  </div>
                </div>

                {/* Header Controls: Clear & Auto-voice toggle */}
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
                      autoSpeak
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle automatic loud voice reading on translation"
                  >
                    {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{autoSpeak ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}</span>
                  </button>

                  {convoMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearConversation}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Clear chat transcript"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2-COLUMN SPLIT FACE-TO-FACE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                
                {/* LEFT COLUMN: TOURIST SIDE */}
                <div className="bg-[#151928] p-4 sm:p-5 rounded-2xl border border-indigo-500/30 text-center space-y-3.5 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-extrabold text-indigo-100">Tourist Side</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-300/80 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                        You Speak
                      </span>
                    </div>

                    {/* Tourist Language Selector */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                      <span className="shrink-0 text-slate-400 font-medium">Speaks:</span>
                      <select
                        id="live-tourist-lang-select"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-400 cursor-pointer max-w-[200px] truncate shadow-inner"
                      >
                        <optgroup label="International Languages">
                          {SUPPORTED_LANGUAGES.filter(l => !l.isIndian).map(l => (
                            <option key={l.code} value={l.code} className="bg-[#121520] text-white">
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Indian Languages">
                          {SUPPORTED_LANGUAGES.filter(l => l.isIndian).map(l => (
                            <option key={l.code} value={l.code} className="bg-[#121520] text-white">
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Circular Talk Button */}
                  <div className="py-2 relative z-10">
                    <button
                      type="button"
                      onClick={isListeningTourist ? stopListening : startListeningTourist}
                      disabled={isTranslating && isListeningLocal}
                      className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-1.5 transition-all shadow-xl cursor-pointer ${
                        isListeningTourist
                          ? 'bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-400/50 animate-pulse scale-105'
                          : isTranslating && isListeningTourist
                          ? 'bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/40'
                          : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-2 border-indigo-500/40 hover:border-indigo-400 hover:scale-105 active:scale-95 shadow-indigo-600/20'
                      }`}
                    >
                      {isListeningTourist ? (
                        <>
                          <MicOff className="w-7 h-7 text-white animate-bounce" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Stop & Send</span>
                        </>
                      ) : isTranslating && isListeningTourist ? (
                        <>
                          <RefreshCw className="w-7 h-7 animate-spin text-indigo-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Translating...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-7 h-7 text-indigo-300" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Tap to Talk</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                      {isListeningTourist ? '🔴 Speaking now... tap to send' : `Tap to speak ${SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English'}`}
                    </span>
                  </div>

                  {/* Converting status indicator */}
                  {isTranslating && isListeningTourist && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl text-center text-xs text-indigo-300 animate-pulse">
                      Converting speech to {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'Hindi'}...
                    </div>
                  )}

                  {/* Latest Tourist Output Card (Compact & Readable) */}
                  {lastTouristMsg && (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl text-left space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                          Your Speech & {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'Hindi'}
                        </span>
                        <span className="text-[10px] text-indigo-300/80 font-mono">Ready to play</span>
                      </div>

                      <div className="text-xs text-slate-300 italic">
                        "{lastTouristMsg.text}"
                      </div>

                      <div className="text-sm sm:text-base font-extrabold text-amber-300 font-display bg-black/40 p-2 rounded-lg border border-amber-400/20 leading-snug">
                        {lastTouristMsg.translatedText}
                      </div>

                      {lastTouristMsg.transliteration && (
                        <div className="text-[11px] font-mono text-cyan-300">
                          "{lastTouristMsg.transliteration}"
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(lastTouristMsg.translatedText, lastTouristMsg.targetLang || targetLang, lastTouristMsg.id)}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md text-white cursor-pointer ${
                            playingAudioId === lastTouristMsg.id
                              ? 'bg-amber-600 animate-pulse shadow-amber-600/40'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-98'
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === lastTouristMsg.id ? 'animate-bounce' : ''}`} />
                          <span>{playingAudioId === lastTouristMsg.id ? 'Speaking...' : `Play (${SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'Hindi'})`}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFullscreenPhrase(lastTouristMsg)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors cursor-pointer"
                          title="Show Fullscreen to Driver"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: LOCAL DRIVER SIDE */}
                <div className="bg-[#111f26] p-4 sm:p-5 rounded-2xl border border-cyan-500/30 text-center space-y-3.5 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Car className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-extrabold text-cyan-100">Local Driver / Vendor</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-cyan-300/80 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        Local Speaks
                      </span>
                    </div>

                    {/* Local Language Selector */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                      <span className="shrink-0 text-slate-400 font-medium">Speaks:</span>
                      <select
                        id="live-local-lang-select"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[200px] truncate shadow-inner"
                      >
                        <optgroup label="Indian Languages (Bhashini)">
                          {SUPPORTED_LANGUAGES.filter(l => l.isIndian).map(l => (
                            <option key={l.code} value={l.code} className="bg-[#121520] text-white">
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="International Languages">
                          {SUPPORTED_LANGUAGES.filter(l => !l.isIndian).map(l => (
                            <option key={l.code} value={l.code} className="bg-[#121520] text-white">
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Circular Talk Button */}
                  <div className="py-2 relative z-10">
                    <button
                      type="button"
                      onClick={isListeningLocal ? stopListening : startListeningLocal}
                      disabled={isTranslating && isListeningTourist}
                      className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-1.5 transition-all shadow-xl cursor-pointer ${
                        isListeningLocal
                          ? 'bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-400/50 animate-pulse scale-105'
                          : isTranslating && isListeningLocal
                          ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40'
                          : 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border-2 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 active:scale-95 shadow-cyan-600/20'
                      }`}
                    >
                      {isListeningLocal ? (
                        <>
                          <MicOff className="w-7 h-7 text-white animate-bounce" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Stop & Send</span>
                        </>
                      ) : isTranslating && isListeningLocal ? (
                        <>
                          <RefreshCw className="w-7 h-7 animate-spin text-cyan-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Translating...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-7 h-7 text-cyan-300" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Tap to Talk</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                      {isListeningLocal ? '🔴 चालक बोल रहे हैं...' : 'ड्राइवर के बोलने के लिए टैप करें'}
                    </span>
                  </div>

                  {/* Converting status indicator */}
                  {isTranslating && isListeningLocal && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-2.5 rounded-xl text-center text-xs text-cyan-300 animate-pulse">
                      Converting local speech to {SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English'}...
                    </div>
                  )}

                  {/* Latest Local Output Card (Compact & Readable) */}
                  {lastLocalMsg && (
                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-left space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                          Local Speech & {SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English'}
                        </span>
                        <span className="text-[10px] text-cyan-300/80 font-mono">Ready to play</span>
                      </div>

                      <div className="text-xs text-slate-300 italic">
                        "{lastLocalMsg.text}"
                      </div>

                      <div className="text-sm sm:text-base font-extrabold text-cyan-300 font-display bg-black/40 p-2 rounded-lg border border-cyan-400/20 leading-snug">
                        {lastLocalMsg.translatedText}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(lastLocalMsg.translatedText, lastLocalMsg.targetLang || sourceLang, lastLocalMsg.id)}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-md text-white cursor-pointer ${
                            playingAudioId === lastLocalMsg.id
                              ? 'bg-amber-600 animate-pulse shadow-amber-600/40'
                              : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30 active:scale-98'
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === lastLocalMsg.id ? 'animate-bounce' : ''}`} />
                          <span>{playingAudioId === lastLocalMsg.id ? 'Speaking...' : `Play (${SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English'})`}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(lastLocalMsg.translatedText)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* CONVERSATION HISTORY LOG / CHAT STREAM (Underneath cards, max-h-56) */}
              {convoMessages.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
                    <span>Conversation Stream ({convoMessages.length} exchanges)</span>
                    <button
                      type="button"
                      onClick={handleClearConversation}
                      className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="bg-[#0b0e14] p-3 sm:p-4 rounded-2xl border border-white/10 space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
                    {convoMessages.map((msg) => {
                      const isTourist = msg.sender === 'tourist';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[85%] space-y-1 ${
                            isTourist ? 'self-start items-start' : 'self-end items-end ml-auto'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                            <span>{isTourist ? 'Tourist' : 'Local Driver'}</span>
                            <span className="text-slate-600 font-normal">• {msg.timestamp}</span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-sm shadow-md border ${
                              isTourist
                                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-50 rounded-tl-sm'
                                : 'bg-cyan-600/20 border-cyan-500/30 text-cyan-50 rounded-tr-sm'
                            }`}
                          >
                            <div className="font-bold text-white leading-snug">
                              {msg.translatedText}
                            </div>
                            <div className="text-[11px] opacity-75 italic mt-1 text-slate-300">
                              "{msg.text}"
                            </div>

                            <div className="mt-2 flex items-center space-x-2 pt-1 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(msg.translatedText, msg.targetLang, msg.id)}
                                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                                  playingAudioId === msg.id
                                    ? 'bg-amber-500 text-white animate-pulse'
                                    : isTourist
                                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/30'
                                }`}
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>{playingAudioId === msg.id ? 'Speaking...' : 'Listen'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setFullscreenPhrase(msg)}
                                className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-white/10 transition-colors cursor-pointer"
                                title="Show large to driver"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopy(msg.translatedText)}
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
                                title="Copy translation"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Text Input Fallback Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTouristMessage();
                }}
                className="flex items-center space-x-2 pt-2 border-t border-white/10"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message to driver... (Press Enter to translate & speak)"
                  className="flex-1 px-3.5 py-2.5 bg-[#0b0e14] border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTranslating}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer flex items-center space-x-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>

            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* MODE B: QUICK TRANSLATION COCKPIT (SINGLE WORKSPACE)                */
          /* =================================================================== */
          <div id="translation-workspace" className="relative group scroll-mt-24">
            <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-60 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />

            <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Source Input */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <span className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'Source'} Input</span>
                      </span>
                      <span className="text-[10px] text-slate-500 normal-case">
                        {speechSupported ? '🎙️ Speech ready' : 'Text mode'}
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={5}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTranslate();
                          }
                        }}
                        placeholder="Type any tourist phrase e.g. 'Can you take me to Connaught Place by meter?' or tap the microphone..."
                        className="w-full p-4 bg-[#0d0f15] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none shadow-inner"
                      />

                      {inputText && (
                        <button
                          onClick={() => {
                            setInputText('');
                            setTranslationResult(null);
                          }}
                          className="absolute top-3 right-3 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={isListeningTourist ? stopListening : startListeningTourist}
                        className={`flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                          isListeningTourist
                            ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-2 ring-rose-400'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
                        }`}
                      >
                        {isListeningTourist ? (
                          <>
                            <MicOff className="w-4 h-4 animate-bounce text-white" />
                            <span>Listening... (Tap to Stop)</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 text-cyan-200" />
                            <span>Speech-to-Speech (Speak Aloud)</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleTranslate()}
                      disabled={isTranslating || !inputText.trim()}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 coder-btn-primary text-white font-bold text-xs rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isTranslating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Translating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-200" />
                          <span>Translate via Bhashini</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Column 2: Hindi Tourist Output Card */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Colloquial Hindi Output (For Drivers & Locals)</span>
                      </span>
                      {translationResult && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {Math.round(translationResult.confidence * 100)}% Match
                        </span>
                      )}
                    </div>

                    {translationResult ? (
                      <div className="p-5 sm:p-6 bg-[#0d0f15] border-2 border-cyan-500/50 rounded-2xl space-y-4 animate-in fade-in duration-200 shadow-2xl relative">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wide bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                            {translationResult.source}
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleCopy(translationResult.hindi || translationResult.translated)}
                              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                              title="Copy Hindi text"
                            >
                              {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handlePlayAudio(translationResult.hindi || translationResult.translated, targetLang)}
                              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                playingAudioId === (translationResult.hindi || translationResult.translated)
                                  ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                                  : 'text-slate-400 hover:text-cyan-400 hover:bg-white/10'
                              }`}
                              title="Play Hindi Pronunciation Audio"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setFullscreenPhrase(translationResult)}
                              className="p-2 text-slate-400 hover:text-amber-300 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                              title="Show Fullscreen to Driver"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Main Devanagari Hindi Text */}
                        <div className="text-2xl sm:text-3xl font-black text-amber-300 font-display leading-relaxed">
                          {translationResult.hindi || translationResult.translated}
                        </div>

                        {/* Hinglish Romanized Transliteration */}
                        {translationResult.transliteration && (
                          <div className="text-xs sm:text-sm font-mono text-cyan-300 bg-cyan-950/25 p-3 rounded-xl border border-cyan-500/30">
                            "{translationResult.transliteration}"
                          </div>
                        )}

                        {/* Phonetic Pronunciation Guide */}
                        {translationResult.phonetic && (
                          <div className="text-xs text-slate-300 italic flex items-center space-x-1.5">
                            <span className="text-amber-300 font-bold not-italic">Say Aloud:</span>
                            <span className="text-slate-200">{translationResult.phonetic}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-52 bg-[#0d0f15] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                        <Sparkles className="w-8 h-8 text-slate-600" />
                        <p className="text-xs">Your translated Hindi phrase, Romanized Hinglish, and loud audio will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 7. CURATED TOURIST PHRASE DICTIONARY ACCORDING TO SIH DEPLOYMENT      */}
        {/* ===================================================================== */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
                Curated Delhi Tourist Survival Phrases
              </h3>
              <p className="text-xs text-slate-400">
                Guaranteed zero-data offline phrases for safe transport, fair fares, and ASI heritage access.
              </p>
            </div>

            {/* Search within phrases */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phrases (e.g. meter, water)..."
                className="w-full px-3 py-2 bg-[#0d0f15] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setActiveCategory(cat.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                    activeCategory === cat.label
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-[#121520] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Phrase Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="coder-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {phrase.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {phrase.quickTag}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                    "{phrase.english}"
                  </h4>

                  <div className="text-base font-extrabold text-amber-300 font-display mb-1">
                    {phrase.hindi}
                  </div>

                  <p className="text-xs font-mono text-cyan-300 mb-1">
                    "{phrase.transliteration}"
                  </p>

                  <p className="text-[11px] text-slate-400 italic">
                    Say: <strong className="text-slate-200">{phrase.phonetic}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {phrase.context}
                  </span>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(phrase.hindi, 'hi', phrase.id)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        playingAudioId === phrase.id
                          ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                          : 'text-slate-400 hover:text-cyan-400 hover:bg-white/10'
                      }`}
                      title="Play Pronunciation Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setFullscreenPhrase(phrase)}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                      title="Show Fullscreen to Driver"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(phrase.hindi)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                      title="Copy Hindi text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
