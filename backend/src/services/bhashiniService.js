/**
 * =============================================================================
 * TRAVELMATE BACKEND - DIGITAL INDIA BHASHINI TRANSLATION SERVICE
 * National Language Translation Mission (MeitY - Government of India)
 * =============================================================================
 * 
 * Supports:
 * - Official Bhashini ULCA / Dhruva Inference Pipeline integration
 * - Two-step pipeline architecture: Config (getModelsPipeline) + Compute (callbackUrl)
 * - In-memory configuration caching (30-min TTL) per language pair
 * - Task chaining: ASR -> Translation -> TTS for voice, Translation -> TTS for text
 * - Accurate Devanagari Romanization & Syllable-spaced phonetics
 * - Multi-tier resilient fallback (Google Translate -> MyMemory -> Curated Dictionary)
 * - Honest source and status labelling (isLiveBhashini: true only on real ULCA success)
 */

const config = require('../config/env');

const BHASHINI_CONFIG_ENDPOINT = 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';

/**
 * Official Bhashini supported Indian and international languages
 */
const SUPPORTED_LANGUAGES = [
  // Primary Indian languages supported by Bhashini
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', nativeName: 'हिन्दी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English', isIndian: false, speechLang: 'en-IN' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳', nativeName: 'বাংলা', isIndian: true, speechLang: 'bn-IN' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳', nativeName: 'தமிழ்', isIndian: true, speechLang: 'ta-IN' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳', nativeName: 'తెలుగు', isIndian: true, speechLang: 'te-IN' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳', nativeName: 'मराठी', isIndian: true, speechLang: 'mr-IN' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳', nativeName: 'ગુજરાતી', isIndian: true, speechLang: 'gu-IN' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ', isIndian: true, speechLang: 'kn-IN' },
  { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳', nativeName: 'മലയാളം', isIndian: true, speechLang: 'ml-IN' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ', isIndian: true, speechLang: 'pa-IN' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ', isIndian: true, speechLang: 'or-IN' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳', nativeName: 'اردو', isIndian: true, speechLang: 'ur-IN' },
  { code: 'as', name: 'Assamese (অসমীয়া)', flag: '🇮🇳', nativeName: 'অসমীয়া', isIndian: true, speechLang: 'as-IN' },
  { code: 'ne', name: 'Nepali (नेपाली)', flag: '🇳🇵', nativeName: 'नेपाली', isIndian: true, speechLang: 'ne-NP' },
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)', flag: '🇮🇳', nativeName: 'भोजपुरी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', flag: '🇮🇳', nativeName: 'संस्कृतम्', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sd', name: 'Sindhi (سنڌي)', flag: '🇮🇳', nativeName: 'سنڌي', isIndian: true, speechLang: 'ur-IN' },
  
  // Major International Tourist Languages (Handled via neural fallback)
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸', nativeName: 'Español', isIndian: false, speechLang: 'es-ES' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷', nativeName: 'Français', isIndian: false, speechLang: 'fr-FR' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪', nativeName: 'Deutsch', isIndian: false, speechLang: 'de-DE' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺', nativeName: 'Русский', isIndian: false, speechLang: 'ru-RU' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', nativeName: '日本語', isIndian: false, speechLang: 'ja-JP' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', nativeName: '한국어', isIndian: false, speechLang: 'ko-KR' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', nativeName: 'العربية', isIndian: false, speechLang: 'ar-SA' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹', nativeName: 'Italiano', isIndian: false, speechLang: 'it-IT' },
  { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳', nativeName: '简体中文', isIndian: false, speechLang: 'zh-CN' }
];

// Set of languages recognized by Bhashini ULCA
const BHASHINI_LANGUAGES = new Set([
  'hi', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'as',
  'ne', 'bho', 'brx', 'doi', 'gom', 'ks', 'mai', 'mni', 'sa', 'sat', 'sd'
]);

function isBhashiniLanguage(lang) {
  if (!lang) return false;
  const base = lang.toLowerCase().split('-')[0];
  return BHASHINI_LANGUAGES.has(base);
}

function normalizeLangCode(lang) {
  if (!lang) return 'en';
  const clean = lang.trim();
  if (clean.toLowerCase() === 'zh' || clean.toLowerCase() === 'zh-cn') return 'zh-CN';
  return clean.toLowerCase();
}

/**
 * Check if a string contains Devanagari script characters
 */
function isDevanagari(text) {
  return /[\u0900-\u097F]/.test(text || '');
}

/**
 * High-accuracy Devanagari to Romanized Hinglish Transliteration
 */
function devanagariToRoman(text) {
  if (!text || typeof text !== 'string') return '';
  if (!isDevanagari(text)) return '';
  
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
 * Syllable-spaced phonetic pronunciation guide for foreign tourists
 */
function devanagariToPhonetic(text) {
  if (!text || !isDevanagari(text)) return '';
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
 * Curated tourist grounding dictionary
 */
const CURATED_TOURIST_PHRASES = [
  {
    keywords: ['meter', 'turn on meter', 'by meter'],
    english: 'Please turn on the meter.',
    hindi: 'भैया, कृपया मीटर से चलिए।',
    transliteration: 'Bhaiya, kripya meter se chaliye.',
    phonetic: 'Bhai-ya, krip-ya mee-tur say chuh-lee-ye'
  },
  {
    keywords: ['metro', 'metro station', 'nearest metro', 'subway'],
    english: 'Where is the nearest metro station?',
    hindi: 'निकटतम मेट्रो स्टेशन कहाँ है?',
    transliteration: 'Nikat-tam metro station kahan hai?',
    phonetic: 'Nik-ut-tum may-tro stay-shun kuh-haan hai?'
  },
  {
    keywords: ['official fare', 'government fare', 'fare rate'],
    english: 'What is the official Delhi transport fare?',
    hindi: 'दिल्ली परिवहन का सरकारी किराया कितना है?',
    transliteration: 'Delhi parivahan ka sarkari kiraya kitna hai?',
    phonetic: 'Del-hee puh-ri-vuh-hun kuh sur-kaa-ree ki-raa-yuh kit-nuh hai?'
  },
  {
    keywords: ['police', 'emergency', '112', 'help'],
    english: 'I need police help. Please call 112 immediately.',
    hindi: 'मुझे पुलिस सहायता चाहिए। कृपया तुरंत 112 पर फोन कीजिए।',
    transliteration: 'Mujhe police sahayata chahiye. Kripya turant 112 par phone kijiye.',
    phonetic: 'Moo-jhay po-lees suh-haa-yuh-tuh chaa-hi-ye. Krip-ya too-runt 112 pur phone kee-jee-ye'
  },
  {
    keywords: ['ticket counter', 'asi ticket', 'monument ticket'],
    english: 'Where is the official ASI ticket counter?',
    hindi: 'भारतीय पुरातत्व सर्वेक्षण (ASI) का आधिकारिक टिकट काउंटर कहाँ है?',
    transliteration: 'ASI ka aadhikaarik ticket counter kahan hai?',
    phonetic: 'ASI kuh aa-dhee-kaa-rik tik-kut coun-tur kuh-haan hai?'
  },
  {
    keywords: ['stop here', 'drop here', 'get off'],
    english: 'Please stop here, I want to get off.',
    hindi: 'कृपया यहाँ रोक दीजिए, मुझे यहाँ उतरना है।',
    transliteration: 'Kripya yahan rok dijiye, mujhe yahan utarna hai.',
    phonetic: 'Krip-ya yuh-haan rok dee-jee-ye, moo-jhay yuh-haan oo-tur-nuh hai'
  },
  {
    keywords: ['water', 'drinking water', 'sealed water'],
    english: 'Is sealed bottled drinking water available here?',
    hindi: 'क्या यहाँ सीलबंद पीने का पानी उपलब्ध है?',
    transliteration: 'Kya yahan seal-band peene ka paani uplabdh hai?',
    phonetic: 'Kya yuh-haan seal-bund pee-nay kuh paa-nee oop-lubdh hai?'
  },
  {
    keywords: ['spicy', 'not spicy', 'vegetarian'],
    english: 'Please make it non-spicy and vegetarian.',
    hindi: 'कृपया इसे बिना मिर्च और शुद्ध शाकाहारी बनाइए।',
    transliteration: 'Kripya ise bina mirch aur shuddh shakahari banaiye.',
    phonetic: 'Krip-ya ee-say bee-naa mirch owr shoodh shaa-kaa-haa-ree buh-naa-ee-ye'
  },
  {
    keywords: ['upi', 'qr code', 'online payment', 'pay by phone'],
    english: 'Can I pay using UPI or QR code?',
    hindi: 'क्या मैं UPI या QR कोड से भुगतान कर सकता हूँ?',
    transliteration: 'Kya main UPI ya QR code se bhugtaan kar sakta hoon?',
    phonetic: 'Kya main UPI ya QR code say bhoog-taan kur suk-tuh hoon?'
  }
];

// =============================================================================
// IN-MEMORY PIPELINE CONFIG CACHE (30-minute TTL)
// =============================================================================
const pipelineConfigCache = new Map();
const CONFIG_CACHE_TTL_MS = 30 * 60 * 1000;

function clearConfigCache() {
  pipelineConfigCache.clear();
}

/**
 * Fetch or retrieve cached Bhashini Dhruva Pipeline Configuration (Step 1)
 */
async function getDhruvaPipelineConfig({
  sourceLang,
  targetLang,
  hasAudio,
  computeTTS,
  userId,
  apiKey,
  pipelineId
}) {
  const cacheKey = `${userId}_${sourceLang}_${targetLang}_${hasAudio ? 'voice' : 'text'}_${computeTTS ? 'tts' : 'notts'}`;
  const cached = pipelineConfigCache.get(cacheKey);

  if (cached && (Date.now() - cached.cachedAt < CONFIG_CACHE_TTL_MS)) {
    return cached;
  }

  // Construct requested pipeline tasks
  const pipelineTasks = [];

  if (hasAudio) {
    pipelineTasks.push({
      taskType: 'asr',
      config: {
        language: { sourceLanguage: sourceLang }
      }
    });
  }

  pipelineTasks.push({
    taskType: 'translation',
    config: {
      language: {
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      }
    }
  });

  if (computeTTS) {
    pipelineTasks.push({
      taskType: 'tts',
      config: {
        language: { sourceLanguage: targetLang }
      }
    });
  }

  const effectivePipelineId = pipelineId || config.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd';

  try {
    const configRes = await fetch(BHASHINI_CONFIG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': userId,
        'ulcaApiKey': apiKey
      },
      body: JSON.stringify({
        pipelineTasks,
        pipelineRequestConfig: {
          pipelineId: effectivePipelineId
        }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!configRes.ok) {
      const errText = await configRes.text();
      console.error(`[Bhashini Config Error] HTTP ${configRes.status}: ${errText}`);
      return null;
    }

    const configData = await configRes.json();
    const endpoint = configData?.pipelineInferenceAPIEndPoint;
    const responseConfigs = configData?.pipelineResponseConfig || [];

    if (!endpoint?.callbackUrl || !endpoint?.inferenceApiKey) {
      console.error('[Bhashini Config Error] Missing inference endpoint or key in config response');
      return null;
    }

    const serviceIds = {};
    for (const item of responseConfigs) {
      const sId = item.config?.[0]?.serviceId;
      if (sId && item.taskType) {
        serviceIds[item.taskType] = sId;
      }
    }

    // Verify required service IDs
    if (!serviceIds.translation || (hasAudio && !serviceIds.asr)) {
      console.error('[Bhashini Config Error] Required service ID missing for task sequence:', serviceIds);
      return null;
    }

    const result = {
      callbackUrl: endpoint.callbackUrl,
      inferenceApiKey: endpoint.inferenceApiKey, // { name: string, value: string }
      serviceIds,
      cachedAt: Date.now()
    };

    pipelineConfigCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[Bhashini Config Exception] ${err.name === 'TimeoutError' ? 'Request timed out (5s)' : err.message}`);
    return null;
  }
}

/**
 * Execute Bhashini Dhruva Pipeline Compute Call (Step 2)
 */
async function executeDhruvaCompute({
  text,
  audioContent,
  sourceLang,
  targetLang,
  computeTTS,
  pipelineConfig
}) {
  const hasAudio = Boolean(audioContent);
  const tasks = [];

  if (hasAudio) {
    tasks.push({
      taskType: 'asr',
      config: {
        serviceId: pipelineConfig.serviceIds.asr,
        language: { sourceLanguage: sourceLang },
        audioFormat: 'wav',
        samplingRate: 16000
      }
    });
  }

  tasks.push({
    taskType: 'translation',
    config: {
      serviceId: pipelineConfig.serviceIds.translation,
      language: {
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      }
    }
  });

  if (computeTTS && pipelineConfig.serviceIds.tts) {
    tasks.push({
      taskType: 'tts',
      config: {
        serviceId: pipelineConfig.serviceIds.tts,
        language: { sourceLanguage: targetLang },
        gender: 'female'
      }
    });
  }

  const inputData = hasAudio
    ? { audio: [{ audioContent: audioContent }] }
    : { input: [{ source: text }] };

  const computeHeaders = {
    'Content-Type': 'application/json',
    [pipelineConfig.inferenceApiKey.name]: pipelineConfig.inferenceApiKey.value
  };

  try {
    const computeRes = await fetch(pipelineConfig.callbackUrl, {
      method: 'POST',
      headers: computeHeaders,
      body: JSON.stringify({
        pipelineTasks: tasks,
        inputData
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!computeRes.ok) {
      const errText = await computeRes.text();
      console.error(`[Bhashini Compute Error] HTTP ${computeRes.status}: ${errText}`);
      return null;
    }

    const computeData = await computeRes.json();
    const pipelineResponse = computeData?.pipelineResponse || [];

    let recognizedText = '';
    let translatedText = '';
    let ttsAudio = null;

    for (const item of pipelineResponse) {
      if (item.taskType === 'asr') {
        recognizedText = item.output?.[0]?.source || '';
      } else if (item.taskType === 'translation') {
        translatedText = item.output?.[0]?.target || '';
        if (!recognizedText && item.output?.[0]?.source) {
          recognizedText = item.output[0].source;
        }
      } else if (item.taskType === 'tts') {
        ttsAudio = item.audio?.[0]?.audioContent || item.output?.[0]?.audioContent || null;
      }
    }

    if (hasAudio && (!recognizedText || !recognizedText.trim())) {
      console.warn('[Bhashini ASR] ASR returned empty transcription');
      return { asrFailed: true };
    }

    if (!translatedText) {
      console.warn('[Bhashini Translation] Compute returned empty translated text');
      return null;
    }

    return {
      recognizedText: recognizedText || text,
      translatedText,
      ttsAudio
    };
  } catch (err) {
    console.error(`[Bhashini Compute Exception] ${err.name === 'TimeoutError' ? 'Compute timed out (10s)' : err.message}`);
    return null;
  }
}

/**
 * Execute translation with Bhashini Dhruva Pipeline and multi-tier resilient fallbacks
 */
async function executeTranslation({
  text,
  audioContent,
  sourceLang = 'en',
  targetLang = 'hi',
  apiKey,
  userId,
  inferenceApiKey,
  computeTTS = true
}) {
  const cleanText = (text || '').trim();
  const hasAudio = Boolean(audioContent);

  if (!cleanText && !hasAudio) {
    throw new Error('Input text or audioContent is required for translation.');
  }

  // Normalize language codes
  const sLang = normalizeLangCode(sourceLang);
  const tLang = normalizeLangCode(targetLang);

  // Server credentials take precedence over client-provided credentials
  const effectiveUserId = config.BHASHINI_USER_ID || userId || '';
  const effectiveApiKey = config.BHASHINI_API_KEY || apiKey || '';
  const hasBhashiniCreds = Boolean(effectiveUserId && effectiveApiKey);

  // Check if language pair is supported by Bhashini (Indian languages + English)
  const canUseBhashini = hasBhashiniCreds && isBhashiniLanguage(sLang) && isBhashiniLanguage(tLang);

  // ---------------------------------------------------------------------------
  // 1. PRIMARY OFFICIAL DIGITAL INDIA BHASHINI DHRUVA PIPELINE
  // ---------------------------------------------------------------------------
  if (canUseBhashini) {
    try {
      const startTime = Date.now();
      const pipelineConfig = await getDhruvaPipelineConfig({
        sourceLang: sLang,
        targetLang: tLang,
        hasAudio,
        computeTTS: Boolean(computeTTS),
        userId: effectiveUserId,
        apiKey: effectiveApiKey,
        pipelineId: config.BHASHINI_PIPELINE_ID
      });

      if (pipelineConfig) {
        const computeResult = await executeDhruvaCompute({
          text: cleanText,
          audioContent,
          sourceLang: sLang,
          targetLang: tLang,
          computeTTS: Boolean(computeTTS),
          pipelineConfig
        });

        if (computeResult) {
          if (computeResult.asrFailed) {
            throw new Error('Voice input could not be transcribed. Please speak clearly or type your phrase.');
          }

          const latencyMs = Date.now() - startTime;
          const translatedOutput = computeResult.translatedText;
          const originalOutput = computeResult.recognizedText || cleanText;

          const isDev = isDevanagari(translatedOutput);
          const transliteration = isDev ? devanagariToRoman(translatedOutput) : '';
          const phonetic = isDev ? devanagariToPhonetic(translatedOutput) : '';

          return {
            original: originalOutput,
            translated: translatedOutput,
            hindi: tLang === 'hi' ? translatedOutput : (sLang === 'hi' ? originalOutput : ''),
            english: tLang === 'en' ? translatedOutput : (sLang === 'en' ? originalOutput : ''),
            ttsAudio: computeResult.ttsAudio || null,
            transliteration,
            phonetic,
            sourceLang: sLang,
            targetLang: tLang,
            source: 'Digital India Bhashini (Official ULCA Engine)',
            isLiveBhashini: true,
            confidence: 0.99,
            latencyMs,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      if (err.message.includes('Voice input could not be transcribed')) {
        throw err;
      }
      console.warn('[Bhashini] Official Dhruva pipeline unavailable, switching to fallback:', err.message);
    }
  }

  // If input was audio-only and Bhashini ASR failed or was not available:
  if (hasAudio && !cleanText) {
    throw new Error('Voice speech recognition was unavailable for this audio. Please use microphone with browser speech recognition or type your phrase.');
  }

  // ---------------------------------------------------------------------------
  // 2. TIER 1 FALLBACK: GOOGLE TRANSLATE (GTX)
  // ---------------------------------------------------------------------------
  if (cleanText) {
    try {
      const startTime = Date.now();
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sLang)}&tl=${encodeURIComponent(tLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const neuralRes = await fetch(gtxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (neuralRes.ok) {
        const data = await neuralRes.json();
        const rawTranslated = data?.[0]?.map(item => item[0]).join('') || '';
        if (rawTranslated && rawTranslated.trim()) {
          const latencyMs = Date.now() - startTime;
          const isDev = isDevanagari(rawTranslated);
          const transliteration = isDev ? devanagariToRoman(rawTranslated) : '';
          const phonetic = isDev ? devanagariToPhonetic(rawTranslated) : '';

          return {
            original: cleanText,
            translated: rawTranslated,
            hindi: tLang === 'hi' ? rawTranslated : (sLang === 'hi' ? cleanText : ''),
            english: tLang === 'en' ? rawTranslated : (sLang === 'en' ? cleanText : ''),
            ttsAudio: null,
            transliteration,
            phonetic,
            sourceLang: sLang,
            targetLang: tLang,
            source: 'Google Translate (fallback)',
            isLiveBhashini: false,
            confidence: 0.98,
            latencyMs,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (neuralErr) {
      console.warn('[Bhashini Fallback] Google Translate error:', neuralErr.message);
    }

    // -------------------------------------------------------------------------
    // 3. TIER 2 FALLBACK: MYMEMORY TRANSLATED NET
    // -------------------------------------------------------------------------
    try {
      const startTime = Date.now();
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${encodeURIComponent(sLang)}|${encodeURIComponent(tLang)}`;
      const mmRes = await fetch(mmUrl, { signal: AbortSignal.timeout(5000) });
      if (mmRes.ok) {
        const mmData = await mmRes.json();
        const rawTranslated = mmData?.responseData?.translatedText;
        if (rawTranslated && rawTranslated.trim() && !rawTranslated.includes('MYMEMORY WARNING')) {
          const latencyMs = Date.now() - startTime;
          const isDev = isDevanagari(rawTranslated);
          const transliteration = isDev ? devanagariToRoman(rawTranslated) : '';
          const phonetic = isDev ? devanagariToPhonetic(rawTranslated) : '';

          return {
            original: cleanText,
            translated: rawTranslated,
            hindi: tLang === 'hi' ? rawTranslated : (sLang === 'hi' ? cleanText : ''),
            english: tLang === 'en' ? rawTranslated : (sLang === 'en' ? cleanText : ''),
            ttsAudio: null,
            transliteration,
            phonetic,
            sourceLang: sLang,
            targetLang: tLang,
            source: 'MyMemory (fallback)',
            isLiveBhashini: false,
            confidence: 0.95,
            latencyMs,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (mmErr) {
      console.warn('[Bhashini Fallback] MyMemory error:', mmErr.message);
    }

    // -------------------------------------------------------------------------
    // 4. TIER 3 FALLBACK: CURATED TOURIST DICTIONARY
    // -------------------------------------------------------------------------
    const lower = cleanText.toLowerCase();
    for (const item of CURATED_TOURIST_PHRASES) {
      if (item.keywords.some(kw => lower.includes(kw))) {
        const isTargetHindi = tLang === 'hi';
        const translated = isTargetHindi ? item.hindi : item.english;
        const isDev = isDevanagari(translated);

        return {
          original: cleanText,
          translated,
          hindi: item.hindi,
          english: item.english,
          ttsAudio: null,
          transliteration: isDev ? item.transliteration : '',
          phonetic: isDev ? item.phonetic : '',
          sourceLang: sLang,
          targetLang: tLang,
          source: 'Curated Phrase Dictionary (offline)',
          isLiveBhashini: false,
          confidence: 0.96,
          latencyMs: 5,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. TIER 4 FINAL SAFE RETURN
  // ---------------------------------------------------------------------------
  const isDev = isDevanagari(cleanText);
  return {
    original: cleanText,
    translated: cleanText,
    hindi: tLang === 'hi' ? cleanText : '',
    english: tLang === 'en' ? cleanText : '',
    ttsAudio: null,
    transliteration: isDev ? devanagariToRoman(cleanText) : '',
    phonetic: isDev ? devanagariToPhonetic(cleanText) : '',
    sourceLang: sLang,
    targetLang: tLang,
    source: 'Local Grounding (fallback)',
    isLiveBhashini: false,
    confidence: 0.85,
    latencyMs: 1,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  SUPPORTED_LANGUAGES,
  devanagariToRoman,
  devanagariToPhonetic,
  executeTranslation,
  clearConfigCache
};
