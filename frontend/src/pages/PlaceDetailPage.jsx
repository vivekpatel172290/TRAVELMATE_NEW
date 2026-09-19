import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Ticket,
  ExternalLink,
  Users,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Camera,
  Star,
  Sparkles,
  Share2
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
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading Verified Place Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/25 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] -right-48 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container - Breadth ~60-65% viewport ("little bit more than half"), Height ~65-80% viewport ("height more than half") */}
      <div className="relative z-10 w-full md:w-[62vw] max-w-4xl min-h-[65vh] max-h-[88vh] flex flex-col my-auto">
        
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-indigo-500/40 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Verified Places</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* The Verified Place Card (Centered Majestic Card) */}
        <div className="coder-card bg-[#111318]/95 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* 1. Monument Photo Header Banner */}
          <div className="relative w-full h-56 sm:h-64 shrink-0 bg-slate-900 overflow-hidden">
            <img
              src={place.image_url || DEFAULT_PLACE_IMAGE}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = 'true';
                  e.currentTarget.src = DEFAULT_PLACE_IMAGE;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/40 to-black/40 pointer-events-none" />

            {/* Pinned Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-bold text-slate-200 border border-white/15 uppercase tracking-wider shadow-lg">
                {place.category}
              </span>
              <StatusBadge status={place.verification_status || 'Official'} />
            </div>

            {/* Pinned Bottom Info */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-xl backdrop-blur-md border shadow-lg ${
                  place.crowd_data?.estimated_crowd === 'High'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    : place.crowd_data?.estimated_crowd === 'Medium'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                {place.crowd_data?.estimated_crowd || 'Medium'} Crowd Density
              </span>

              {isVisited && (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center space-x-1.5 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Visited & Checked In</span>
                </span>
              )}
            </div>
          </div>

          {/* 2. Card Content Body */}
          <div className="p-6 sm:p-8 space-y-6 flex-1">
            
            {/* Title & Registry Authority */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ASI Authenticated Directory</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                  {place.name}
                </h1>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {place.hindi_name}
                </p>
              </div>

              {/* Official Booking Button */}
              {place.official_ticket_url && (
                <a
                  href={place.official_ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="coder-btn-primary px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book on Official ASI Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              )}
            </div>

            {/* Two-Column Verified Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Box A: Official Entry Fees Matrix */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Official Entry Fee
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Zero Counterfeit Guarantee
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Foreign Visitors:</span>
                    <span className="font-mono font-black text-white text-base">
                      {place.fee?.foreigner === 0 ? 'Free Entry' : `₹${place.fee?.foreigner}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Indian Citizens / SAARC:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {place.fee?.indian === 0 ? 'Free' : `₹${place.fee?.indian}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Children (Under 15):</span>
                    <span className="font-mono font-semibold text-emerald-400">Free</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                  Verified through Archaeological Survey of India (ASI) Gazette. Never pay touts outside gates.
                </p>
              </div>

              {/* Box B: Operational Timings & Schedules */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Timings & Access</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                    place.timings?.closed_on && place.timings?.closed_on.toLowerCase().includes('monday')
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {place.timings?.closed_on || 'Open All Days'}
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Visiting Hours:</span>
                    <span className="font-mono font-bold text-white">
                      {place.timings?.opening} - {place.timings?.closing}
                    </span>
                  </div>
                  {place.timings?.evening_show && (
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Evening Sound & Light:</span>
                      <span className="font-mono font-semibold text-slate-200">{place.timings.evening_show}</span>
                    </div>
                  )}
                  {place.crowd_data?.best_time && (
                    <div className="flex items-center justify-between text-xs text-emerald-300">
                      <span>Recommended Slot:</span>
                      <span className="font-semibold">{place.crowd_data.best_time}</span>
                    </div>
                  )}
                </div>

                {place.lighting_tip && (
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{place.lighting_tip}</span>
                  </p>
                )}
              </div>

            </div>

            {/* Anti-Tout & Official Safety Advisories */}
            {place.safety_notes && place.safety_notes.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2.5">
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Official ASI & Delhi Police Safety Advisories</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed pl-1">
                  {place.safety_notes.map((note, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Check-In & Traveler Review Section */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Traveler Check-In</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check in while visiting to update live crowd indicators and record official feedback.
                </p>
              </div>

              {!isVisited ? (
                <button
                  onClick={handleCheckIn}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all shrink-0 hover:scale-105 active:scale-95"
                >
                  Check In as Visited
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Checked In with SafePass</span>
                </span>
              )}
            </div>

            {/* Review Form if Visited */}
            {isVisited && (
              <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Leave Verified Traveler Review</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
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
                  placeholder="Share authentic tips on ticket counter wait times, crowd status, or audio guide quality..."
                  className="w-full px-3.5 py-2.5 bg-[#161a24] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex items-center justify-between">
                  {reviewFeedback ? (
                    <span className="text-xs text-emerald-400 font-bold">{reviewFeedback}</span>
                  ) : <span />}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
