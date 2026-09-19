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
} from 'lucide-react';
import seedPlaces from '../data/seedPlaces.json';
import {
  evaluateDestinationSafety,
  getDestinationNews,
  MOCK_DESTINATION_NEWS,
  NEWS_CONFIG,
} from '../services/newsService';
import StatusBadge from '../components/common/StatusBadge';

const LOCAL_STORAGE_KEY = 'tm_trip_planner_itinerary_v1';

// Initial pre-populated days so the user immediately experiences the feature
const DEFAULT_ITINERARY = [
  {
    id: 'day-plan-1',
    date: '2026-09-06',
    timeSlot: 'Morning (09:00 - 12:30)',
    placeKey: 'humayuns-tomb',
    notes: 'Walk through the Mughal gardens, explore Sunder Nursery linkage, photography during soft light.',
  },
  {
    id: 'day-plan-2',
    date: '2026-09-07', // Monday! Triggers monument closure logic for Red Fort
    timeSlot: 'Morning (09:30 - 13:00)',
    placeKey: 'red-fort',
    notes: 'Enter via Lahori Gate, explore Diwan-i-Aam and Archaeological Museum.',
  },
  {
    id: 'day-plan-3',
    date: '2026-09-08',
    timeSlot: 'Afternoon (14:30 - 18:00)',
    placeKey: 'india-gate',
    notes: 'Stroll along Kartavya Path and pay respects at the National War Memorial.',
  },
  {
    id: 'day-plan-4',
    date: '2026-09-09',
    timeSlot: 'Early Morning (07:30 - 10:30)',
    placeKey: 'qutub-minar',
    notes: 'View the 12th-century minaret and Iron Pillar before midday heat.',
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
  const [selectedPlaceKey, setSelectedPlaceKey] = useState('india-gate');
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

  // Persist itinerary to LocalStorage whenever it changes
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
      // Update
      setItinerary((prev) =>
        prev.map((item) =>
          item.id === editingPlanId
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      // Create new
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

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Modal for Add / Edit Plan */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {editingPlanId ? 'Edit Planned Day' : 'Add Day to Itinerary'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a date and verified Delhi destination to check automated safety advisories.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Planned Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-card border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Destination Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Destination (10 Verified Delhi Places)
                </label>
                <select
                  value={formData.placeKey}
                  onChange={(e) => setFormData({ ...formData, placeKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-card border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
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
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Time Slot
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-card border border-surface-border rounded-xl text-white focus:outline-none focus:border-emerald-500"
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
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Planned Activities & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Photography, audio guide tour, metro route, light and sound show..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-surface-card border border-surface-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {editingPlanId ? 'Update Day' : 'Add to Itinerary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Delhi Trip Planner & Disruption Radar
              </h1>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 uppercase tracking-wide">
                Day-by-Day Safety Intelligence
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Build your customized Delhi itinerary. Each scheduled day is continuously cross-referenced against official ASI closure schedules and recent civic news to give you automated visit recommendations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
            <button
              onClick={handleResetDefaults}
              title="Reset to default 4-day sample plan"
              className="p-2.5 text-slate-400 hover:text-white bg-surface-card hover:bg-white/5 border border-surface-border rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Planned Day</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-surface-card p-3 rounded-2xl border border-surface-border">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Planned Days</div>
            <div className="text-xl font-black text-white mt-0.5">{totalDays} Days</div>
          </div>
          <div className="bg-surface-card p-3 rounded-2xl border border-surface-border">
            <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Recommended Slots</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{goodCount} Verified Good</div>
          </div>
          <div className="bg-surface-card p-3 rounded-2xl border border-surface-border col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Advisories / Closures</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{rescheduleCount} Alert{rescheduleCount === 1 ? '' : 's'}</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Itinerary List on Left (7 cols), Local Update Panel on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================================================================= */}
        {/* LEFT COLUMN: DAY-BY-DAY ITINERARY BUILDER */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Day-by-Day Schedule</span>
            </h2>
            <span className="text-xs text-slate-400">
              Click a destination to inspect live local news
            </span>
          </div>

          {itinerary.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-surface-border text-center space-y-4">
              <CalendarDays className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Your Itinerary is Empty</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add your first planned destination or restore the verified sample itinerary.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 bg-surface-card text-xs text-slate-300 font-semibold rounded-xl border border-surface-border hover:text-white"
                >
                  Load Sample Days
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-emerald-600 text-xs text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
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
                    className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                      isSelected
                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-surface'
                        : 'border-surface-border hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Top Row: Day Number, Date, Time Slot, and Edit/Delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                          D{index + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                            <span>{formattedDate}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400">{plan.timeSlot}</span>
                          </div>
                          <h3 className="text-base font-black text-white font-display mt-0.5 flex items-center space-x-1.5">
                            <span>{place.name}</span>
                            {place.hindi_name && (
                              <span className="text-xs font-normal text-slate-400">
                                ({place.hindi_name})
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(plan)}
                          title="Edit this day"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          title="Delete this day"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AUTOMATED RECOMMENDATION BADGE & ONE-LINE REASON */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${evalResult.badgeClass}`}
                    >
                      <div className="flex items-center space-x-2">
                        {evalResult.status === 'reschedule' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : evalResult.status === 'warning' ? (
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {evalResult.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium leading-tight">
                        {evalResult.reason}
                      </span>
                    </div>

                    {/* Notes & Activity Description */}
                    {plan.notes && (
                      <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                        <strong className="text-slate-400 font-semibold">Notes:</strong> {plan.notes}
                      </p>
                    )}

                    {/* Bottom destination meta bar */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{place.category}</span>
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <span>View Local Updates</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: "LOCAL UPDATE" PANEL FOR SELECTED DESTINATION */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Local Updates & Safety Radar</span>
            </h2>
            <StatusBadge status="Official" />
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-surface-border space-y-6">
            {/* Active Destination Headline */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Target Destination
                </span>
                <h3 className="text-xl font-black text-white font-display mt-0.5">
                  {activePlaceObj.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activePlaceObj.category}
                </p>
              </div>

              {/* Destination Selector Dropdown */}
              <div className="w-40 shrink-0">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Change Place
                </label>
                <select
                  value={selectedPlaceKey}
                  onChange={(e) => setSelectedPlaceKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-card border border-surface-border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {seedPlaces.map((p) => (
                    <option key={p.place_key} value={p.place_key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Real-Time Safety Status Card */}
            <div className={`p-4 rounded-2xl border space-y-2 ${activePlaceEval.badgeClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  {activePlaceEval.status === 'reschedule' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Status: {activePlaceEval.label}</span>
                </span>
                <span className="text-[10px] font-mono opacity-80">Verified Dispatch</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {activePlaceEval.reason}
              </p>
            </div>

            {/* Local News Feed (Last 1-2 Weeks) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recent News & Dispatches (Past 2 Weeks)</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {NEWS_CONFIG.USE_MOCK ? 'Verified Local Feed' : 'Live NewsAPI Feed'}
                </span>
              </div>

              {isLoadingNews ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading latest civic bulletins...
                </div>
              ) : activeNews.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-slate-400">
                  No disruptive news reported for this destination in the last 14 days.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeNews.map((news) => (
                    <div
                      key={news.id}
                      className="p-4 bg-surface-card rounded-2xl border border-surface-border space-y-2.5 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${
                            news.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : news.severity === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {news.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {news.date}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {news.title}
                      </h4>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {news.snippet}
                      </p>

                      {/* Disruption Tags */}
                      {news.tags && news.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {news.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] font-mono text-slate-400 border border-white/5"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[200px]" title={news.source}>
                          Source: {news.source}
                        </span>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification & Safety Footnote */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-[11px] text-slate-400">
              <div className="font-bold text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Delhi Tourist Police Advisory Integration</span>
              </div>
              <p>
                Recommendations account for weekly monument conservation days (ASI), DMRC metro line maintenance, and police traffic cordons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
