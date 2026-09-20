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
  AudioWaveform as Waveform
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  PRELOADED_TOURIST_PHRASES,
  getBhashiniConfig,
  saveBhashiniConfig,
  clearBhashiniConfig,
  verifyBhashiniKey,
  translateText,
  speechToSpeech,
  playAudioSpeech,
  stopAudioSpeech,
} from '../services/bhashiniService';

export default function PhraseHelperPage() {
  const [searchParams] = useSearchParams();

  // Mode: 'convo' (Two-Way Dialogue) or 'direct' (Quick Translation Cockpit)
  const [activeMode, setActiveMode] = useState('convo');

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
        targetLang: 'hi',
      });

      const newMsg = {
        id: `tourist-${Date.now()}`,
        sender: 'tourist',
        text,
        lang: sourceLang,
        translatedText: res.hindi || res.translated,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        targetLang: 'hi',
        source: res.source,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConvoMessages((prev) => [...prev, newMsg]);
      setTranslationResult(res);

      // Auto-play Hindi audio loudly for local
      handlePlayAudio(newMsg.translatedText, 'hi', newMsg.id);
    } catch (err) {
      console.error('Tourist translate error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Local sends a message in Two-Way Conversation Mode
  const handleLocalMessage = async (hindiSpeech) => {
    const text = (hindiSpeech || '').trim();
    if (!text) return;

    setIsTranslating(true);
    try {
      const res = await translateText({
        text,
        sourceLang: 'hi',
        targetLang: sourceLang,
      });

      const newMsg = {
        id: `local-${Date.now()}`,
        sender: 'local',
        text,
        lang: 'hi',
        translatedText: res.english || res.translated,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        targetLang: sourceLang,
        source: res.source,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConvoMessages((prev) => [...prev, newMsg]);

      // Auto-play English/tourist audio for tourist
      handlePlayAudio(newMsg.translatedText, sourceLang, newMsg.id);
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
    return matchesCat && matchesSearch;
  });

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
        {/* 2. IN-APP BHASHINI API KEY CONFIGURATION MODAL                        */}
        {/* ===================================================================== */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#121520] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white font-display">
                      Bhashini API Key Settings
                    </h3>
                    <p className="text-xs text-slate-400">
                      Digital India Bhashini Dhruva / ULCA Inference Pipeline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <p className="text-slate-300 leading-relaxed">
                  Enter your official credentials from <a href="https://bhashini.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold">bhashini.gov.in</a> or <a href="https://dhruva.bhashini.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold">dhruva.bhashini.gov.in</a>. If left empty, TravelMate automatically uses its high-accuracy pre-authenticated neural pipeline.
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bhashini User ID
                  </label>
                  <input
                    type="text"
                    value={modalUserId}
                    onChange={(e) => setModalUserId(e.target.value)}
                    placeholder="e.g. your-bhashini-user-id"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bhashini API Key / Authorization Key
                  </label>
                  <input
                    type="password"
                    value={modalApiKey}
                    onChange={(e) => setModalApiKey(e.target.value)}
                    placeholder="Paste your Bhashini API Key"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    ULCA Inference API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={modalInferenceKey}
                    onChange={(e) => setModalInferenceKey(e.target.value)}
                    placeholder="Leave empty if same as API key"
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>

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

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
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
                  <span className="text-[11px] text-slate-500">System Neural Active</span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
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
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Verify Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. HERO BANNER WITH SIH PRESENTATION HIGHLIGHTS                       */}
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
                  <span className="text-indigo-300 font-bold">Bridging Tourist & Local Communication</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  Bhashini Translator &{' '}
                  <span className="coder-text-gradient">Smart Voice AI</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Bridge the language gap between foreign tourists and Delhi locals (auto-rickshaw drivers, shopkeepers, guides, and police). Speak in your native tongue; TravelMate speaks back in clear colloquial Hindi with high-contrast driver display and loud speech synthesis.
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
                      {bhashiniConfig.isCustomKey ? 'Custom Key Active' : 'Neural Pipeline Live'}
                    </span>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Two-Way Convo vs Quick Translate Switcher */}
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
                    <span>Two-Way Convo</span>
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
        {/* 4. BHASHINI MULTI-LANGUAGE SELECTOR BAR                               */}
        {/* ===================================================================== */}
        <div className="bg-[#121520] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tourist Lang:</span>
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

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={handleSwapLanguages}
              title="Swap Languages"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
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
        {/* 6. MAIN WORKSPACE: TWO-WAY CONVERSATION OR DIRECT TRANSLATE           */}
        {/* ===================================================================== */}
        {activeMode === 'convo' ? (
          /* =================================================================== */
          /* MODE A: TWO-WAY CONVERSATION THREAD (TOURIST <-> LOCAL DRIVER)      */
          /* =================================================================== */
          <div className="relative group">
            {/* Ambient Multi-Color Glow Backdrop */}
            <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-60 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />

            <div className="relative rounded-3xl p-5 sm:p-7 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl space-y-6">
              
              {/* Chat Thread Container */}
              <div className="min-h-[280px] max-h-[460px] overflow-y-auto space-y-4 pr-1 sm:pr-2 no-scrollbar">
                {convoMessages.map((msg) => {
                  const isTourist = msg.sender === 'tourist';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isTourist ? 'items-start' : 'items-end'} space-y-1`}
                    >
                      {/* Speaker Tag */}
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 px-2 flex items-center space-x-1">
                        {isTourist ? (
                          <>
                            <User className="w-3 h-3 text-indigo-400" />
                            <span>Tourist ({SUPPORTED_LANGUAGES.find(l => l.code === msg.lang)?.name || 'Native'})</span>
                          </>
                        ) : (
                          <>
                            <span>Local Driver / Vendor (हिन्दी)</span>
                            <Car className="w-3 h-3 text-cyan-400" />
                          </>
                        )}
                        <span className="text-slate-600">• {msg.timestamp}</span>
                      </span>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-xl rounded-2xl p-4 sm:p-5 shadow-xl border space-y-2.5 ${
                          isTourist
                            ? 'bg-[#151928] border-indigo-500/40 text-white rounded-tl-sm'
                            : 'bg-[#111c25] border-cyan-500/40 text-white rounded-tr-sm'
                        }`}
                      >
                        {/* Spoken original text */}
                        <div className="text-xs sm:text-sm text-slate-300 border-b border-white/[0.08] pb-2">
                          "{msg.text}"
                        </div>

                        {/* Translated Output in Driver's Devanagari or Tourist's English */}
                        <div className={`text-xl sm:text-2xl font-black font-display leading-snug ${
                          isTourist ? 'text-amber-300' : 'text-cyan-300'
                        }`}>
                          {msg.translatedText}
                        </div>

                        {/* Transliteration & Phonetics for Tourist to read */}
                        {msg.transliteration && (
                          <div className="text-xs font-mono text-indigo-200 bg-black/30 p-2.5 rounded-xl border border-white/5">
                            "{msg.transliteration}"
                          </div>
                        )}

                        {/* Action buttons on message */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          {msg.phonetic ? (
                            <span className="text-[11px] text-slate-400 truncate max-w-[260px]">
                              Say: <strong className="text-amber-200">{msg.phonetic}</strong>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Live Bhashini</span>
                          )}

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(msg.translatedText, msg.targetLang, msg.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                playingAudioId === msg.id
                                  ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                              title="Play Speech Audio"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setFullscreenPhrase(msg)}
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Show Fullscreen to Driver"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(msg.translatedText)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Copy text"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTranslating && (
                  <div className="flex items-center space-x-2 text-xs text-cyan-300 animate-pulse p-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Translating via Digital India Bhashini...</span>
                  </div>
                )}
              </div>

              {/* DUAL MICROPHONE ACTION CONTROLS (Tourist Mic + Local Driver Mic) */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* BUTTON 1: TOURIST SPEAKS */}
                  <button
                    type="button"
                    onClick={isListeningTourist ? stopListening : startListeningTourist}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all shadow-lg cursor-pointer ${
                      isListeningTourist
                        ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-rose-600/40'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.01]'
                    }`}
                  >
                    {isListeningTourist ? (
                      <>
                        <MicOff className="w-5 h-5 text-white animate-bounce" />
                        <span>Listening Tourist... (Tap to Send)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 text-purple-200" />
                        <span>Tourist Speaks ({SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English'})</span>
                      </>
                    )}
                  </button>

                  {/* BUTTON 2: LOCAL DRIVER / VENDOR SPEAKS */}
                  <button
                    type="button"
                    onClick={isListeningLocal ? stopListening : startListeningLocal}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all shadow-lg cursor-pointer ${
                      isListeningLocal
                        ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-rose-600/40'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30 hover:scale-[1.01]'
                    }`}
                  >
                    {isListeningLocal ? (
                      <>
                        <MicOff className="w-5 h-5 text-white animate-bounce" />
                        <span>चालक बोल रहे हैं... (भेजने के लिए टैप करें)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 text-cyan-200" />
                        <span>स्थानीय व्यक्ति बोलें (Local Speaks Hindi)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Text Message Fallback Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTouristMessage();
                  }}
                  className="flex items-center space-x-2 pt-1"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Or type a question to speak to driver... (Press Enter to Send)"
                    className="flex-1 px-4 py-3 bg-[#0d0f15] border border-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTranslating}
                    className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

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
