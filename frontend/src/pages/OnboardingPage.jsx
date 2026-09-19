import React, { useState } from 'react';
import { ShieldCheck, QrCode, User, Globe, Phone, Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import { api } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

const NATIONALITIES = [
  'United Kingdom', 'United States', 'Germany', 'France',
  'Australia', 'Japan', 'Spain', 'Canada', 'Italy', 'Other'
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' }
];

export default function OnboardingPage() {
  const { traveler, journey, updateProfile } = useTraveler();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: traveler?.name || '',
    nationality: traveler?.nationality || 'United Kingdom',
    preferred_language: traveler?.preferred_language || 'en',
    emergency_contact: traveler?.emergency_contact || ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activePass, setActivePass] = useState(journey ? {
    journey_code: journey.journey_code,
    expires_at: journey.expires_at,
    status_label: 'Official Temporary Pass'
  } : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsGenerating(true);
    try {
      const res = await api.onboardTraveler(formData);
      if (res.success) {
        updateProfile(res.data.traveler, res.data.journey);
        setActivePass(res.data.safe_pass);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
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
        {/* Hero Banner */}
        <div className="relative rounded-3xl p-8 overflow-hidden coder-card border border-white/[0.08] shadow-2xl mb-8 bg-[#111318]/90 backdrop-blur-xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
              <img src="/logo.jpg" alt="TravelMate" className="w-4 h-4 rounded object-cover ring-1 ring-white/20" />
              <span>SIH 2026 • Verified Tourist Trust Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
              One Tourist. One Journey ID. <span className="coder-text-gradient">Total Delhi Safety.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              TravelMate replaces 12 fragmented apps with an interconnected journey layer.
              Zero passport upload, auto-expiring QR identity, verified monument access, and fair fare protection.
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Onboarding Form */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Passport-Free Minimal Profile</h2>
              <p className="text-xs text-slate-400">Generate your temporary 7-day SafeVisit Pass</p>
            </div>
            <StatusBadge status="Official" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name / Traveler Handle
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  id="input-traveler-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-surface-border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nationality
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <select
                    id="select-traveler-nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n} className="bg-surface text-white">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Preferred Language
                </label>
                <select
                  id="select-traveler-language"
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface/80 border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-surface text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Emergency Contact (Optional WhatsApp / Phone)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  id="input-traveler-emergency"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="+44 7700 900077"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-surface-border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Will be automatically alerted with GPS pin if SOS or silent gesture is triggered.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-generate-safe-pass"
                disabled={isGenerating}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <span>Generating Crypto Pass...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Issue SafeVisit Pass (Journey ID)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Guarantee Box */}
          <div className="mt-6 p-4 rounded-xl bg-surface border border-surface-border text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Zero Document Storage Architecture</span>
            </div>
            <p>
              TravelMate stores NO passport scans, NO national ID numbers, and NO biometric records.
              All data expires automatically after your 7-day Delhi visit.
            </p>
          </div>
        </div>

        {/* Active SafeVisit Pass Card */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 relative overflow-hidden bg-gradient-to-b from-surface via-surface-card to-slate-900">
            {/* Stamp Ribbon */}
            <div className="absolute -right-12 top-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-12 rotate-45 shadow-md">
              VALID DELHI PASS
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
                  Official SafeVisit Pass
                </span>
                <h3 className="text-xl font-bold font-mono text-white">
                  {activePass?.journey_code || journey?.journey_code || 'TM-DEL-2026-X89K'}
                </h3>
              </div>
            </div>

            {/* Pass QR Visual */}
            <div className="my-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                {/* Clean QR placeholder SVG */}
                <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="26" height="26" fill="#090E17" rx="4" />
                  <rect x="14" y="14" width="18" height="18" fill="white" rx="2" />
                  <rect x="18" y="18" width="10" height="10" fill="#10B981" rx="1" />

                  <rect x="64" y="10" width="26" height="26" fill="#090E17" rx="4" />
                  <rect x="68" y="14" width="18" height="18" fill="white" rx="2" />
                  <rect x="72" y="18" width="10" height="10" fill="#10B981" rx="1" />

                  <rect x="10" y="64" width="26" height="26" fill="#090E17" rx="4" />
                  <rect x="14" y="68" width="18" height="18" fill="white" rx="2" />
                  <rect x="18" y="72" width="10" height="10" fill="#10B981" rx="1" />

                  {/* QR Data Pattern */}
                  <rect x="42" y="14" width="6" height="6" fill="#090E17" />
                  <rect x="52" y="14" width="6" height="6" fill="#090E17" />
                  <rect x="42" y="24" width="6" height="6" fill="#090E17" />
                  <rect x="42" y="42" width="16" height="16" fill="#090E17" rx="2" />
                  <rect x="14" y="46" width="6" height="6" fill="#090E17" />
                  <rect x="24" y="46" width="6" height="6" fill="#090E17" />
                  <rect x="68" y="46" width="6" height="6" fill="#090E17" />
                  <rect x="78" y="56" width="6" height="6" fill="#090E17" />
                  <rect x="46" y="68" width="6" height="6" fill="#090E17" />
                  <rect x="56" y="78" width="6" height="6" fill="#090E17" />
                  <rect x="74" y="74" width="12" height="12" fill="#10B981" rx="2" />
                </svg>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
                Scan at ASI Monument Counters / Delhi Tourist Police Checkpoints
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-surface-border">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Pass Holder
                </span>
                <p className="font-bold text-white truncate">{formData.name || 'Sarah Jenkins'}</p>
                <p className="text-[11px] text-emerald-400 font-medium">{formData.nationality}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-surface-border">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Validity Window
                </span>
                <div className="flex items-center text-amber-400 font-bold space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>7 Days Auto-Expiry</span>
                </div>
                <p className="text-[11px] text-slate-400">Zero persistent retention</p>
              </div>
            </div>

            {/* Quick Next Step */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400">Ready to explore Delhi?</span>
              <button
                id="btn-start-exploring"
                onClick={() => navigate('/home')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <span>View 10 Verified Places</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
