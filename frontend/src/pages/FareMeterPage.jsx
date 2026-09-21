import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Navigation, Info, MessageSquare, Volume2, ShieldCheck, Crosshair, MapPin, Moon, Sun, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useTraveler } from '../context/TravelerContext';
import { useJourney } from '../context/JourneyContext';
import StatusBadge from '../components/common/StatusBadge';
import LanguageSupportModal from '../components/common/LanguageSupportModal';
import GoogleMapView from '../components/maps/GoogleMapView';
import { resolveLocation } from '../services/mapResolver';

// Helper to determine if current system/device time falls in the official Delhi night window (23:00 - 05:00)
const checkSystemIsNight = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 23 || currentHour < 5;
};

// Known Delhi Landmark Coordinates for Instant Routing
const DELHI_LANDMARK_COORDS = {
  'New Delhi Railway Station (NDLS)': { lat: 28.6429, lng: 77.2195, name: 'New Delhi Railway Station (NDLS)' },
  'Red Fort (Lal Qila)': { lat: 28.6562, lng: 77.2410, name: 'Red Fort (Lal Qila)' },
  'Chandni Chowk': { lat: 28.6506, lng: 77.2303, name: 'Chandni Chowk, Old Delhi' },
  'India Gate': { lat: 28.6129, lng: 77.2295, name: 'India Gate' },
  'Qutub Minar': { lat: 28.5245, lng: 77.1855, name: 'Qutub Minar' },
  'Lotus Temple': { lat: 28.5535, lng: 77.2588, name: 'Lotus Temple' },
  'Connaught Place (CP)': { lat: 28.6315, lng: 77.2167, name: 'Connaught Place (CP)' },
  'Delhi Airport (IGI T3)': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi International Airport (IGI T3)' },
  'Humayun Tomb': { lat: 28.5933, lng: 77.2507, name: 'Humayun Tomb' }
};

export default function FareMeterPage() {
  const { journey } = useTraveler();
  const { addFareCheck } = useJourney();

  const [origin, setOrigin] = useState('New Delhi Railway Station (NDLS)');
  const [destination, setDestination] = useState('Red Fort (Lal Qila)');
  const [pickupCoords, setPickupCoords] = useState(DELHI_LANDMARK_COORDS['New Delhi Railway Station (NDLS)']);
  const [destinationCoords, setDestinationCoords] = useState(DELHI_LANDMARK_COORDS['Red Fort (Lal Qila)']);
  const [liveGpsEnabled, setLiveGpsEnabled] = useState(false);
  const [routeStats, setRouteStats] = useState(null);

  const [distanceKm, setDistanceKm] = useState(4.8);
  const [vehicleType, setVehicleType] = useState('auto');
  const [quotedFare, setQuotedFare] = useState('500'); // Hero journey demo default

  // Auto-detect Day vs Night based on device clock (23:00 - 05:00 is night in Delhi gazette)
  const [isNight, setIsNight] = useState(checkSystemIsNight);
  const [dayNightNote, setDayNightNote] = useState(() => {
    const isNightNow = checkSystemIsNight();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Auto-detected from local device time (${timeStr}): ${isNightNow ? 'Night Fare (+25% Surcharge)' : 'Day Standard Fare'}`;
  });

  const [fareResult, setFareResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // 1. Continuous Live Geocoding for Destination Input (supports 'chandi chawk', 'red fort', etc.)
  useEffect(() => {
    if (!destination || destination.trim() === '') return;

    const timer = setTimeout(async () => {
      console.log('[FareMeterPage] Resolving destination address:', destination);
      const res = await resolveLocation(destination);
      if (res && res.lat && res.lng) {
        console.log('[FareMeterPage] Destination geocoded successfully:', res.name, `(${res.lat}, ${res.lng}) via ${res.source}`);
        setDestinationCoords({
          name: res.name || destination,
          lat: res.lat,
          lng: res.lng
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destination]);

  // 2. Continuous Live Geocoding for Origin Input (unless in live GPS mode)
  useEffect(() => {
    if (!origin || origin.trim() === '' || origin.includes('Live GPS')) return;

    const timer = setTimeout(async () => {
      console.log('[FareMeterPage] Resolving origin address:', origin);
      const res = await resolveLocation(origin);
      if (res && res.lat && res.lng) {
        console.log('[FareMeterPage] Origin geocoded successfully:', res.name, `(${res.lat}, ${res.lng}) via ${res.source}`);
        setPickupCoords({
          name: res.name || origin,
          lat: res.lat,
          lng: res.lng
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [origin]);

  // Quick Hero Demo Presets
  const loadHeroPreset = () => {
    setOrigin('New Delhi Railway Station (NDLS)');
    setDestination('Red Fort (Lal Qila)');
    setPickupCoords(DELHI_LANDMARK_COORDS['New Delhi Railway Station (NDLS)']);
    setDestinationCoords(DELHI_LANDMARK_COORDS['Red Fort (Lal Qila)']);
    setDistanceKm(4.8);
    setVehicleType('auto');
    setQuotedFare('500'); // Classic overcharge scenario
    calculateFare(4.8, 'auto', '500', isNight);
  };

  const calculateFare = async (dist = distanceKm, vType = vehicleType, quoted = quotedFare, night = isNight) => {
    setLoading(true);
    try {
      const res = await api.estimateFare({
        origin_name: origin,
        destination_name: destination,
        distance_km: dist,
        duration_min: Math.round(dist * 3.5),
        vehicle_type: vType,
        is_night: night,
        quoted_fare: quoted ? parseFloat(quoted) : null,
        journey_code: journey?.journey_code
      });
      if (res.success) {
        setFareResult(res.data);
        if (addFareCheck) {
          addFareCheck({
            from: origin,
            to: destination,
            distance: dist,
            fare: res.data?.estimated_fare || Math.round(dist * 12.5),
            mode: vType === 'taxi' ? 'Delhi Cab (Taxi)' : 'Auto-Rickshaw'
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNight = () => {
    const nextNight = !isNight;
    setIsNight(nextNight);
    setDayNightNote(`Manual override: ${nextNight ? 'Night Rate (+25% Surcharge)' : 'Day Standard Rate'}`);
    if (fareResult) {
      calculateFare(distanceKm, vehicleType, quotedFare, nextNight);
    }
  };

  // 3. User Triggered Real-Time GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLiveGpsEnabled(true);
    console.log('[FareMeterPage] Requesting browser high-accuracy GPS position...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'My Current Location (Live GPS)'
        };
        console.log('[FareMeterPage] Live GPS acquired:', coords.lat, coords.lng, 'accuracy: ±' + Math.round(pos.coords.accuracy) + 'm');
        setPickupCoords(coords);
        setOrigin('My Current Location (Live GPS)');
      },
      (err) => {
        console.warn('[FareMeterPage GPS Error]:', err.code, err.message);
        alert(`Location Notice: ${err.message}. Please allow location permission in your browser.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationUpdate = (coords) => {
    console.log('[FareMeterPage] Real-time live GPS stream update:', coords.lat, coords.lng);
    setPickupCoords(prev => ({
      ...prev,
      lat: coords.lat,
      lng: coords.lng,
      name: 'My Current Location (Live GPS)'
    }));
  };

  // 4. Called when Google Maps calculates the driving route
  const handleRouteCalculated = ({ distanceKm: calcDist, distanceText, durationText }) => {
    console.log('[FareMeterPage] Route calculated from Google Maps:', distanceText, durationText, `(${calcDist} km)`);
    setRouteStats({ distanceText, durationText });
    if (calcDist && calcDist > 0) {
      setDistanceKm(calcDist);
    }
  };

  // Generate official Google Maps directions URL
  const getGoogleMapsDirectionsUrl = () => {
    const originLat = pickupCoords?.lat || 28.6429;
    const originLng = pickupCoords?.lng || 77.2195;
    const destLat = destinationCoords?.lat || 28.6562;
    const destLng = destinationCoords?.lng || 77.2410;
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>Delhi Transport Department Reference Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Fair Fare Meter & <span className="coder-text-gradient">Discrepancy Advisor</span>
            </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verify quoted auto/cab fares against official Delhi Government gazette rates before paying.
          </p>
        </div>

        {/* Hero Demo Trigger Button */}
        <button
          id="btn-hero-fare-preset"
          onClick={loadHeroPreset}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 shadow-md shadow-indigo-600/10"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Load "NDLS → Red Fort" Hero Demo</span>
        </button>
      </div>

      {/* 1 & 2: LIVE TRANSIT MAP (HOMEPAGE SIGNATURE GLOWING BLUE/PURPLE BACKDROP) */}
      <div className="relative group mb-8">
        <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-25 group-hover:opacity-55 blur-2xl animate-pulse pointer-events-none transition-opacity duration-300" />
        <div className="relative rounded-3xl p-4 sm:p-5 border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div>
              <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Live Transit Route & GPS Navigation</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold font-display text-white">
                Trip Route: {origin} → {destination}
              </h3>
              {routeStats && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Google Driving Distance: <span className="text-cyan-300 font-bold">{routeStats.distanceText}</span> • Typical Travel Time: <span className="text-white font-bold">{routeStats.durationText}</span>
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setLiveGpsEnabled(!liveGpsEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  liveGpsEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 ${liveGpsEnabled ? 'animate-spin' : ''}`} />
                <span>{liveGpsEnabled ? 'Live GPS Active' : 'Enable Live GPS'}</span>
              </button>

              {/* Open in Google Maps Link / Button */}
              <a
                id="link-open-google-maps"
                href={getGoogleMapsDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all shadow-sm"
                title="Open Navigation in Google Maps (App / Web)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Proportional, Normal Sized Responsive Map (300px - 320px fixed height) */}
          <div className="h-[280px] sm:h-[320px] w-full rounded-2xl overflow-hidden border border-white/10">
            <GoogleMapView
              origin={pickupCoords}
              destination={destinationCoords}
              showRoute={true}
              liveTracking={liveGpsEnabled}
              onLocationUpdate={handleLocationUpdate}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>

          {/* Route Info Footer Bar */}
          <div className="mt-3 p-2.5 bg-black/40 rounded-xl border border-white/[0.08] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px]">
                Active Google Maps polyline routing. Fare benchmark calculates according to live road distance.
              </span>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <a
                href={getGoogleMapsDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline underline-offset-2"
              >
                <span>Turn-by-turn Navigation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-400">Delhi Rates:</span>
              <StatusBadge status="Official" />
            </div>
          </div>
        </div>
      </div>

      {/* Two-column Grid: Route & Fare Details card + Fare Result card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Fare Input Form */}
        <div className="relative group lg:col-span-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
          <div className="relative rounded-3xl border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>Route & Fare Details</span>
              </span>
              <StatusBadge status="Estimated" />
            </h2>

            <div className="space-y-4">
              {/* Origin & Destination */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">Pick-up Location (Start Marker)</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                    title="Detect GPS Location"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Use Live GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  id="input-fare-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. New Delhi Railway Station, Airport..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Destination (End Marker)</label>
                <input
                  type="text"
                  id="input-fare-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Chandni Chowk, Red Fort, Airport..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {['Chandni Chowk', 'Red Fort', 'India Gate', 'Qutub Minar', 'Lotus Temple', 'Delhi Airport (IGI T3)'].map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      onClick={() => setDestination(spot)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[10px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-all"
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Vehicle Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto-Rickshaw', desc: '₹30 first 1.5km + ₹11/km' },
                    { id: 'taxi_non_ac', label: 'Non-AC Taxi', desc: '₹40 first 1km + ₹17/km' },
                    { id: 'taxi_ac', label: 'AC Cab', desc: '₹40 first 1km + ₹20/km' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      id={`vehicle-btn-${v.id}`}
                      onClick={() => setVehicleType(v.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        vehicleType === v.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                          : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="block text-xs font-bold">{v.label}</span>
                      <span className="text-[10px] opacity-70 block">{v.id === 'auto' ? 'CNG Auto' : 'Taxi'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance & Quoted Fare */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-400">
                      Est. Distance (km)
                    </label>
                    {routeStats && (
                      <span className="text-[10px] text-cyan-400 font-semibold">
                        Maps: {routeStats.distanceText}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    id="input-distance-km"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Quoted Fare (₹ INR)
                  </label>
                  <input
                    type="number"
                    id="input-quoted-fare"
                    value={quotedFare}
                    onChange={(e) => setQuotedFare(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3: DAY / NIGHT FEATURE (AUTO-DETECT + MANUAL TOGGLE) */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isNight ? (
                      <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        {isNight ? 'Night Surcharge Active (+25%)' : 'Day Standard Fare (05:00 – 23:00)'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Official Delhi Transport Gazette: 23:00 to 05:00 (+25%)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-toggle-night"
                    onClick={handleToggleNight}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      isNight ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                    title="Toggle Day / Night Surcharge"
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isNight ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-indigo-300/90 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>{dayNightNote}</span>
                  <span className="text-[10px] opacity-75">{isNight ? 'Night Mode' : 'Day Mode'}</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-evaluate-fare"
                onClick={() => calculateFare()}
                disabled={loading}
                className="w-full py-3.5 coder-btn-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Evaluating Delhi Rates...' : 'Calculate Fair Fare Range'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Fare Result & Advisory Display */}
        <div className="relative group lg:col-span-6 flex flex-col justify-between">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
          <div className="relative rounded-3xl border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-6 sm:p-7 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between">
            {fareResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Delhi Reference Output</span>
                    <h3 className="text-xl font-bold font-display text-white">Expected Fare Range</h3>
                  </div>
                  <StatusBadge status={fareResult.breakdown.status_label || "Estimated"} />
                </div>

                {/* Big Fare Display */}
                <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-xs text-slate-400 block mb-1">Official Benchmark</span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {fareResult.breakdown.expected_range}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{fareResult.breakdown.reference_rate}</p>
                </div>

                {/* Overcharge Warning or Fair Tag */}
                {fareResult.advisory?.is_overcharge ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{fareResult.advisory.advisory_status}</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {fareResult.advisory.advisory_message}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] font-semibold">
                      <span>Quoted Fare: ₹{quotedFare}</span>
                      <span className="text-rose-400">~{fareResult.advisory.discrepancy_percent}% above benchmark</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold block">Within Fair Reference Range</span>
                      <span className="text-cyan-200/80">Quoted price is in accordance with Delhi Government meter norms.</span>
                    </div>
                  </div>
                )}

                {/* Language Fallback Card Button */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-400" />
                      <span>Language Support (Bhashini & Phrases)</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Show politely to driver: 'Bhaiya, meter se chaliye'
                    </p>
                  </div>
                  <button
                    id="btn-show-phrase-cards"
                    onClick={() => setIsLangModalOpen(true)}
                    className="px-3.5 py-2 coder-btn-primary text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    Open Phrases
                  </button>
                </div>

                {/* Quick Inline Preloaded Offline Transport Phrase */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Quick Meter Request Card</span>
                    <StatusBadge status="Official" />
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <p className="text-xs text-slate-400">English: "Please turn on the meter."</p>
                    <p className="text-base font-bold text-cyan-300">"भैया, मीटर चालू कर दीजिए।"</p>
                    <p className="text-[11px] text-slate-300 italic font-mono">
                      Say: "Bhai-ya, mee-tur chaa-loo kur dee-jee-ye"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                  <Calculator className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Check Quoted Fare</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Enter your destination and any quoted price to evaluate whether it's fair or trigger our non-accusatory advice banner.
                </p>
                <button
                  onClick={loadHeroPreset}
                  className="mt-6 px-4 py-2 bg-gradient-to-r from-[#6b30e3]/20 to-[#8b5cf6]/20 hover:from-[#6b30e3]/40 hover:to-[#8b5cf6]/40 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  Try "NDLS → Red Fort" Hero Demo →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language Support & Bhashini Phrase Cards Modal */}
      <LanguageSupportModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  </div>
  );
}
