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

  // Verified Places Video / Animated Walkthrough Data & State
  const walkthroughMonuments = [
    {
      id: 'pl-red-fort-01',
      name: 'Red Fort (Lal Qila)',
      hindiName: 'लाल किला',
      category: 'UNESCO World Heritage Site',
      image: '/places/red-fort.jpg',
      imagePos: 'object-center',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      saarcPrice: '₹35',
      childrenPrice: 'Free (Under 15)',
      timings: '09:30 AM - 04:30 PM',
      closedDay: 'Mondays',
      crowd: 'High',
      metro: 'Lal Quila Metro (Violet Line, Gate 4)',
      bookingUrl: 'https://asi.payumoney.com',
      scamWarning: 'Strict Advisory: Avoid unauthorized roadside touts claiming counters are closed or selling fake ₹500 paper slips. Entry is strictly by authentic ASI QR barcode.',
      highlights: ['Diwan-i-Aam & Diwan-i-Khas', 'Sound & Light Show (7:30 PM)', 'Direct ASI Cashless Gate']
    },
    {
      id: 'pl-qutub-minar-02',
      name: 'Qutub Minar Complex',
      hindiName: 'क़ुतुब मीनार',
      category: 'UNESCO World Heritage Site',
      image: '/places/qutub-minar.jpg',
      imagePos: 'object-[center_25%]',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      saarcPrice: '₹35',
      childrenPrice: 'Free (Under 15)',
      timings: '07:00 AM - 08:00 PM',
      closedDay: 'Open All 7 Days',
      crowd: 'Medium',
      metro: 'Qutub Minar Metro (Yellow Line, Gate 2)',
      bookingUrl: 'https://asi.payumoney.com',
      scamWarning: 'Strict Advisory: Private guides are not compulsory. Official ASI audio guides and digital QR ticketing are available at the entrance counter for ₹100.',
      highlights: ['73-Meter Victory Minaret', '4th Century Rustless Iron Pillar', 'Alai Darwaza & Quwwat-ul-Islam']
    },
    {
      id: 'pl-humayuns-tomb-03',
      name: 'Humayun’s Tomb',
      hindiName: 'हुमायूँ का मक़बरा',
      category: 'Mughal Architecture & Garden Tomb',
      image: '/places/humayuns-tomb.jpg',
      imagePos: 'object-center',
      indianPrice: '₹35',
      foreignPrice: '₹550',
      saarcPrice: '₹35',
      childrenPrice: 'Free (Under 15)',
      timings: '06:00 AM - 06:00 PM (Sunrise to Sunset)',
      closedDay: 'Open All 7 Days',
      crowd: 'Low',
      metro: 'JLN Stadium Metro (Violet Line)',
      bookingUrl: 'https://asi.payumoney.com',
      scamWarning: 'Strict Advisory: Ignore auto-rickshaw drivers demanding ₹300 for a 1.2 km ride from Nizamuddin. Use Delhi Govt Fair Fare meter (₹30 first 1.5 km).',
      highlights: ['Charbagh Persian Garden Style', 'Precursor to the Taj Mahal', 'Isa Khan Tomb Complex']
    },
    {
      id: 'pl-india-gate-04',
      name: 'India Gate & Kartavya Path',
      hindiName: 'इण्डिया गेट',
      category: 'National Memorial & High-Safety Corridor',
      image: '/places/india-gate.jpg',
      imagePos: 'object-center',
      indianPrice: 'Free Entry',
      foreignPrice: 'Free Entry',
      saarcPrice: 'Free Entry',
      childrenPrice: 'Free Entry',
      timings: 'Open 24/7 (Continuous Beat Patrolled)',
      closedDay: 'Open All 7 Days',
      crowd: 'High',
      metro: 'Central Secretariat Metro (Yellow/Violet Line)',
      bookingUrl: 'https://delhitourism.gov.in',
      scamWarning: 'Strict Advisory: No ticket required for India Gate or Kartavya Path. Beware of unauthorized photographers selling overpriced instant prints.',
      highlights: ['National War Memorial adjacent', 'Amar Jawan Jyoti', 'Evening laser projection shows']
    }
  ];

  const [walkthroughActiveIndex, setWalkthroughActiveIndex] = useState(0);
  const [walkthroughMode, setWalkthroughMode] = useState('list'); // 'list' | 'detail'
  const [isWalkthroughPlaying, setIsWalkthroughPlaying] = useState(true);
  const [walkthroughProgress, setWalkthroughProgress] = useState(0);

  // Auto-playing walkthrough loop simulation
  useEffect(() => {
    if (!isWalkthroughPlaying) return;

    const duration = walkthroughMode === 'list' ? 4000 : 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setWalkthroughProgress(Math.min(100, Math.round((elapsed / duration) * 100)));

      if (elapsed >= duration) {
        setWalkthroughProgress(0);
        if (walkthroughMode === 'list') {
          setWalkthroughMode('detail');
        } else {
          setWalkthroughMode('list');
          setWalkthroughActiveIndex((prev) => (prev + 1) % walkthroughMonuments.length);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isWalkthroughPlaying, walkthroughMode, walkthroughActiveIndex]);

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
      q: 'What is the SafeVisit Pass and does it store passport photos?',
      a: 'Zero passport or government ID scans are ever saved. The SafeVisit Pass generates a temporary 7-day cryptographic Journey ID (e.g. TM-DEL-2026-X89K) encoded in a QR code, allowing emergency verification without compromising your personal privacy.'
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-20">
        
        {/* ==================================================================== */}
        {/* 1. HERO SECTION */}
        {/* ==================================================================== */}
        <section className="text-center pt-3 sm:pt-6 pb-8 sm:pb-10 max-w-4xl mx-auto">
          {/* Main Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.15] text-white">
            Explore Delhi With{' '}
            <span className="coder-text-gradient block mt-1 sm:mt-2">
              Unmatched Trust & Safety
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate counterfeit monument tickets, verify official Delhi Transport fares, track police-patrolled safe corridors, and communicate effortlessly in Hindi with Bhashini AI.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/safe-pass"
              id="hero-btn-get-pass"
              className="w-full sm:w-auto coder-btn-primary text-white font-bold px-7 py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2.5 shadow-xl shadow-indigo-600/30 transition-all group"
            >
              <QrCode className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Get Free SafeVisit Pass</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/home"
              id="hero-btn-explore-places"
              className="w-full sm:w-auto coder-btn-secondary text-slate-200 font-semibold px-6 py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all hover:text-white"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Explore 10 Verified Places</span>
            </Link>

            <Link
              to="/phrase-helper"
              id="hero-btn-phrase-converter"
              className="w-full sm:w-auto coder-btn-secondary text-slate-200 font-semibold px-6 py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all hover:text-white"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Bhashini Phrase Converter</span>
            </Link>
          </div>

          {/* Live Trust Badges Pill */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ASI Official Ticketing Auth</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Delhi Police 112 Ready</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero Passport Uploads</span>
            </span>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. SIGNATURE CODER ARMY 3D DEVICE WINDOW: INTERACTIVE VERIFIED PLACES DEMO */}
        {/* ==================================================================== */}
        <section className="relative max-w-5xl mx-auto my-6 sm:my-10">
          {/* Ambient Multi-Color Glow Backdrop (Coder Army signature glowing background) */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-[40px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-25 blur-3xl animate-pulse pointer-events-none" />

          {/* Outer Hardware-Style Shell */}
          <div className="relative rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 border-2 sm:border-4 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden">
            
            {/* Window Chrome Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0d0f14]/90 border-b border-white/[0.07] rounded-t-[18px] sm:rounded-t-[24px]">
              {/* Traffic Lights (Red, Yellow, Green Mac Dots) + URL */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-[#10b981] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-emerald-500/40" />
                
                {/* Browser Address Pill */}
                <div className="flex items-center space-x-1.5 bg-black/60 border border-white/[0.08] px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-400">travelmate.delhi.gov.in/</span>
                  <span className="text-cyan-300 font-semibold">
                    {walkthroughMode === 'list' ? 'verified-places' : `place/${walkthroughMonuments[walkthroughActiveIndex].id}`}
                  </span>
                </div>
              </div>

              {/* Player Controls & Live Status */}
              <div className="flex items-center space-x-2.5">
                <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{walkthroughMode === 'list' ? 'AUTOPLAY: SCROLLING DIRECTORY' : 'AUTOPLAY: OPENED PLACE CARD'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsWalkthroughPlaying(!isWalkthroughPlaying)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title={isWalkthroughPlaying ? 'Pause interactive preview' : 'Play interactive preview'}
                >
                  {isWalkthroughPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-medium hidden md:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-medium hidden md:inline">Play</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inner Interactive Canvas */}
            <div className="bg-[#0b0d12] p-4 sm:p-6 rounded-b-[18px] sm:rounded-b-[24px]">
              
              {/* ======================================================= */}
              {/* MODE 1: SCROLLING VERIFIED PLACES DIRECTORY */}
              {/* ======================================================= */}
              {walkthroughMode === 'list' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Directory Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm sm:text-base font-bold text-white font-display">
                          Delhi Verified Monuments & Archaeological Directory
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Authentic ASI entry tariffs, live crowd telemetry, and official cashless booking links
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                        Auto-selecting place #{walkthroughActiveIndex + 1}...
                      </span>
                    </div>
                  </div>

                  {/* Scrolling / Rotating Place Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {walkthroughMonuments.map((m, idx) => {
                      const isTarget = idx === walkthroughActiveIndex;
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            setWalkthroughActiveIndex(idx);
                            setWalkthroughMode('detail');
                          }}
                          className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                            isTarget
                              ? 'bg-[#151924] border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.03] ring-1 ring-cyan-400/60'
                              : 'bg-[#101217] border-white/[0.08] hover:border-white/20 hover:scale-[1.01]'
                          }`}
                        >
                          <div>
                            {/* Photo Container */}
                            <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-[#090b10] border-b border-white/[0.08]">
                              <img
                                src={m.image}
                                alt={m.name}
                                className={`w-full h-full object-cover ${m.imagePos || 'object-center'} transition-transform duration-500 ${
                                  isTarget ? 'scale-105' : ''
                                }`}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#101217] via-transparent to-black/20" />

                              {/* Badges */}
                              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-bold text-slate-200 border border-white/10 uppercase">
                                  ASI Verified
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold backdrop-blur-md border ${
                                    m.crowd === 'High'
                                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                                      : m.crowd === 'Medium'
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  {m.crowd} Crowd
                                </span>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3">
                              <h4 className="font-bold text-white text-xs font-display line-clamp-1">
                                {m.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{m.timings}</span>
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-white/[0.07] flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-[9px] text-slate-500 block uppercase">Indian / Foreigner</span>
                                  <span className="font-mono font-bold text-white">{m.indianPrice} / {m.foreignPrice}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                                  isTarget
                                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                                    : 'bg-white/[0.06] text-slate-300'
                                }`}>
                                  <span>{isTarget ? 'Opening...' : 'View'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Animated Click Pointer Effect on Active Card */}
                          {isTarget && (
                            <div className="px-3 pb-2 pt-0 flex items-center justify-between text-[10px] text-cyan-300 font-medium">
                              <span className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                <span>Simulating click to open card...</span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* MODE 2: OPENED VERIFIED PLACE CARD (DETAIL VIEW) */}
              {/* ======================================================= */}
              {walkthroughMode === 'detail' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  {/* Top Bar of Opened Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setWalkthroughMode('list')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 group cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      <span>← Back to Verified Places</span>
                      <span className="text-[10px] text-cyan-200/70 font-mono ml-1">
                        (Auto-returning soon)
                      </span>
                    </button>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ASI Authenticated Card</span>
                      </span>
                      <Link
                        to={`/place/${walkthroughMonuments[walkthroughActiveIndex].id}`}
                        className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-medium border border-white/10 flex items-center space-x-1 transition-colors"
                      >
                        <span>Open Full Screen</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Opened Card Body */}
                  {(() => {
                    const place = walkthroughMonuments[walkthroughActiveIndex];
                    return (
                      <div className="bg-[#11141c] border border-white/[0.08] rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Left Column: Photo & Direct Booking */}
                        <div className="md:col-span-5 space-y-3">
                          <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-black border border-white/10">
                            <img
                              src={place.image}
                              alt={place.name}
                              className={`w-full h-full object-cover ${place.imagePos || 'object-center'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-2.5 left-3 right-3">
                              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                                {place.category}
                              </span>
                              <h4 className="text-base font-bold text-white font-display leading-tight">
                                {place.name}
                              </h4>
                              <p className="text-[11px] text-slate-300 font-sans">
                                {place.hindiName}
                              </p>
                            </div>
                          </div>

                          {/* Nearest Metro */}
                          <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.06] flex items-center space-x-2 text-xs text-slate-300">
                            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="truncate">{place.metro}</span>
                          </div>

                          {/* Direct Official Link */}
                          <a
                            href={place.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Direct Official ASI Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Right Column: Pricing Breakdown & Anti-Fraud Advisory */}
                        <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
                          <div>
                            {/* Official Entry Fees Grid */}
                            <div className="bg-black/40 rounded-xl border border-white/[0.06] p-3.5 space-y-2">
                              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/[0.06]">
                                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                                  Official Gazetted Pricing (No Surcharge)
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                  ● Cashless Direct
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="bg-[#171b24] p-2 rounded-lg border border-white/[0.05]">
                                  <span className="text-[10px] text-slate-400 block">Indian Citizens</span>
                                  <strong className="text-white font-mono text-sm">{place.indianPrice}</strong>
                                </div>
                                <div className="bg-[#171b24] p-2 rounded-lg border border-white/[0.05]">
                                  <span className="text-[10px] text-slate-400 block">Foreign Tourists</span>
                                  <strong className="text-white font-mono text-sm">{place.foreignPrice}</strong>
                                </div>
                                <div className="bg-[#171b24] p-2 rounded-lg border border-white/[0.05]">
                                  <span className="text-[10px] text-slate-400 block">SAARC / BIMSTEC</span>
                                  <strong className="text-white font-mono text-sm">{place.saarcPrice}</strong>
                                </div>
                                <div className="bg-[#171b24] p-2 rounded-lg border border-white/[0.05]">
                                  <span className="text-[10px] text-slate-400 block">Children &lt;15</span>
                                  <strong className="text-emerald-400 font-mono text-sm">{place.childrenPrice}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Timings & Operating Days */}
                            <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                                <span className="text-[10px] text-slate-500 block">VISITING HOURS</span>
                                <strong className="text-slate-200 font-medium">{place.timings}</strong>
                              </div>
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
                                <span className="text-[10px] text-slate-500 block">CLOSURE DAY</span>
                                <strong className="text-amber-300 font-medium">{place.closedDay}</strong>
                              </div>
                            </div>

                            {/* Anti-Tout Warning Box */}
                            <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2.5">
                              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <p className="leading-relaxed text-[11px]">
                                {place.scamWarning}
                              </p>
                            </div>
                          </div>

                          {/* Key Highlights */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {place.highlights.map((h, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-300 font-medium"
                              >
                                ✓ {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ======================================================= */}
              {/* BOTTOM SCRUBBER / VIDEO PLAYER TIMELINE BAR */}
              {/* ======================================================= */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2.5">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-75"
                    style={{ width: `${walkthroughProgress}%` }}
                  />
                </div>

                {/* Monument Selector Buttons & Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <span className="text-slate-500 font-mono">DEMO SEQUENCE:</span>
                    <div className="flex items-center space-x-1.5">
                      {walkthroughMonuments.map((m, idx) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setWalkthroughActiveIndex(idx);
                            setWalkthroughMode('detail');
                          }}
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                            walkthroughActiveIndex === idx
                              ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/40'
                              : 'bg-white/[0.05] text-slate-400 hover:text-white'
                          }`}
                        >
                          {idx + 1}. {m.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>
                      {walkthroughMode === 'list' ? 'Showing Directory' : 'Viewing Detail Card'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setWalkthroughMode(walkthroughMode === 'list' ? 'detail' : 'list');
                        if (walkthroughMode === 'detail') {
                          setWalkthroughActiveIndex((prev) => (prev + 1) % walkthroughMonuments.length);
                        }
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    >
                      {walkthroughMode === 'list' ? 'Open Place Card →' : '← Back to List'}
                    </button>
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
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    SafeVisit Pass
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    Zero Passports
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Generates a cryptographic 7-day QR identity without requiring sensitive passport copies or personal documents.
                </p>
              </div>
              <Link
                to="/safe-pass"
                className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-1 transition-all"
              >
                <span>Generate Pass</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Feature 2: Phrase Converter */}
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    Phrase Converter
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    Bhashini AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Translates crucial travel phrases, bargaining queries, and safety inquiries into Hindi text with clear phonetic pronunciation audio.
                </p>
              </div>
              <Link
                to="/phrase-helper"
                className="inline-flex items-center text-xs font-bold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-all"
              >
                <span>Open Phrase Converter</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Feature 3: Fair Fare Meter */}
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    Fair Fare Meter
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    Delhi Govt Rate
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Computes exact gazetted tariffs for Delhi Autos and Taxis with automatic +25% night surcharge detection to prevent meter rigging.
                </p>
              </div>
              <Link
                to="/fare-meter"
                className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-all"
              >
                <span>Calculate Fair Fare</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Feature 4: Safe Track */}
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    Safe Track & Corridors
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Live GPS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Multi-route safety scoring with continuous deviation monitor. Dispatches a soft check prompt if a vehicle veers &gt;500m off course.
                </p>
              </div>
              <Link
                to="/safe-journey"
                className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-all"
              >
                <span>Track Journey</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Feature 5: RideSafe Evidence Vault */}
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    RideSafe Evidence Vault
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    OCR Plate Reader
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Snap a quick photo before boarding. Python OCR reads the vehicle plate and secures timestamped evidence locally for your peace of mind.
                </p>
              </div>
              <Link
                to="/vault"
                className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition-all"
              >
                <span>Open Evidence Vault</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Feature 6: Claude AI Assistant */}
            <div className="coder-card rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-display">
                    Ask Claude AI
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    Zero-Hallucination
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  AI decision-support grounded strictly in verified Delhi monuments, police emergency protocols, and current advisories.
                </p>
              </div>
              <button
                onClick={() => {
                  const chatBtn = document.getElementById('btn-floating-claude-chat');
                  if (chatBtn) chatBtn.click();
                }}
                className="inline-flex items-center text-xs font-bold text-rose-400 hover:text-rose-300 group-hover:translate-x-1 transition-all text-left"
              >
                <span>Launch Claude Chat</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. INTERACTIVE LIVE FARE CALCULATOR WIDGET (CODER ARMY STYLE) */}
        {/* ==================================================================== */}
        <section className="my-16 max-w-4xl mx-auto">
          <div className="coder-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  INTERACTIVE RATE BENCHMARK
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                  Live Delhi Transport Department Fare Checker
                </h3>
              </div>
              <Link
                to="/fare-meter"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 shrink-0"
              >
                <span>Full Meter & Dispute Card</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
              {/* Vehicle Type Picker */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                  Select Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/[0.08]">
                  {[
                    { id: 'auto', label: 'Auto' },
                    { id: 'non_ac_taxi', label: 'Taxi' },
                    { id: 'ac_taxi', label: 'AC Taxi' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVehicleType(v.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
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

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>Journey Distance</span>
                  <span className="text-white font-bold font-mono">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 km</span>
                  <span>20 km</span>
                  <span>40 km</span>
                </div>
              </div>

              {/* Night Toggle & Calculated Output */}
              <div className="bg-black/60 p-4 rounded-2xl border border-cyan-500/20 text-center">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 text-[11px]">Night Surcharge (25%)</span>
                  <input
                    type="checkbox"
                    checked={isNight}
                    onChange={(e) => setIsNight(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  OFFICIAL GOVERNMENT RATE
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                  ₹{calculateQuickFare()}
                </div>
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

        {/* ==================================================================== */}
        {/* 8. CODER ARMY STYLE FOOTER (CLEAN & LARGER READABLE TYPOGRAPHY) */}
        {/* ==================================================================== */}
        <footer className="mt-20 pt-16 border-t border-white/[0.1] text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 pb-12">
            
            {/* Col 1: Brand & Purpose */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-cyan-500/25">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight font-display text-white">
                  TRAVEL<span className="coder-text-gradient">MATE</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                India's premier digital tourist safety ecosystem. Built to protect domestic and international visitors from ticket counterfeiting, unauthorized transport overcharging, and unsafe travel routes across Delhi NCR.
              </p>
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 pt-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Smart India Hackathon 2026 Initiative</span>
              </div>
            </div>

            {/* Col 2: Verified Monuments */}
            <div>
              <h5 className="font-bold text-white text-base uppercase tracking-wider mb-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Verified Sites</span>
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/place/pl-red-fort-01" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Red Fort (Lal Qila)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-qutub-minar-02" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Qutub Minar Complex</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-humayuns-tomb-03" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Humayun’s Tomb</span>
                  </Link>
                </li>
                <li>
                  <Link to="/place/pl-india-gate-04" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>India Gate Memorial</span>
                  </Link>
                </li>
                <li>
                  <Link to="/home" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-1.5 pt-1">
                    <span>View All 10 ASI Monuments →</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Tourist Safety Suite */}
            <div>
              <h5 className="font-bold text-white text-base uppercase tracking-wider mb-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Safety Suite</span>
              </h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/safe-pass" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>SafeVisit Pass (Zero Storage)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/phrase-helper" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Bhashini Hindi Phrase Helper</span>
                  </Link>
                </li>
                <li>
                  <Link to="/fare-meter" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Delhi Govt Fair Fare Meter</span>
                  </Link>
                </li>
                <li>
                  <Link to="/safe-journey" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>Safe Track & Police Corridors</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vault" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>RideSafe Vehicle Evidence Vault</span>
                  </Link>
                </li>
                <li>
                  <Link to="/incident" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5">
                    <span className="text-slate-500">›</span>
                    <span>File Incident Report</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Emergency Helplines */}
            <div>
              <h5 className="font-bold text-white text-base uppercase tracking-wider mb-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>24/7 Helplines</span>
              </h5>
              <div className="space-y-2.5 text-sm">
                <a
                  href="tel:112"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-300 group-hover:text-white font-sans font-medium">Police Central</span>
                  <span className="text-red-400 font-extrabold text-base bg-red-500/20 px-2.5 py-0.5 rounded-lg border border-red-500/30">112</span>
                </a>
                <a
                  href="tel:1363"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-300 group-hover:text-white font-sans font-medium">Tourist Helpline</span>
                  <span className="text-amber-400 font-extrabold text-base bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">1363</span>
                </a>
                <a
                  href="tel:1091"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-3 rounded-xl border border-white/[0.08] transition-colors group"
                >
                  <span className="text-slate-300 group-hover:text-white font-sans font-medium">Women Safety</span>
                  <span className="text-purple-400 font-extrabold text-base bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/30">1091</span>
                </a>
                <a
                  href="https://wa.me/918750871493"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-white font-mono bg-white/[0.05] hover:bg-white/[0.1] p-3 rounded-xl border border-white/[0.08] transition-colors group text-xs"
                >
                  <span className="text-slate-300 group-hover:text-white font-sans font-medium">Traffic WhatsApp</span>
                  <span className="text-emerald-400 font-bold font-mono">8750871493</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Legal & Operational Bar */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© 2026 TravelMate Platform • Smart India Hackathon Prototype. All rights reserved.</p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Delhi Police 112 & ASI Telemetry Active</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
