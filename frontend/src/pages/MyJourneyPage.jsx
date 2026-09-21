import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CalendarDays,
  Calculator,
  Camera,
  Globe,
  Navigation,
  AlertCircle,
  Clock,
  Plus,
  Check,
  ShieldCheck,
  ArrowRight,
  QrCode,
  Compass,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  Car,
  FileText,
  X,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext';
import { useTraveler } from '../context/TravelerContext';
import QRModal from '../components/common/QRModal';

export default function MyJourneyPage() {
  const {
    activeJourney,
    activeJourneyId,
    allJourneys,
    switchJourney,
    createNewJourney,
    addTimelineEvent,
    updateJourneyStage
  } = useJourney();

  const { traveler } = useTraveler();

  const [isQROpen, setIsQROpen] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'records' | 'switch'
  const [recordFilter, setRecordFilter] = useState('all'); // 'all' | 'fares' | 'evidence' | 'places' | 'reports'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Journey Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('Delhi, India');
  const [newOrigin, setNewOrigin] = useState('Indira Gandhi International Airport (DEL)');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const stages = [
    { key: 'DISCOVER', label: '1. Discover', desc: 'Attractions & Safety' },
    { key: 'PREPARE', label: '2. Prepare', desc: 'Itinerary & Official Fares' },
    { key: 'TRAVEL', label: '3. Travel', desc: 'Navigation & Translation' },
    { key: 'RESOLVE', label: '4. Resolve', desc: 'Evidence & Assistance' }
  ];

  const handleCreateJourney = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createNewJourney({
        title: newTitle.trim(),
        destination: newDestination.trim(),
        origin: newOrigin.trim(),
        startDate: newStartDate,
        endDate: newEndDate
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
    }
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'created':
        return <QrCode className="w-4 h-4 text-cyan-400" />;
      case 'destination':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      case 'planner':
        return <CalendarDays className="w-4 h-4 text-indigo-400" />;
      case 'fare':
        return <Calculator className="w-4 h-4 text-amber-400" />;
      case 'evidence':
        return <Camera className="w-4 h-4 text-teal-400" />;
      case 'translate':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'navigation':
        return <Navigation className="w-4 h-4 text-emerald-400" />;
      case 'incident':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const journey = activeJourney || allJourneys[0];
  const timelineEvents = journey?.timeline || [];
  const records = journey?.records || {
    fareChecks: [],
    evidenceList: [],
    visitedPlaces: [],
    translations: [],
    reports: []
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-x-hidden">
      {/* Background Cyber Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[450px] bg-gradient-to-bl from-blue-600/15 via-indigo-700/15 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
        
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
              <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-cyan-400 font-semibold tracking-wide">Smart Journey Chain</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
                <span>My Journey</span>
              </h1>
              <span className="text-xs font-mono px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                {journey?.id || 'TM-DEL-2026-X89K'}
              </span>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronized</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Centralized high-trust timeline interconnecting your verified ASI monuments, verified transport fares, AI translations, and emergency police telemetry.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              id="btn-create-new-journey"
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-2 transition-all backdrop-blur-md hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>New Journey</span>
            </button>
            <button
              onClick={() => setIsQROpen(true)}
              id="btn-journey-show-qr"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white flex items-center space-x-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95 hover:scale-102"
            >
              <QrCode className="w-4 h-4" />
              <span>Digital SafePass</span>
            </button>
          </div>
        </div>

        {/* Active Journey Overview Glass Card */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-[#0e111a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden group">
          {/* Ambient Corner Accent */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Trip Info & Quick Nav Links */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {journey?.status === 'active' ? 'Active Trip' : 'Scheduled Trip'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Cryptographic ID: <strong className="font-mono text-slate-200">{journey?.id}</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  {journey?.title || 'Delhi Heritage & Capital Discovery'}
                </h2>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-medium text-slate-200">{journey?.destination}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{journey?.startDate} to {journey?.endDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-semibold">{journey?.safetyStatus}</span>
                  </div>
                </div>
              </div>

              {/* Quick Jump Action Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 shrink-0">
                <Link
                  to="/home"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explore Verified Places</span>
                </Link>
                <Link
                  to="/planner"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Planner</span>
                </Link>
                <Link
                  to="/fare-meter"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fare Meter</span>
                </Link>
                <Link
                  to="/safe-journey"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safe Track</span>
                </Link>
              </div>
            </div>

            {/* 4-Stage Stepper */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Journey Lifecycle Stage</span>
                </span>
                <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Current: {journey?.stage || 'TRAVEL'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stages.map((stg, idx) => {
                  const isCurrent = journey?.stage === stg.key;
                  const isPassedOrCurrent =
                    stages.findIndex((s) => s.key === journey?.stage) >= idx;

                  return (
                    <button
                      key={stg.key}
                      onClick={() => updateJourneyStage(stg.key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group ${
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-400/30'
                          : isPassedOrCurrent
                          ? 'bg-white/[0.04] border-white/15 text-slate-200 hover:bg-white/[0.07]'
                          : 'bg-white/[0.01] border-white/[0.06] text-slate-500 hover:text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {stg.label}
                        </span>
                        {isPassedOrCurrent && (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCurrent ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-emerald-400'}`}>
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {stg.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'timeline'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_4px_12px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Journey Timeline ({timelineEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'records'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_4px_12px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Connected Records</span>
          </button>

          <button
            onClick={() => setActiveTab('switch')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'switch'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_4px_12px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>All Journeys ({allJourneys.length})</span>
          </button>
        </div>

        {/* TAB 1: JOURNEY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Live Activity Sequence</span>
              </h3>
              <span className="text-xs text-slate-400">
                Auto-saved under Journey ID: <span className="font-mono text-cyan-300 font-bold">{journey?.id}</span>
              </span>
            </div>

            <div className="relative pl-6 sm:pl-9 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/40 before:via-indigo-500/20 before:to-transparent">
              {timelineEvents && timelineEvents.length > 0 ? (
                timelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Glowing Bullet Icon */}
                    <div className="absolute -left-6 sm:-left-9 top-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#11131a] border border-white/15 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-cyan-400/60 transition-transform">
                      {getTimelineIcon(evt.type)}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#0e111a]/95 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 shadow-xl space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                            {evt.module || 'TravelMate Core'}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {evt.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(evt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-3 flex items-center justify-between border-t border-white/[0.06] text-xs">
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{evt.status || 'Verified on Device'}</span>
                        </span>

                        {evt.actionPath && (
                          <Link
                            to={evt.actionPath}
                            className="inline-flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors"
                          >
                            <span>{evt.actionLabel || 'Open Tool'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center rounded-2xl bg-[#0e111a]/80 border border-white/10 text-slate-400 text-sm">
                  No journey events recorded yet. Start by exploring verified monuments, planning an itinerary, or calculating a taxi fare.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Pill Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: 'all', label: 'All Records' },
                { id: 'fares', label: `Fare Checks (${records?.fareChecks?.length || 0})` },
                { id: 'evidence', label: `Evidence Vault (${records?.evidenceList?.length || 0})` },
                { id: 'places', label: `Visited Places (${records?.visitedPlaces?.length || 0})` },
                { id: 'reports', label: `Incident Reports (${records?.reports?.length || 0})` }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setRecordFilter(pill.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    recordFilter === pill.id
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Fares Section */}
            {(recordFilter === 'all' || recordFilter === 'fares') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <Calculator className="w-4 h-4" />
                    <span>Transport Fare Checks</span>
                  </h4>
                  <Link to="/fare-meter" className="text-xs text-amber-400 hover:underline font-semibold flex items-center space-x-1">
                    <span>Open Fare Meter</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {records?.fareChecks && records.fareChecks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {records.fareChecks.map((fare, idx) => (
                      <div
                        key={fare.id || idx}
                        className="p-5 rounded-2xl bg-[#0e111a]/90 border border-white/10 hover:border-amber-500/30 transition-all space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <Car className="w-3.5 h-3.5 text-amber-400" />
                            <span>{fare.mode || 'Auto-Rickshaw'}</span>
                          </span>
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">
                            ₹{fare.fare}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {fare.from} ➔ {fare.to} ({fare.distance} km)
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(fare.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    No fares checked yet for this journey.
                  </p>
                )}
              </div>
            )}

            {/* Evidence Section */}
            {(recordFilter === 'all' || recordFilter === 'evidence') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Logged Vehicle Plates & Evidence Vault</span>
                  </h4>
                  <Link to="/vault" className="text-xs text-teal-400 hover:underline font-semibold flex items-center space-x-1">
                    <span>Open Evidence Vault</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {records?.evidenceList && records.evidenceList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {records.evidenceList.map((ev, idx) => (
                      <div
                        key={ev.id || idx}
                        className="p-5 rounded-2xl bg-[#0e111a]/90 border border-white/10 hover:border-teal-500/30 transition-all space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30">
                            {ev.plateNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {ev.vehicleType || 'Commercial Vehicle'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {ev.location || 'Logged in transit'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(ev.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    No vehicle plates or photos logged yet.
                  </p>
                )}
              </div>
            )}

            {/* Visited Places Section */}
            {(recordFilter === 'all' || recordFilter === 'places') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Visited Attractions & ASI Check-ins</span>
                  </h4>
                  <Link to="/home" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center space-x-1">
                    <span>Discover Places</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {records?.visitedPlaces && records.visitedPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {records.visitedPlaces.map((pl, idx) => (
                      <div
                        key={pl.id || idx}
                        className="p-5 rounded-2xl bg-[#0e111a]/90 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {pl.name}
                          </span>
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            Verified Check-in
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {pl.category || 'Historical ASI Monument'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    No monument check-ins recorded yet.
                  </p>
                )}
              </div>
            )}

            {/* Incident Reports Section */}
            {(recordFilter === 'all' || recordFilter === 'reports') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Incident Reports & Police Logs</span>
                  </h4>
                  <Link to="/incident" className="text-xs text-rose-400 hover:underline font-semibold flex items-center space-x-1">
                    <span>Report Incident</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {records?.reports && records.reports.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {records.reports.map((rep, idx) => (
                      <div
                        key={rep.id || idx}
                        className="p-5 rounded-2xl bg-[#0e111a]/90 border border-white/10 hover:border-rose-500/30 transition-all space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {rep.title || 'Official Assistance Request'}
                          </span>
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Active Dispatch
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {rep.description}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(rep.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    No incident reports logged for this journey. Everything is safe and secure.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL JOURNEYS */}
        {activeTab === 'switch' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Saved Journeys & Smart Chains</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Journey</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allJourneys.map((jrn) => {
                const isActive = jrn.id === activeJourneyId;
                return (
                  <div
                    key={jrn.id}
                    className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-[#121624] to-[#0c0e14] border-cyan-500/50 shadow-2xl shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                        : 'bg-[#0e111a]/95 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                        {jrn.id}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          jrn.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {jrn.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1">
                      {jrn.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center space-x-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{jrn.destination}</span>
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs">
                      <span className="text-slate-400">
                        {jrn.startDate} – {jrn.endDate}
                      </span>

                      {isActive ? (
                        <span className="text-emerald-400 font-bold flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Now</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            switchJourney(jrn.id);
                            setActiveTab('timeline');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                        >
                          Switch to this Journey
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CREATE NEW JOURNEY MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0e111a] border border-white/20 max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Create Smart Journey Chain
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Instantly initialize cryptographic Journey ID
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateJourney} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Journey Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Delhi Heritage & Street Food Explorer"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Destination Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Delhi, NCR, India"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Starting Point / Hotel
                  </label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    placeholder="e.g. New Delhi Railway Station or Connaught Place"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/10 text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    Generate Journey Chain ID
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR MODAL */}
        <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      </div>
    </div>
  );
}
