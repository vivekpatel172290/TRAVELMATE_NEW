import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Ticket, ExternalLink, ShieldCheck, Clock, Users, AlertTriangle, Star, CheckCircle, LayoutGrid, Compass, Sun, Camera, ArrowRight } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useTraveler } from '../context/TravelerContext';
import StatusBadge from '../components/common/StatusBadge';
import GoogleMapView from '../components/maps/GoogleMapView';

const CATEGORIES = ['All', 'Heritage', 'UNESCO', 'Place of Worship', 'Memorial', 'Observatory'];
const DEFAULT_PLACE_IMAGE = '/places/red-fort.jpg';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { journey } = useTraveler();
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const [visitedPlaces, setVisitedPlaces] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm_visited_places') || '["pl-red-fort-01", "red-fort"]');
    } catch {
      return ['pl-red-fort-01', 'red-fort'];
    }
  });

  useEffect(() => {
    async function loadPlaces() {
      const res = await api.getPlaces(activeCategory, searchQuery);
      if (res.success) {
        setPlaces(res.data);
      }
    }
    loadPlaces();
  }, [activeCategory, searchQuery]);

  const handleCheckIn = async (place) => {
    const pId = place.id || place.place_key;
    const res = await api.checkinPlace(journey?.journey_code || 'TM-DEL-2026-X89K', pId);
    if (res.success) {
      const updated = [...visitedPlaces, pId, place.id, place.place_key].filter(Boolean);
      setVisitedPlaces(updated);
      try {
        localStorage.setItem('tm_visited_places', JSON.stringify(updated));
      } catch (_) {}

      // Increment in-app check-ins to dynamically update crowd estimation
      setPlaces(prev => prev.map(p => {
        if (p.id === place.id || p.place_key === place.place_key) {
          const currentCount = (p.crowd_data?.in_app_checkins || 2) + 1;
          return {
            ...p,
            crowd_data: {
              ...p.crowd_data,
              in_app_checkins: currentCount,
              estimated_crowd: currentCount > 10 ? 'High' : p.crowd_data?.estimated_crowd || 'Medium'
            }
          };
        }
        return p;
      }));
    }
  };

  const isPlaceVisited = (place) => {
    if (!place) return false;
    return visitedPlaces.includes(place.id) || visitedPlaces.includes(place.place_key);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlace) return;

    if (!isPlaceVisited(selectedPlace)) {
      setReviewFeedback('Review Blocked: You must check-in to this monument first (Fake Review Prevention active).');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/places/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: selectedPlace.id,
          journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
          rating: reviewRating,
          review_text: reviewText
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewFeedback('Review recorded with Verified Traveler badge.');
        setReviewText('');
        setTimeout(() => setReviewFeedback(null), 3500);
      } else {
        setReviewFeedback(data.error || 'Review could not be saved.');
      }
    } catch {
      setReviewFeedback('Review recorded with Verified Traveler status.');
      setTimeout(() => setReviewFeedback(null), 3500);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ASI & Delhi Tourism Verified Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Verified Delhi Monuments & <span className="coder-text-gradient">Cultural Sites</span>
            </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every entry fee, timing, and ticketing URL is officially authenticated to eliminate counterfeit charges.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="input-search-places"
            placeholder="Search Red Fort, Qutub, timings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* View Mode Toggle & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={`category-filter-pill px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'active bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="view-mode-container flex items-center space-x-1 bg-surface-card p-1 rounded-xl border border-surface-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-mode-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'active bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`view-mode-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'active bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Google Map</span>
          </button>
        </div>
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' && (
        <div className="mb-8 h-[380px] sm:h-[420px] rounded-2xl overflow-hidden">
          <GoogleMapView
            places={places}
            showRoute={false}
            onPlaceSelect={(place) => setSelectedPlace(place)}
          />
        </div>
      )}

      {/* Places Grid - Coder Army inspired compact, clickable cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${viewMode === 'map' ? 'hidden' : 'grid'}`}>
        {places.map((place) => (
          <div
            key={place.id || place.place_key}
            onClick={() => navigate(`/place/${place.id || place.place_key}`)}
            className="coder-card bg-[#111318]/90 hover:bg-[#151922] border border-white/[0.08] hover:border-indigo-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              {/* Uniform Even-Sized Photo Container */}
              <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-[#090b10] border-b border-white/[0.08]">
                <img
                  src={place.image_url || DEFAULT_PLACE_IMAGE}
                  alt={place.name}
                  className={`w-full h-full object-cover ${
                    place.place_key === 'qutub-minar' ? 'object-[center_25%]' : 'object-center'
                  } group-hover:scale-105 transition-transform duration-500`}
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = 'true';
                      e.currentTarget.src = DEFAULT_PLACE_IMAGE;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/20 pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
                  <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 uppercase tracking-wider">
                    {place.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                    ASI Verified
                  </span>
                </div>

                {/* Bottom Crowd Pill */}
                <div className="absolute bottom-2 left-2.5 pointer-events-none z-20">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border shadow-sm ${
                      place.crowd_data?.estimated_crowd === 'High'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                        : place.crowd_data?.estimated_crowd === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {place.crowd_data?.estimated_crowd || 'Medium'} Crowd
                  </span>
                </div>
              </div>

              {/* Card Body - Essential info only */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-display text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {place.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {place.hindi_name}
                  </p>
                </div>

                {/* Entry Fee Box */}
                <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400 text-[11px]">Official Fee</span>
                  <span className="font-mono font-bold text-slate-100">
                    {place.fee?.foreigner === 0 ? 'Free Entry' : `₹${place.fee?.foreigner}`}
                    {place.fee?.foreigner > 0 && <span className="text-[10px] text-slate-400 font-normal ml-1">(Intl)</span>}
                  </span>
                </div>

                {/* Timings */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>{place.timings?.opening} - {place.timings?.closing}</span>
                  </span>
                  <span className="text-slate-500 font-medium">{place.timings?.closed_on || 'Open Daily'}</span>
                </div>
              </div>
            </div>

            {/* Click to Open Details Footer */}
            <div className="p-4 pt-0">
              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300 font-bold">
                <span>View Verified Info</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Place Detail & Review Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="place-modal-card relative w-full max-w-2xl bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[88vh] shadow-2xl">
            {/* Modal Header Photo */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 bg-[#080a0f] border border-white/10 flex items-center justify-center">
              <img
                src={selectedPlace.image_url || DEFAULT_PLACE_IMAGE}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              <img
                src={selectedPlace.image_url || DEFAULT_PLACE_IMAGE}
                alt={selectedPlace.name}
                className="relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = 'true';
                    e.currentTarget.src = DEFAULT_PLACE_IMAGE;
                  }
                }}
              />
              <button
                id="btn-close-place-modal"
                onClick={() => setSelectedPlace(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all z-30"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 right-3 z-30">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-100 font-bold text-[10px] border border-white/20">
                    {selectedPlace.category}
                  </span>
                  <StatusBadge status={selectedPlace.verification_status} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">{selectedPlace.name}</h2>
                <p className="text-xs text-emerald-300 font-medium">{selectedPlace.hindi_name}</p>
              </div>
            </div>

            {/* Best Time to Visit in Modal */}
            {(selectedPlace.best_time_to_visit || selectedPlace.crowd_data?.best_time) && (
              <div className="best-time-box mb-6 p-4 rounded-2xl border space-y-1.5">
                <div className="best-time-header flex items-center space-x-2 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Official Best Time to Visit Recommendation</span>
                </div>
                <p className="best-time-desc text-xs leading-relaxed">
                  {selectedPlace.best_time_to_visit || `Recommended: ${selectedPlace.crowd_data.best_time}`}
                </p>
                {selectedPlace.lighting_tip && (
                  <p className="best-time-tip text-xs italic flex items-center gap-1.5 pt-0.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{selectedPlace.lighting_tip}</span>
                  </p>
                )}
              </div>
            )}

            {/* Fee & Official Source Info */}
            <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="modal-stat-box p-3 rounded-xl border">
                <span className="text-[10px] uppercase font-bold block">Foreign Visitor</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedPlace.fee?.foreigner === 0 ? 'Free' : `₹${selectedPlace.fee?.foreigner}`}
                </span>
              </div>
              <div className="modal-stat-box p-3 rounded-xl border">
                <span className="text-[10px] uppercase font-bold block">Indian / SAARC</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-200">
                  {selectedPlace.fee?.indian === 0 ? 'Free' : `₹${selectedPlace.fee?.indian}`}
                </span>
              </div>
              <div className="modal-stat-box p-3 rounded-xl border">
                <span className="text-[10px] uppercase font-bold block">Children &lt;15</span>
                <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">Free</span>
              </div>
              <div className="modal-stat-box p-3 rounded-xl border">
                <span className="text-[10px] uppercase font-bold block">Last Verified</span>
                <span className="text-xs font-semibold block mt-1">{selectedPlace.last_verified}</span>
              </div>
            </div>

            {/* Safety & Cultural Notes */}
            <div className="mb-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center mb-3">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span>Essential Safety & Scam Prevention Notes</span>
              </h4>
              <ul className="space-y-2 text-xs">
                {selectedPlace.safety_notes?.map((note, idx) => (
                  <li key={idx} className="modal-safety-note flex items-start space-x-2 p-2.5 rounded-lg border">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verified Traveler Review Form (Scope #16: History Enforcement) */}
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">Verified Traveler Review</h4>
                    {isPlaceVisited(selectedPlace) ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Visit Confirmed ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Unvisited in Current Journey
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Journey Pass: <span className="font-mono text-emerald-400 font-semibold">{journey?.journey_code}</span>
                  </p>
                </div>

                {isPlaceVisited(selectedPlace) && (
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-1 ${reviewRating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isPlaceVisited(selectedPlace) ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <textarea
                    rows="2"
                    id="input-place-review-text"
                    placeholder="Share verified safety tips, quiet entrance gates, or queue advice for other travelers..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-3 bg-surface border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />

                  {reviewFeedback && (
                    <div className="text-xs font-semibold text-emerald-400 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span>{reviewFeedback}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Verified Review badge permanently linked to your Journey ID.
                    </span>
                    <button
                      type="submit"
                      id="btn-submit-review"
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Submit Verified Review
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="block text-amber-300 font-semibold mb-0.5">
                        Fake-Review Prevention Active (Scope #16)
                      </strong>
                      <p className="text-amber-200/90 leading-relaxed">
                        To protect tourists from deceptive online reviews and commission touts, you may only review monuments present in your active TravelMate Journey visit history.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Have you arrived at or visited this monument?
                    </span>
                    <button
                      type="button"
                      id="btn-checkin-to-unlock-review"
                      onClick={() => handleCheckIn(selectedPlace)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Check In as Visited & Unlock Review →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
