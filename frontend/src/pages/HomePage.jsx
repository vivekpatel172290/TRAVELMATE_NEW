import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  QrCode,
  Globe,
  MapPin,
  CalendarDays,
  Calculator,
  Navigation,
  Camera,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Bot,
  ExternalLink,
  ChevronDown,
  Layers,
  Radio,
  Zap,
  Activity,
  Award,
  Clock,
  Compass,
  FileCheck,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ShieldAlert,
  Ticket,
  Eye,
  Info,
  Users,
  Check
} from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';

// Signature Typewriter Animated Text (Exact Coder Army "Army! -> Family! -> Future!" typewriter mechanism)
function AnimatedText() {
  const words = [
    { text: 'uncertainty!', gradient: 'from-cyan-400 via-sky-300 to-indigo-400', cursorColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]' },
    { text: 'scams!', gradient: 'from-rose-400 via-pink-400 to-red-400', cursorColor: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]' },
    { text: 'overcharging!', gradient: 'from-amber-300 via-orange-400 to-yellow-400', cursorColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' },
    { text: 'unsafe detours!', gradient: 'from-purple-400 via-fuchsia-400 to-indigo-400', cursorColor: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]' },
    { text: 'counterfeits!', gradient: 'from-emerald-300 via-teal-400 to-cyan-400', cursorColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' }
  ];

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentWord = words[currentWordIdx].text;

    if (!isDeleting && currentCharIdx < currentWord.length) {
      // Type forward character-by-character (80ms per char, matching Coder Army)
      timeout = setTimeout(() => setCurrentCharIdx((prev) => prev + 1), 80);
    } else if (!isDeleting && currentCharIdx === currentWord.length) {
      // Pause at full word before backspacing (1400ms)
      timeout = setTimeout(() => setIsDeleting(true), 1400);
    } else if (isDeleting && currentCharIdx > 0) {
      // Backspace character-by-character (40ms per char, matching Coder Army)
      timeout = setTimeout(() => setCurrentCharIdx((prev) => prev - 1), 40);
    } else if (isDeleting && currentCharIdx === 0) {
      // Brief pause before typing next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
      }, 200);
    }

    return () => clearTimeout(timeout);
  }, [currentCharIdx, isDeleting, currentWordIdx, words]);

  const activeWord = words[currentWordIdx];
  const displayedText = activeWord.text.slice(0, currentCharIdx);

  return (
    <span className="inline-flex items-baseline font-black font-display text-inherit">
      <span className={`bg-gradient-to-r ${activeWord.gradient} bg-clip-text text-transparent inline-block drop-shadow-[0_0_14px_rgba(129,140,248,0.35)] tracking-tight`}>
        {displayedText}
      </span>
      <span className={`inline-block w-[2.5px] sm:w-[3px] h-[0.9em] ${activeWord.cursorColor} ml-1 rounded-sm animate-pulse align-baseline translate-y-0.5`} />
    </span>
  );
}

export default function HomePage() {
  const { traveler, journey } = useTraveler();
  const navigate = useNavigate();

  // Interactive Live Fare Quick Calculator state
  const [vehicleType, setVehicleType] = useState('auto');
  const [distanceKm, setDistanceKm] = useState(7.5);
  const [isNight, setIsNight] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Calculate official Delhi Transport fare
  const calculateQuickFare = () => {
    let base = 0;
    let baseKm = 1.5;
    let perKm = 0;

    if (vehicleType === 'auto') {
      base = 30;
      baseKm = 1.5;
      perKm = 11;
    } else if (vehicleType === 'non_ac_taxi') {
      base = 40;
      baseKm = 1.0;
      perKm = 17;
    } else {
      base = 40;
      baseKm = 1.0;
      perKm = 20;
    }

    const dist = Math.max(0, Number(distanceKm) || 0);
    const extraDist = Math.max(0, dist - baseKm);
    let total = base + extraDist * perKm;

    if (isNight) {
      total *= 1.25;
    }

    return Math.round(total);
  };

  // 1. Scroll-driven tilt-to-flat 3D animation (Coder Army signature scroll effect)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute 3D perspective to flat transformation as user scrolls
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 320));
  const rotateX = (1 - scrollProgress) * 16; // 16deg tilted back -> 0deg completely flat
  const scale = 0.94 + scrollProgress * 0.06; // 0.94 -> 1.0 full size
  const translateY = (1 - scrollProgress) * -10; // subtle elevation lift

  // 2. Verified Places purely for the upward scrolling stream (image + few essential info)
  const scrollingPlaces = [
    {
      id: 'pl-red-fort-01',
      name: 'Red Fort (Lal Qila)',
      category: 'UNESCO World Heritage',
      image: '/places/red-fort.jpg',
      imagePos: 'object-center',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '09:30 AM - 04:30 PM (Mon Closed)',
      crowd: 'High'
    },
    {
      id: 'pl-qutub-minar-02',
      name: 'Qutub Minar Complex',
      category: 'UNESCO World Heritage',
      image: '/places/qutub-minar.jpg',
      imagePos: 'object-[center_25%]',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '07:00 AM - 08:00 PM (Daily)',
      crowd: 'Medium'
    },
    {
      id: 'pl-humayuns-tomb-03',
      name: 'Humayun’s Tomb',
      category: 'Mughal Architecture',
      image: '/places/humayuns-tomb.jpg',
      imagePos: 'object-center',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '06:00 AM - 06:00 PM (Daily)',
      crowd: 'Low'
    },
    {
      id: 'pl-india-gate-04',
      name: 'India Gate & Kartavya Path',
      category: 'National Memorial',
      image: '/places/india-gate.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      timings: 'Open 24/7 (Patrolled High-Safety)',
      crowd: 'High'
    },
    {
      id: 'pl-lotus-temple-05',
      name: 'Lotus Temple (Bahá\'í House)',
      category: 'Modern Architectural Wonder',
      image: '/places/lotus-temple.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      timings: '09:00 AM - 05:30 PM (Mon Closed)',
      crowd: 'Medium'
    },
    {
      id: 'pl-akshardham-06',
      name: 'Swaminarayan Akshardham',
      category: 'Cultural Landmark Complex',
      image: '/places/swaminarayan-akshardham.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      timings: '09:30 AM - 06:30 PM (Mon Closed)',
      crowd: 'High'
    },
    {
      id: 'pl-jama-masjid-07',
      name: 'Jama Masjid Delhi',
      category: 'Historic Mughal Mosque',
      image: '/places/jama-masjid.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      timings: '07:00 AM - 06:30 PM (Daily)',
      crowd: 'Medium'
    },
    {
      id: 'pl-bangla-sahib-08',
      name: 'Gurudwara Bangla Sahib',
      category: 'Spiritual Sanctuary & Langar',
      image: '/places/gurudwara-bangla-sahib.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      timings: 'Open 24/7 (High-Safety Lit Corridor)',
      crowd: 'High'
    }
  ];

  const sampleMonuments = [
    {
      id: 'pl-red-fort-01',
      name: 'Red Fort (Lal Qila)',
      img: '/places/red-fort.jpg',
      category: 'UNESCO Heritage Site',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '09:30 AM - 04:30 PM (Mon Closed)',
      link: '/place/pl-red-fort-01'
    },
    {
      id: 'pl-qutub-minar-02',
      name: 'Qutub Minar',
      img: '/places/qutub-minar.jpg',
      category: 'UNESCO Monument',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '07:00 AM - 08:00 PM (Daily)',
      link: '/place/pl-qutub-minar-02'
    },
    {
      id: 'pl-humayuns-tomb-03',
      name: 'Humayun’s Tomb',
      img: '/places/humayuns-tomb.jpg',
      category: 'Mughal Architecture',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      timings: '06:00 AM - 06:00 PM (Daily)',
      link: '/place/pl-humayuns-tomb-03'
    },
    {
      id: 'pl-india-gate-04',
      name: 'India Gate & Kartavya Path',
      img: '/places/india-gate.jpg',
      category: 'National Memorial',
      indianPrice: 'Free',
      foreignPrice: 'Free',
      timings: 'Open 24/7 (Well-lit beat)',
      link: '/place/pl-india-gate-04'
    }
  ];

  const faqs = [
    {
      q: 'How does TravelMate prevent ticket counterfeiting at monuments?',
      a: 'TravelMate maintains an authenticated, tamper-proof directory directly linking to official Archaeological Survey of India (ASI) booking portals (asi.payumoney.com) and displays official domestic vs foreigner rates so you never buy forged entry slips from touts.'
    },
    {
      q: 'How does the Fair Fare check work for Delhi Autos and Taxis?',
      a: 'The Fair Fare Meter uses the official Delhi Transport Department gazetted fare model (Auto: ₹30 first 1.5 km, ₹11/km thereafter; Non-AC Taxi: ₹40 first 1 km, ₹17/km thereafter; +25% night surcharge from 11 PM to 5 AM). It generates a non-accusatory dispute card you can show drivers.'
    },
    {
      q: 'What is the SafeVisit Pass and how does it protect my privacy?',
      a: 'The SafeVisit Pass generates a temporary 7-day cryptographic Journey ID (e.g. TM-DEL-2026-X89K) encoded in a QR code, allowing instant emergency contact verification without requiring or storing any sensitive personal identification documents.'
    },
    {
      q: 'What happens when I press Emergency SOS 112 or shake my phone?',
      a: 'TravelMate immediately dispatches an emergency telemetry packet containing your live GPS coordinates, active Journey ID, and nearby police beat station to Delhi Police Central Control Room (112) while providing instant 1-tap dial buttons.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[800px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1500px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-10 sm:pb-12">
        
        {/* ==================================================================== */}
        {/* 1. SIGNATURE CODER ARMY 2-COLUMN HERO (TEXT ASIDE + ANIMATION ON RIGHT) */}
        {/* ==================================================================== */}
        <section className="pt-4 sm:pt-8 pb-10 sm:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Text Aside (Coder Army Style) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-xs font-semibold text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Smart India Hackathon 2026</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-300">Delhi Tourism Safety Suite</span>
              </div>

              {/* Main Display Headline */}
              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight font-display leading-[1.12] text-white">
                Explore Delhi With{' '}
                <span className="coder-text-gradient block mt-1 sm:mt-2">
                  Unmatched Trust & Safety
                </span>
              </h1>

              {/* Typewriter Animated Tagline (Exact Coder Army Style - Single Line) */}
              <div className="flex items-baseline gap-x-2 text-base sm:text-lg lg:text-xl xl:text-[22px] font-semibold text-slate-200 py-1 whitespace-nowrap overflow-hidden">
                <span className="text-slate-100 font-bold tracking-tight shrink-0">
                  Travel is meant to create memories — not
                </span>
                <AnimatedText />
              </div>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Eliminate counterfeit monument tickets, verify official Delhi Transport fares, track police-patrolled safe corridors, and communicate effortlessly in Hindi with Bhashini AI.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/safe-pass"
                  id="hero-btn-get-pass"
                  className="coder-btn-primary text-white font-bold px-6 py-3.5 rounded-xl text-sm flex items-center space-x-2 shadow-xl shadow-indigo-600/30 transition-all group"
                >
                  <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Get Free SafeVisit Pass</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/home"
                  id="hero-btn-explore-places"
                  className="coder-btn-secondary text-slate-200 font-semibold px-5 py-3.5 rounded-xl text-sm flex items-center space-x-2 transition-all hover:text-white"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Explore Verified Places</span>
                </Link>

                <Link
                  to="/phrase-helper"
                  id="hero-btn-phrase-converter"
                  className="coder-btn-secondary text-slate-200 font-semibold px-5 py-3.5 rounded-xl text-sm flex items-center space-x-2 transition-all hover:text-white"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Hindi Translator</span>
                </Link>
              </div>

              {/* Live Trust Badges Strip */}
              <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">ASI Ticketing Auth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-medium">Delhi Police 112 Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Animation Part on Right Side (Upward Scrolling Stream in 3D Glowing Window) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Ambient Multi-Color Glow Backdrop (signature Coder Army glow) */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-[36px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-30 blur-3xl animate-pulse pointer-events-none" />

              {/* Outer Hardware-Style Shell with Coder Army 3D Scroll-to-Flat Tilt Effect */}
              <div
                className="relative rounded-[24px] sm:rounded-[30px] p-2 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden will-change-transform"
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                
                {/* Window Chrome Header Bar: Mac Dots + Address + Live Badge (NO play/pause button) */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d0f14]/95 border-b border-white/[0.07] rounded-t-[18px] sm:rounded-t-[22px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444] shadow-sm shadow-red-500/40" />
                    <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-sm shadow-amber-500/40" />
                    <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-sm shadow-emerald-500/40" />
                    
                    {/* URL Pill */}
                    <div className="flex items-center space-x-1.5 bg-black/60 border border-white/[0.08] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-300 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-slate-400">travelmate.gov.in/</span>
                      <span className="text-cyan-300 font-semibold">verified-feed</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE FEED</span>
                  </div>
                </div>

                {/* Inner Canvas: Upward Scrolling Stream with Top & Bottom Fade Masks */}
                <div className="relative bg-[#0b0d12] p-3 sm:p-4 rounded-b-[18px] sm:rounded-b-[22px] h-[460px] sm:h-[500px] overflow-hidden">
                  
                  {/* Top & Bottom Gradient Fade Masks */}
                  <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#0b0d12] via-[#0b0d12]/80 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/80 to-transparent z-10 pointer-events-none" />

                  {/* Upward Scrolling Stream: Verified Places Only (Image & Few Essential Info) */}
                  <div className="animate-scroll-up space-y-3.5">
                    {[...scrollingPlaces, ...scrollingPlaces].map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        onClick={() => navigate(`/place/${item.id}`)}
                        className="bg-[#121622]/90 border border-white/[0.08] hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-md cursor-pointer transition-all hover:scale-[1.01] hover:bg-[#161b2a] group flex items-center gap-3.5 p-3"
                      >
                        <div className="relative w-24 sm:w-28 h-20 sm:h-22 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-full object-cover ${item.imagePos || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                            ASI
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shrink-0">
                              Verified
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-cyan-300 transition-colors">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-300 mt-1 font-mono">
                            <span className="text-white font-bold">{item.indianPrice} / {item.foreignPrice}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-[11px] text-slate-400 truncate">{item.timings.split('(')[0]}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.crowd === 'High' ? 'bg-amber-400' : item.crowd === 'Medium' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                              <span>Crowd: {item.crowd}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. METRICS / STATS COUNTER STRIP */}
        {/* ==================================================================== */}
        <section className="my-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="coder-card rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 mb-1">
                10+
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                Verified Heritage Sites
              </div>
              <p className="text-[11px] text-slate-400">
                100% ASI authenticated ticketing URLs
              </p>
            </div>

            <div className="coder-card rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-1">
                ₹0
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                Counterfeit Loss Guarantee
              </div>
              <p className="text-[11px] text-slate-400">
                Official price breakdown protection
              </p>
            </div>

            <div className="coder-card rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-1">
                24/7
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                Police Beat Corridors
              </div>
              <p className="text-[11px] text-slate-400">
                Delhi Police PCR coverage overlay
              </p>
            </div>

            <div className="coder-card rounded-2xl p-5 text-center relative overflow-hidden">
              <div className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-400 mb-1">
                112 & 1363
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                Emergency Integration
              </div>
              <p className="text-[11px] text-slate-400">
                1-tap & shake SOS gesture dispatch
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. INTERACTIVE BENTO GRID FEATURES */}
        {/* ==================================================================== */}
        <section className="my-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 font-display">
              Comprehensive Protection Matrix
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-1.5">
              Built Specifically for Delhi Travelers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every feature solves a real, documented challenge tourists encounter in the capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: SafeVisit Pass */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-indigo-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-indigo-300 transition-colors">
                    SafeVisit Pass
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Instant QR Pass
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  Generates a verified 7-day cryptographic QR identity for safety check-ins and emergency contact throughout your Delhi trip.
                </p>
              </div>
              <Link
                to="/safe-pass"
                className="inline-flex items-center text-sm font-bold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-1 transition-all pt-2 border-t border-white/[0.06]"
              >
                <span>Generate Pass</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature 2: Phrase Converter */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-purple-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-purple-300 transition-colors">
                    Phrase Converter
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    Bhashini AI
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  Translates crucial travel phrases, bargaining queries, and safety inquiries into Hindi text with clear phonetic pronunciation audio.
                </p>
              </div>
              <Link
                to="/phrase-helper"
                className="inline-flex items-center text-sm font-bold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-all pt-2 border-t border-white/[0.06]"
              >
                <span>Open Phrase Converter</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature 3: Fair Fare Meter */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-cyan-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Calculator className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-cyan-300 transition-colors">
                    Fair Fare Meter
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    Delhi Govt Rate
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  Computes exact gazetted tariffs for Delhi Autos and Taxis with automatic +25% night surcharge detection to prevent meter rigging.
                </p>
              </div>
              <Link
                to="/fare-meter"
                className="inline-flex items-center text-sm font-bold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-all pt-2 border-t border-white/[0.06]"
              >
                <span>Calculate Fair Fare</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature 4: Safe Track */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-emerald-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Navigation className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-emerald-300 transition-colors">
                    Safe Track & Corridors
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Live GPS
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  Multi-route safety scoring with continuous deviation monitor. Dispatches a soft check prompt if a vehicle veers &gt;500m off course.
                </p>
              </div>
              <Link
                to="/safe-journey"
                className="inline-flex items-center text-sm font-bold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-all pt-2 border-t border-white/[0.06]"
              >
                <span>Track Journey</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature 5: RideSafe Evidence Vault */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-amber-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-amber-300 transition-colors">
                    RideSafe Evidence Vault
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    OCR Plate Reader
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  Snap a quick photo before boarding. Python OCR reads the vehicle plate and secures timestamped evidence locally for your peace of mind.
                </p>
              </div>
              <Link
                to="/vault"
                className="inline-flex items-center text-sm font-bold text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition-all pt-2 border-t border-white/[0.06]"
              >
                <span>Open Evidence Vault</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature 6: Claude AI Assistant */}
            <div className="relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 border-2 border-[#2f323e]/70 hover:border-rose-500/60 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1">
              <div>
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight group-hover:text-rose-300 transition-colors">
                    Ask Claude AI
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                    Zero-Hallucination
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed mb-5">
                  AI decision-support grounded strictly in verified Delhi monuments, police emergency protocols, and current advisories.
                </p>
              </div>
              <button
                onClick={() => {
                  const chatBtn = document.getElementById('btn-floating-claude-chat');
                  if (chatBtn) chatBtn.click();
                }}
                className="inline-flex items-center text-sm font-bold text-rose-400 hover:text-rose-300 group-hover:translate-x-1 transition-all text-left pt-2 border-t border-white/[0.06]"
              >
                <span>Launch Claude Chat</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* ==================================================================== */}
        {/* ==================================================================== */}
        {/* 5. INTERACTIVE LIVE FARE CALCULATOR WIDGET (COMPACT & SLEEK) */}
        {/* ==================================================================== */}
        <section className="my-10 sm:my-12 max-w-4xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-xl overflow-hidden group">
            {/* Subtle Cyan Glow Accent */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Compact & Direct */}
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      Live Delhi Fare Checker
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                      Official Gazette
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Delhi Transport Department regulated rates to prevent meter tampering
                  </p>
                </div>
              </div>
              <Link
                to="/fare-meter"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all shrink-0"
              >
                <span>Full Meter</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Compact 3-Part Responsive Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-4 relative z-10">
              {/* Vehicle Type Segmented Control */}
              <div className="md:col-span-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Vehicle Type</span>
                  <span className="text-cyan-400 font-mono text-[10px]">
                    {vehicleType === 'auto' ? '₹11/km' : vehicleType === 'non_ac_taxi' ? '₹17/km' : '₹20/km'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.08]">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'non_ac_taxi', label: 'Taxi' },
                    { id: 'ac_taxi', label: 'AC Taxi' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVehicleType(v.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                        vehicleType === v.id
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Slider & Night Checkbox */}
              <div className="md:col-span-5 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Distance</span>
                  <span className="text-cyan-300 font-bold font-mono text-sm">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[10px] text-slate-500">1 km – 40 km</span>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNight}
                      onChange={(e) => setIsNight(e.target.checked)}
                      className="accent-cyan-400 w-3.5 h-3.5 cursor-pointer rounded"
                    />
                    <span className={isNight ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                      Night Surcharge (+25%)
                    </span>
                  </label>
                </div>
              </div>

              {/* Calculated Rate Box */}
              <div className="md:col-span-3 bg-[#0d1017] p-3 rounded-2xl border border-cyan-500/30 text-center flex flex-col justify-center items-center shadow-lg">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  OFFICIAL FARE
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 my-0.5 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                  ₹{calculateQuickFare()}
                </span>
                <Link
                  to="/fare-meter"
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1 transition-colors"
                >
                  <span>Dispute Card</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. VERIFIED MONUMENTS PREVIEW */}
        {/* ==================================================================== */}
        <section className="my-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-display">
                ASI Verified Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
                Authentic Delhi Heritage Sites
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Avoid touts selling duplicate ₹500 paper tickets. Verify authentic entrance fees.
              </p>
            </div>
            <Link
              to="/home"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 shrink-0"
            >
              <span>View All 10 Authenticated Places</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sampleMonuments.map((m) => (
              <div
                key={m.name}
                onClick={() => navigate(m.link)}
                className="coder-card rounded-2xl overflow-hidden group flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] transition-all duration-300"
              >
                {/* Uniform Even-Sized Photo Container */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-[#090b10] border-b border-white/[0.08]">
                  <img
                    src={m.img}
                    alt={m.name}
                    className={`w-full h-full object-cover ${
                      m.id === 'pl-qutub-minar-02' ? 'object-[center_25%]' : 'object-center'
                    } group-hover:scale-105 transition-transform duration-500`}
                    onError={(e) => {
                      e.currentTarget.src = '/places/red-fort.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/20 pointer-events-none" />

                  {/* Badges */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 backdrop-blur-md text-emerald-300 border border-emerald-500/30 z-20">
                    {m.category}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 z-20">
                    ASI Verified
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm font-display mb-1 group-hover:text-indigo-300 transition-colors">
                      {m.name}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.timings}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Indian / Foreigner</span>
                      <strong className="text-white font-mono">{m.indianPrice} / {m.foreignPrice}</strong>
                    </div>
                    <span
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white text-xs font-bold transition-colors flex items-center space-x-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (LARGER TYPOGRAPHY) */}
        {/* ==================================================================== */}
        <section className="my-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 font-display">
              Tourist Trust & Anti-Scam Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              Frequently Answered Inquiries
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Clear answers to the most common questions from tourists visiting Delhi NCR.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="coder-card rounded-2xl overflow-hidden transition-all duration-200 border border-white/[0.08] hover:border-indigo-500/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors gap-4 cursor-pointer"
                >
                  <span className="leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 pt-4 text-sm sm:text-base text-slate-200 leading-relaxed border-t border-white/[0.08] bg-white/[0.02]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 8. CODER ARMY STYLE FOOTER (COMPACT & BALANCED) */}
      {/* ==================================================================== */}
      <div className="bg-[var(--surface-bg)] transition-colors duration-300 w-full" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <footer className="relative z-10 py-8 sm:py-10 px-4 sm:px-8 lg:px-[8%] border-t border-[var(--border-glass)] text-slate-300">
          {/* Coder Army Signature Top Gradient Border Strip */}
          <div className="w-full h-1 bg-gradient-to-r from-[var(--brand-primary)] via-orange-600 to-[var(--brand-secondary)] mb-8 sm:mb-9 rounded-full shadow-[0_0_12px_rgba(255,123,0,0.3)]" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pb-6 sm:pb-8">
            
            {/* Col 1: Brand & Purpose */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo.jpg"
                  alt="TravelMate Official Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/20 shadow-md shadow-cyan-500/20"
                />
                <span className="text-xl font-black tracking-tight font-display text-white">
                  TRAVEL<span className="coder-text-gradient">MATE</span>
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-sm font-normal">
                India's premier digital tourist safety ecosystem. Built to protect domestic and international visitors from ticket counterfeiting, unauthorized transport overcharging, and unsafe travel routes across Delhi NCR.
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-cyan-400 pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Smart India Hackathon 2026 Initiative</span>
              </div>
            </div>

            {/* Col 2: Verified Monuments */}
            <div>
              <h5 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider mb-3.5 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Verified Sites</span>
              </h5>
              <ul className="space-y-2.5 text-sm sm:text-[15px]">
                <li>
                  <Link to="/place/pl-red-fort-01" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Red Fort (Lal Qila)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-qutub-minar-02" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Qutub Minar Complex</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-humayuns-tomb-03" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Humayun’s Tomb</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-india-gate-04" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>India Gate Memorial</span>
                  </Link>
                </li>
                <li>
                  <Link to="/home" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center space-x-1.5 pt-1">
                    <span>View All 10 ASI Monuments →</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Tourist Safety Suite */}
            <div>
              <h5 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider mb-3.5 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Safety Suite</span>
              </h5>
              <ul className="space-y-2.5 text-sm sm:text-[15px]">
                <li>
                  <Link to="/safe-pass" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>SafeVisit Pass (Zero Storage)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/phrase-helper" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Bhashini Hindi Phrase Helper</span>
                  </Link>
                </li>
                <li>
                  <Link to="/fare-meter" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Delhi Govt Fair Fare Meter</span>
                  </Link>
                </li>
                <li>
                  <Link to="/safe-journey" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>Safe Track & Police Corridors</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vault" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>RideSafe Vehicle Evidence Vault</span>
                  </Link>
                </li>
                <li>
                  <Link to="/incident" className="text-slate-200 hover:text-cyan-300 font-medium transition-colors flex items-center space-x-2">
                    <span className="text-slate-400 font-bold">›</span>
                    <span>File Incident Report</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Emergency Helplines */}
            <div>
              <h5 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider mb-3.5 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>24/7 Helplines</span>
              </h5>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <a
                  href="tel:112"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-2.5 sm:p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-white font-sans font-semibold text-sm sm:text-[15px]">Police Central</span>
                  <span className="text-red-400 font-extrabold text-sm sm:text-base bg-red-500/20 px-2.5 py-0.5 rounded-lg border border-red-500/30">112</span>
                </a>
                <a
                  href="tel:1363"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-2.5 sm:p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-white font-sans font-semibold text-sm sm:text-[15px]">Tourist Helpline</span>
                  <span className="text-amber-400 font-extrabold text-sm sm:text-base bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">1363</span>
                </a>
                <a
                  href="tel:1091"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-2.5 sm:p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-white font-sans font-semibold text-sm sm:text-[15px]">Women Safety</span>
                  <span className="text-purple-400 font-extrabold text-sm sm:text-base bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/30">1091</span>
                </a>
                <a
                  href="https://wa.me/918750871493"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-2.5 sm:p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-white font-sans font-semibold text-sm sm:text-[15px]">Traffic WhatsApp</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm sm:text-base">8750871493</span>
                </a>
              </div>
            </div>

          </div>

          {/* Coder Army Bottom Divider & Legal Bar */}
          <hr className="border-0 border-t border-[var(--border-glass)] my-6 sm:my-7" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-300">
            <p>© 2026 TravelMate Platform • Smart India Hackathon Prototype. All rights reserved.</p>
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Delhi Police 112 & ASI Telemetry Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
  );
}
