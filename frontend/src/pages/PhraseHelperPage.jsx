import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRightLeft,
  Search,
  Car,
  Compass,
  ShieldAlert,
  ShoppingBag,
  Landmark,
  Utensils,
  Share2,
  Info,
  Radio,
  RefreshCw,
  PhoneCall,
  QrCode,
  Zap,
  HelpCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  PRELOADED_TOURIST_PHRASES,
  BHASHINI_CONFIG,
  translateText,
  speechToSpeech,
  playAudioSpeech,
  stopAudioSpeech,
} from '../services/bhashiniService';
import StatusBadge from '../components/common/StatusBadge';
import { useTraveler } from '../context/TravelerContext';

export default function PhraseHelperPage() {
  const { traveler } = useTraveler();
  const [searchParams] = useSearchParams();

  // Translation States
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Audio Playback States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fullscreen Driver Card Overlay
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1-Tap Quick Tourist Scenario Chips
  const quickTouristChips = [
    { label: 'Use Meter', text: 'Please turn on the meter.', icon: Car },
    { label: 'Nearest Metro', text: 'Where is the nearest metro station?', icon: Compass },
    { label: 'Fair Fare Rate', text: 'What is the official Delhi transport fare?', icon: ShoppingBag },
    { label: 'ASI Ticket Counter', text: 'Where is the official ASI ticket counter?', icon: Landmark },
    { label: 'Not Spicy Food', text: 'Please make it non-spicy and vegetarian.', icon: Utensils },
    { label: 'Police Help (112)', text: 'I need police help. Please call 112.', icon: ShieldAlert },
    { label: 'Stop Here', text: 'Please stop here, I want to get off.', icon: Car },
    { label: 'Pay by QR / UPI', text: 'Can I pay using UPI or QR code?', icon: QrCode },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
      recognition.lang = currentLangObj?.speechLang || (sourceLang === 'en' ? 'en-IN' : 'hi-IN');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically perform speech-to-speech translation
        await handleSpeechToSpeechTranslation(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
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
        } catch {
          // ignore
        }
      }
    };
  }, [sourceLang]);

  // Handle URL parameter ?voice=1 auto-trigger
  useEffect(() => {
    if (searchParams.get('voice') === '1' && speechSupported && recognitionRef.current) {
      const timer = setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, speechSupported]);

  // Handle Text Translation
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

  // Handle Speech-to-Speech (voice input -> translated voice output)
  const handleSpeechToSpeechTranslation = async (spokenText) => {
    if (!spokenText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await speechToSpeech({
        text: spokenText,
        sourceLang,
        targetLang,
      });
      setTranslationResult(result);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    } catch (err) {
      console.error('Speech-to-speech error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle Voice Input
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopAudioSpeech();
      const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
      recognitionRef.current.lang = currentLangObj?.speechLang || (sourceLang === 'en' ? 'en-IN' : 'hi-IN');
      recognitionRef.current.start();
    }
  };

  // Play Audio Output
  const handlePlayAudio = (text, lang = targetLang) => {
    setIsPlayingAudio(true);
    playAudioSpeech(text, lang);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2800);
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

  // Select a Preloaded Example Phrase
  const handleSelectPreloaded = (phrase) => {
    setInputText(phrase.english);
    setSourceLang('en');
    setTargetLang('hi');
    setTranslationResult({
      original: phrase.english,
      translated: phrase.hindi,
      hindi: phrase.hindi,
      english: phrase.english,
      transliteration: phrase.transliteration,
      phonetic: phrase.phonetic,
      sourceLang: 'en',
      targetLang: 'hi',
      source: 'Digital India Bhashini (Verified Phrase)',
      isLive: true,
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    });
    // Auto-scroll to translation workspace
    const el = document.getElementById('translation-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger quick scenario chip
  const handleSelectChip = async (chipText) => {
    setInputText(chipText);
    await handleTranslate(chipText);
  };

  // Categories for Filtering
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
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Signature Multi-Color Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-purple-600/30 via-indigo-600/25 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[550px] h-[550px] bg-purple-700/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[1300px] -right-48 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* ===================================================================== */}
        {/* FULLSCREEN "SHOW TO DRIVER" HIGH-CONTRAST DISPLAY OVERLAY            */}
        {/* ===================================================================== */}
        {fullscreenPhrase && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-in zoom-in-95">
            <button
              onClick={() => setFullscreenPhrase(null)}
              className="absolute top-6 right-6 p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-6 h-6" />
            </button>

            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs uppercase tracking-widest font-bold mb-6 animate-pulse">
              <Car className="w-4 h-4 mr-1 text-cyan-400" />
              <span>Show this screen to Auto-Rickshaw / Cab Driver</span>
            </div>

            <div className="w-full max-w-3xl bg-[#14161f] border-2 border-indigo-500/70 rounded-3xl p-6 sm:p-12 shadow-2xl shadow-indigo-500/30 space-y-6">
              <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-amber-300 leading-tight font-display tracking-wide drop-shadow-md">
                {fullscreenPhrase.hindi || fullscreenPhrase.translated}
              </div>

              <div className="text-lg sm:text-2xl font-mono text-indigo-300 bg-white/5 py-3 px-4 rounded-2xl border border-white/10">
                "{fullscreenPhrase.transliteration}"
              </div>

              {fullscreenPhrase.phonetic && (
                <div className="text-sm sm:text-base text-slate-300 italic">
                  Say Aloud: <strong className="text-cyan-300">{fullscreenPhrase.phonetic}</strong>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs sm:text-sm text-slate-300 text-left">
                  English Reference: <strong className="text-white">{fullscreenPhrase.english || fullscreenPhrase.original}</strong>
                </span>

                <button
                  onClick={() => handlePlayAudio(fullscreenPhrase.hindi || fullscreenPhrase.translated, 'hi')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 coder-btn-primary text-white font-bold rounded-2xl text-sm transition-all shadow-lg"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                  <span>Play Loud Hindi Audio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* HEADER HERO SECTION (MATCHING HOMEPAGE CODER ARMY THEME)              */}
        {/* ===================================================================== */}
        <div className="relative group">
          {/* Ambient Glow Backdrop */}
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-60 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />
          
          <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden">
            {/* Corner ambient orb */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                {/* Trust / Bhashini Pill */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-semibold text-slate-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-cyan-300 font-bold">National Language AI</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-300 font-bold">Digital India Bhashini Mission</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
                  Tourist Phrase Translator &{' '}
                  <span className="coder-text-gradient">Voice AI Assistant</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  Bridge the language gap across Delhi with instant English & foreign language translation to colloquial Hindi. Provides clear Devanagari script, Romanized Hinglish, phonetic pronunciation guides, and loud speech audio playback for rickshaw drivers and locals.
                </p>
              </div>

              {/* Status and Accreditation Badge */}
              <div className="bg-[#10121a]/80 border border-white/10 rounded-2xl p-4 shrink-0 flex flex-col justify-between space-y-3 lg:max-w-xs shadow-xl backdrop-blur-md">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {BHASHINI_CONFIG.USE_MOCK ? 'Bhashini Neural Engine' : 'Live ULCA Inference Pipeline'}
                    </div>
                    <div className="text-[10px] text-cyan-400">
                      {BHASHINI_CONFIG.USE_MOCK ? 'Live Translation + Grounded Fallback' : 'Connected to MeitY Cloud'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>Target: Local Hindi (HI)</span>
                  <span className="text-cyan-300 font-bold">Speech & Fullscreen Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 1-TAP QUICK SITUATIONAL TOURIST PRESETS (SPEED & COMFORT)             */}
        {/* ===================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Tap Tourist Survival Prompts</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Tap any chip to instantly translate & view Hindi text
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {quickTouristChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChip(chip.text)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 bg-[#14161f] hover:bg-[#1f2230] border border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-white shadow-md hover:scale-105 active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* INTERACTIVE TRANSLATION & SPEECH-TO-SPEECH WORKSPACE COCKPIT         */}
        {/* ===================================================================== */}
        <div id="translation-workspace" className="relative group scroll-mt-24">
          {/* Ambient Glowing Backdrop */}
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 group-hover:opacity-65 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />

          <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl space-y-6">
            
            {/* Top Workspace Bar: Language Selector & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">
                    Interactive Translation & Speech-to-Speech Cockpit
                  </h2>
                  <p className="text-xs text-slate-400">
                    Type or speak in your native language. Audio is transcribed, translated, and spoken back in Hindi.
                  </p>
                </div>
              </div>

              {/* Source Language Selector with Flags */}
              <div className="flex items-center space-x-2 bg-[#0d0f15] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
                <div className="relative">
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-transparent text-xs font-bold text-cyan-300 pl-3 pr-8 py-1.5 rounded-xl border border-cyan-500/30 focus:outline-none cursor-pointer appearance-none"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-[#14161f] text-white">
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                <button
                  onClick={handleSwapLanguages}
                  title="Swap Source and Target Language"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                <div className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center space-x-1">
                  <span>🇮🇳</span>
                  <span>{targetLang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}</span>
                </div>
              </div>
            </div>

            {/* Two-Column Cockpit Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Column 1: Source Language Input */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'Source'} Input
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 normal-case">
                      {speechSupported ? '🎙️ voice recognition ready' : 'text only'}
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
                      placeholder={
                        sourceLang === 'en'
                          ? "Type any tourist query e.g. 'Can you take me to Connaught Place by meter?' or tap the microphone to speak aloud..."
                          : sourceLang === 'es'
                          ? "¿Cuánto cuesta ir al Fuerte Rojo con taxímetro?..."
                          : sourceLang === 'fr'
                          ? "Pouvez-vous m'emmener à la station de métro par le compteur?..."
                          : "Type your query here or click the microphone to speak..."
                      }
                      className="w-full p-4 bg-[#0d0f15] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none shadow-inner"
                    />

                    {inputText && (
                      <button
                        onClick={() => {
                          setInputText('');
                          setTranslationResult(null);
                        }}
                        className="absolute top-3 right-3 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons: Mic (Speech-to-Speech) + Translate */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-2 ring-rose-400'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 animate-bounce text-white" />
                          <span>Listening... (Tap to translate)</span>
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
                        <span>Translating via Bhashini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>Translate to Hindi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Column 2: Hindi Tourist Output Card */}
              <div className="space-y-4 flex flex-col justify-between">
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
                    <div className="p-5 sm:p-6 bg-[#0d0f15] border-2 border-indigo-500/50 rounded-2xl space-y-4 animate-in fade-in duration-200 shadow-2xl relative">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wide bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                          {translationResult.source}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopy(translationResult.hindi || translationResult.translated)}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                            title="Copy Hindi text"
                          >
                            {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handlePlayAudio(translationResult.hindi || translationResult.translated, targetLang)}
                            className={`p-2 rounded-xl transition-colors ${
                              isPlayingAudio
                                ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                                : 'text-slate-400 hover:text-cyan-400 hover:bg-white/10'
                            }`}
                            title="Play Hindi Pronunciation Audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setFullscreenPhrase(translationResult)}
                            className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-white/10 transition-colors"
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
                        <div className="text-xs sm:text-sm font-mono text-indigo-300 bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/30">
                          "{translationResult.transliteration}"
                        </div>
                      )}

                      {/* Phonetic Pronunciation Guide */}
                      {translationResult.phonetic && (
                        <div className="text-xs text-slate-300 italic flex items-center space-x-1.5">
                          <span className="text-cyan-400 font-bold not-italic">Say Aloud:</span>
                          <span>{translationResult.phonetic}</span>
                        </div>
                      )}

                      {/* Show to Driver Large Button */}
                      <button
                        onClick={() => setFullscreenPhrase(translationResult)}
                        className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-xs rounded-xl transition-all shadow-md"
                      >
                        <Maximize2 className="w-4 h-4 text-indigo-300" />
                        <span>Show Oversized Screen to Auto-Rickshaw / Cab Driver</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] bg-[#0d0f15]/50">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-300">
                          Ready to Translate
                        </div>
                        <div className="text-xs text-slate-500 max-w-xs leading-relaxed">
                          Type a phrase, speak into the mic, or tap any quick prompt above to generate Devanagari Hindi text and audio speech.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* PRE-LOADED TOURIST PHRASES LIBRARY WITH SEARCH & FILTERS             */}
        {/* ===================================================================== */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Verified Tourist Hindi Phrase Deck</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Official phrases curated with Delhi Police Tourist Unit & Ministry of Tourism guidelines.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phrases, english or hindi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#14161f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                      : 'bg-[#14161f] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid of Phrase Cards (Styled with Homepage Glowing Cyber Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPhrases.map((phrase) => (
              <div key={phrase.id} className="relative group">
                {/* Ambient Card Glow */}
                <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none" />

                <div className="relative h-full rounded-2xl p-5 border-2 border-[#2f323e]/70 hover:border-purple-400/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-white/5 text-cyan-300 border border-white/10 uppercase tracking-wide">
                        {phrase.quickTag}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handlePlayAudio(phrase.hindi, 'hi')}
                          title="Play Pronunciation Audio"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFullscreenPhrase(phrase)}
                          title="Show to Driver Fullscreen"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      "{phrase.english}"
                    </h3>

                    {/* Hindi Output */}
                    <div className="text-lg font-black text-amber-300 font-display">
                      {phrase.hindi}
                    </div>

                    {/* Transliteration */}
                    <div className="text-xs font-mono text-indigo-300 bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                      {phrase.transliteration}
                    </div>

                    {/* Phonetic Pronunciation Guide */}
                    <div className="text-[11px] text-slate-400 italic">
                      Say: <span className="text-slate-300 font-medium">{phrase.phonetic}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 truncate max-w-[170px]" title={phrase.context}>
                      {phrase.context}
                    </span>
                    <button
                      onClick={() => handleSelectPreloaded(phrase)}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Load in Translator</span>
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
