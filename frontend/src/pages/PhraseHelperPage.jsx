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
  Search,
  KeyRound,
  X,
  ShieldCheck,
  Trash2,
  ExternalLink,
  BookOpen,
  Send,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import {
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  SUPPORTED_LANGUAGES,
  PRELOADED_TOURIST_PHRASES,
  getBhashiniConfig,
  saveBhashiniConfig,
  clearBhashiniConfig,
  verifyBhashiniKey,
  translateText,
  translateAudio,
  playAudio,
  stopAudio,
  playAudioSpeech,
  stopAudioSpeech,
  devanagariToRoman,
  devanagariToPhonetic,
} from '../services/bhashiniService';

export default function PhraseHelperPage() {
  const [searchParams] = useSearchParams();

  // Primary Speech & Language States
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Direct translator mic state
  const [isListeningDirect, setIsListeningDirect] = useState(false);

  // Audio Playback ID tracker
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Fullscreen Driver Card Overlay
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);

  // Curated Survival Phrases Filter & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Conversation Mode States
  const [convoMessages, setConvoMessages] = useState([
    {
      id: 'msg-0',
      speaker: 'tourist',
      original: 'Hello! Please take me to the Red Fort by meter.',
      translated: 'नमस्ते! कृपया मुझे मीटर से लाल किले ले चलिए।',
      transliteration: 'Namaste! Kripya mujhe meter se Lal Qila le chaliye.',
      phonetic: 'Nuh-mus-tay! Krip-ya moo-jhay mee-tur say Laal Kee-la lay chuh-lee-ye.',
      ttsAudio: null,
      sLang: 'en',
      tLang: 'hi',
    },
    {
      id: 'msg-1',
      speaker: 'local',
      original: 'हाँ बैठिए, मैं मीटर से चलूँगा। लाहौरी गेट पर छोड़ दूँगा।',
      translated: 'Yes please sit, I will go by meter. I will drop you at Lahori Gate.',
      transliteration: 'Haan baithiye, main meter se chaloonga. Lahori Gate par chhod doonga.',
      phonetic: 'Haa-n bai-thi-ye, mai-n mee-tar se cha-loo-nga.',
      ttsAudio: null,
      sLang: 'hi',
      tLang: 'en',
    },
  ]);

  // Push-to-talk states
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'tourist' | 'local' | null
  const [translatingSpeaker, setTranslatingSpeaker] = useState(null); // 'tourist' | 'local' | null
  const [micErrorMessage, setMicErrorMessage] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceNotice, setVoiceNotice] = useState({ tourist: null, local: null });
  const [showConvoHistory, setShowConvoHistory] = useState(true);

  // Inline text input states for two-way conversation
  const [touristInput, setTouristInput] = useState('');
  const [localInput, setLocalInput] = useState('');

  // Audio recording references (Cross-platform MediaRecorder for Brave, Chrome, Safari, Android & iOS)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeSpeakerRef = useRef(null);

  // API Key Settings Modal States
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [bhashiniConfig, setBhashiniConfig] = useState(getBhashiniConfig());
  const [modalUserId, setModalUserId] = useState(bhashiniConfig.USER_ID || '');
  const [modalApiKey, setModalApiKey] = useState(bhashiniConfig.API_KEY || '');
  const [modalInferenceKey, setModalInferenceKey] = useState(bhashiniConfig.INFERENCE_API_KEY || '');
  const [keyVerifyStatus, setKeyVerifyStatus] = useState(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  // Refresh config state
  const refreshConfigState = () => {
    const cfg = getBhashiniConfig();
    setBhashiniConfig(cfg);
    setModalUserId(cfg.USER_ID || '');
    setModalApiKey(cfg.API_KEY || '');
    setModalInferenceKey(cfg.INFERENCE_API_KEY || '');
  };

  // Cleanup on unmount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognition || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)));

    return () => {
      stopAudio();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }
      if (activeStreamRef.current) {
        try { activeStreamRef.current.getTracks().forEach((t) => t.stop()); } catch (_) {}
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  // Play audio speech with Bhashini high-definition WAV audio support
  const handlePlayAudio = (text, lang = 'hi', id = null, ttsAudio = null) => {
    if (!text && !ttsAudio) return;
    const playId = id || text;
    setPlayingAudioId(playId);
    playAudio({
      text,
      lang: lang === 'auto' ? 'hi' : lang,
      ttsAudio,
      onEnded: () => {
        setPlayingAudioId((curr) => (curr === playId ? null : curr));
      },
    });
  };

  // Direct Interactive Translate
  const handleTranslate = async (textToTranslate = inputText, src = sourceLang, tgt = targetLang) => {
    const query = (textToTranslate || '').trim();
    if (!query) return;

    stopAudio();
    setIsTranslating(true);
    try {
      const result = await translateText({
        text: query,
        sourceLang: src === 'auto' ? 'en' : src,
        targetLang: tgt === 'auto' ? 'hi' : tgt,
        computeTTS: true,
      });
      setTranslationResult(result);
      handlePlayAudio(result.translated || result.hindi, tgt === 'auto' ? 'hi' : tgt, 'direct-result', result.ttsAudio);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle Direct Speech-to-Speech in Interactive Cockpit
  const handleToggleSpeechDirect = async () => {
    setMicErrorMessage(null);
    stopAudio();

    if (isListeningDirect) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }
      setIsListeningDirect(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicErrorMessage('Audio recording is not supported in this browser. Please type below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      setIsListeningDirect(true);
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListeningDirect(false);
        stream.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;

        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        setIsTranslating(true);
        try {
          const res = await translateAudio({
            audioBlob,
            sourceLang: sourceLang === 'auto' ? 'en' : sourceLang,
            targetLang: targetLang === 'auto' ? 'hi' : targetLang,
            computeTTS: true,
          });
          setInputText(res.original);
          setTranslationResult(res);
          handlePlayAudio(res.translated, targetLang === 'auto' ? 'hi' : targetLang, 'direct-result', res.ttsAudio);
        } catch (err) {
          console.error('Direct audio translation error:', err);
        } finally {
          setIsTranslating(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.warn('Direct mic start error:', err);
      setIsListeningDirect(false);
      setMicErrorMessage('Microphone access denied. Please grant microphone permissions.');
    }
  };

  // Push-to-Talk Toggle in Live Conversation Mode (MediaRecorder + ULCA Speech Pipeline)
  const handleToggleConvoSpeaker = async (speakerType) => {
    setMicErrorMessage(null);
    stopAudio();

    // 1. IF ALREADY LISTENING: STOP RECORDING AND SEND AUDIO TO BHASHINI
    if (activeSpeaker === speakerType) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.warn('Error stopping mediaRecorder:', err);
        }
      }
      return;
    }

    // 2. CHECK BROWSER CAPABILITY
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicErrorMessage('Microphone access is not supported in this browser. Please type below.');
      return;
    }

    // 3. START RECORDING SPEECH
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      setActiveSpeaker(speakerType);
      activeSpeakerRef.current = speakerType;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setActiveSpeaker(null);
        activeSpeakerRef.current = null;
        setTranslatingSpeaker(speakerType);
        setMicErrorMessage(null);

        // Turn off microphone tracks immediately
        stream.getTracks().forEach((track) => track.stop());
        activeStreamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const sL = speakerType === 'tourist'
          ? (sourceLang === 'auto' ? 'en' : sourceLang)
          : (targetLang === 'auto' ? 'hi' : targetLang);
        const tL = speakerType === 'tourist'
          ? (targetLang === 'auto' ? 'hi' : targetLang)
          : (sourceLang === 'auto' ? 'en' : sourceLang);

        try {
          const res = await translateAudio({
            audioBlob,
            sourceLang: sL,
            targetLang: tL,
            computeTTS: true,
          });

          const newMsg = {
            id: `voice-${Date.now()}`,
            speaker: speakerType,
            original: res.original,
            translated: res.translated,
            transliteration: res.transliteration,
            phonetic: res.phonetic,
            ttsAudio: res.ttsAudio,
            sLang: sL,
            tLang: tL,
          };

          setConvoMessages((prev) => [...prev, newMsg]);

          // Automatically play translation voice so the other person hears it!
          handlePlayAudio(newMsg.translated, tL, newMsg.id, newMsg.ttsAudio);
        } catch (err) {
          console.error('[Live Conversation] Audio translation failed:', err);
          setMicErrorMessage(err.message || 'Voice translation could not be completed. You can also type below.');
        } finally {
          setTranslatingSpeaker(null);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('[Live Conversation] Mic start exception:', err);
      setActiveSpeaker(null);
      activeSpeakerRef.current = null;
      setTranslatingSpeaker(null);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser URL bar.');
      } else {
        setMicErrorMessage(`Could not start microphone: ${err.message}. You can type below.`);
      }
    }
  };

  // Tourist sends message in Live Conversation Mode
  const handleTouristSend = async (textToSend = touristInput) => {
    const text = (textToSend || '').trim();
    if (!text) return;

    stopAudio();
    setActiveSpeaker(null);
    activeSpeakerRef.current = null;
    setTranslatingSpeaker('tourist');
    setTouristInput('');
    setMicErrorMessage(null);

    const sL = sourceLang === 'auto' ? 'en' : sourceLang;
    const tL = targetLang === 'auto' ? 'hi' : targetLang;

    try {
      const res = await translateText({
        text,
        sourceLang: sL,
        targetLang: tL,
        computeTTS: true,
      });

      const newMsg = {
        id: `tourist-${Date.now()}`,
        speaker: 'tourist',
        original: text,
        translated: res.translated || res.hindi,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        ttsAudio: res.ttsAudio,
        sLang: sL,
        tLang: tL,
      };

      setConvoMessages((prev) => [...prev, newMsg]);
      handlePlayAudio(newMsg.translated, tL, newMsg.id, newMsg.ttsAudio);
    } catch (err) {
      console.error('Tourist translate error:', err);
      setMicErrorMessage('Translation error: ' + (err.message || 'Failed to translate.'));
    } finally {
      setTranslatingSpeaker(null);
    }
  };

  // Local sends message in Live Conversation Mode
  const handleLocalSend = async (textToSend = localInput) => {
    const text = (textToSend || '').trim();
    if (!text) return;

    stopAudio();
    setActiveSpeaker(null);
    activeSpeakerRef.current = null;
    setTranslatingSpeaker('local');
    setLocalInput('');
    setMicErrorMessage(null);

    const sL = targetLang === 'auto' ? 'hi' : targetLang;
    const tL = sourceLang === 'auto' ? 'en' : sourceLang;

    try {
      const res = await translateText({
        text,
        sourceLang: sL,
        targetLang: tL,
        computeTTS: true,
      });

      const newMsg = {
        id: `local-${Date.now()}`,
        speaker: 'local',
        original: text,
        translated: res.translated || res.english,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        ttsAudio: res.ttsAudio,
        sLang: sL,
        tLang: tL,
      };

      setConvoMessages((prev) => [...prev, newMsg]);
      handlePlayAudio(newMsg.translated, tL, newMsg.id, newMsg.ttsAudio);
    } catch (err) {
      console.error('Local translate error:', err);
      setMicErrorMessage('Translation error: ' + (err.message || 'Failed to translate.'));
    } finally {
      setTranslatingSpeaker(null);
    }
  };

  // Language Swap
  const handleSwapLanguages = () => {
    const tempSrc = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempSrc);
    if (translationResult?.translated) {
      setInputText(translationResult.translated);
      handleTranslate(translationResult.translated, targetLang, tempSrc);
    }
  };

  // Copy helper
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // "Use in Translator" handler from phrase cards
  const handleUseInTranslator = (phrase) => {
    setInputText(phrase.english);
    setTranslationResult({
      original: phrase.english,
      translated: phrase.hindi,
      hindi: phrase.hindi,
      english: phrase.english,
      transliteration: phrase.transliteration,
      phonetic: phrase.phonetic,
      sourceLang: 'en',
      targetLang: 'hi',
      source: 'Digital India Bhashini (Pre-loaded Official Phrase)',
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    });

    const el = document.getElementById('interactive-translator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
    setKeyVerifyStatus({ success: true, message: 'Custom credentials cleared. Reverted to system pipeline.' });
    setTimeout(() => {
      setIsKeyModalOpen(false);
      setKeyVerifyStatus(null);
    }, 1200);
  };

  // Filter Categories
  const categories = [
    { label: 'All', icon: Sparkles },
    { label: 'Transport & Meter', icon: Car },
    { label: 'Directions & Metro', icon: Compass },
    { label: 'Safety & Emergency', icon: ShieldAlert },
    { label: 'Fair Fare & Shopping', icon: ShoppingBag },
    { label: 'Heritage & Places', icon: Landmark },
    { label: 'Dining & Health', icon: Utensils },
  ];

  // Filtered & Reduced Curated Phrases (strictly top 6 essential phrases)
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
  }).slice(0, 6); // STRICTLY REDUCED QUANTITY (maximum 6 cards)

  // Track latest messages for two-column split cards
  const lastTouristMsg = [...convoMessages].reverse().find((m) => m.speaker === 'tourist');
  const lastLocalMsg = [...convoMessages].reverse().find((m) => m.speaker === 'local');

  // Resolved display names for languages
  const touristLangName = sourceLang === 'auto' ? 'English' : (SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'English');
  const localLangName = targetLang === 'auto' ? 'Hindi' : (SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || 'Local Language');

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      {/* Signature Coder Army Ambient Cyber Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-tr from-purple-600/30 via-indigo-600/25 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[1500px] -right-48 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">

        {/* ===================================================================== */}
        {/* 1. FULLSCREEN "SHOW TO DRIVER" HIGH-CONTRAST DISPLAY OVERLAY          */}
        {/* ===================================================================== */}
        {fullscreenPhrase && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <button
              onClick={() => setFullscreenPhrase(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none cursor-pointer"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-6 h-6" />
            </button>

            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs uppercase tracking-widest font-bold mb-6 animate-pulse">
              <Car className="w-4 h-4 mr-1 text-cyan-400" />
              <span>Show this screen to Auto-Rickshaw / Cab Driver</span>
            </div>

            <div className="w-full max-w-2xl bg-[#121520] border-2 border-cyan-500 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-cyan-500/20 space-y-6">
              <div className="text-4xl sm:text-6xl font-black text-amber-300 leading-tight font-display tracking-wide drop-shadow-lg">
                {fullscreenPhrase.translated || fullscreenPhrase.translatedText || fullscreenPhrase.hindi}
              </div>

              {fullscreenPhrase.transliteration && (
                <p className="text-xl sm:text-2xl font-mono text-cyan-300 bg-white/[0.04] py-3.5 px-4 rounded-2xl border border-white/10">
                  "{fullscreenPhrase.transliteration}"
                </p>
              )}

              {fullscreenPhrase.phonetic && (
                <p className="text-xs sm:text-sm text-slate-300 italic">
                  Pronunciation: <strong className="text-amber-300">{fullscreenPhrase.phonetic}</strong>
                </p>
              )}

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-slate-300">
                  Original: <strong className="text-white">{fullscreenPhrase.original || fullscreenPhrase.english || fullscreenPhrase.text}</strong>
                </span>

                <button
                  onClick={() => handlePlayAudio(fullscreenPhrase.translated || fullscreenPhrase.translatedText || fullscreenPhrase.hindi, fullscreenPhrase.targetLang || 'hi')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-black" />
                  <span>Play Loud Audio</span>
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

              {/* Step-by-Step Guide */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-cyan-300">
                  <BookOpen className="w-4 h-4" />
                  <span>How to connect your Bhashini API Key:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
                  <li>Visit official Bhashini portal at <a href="https://dhruva.bhashini.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center">dhruva.bhashini.gov.in <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a> or <a href="https://bhashini.gov.in/ulca" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center">bhashini.gov.in/ulca <ExternalLink className="w-3 h-3 ml-0.5 inline" /></a>.</li>
                  <li>Copy your <strong>API Key</strong> (and User ID if available).</li>
                  <li>Paste below and click <strong>"Verify & Connect Live API"</strong> to test live inference.</li>
                  <li>Alternatively, save to <code className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono">backend/.env</code> under <code className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 font-mono">BHASHINI_API_KEY</code>.</li>
                </ol>
              </div>

              {/* Input Form Fields */}
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Bhashini User ID <span className="text-slate-400 font-normal lowercase">(optional if not provided with key)</span>
                  </label>
                  <input
                    type="text"
                    value={modalUserId}
                    onChange={(e) => setModalUserId(e.target.value)}
                    placeholder="e.g. 7c34b1a2-90ab-4433-88bb-... (optional)"
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
                    disabled={isVerifyingKey || !modalApiKey.trim()}
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
        {/* 3. HERO HEADER BANNER (Exact layout from reference site)              */}
        {/* ===================================================================== */}
        {/* ===================================================================== */}
        {/* 3. HERO HEADER BANNER (Compact & Unified)                             */}
        {/* ===================================================================== */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] border-2 border-[#2f323e]/70 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1c2032] to-[#0a0d16] border border-cyan-500/40 p-1.5 flex items-center justify-center shadow-md shadow-cyan-500/25 shrink-0 overflow-hidden">
                <img
                  src="/bhashini-logo.png"
                  alt="Bhashini"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]"
                  onError={(e) => {
                    e.currentTarget.src = '/bhashini-logo.svg';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-white font-display tracking-tight">
                    Bhashini Translator & Multilingual Voice
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                    Digital India
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  National Language Mission by MeitY • Two-Way Speech & Real-Time Driver Translation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
              <div className="flex items-center space-x-2 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/25 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
                <span className="text-[11px] font-bold text-cyan-300">
                  {bhashiniConfig.isCustomKey ? 'Custom API Active' : 'Live ULCA Ready'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Configure Bhashini API Key"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>API Key</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. LIVE CONVERSATION STAGE (Spacious, Clean & Reference Matching)    */}
        {/* ===================================================================== */}
        <div id="live-conversation" className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#0e111a]/95 space-y-6 shadow-2xl">
          {/* Header with History Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">
                    Live Conversation Mode
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Two-Way Voice
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Tap to talk or hold to speak. The other person hears your translated voice in real-time.
                </p>
              </div>
            </div>

            {convoMessages.length > 0 && (
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowConvoHistory(!showConvoHistory)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Dialogue Stream ({convoMessages.length})</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConvoHistory ? 'rotate-180' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setConvoMessages([])}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Clear dialogue history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Dismissible Error Banner */}
          {micErrorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 text-rose-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{micErrorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setMicErrorMessage(null)}
                className="text-xs font-bold text-rose-400 hover:text-rose-200 ml-3 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Two-Column Split Stage (Comfortable Spacious Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TOURIST SIDE CARD */}
            <div className="bg-[#121522]/95 p-6 rounded-2xl border border-white/10 text-center space-y-4 shadow-xl flex flex-col justify-between min-h-[440px]">
              {/* Card Header & Language Selector */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center justify-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                  <span>Tourist Side</span>
                </h3>
                <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
                  <span className="shrink-0 font-medium">Speaks:</span>
                  <select
                    id="live-tourist-lang-select"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-400 cursor-pointer max-w-[210px] truncate"
                  >
                    <option value="auto" className="bg-[#121520] text-indigo-300 font-bold">✨ Auto Detect</option>
                    <optgroup label="International Languages" className="bg-[#121520] text-slate-400 italic">
                      {INTERNATIONAL_LANGUAGES.map((k) => (
                        <option key={k.code} value={k.code} className="bg-[#121520] text-slate-200 not-italic">
                          {k.name} {k.native && k.native !== k.name ? `• ${k.native}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Indian Languages" className="bg-[#121520] text-slate-400 italic">
                      {INDIAN_LANGUAGES.map((k) => (
                        <option key={k.code} value={k.code} className="bg-[#121520] text-slate-200 not-italic">
                          {k.name} {k.native && k.native !== k.name ? `• ${k.native}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Big Interactive Tap-to-Talk Button (exact layout & feedback from reference site) */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => handleToggleConvoSpeaker('tourist')}
                  disabled={translatingSpeaker !== null}
                  className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                    activeSpeaker === 'tourist'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/50 animate-pulse scale-110 border-2 border-white/50'
                      : translatingSpeaker === 'tourist'
                      ? 'bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/40'
                      : 'bg-indigo-500/10 text-indigo-400 border-2 border-indigo-500/30 hover:bg-indigo-500/20 hover:scale-105'
                  } ${translatingSpeaker !== null && translatingSpeaker !== 'tourist' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {translatingSpeaker === 'tourist' ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-300" />
                  ) : (
                    <Mic className={`w-8 h-8 ${activeSpeaker === 'tourist' ? 'animate-bounce text-white' : 'text-indigo-400'}`} />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {activeSpeaker === 'tourist'
                      ? 'Stop & Translate'
                      : translatingSpeaker === 'tourist'
                      ? 'Translating...'
                      : 'Tap to Talk'}
                  </span>
                </button>
              </div>

              {/* Status Message while Translating */}
              {translatingSpeaker === 'tourist' && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center text-xs text-indigo-300 animate-pulse">
                  Converting your speech to {localLangName}...
                </div>
              )}

              {/* When Tourist has a recent message */}
              {lastTouristMsg && !translatingSpeaker && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      Your Speech & {localLangName} Translation
                    </span>
                    <span className="text-[10px] text-indigo-300/70 font-mono">Ready to play</span>
                  </div>
                  <div className="text-xs text-slate-300 italic">
                    "{lastTouristMsg.original}"
                  </div>
                  <div className="text-base font-bold text-amber-300 bg-slate-950/60 p-3 rounded-xl border border-white/10 leading-snug">
                    {lastTouristMsg.translated}
                  </div>
                  {lastTouristMsg.transliteration && (
                    <div className="text-xs font-mono text-cyan-300/90 bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/5">
                      "{lastTouristMsg.transliteration}"
                    </div>
                  )}
                  {lastTouristMsg.phonetic && (
                    <div className="text-[11px] text-slate-400 italic">
                      Pronunciation: <strong className="text-amber-300 font-medium">{lastTouristMsg.phonetic}</strong>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(lastTouristMsg.translated, lastTouristMsg.tLang, lastTouristMsg.id, lastTouristMsg.ttsAudio)}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 text-white cursor-pointer ${
                      playingAudioId === lastTouristMsg.id
                        ? 'bg-amber-500 text-black animate-pulse shadow-amber-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${playingAudioId === lastTouristMsg.id ? 'animate-bounce' : ''}`} />
                    <span>{playingAudioId === lastTouristMsg.id ? 'Speaking...' : `Play Translation (${localLangName})`}</span>
                  </button>
                </div>
              )}

              {/* When Local spoke earlier and Tourist card displays what Local said */}
              {lastLocalMsg && !lastTouristMsg && !translatingSpeaker && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl text-left space-y-2">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Local Said ({touristLangName}):
                  </div>
                  <div className="text-sm font-semibold text-indigo-100 bg-slate-950/40 p-2.5 rounded-lg border border-indigo-500/20">
                    {lastLocalMsg.translated}
                  </div>
                  <div className="text-xs text-slate-400 italic">"{lastLocalMsg.original}"</div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(lastLocalMsg.translated, lastLocalMsg.tLang, lastLocalMsg.id, lastLocalMsg.ttsAudio)}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Translation</span>
                  </button>
                </div>
              )}

              {/* If no messages yet */}
              {!lastTouristMsg && !lastLocalMsg && !translatingSpeaker && (
                <div className="py-5 px-3 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-500">
                  Ready for Tourist speech ({touristLangName}) • Tap mic above or type below
                </div>
              )}

              {/* Inline Input Bar */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={touristInput}
                  onChange={(e) => setTouristInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTouristSend()}
                  placeholder="Or type what you want to say in English..."
                  className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTouristSend()}
                  disabled={!touristInput.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                  title="Translate & Speak"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* 1-Tap Quick Simulation Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Please turn on the meter.',
                  'Where is the metro station?',
                  'How much to the Red Fort?',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => handleTouristSend(txt)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 transition-colors cursor-pointer"
                  >
                    "{txt}"
                  </button>
                ))}
              </div>
            </div>

            {/* LOCAL SIDE CARD */}
            <div className="bg-[#121522]/95 p-6 rounded-2xl border border-white/10 text-center space-y-4 shadow-xl flex flex-col justify-between min-h-[440px]">
              {/* Card Header & Language Selector */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-wide flex items-center justify-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span>Local Side (Driver / Shopkeeper)</span>
                </h3>
                <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
                  <span className="shrink-0 font-medium">Speaks:</span>
                  <select
                    id="live-local-lang-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer max-w-[210px] truncate"
                  >
                    <option value="auto" className="bg-[#121520] text-emerald-300 font-bold">✨ Auto Detect</option>
                    <optgroup label="Indian Languages" className="bg-[#121520] text-slate-400 italic">
                      {INDIAN_LANGUAGES.map((k) => (
                        <option key={k.code} value={k.code} className="bg-[#121520] text-slate-200 not-italic">
                          {k.name} {k.native && k.native !== k.name ? `• ${k.native}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="International Languages" className="bg-[#121520] text-slate-400 italic">
                      {INTERNATIONAL_LANGUAGES.map((k) => (
                        <option key={k.code} value={k.code} className="bg-[#121520] text-slate-200 not-italic">
                          {k.name} {k.native && k.native !== k.name ? `• ${k.native}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Big Interactive Tap-to-Talk Button */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => handleToggleConvoSpeaker('local')}
                  disabled={translatingSpeaker !== null}
                  className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                    activeSpeaker === 'local'
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/50 animate-pulse scale-110 border-2 border-white/50'
                      : translatingSpeaker === 'local'
                      ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40'
                      : 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-105'
                  } ${translatingSpeaker !== null && translatingSpeaker !== 'local' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {translatingSpeaker === 'local' ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-300" />
                  ) : (
                    <Mic className={`w-8 h-8 ${activeSpeaker === 'local' ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {activeSpeaker === 'local'
                      ? 'Stop & Translate'
                      : translatingSpeaker === 'local'
                      ? 'Translating...'
                      : 'Tap to Talk'}
                  </span>
                </button>
              </div>

              {/* Status Message while Translating */}
              {translatingSpeaker === 'local' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center text-xs text-emerald-300 animate-pulse">
                  Converting local speech to {touristLangName}...
                </div>
              )}

              {/* When Local has a recent message */}
              {lastLocalMsg && !translatingSpeaker && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Local Speech & {touristLangName} Translation
                    </span>
                    <span className="text-[10px] text-emerald-300/70 font-mono">Ready to play</span>
                  </div>
                  <div className="text-xs text-slate-300 italic">
                    "{lastLocalMsg.original}"
                  </div>
                  <div className="text-base font-bold text-emerald-200 bg-slate-950/60 p-3 rounded-xl border border-white/10 leading-snug">
                    {lastLocalMsg.translated}
                  </div>
                  {lastLocalMsg.transliteration && (
                    <div className="text-xs font-mono text-cyan-300/90 bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/5">
                      "{lastLocalMsg.transliteration}"
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(lastLocalMsg.translated, lastLocalMsg.tLang, lastLocalMsg.id, lastLocalMsg.ttsAudio)}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 text-white cursor-pointer ${
                      playingAudioId === lastLocalMsg.id
                        ? 'bg-amber-500 text-black animate-pulse shadow-amber-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${playingAudioId === lastLocalMsg.id ? 'animate-bounce' : ''}`} />
                    <span>{playingAudioId === lastLocalMsg.id ? 'Speaking...' : `Play Translation (${touristLangName})`}</span>
                  </button>
                </div>
              )}

              {/* When Tourist spoke earlier and Local card displays what Tourist said */}
              {lastTouristMsg && !lastLocalMsg && !translatingSpeaker && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-left space-y-2">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Tourist Said ({localLangName}):
                  </div>
                  <div className="text-sm font-semibold text-emerald-100 bg-slate-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                    {lastTouristMsg.translated}
                  </div>
                  <div className="text-xs text-slate-400 italic">"{lastTouristMsg.original}"</div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(lastTouristMsg.translated, lastTouristMsg.tLang, lastTouristMsg.id, lastTouristMsg.ttsAudio)}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Translation</span>
                  </button>
                </div>
              )}

              {/* If no messages yet */}
              {!lastLocalMsg && !lastTouristMsg && !translatingSpeaker && (
                <div className="py-5 px-3 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-500">
                  चालक की आवाज़ के लिए तैयार ({localLangName}) • ऊपर माइक दबाएँ या टाइप करें
                </div>
              )}

              {/* Inline Input Bar */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLocalSend()}
                  placeholder="यहाँ स्थानीय जवाब टाइप करें (उदा. हाँ मीटर से चलूँगा)..."
                  className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleLocalSend()}
                  disabled={!localInput.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                  title="Translate & Speak"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* 1-Tap Quick Simulation Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'हाँ मीटर से चलूँगा।',
                  'लाहौरी गेट मुख्य द्वार।',
                  'सरकारी किराया ₹180 है।',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => handleLocalSend(txt)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 transition-colors cursor-pointer"
                  >
                    "{txt}"
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Real-Time Dialogue Stream / Conversation History */}
          {convoMessages.length > 0 && showConvoHistory && (
            <div className="bg-[#0b0d14] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3 max-h-72 overflow-y-auto animate-in fade-in shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Live Dialogue Stream</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {convoMessages.length} exchanges recorded
                </span>
              </div>

              {convoMessages.map((k) => (
                <div
                  key={k.id}
                  className={`flex flex-col max-w-[85%] space-y-1 ${
                    k.speaker === 'tourist' ? 'self-start items-start' : 'self-end items-end ml-auto'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${k.speaker === 'tourist' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                    <span>{k.speaker === 'tourist' ? 'Tourist' : 'Local'}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                      k.speaker === 'tourist'
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tl-sm'
                        : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm'
                    }`}
                  >
                    <div className="font-semibold text-white leading-relaxed">{k.translated}</div>
                    <div className="text-xs opacity-75 mt-1 italic text-slate-300">"{k.original}"</div>
                    {k.transliteration && (
                      <div className="text-[11px] font-mono text-cyan-300/80 mt-1">
                        "{k.transliteration}"
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(k.translated, k.tLang, k.id, k.ttsAudio)}
                      className={`mt-2 flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                        playingAudioId === k.id
                          ? 'bg-amber-500 text-black animate-pulse shadow-amber-500/30'
                          : k.speaker === 'tourist'
                          ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/30'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === k.id ? 'animate-bounce' : ''}`} />
                      <span>{playingAudioId === k.id ? 'Speaking...' : 'Listen'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* 5. INTERACTIVE TEXT & SPEECH-TO-SPEECH TRANSLATOR                     */}
        {/* ===================================================================== */}
        <div id="interactive-translator" className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#121520]/90 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  Interactive Text & Speech-to-Speech Translator
                </h2>
                <p className="text-xs text-slate-400">
                  Type or speak aloud. Voice inputs are automatically transcribed, translated, and spoken back.
                </p>
              </div>
            </div>

            {/* Language Selector Pill */}
            <div className="flex items-center space-x-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
              <select
                value={sourceLang}
                onChange={(e) => {
                  const newSrc = e.target.value;
                  setSourceLang(newSrc);
                  if (inputText.trim()) handleTranslate(inputText, newSrc, targetLang);
                }}
                className="px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 rounded-xl border border-cyan-500/20 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="auto" className="bg-[#121520] text-cyan-300 font-bold">✨ Auto Detect Language</option>
                <optgroup label="International Languages" className="bg-[#121520] text-slate-400 font-normal italic">
                  {INTERNATIONAL_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121520] text-slate-200 not-italic font-medium">
                      {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Indian Languages" className="bg-[#121520] text-slate-400 font-normal italic">
                  {INDIAN_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121520] text-slate-200 not-italic font-medium">
                      {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={handleSwapLanguages}
                title="Swap Languages"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={targetLang}
                onChange={(e) => {
                  const newTgt = e.target.value;
                  setTargetLang(newTgt);
                  if (inputText.trim()) handleTranslate(inputText, sourceLang, newTgt);
                }}
                className="px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 rounded-xl border border-indigo-500/20 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="auto" className="bg-[#121520] text-indigo-300 font-bold">✨ Auto Detect Language</option>
                <optgroup label="Indian Languages" className="bg-[#121520] text-slate-400 font-normal italic">
                  {INDIAN_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121520] text-slate-200 not-italic font-medium">
                      {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="International Languages" className="bg-[#121520] text-slate-400 font-normal italic">
                  {INTERNATIONAL_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#121520] text-slate-200 not-italic font-medium">
                      {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Two-Column Grid: Input & Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{sourceLang === 'auto' ? 'Auto Detected' : (SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'Input')} Input</span>
                <span className="text-[10px] text-slate-500 lowercase">{speechSupported ? 'mic ready' : 'speech input not supported'}</span>
              </label>

              <div className="relative">
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={sourceLang === 'en' ? "Type any tourist request e.g. 'Can you drop me at Connaught Place inner circle by meter?' or tap the microphone to speak..." : `Type or speak in ${SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || 'selected language'}...`}
                  className="w-full p-4 bg-[#0d0f15] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => { setInputText(''); setTranslationResult(null); }}
                    className="absolute top-3 right-3 text-xs text-slate-400 hover:text-white bg-[#1a1d28] px-2 py-1 rounded-md border border-white/10 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleSpeechDirect}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                    isListeningDirect
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isListeningDirect ? (
                    <>
                      <Mic className="w-4 h-4 animate-bounce" />
                      <span>Listening... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Speech-to-Speech (Speak)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTranslate(inputText, sourceLang, targetLang)}
                  disabled={isTranslating || !inputText.trim()}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Translating via Bhashini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Translate Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Column */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>{targetLang === 'auto' ? 'Auto Detected' : (SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.name || 'Output')} Translation</span>
                {translationResult && (
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {Math.round((translationResult.confidence || 0.99) * 100)}% Confidence
                  </span>
                )}
              </label>

              {translationResult ? (
                <div className="p-5 bg-[#0d0f15] border border-cyan-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wide bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{translationResult.source || 'Digital India Bhashini'}</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(translationResult.translated || translationResult.hindi)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(translationResult.translated || translationResult.hindi, targetLang, 'direct-result', translationResult.ttsAudio)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          playingAudioId === 'direct-result'
                            ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                            : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                        }`}
                        title="Play Pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullscreenPhrase(translationResult)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Show to Driver Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-display">
                    {translationResult.translated || translationResult.hindi}
                  </div>

                  {translationResult.transliteration && (
                    <div className="text-sm font-mono text-cyan-300 bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
                      "{translationResult.transliteration}"
                    </div>
                  )}

                  {translationResult.phonetic && (
                    <div className="text-xs text-slate-400 italic">
                      Say aloud: {translationResult.phonetic}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFullscreenPhrase(translationResult)}
                      className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#141722] hover:bg-[#1a1e2c] border border-white/10 text-cyan-400 hover:text-cyan-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Show Large to Driver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCopy(translationResult.translated || translationResult.hindi);
                      }}
                      className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Journey Chain (TM-DEL-2026-X89K)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                  <Globe className="w-8 h-8 text-slate-500" />
                  <div className="text-xs text-slate-400 max-w-xs">
                    Your translation and pronunciation guide will appear here. Choose a phrase above or use voice input to begin.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 6. INSTANT TOURIST PHRASES (Reduced to clean, top 6 essential cards) */}
        {/* ===================================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Essential Tourist Phrases (Top Curated)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Compact quick-access phrases for safe Delhi travel, fair auto fares, and emergency assistance.
              </p>
            </div>

            {/* Search within phrases */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#121520] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                  type="button"
                  onClick={() => setActiveCategory(cat.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-[#121520] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact 6-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="glass-card p-5 rounded-2xl border border-white/10 bg-[#121520]/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/5 text-cyan-300 border border-white/10 uppercase tracking-wide">
                      {phrase.quickTag || 'Essential'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(phrase.hindi, 'hi', phrase.id)}
                        title="Play Audio"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          playingAudioId === phrase.id
                            ? 'text-cyan-300 bg-cyan-500/20 animate-pulse'
                            : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullscreenPhrase(phrase)}
                        title="Show to Driver"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    "{phrase.english}"
                  </h3>
                  <div className="text-lg font-black text-amber-300 font-display">
                    {phrase.hindi}
                  </div>
                  <div className="text-xs font-mono text-cyan-300">
                    "{phrase.transliteration}"
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Say: {phrase.phonetic}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 truncate max-w-[170px]" title={phrase.context}>
                    {phrase.context}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUseInTranslator(phrase)}
                    className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Use in Translator</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
