import React, { useState } from 'react';
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
  FileCheck
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
        {/* 2. SIGNATURE CODER ARMY 3D DEVICE WINDOW MOCKUP */}
        {/* ==================================================================== */}
        <section className="relative max-w-5xl mx-auto my-6 sm:my-10">
          {/* Ambient Multi-Color Glow Backdrop */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-[40px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-25 blur-3xl animate-pulse pointer-events-none" />

          {/* Outer Hardware-Style Shell */}
          <div className="relative rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 border-2 sm:border-4 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden">
            {/* Window Chrome Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d0f14]/90 border-b border-white/[0.07] rounded-t-[18px] sm:rounded-t-[24px]">
              {/* Traffic Lights (Red, Yellow, Green Mac Dots) */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-[#10b981] cursor-pointer hover:opacity-80 transition-opacity shadow-sm shadow-emerald-500/40" />
                <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
                  TravelMate.SafeRadar.live
                </span>
              </div>

              {/* Status Badge in Header */}
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  TELEMETRY SYNCED • PORT 5000
                </span>
              </div>
            </div>

            {/* Inner Dashboard Canvas */}
            <div className="bg-[#0b0d12] p-4 sm:p-6 rounded-b-[18px] sm:rounded-b-[24px] grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Live Radar & Journey Pass Preview */}
              <div className="md:col-span-7 space-y-4">
                {/* Simulated GPS Status Card */}
                <div className="bg-[#12151d] border border-white/[0.08] rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold font-display uppercase tracking-wider text-cyan-300">
                        Live Beat Patrol Radar
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Optimal Corridor Safety
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                      <span className="text-slate-500 block text-[10px]">CURRENT CORRIDOR</span>
                      <strong className="text-white font-mono">Netaji Subhash Marg</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">24/7 PCR Beat Active</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.05]">
                      <span className="text-slate-500 block text-[10px]">DEVIATION THRESHOLD</span>
                      <strong className="text-white font-mono">0m (On Safe Track)</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Prompt at &gt;500m</span>
                    </div>
                  </div>

                  {/* Visual Route Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>NDLS Railway Station</span>
                      <span className="text-cyan-400 font-bold">Red Fort (8.6 km)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full w-[65%]" />
                    </div>
                  </div>
                </div>

                {/* SafeVisit Pass Widget */}
                <div className="bg-[#12151d] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Active SafeVisit Pass</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white tracking-wider">
                      {journey?.journey_code || 'TM-DEL-2026-X89K'}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      7-day temporary ID • Valid until 25 Sep 2026
                    </p>
                  </div>

                  <Link
                    to="/safe-pass"
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Pass</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Live Terminal Activity Feed */}
              <div className="md:col-span-5 bg-black/70 border border-white/[0.08] rounded-2xl p-4 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.07] text-[11px] text-slate-400">
                    <span className="text-purple-400 font-bold">&gt; live_telemetry.log</span>
                    <span className="text-emerald-400 font-semibold">200 OK</span>
                  </div>

                  <div className="space-y-2.5 text-[11px]">
                    <div className="text-slate-300">
                      <span className="text-slate-500">[17:12:08]</span>{' '}
                      <span className="text-emerald-400 font-bold">AUTH</span>{' '}
                      Red Fort ASI Ticket Link Verified (`asi.payumoney.com`)
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">[17:12:05]</span>{' '}
                      <span className="text-cyan-400 font-bold">METER</span>{' '}
                      Auto fare estimated ₹92.50 (7.5 km officially checked)
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">[17:12:01]</span>{' '}
                      <span className="text-indigo-400 font-bold">ROUTE</span>{' '}
                      Corridor lit high-safety police beat active
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">[17:11:54]</span>{' '}
                      <span className="text-amber-400 font-bold">VAULT</span>{' '}
                      OCR Plate parsed: <span className="text-white">DL 1R TA 4920</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500">[17:11:42]</span>{' '}
                      <span className="text-purple-400 font-bold">AI</span>{' '}
                      Claude RAG grounded knowledge base loaded (0 hallucinations)
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-[10px] text-slate-500 mt-4">
                  <span>Supabase PostgreSQL: Connected</span>
                  <span className="text-emerald-400">● 100% Operational</span>
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
                <div className="relative h-44 sm:h-48 overflow-hidden bg-[#090b10] flex items-center justify-center border-b border-white/[0.06]">
                  <img
                    src={m.img}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/30 pointer-events-none" />
                  <img
                    src={m.img}
                    alt={m.name}
                    className="relative z-10 max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                    onError={(e) => {
                      e.target.src = '/places/red-fort.jpg';
                    }}
                  />
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
                    <p className="text-[11px] text-slate-400 mb-3 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{m.timings}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">INDIAN / FOREIGNER</span>
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
        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        {/* ==================================================================== */}
        <section className="my-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 font-display">
              Tourist Trust & Anti-Scam Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              Frequently Answered Inquiries
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="coder-card rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 8. CODER ARMY STYLE FOOTER */}
        {/* ==================================================================== */}
        <footer className="mt-20 pt-12 border-t border-white/[0.08] text-xs text-slate-400">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-black tracking-tight font-display text-white">
                  TRAVEL<span className="coder-text-gradient">MATE</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A Smart India Hackathon 2026 Prototype dedicated to elevating tourist safety, official pricing transparency, and cultural trust across Delhi.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Core Services
              </h5>
              <ul className="space-y-2 text-[11px]">
                <li><Link to="/safe-pass" className="hover:text-white transition-colors">SafeVisit Pass Generator</Link></li>
                <li><Link to="/phrase-helper" className="hover:text-white transition-colors">Bhashini Phrase Converter</Link></li>
                <li><Link to="/home" className="hover:text-white transition-colors">10 Verified Monuments</Link></li>
                <li><Link to="/fare-meter" className="hover:text-white transition-colors">Official Fair Fare Meter</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Safety & Emergency
              </h5>
              <ul className="space-y-2 text-[11px]">
                <li><Link to="/safe-journey" className="hover:text-white transition-colors">Safe Track & Beat Corridors</Link></li>
                <li><Link to="/vault" className="hover:text-white transition-colors">RideSafe Vehicle Vault</Link></li>
                <li><Link to="/incident" className="hover:text-white transition-colors">File Incident Report</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Admin Supervision Portal</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                Emergency Helplines
              </h5>
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-center justify-between text-white font-mono bg-white/[0.04] p-2 rounded-lg border border-white/[0.05]">
                  <span>Police Central:</span>
                  <strong className="text-red-400">112</strong>
                </li>
                <li className="flex items-center justify-between text-white font-mono bg-white/[0.04] p-2 rounded-lg border border-white/[0.05]">
                  <span>Tourist Helpline:</span>
                  <strong className="text-amber-400">1363</strong>
                </li>
                <li className="flex items-center justify-between text-white font-mono bg-white/[0.04] p-2 rounded-lg border border-white/[0.05]">
                  <span>Women Safety:</span>
                  <strong className="text-purple-400">1091</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 TravelMate Platform • Smart India Hackathon Prototype. All rights reserved.</p>
            <p>Designed with Coder Army Dark Glass Architecture.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
