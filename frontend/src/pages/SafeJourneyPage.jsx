import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  AlertCircle,
  ShieldAlert,
  Moon,
  Sun,
  Info,
  MapPin,
  Compass,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Video,
  Lightbulb,
  Car,
  ExternalLink,
  Search,
  Crosshair,
  AlertTriangle,
  Award,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  Calculator
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
  { name: 'Charbagh, Lucknow', lat: 26.8335, lng: 80.9264 },
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
    policePresence: '24/7 PCR Van & Tourist Beat Kiosk',
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
    advisory: 'Wider multi-lane roadway bypassing dense bazaar bottlenecks; steady vehicular traffic.'
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
    advisory: 'Passes narrow commercial alleys; caution advised during late night hours.'
  }
];

export default function SafeJourneyPage() {
  const { journey } = useTraveler();

  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'zones', 'night'
  const [simulatedDeviation, setSimulatedDeviation] = useState(false);
  const [selectedZone, setSelectedZone] = useState(delhiZones[1]); // Default to Chandni Chowk

  // PART 1: Real-time Live GPS Coordinates State
  const [liveGps, setLiveGps] = useState(null); // { lat, lng, accuracy }

  // Pickup Location Mode: 'live' (default) or 'manual'
  const [pickupMode, setPickupMode] = useState('live'); // 'live' | 'manual'
  const [pickupQuery, setPickupQuery] = useState('My Current Location (Live GPS)');
  const [manualPickupCoords, setManualPickupCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const pickupSearchDebounceRef = useRef(null);

  // Quick Hub target selector: 'destination' | 'pickup'
  const [quickHubTarget, setQuickHubTarget] = useState('destination');

  // PART 2: Destination Selector & Disambiguation State
  const [destinationQuery, setDestinationQuery] = useState('Red Fort (Lal Qila)');
  const [destinationCoords, setDestinationCoords] = useState({
    lat: 28.6562,
    lng: 77.2410,
    name: 'Red Fort (Lal Qila)'
  });
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const searchDebounceRef = useRef(null);

  // Multi-Route Comparison State (Initialized with default evaluation so never blank)
  const [availableRoutes, setAvailableRoutes] = useState(INITIAL_CORRIDORS);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // 1. Continuous Live Geolocation Watcher (Synchronized with Map Pulse Marker)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('[SafeJourney] Geolocation not supported by browser.');
      return;
    }

    console.log('[SafeJourney] Initializing live GPS tracking watcher...');
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy)
        };
        console.log('[SafeJourney] Real GPS position received:', coords);
        setLiveGps(coords);
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

    // Destination becomes old origin
    setDestinationQuery(prevOrigin.name);
    setDestinationCoords(prevOrigin);

    // Pickup becomes old destination
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

  // Official Delhi Auto Fare Benchmark Estimator: ₹30 first 1.5km + ₹11/km
  const getEstimatedAutoFare = (distKm) => {
    if (!distKm || isNaN(distKm) || distKm <= 0) return { min: 30, max: 40 };
    const dist = parseFloat(distKm);
    const minFare = Math.round(30 + Math.max(0, dist - 1.5) * 10);
    const maxFare = Math.round(30 + Math.max(0, dist - 1.5) * 12.5);
    return { min: minFare, max: maxFare };
  };

  // 3. Unbiased Real-Time Destination Geocoding & Disambiguation (Proximity-Biased to User GPS)
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

  // 4. Multi-Route Receiver from GoogleMapView
  const handleRoutesCalculated = (routes) => {
    if (routes && routes.length > 0) {
      console.log('[SafeJourney] Multi-route alternatives updated:', routes.length);
      setAvailableRoutes(routes);
    }
  };

  // Active Origin: Manual pickup taking priority when in manual mode, else Live GPS, else fallback
  const currentOrigin = (pickupMode === 'manual' && manualPickupCoords)
    ? manualPickupCoords
    : liveGps
      ? { lat: liveGps.lat, lng: liveGps.lng, name: 'My Current Location (Live GPS)' }
      : { lat: 28.6429, lng: 77.2195, name: 'New Delhi Railway Station (NDLS)' };

  // Google Maps External Directions Link
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentOrigin.lat},${currentOrigin.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving`;

  const activeSelectedRoute = availableRoutes[selectedRouteIndex] || availableRoutes[0];

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1400px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Google Maps Platform & Delhi Safety Overlay</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Safe Journey & <span className="coder-text-gradient">Multi-Route Safety Monitor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time live GPS tracking, unbiased destination geocoding, and multi-corridor safety comparison with active police beat overlays.
            </p>
          </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-surface-card p-1 rounded-2xl border border-surface-border shrink-0">
          {[
            { id: 'tracking', label: 'Live Tracking' },
            { id: 'zones', label: 'Zone Safety Layer' },
            { id: 'night', label: 'Night Corridor Ranker' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Pickup & Destination Selector Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-6 border border-surface-border relative z-30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-white/10">
          
          {/* Pickup Location Box (Live GPS / Manual Entry Toggle) */}
          <div className={`flex-1 min-w-[280px] p-3 rounded-2xl border transition-all relative ${
            pickupMode === 'manual' 
              ? 'bg-blue-500/5 border-blue-500/30' 
              : 'bg-surface border-surface-border'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  pickupMode === 'manual' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {pickupMode === 'manual' ? (
                    <MapPin className="w-3.5 h-3.5" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {pickupMode === 'manual' ? 'Pickup Location (Manual)' : 'Start / Pickup Location (Live GPS)'}
                </span>
              </div>

              {/* Mode Toggle Button */}
              {pickupMode === 'live' ? (
                <button
                  type="button"
                  id="btn-switch-pickup-manual"
                  onClick={handleSwitchToManual}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all shadow-sm"
                  title="Switch to enter pickup address manually"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change / Enter Manually</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-switch-pickup-live"
                  onClick={handleSwitchToLiveGps}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all shadow-sm"
                  title="Return to real-time live GPS tracking"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Use Live GPS</span>
                </button>
              )}
            </div>

            {/* Content for Live Mode vs Manual Input Mode */}
            {pickupMode === 'live' ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>My Current Location (Live GPS)</span>
                </span>
                {liveGps ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
                    {liveGps.lat}, {liveGps.lng}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-medium animate-pulse">
                    Acquiring live fix...
                  </span>
                )}
              </div>
            ) : (
              <div className="relative pt-1">
                <form onSubmit={handlePickupFormSubmit}>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 w-3.5 h-3.5 text-blue-400 pointer-events-none" />
                    <input
                      type="text"
                      id="input-safe-journey-pickup"
                      value={pickupQuery}
                      onChange={(e) => handlePickupQueryChange(e.target.value)}
                      placeholder="Type pickup place (e.g. NDLS, CP, Airport, Charbagh)..."
                      className="w-full pl-9 pr-16 py-2 bg-surface-card border border-surface-border rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingPickup}
                      className="absolute right-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isSearchingPickup ? '...' : 'Set'}
                    </button>
                  </div>
                </form>

                {/* Pickup Autocomplete Dropdown */}
                {pickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-60 overflow-y-auto animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 bg-black/40 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Pickup Locations Found ({pickupSuggestions.length})</span>
                      <span>Proximity Sorted</span>
                    </div>
                    {pickupSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPickupSuggestion(sug)}
                        className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center justify-between text-xs text-white transition-colors group"
                      >
                        <div className="pr-2">
                          <div className="font-bold text-slate-100 group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{sug.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block max-w-xs pt-0.5">
                            {sug.formattedAddress}
                          </span>
                        </div>
                        {sug.distanceKm !== undefined && (
                          <span className="font-mono text-blue-300 text-[11px] font-bold shrink-0 ml-2 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30">
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
          <button
            type="button"
            id="btn-swap-journey-endpoints"
            onClick={handleSwapLocations}
            title="Swap Pickup & Destination"
            className="w-8 h-8 rounded-full bg-surface hover:bg-white/10 border border-surface-border flex items-center justify-center text-slate-300 hover:text-white transition-all self-center shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Destination Form Input with Real-Time Disambiguation Dropdown */}
          <div className="flex-1 min-w-[280px] p-3 rounded-2xl bg-surface border border-surface-border relative">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Destination Location
              </span>
            </div>

            <div className="relative">
              <form onSubmit={handleDestinationFormSubmit}>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 w-3.5 h-3.5 text-red-400 pointer-events-none" />
                  <input
                    type="text"
                    id="input-safe-journey-destination"
                    value={destinationQuery}
                    onChange={(e) => handleDestinationQueryChange(e.target.value)}
                    placeholder="Search destination (e.g. Charbagh, Red Fort, India Gate)..."
                    className="w-full pl-9 pr-20 py-2 bg-surface-card border border-surface-border rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingDest}
                    className="absolute right-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSearchingDest ? '...' : 'Set Route'}
                  </button>
                </div>
              </form>

              {/* Destination Dropdown */}
              {destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-60 overflow-y-auto animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 bg-black/40 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Locations Found ({destSuggestions.length})</span>
                    <span>Sorted by Proximity</span>
                  </div>
                  {destSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center justify-between text-xs text-white transition-colors group"
                    >
                      <div className="pr-2">
                        <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{sug.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block max-w-xs pt-0.5">
                          {sug.formattedAddress}
                        </span>
                      </div>
                      {sug.distanceKm !== undefined && (
                        <span className="font-mono text-cyan-300 text-[11px] font-bold shrink-0 ml-2 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                          {sug.distanceKm} km
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* External Google Maps App Link */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="link-open-safe-journey-google-maps"
            className="flex items-center justify-center space-x-1.5 px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all shrink-0 self-center"
            title="Open turn-by-turn directions in Google Maps app"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open in Maps</span>
          </a>
        </div>

        {/* Quick Monument Destination & Pickup Chips */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 shrink-0 mr-1 text-[10px] font-bold uppercase text-slate-400">
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
            const isDestSelected = destinationCoords.name.includes(dest.name.split(',')[0]);
            const isPickupSelected = currentOrigin.name.includes(dest.name.split(',')[0]);
            return (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleQuickHubClick(dest)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isPickupSelected
                    ? 'bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-sm font-bold ring-1 ring-blue-400/30'
                    : isDestSelected
                      ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-sm font-bold ring-1 ring-red-400/30'
                      : 'bg-surface text-slate-400 hover:text-white border-surface-border hover:bg-white/5'
                }`}
                title={`Click to set as ${quickHubTarget === 'pickup' ? 'Pickup Location' : 'Destination'}`}
              >
                {dest.name.split(',')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* PART 2 (Feature 2): MULTI-ROUTE SAFETY COMPARISON CARDS (PROMINENT VIEW) */}
      <div className="mb-6 glass-card rounded-3xl p-5 sm:p-6 border border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold font-display text-white">
                Multi-Route Safety Comparison ({availableRoutes.length} Corridors Evaluated)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All routes are drawn on the live map canvas. Click any corridor card to select and highlight it.
            </p>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Route 1 Recommended</span>
            </span>
          </div>
        </div>

        {/* 3 Alternative Route Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableRoutes.map((route, idx) => {
            const isSelected = selectedRouteIndex === idx;
            const isOptimal = route.safetyLevel === 'High' || idx === 0;
            const isCaution = route.safetyLevel === 'Caution' || idx === 2;

            return (
              <div
                key={route.id || idx}
                id={`card-route-option-${idx}`}
                onClick={() => setSelectedRouteIndex(idx)}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? isOptimal
                      ? 'bg-emerald-500/15 border-emerald-500/70 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-500/10'
                      : 'bg-cyan-500/15 border-cyan-500/70 ring-2 ring-cyan-500/50 shadow-xl'
                    : 'bg-surface hover:bg-white/5 border-surface-border opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Top Bar: Route Index & Selection Radio & Safest Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-500'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Route {idx + 1}: {idx === 0 ? 'Primary Corridor' : `Alternative ${idx}`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {isOptimal && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>Safest Route</span>
                        </span>
                      )}
                      {!isOptimal && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCaution
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isCaution ? 'Caution Advised' : 'Moderate Safety'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route Summary / Road Names */}
                  <h4 className="text-sm font-bold text-slate-100 mb-1 leading-snug">
                    {route.summary}
                  </h4>

                  {/* Distance & Duration Pill */}
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 mb-2.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {route.distanceText}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {route.durationText}
                    </span>
                  </div>

                  {/* Estimated Delhi Fair Fare Benchmark */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs mb-3">
                    <span className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Est. Auto Fare:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-300 text-xs">
                      ₹{getEstimatedAutoFare(route.distanceKm).min} – ₹{getEstimatedAutoFare(route.distanceKm).max}
                    </span>
                  </div>

                  {/* Safety Infrastructure Matrix */}
                  <div className="space-y-1.5 text-xs mb-3.5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/25 border border-white/5">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CCTV Coverage:</span>
                      </span>
                      <span className="font-semibold text-slate-200 text-[11px]">{route.cctvCoverage}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/25 border border-white/5">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lighting Quality:</span>
                      </span>
                      <span className="font-semibold text-slate-200 text-[11px] text-right truncate max-w-[140px]">
                        {route.lighting}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/25 border border-white/5">
                      <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Police Beat:</span>
                      </span>
                      <span className="font-semibold text-slate-200 text-[11px] text-right truncate max-w-[140px]">
                        {route.policePresence}
                      </span>
                    </div>
                  </div>

                  {/* Advisory Text */}
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    {route.advisory}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRouteIndex(idx);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? isOptimal
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {isSelected ? '✓ Highlighted on Map' : 'Select This Corridor'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Map / Live Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Simulation Map Canvas */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[480px] border border-surface-border">
          {/* Map Top Status Bar with Dynamic Real-Time GPS / Manual Pickup Coordinates */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center space-x-2 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-surface-border text-xs shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${pickupMode === 'manual' ? 'bg-blue-400 ring-2 ring-blue-400/30' : 'bg-emerald-400 radar-pulse'}`} />
              {/* DYNAMIC GPS / PICKUP LABEL */}
              <span className="text-slate-200 font-mono font-bold" id="label-live-gps-coords">
                {pickupMode === 'manual'
                  ? `Pickup: ${currentOrigin.name} (${currentOrigin.lat}, ${currentOrigin.lng})`
                  : liveGps
                    ? `GPS Lat: ${liveGps.lat}, Lng: ${liveGps.lng} (±${liveGps.accuracy}m)`
                    : 'Acquiring Real-Time Live GPS Fix...'}
              </span>
              <span className="text-slate-500">•</span>
              <span className={pickupMode === 'manual' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>
                {pickupMode === 'manual' ? 'Manual Origin Mode' : 'Live GPS Monitored'}
              </span>
            </div>

            {/* Test Soft Deviation Button */}
            <button
              id="btn-simulate-deviation"
              onClick={() => setSimulatedDeviation(!simulatedDeviation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                simulatedDeviation
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{simulatedDeviation ? 'Reset Corridor' : 'Simulate Route Deviation (>500m)'}</span>
            </button>
          </div>

          {/* Interactive Google Map with Live GPS, Multi-Route Rendering, and Alternatives */}
          <div className="my-6 relative min-h-[400px]">
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

          {/* Map Disclaimer Footer */}
          <div className="p-3 bg-surface rounded-xl border border-surface-border text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Multi-route safety layer powered by Police beat records & real-time street lighting telemetry.</span>
            </div>
            <StatusBadge status="Official" />
          </div>
        </div>

        {/* Right Info Panels depending on Active Tab */}
        <div className="lg:col-span-4 space-y-4">
          {activeTab === 'tracking' && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-cyan-400" />
                <span>Active Journey Monitor</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Journey Pass:</span>
                  <span className="font-mono font-bold text-white">{journey?.journey_code || 'TM-DEL-2026'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Start / Pickup:</span>
                  <span className={`font-bold text-right truncate max-w-[170px] ${pickupMode === 'manual' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {currentOrigin.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Live GPS Status:</span>
                  <span className={`font-mono font-bold ${liveGps ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {liveGps ? 'Active (Live Satellite Lock)' : 'Connecting...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Destination:</span>
                  <span className="font-bold text-red-400 text-right truncate max-w-[170px]">
                    {destinationCoords.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Corridor:</span>
                  <span className="font-bold text-cyan-300 text-right truncate max-w-[170px]">
                    {activeSelectedRoute?.summary || 'Route 1 (Primary Corridor)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Distance & ETA:</span>
                  <span className="font-mono font-bold text-white">
                    {activeSelectedRoute ? `${activeSelectedRoute.distanceText} • ${activeSelectedRoute.durationText}` : 'Calculating...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Auto Fare:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{getEstimatedAutoFare(activeSelectedRoute?.distanceKm).min} – ₹{getEstimatedAutoFare(activeSelectedRoute?.distanceKm).max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deviation Tolerance:</span>
                  <span className="text-slate-300">&gt;500m for &gt;3 mins</span>
                </div>
              </div>

              {/* Soft Deviation Warning Alert */}
              {simulatedDeviation && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2 font-bold text-amber-400 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Soft Corridor Deviation Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    Vehicle has departed from monitored safe corridor by &gt;500m. Please verify route with driver. Tap Helpline 1363 below if uncomfortable.
                  </p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                <span className="font-bold block mb-1">Silent Gesture SOS Active</span>
                <p className="text-[11px] text-slate-300">
                  You can shake your phone rapidly 3 times to silently trigger an emergency dispatch to 112 with your real-time GPS pin.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  District Risk Overlay
                </h3>
                <StatusBadge status="Official" />
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {delhiZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedZone?.id === zone.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-surface border-surface-border hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{zone.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          zone.risk_level === 'Green'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {zone.risk_level} Zone
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{zone.advisory_text}</p>
                    <span className="text-[9px] text-slate-500 block mt-1">Source: {zone.source_label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'night' && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center">
                  <Moon className="w-4 h-4 mr-1.5" />
                  <span>Night-Safe Route Ranker</span>
                </h3>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                  Night Hours (20:00 - 06:00)
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Ranks alternative routes to prioritize well-lit arterial highways with continuous CCTV and active Police beat kiosks over dark shortcuts.
              </p>

              <div className="space-y-3">
                {availableRoutes.map((route, idx) => (
                  <div
                    key={route.id || idx}
                    onClick={() => setSelectedRouteIndex(idx)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRouteIndex === idx
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md'
                        : 'bg-surface border-surface-border hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{route.summary}</span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                      {route.safetyScore}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mb-1.5">
                      {route.distanceText} • {route.durationText} • {route.cctvCoverage}
                    </div>
                    <p className="text-[11px] text-slate-300">{route.advisory}</p>
                  </div>
                ))}
              </div>

              {/* Primary Safety Disclaimer */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-400">
                <strong>Important Safety Note:</strong> Pre-booked official prepaid rides or verified hotel cars remain the primary recommendation for late-night transit.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
