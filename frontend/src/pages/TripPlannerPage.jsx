import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  RotateCcw,
  FileText,
  X,
  Ticket
} from 'lucide-react';
import seedPlaces from '../data/seedPlaces.json';
import {
  evaluateDestinationSafety,
  getDestinationNews,
  NEWS_CONFIG,
} from '../services/newsService';
import StatusBadge from '../components/common/StatusBadge';

const LOCAL_STORAGE_KEY = 'tm_trip_planner_itinerary_v1';

// Pre-populated days showcasing automated safety logic (e.g. Monday closure for Red Fort)
const DEFAULT_ITINERARY = [
  {
    id: 'day-plan-1',
    date: '2026-09-20',
    timeSlot: 'Morning (09:00 - 12:30)',
    placeKey: 'humayuns-tomb',
    notes: 'Walk through Mughal charbagh gardens, explore Sunder Nursery linkage, morning photography.',
  },
  {
    id: 'day-plan-2',
    date: '2026-09-21', // Monday! Triggers ASI weekly closure advisory for Red Fort
    timeSlot: 'Morning (09:30 - 13:00)',
    placeKey: 'red-fort',
    notes: 'Enter via Lahori Gate, explore Diwan-i-Aam and Archaeological Museum.',
  },
  {
    id: 'day-plan-3',
    date: '2026-09-22',
    timeSlot: 'Afternoon (14:30 - 18:00)',
    placeKey: 'india-gate',
    notes: 'Stroll along Kartavya Path and pay respects at the National War Memorial at dusk.',
  },
  {
    id: 'day-plan-4',
    date: '2026-09-23',
    timeSlot: 'Early Morning (07:30 - 10:30)',
    placeKey: 'qutub-minar',
    notes: 'View the 12th-century minaret and Iron Pillar before midday sun.',
  },
];

export default function TripPlannerPage() {
  const [itinerary, setItinerary] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved itinerary, using defaults:', e);
    }
    return DEFAULT_ITINERARY;
  });

  // Active selected place for "Local Update" panel
  const [selectedPlaceKey, setSelectedPlaceKey] = useState('red-fort');
  const [activeNews, setActiveNews] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // Modal / Form state for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Morning (09:00 - 12:30)',
    placeKey: 'red-fort',
    notes: '',
  });

  // Persist itinerary to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itinerary));
    } catch (err) {
      console.warn('Could not save itinerary to localStorage:', err);
    }
  }, [itinerary]);

  // Load news for active selected place
  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      setIsLoadingNews(true);
      const matchedPlace = seedPlaces.find((p) => p.place_key === selectedPlaceKey);
      const news = await getDestinationNews(selectedPlaceKey, matchedPlace?.name);
      if (isMounted) {
        setActiveNews(news);
        setIsLoadingNews(false);
      }
    }
    loadNews();
    return () => {
      isMounted = false;
    };
  }, [selectedPlaceKey]);

  // Helper to find place details
  const getPlaceInfo = (placeKey) => {
    return (
      seedPlaces.find((p) => p.place_key === placeKey) || {
        name: placeKey,
        hindi_name: '',
        category: 'Heritage Destination',
        image_url: '/places/red-fort.jpg',
      }
    );
  };

  // Open Add Day Modal
  const handleOpenAdd = () => {
    setEditingPlanId(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({
      date: tomorrow.toISOString().split('T')[0],
      timeSlot: 'Morning (09:00 - 12:30)',
      placeKey: seedPlaces[0]?.place_key || 'red-fort',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Day Modal
  const handleOpenEdit = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      date: plan.date,
      timeSlot: plan.timeSlot,
      placeKey: plan.placeKey,
      notes: plan.notes || '',
    });
    setIsModalOpen(true);
  };

  // Delete a Day
  const handleDeletePlan = (id) => {
    setItinerary((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to default sample days
  const handleResetDefaults = () => {
    if (window.confirm('Reset itinerary to recommended sample 4-day plan?')) {
      setItinerary(DEFAULT_ITINERARY);
    }
  };

  // Save Add / Edit
  const handleSavePlan = (e) => {
    e.preventDefault();
    if (editingPlanId) {
      setItinerary((prev) =>
        prev.map((item) =>
          item.id === editingPlanId ? { ...item, ...formData } : item
        )
      );
    } else {
      const newPlan = {
        id: `day-plan-${Date.now()}`,
        ...formData,
      };
      setItinerary((prev) => [...prev, newPlan]);
    }
    setIsModalOpen(false);
    setSelectedPlaceKey(formData.placeKey);
  };

  // Summary counts
  const totalDays = itinerary.length;
  const evaluations = itinerary.map((item) =>
    evaluateDestinationSafety(item.placeKey, item.date)
  );
  const rescheduleCount = evaluations.filter((e) => e.status === 'reschedule').length;
  const goodCount = evaluations.filter((e) => e.status === 'good').length;

  const activePlaceObj = getPlaceInfo(selectedPlaceKey);
  const activePlaceEval = evaluateDestinationSafety(selectedPlaceKey);

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* ==================================================================== */}
        {/* TOP BANNER: STREAMLINED HEADER & EXECUTIVE CONTROLS */}
        {/* ==================================================================== */}
        <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-Cross-Referenced Itinerary Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight">
                Delhi Trip Planner & <span className="coder-text-gradient">Disruption Radar</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Build your daily Delhi schedule. Every stop is cross-referenced in real time with official ASI closure calendars, police security cordons, and civic notices.
              </p>
            </div>

            {/* Quick Metrics & Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center space-x-2 bg-black/50 p-1.5 px-3 rounded-2xl border border-white/[0.08] text-xs">
                <span className="font-bold text-slate-400">Total:</span>
                <span className="font-mono font-bold text-white text-sm">{totalDays} Days</span>
                <span className="text-slate-600">•</span>
                <span className="font-bold text-cyan-400">{goodCount} Verified Good</span>
                {rescheduleCount > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-bold text-rose-400">{rescheduleCount} Alert</span>
                  </>
                )}
              </div>

              <button
                onClick={handleResetDefaults}
                title="Reset to recommended 4-day sample itinerary"
                className="p-2.5 text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-2xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenAdd}
                className="coder-btn-primary px-5 py-2.5 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Planned Day</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MAIN TWO-COLUMN BALANCED LAYOUT */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: DAY-BY-DAY ITINERARY CARDS (7 COLS) */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-wider">
                  Day-by-Day Schedule
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Click any day to inspect live dispatches
              </span>
            </div>

            {itinerary.length === 0 ? (
              <div className="coder-card bg-[#111318]/90 p-10 rounded-3xl border border-white/[0.08] text-center space-y-4">
                <CalendarDays className="w-12 h-12 text-slate-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Your Itinerary is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add your first planned destination or restore the verified sample itinerary.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 bg-white/[0.06] text-xs text-slate-300 font-semibold rounded-xl border border-white/[0.08] hover:text-white"
                  >
                    Load Sample Days
                  </button>
                  <button
                    onClick={handleOpenAdd}
                    className="coder-btn-primary px-5 py-2 text-xs text-white font-bold rounded-xl"
                  >
                    Add Day
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.map((plan, index) => {
                  const place = getPlaceInfo(plan.placeKey);
                  const evalResult = evaluateDestinationSafety(plan.placeKey, plan.date);
                  const isSelected = selectedPlaceKey === plan.placeKey;
                  const formattedDate = new Date(plan.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlaceKey(plan.placeKey)}
                      className={`coder-card p-5 rounded-3xl border cursor-pointer transition-all duration-300 space-y-3.5 relative ${
                        isSelected
                          ? 'bg-[#141822] border-indigo-500/70 ring-1 ring-indigo-400/40 shadow-xl shadow-indigo-500/10'
                          : 'bg-[#111318]/85 border-white/[0.08] hover:border-indigo-500/40 hover:bg-[#131620]'
                      }`}
                    >
                      {/* Top Bar: Day Badge, Date & Slot, Edit & Delete */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono shadow-md ${
                            isSelected
                              ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white'
                              : 'bg-white/[0.06] text-slate-300 border border-white/10'
                          }`}>
                            D{index + 1}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                              <span className="text-white">{formattedDate}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-cyan-400 font-semibold">{plan.timeSlot}</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white font-display mt-0.5 flex items-center space-x-2">
                              <span>{place.name}</span>
                              {place.hindi_name && (
                                <span className="text-xs font-normal text-cyan-400">
                                  ({place.hindi_name})
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            title="Edit this day"
                            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            title="Delete this day"
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.06] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Automated Safety & Closure Status Banner */}
                      <div
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          evalResult.status === 'reschedule'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : evalResult.status === 'warning'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {evalResult.status === 'reschedule' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : evalResult.status === 'warning' ? (
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {evalResult.label}
                          </span>
                        </div>
                        <span className="text-xs text-slate-200 font-medium leading-tight">
                          {evalResult.reason}
                        </span>
                      </div>

                      {/* Notes / Activities */}
                      {plan.notes && (
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.04] text-xs text-slate-300 leading-relaxed">
                          <strong className="text-slate-400 font-bold uppercase tracking-wide mr-1.5">
                            Notes:
                          </strong>
                          <span>{plan.notes}</span>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
                        <span className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{place.category}</span>
                        </span>
                        <span className="text-indigo-400 font-bold flex items-center space-x-1">
                          <span>View Radar Dispatches</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: REAL-TIME LOCAL SAFETY & NEWS RADAR (5 COLS) */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-bold text-white font-display uppercase tracking-wider">
                  Destination Safety Radar
                </h2>
              </div>
              <StatusBadge status="Official" />
            </div>

            <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              
              {/* Target Destination & Quick Selector */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Inspecting Destination
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white mt-0.5">
                    {activePlaceObj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activePlaceObj.category}
                  </p>
                </div>

                {/* Dropdown Selector */}
                <div className="w-36 sm:w-44 shrink-0">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Switch Place
                  </label>
                  <select
                    value={selectedPlaceKey}
                    onChange={(e) => setSelectedPlaceKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#161a24] border border-white/10 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {seedPlaces.map((p) => (
                      <option key={p.place_key} value={p.place_key}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                activePlaceEval.status === 'reschedule'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                    {activePlaceEval.status === 'reschedule' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>Official Status: {activePlaceEval.label}</span>
                  </span>
                  <span className="text-xs font-mono opacity-80">ASI Verified</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activePlaceEval.reason}
                </p>
              </div>

              {/* Official Ticket Direct Action */}
              {activePlaceObj.official_ticket_url && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 block">Official Entry Tickets</span>
                    <strong className="text-white font-mono">
                      {activePlaceObj.fee?.foreigner === 0 ? 'Free Entry' : `₹${activePlaceObj.fee?.foreigner} (Intl)`}
                    </strong>
                  </div>
                  <a
                    href={activePlaceObj.official_ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="coder-btn-primary px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 hover:scale-105 transition-all shrink-0"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Civic Bulletins & News Feed */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Civic Bulletins (Past 14 Days)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {NEWS_CONFIG.USE_MOCK ? 'Verified Feed' : 'Live NewsAPI'}
                  </span>
                </div>

                {isLoadingNews ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Loading latest civic updates...
                  </div>
                ) : activeNews.length === 0 ? (
                  <div className="p-4 bg-white/[0.03] rounded-2xl text-center text-xs text-slate-400 border border-white/[0.06]">
                    No disruptive civic alerts reported for this destination in the last 14 days.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeNews.map((news) => (
                      <div
                        key={news.id}
                        className="p-4 bg-black/40 rounded-2xl border border-white/[0.06] space-y-2 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-md uppercase tracking-wider ${
                              news.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : news.severity === 'warning'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {news.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {news.date}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {news.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {news.snippet}
                        </p>

                        <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
                          <span className="truncate max-w-[180px]">
                            Source: {news.source}
                          </span>
                          <a
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                          >
                            <span>Official Notice</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Police Advisory Integration Note */}
              <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.06] space-y-1 text-xs text-slate-400">
                <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Delhi Police & ASI Calendar Sync</span>
                </div>
                <p className="leading-relaxed">
                  Itinerary recommendations account for weekly monument conservation days (ASI), DMRC metro line maintenance, and police traffic cordons.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL FOR ADD / EDIT PLANNED DAY */}
      {/* ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg coder-card bg-[#111318]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">
                    {editingPlanId ? 'Edit Planned Day' : 'Add Day to Itinerary'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure date, time slot, and destination to evaluate automated safety advisories.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs sm:text-sm">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-xs block">
                  Planned Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#161a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                />
              </div>

              {/* Destination Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-xs block">
                  Destination (Verified Delhi Heritage)
                </label>
                <select
                  value={formData.placeKey}
                  onChange={(e) => setFormData({ ...formData, placeKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#161a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                >
                  {seedPlaces.map((place) => (
                    <option key={place.place_key} value={place.place_key}>
                      {place.name} ({place.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-xs block">
                  Time Slot
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#161a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                >
                  <option value="Early Morning (07:30 - 10:30)">Early Morning (07:30 - 10:30)</option>
                  <option value="Morning (09:00 - 12:30)">Morning (09:00 - 12:30)</option>
                  <option value="Afternoon (14:00 - 17:30)">Afternoon (14:00 - 17:30)</option>
                  <option value="Evening (18:00 - 21:00)">Evening (18:00 - 21:00)</option>
                  <option value="Full Day Itinerary">Full Day Itinerary</option>
                </select>
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-xs block">
                  Planned Activities & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Photography, audio guide tour, metro route, light and sound show..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#161a24] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none text-xs sm:text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coder-btn-primary px-6 py-2.5 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs sm:text-sm"
                >
                  {editingPlanId ? 'Update Day' : 'Add to Itinerary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
