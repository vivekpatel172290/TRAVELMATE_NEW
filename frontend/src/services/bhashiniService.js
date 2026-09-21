/**
 * =============================================================================
 * TRAVELMATE FRONTEND - BHASHINI MULTILINGUAL TRANSLATION SERVICE
 * Digital India Bhashini (National Language Translation Mission - MeitY)
 * =============================================================================
 * 
 * Supports:
 * - Two-way real-time communication between Foreign Tourists and Locals
 * - Official Bhashini ULCA Inference Pipeline API via Secure Backend Proxy
 * - Speech-to-Speech audio transcription and clear audio playback
 * - 16 kHz Mono PCM16 WAV audio conversion for official Bhashini ASR
 * - Devanagari Hindi, Romanized Hinglish, and Syllable-Spaced Phonetic Guide
 * - Dynamic In-App API Key Configuration & Storage
 * - Resilient Multi-Tier Fallback (Bhashini ULCA -> Google GTX -> Curated Grounding)
 * - Honest labeling: isLiveBhashini is true ONLY when Bhashini succeeded
 */

import { API_BASE } from './api';

/**
 * Storage key for custom Bhashini API credentials entered by user
 */
const STORAGE_KEY_BHASHINI_CONFIG = 'travelmate_custom_bhashini_config';

export const BHASHINI_CONFIG = {
  get USER_ID() { return getBhashiniConfig().USER_ID; },
  get API_KEY() { return getBhashiniConfig().API_KEY; },
  get INFERENCE_API_KEY() { return getBhashiniConfig().INFERENCE_API_KEY; },
  get USE_MOCK() { return !getBhashiniConfig().API_KEY; },
};

/**
 * Retrieve current Bhashini credentials (from localStorage or environment)
 */
export function getBhashiniConfig() {
  let custom = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BHASHINI_CONFIG);
    if (saved) {
      custom = JSON.parse(saved);
    }
  } catch (_) {}

  return {
    USER_ID: custom.userId || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_USER_ID) || '',
    API_KEY: custom.apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_API_KEY) || '',
    INFERENCE_API_KEY: custom.inferenceApiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_INFERENCE_API_KEY) || '',
    isCustomKey: Boolean(custom.apiKey),
  };
}

/**
 * Save custom Bhashini credentials from user interface
 */
export function saveBhashiniConfig({ apiKey, userId, inferenceApiKey }) {
  try {
    localStorage.setItem(
      STORAGE_KEY_BHASHINI_CONFIG,
      JSON.stringify({
        apiKey: (apiKey || '').trim(),
        userId: (userId || '').trim(),
        inferenceApiKey: (inferenceApiKey || '').trim(),
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to save Bhashini config:', err);
    return false;
  }
}

/**
 * Clear custom Bhashini credentials
 */
export function clearBhashiniConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_BHASHINI_CONFIG);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Official Indian Languages supported by Bhashini (MeitY National Language Mission)
 */
export const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', isIndian: true, speechLang: 'as-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', isIndian: true, speechLang: 'bn-IN' },
  { code: 'brx', name: 'Bodo', native: 'बर’', isIndian: true, speechLang: 'hi-IN' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', isIndian: true, speechLang: 'gu-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', isIndian: true, speechLang: 'kn-IN' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', isIndian: true, speechLang: 'ur-IN' },
  { code: 'gom', name: 'Konkani', native: 'कोंकणी', isIndian: true, speechLang: 'mr-IN' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', isIndian: true, speechLang: 'hi-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', isIndian: true, speechLang: 'ml-IN' },
  { code: 'mni', name: 'Manipuri', native: 'ꯃꯤꯇꯩꯂꯣꯟ', isIndian: true, speechLang: 'bn-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', isIndian: true, speechLang: 'mr-IN' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', isIndian: true, speechLang: 'ne-NP' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', isIndian: true, speechLang: 'or-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', isIndian: true, speechLang: 'pa-IN' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', isIndian: true, speechLang: 'ur-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', isIndian: true, speechLang: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', isIndian: true, speechLang: 'te-IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', isIndian: true, speechLang: 'ur-IN' },
];

/**
 * Major International Languages for Foreign Tourists
 */
export const INTERNATIONAL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', isIndian: false, speechLang: 'en-IN' },
  { code: 'es', name: 'Spanish', native: 'Español', isIndian: false, speechLang: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', isIndian: false, speechLang: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', isIndian: false, speechLang: 'de-DE' },
  { code: 'it', name: 'Italian', native: 'Italiano', isIndian: false, speechLang: 'it-IT' },
  { code: 'pt', name: 'Portuguese', native: 'Português', isIndian: false, speechLang: 'pt-PT' },
  { code: 'ru', name: 'Russian', native: 'Русский', isIndian: false, speechLang: 'ru-RU' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', native: '中文', isIndian: false, speechLang: 'zh-CN' },
  { code: 'ja', name: 'Japanese', native: '日本語', isIndian: false, speechLang: 'ja-JP' },
  { code: 'ko', name: 'Korean', native: '한국어', isIndian: false, speechLang: 'ko-KR' },
  { code: 'ar', name: 'Arabic', native: 'العربية', isIndian: false, speechLang: 'ar-SA' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', isIndian: false, speechLang: 'nl-NL' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', isIndian: false, speechLang: 'tr-TR' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', isIndian: false, speechLang: 'vi-VN' },
  { code: 'th', name: 'Thai', native: 'ไทย', isIndian: false, speechLang: 'th-TH' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', isIndian: false, speechLang: 'id-ID' },
];

/**
 * Combined Supported Languages List
 */
export const SUPPORTED_LANGUAGES = [
  ...INDIAN_LANGUAGES,
  ...INTERNATIONAL_LANGUAGES,
];

/**
 * Languages unsupported by free fallback engines (Google GTX / MyMemory)
 */
export const FALLBACK_UNSUPPORTED_CODES = new Set([
  'bho', 'brx', 'doi', 'ks', 'gom', 'mai', 'mni', 'sa', 'sat', 'sd'
]);

/**
 * Pre-loaded example tourist survival scenarios
 */
export const PRELOADED_TOURIST_PHRASES = [
  {
    id: 'phrase-meter-01',
    english: 'Please turn on the meter.',
    hindi: 'भैया, कृपया मीटर से चलिए।',
    transliteration: 'Bhaiya, kripya meter se chaliye.',
    phonetic: 'Bhai-ya, krip-ya mee-tur say chuh-lee-ye',
    category: 'Transport & Meter',
    context: 'Show or speak to auto-rickshaw drivers at railway stations or tourist monuments.',
    quickTag: 'Meter Safe',
  },
  {
    id: 'phrase-fare-02',
    english: 'What is the official Delhi transport fare?',
    hindi: 'दिल्ली परिवहन का सरकारी किराया कितना है?',
    transliteration: 'Delhi parivahan ka sarkari kiraya kitna hai?',
    phonetic: 'Del-hee puh-ri-vuh-hun kuh sur-kaa-ree ki-raa-yuh kit-nuh hai?',
    category: 'Fair Fare & Shopping',
    context: 'Use when driver quotes arbitrary inflated lump sum rates.',
    quickTag: 'No Overcharge',
  },
  {
    id: 'phrase-metro-03',
    english: 'Where is the nearest metro station?',
    hindi: 'निकटतम मेट्रो स्टेशन कहाँ है?',
    transliteration: 'Nikat-tam metro station kahan hai?',
    phonetic: 'Nik-ut-tum may-tro stay-shun kuh-haan hai?',
    category: 'Directions & Metro',
    context: 'Ask locals or security when navigating New Delhi or Old Delhi.',
    quickTag: 'Metro Transit',
  },
  {
    id: 'phrase-help-04',
    english: 'I need police help. Please call 112 immediately.',
    hindi: 'मुझे पुलिस सहायता चाहिए। कृपया तुरंत 112 पर फोन कीजिए।',
    transliteration: 'Mujhe police sahayata chahiye. Kripya turant 112 par phone kijiye.',
    phonetic: 'Moo-jhay po-lees suh-haa-yuh-tuh chaa-hi-ye. Krip-ya too-runt 112 pur phone kee-jee-ye',
    category: 'Safety & Emergency',
    context: 'Urgent emergency callout for police officers, metro marshals, or bystanders.',
    quickTag: 'Emergency 112',
  },
  {
    id: 'phrase-ticket-05',
    english: 'Where is the official ASI ticket counter?',
    hindi: 'भारतीय पुरातत्व सर्वेक्षण (ASI) का आधिकारिक टिकट काउंटर कहाँ है?',
    transliteration: 'ASI ka aadhikaarik ticket counter kahan hai?',
    phonetic: 'ASI kuh aa-dhee-kaa-rik tik-kut coun-tur kuh-haan hai?',
    category: 'Heritage & Places',
    context: 'Prevents buying fraudulent handwritten slips from touts outside monuments.',
    quickTag: 'ASI Verified',
  },
  {
    id: 'phrase-water-08',
    english: 'Is sealed bottled drinking water available here?',
    hindi: 'क्या यहाँ सीलबंद पीने का पानी उपलब्ध है?',
    transliteration: 'Kya yahan seal-band peene ka paani uplabdh hai?',
    phonetic: 'Kya yuh-haan seal-bund pee-nay kuh paa-nee oop-lubdh hai?',
    category: 'Dining & Health',
    context: 'Essential for health and hygiene when dining out or visiting monuments.',
    quickTag: 'Clean Water',
  },
];

/**
 * Check if text contains Devanagari script
 */
export function hasDevanagari(text) {
  return typeof text === 'string' && /[\u0900-\u097F]/.test(text);
}

/**
 * Character-level Devanagari to Romanized Hinglish Transliteration Algorithm
 * Only applies when text actually contains Devanagari characters.
 */
export function devanagariToRoman(text) {
  if (!text || typeof text !== 'string' || !hasDevanagari(text)) return '';
  
  const vowels = {
    'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
    'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ॉ':'o','ऑ':'o',
    'ं':'n','ँ':'n','ः':'h'
  };
  
  const consonants = {
    'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
    'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
    'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
    'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
    'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
    'य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h',
    'क़':'q','ख़':'kh','ग़':'gh','ज़':'z','ड़':'r','ढ़':'rh','फ़':'f'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (consonants[ch]) {
      const c = consonants[ch];
      if (nextCh === '्') {
        result += c;
        i++; // skip virama
      } else if (vowels[nextCh]) {
        result += c;
      } else if (consonants[nextCh] || nextCh === ' ' || !nextCh || /[\.,\?!।\(\)]/.test(nextCh)) {
        result += (i === text.length - 1 || nextCh === ' ' || /[\.,\?!।\(\)]/.test(nextCh)) ? c : c + 'a';
      } else {
        result += c + 'a';
      }
    } else if (vowels[ch]) {
      result += vowels[ch];
    } else if (ch === '।') {
      result += '.';
    } else {
      result += ch;
    }
  }

  return result
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^\w|\.\s*\w)/g, (c) => c.toUpperCase());
}

/**
 * Syllable-spaced phonetic guide for tourists
 * Returns empty string if transliteration is not applicable.
 */
export function devanagariToPhonetic(text) {
  const roman = devanagariToRoman(text);
  if (!roman) return '';

  return roman
    .split(' ')
    .map(word => {
      if (word.length <= 3) return word;
      return word.replace(/(.{2,3})/g, '$1-').replace(/-$/, '');
    })
    .join(' ');
}

/**
 * Helper to write ASCII strings to DataView
 */
function writeAsciiString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts recorded browser audio blob (e.g. webm/ogg/mp4) to 16 kHz Mono 16-bit PCM WAV base64 string
 * Mandatory format for Bhashini ASR pipeline.
 */
export async function blobTo16kHzMonoWav(audioBlob) {
  if (!audioBlob) {
    throw new Error('Audio blob is required for WAV conversion.');
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioContextClass();
  let decodedBuffer;
  try {
    decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    try { await audioCtx.close(); } catch (_) {}
  }

  const targetSampleRate = 16000;
  const numberOfChannels = 1;
  const targetLength = Math.ceil(decodedBuffer.duration * targetSampleRate);

  const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineAudioContextClass) {
    throw new Error('OfflineAudioContext is not supported in this browser.');
  }

  const offlineCtx = new OfflineAudioContextClass(numberOfChannels, targetLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const channelData = renderedBuffer.getChannelData(0); // Float32Array

  // Create 44-byte WAV header + 16-bit PCM samples
  const wavBuffer = new ArrayBuffer(44 + channelData.length * 2);
  const view = new DataView(wavBuffer);

  // RIFF chunk descriptor
  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + channelData.length * 2, true);
  writeAsciiString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true);  // NumChannels (1 for mono)
  view.setUint32(24, targetSampleRate, true); // SampleRate (16000)
  view.setUint32(28, targetSampleRate * 2, true); // ByteRate (16000 * 2 = 32000)
  view.setUint16(32, 2, true);  // BlockAlign (1 * 2 = 2)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, channelData.length * 2, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  // Convert to base64 in safe chunks to avoid stack overflow
  const bytes = new Uint8Array(wavBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Text or Audio Translation using Secure Backend Bhashini Proxy
 */
export async function translateText({ text, audioContent, sourceLang = 'en', targetLang = 'hi', computeTTS = true }) {
  const cleanText = (text || '').trim();
  const hasAudio = Boolean(audioContent && typeof audioContent === 'string' && audioContent.trim().length > 0);

  if (!cleanText && !hasAudio) {
    throw new Error('Input text or audioContent is required for translation.');
  }

  const config = getBhashiniConfig();
  const sL = sourceLang === 'auto' ? 'en' : (sourceLang === 'zh' ? 'zh-CN' : sourceLang);
  const tL = targetLang === 'auto' ? 'hi' : (targetLang === 'zh' ? 'zh-CN' : targetLang);

  // 1. CALL SECURE BACKEND TRANSLATE PROXY (with 15s AbortController timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanText,
        audioContent: hasAudio ? audioContent.trim() : undefined,
        sourceLang: sL,
        targetLang: tL,
        apiKey: config.API_KEY,
        userId: config.USER_ID,
        computeTTS: Boolean(computeTTS),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.data) {
        const item = resData.data;
        const originalText = item.original || resData.sourceText || cleanText;
        const translatedText = item.translated || resData.translatedText;
        const ttsAudio = item.ttsAudio || resData.ttsAudio || null;

        const transliteration = item.transliteration || 
          (hasDevanagari(translatedText) ? devanagariToRoman(translatedText) : '');
        const phonetic = item.phonetic || 
          (hasDevanagari(translatedText) ? devanagariToPhonetic(translatedText) : '');

        return {
          original: originalText,
          translated: translatedText,
          hindi: tL === 'hi' ? translatedText : (sL === 'hi' ? originalText : ''),
          english: tL === 'en' ? translatedText : (sL === 'en' ? originalText : ''),
          ttsAudio,
          transliteration,
          phonetic,
          sourceLang: sL,
          targetLang: tL,
          source: item.source || 'Digital India Bhashini (Official ULCA Engine)',
          isLiveBhashini: item.isLiveBhashini === true,
          confidence: item.confidence || 0.99,
          timestamp: item.timestamp || new Date().toISOString(),
        };
      } else if (resData.error) {
        throw new Error(resData.error);
      }
    } else {
      const errJson = await response.json().catch(() => null);
      if (errJson?.error) {
        throw new Error(errJson.error);
      }
    }
  } catch (backendErr) {
    console.warn('[Bhashini Service] Backend proxy call failed:', backendErr.message);
    // If voice input failed, throw error directly so ASR failure is not swallowed
    if (hasAudio && !cleanText) {
      throw new Error(backendErr.message || 'Voice speech recognition failed.');
    }
  }

  // Check if target/source is unsupported by fallbacks
  if (FALLBACK_UNSUPPORTED_CODES.has(sL) || FALLBACK_UNSUPPORTED_CODES.has(tL)) {
    const unsupp = FALLBACK_UNSUPPORTED_CODES.has(tL) ? tL : sL;
    const matched = SUPPORTED_LANGUAGES.find(l => l.code === unsupp);
    throw new Error(`Translation for ${matched?.name || unsupp} requires Bhashini API keys and is not supported by fallback translators.`);
  }

  // 2. CLIENT-SIDE NEURAL FALLBACK (For text when backend proxy is offline)
  if (cleanText) {
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sL)}&tl=${encodeURIComponent(tL)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const neuralRes = await fetch(gtxUrl);
      if (neuralRes.ok) {
        const data = await neuralRes.json();
        const rawTranslated = data?.[0]?.map(item => item[0]).join('') || '';
        if (rawTranslated && rawTranslated.trim()) {
          const transliteration = hasDevanagari(rawTranslated)
            ? devanagariToRoman(rawTranslated)
            : (hasDevanagari(cleanText) ? devanagariToRoman(cleanText) : '');
          const phonetic = hasDevanagari(rawTranslated)
            ? devanagariToPhonetic(rawTranslated)
            : (hasDevanagari(cleanText) ? devanagariToPhonetic(cleanText) : '');

          return {
            original: cleanText,
            translated: rawTranslated,
            hindi: tL === 'hi' ? rawTranslated : (sL === 'hi' ? cleanText : ''),
            english: tL === 'en' ? rawTranslated : (sL === 'en' ? cleanText : ''),
            ttsAudio: null,
            transliteration,
            phonetic,
            sourceLang: sL,
            targetLang: tL,
            source: 'Google Translate (fallback)',
            isLiveBhashini: false,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (clientErr) {
      console.warn('[Bhashini Service] Client fallback error:', clientErr.message);
    }
  }

  // 3. CURATED GROUNDING (For standard tourist survival phrases)
  if (cleanText && sL === 'en' && tL === 'hi') {
    const preloadedMatch = PRELOADED_TOURIST_PHRASES.find(
      (p) => p.english.toLowerCase() === cleanText.toLowerCase() || p.hindi === cleanText
    );

    if (preloadedMatch) {
      return {
        original: cleanText,
        translated: tL === 'hi' ? preloadedMatch.hindi : preloadedMatch.english,
        hindi: preloadedMatch.hindi,
        english: preloadedMatch.english,
        ttsAudio: null,
        transliteration: preloadedMatch.transliteration,
        phonetic: preloadedMatch.phonetic,
        sourceLang: sL,
        targetLang: tL,
        source: 'Curated Delhi Phrase Dictionary',
        isLiveBhashini: false,
        confidence: 0.90,
        timestamp: new Date().toISOString(),
      };
    }
  }

  throw new Error('Translation failed. Neither Bhashini nor fallback engines could complete the request.');
}

/**
 * Audio Speech-to-Text & Translation (converts audio Blob to 16 kHz Mono PCM16 WAV base64)
 */
export async function translateAudio({ audioBlob, audioContent, sourceLang = 'en', targetLang = 'hi', computeTTS = true }) {
  let base64Audio = audioContent;

  if (!base64Audio) {
    if (!audioBlob) {
      throw new Error('Audio recording data is required for voice translation.');
    }
    base64Audio = await blobTo16kHzMonoWav(audioBlob);
  }

  return await translateText({
    audioContent: base64Audio,
    sourceLang,
    targetLang,
    computeTTS,
  });
}

/**
 * Verify Bhashini Key with backend
 */
export async function verifyBhashiniKey({ apiKey, userId, inferenceApiKey }) {
  try {
    const res = await fetch(`${API_BASE}/bhashini/verify-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, userId, inferenceApiKey }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Active Audio Element Reference for clean stop/playback
let activeHtmlAudio = null;

/**
 * Stop any running audio (both HTML5 Audio and Web Speech Synthesis)
 */
export function stopAudioSpeech() {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch (_) {}
    activeHtmlAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

export const stopAudio = stopAudioSpeech;

/**
 * Play Audio with priority for Bhashini native base64 WAV audio, with speech synthesis fallback
 */
export function playAudio({ text = '', lang = 'hi', ttsAudio = null, onEnded = null }) {
  stopAudioSpeech();

  // If native Bhashini base64 audio is provided, play high-definition WAV audio
  if (ttsAudio && typeof ttsAudio === 'string' && ttsAudio.trim().length > 50) {
    try {
      let mimeType = 'audio/wav';
      if (!ttsAudio.startsWith('UklGR')) {
        mimeType = 'audio/mp3';
      }
      const audioUrl = `data:${mimeType};base64,${ttsAudio.trim()}`;
      const audio = new Audio(audioUrl);
      activeHtmlAudio = audio;

      audio.onended = () => {
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        if (onEnded) onEnded();
      };

      audio.onerror = (err) => {
        console.warn('[Bhashini Audio] HTML Audio playback failed, falling back to Web Speech Synthesis:', err);
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        if (text) playAudioSpeech(text, lang, onEnded);
        else if (onEnded) onEnded();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Bhashini Audio] Play promise interrupted, falling back to Web Speech Synthesis:', err);
          if (activeHtmlAudio === audio) activeHtmlAudio = null;
          if (text) playAudioSpeech(text, lang, onEnded);
          else if (onEnded) onEnded();
        });
      }
      return;
    } catch (err) {
      console.warn('[Bhashini Audio] Base64 audio setup failed, falling back to Web Speech Synthesis:', err);
    }
  }

  // Fallback to Web Speech Synthesis
  if (text) {
    playAudioSpeech(text, lang, onEnded);
  } else if (onEnded) {
    onEnded();
  }
}

/**
 * Native Speech Audio Playback using Web Speech API
 */
export function playAudioSpeech(text, lang = 'hi', onEnded = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Bhashini Audio] Web SpeechSynthesis not available');
    if (onEnded) onEnded();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  // Set language
  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88; // Slightly slower for crisp Hindi clarity
  } else if (lang === 'en') {
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
  } else {
    const matchedLang = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    utterance.lang = matchedLang?.speechLang || lang;
  }

  // Find native voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => (lang === 'hi' && v.lang.includes('hi')) || (lang === 'en' && (v.lang.includes('en-IN') || v.name.includes('India')))
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnded) {
    utterance.onend = onEnded;
    utterance.onerror = onEnded;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speech-to-Speech translation helper
 */
export async function speechToSpeech({ text, sourceLang = 'en', targetLang = 'hi' }) {
  const result = await translateText({ text, sourceLang, targetLang, computeTTS: true });
  playAudio({ text: result.translated, lang: targetLang, ttsAudio: result.ttsAudio });
  return {
    ...result,
    audioPlayed: true,
  };
}
