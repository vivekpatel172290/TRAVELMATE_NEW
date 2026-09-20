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
  PhoneCall,
  Activity,
  Radio
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
              Safe Route & <span className="coder-text-gradient">Corridor Radar</span>
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
                    pickupMode === 'manual' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {pickupMode === 'manual' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
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
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all"
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
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
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
            <div className="flex items-center space-x-1.5 shrink-0 mr-1 text-[11px] font-bold uppercase text-slate-400">
              <span>Quick Hubs</span>
              <span className="text-slate-500">(set as:</span>
              <button
                type="button"
                id="btn-quick-target-dest"
                onClick={() => setQuickHubTarget('destination')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  quickHubTarget === 'destination'
                    ? 'bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🚩 Destination
              </button>
              <span className="text-slate-600">/</span>
              <button
                type="button"
                id="btn-quick-target-pickup"
                onClick={() => {
                  setQuickHubTarget('pickup');
                  setPickupMode('manual');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  quickHubTarget === 'pickup'
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📍 Pickup
              </button>
              <span className="text-slate-500">):</span>
            </div>

            {QUICK_DESTINATIONS.map((dest) => {
              const isDest = destinationCoords.name.includes(dest.name.split(',')[0]);
              const isPickup = currentOrigin.name.includes(dest.name.split(',')[0]);
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleQuickHubClick(dest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isPickup
                      ? 'bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-sm font-bold ring-1 ring-blue-400/30'
                      : isDest
                        ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-sm font-bold ring-1 ring-red-400/30'
                        : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                  title={`Click to set as ${quickHubTarget === 'pickup' ? 'Pickup Location' : 'Destination'}`}
                >
                  {dest.name.split(',')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CORRIDOR EVALUATION CARDS SECTION (POSITIONED ABOVE MAP) */}
        {activeTab === 'tracking' && (
          <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center space-x-2">
                    <span>Multi-Route Safety Comparison</span>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {availableRoutes.length} Corridors Evaluated
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    All routes are rendered on the live map canvas. Click any corridor card to select and highlight it.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Route 1 Recommended</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-xl border border-white/10 hidden md:inline-flex">
                  {journey?.journey_code || 'TM-DEL-2026'}
                </span>
              </div>
            </div>

            {/* Responsive 3-column Corridor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 relative z-10">
              {availableRoutes.map((route, idx) => {
                const isSelected = selectedRouteIndex === idx;
                const isOptimal = route.safetyLevel === 'High' || idx === 0;
                const isCaution = route.safetyLevel === 'Caution' || idx === 2;

                return (
                  <div
                    key={route.id || idx}
                    id={`card-route-option-${idx}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-200 relative group ${
                      isSelected
                        ? isOptimal
                          ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#14161c] border-indigo-500/70 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/20'
                          : 'bg-cyan-500/15 border-cyan-500/70 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/10'
                        : 'bg-[#151922]/80 hover:bg-[#1c2230] border-white/[0.08] hover:border-white/20 opacity-90 hover:opacity-100 shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Header: Radio dot + Route Label + Status Badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500 group-hover:border-slate-400'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </span>
                          <span className="text-xs font-bold text-white tracking-wide">
                            Route {idx + 1}: {idx === 0 ? 'Primary Corridor' : `Alternative ${idx}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {isOptimal ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span>Safest Route</span>
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCaution
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {isCaution ? 'Caution Advised' : 'Moderate Safety'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Route Summary */}
                      <h4 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-1">
                        {route.summary}
                      </h4>

                      {/* Distance & Duration Pills */}
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 mb-2.5">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {route.distanceText}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {route.durationText}
                        </span>
                      </div>

                      {/* Est. Auto Fare Box */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs mb-3">
                        <span className="text-slate-300 flex items-center gap-1.5 text-[11px] font-medium">
                          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Est. Auto Fare:</span>
                        </span>
                        <span className="font-mono font-bold text-cyan-300 text-xs">
                          ₹{getEstimatedAutoFare(route.distanceKm).min} – ₹{getEstimatedAutoFare(route.distanceKm).max}
                        </span>
                      </div>

                      {/* 3 Telemetry Breakdown Rows: CCTV, Lighting, Police Beat */}
                      <div className="space-y-1.5 text-xs mb-3.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>CCTV Coverage:</span>
                          </span>
                          <span className="font-semibold text-slate-200 text-[11px]">
                            {route.cctvCoverage || '88% Monitored'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Lighting Quality:</span>
                          </span>
                          <span className="font-semibold text-slate-200 text-[11px] text-right truncate max-w-[150px]">
                            {route.lighting}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <Car className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Police Beat:</span>
                          </span>
                          <span className="font-semibold text-slate-200 text-[11px] text-right truncate max-w-[150px]">
                            {route.policePresence}
                          </span>
                        </div>
                      </div>

                      {/* Route Advisory text */}
                      {route.advisory && (
                        <p className="text-[11px] text-slate-300 leading-relaxed mb-3.5 line-clamp-2">
                          {route.advisory}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRouteIndex(idx);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isSelected
                          ? isOptimal
                            ? 'coder-btn-primary text-white shadow-indigo-600/30'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Highlighted on Map' : 'Select This Corridor'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Soft Deviation Warning Alert Banner */}
            {simulatedDeviation && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xl relative z-10">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 text-sm font-bold block">Route Deviation Warning (&gt;500m Off Track)</strong>
                    <p className="text-xs text-amber-200/90 mt-0.5">
                      Vehicle has veered &gt;500m off the monitored safe corridor. Verify route with driver or connect immediately to Delhi Police 112.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:112"
                  className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Dial Police 112</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* District Safety Overlay Section (Active when 'zones' tab chosen) */}
        {activeTab === 'zones' && (
          <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-4 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display tracking-wide">
                    District Safety Overlay & Police Jurisdiction
                  </h3>
                  <p className="text-xs text-slate-400">
                    Delhi Police categorized zones based on real-time lighting, PCR beats, and safety index.
                  </p>
                </div>
              </div>
              <StatusBadge status="Official" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {delhiZones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedZone?.id === zone.id
                      ? 'bg-indigo-600/20 border-indigo-500/70 shadow-lg ring-2 ring-indigo-400/40'
                      : 'bg-[#151922]/80 hover:bg-[#1c2230] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{zone.name}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        zone.risk_level === 'Green'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {zone.risk_level} Zone
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{zone.advisory_text}</p>
                  <span className="text-xs text-slate-500 block mt-2 font-medium">Source: {zone.source_label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Night-Safe Corridor Ranker Section (Active when 'night' tab chosen) */}
        {activeTab === 'night' && (
          <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-4 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-indigo-300 font-display tracking-wide flex items-center space-x-2">
                    <span>Night-Safe Corridor Ranker</span>
                    <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      20:00 – 06:00
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Routes prioritized by continuous street illumination, CCTV density, and 24/7 PCR kiosk presence.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRoutes.map((route, idx) => {
                const isSelected = selectedRouteIndex === idx;
                return (
                  <div
                    key={route.id || idx}
                    onClick={() => setSelectedRouteIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#14161c] border-indigo-500/70 shadow-lg ring-2 ring-indigo-400/40'
                        : 'bg-[#151922]/80 hover:bg-[#1c2230] border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white truncate max-w-[200px]">{route.summary}</span>
                      {idx === 0 && (
                        <span className="text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Top Choice
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-400 font-semibold mb-1">
                      {route.safetyScore}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mb-2">
                      {route.distanceText} • {route.durationText} • {route.cctvCoverage}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{route.advisory}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. RADAR MAP & ACTIVE JOURNEY MONITOR COCKPIT (BESIDE EACH OTHER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left / Primary Column: Radar Map Canvas (lg:col-span-7 xl:col-span-8) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col h-full relative overflow-hidden space-y-3">
              
              {/* Map Top Status Strip HUD */}
              <div className="flex flex-wrap items-center justify-between gap-3 z-10 pb-3 border-b border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center space-x-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${pickupMode === 'manual' ? 'bg-blue-400 ring-2 ring-blue-400/30' : 'bg-emerald-400 radar-pulse'}`} />
                    <span className="text-slate-200 font-mono font-bold text-xs sm:text-sm" id="label-live-gps-coords">
                      {pickupMode === 'manual'
                        ? `Pickup: ${currentOrigin.name}`
                        : liveGps
                          ? `GPS Lat: ${liveGps.lat}, Lng: ${liveGps.lng} (±${liveGps.accuracy}m)`
                          : 'Acquiring Real-Time Live GPS Fix...'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className={pickupMode === 'manual' ? 'text-blue-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {pickupMode === 'manual' ? 'Manual Origin Mode' : 'Live GPS Monitored'}
                    </span>
                  </div>

                  {/* Active Route Indicator Pill */}
                  <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-medium">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Active:</span>
                    <strong className="text-white font-bold truncate max-w-[180px]">
                      {activeSelectedRoute?.summary || `Route ${selectedRouteIndex + 1}`}
                    </strong>
                    {activeSelectedRoute?.distanceText && (
                      <span className="text-cyan-400 font-mono">({activeSelectedRoute.distanceText} • {activeSelectedRoute.durationText})</span>
                    )}
                  </div>
                </div>

                {/* Map Actions: Deviation Simulation */}
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-simulate-deviation"
                    onClick={() => setSimulatedDeviation(!simulatedDeviation)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      simulatedDeviation
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{simulatedDeviation ? 'Reset Corridor' : 'Simulate Deviation (>500m)'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Google Map with Route Overlays */}
              <div className="relative w-full h-[360px] sm:h-[390px] lg:h-[430px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-slate-950 flex flex-col flex-1">
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
                  hideSearch={true}
                  hideRouteSelector={true}
                  hideBottomStatus={true}
                />
              </div>

              {/* Map Telemetry Footer */}
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-[11px]">Multi-route safety layer powered by Police beats & street lighting telemetry.</span>
                </div>
                <div className="flex items-center space-x-2.5 shrink-0">
                  <span className="text-slate-400 font-mono text-[10px]">
                    Tolerance: <strong className="text-slate-200">&gt;500m off route</strong>
                  </span>
                  <StatusBadge status="Official" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Journey Monitor (lg:col-span-5 xl:col-span-4) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <div className="coder-card bg-[#111318]/90 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between h-full space-y-3.5">
              
              {/* Ambient Glowing Gradient Orbs */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
                    <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                      Active Journey Monitor
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Real-Time ERSS 112 Telemetry</p>
                  </div>
                </div>
                <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-mono font-bold text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 radar-pulse" />
                  <span>{journey?.journey_code || 'TM-DEL-2026-X89K'}</span>
                </span>
              </div>

              {/* Real-Time Telemetry Breakdown Box */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs relative z-10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Journey Pass:</span>
                  <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[11px]">
                    {journey?.journey_code || 'TM-DEL-2026-X89K'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Start / Pickup:</span>
                  <span className={`font-bold text-right truncate max-w-[170px] sm:max-w-[200px] text-[11px] ${pickupMode === 'manual' ? 'text-blue-400' : 'text-cyan-400'}`}>
                    {currentOrigin.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Live GPS Status:</span>
                  <span className={`font-mono font-bold text-[11px] flex items-center space-x-1.5 ${liveGps ? 'text-cyan-400' : 'text-amber-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${liveGps ? 'bg-emerald-400 radar-pulse' : 'bg-amber-400'}`} />
                    <span>{liveGps ? `Active (Lock ±${liveGps.accuracy}m)` : 'Acquiring Satellite Lock...'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Active Destination:</span>
                  <span className="font-bold text-red-400 text-right truncate max-w-[170px] sm:max-w-[200px] text-[11px]">
                    {destinationCoords.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Selected Corridor:</span>
                  <span className="font-bold text-cyan-300 text-right truncate max-w-[170px] sm:max-w-[200px] text-[11px]">
                    {activeSelectedRoute?.summary || `Route ${selectedRouteIndex + 1}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Est. Distance & ETA:</span>
                  <span className="font-mono font-bold text-white text-[11px]">
                    {activeSelectedRoute?.distanceText ? `${activeSelectedRoute.distanceText} • ${activeSelectedRoute.durationText}` : 'Calculating...'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Est. Auto Fare:</span>
                  <span className="font-mono font-bold text-cyan-400 text-xs">
                    ₹{getEstimatedAutoFare(activeSelectedRoute?.distanceKm || 8).min} – ₹{getEstimatedAutoFare(activeSelectedRoute?.distanceKm || 8).max}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Deviation Tolerance:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    &gt;500m for &gt;3 mins
                  </span>
                </div>
              </div>

              {/* Soft Corridor Deviation Alert Banner (Dynamic) */}
              {simulatedDeviation && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 animate-in fade-in duration-300 relative z-10 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                    <span>Soft Corridor Deviation Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Vehicle has departed from monitored safe corridor by &gt;500m. Please verify route with driver or dial Police 112 below.
                  </p>
                  <a
                    href="tel:112"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial Police 112</span>
                  </a>
                </div>
              )}

              {/* Silent Gesture SOS Feature Card */}
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Silent Gesture SOS Active</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">112 Telemetry</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Rapidly shake your phone 3 times or tap below to silently transmit an emergency telemetry packet with live GPS to Delhi Police (112).
                </p>
              </div>

              {/* Quick Action Dial Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
                <a
                  href="tel:112"
                  className="py-2.5 px-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-red-600/25 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Police 112</span>
                </a>
                <a
                  href="tel:1363"
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-white" />
                  <span>Tourist 1363</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
