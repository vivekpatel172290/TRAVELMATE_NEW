/**
 * =============================================================================
 * TRAVELMATE BACKEND - DIGITAL INDIA BHASHINI TRANSLATION SERVICE
 * National Language Translation Mission (MeitY - Government of India)
 * =============================================================================
 * 
 * Supports:
 * - Official Bhashini Dhruva (ULCA) 2-Step Pipeline:
 *     Step 1: getModelsPipeline (config & service discovery)
 *     Step 2: compute callback (inference for translation, ASR, TTS)
 * - Multi-task chaining:
 *     Voice: asr -> translation -> tts
 *     Text:  translation -> tts
 * - In-memory config caching per language pair (~30 min TTL)
 * - Honest labeling: isLiveBhashini: true ONLY when Bhashini succeeded
 * - Fallbacks: Google GTX -> MyMemory -> Curated tourist phrases
 * - Proper script-aware Devanagari transliteration & phonetics
 * - Diagnostic error logging (HTTP status & response body, never secrets)
 */

const config = require('../config/env');

const BHASHINI_CONFIG_URL = 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';
const DEFAULT_PIPELINE_ID = '64392f96daac500b55c543cd';

/**
 * Official Indian Languages supported by Bhashini
 */
const INDIAN_LANGUAGE_CODES = new Set([
  'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or',
  'ur', 'as', 'bho', 'brx', 'doi', 'ks', 'gom', 'mai', 'mni',
  'sa', 'sat', 'sd', 'ne', 'en'
]);

/**
 * Languages unsupported by free fallback engines (Google GTX / MyMemory)
 */
const FALLBACK_UNSUPPORTED_CODES = new Set([
  'bho', 'brx', 'doi', 'ks', 'gom', 'mai', 'mni', 'sa', 'sat', 'sd'
]);

/**
 * Combined list of supported languages
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
  { code: 'bho', name: 'Bhojpuri (भोजपुरी)', flag: '🇮🇳', nativeName: 'भोजपुरी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'brx', name: 'Bodo (बर’)', flag: '🇮🇳', nativeName: 'बर’', isIndian: true, speechLang: 'hi-IN' },
  { code: 'doi', name: 'Dogri (डोगरी)', flag: '🇮🇳', nativeName: 'डोगरी', isIndian: true, speechLang: 'hi-IN' },
  { code: 'gom', name: 'Konkani (कोंकणी)', flag: '🇮🇳', nativeName: 'कोंकणी', isIndian: true, speechLang: 'mr-IN' },
  { code: 'ks', name: 'Kashmiri (کٲشُر)', flag: '🇮🇳', nativeName: 'کٲشُر', isIndian: true, speechLang: 'ur-IN' },
  { code: 'mai', name: 'Maithili (मैथिली)', flag: '🇮🇳', nativeName: 'मैथिली', isIndian: true, speechLang: 'hi-IN' },
  { code: 'mni', name: 'Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)', flag: '🇮🇳', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', isIndian: true, speechLang: 'bn-IN' },
  { code: 'ne', name: 'Nepali (नेपाली)', flag: '🇳🇵', nativeName: 'नेपाली', isIndian: true, speechLang: 'ne-NP' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)', flag: '🇮🇳', nativeName: 'संस्कृतम्', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)', flag: '🇮🇳', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', isIndian: true, speechLang: 'hi-IN' },
  { code: 'sd', name: 'Sindhi (سنڌي)', flag: '🇮🇳', nativeName: 'سنڌي', isIndian: true, speechLang: 'ur-IN' },
  
  // Major International Tourist Languages
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸', nativeName: 'Español', isIndian: false, speechLang: 'es-ES' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷', nativeName: 'Français', isIndian: false, speechLang: 'fr-FR' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪', nativeName: 'Deutsch', isIndian: false, speechLang: 'de-DE' },
  { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺', nativeName: 'Русский', isIndian: false, speechLang: 'ru-RU' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', nativeName: '日本語', isIndian: false, speechLang: 'ja-JP' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', nativeName: '한국어', isIndian: false, speechLang: 'ko-KR' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', nativeName: 'العربية', isIndian: false, speechLang: 'ar-SA' },
  { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹', nativeName: 'Italiano', isIndian: false, speechLang: 'it-IT' },
  { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳', nativeName: '简体中文', isIndian: false, speechLang: 'zh-CN' },
  { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹', nativeName: 'Português', isIndian: false, speechLang: 'pt-PT' },
  { code: 'nl', name: 'Nederlands (Dutch)', flag: '🇳🇱', nativeName: 'Nederlands', isIndian: false, speechLang: 'nl-NL' },
  { code: 'tr', name: 'Türkçe (Turkish)', flag: '🇹🇷', nativeName: 'Türkçe', isIndian: false, speechLang: 'tr-TR' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳', nativeName: 'Tiếng Việt', isIndian: false, speechLang: 'vi-VN' },
  { code: 'th', name: 'ไทย (Thai)', flag: '🇹🇭', nativeName: 'ไทย', isIndian: false, speechLang: 'th-TH' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Bahasa Indonesia', isIndian: false, speechLang: 'id-ID' }
];

/**
 * Normalize language codes (e.g. 'zh' -> 'zh-CN')
 */
function normalizeLangCode(code) {
  if (!code) return 'en';
  const c = code.trim().toLowerCase();
  if (c === 'zh' || c === 'zh-cn') return 'zh-CN';
  if (c === 'auto') return 'en';
  return c;
}

/**
 * Check if text contains Devanagari script
 */
function hasDevanagari(text) {
  return typeof text === 'string' && /[\u0900-\u097F]/.test(text);
}

/**
 * Devanagari to Romanized Hinglish Transliteration
 * Returns empty string if text does not contain Devanagari characters.
 */
function devanagariToRoman(text) {
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
 * Syllable-spaced phonetic pronunciation guide
 * Returns empty string if romanization is not applicable.
 */
function devanagariToPhonetic(text) {
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

/**
 * In-memory cache for Bhashini pipeline config
 * Key: `${userId}:${apiKey}:${pipelineId}:${tasksKey}:${sourceLang}:${targetLang}`
 * TTL: 30 minutes
 */
const pipelineConfigCache = new Map();
const CONFIG_CACHE_TTL_MS = 30 * 60 * 1000;

function getCachedConfig(cacheKey) {
  const entry = pipelineConfigCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CONFIG_CACHE_TTL_MS) {
    pipelineConfigCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCachedConfig(cacheKey, data) {
  pipelineConfigCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Fetch and cache Bhashini Dhruva pipeline configuration
 */
async function getBhashiniPipelineConfig({ userId, apiKey, pipelineId, sourceLang, targetLang, hasAudio, computeTTS }) {
  const tasksKey = `${hasAudio ? 'asr_' : ''}translation${computeTTS ? '_tts' : ''}`;
  const cacheKey = `${userId}:${apiKey}:${pipelineId}:${tasksKey}:${sourceLang}:${targetLang}`;

  const cached = getCachedConfig(cacheKey);
  if (cached) {
    return cached;
  }

  const pipelineTasks = [];

  if (hasAudio) {
    pipelineTasks.push({
      taskType: 'asr',
      config: {
        language: {
          sourceLanguage: sourceLang
        }
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
        language: {
          sourceLanguage: targetLang
        }
      }
    });
  }

  const payload = {
    pipelineTasks,
    pipelineRequestConfig: {
      pipelineId
    }
  };

  const response = await fetch(BHASHINI_CONFIG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'userID': userId,
      'ulcaApiKey': apiKey
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read body');
    console.error(`[Bhashini Config Error] HTTP ${response.status}: ${errorBody}`);
    throw new Error(`Bhashini config call failed with status ${response.status}`);
  }

  const configData = await response.json();

  const callbackUrl = configData?.pipelineInferenceAPIEndPoint?.callbackUrl;
  const inferenceApiKey = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey;

  if (!callbackUrl || !inferenceApiKey?.name || !inferenceApiKey?.value) {
    throw new Error('Invalid pipeline config response: missing callbackUrl or inferenceApiKey');
  }

  const serviceIds = {};
  const responseConfigs = configData.pipelineResponseConfig || [];

  for (const rc of responseConfigs) {
    const taskType = rc.taskType;
    const configs = rc.config || [];

    if (taskType === 'asr') {
      const match = configs.find(c => c.language?.sourceLanguage === sourceLang) || configs[0];
      if (match) serviceIds.asr = match.serviceId;
    } else if (taskType === 'translation') {
      const match = configs.find(c => 
        c.language?.sourceLanguage === sourceLang && c.language?.targetLanguage === targetLang
      ) || configs[0];
      if (match) serviceIds.translation = match.serviceId;
    } else if (taskType === 'tts') {
      const match = configs.find(c => c.language?.sourceLanguage === targetLang) || configs[0];
      if (match) serviceIds.tts = match.serviceId;
    }
  }

  if (!serviceIds.translation) {
    throw new Error(`Bhashini config missing translation service for ${sourceLang}->${targetLang}`);
  }
  if (hasAudio && !serviceIds.asr) {
    throw new Error(`Bhashini config missing ASR service for ${sourceLang}`);
  }

  const result = {
    callbackUrl,
    inferenceApiKey,
    serviceIds
  };

  setCachedConfig(cacheKey, result);
  return result;
}

/**
 * Execute translation with Bhashini Dhruva Pipeline with resilient fallbacks
 */
async function executeTranslation({ text, audioContent, sourceLang = 'en', targetLang = 'hi', apiKey, userId, computeTTS = true }) {
  const cleanText = (text || '').trim();
  const hasAudio = Boolean(audioContent && typeof audioContent === 'string' && audioContent.trim().length > 0);

  if (!cleanText && !hasAudio) {
    throw new Error('Input text or audioContent is required for translation.');
  }

  const sL = normalizeLangCode(sourceLang);
  const tL = normalizeLangCode(targetLang);

  // Determine effective credentials (prefer backend environment, fallback to user-entered)
  const envUserId = (process.env.BHASHINI_USER_ID || '').trim();
  const envApiKey = (process.env.BHASHINI_API_KEY || '').trim();
  const effectiveUserId = envUserId || (userId || '').trim();
  const effectiveApiKey = envApiKey || (apiKey || '').trim();
  const effectivePipelineId = (process.env.BHASHINI_PIPELINE_ID || config.BHASHINI_PIPELINE_ID || DEFAULT_PIPELINE_ID).trim();

  // Bhashini handles Indian languages and English only
  const isBhashiniSupported = INDIAN_LANGUAGE_CODES.has(sL) && INDIAN_LANGUAGE_CODES.has(tL) && (sL !== 'en' || tL !== 'en');

  // ---------------------------------------------------------------------------
  // 1. OFFICIAL DIGITAL INDIA BHASHINI DHRUVA PIPELINE
  // ---------------------------------------------------------------------------
  if (effectiveUserId && effectiveApiKey && isBhashiniSupported) {
    try {
      const startTime = Date.now();

      // Step 1: Config Call
      const pipelineConfig = await getBhashiniPipelineConfig({
        userId: effectiveUserId,
        apiKey: effectiveApiKey,
        pipelineId: effectivePipelineId,
        sourceLang: sL,
        targetLang: tL,
        hasAudio,
        computeTTS: Boolean(computeTTS)
      });

      // Step 2: Compute Call
      const computeTasks = [];

      if (hasAudio) {
        computeTasks.push({
          taskType: 'asr',
          config: {
            language: { sourceLanguage: sL },
            serviceId: pipelineConfig.serviceIds.asr,
            audioFormat: 'wav',
            samplingRate: 16000
          }
        });
      }

      computeTasks.push({
        taskType: 'translation',
        config: {
          language: { sourceLanguage: sL, targetLanguage: tL },
          serviceId: pipelineConfig.serviceIds.translation
        }
      });

      if (computeTTS && pipelineConfig.serviceIds.tts) {
        computeTasks.push({
          taskType: 'tts',
          config: {
            language: { sourceLanguage: tL },
            serviceId: pipelineConfig.serviceIds.tts,
            gender: 'female'
          }
        });
      }

      const computeBody = {
        pipelineTasks: computeTasks,
        inputData: hasAudio
          ? {
              audio: [{ audioContent: audioContent.trim() }]
            }
          : {
              input: [{ source: cleanText }]
            }
      };

      const computeRes = await fetch(pipelineConfig.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [pipelineConfig.inferenceApiKey.name]: pipelineConfig.inferenceApiKey.value
        },
        body: JSON.stringify(computeBody),
        signal: AbortSignal.timeout(10000)
      });

      if (!computeRes.ok) {
        const errText = await computeRes.text().catch(() => 'Unable to read body');
        console.error(`[Bhashini Compute Error] HTTP ${computeRes.status}: ${errText}`);
        throw new Error(`Bhashini compute call failed with HTTP ${computeRes.status}`);
      }

      const computeData = await computeRes.json();
      const pipelineResponse = computeData?.pipelineResponse || [];

      // Extract results from tasks
      let asrRecognizedText = '';
      let translatedText = '';
      let ttsAudioBase64 = null;

      for (const item of pipelineResponse) {
        if (item.taskType === 'asr') {
          asrRecognizedText = item.output?.[0]?.source?.trim() || '';
        } else if (item.taskType === 'translation') {
          translatedText = item.output?.[0]?.target?.trim() || '';
          if (!asrRecognizedText && item.output?.[0]?.source) {
            asrRecognizedText = item.output[0].source.trim();
          }
        } else if (item.taskType === 'tts') {
          ttsAudioBase64 = item.audio?.[0]?.audioContent || null;
        }
      }

      if (hasAudio && !asrRecognizedText) {
        throw new Error('Bhashini ASR could not recognize any speech from the provided audio.');
      }

      if (!translatedText) {
        throw new Error('Bhashini translation returned empty output.');
      }

      const sourceSpoken = asrRecognizedText || cleanText;
      const latencyMs = Date.now() - startTime;

      // Script-aware transliteration: compute only if text has Devanagari script
      const transliteration = hasDevanagari(translatedText)
        ? devanagariToRoman(translatedText)
        : (hasDevanagari(sourceSpoken) ? devanagariToRoman(sourceSpoken) : '');

      const phonetic = hasDevanagari(translatedText)
        ? devanagariToPhonetic(translatedText)
        : (hasDevanagari(sourceSpoken) ? devanagariToPhonetic(sourceSpoken) : '');

      return {
        original: sourceSpoken,
        translated: translatedText,
        hindi: tL === 'hi' ? translatedText : (sL === 'hi' ? sourceSpoken : ''),
        english: tL === 'en' ? translatedText : (sL === 'en' ? sourceSpoken : ''),
        ttsAudio: ttsAudioBase64,
        transliteration,
        phonetic,
        sourceLang: sL,
        targetLang: tL,
        source: 'Digital India Bhashini (Official ULCA Engine)',
        isLiveBhashini: true,
        confidence: 0.99,
        latencyMs,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.warn('[Bhashini Service] Live pipeline failure, evaluating fallbacks:', err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. VOICE INPUT FALLBACK RESTRICTION
  // If voice audio was sent without text, and Bhashini was unavailable/failed,
  // do NOT return placeholder text. Return a clear error.
  // ---------------------------------------------------------------------------
  if (hasAudio && !cleanText) {
    throw new Error('Voice speech recognition requires active Bhashini API credentials. Please use typed input or browser speech recognition.');
  }

  // ---------------------------------------------------------------------------
  // 3. FALLBACK UNSUPPORTED LANGUAGE CHECK
  // Check if target or source language is completely unsupported by fallback translators
  // ---------------------------------------------------------------------------
  if (FALLBACK_UNSUPPORTED_CODES.has(sL) || FALLBACK_UNSUPPORTED_CODES.has(tL)) {
    const unsuppLang = FALLBACK_UNSUPPORTED_CODES.has(tL) ? tL : sL;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === unsuppLang);
    const langName = langObj ? langObj.name : unsuppLang;
    throw new Error(`Translation for ${langName} requires official Bhashini API credentials and is not available via fallback engines.`);
  }

  // ---------------------------------------------------------------------------
  // 4. HIGH-ACCURACY NEURAL FALLBACK 1 (Google GTX)
  // ---------------------------------------------------------------------------
  if (cleanText) {
    try {
      const startTime = Date.now();
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sL)}&tl=${encodeURIComponent(tL)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      
      const neuralRes = await fetch(gtxUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        signal: AbortSignal.timeout(4000),
      });
      
      if (neuralRes.ok) {
        const data = await neuralRes.json();
        const rawTranslated = data?.[0]?.map(item => item[0]).join('') || '';
        if (rawTranslated && rawTranslated.trim()) {
          const latencyMs = Date.now() - startTime;
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
            latencyMs,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (neuralErr) {
      console.warn('[Bhashini Fallback] Google GTX error, checking MyMemory fallback:', neuralErr.message);
    }

    // ---------------------------------------------------------------------------
    // 5. NEURAL FALLBACK 2 (MyMemory)
    // ---------------------------------------------------------------------------
    try {
      const startTime = Date.now();
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${encodeURIComponent(sL)}|${encodeURIComponent(tL)}`;
      const mmRes = await fetch(mmUrl, { signal: AbortSignal.timeout(4000) });
      
      if (mmRes.ok) {
        const mmData = await mmRes.json();
        const rawTranslated = mmData?.responseData?.translatedText;
        if (rawTranslated && rawTranslated.trim() && !rawTranslated.includes('MYMEMORY WARNING')) {
          const latencyMs = Date.now() - startTime;
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
            confidence: 0.92,
            latencyMs,
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (mmErr) {
      console.warn('[Bhashini Fallback] MyMemory error:', mmErr.message);
    }

    // ---------------------------------------------------------------------------
    // 6. CURATED TOURIST DICTIONARY GROUNDING (Offline Safe)
    // ---------------------------------------------------------------------------
    if (sL === 'en' && tL === 'hi') {
      const lower = cleanText.toLowerCase();
      for (const item of CURATED_TOURIST_PHRASES) {
        if (item.keywords.some(kw => lower.includes(kw))) {
          return {
            original: cleanText,
            translated: item.hindi,
            hindi: item.hindi,
            english: item.english,
            ttsAudio: null,
            transliteration: item.transliteration,
            phonetic: item.phonetic,
            sourceLang: sL,
            targetLang: tL,
            source: 'Curated Delhi Phrase Dictionary',
            isLiveBhashini: false,
            confidence: 0.90,
            latencyMs: 5,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  }

  throw new Error('Translation failed. Neither Bhashini nor fallback translation services were able to process this request.');
}

module.exports = {
  SUPPORTED_LANGUAGES,
  INDIAN_LANGUAGE_CODES,
  FALLBACK_UNSUPPORTED_CODES,
  hasDevanagari,
  devanagariToRoman,
  devanagariToPhonetic,
  executeTranslation,
};
