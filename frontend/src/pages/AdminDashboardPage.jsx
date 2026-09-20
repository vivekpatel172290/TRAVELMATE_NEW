import React, { useState, useEffect } from 'react';
import { LayoutDashboard, AlertCircle, CheckCircle2, ShieldAlert, Clock, RefreshCw, FileText, Check, X, Shield, Camera } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalJourneys: 24,
    activeJourneys: 8,
    totalIncidents: 4,
    pendingIncidents: 2,
    flaggedFares: 6,
    placesCount: 10
  });

  const [incidents, setIncidents] = useState([]);
  const [placesFreshness, setPlacesFreshness] = useState([]);
  const [flaggedFares, setFlaggedFares] = useState([]);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents', 'places', 'fares'
  const [officerNotes, setOfficerNotes] = useState({});

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const statsRes = await api.getAdminStats();
    if (statsRes.success) setStats(statsRes.data);

    const incidentsRes = await api.getAdminIncidents();
    if (incidentsRes.success) setIncidents(incidentsRes.data);

    const faresRes = await api.getFlaggedFares();
    if (faresRes.success && faresRes.data) {
      setFlaggedFares(faresRes.data);
    }

    try {
      const pRes = await fetch(`${API_BASE}/admin/places/freshness`);
      const pData = await pRes.json();
      if (pData.success) setPlacesFreshness(pData.data);
      else throw new Error('fetch error');
    } catch {
      // Fallback place audit records
      setPlacesFreshness([
        { id: 'pl-red-fort-01', name: 'Red Fort (Lal Qila)', last_verified: '2026-08-20', status: 'Official', needs_reverification: false },
        { id: 'pl-qutub-minar-02', name: 'Qutub Minar', last_verified: '2026-08-20', status: 'Official', needs_reverification: false },
        { id: 'pl-purana-qila-05', name: 'Purana Qila', last_verified: '2026-08-10', status: 'Official', needs_reverification: false },
        { id: 'pl-jama-masjid-09', name: 'Jama Masjid', last_verified: '2026-07-01', status: 'Stale', needs_reverification: true }
      ]);
    }
  };

  const handleReverifyPlace = async (placeId) => {
    const res = await api.reverifyPlace(placeId);
    if (res.success) {
      const todayStr = new Date().toISOString().split('T')[0];
      setPlacesFreshness(prev => prev.map(p => {
        if (p.id === placeId || p.name.toLowerCase().includes(placeId.toLowerCase())) {
          return { ...p, last_verified: todayStr, needs_reverification: false, status: 'Official' };
        }
        return p;
      }));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateIncidentStatus(id, status, officerNotes[id] || 'Verified by Delhi Tourist Police Officer');
      if (res.success) {
        setIncidents(incidents.map(i => i.id === id ? { ...i, status } : i));
      }
    } catch (e) {
      console.error(e);
      setIncidents(incidents.map(i => i.id === id ? { ...i, status } : i));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start sm:items-center gap-3.5">
            <img
              src="/logo.jpg"
              alt="TravelMate"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/20 shrink-0 mt-0.5 sm:mt-0"
            />
            <div>
              <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Delhi Police & Ministry of Tourism Control Room</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                TravelMate Admin & <span className="coder-text-gradient">Trust Escrow Portal</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Human verification authority: Review AI-structured reports, audit monument fees, and inspect fare disputes.
              </p>
            </div>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Live Queue</span>
          </button>
        </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-2xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Journeys</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{stats.activeJourneys}</div>
          <span className="text-[10px] text-slate-500">Total {stats.totalJourneys} Issued</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pending Incidents</span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{stats.pendingIncidents}</div>
          <span className="text-[10px] text-slate-500">Require Human Verification</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Flagged Fare Disputes</span>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{stats.flaggedFares}</div>
          <span className="text-[10px] text-slate-500">Auto Overcharges Logged</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Places Freshness</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">{stats.placesCount} Verified</div>
          <span className="text-[10px] text-slate-500">ASI Delhi Registry</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-6">
        {[
          { id: 'incidents', label: 'Incident Review Queue' },
          { id: 'places', label: 'Place Data Freshness Audit' },
          { id: 'fares', label: 'Flagged Fare Disputes' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Incidents Review */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="glass-card p-6 rounded-3xl border border-surface-border space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Case #{inc.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-mono">
                    Journey: {inc.journey_code}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      inc.status === 'verified_by_human'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : inc.status === 'dismissed'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {inc.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Raw vs Structured Description vs Linked Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-surface rounded-2xl border border-surface-border">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Tourist Raw Input (Unfiltered)
                  </span>
                  <p className="text-slate-200 leading-relaxed italic">"{inc.raw_text}"</p>
                </div>

                <div className="p-3.5 bg-surface rounded-2xl border border-surface-border space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                    Claude Extracted Schema
                  </span>
                  <div><strong>Location:</strong> {inc.structured_data?.location}</div>
                  <div><strong>Parties:</strong> {inc.structured_data?.person_type_involved}</div>
                  <div><strong>Summary:</strong> {inc.structured_data?.description}</div>
                  <div className="text-amber-400 font-semibold">Severity: {inc.structured_data?.severity || 'Moderate'}</div>
                </div>

                <div className="p-3.5 bg-surface rounded-2xl border border-surface-border space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1 flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>RideSafe Linked Evidence</span>
                  </span>
                  {inc.linked_evidence && inc.linked_evidence.length > 0 ? (
                    inc.linked_evidence.map((ev, eIdx) => (
                      <div key={eIdx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <span className="font-mono font-bold text-white block">
                            {ev.tourist_confirmed_plate || ev.ocr_detected_plate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ev.vehicle_type?.toUpperCase()} • Confirmed Plate
                          </span>
                        </div>
                        {ev.photo_url && (
                          <img
                            src={ev.photo_url}
                            alt="Vehicle Plate"
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-2">
                      No photo or vehicle plate linked.
                    </div>
                  )}
                </div>
              </div>

              {/* Human Admin Action Controls (Scope #11 Rule) */}
              {inc.status === 'pending_review' && (
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Add Police Officer Notes / Ticket #"
                    value={officerNotes[inc.id] || ''}
                    onChange={(e) => setOfficerNotes({ ...officerNotes, [inc.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-surface border border-surface-border rounded-xl text-xs text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-verify-incident-${inc.id.slice(0, 8)}`}
                      onClick={() => handleUpdateStatus(inc.id, 'verified_by_human')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify & Forward to Police Beat</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(inc.id, 'dismissed')}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Places Freshness */}
      {activeTab === 'places' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Monument Fee & Timing Freshness Audit
            </h3>
            <StatusBadge status="Official" />
          </div>

          <div className="space-y-3">
            {placesFreshness.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-surface border border-surface-border flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <span className="text-xs text-slate-400">Last verified: {p.last_verified}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {p.needs_reverification ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Requires Field Reverification
                      </span>
                      <button
                        onClick={() => handleReverifyPlace(p.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Re-verify Now
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Verified Fresh ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Flagged Fares */}
      {activeTab === 'fares' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Logged Fare Overcharges at Transit Hubs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time disputes flagged when drivers quote rates above Delhi Gazette benchmarks.
              </p>
            </div>
            <StatusBadge status="Estimated" />
          </div>

          <div className="space-y-3">
            {flaggedFares.map((f, fIdx) => (
              <div key={f.id || fIdx} className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2 text-xs hover:border-amber-500/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <strong className="text-white text-sm font-display">{f.origin_name} → {f.destination_name}</strong>
                  <span className="text-rose-400 font-mono font-bold text-xs bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                    ₹{f.quoted_fare} Quoted vs ₹{f.expected_fare_min}-{f.expected_fare_max} Expected (~{f.discrepancy_percent}% Overcharge)
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="text-slate-300">
                    Vehicle Type: <strong className="text-emerald-400 uppercase">{f.vehicle_type}</strong> • Distance: {f.distance_km} km
                  </span>
                  <span className="text-slate-500 font-mono">
                    Logged under Journey: {f.journey_code || 'TM-DEL-2026-X89K'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
