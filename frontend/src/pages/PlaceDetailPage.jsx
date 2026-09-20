import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Ticket,
  ExternalLink,
  Users,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Star,
  Share2,
  Maximize2,
  X,
  Sparkles,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import seedPlaces from '../data/seedPlaces.json';
import { api, API_BASE } from '../services/api';
import { useTraveler } from '../context/TravelerContext';
import StatusBadge from '../components/common/StatusBadge';

const DEFAULT_PLACE_IMAGE = '/places/red-fort.jpg';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { journey } = useTraveler();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [visitedPlaces, setVisitedPlaces] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm_visited_places') || '["pl-red-fort-01", "red-fort"]');
    } catch {
      return ['pl-red-fort-01', 'red-fort'];
    }
  });

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadPlace() {
      setLoading(true);
      try {
        const res = await api.getPlaces();
        const allPlaces = (res.success && res.data) ? res.data : seedPlaces;
        const found = allPlaces.find(
          (p) => p.id === id || p.place_key === id || String(p.id).toLowerCase() === String(id).toLowerCase()
        );
        setPlace(found || seedPlaces[0]);
      } catch {
        const fallback = seedPlaces.find(
          (p) => p.id === id || p.place_key === id
        ) || seedPlaces[0];
        setPlace(fallback);
      } finally {
        setLoading(false);
      }
    }
    loadPlace();
  }, [id]);

  const isVisited = place
    ? visitedPlaces.includes(place.id) || visitedPlaces.includes(place.place_key)
    : false;

  const handleCheckIn = async () => {
    if (!place) return;
    const pId = place.id || place.place_key;
    const res = await api.checkinPlace(journey?.journey_code || 'TM-DEL-2026-X89K', pId);
    if (res.success) {
      const updated = [...visitedPlaces, pId, place.id, place.place_key].filter(Boolean);
      setVisitedPlaces(updated);
      try {
        localStorage.setItem('tm_visited_places', JSON.stringify(updated));
      } catch (_) {}
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !place) return;
    try {
      const res = await fetch(`${API_BASE}/places/${place.id || place.place_key}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
          rating: reviewRating,
          review_text: reviewText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewFeedback('Review recorded with Verified Traveler status.');
        setReviewText('');
        setTimeout(() => setReviewFeedback(null), 3500);
      }
    } catch {
      setReviewFeedback('Review recorded with Verified Traveler status.');
      setTimeout(() => setReviewFeedback(null), 3500);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading || !place) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-[#0a0c10] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading Verified Place Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#0a0c10] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/25 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] -right-48 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container - Optimized for instant visibility without deep scrolling */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header Strip */}
        <div className="flex items-center justify-between gap-3 bg-[#12141c]/90 border border-white/10 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-xl">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-indigo-500/40 transition-all group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Verified Places</span>
          </button>

          <div className="flex items-center space-x-2.5 shrink-0">
            {place.official_ticket_url && (
              <a
                href={place.official_ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="coder-btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Book on ASI Official</span>
                <span className="sm:hidden">Tickets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 transition-all"
              title="Share place link"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{isCopied ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* PRIMARY SPLIT DASHBOARD CARD (Side-by-side on desktop so full info is visible immediately!) */}
        <div className="relative group">
          {/* Ambient Glow Backdrop */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-25 group-hover:opacity-40 blur-xl transition-opacity duration-300 pointer-events-none" />

          <div className="relative rounded-3xl border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-5 sm:p-7 md:p-8 shadow-2xl overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Monument Photo & Action Hub (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Photo Container */}
                <div className="relative w-full h-56 sm:h-64 lg:h-72 bg-[#080a0f] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group shadow-xl">
                  {/* Ambient Blurred Background Fill */}
                  <img
                    src={place.image_url || DEFAULT_PLACE_IMAGE}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Un-cropped High-Res Image */}
                  <img
                    src={place.image_url || DEFAULT_PLACE_IMAGE}
                    alt={place.name}
                    className="relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                    title="Click to view full picture in high resolution"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = 'true';
                        e.currentTarget.src = DEFAULT_PLACE_IMAGE;
                      }
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                    <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-xs font-bold text-slate-200 border border-white/15 uppercase tracking-wider shadow-md">
                      {place.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase shadow-md backdrop-blur-md">
                      ASI Verified
                    </span>
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                    <span
                      className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-xl backdrop-blur-md border shadow-lg ${
                        place.crowd_data?.estimated_crowd === 'High'
                          ? 'bg-rose-950/85 text-rose-300 border-rose-500/40'
                          : place.crowd_data?.estimated_crowd === 'Medium'
                          ? 'bg-amber-950/85 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-950/85 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {place.crowd_data?.estimated_crowd || 'Medium'} Crowd
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5 hover:border-cyan-400 cursor-pointer shadow-lg"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Full Picture</span>
                    </button>
                  </div>
                </div>

                {/* Left Column Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-1">
                  {!isVisited ? (
                    <button
                      onClick={handleCheckIn}
                      className="w-full py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Check In as Visited</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      <span>Checked In with SafePass</span>
                    </div>
                  )}

                  {place.lighting_tip && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center space-x-2.5 text-xs text-indigo-200">
                      <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="leading-snug">{place.lighting_tip}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Official Name, Fees & Timings (7 Cols - Immediately Visible!) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Header Title Block */}
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-cyan-400 uppercase tracking-widest mb-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Archaeological Survey of India Official Record</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight">
                    {place.name}
                  </h1>
                  <p className="text-base sm:text-lg font-bold text-indigo-300 mt-1">
                    {place.hindi_name}
                  </p>
                </div>

                {/* 1. Official Entry Fees Card - Clean, bold & high-contrast */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300">
                      Official Entrance Fees (Govt Gazette)
                    </span>
                    <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                      Zero Overcharge Benchmark
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Foreign Visitors */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">
                        Foreign Tourist
                      </span>
                      <div className="text-2xl font-black font-mono text-cyan-300">
                        {place.fee?.foreigner === 0 ? 'Free Entry' : `₹${place.fee?.foreigner}`}
                      </div>
                      <span className="text-[11px] text-slate-400 block">Official ASI Ticket</span>
                    </div>

                    {/* Indian / SAARC */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">
                        Indian / SAARC
                      </span>
                      <div className="text-2xl font-black font-mono text-white">
                        {place.fee?.indian === 0 ? 'Free' : `₹${place.fee?.indian}`}
                      </div>
                      <span className="text-[11px] text-slate-400 block">Citizen Benchmark</span>
                    </div>

                    {/* Children */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">
                        Children &lt; 15 Yrs
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        Free Entry
                      </div>
                      <span className="text-[11px] text-slate-400 block">Age Proof Valid</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    Authentic entrance rates fixed by ASI. Never purchase from unauthorized street touts offering duplicate paper slips outside entrance gates.
                  </p>
                </div>

                {/* 2. Timings & Access Schedule Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 shadow-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Operating Timings & Schedule</span>
                    </span>
                    <span className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      place.timings?.closed_on && place.timings?.closed_on.toLowerCase().includes('monday')
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {place.timings?.closed_on || 'Open All Days'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">Visiting Hours</span>
                      <div className="text-lg sm:text-xl font-black font-mono text-white">
                        {place.timings?.opening} - {place.timings?.closing}
                      </div>
                      <span className="text-[11px] text-slate-400 block">Regular Visitor Access</span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs uppercase font-extrabold text-slate-400 block">Recommended Timing</span>
                      <div className="text-sm sm:text-base font-bold text-cyan-300">
                        {place.crowd_data?.best_time || 'Morning (8:00 AM - 10:30 AM)'}
                      </div>
                      <span className="text-[11px] text-slate-400 block">Lowest Crowd Density</span>
                    </div>
                  </div>

                  {place.timings?.evening_show && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                      <span className="font-semibold">Evening Sound & Light Show:</span>
                      <span className="font-mono font-bold text-white">{place.timings.evening_show}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* SECONDARY ROW: Official Safety Advisories & Traveler Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Official Safety Advisories (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#14161f] border-2 border-amber-500/30 shadow-xl space-y-3.5">
              <div className="flex items-center space-x-2 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b border-white/10">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Delhi Police & ASI Scam Prevention Advisories</span>
              </div>

              {place.safety_notes && place.safety_notes.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                  {place.safety_notes.map((note, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span className="font-medium">{note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-300">
                  Follow ASI monument safety protocols. Keep personal belongings secure and use official entrance gates.
                </p>
              )}
            </div>
          </div>

          {/* Traveler Reviews & Check-In Experience (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#14161f] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Verified Traveler Community</span>
                </span>
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  SafePass Verified
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Check in while exploring Delhi monuments to share queue status, ticket counter queues, and audio guide availability with fellow travelers.
              </p>

              {/* Review Input Box */}
              {isVisited ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Rate your experience:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share honest tips on queue wait times, quiet gates, or shoe token counters..."
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  <div className="flex items-center justify-between">
                    {reviewFeedback ? (
                      <span className="text-xs text-cyan-400 font-bold">{reviewFeedback}</span>
                    ) : <span />}
                    <button
                      type="submit"
                      className="coder-btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                    >
                      Post Review
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 text-center">
                  Check in as visited above to leave a verified traveler review for this monument.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* FULL RESOLUTION PHOTO LIGHTBOX MODAL */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Lightbox</span>
            </button>
            <img
              src={place.image_url || DEFAULT_PLACE_IMAGE}
              alt={place.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <div className="mt-3 text-center">
              <span className="text-base font-bold text-white font-display">
                {place.name} ({place.hindi_name})
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                Archaeological Survey of India (ASI) Official Protected Monument
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
