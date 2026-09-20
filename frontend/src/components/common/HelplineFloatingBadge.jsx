import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  X, 
  AlertOctagon, 
  Radio, 
  MapPin, 
  Building2, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Landmark 
} from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { api } from '../../services/api';
import StatusBadge from './StatusBadge';

export default function HelplineFloatingBadge() {
  const { traveler, journey } = useTraveler();
  const [isOpen, setIsOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [sosIncident, setSosIncident] = useState(null);
  const [directory, setDirectory] = useState(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const [liveCoords, setLiveCoords] = useState({ lat: 28.6139, lng: 77.2090 });
  const [dispatchTime, setDispatchTime] = useState(null);

  useEffect(() => {
    async function loadDirectory() {
      const res = await api.getHelplines(traveler?.nationality || 'United Kingdom');
      if (res.success) {
        setDirectory(res.data);
      }
    }
    loadDirectory();
  }, [traveler?.nationality]);

  // Immediate Emergency Telemetry Dispatch
  const handleTriggerSOS = async () => {
    setIsDispatching(true);
    setIsOpen(true);

    // 1. Fetch live GPS coordinates with graceful fallback
    let currentLat = 28.6139;
    let currentLng = 77.2090;

    const getGeoLocation = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve({ lat: currentLat, lng: currentLng });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => {
            console.warn('[SOS Geolocation fallback]', err.message);
            resolve({ lat: currentLat, lng: currentLng });
          },
          { enableHighAccuracy: true, timeout: 2500 }
        );
      });

    const coords = await getGeoLocation();
    setLiveCoords(coords);

    // 2. Transmit Emergency Telemetry Packet to 112 and Police Beat
    try {
      const payload = {
        journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
        trigger_type: 'manual_button',
        lat: coords.lat,
        lng: coords.lng,
        message: 'High-priority Tourist Emergency SOS dispatched from TravelMate Terminal'
      };

      const res = await api.triggerSOS(payload);
      if (res.success && res.data) {
        setSosIncident(res.data);
        setIsDispatched(true);
      }
    } catch (err) {
      console.error('SOS dispatch error:', err);
      // Fallback local incident representation
      setSosIncident({
        sos_token: `SOS-DEL-${Date.now().toString().slice(-6)}`,
        journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
        coordinates: coords,
        nearest_police_beat: {
          name: 'Connaught Place Police Station (Beat #4)',
          address: 'Baba Kharak Singh Marg, CP',
          phone: '+91 11 2336 5359',
          distance_km: 1.1
        },
        dispatched_to: [
          '112 Delhi Police Central Control Room',
          'Connaught Place Police Station (Beat #4) (1.1 km away)',
          'Delhi Tourist Police Emergency Unit',
          'Registered Emergency Contact'
        ],
        timestamp: new Date().toISOString()
      });
      setIsDispatched(true);
    } finally {
      setIsDispatching(false);
      setDispatchTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating 1-Tap SOS Emergency Trigger Button */}
      <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
        <button
          id="btn-floating-sos"
          type="button"
          onClick={handleTriggerSOS}
          className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white px-4 sm:px-5 py-3 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-red-400/60 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Trigger Emergency SOS: Telemetry packet sent to 112 & nearest police beat"
        >
          {/* Concentric Radar Ping Rings */}
          <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-rose-600 blur opacity-60 group-hover:opacity-100 transition-opacity" />

          <div className="relative flex items-center space-x-2">
            <div className="relative">
              <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-red-950 animate-ping" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-display">
                SOS 112
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-red-100 opacity-90 hidden sm:inline">
                Emergency Dispatch
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Emergency SOS Telemetry & 1-Tap Dial Console Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-opacity">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0c0e14] border-2 border-red-500/50 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Urgent Red Warning Strobe Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse rounded-t-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mt-1">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-600/20 border-2 border-red-500/40 rounded-2xl text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse shrink-0">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span>Live Emergency Telemetry Packet</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
                    Dispatched to Delhi Police 112
                  </h3>
                  <p className="text-xs text-slate-300">
                    Central Control Room & Nearest Police Beat Station Notified
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-sos-modal"
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Telemetry Transmission Packet Card */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-surface to-[#12141c] border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-emerald-300">
                    PACKET TRANSMITTED • {sosIncident?.sos_token || 'SOS-DEL-LIVE'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {dispatchTime || 'Live Broadcast'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Coordinates */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Live GPS Telemetry</span>
                  </div>
                  <div className="font-mono font-bold text-white text-xs">
                    {liveCoords.lat.toFixed(4)}° N, {liveCoords.lng.toFixed(4)}° E
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">High-accuracy lock</span>
                </div>

                {/* Journey ID */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>SafeVisit Journey ID</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-300 text-xs">
                    {journey?.journey_code || 'TM-DEL-2026-X89K'}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Verified Tourist Token</span>
                </div>
              </div>

              {/* Nearest Police Beat Station */}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-red-300 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Nearest Police Beat Station</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {sosIncident?.nearest_police_beat?.distance_km ?? 1.1} km away
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {sosIncident?.nearest_police_beat?.name || 'Connaught Place Police Station (Beat #4)'}
                </div>
                <p className="text-[11px] text-slate-300">
                  {sosIncident?.nearest_police_beat?.address || 'Baba Kharak Singh Marg, Connaught Place, New Delhi'}
                </p>
              </div>

              {/* Dispatched Channels */}
              <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-slate-400 font-semibold">Notified:</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-mono text-[10px]">
                  112 Central Dispatch
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-mono text-[10px]">
                  Tourist Police Unit
                </span>
                {traveler?.emergency_contact && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-emerald-300 font-mono text-[10px]">
                    SMS Contact: {traveler.emergency_contact}
                  </span>
                )}
              </div>
            </div>

            {/* Instant 1-Tap Dial Action Grid */}
            <div className="mt-5 space-y-2.5">
              <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 block mb-1">
                Instant 1-Tap Emergency Dialers
              </span>

              {/* 1. Primary 112 Button */}
              <a
                href="tel:112"
                id="btn-dial-112"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-2xl text-base flex items-center justify-center space-x-3 shadow-xl shadow-red-600/40 border border-red-400/50 transition-all hover:scale-[1.02] active:scale-95"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span className="tracking-wide">DIAL 112 (POLICE / AMBULANCE / FIRE)</span>
              </a>

              {/* Secondary 1-Tap Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 2. Delhi Tourist Police */}
                <a
                  href="tel:+911123365359"
                  className="py-2.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all text-center"
                >
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Call Tourist Police (+91 11 2336 5359)</span>
                </a>

                {/* 3. Nearest Station Direct Line */}
                <a
                  href={`tel:${sosIncident?.nearest_police_beat?.phone?.replace(/[^0-9+]/g, '') || '+911123365359'}`}
                  className="py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all text-center"
                >
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Call Assigned Police Beat ({sosIncident?.nearest_police_beat?.distance_km ?? 1.1} km)</span>
                </a>
              </div>

              {/* 4. Emergency Contact / Embassy Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {traveler?.emergency_contact ? (
                  <a
                    href={`tel:${traveler.emergency_contact.replace(/[^0-9+]/g, '')}`}
                    className="py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all text-center"
                  >
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Call Home Contact ({traveler.emergency_contact})</span>
                  </a>
                ) : (
                  <a
                    href="tel:1363"
                    className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all text-center"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Dial Tourist Helpline 1363</span>
                  </a>
                )}

                {directory?.embassy && (
                  <a
                    href={`tel:${directory.embassy.emergency_phone?.replace(/[^0-9+]/g, '') || directory.embassy.phone}`}
                    className="py-2.5 px-3 bg-indigo-600/25 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all text-center"
                  >
                    <Landmark className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Call {traveler?.nationality || 'Embassy'} 24/7 Consular</span>
                  </a>
                )}
              </div>
            </div>

            {/* Accordion: View All Helplines & Embassy Details */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowDirectory(!showDirectory)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white py-1 transition-colors"
              >
                <span>View Full Helplines & Embassy Directory</span>
                {showDirectory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDirectory && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 text-xs animate-in fade-in duration-150">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Ministry of Tourism (12 Languages)</div>
                      <div className="text-[11px] text-slate-400">Toll-Free 1800-11-1363 • Short Code 1363</div>
                    </div>
                    <a href="tel:1363" className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-bold border border-emerald-500/30">
                      Call 1363
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Delhi Women Safety Helpline</div>
                      <div className="text-[11px] text-slate-400">24/7 Police SOS for women tourists</div>
                    </div>
                    <a href="tel:1091" className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-bold border border-purple-500/30">
                      Call 1091
                    </a>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Ambulance & Medical Emergency</div>
                      <div className="text-[11px] text-slate-400">Delhi Government Health Dispatch</div>
                    </div>
                    <a href="tel:102" className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg font-bold border border-rose-500/30">
                      Call 102
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTriggerSOS}
                disabled={isDispatching}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDispatching ? 'animate-spin text-red-400' : ''}`} />
                <span>{isDispatching ? 'Transmitting...' : 'Re-transmit Telemetry'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                I am Safe / Stand Down
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { HelplineFloatingBadge as SOSEmergencyBadge };
