import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Compass,
  RotateCcw,
  ShieldCheck,
  Video,
  Lightbulb,
  Car,
  ExternalLink,
  MapPin,
  Crosshair,
  AlertTriangle,
  Award,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  Calculator,
  Moon,
  Info,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import StatusBadge from '../components/common/StatusBadge';
import GoogleMapView from '../components/maps/GoogleMapView';
import { resolveLocation, searchLocations } from '../services/mapResolver';
import delhiZones from '../data/delhiZones.json';

// Popular Tourist & Transit Hubs for instant 1-tap destination selection
const QUICK_DESTINATIONS = [
  { name: 'Red Fort (Lal Qila)', lat: 28.6562, lng: 77.2410 },
  { name: 'Chandni Chowk, Old Delhi', lat: 28.6506, lng: 77.2303 },
  { name: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Qutub Minar, Mehrauli', lat: 28.5245, lng: 77.1855 },
  { name: 'Lotus Temple, Kalkaji', lat: 28.5535, lng: 77.2588 },
  { name: 'Connaught Place (CP)', lat: 28.6315, lng: 77.2167 },
  { name: 'IGI Airport Terminal 3', lat: 28.5562, lng: 77.0999 }
];

const INITIAL_CORRIDORS = [
  {
    id: 'route-0',
    index: 0,
    summary: 'Primary Arterial Corridor (Main Lit Highway)',
    distanceKm: 8.6,
    distanceText: '8.6 km',
    durationText: '22 mins',
    durationMinutes: 22,
    safetyScore: 'Optimal Safety (High Lighting & Police Beat)',
    safetyLevel: 'High',
    cctvCoverage: '90% Monitored',
    lighting: 'Continuous LED Illumination',
    policePresence: '24/7 PCR Beat Active',
    advisory: 'Recommended main arterial road with active round-the-clock Delhi Police patrol beats and emergency SOS kiosks.'
  },
  {
    id: 'route-1',
    index: 1,
    summary: 'Ring Road Arterial Bypass Corridor',
    distanceKm: 10.2,
    distanceText: '10.2 km',
    durationText: '26 mins',
    durationMinutes: 26,
    safetyScore: 'Moderate Safety (Arterial Bypass)',
    safetyLevel: 'Medium',
    cctvCoverage: '65% Monitored',
    lighting: 'Standard Highway Lighting',
    policePresence: 'Regular Highway Patrol',
    advisory: 'Wider multi-lane roadway bypassing dense commercial bottlenecks; steady vehicular traffic.'
  },
  {
    id: 'route-2',
    index: 2,
    summary: 'Historic Inner City Shortcut',
    distanceKm: 7.9,
    distanceText: '7.9 km',
    durationText: '32 mins',
    durationMinutes: 32,
    safetyScore: 'Caution (Narrow Alleys & Low Lighting)',
    safetyLevel: 'Caution',
    cctvCoverage: '28% Monitored',
    lighting: 'Intermittent / Dark Pockets',
    policePresence: 'Limited Police Access',
    advisory: 'Passes narrow market lanes; caution advised during late evening hours.'
  }
];

export default function SafeJourneyPage() {
  const { journey } = useTraveler();

  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'zones', 'night'
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const [selectedZone, setSelectedZone] = useState(delhiZones[1]); // Default to Chandni Chowk

  // Real-time Live GPS Coordinates State
  const [liveGps, setLiveGps] = useState(null);

  // Pickup Location Mode: 'live' (default) or 'manual'
  const [pickupMode, setPickupMode] = useState('live');
  const [pickupQuery, setPickupQuery] = useState('My Current Location (Live GPS)');
  const [manualPickupCoords, setManualPickupCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const pickupSearchDebounceRef = useRef(null);

  // Quick Hub target selector: 'destination' | 'pickup'
  const [quickHubTarget, setQuickHubTarget] = useState('destination');

  // Destination Selector & Disambiguation State
  const [destinationQuery, setDestinationQuery] = useState('Red Fort (Lal Qila)');
  const [destinationCoords, setDestinationCoords] = useState({
    lat: 28.6562,
    lng: 77.2410,
    name: 'Red Fort (Lal Qila)'
  });
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const searchDebounceRef = useRef(null);

  // Multi-Route Comparison State
  const [availableRoutes, setAvailableRoutes] = useState(INITIAL_CORRIDORS);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // 1. Continuous Live Geolocation Watcher
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveGps({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      (err) => {
        console.warn('[SafeJourney] Geolocation watch error:', err.code, err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Pickup Location Autocomplete & Search
  const handlePickupQueryChange = (val) => {
    setPickupQuery(val);
    if (!val || val.trim().length < 2) {
      setPickupSuggestions([]);
      return;
    }

    if (pickupSearchDebounceRef.current) clearTimeout(pickupSearchDebounceRef.current);
    pickupSearchDebounceRef.current = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const results = await searchLocations(val.trim(), liveGps);
        setPickupSuggestions(results);
      } catch (err) {
        console.warn('[SafeJourney] pickup searchLocations error:', err);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 300);
  };

  const handleSelectPickupSuggestion = (sug) => {
    setPickupQuery(sug.name);
    setManualPickupCoords({
      lat: sug.lat,
      lng: sug.lng,
      name: sug.formattedAddress || sug.name
    });
    setPickupMode('manual');
    setPickupSuggestions([]);
    setSelectedRouteIndex(0);
  };

  const handlePickupFormSubmit = async (e) => {
    e.preventDefault();
    if (!pickupQuery.trim()) return;

    setIsSearchingPickup(true);
    setPickupSuggestions([]);
    try {
      const bestMatch = await resolveLocation(pickupQuery.trim(), liveGps);
      if (bestMatch && bestMatch.lat && bestMatch.lng) {
        setManualPickupCoords({
          lat: bestMatch.lat,
          lng: bestMatch.lng,
          name: bestMatch.formattedAddress || bestMatch.name || pickupQuery.trim()
        });
        setPickupMode('manual');
        setSelectedRouteIndex(0);
      }
    } catch (err) {
      console.warn('[SafeJourney] Pickup form submit geocoding error:', err);
    } finally {
      setIsSearchingPickup(false);
    }
  };

  const handleSwitchToLiveGps = () => {
    setPickupMode('live');
    setPickupQuery('My Current Location (Live GPS)');
    setPickupSuggestions([]);
    setSelectedRouteIndex(0);
  };

  const handleSwitchToManual = () => {
    setPickupMode('manual');
    setQuickHubTarget('pickup');
    if (manualPickupCoords) {
      setPickupQuery(manualPickupCoords.name);
    } else if (liveGps) {
      setPickupQuery('My Current Location');
    } else {
      setPickupQuery('New Delhi Railway Station (NDLS)');
    }
  };

  const handleSwapLocations = () => {
    const prevOrigin = currentOrigin;
    const prevDest = destinationCoords;

    setDestinationQuery(prevOrigin.name);
    setDestinationCoords(prevOrigin);

    setPickupMode('manual');
    setPickupQuery(prevDest.name);
    setManualPickupCoords(prevDest);
    setSelectedRouteIndex(0);
  };

  const handleQuickHubClick = (dest) => {
    if (quickHubTarget === 'pickup' || pickupMode === 'manual') {
      setPickupMode('manual');
      setPickupQuery(dest.name);
      setManualPickupCoords({
        lat: dest.lat,
        lng: dest.lng,
        name: dest.name
      });
      setPickupSuggestions([]);
    } else {
      setDestinationQuery(dest.name);
      setDestinationCoords({
        lat: dest.lat,
        lng: dest.lng,
        name: dest.name
      });
      setDestSuggestions([]);
    }
    setSelectedRouteIndex(0);
  };

  // Official Delhi Auto Fare Benchmark Estimator
  const getEstimatedAutoFare = (distKm) => {
    if (!distKm || isNaN(distKm) || distKm <= 0) return { min: 30, max: 40 };
    const dist = parseFloat(distKm);
    const minFare = Math.round(30 + Math.max(0, dist - 1.5) * 10);
    const maxFare = Math.round(30 + Math.max(0, dist - 1.5) * 12.5);
    return { min: minFare, max: maxFare };
  };

  // Destination Search
  const handleDestinationQueryChange = (val) => {
    setDestinationQuery(val);
    if (!val || val.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const results = await searchLocations(val.trim(), liveGps);
        setDestSuggestions(results);
      } catch (err) {
        console.warn('[SafeJourney] searchLocations error:', err);
      } finally {
        setIsSearchingDest(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (sug) => {
    setDestinationQuery(sug.name);
    setDestinationCoords({
      lat: sug.lat,
      lng: sug.lng,
      name: sug.formattedAddress || sug.name
    });
    setDestSuggestions([]);
    setSelectedRouteIndex(0);
  };

  const handleDestinationFormSubmit = async (e) => {
    e.preventDefault();
    if (!destinationQuery.trim()) return;

    setIsSearchingDest(true);
    setDestSuggestions([]);
    try {
      const bestMatch = await resolveLocation(destinationQuery.trim(), liveGps);
      if (bestMatch && bestMatch.lat && bestMatch.lng) {
        setDestinationCoords({
          lat: bestMatch.lat,
          lng: bestMatch.lng,
          name: bestMatch.formattedAddress || bestMatch.name || destinationQuery.trim()
        });
        setSelectedRouteIndex(0);
      }
    } catch (err) {
      console.warn('[SafeJourney] Form submit geocoding error:', err);
    } finally {
      setIsSearchingDest(false);
    }
  };

  const handleRoutesCalculated = (routes) => {
    if (routes && routes.length > 0) {
      setAvailableRoutes(routes);
    }
  };

  // Active Origin
  const currentOrigin = (pickupMode === 'manual' && manualPickupCoords)
    ? manualPickupCoords
    : liveGps
      ? { lat: liveGps.lat, lng: liveGps.lng, name: 'My Current Location (Live GPS)' }
      : { lat: 28.6429, lng: 77.2195, name: 'New Delhi Railway Station (NDLS)' };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving`;

  const activeSelectedRoute = availableRoutes[selectedRouteIndex] || availableRoutes[0];

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR: Clean Title, Live Status & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Real-Time Police Beat & Safety Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Safe Track & <span className="coder-text-gradient">Corridor Radar</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Live GPS deviation monitoring, police-patrolled corridor evaluation, and official fare benchmarks.
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-lg backdrop-blur-md self-start md:self-auto shrink-0">
            {[
              { id: 'tracking', label: 'Live Tracking' },
              { id: 'zones', label: 'Zone Safety' },
              { id: 'night', label: 'Night Safe Routes' }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/25 ring-1 ring-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. CLEAN ORIGIN & DESTINATION ROUTING CONSOLE */}
        <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Box A: Pickup Location */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    pickupMode === 'manual' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {pickupMode === 'manual' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <Crosshair className="w-4 h-4 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {pickupMode === 'manual' ? 'Pickup Location (Manual)' : 'Start Point (Live GPS)'}
                  </span>
                </div>

                {pickupMode === 'live' ? (
                  <button
                    type="button"
                    onClick={handleSwitchToManual}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSwitchToLiveGps}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Use GPS</span>
                  </button>
                )}
              </div>

              {pickupMode === 'live' ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm sm:text-base font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                    My Current Location
                  </span>
                  {liveGps ? (
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {liveGps.lat}, {liveGps.lng}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400 font-medium animate-pulse">
                      Acquiring satellite fix...
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative pt-1">
                  <form onSubmit={handlePickupFormSubmit} className="flex items-center">
                    <input
                      type="text"
                      value={pickupQuery}
                      onChange={(e) => handlePickupQueryChange(e.target.value)}
                      placeholder="Enter pickup address or metro station..."
                      className="w-full pr-16 py-2 px-3 bg-[#161a24] border border-white/10 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingPickup}
                      className="absolute right-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isSearchingPickup ? '...' : 'Set'}
                    </button>
                  </form>

                  {/* Pickup Dropdown Suggestions */}
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#161a24] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-60 overflow-y-auto">
                      {pickupSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPickupSuggestion(sug)}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-white/10 flex items-center justify-between text-xs text-white transition-colors group"
                        >
                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-cyan-300 flex items-center space-x-1.5">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{sug.name}</span>
                            </div>
                            <span className="text-xs text-slate-400 truncate block max-w-xs pt-0.5">
                              {sug.formattedAddress}
                            </span>
                          </div>
                          {sug.distanceKm !== undefined && (
                            <span className="font-mono text-cyan-300 text-xs font-bold ml-2 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">
                              {sug.distanceKm} km
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapLocations}
                title="Swap Origin & Destination"
                className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-cyan-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md group"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Box B: Destination Location */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Destination Location
                  </span>
                </div>

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  title="Open in Google Maps application"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative pt-1">
                <form onSubmit={handleDestinationFormSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => handleDestinationQueryChange(e.target.value)}
                    placeholder="Search monument, landmark, or station..."
                    className="w-full pr-20 py-2 px-3 bg-[#161a24] border border-white/10 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingDest}
                    className="absolute right-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSearchingDest ? '...' : 'Route'}
                  </button>
                </form>

                {/* Destination Dropdown Suggestions */}
                {destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#161a24] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-60 overflow-y-auto">
                    {destSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-white/10 flex items-center justify-between text-xs text-white transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-cyan-300 flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{sug.name}</span>
                          </div>
                          <span className="text-xs text-slate-400 truncate block max-w-xs pt-0.5">
                            {sug.formattedAddress}
                          </span>
                        </div>
                        {sug.distanceKm !== undefined && (
                          <span className="font-mono text-cyan-300 text-xs font-bold ml-2 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">
                            {sug.distanceKm} km
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Quick Hub Chips Strip */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Quick Hubs:
            </span>
            {QUICK_DESTINATIONS.map((dest) => {
              const isSelected = destinationCoords.name.includes(dest.name.split(',')[0]);
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleQuickHubClick(dest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400/50 shadow-md font-bold'
                      : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  {dest.name.split(',')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MAIN RADAR MAP & MULTI-CORRIDOR EVALUATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Main Map Canvas (8 Cols) */}
          <div className="lg:col-span-8 coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between min-h-[520px]">
            
            {/* Map Top Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2.5 bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${pickupMode === 'manual' ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="text-white font-mono font-bold text-xs sm:text-sm">
                  {pickupMode === 'manual'
                    ? `Manual Origin: ${currentOrigin.name}`
                    : liveGps
                      ? `GPS Lat: ${liveGps.lat}, Lng: ${liveGps.lng} (±${liveGps.accuracy}m)`
                      : 'Acquiring Live Satellite Lock...'}
                </span>
                <span className="text-slate-600">•</span>
                <span className={pickupMode === 'manual' ? 'text-indigo-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {pickupMode === 'manual' ? 'Manual Mode' : '24/7 Monitored'}
                </span>
              </div>

              {/* Simulation Button */}
              <button
                id="btn-simulate-deviation"
                onClick={() => setSimulatedDeviation(!simulatedDeviation)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  simulatedDeviation
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{simulatedDeviation ? 'Reset Corridor' : 'Simulate Deviation (>500m)'}</span>
              </button>
            </div>

            {/* Interactive Google Map with Route Overlays */}
            <div className="relative min-h-[440px] rounded-2xl overflow-hidden border border-white/[0.08]">
              <GoogleMapView
                showRoute={true}
                simulatedDeviation={simulatedDeviation}
                liveTracking={true}
                onLocationUpdate={(coords) => setLiveGps(coords)}
                origin={currentOrigin}
                destination={destinationCoords}
                selectedRouteIndex={selectedRouteIndex}
                onRoutesFound={handleRoutesCalculated}
                onRouteSelect={(idx) => setSelectedRouteIndex(idx)}
                allowAlternatives={true}
              />
            </div>

            {/* Map Telemetry Footer */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Police PCR beat coverage & continuous street lighting telemetry active.</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                Safe Corridor Verified
              </span>
            </div>
          </div>

          {/* Right Corridor Evaluation & Telemetry Panels (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* PANEL 1: EVALUATED CORRIDORS (Interactive Corridor Selector) */}
            <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    Corridor Safety Ranking
                  </h3>
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  {availableRoutes.length} Evaluated
                </span>
              </div>

              {/* Corridor Cards */}
              <div className="space-y-3">
                {availableRoutes.map((route, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  const isOptimal = route.safetyLevel === 'High' || idx === 0;
                  const isCaution = route.safetyLevel === 'Caution' || idx === 2;

                  return (
                    <div
                      key={route.id || idx}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? isOptimal
                            ? 'bg-emerald-500/15 border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                            : 'bg-cyan-500/15 border-cyan-500/70 ring-1 ring-cyan-500/40 shadow-lg'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Route {idx + 1}: {idx === 0 ? 'Primary' : `Alt ${idx}`}
                          </span>
                        </div>

                        {isOptimal ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center space-x-1">
                            <Award className="w-3 h-3" />
                            <span>Safest</span>
                          </span>
                        ) : isCaution ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold">
                            Caution
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                            Moderate
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white mb-2 leading-snug line-clamp-1">
                        {route.summary}
                      </h4>

                      {/* Distance, ETA, & Fare Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05]">
                          <span className="text-slate-400 text-xs block">DISTANCE & TIME</span>
                          <span className="font-mono font-bold text-cyan-300 text-xs">
                            {route.distanceText} • {route.durationText}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05]">
                          <span className="text-slate-400 text-xs block">EST. AUTO FARE</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            ₹{getEstimatedAutoFare(route.distanceKm).min} – ₹{getEstimatedAutoFare(route.distanceKm).max}
                          </span>
                        </div>
                      </div>

                      {/* Safety Metrics */}
                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center justify-between py-0.5">
                          <span className="flex items-center space-x-1.5 text-slate-400">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Lighting:</span>
                          </span>
                          <span className="font-semibold text-slate-200">{route.lighting}</span>
                        </div>

                        <div className="flex items-center justify-between py-0.5">
                          <span className="flex items-center space-x-1.5 text-slate-400">
                            <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Police Beat:</span>
                          </span>
                          <span className="font-semibold text-slate-200">{route.policePresence}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANEL 2: ACTIVE JOURNEY MONITOR & TELEMETRY */}
            {activeTab === 'tracking' && (
              <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Telemetry Status</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    {journey?.journey_code || 'TM-DEL-2026'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">Selected Route:</span>
                    <strong className="text-cyan-300 truncate max-w-[180px]">
                      {activeSelectedRoute?.summary}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">ETA & Distance:</span>
                    <strong className="text-white font-mono">
                      {activeSelectedRoute?.distanceText} • {activeSelectedRoute?.durationText}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">Corridor Threshold:</span>
                    <strong className="text-slate-200 font-mono">&gt;500m off track</strong>
                  </div>
                </div>

                {/* Soft Deviation Alert Notice */}
                {simulatedDeviation && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2 font-bold text-amber-400 text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Route Deviation Warning</span>
                    </div>
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      Vehicle has veered &gt;500m off the monitored safe corridor. Verify route with driver or tap Delhi Police SOS 112 below.
                    </p>
                  </div>
                )}

                {/* Gesture SOS Prompt */}
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                  <strong className="text-white block font-bold">Emergency Quick Dial</strong>
                  <p className="text-xs text-slate-400">
                    Shake phone 3 times or tap below to immediately connect to Delhi Police Central Control.
                  </p>
                  <a
                    href="tel:112"
                    className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial Emergency 112</span>
                  </a>
                </div>
              </div>
            )}

            {/* PANEL 3: ZONE RISK OVERLAY */}
            {activeTab === 'zones' && (
              <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                    District Safety Overlay
                  </h3>
                  <StatusBadge status="Official" />
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {delhiZones.map((zone) => (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedZone?.id === zone.id
                          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md ring-1 ring-indigo-400/30'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white">{zone.name}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            zone.risk_level === 'Green'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {zone.risk_level} Zone
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{zone.advisory_text}</p>
                      <span className="text-xs text-slate-500 block mt-1 font-medium">Source: {zone.source_label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL 4: NIGHT-SAFE ROUTE RANKER */}
            {activeTab === 'night' && (
              <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <h3 className="text-sm font-bold text-indigo-400 font-display uppercase tracking-wider flex items-center space-x-1.5">
                    <Moon className="w-4 h-4" />
                    <span>Night-Safe Corridor Ranker</span>
                  </h3>
                  <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    20:00 - 06:00
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Ranks routes by continuous street lighting and active Police beat kiosks over dark shortcuts.
                </p>

                <div className="space-y-3">
                  {availableRoutes.map((route, idx) => (
                    <div
                      key={route.id || idx}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedRouteIndex === idx
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/30'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-bold text-white">{route.summary}</span>
                        {idx === 0 && (
                          <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                            Top Choice
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mb-1">
                        {route.safetyScore}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mb-1.5">
                        {route.distanceText} • {route.durationText} • {route.cctvCoverage}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{route.advisory}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
