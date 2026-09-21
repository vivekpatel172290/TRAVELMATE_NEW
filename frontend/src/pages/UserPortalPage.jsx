import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Database,
  Shield,
  Compass,
  FileText,
  PhoneCall,
  AlertCircle,
  Languages,
  Lock,
  HelpCircle,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ChevronRight,
  LogOut,
  LogIn,
  KeyRound,
  ExternalLink,
  Trash2,
  Eye,
  Activity,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  MapPin,
  Car
} from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import QRModal from '../components/common/QRModal';
import StatusBadge from '../components/common/StatusBadge';
import embassies from '../data/embassies.json';

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

export default function UserPortalPage({ defaultTab }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { traveler, journey, updateProfile, concludeJourney } = useTraveler();
  const { user, isAuthenticated, logout } = useAuth();

  const initialTab = defaultTab || searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Database Explorer states
  const [dbData, setDbData] = useState(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbError, setDbError] = useState('');
  const [dbSubTab, setDbSubTab] = useState('users');
  const [authDiag, setAuthDiag] = useState(null);

  // Sync active tab with searchParams
  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (qTab) {
      setActiveTab(qTab);
    }
  }, [defaultTab, searchParams]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Form State for Profile
  const [formData, setFormData] = useState({
    name: user?.name || traveler?.name || 'Sarah Jenkins',
    nationality: traveler?.nationality || user?.nationality || 'United Kingdom',
    preferred_language: traveler?.preferred_language || 'en',
    emergency_contact: traveler?.emergency_contact || user?.emergency_contact || '+44 7700 900077'
  });

  useEffect(() => {
    if (traveler || user) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || traveler?.name || prev.name,
        nationality: traveler?.nationality || user?.nationality || prev.nationality,
        emergency_contact: traveler?.emergency_contact || user?.emergency_contact || prev.emergency_contact
      }));
    }
  }, [traveler, user]);

  // Load Database Records
  const fetchDatabase = async () => {
    setIsDbLoading(true);
    setDbError('');
    try {
      const res = await api.getDatabaseRecords();
      if (res.success) {
        setDbData(res);
      } else {
        setDbError(res.error || 'Failed to load records');
      }
    } catch (err) {
      setDbError(err.message);
    } finally {
      setIsDbLoading(false);
    }
  };

  const fetchDiagnostics = async () => {
    try {
      const d = await api.getAuthDiagnostics();
      setAuthDiag(d);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === 'database' || activeTab === 'account') {
      fetchDatabase();
      fetchDiagnostics();
    }
  }, [activeTab]);

  const copyToClipboard = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2500);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData, journey);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleConclude = () => {
    if (window.confirm('Are you sure you want to conclude this journey? All temporary local travel logs and personal handles will be irreversibly erased from this device under Scope #18 Privacy Retention Policy.')) {
      concludeJourney();
      navigate('/');
    }
  };

  const TAB_ITEMS = [
    { id: 'profile', label: 'Profile & SafePass', icon: User, desc: 'Personal details and temporary identity' },
    { id: 'database', label: 'Database Explorer', icon: Database, desc: 'Live users, password hashes & OTP records' },
    { id: 'account', label: 'Account & Security', icon: Shield, desc: 'Login, email OTP & DB storage model' },
    { id: 'journeys', label: 'My Journeys', icon: Compass, desc: 'Active trips & Journey Chain IDs' },
    { id: 'records', label: 'Travel Records', icon: FileText, desc: 'Fares, plates & visited places' },
    { id: 'safety', label: 'Safety & Emergency', icon: PhoneCall, desc: '112 SOS & Embassy contacts' },
    { id: 'reports', label: 'My Reports', icon: AlertCircle, desc: 'Incident status & resolutions' },
    { id: 'language', label: 'Language Settings', icon: Languages, desc: 'Interface & Bhashini speech' },
    { id: 'privacy', label: 'Privacy & Storage', icon: Lock, desc: 'Data purge & backend architecture' },
    { id: 'help', label: 'Help & FAQs', icon: HelpCircle, desc: 'Tourist guides & assistance' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* ===================================================================== */}
      {/* HERO BANNER: USER IDENTITY & QUICK ACTIONS                            */}
      {/* ===================================================================== */}
      <div className="coder-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-[#111318]/90 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Basic Credentials */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-emerald-500/20 ring-2 ring-white/10">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-white">
                  {formData.name || 'International Traveler'}
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {formData.nationality}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>Active SafePass:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {journey?.journey_code || user?.journey_code || 'TM-DEL-2026-X89K'}
                </span>
                <span>•</span>
                <span>Language: <strong className="text-slate-200">{formData.preferred_language.toUpperCase()}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://github.com/vivekpatel172290/TRAVELMATE_NEW/archive/refs/heads/main.zip"
              download="travelmate-source.zip"
              id="btn-user-portal-download-zip"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md group"
              title="Download Full Project Source Code as a ZIP file"
            >
              <Download className="w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
              <span>Download Project ZIP</span>
            </a>

            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              id="btn-user-portal-qr"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Show SafeVisit QR</span>
            </button>

            <Link
              to="/my-journey"
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>My Journey Chain</span>
            </Link>
          </div>
        </div>

        {/* Bottom Sub-Bar: Auth State & Security Architecture Link */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300">Signed in as:</span>
                  <strong className="text-white font-mono">{user?.email}</strong>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {user?.auth_provider === 'google' ? 'Google OAuth' : 'Email Verified'}
                  </span>
                </div>
              ) : (
                <div className="text-slate-300">
                  <span>Guest Tourist Mode · </span>
                  <span className="text-slate-400">Sign in or create an account for persistent cloud sync.</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectTab('account')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors font-medium text-xs cursor-pointer"
                >
                  View Security Architecture
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN TWO-COLUMN LAYOUT: SIDEBAR TABS (4) + TAB CONTENT (8)           */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="coder-card rounded-2xl p-2 border border-white/10 bg-[#111318]/90 backdrop-blur-xl shadow-xl space-y-1">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  id={`tab-user-portal-${item.id}`}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm ring-1 ring-emerald-400/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* 24/7 Emergency Assistance Card in Sidebar */}
          <div className="coder-card rounded-2xl p-4 border border-rose-500/20 bg-rose-950/10 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
              <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>24/7 Emergency Assistance</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Immediate police dispatch & multi-lingual foreign tourist emergency cell in Delhi.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <a
                href="tel:112"
                className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-center rounded-lg text-xs font-bold transition-colors shadow-md shadow-red-600/30"
              >
                Dial 112
              </a>
              <a
                href="tel:1363"
                className="flex-1 py-1.5 px-3 bg-white/10 hover:bg-white/20 text-slate-200 text-center rounded-lg text-xs font-bold transition-colors border border-white/10"
              >
                Dial 1363
              </a>
            </div>
          </div>

          {/* Danger Zone: Conclude Journey Button */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Session & Privacy Retention
            </span>
            <p className="text-[11px] text-slate-400">
              Finish your Delhi visit and purge ephemeral logs from this device.
            </p>
            <button
              type="button"
              onClick={handleConclude}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Conclude Journey & Purge Data</span>
            </button>
          </div>
        </div>

        {/* Right Tab Content Area (8 cols) */}
        <div className="lg:col-span-8 coder-card rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#111318]/90 backdrop-blur-2xl shadow-2xl min-h-[520px]">
          
          {/* ================================================================= */}
          {/* TAB 1: PROFILE & SAFEPASS                                        */}
          {/* ================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Traveler Profile & SafePass</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your personal preferences and view your temporary 7-day visitor credential.
                </p>
              </div>

              {isSavedAlert && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Profile updated successfully across your Journey Chain.</span>
                </div>
              )}

              {/* SafeVisit Digital Credential Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold tracking-wide text-white uppercase font-display">
                      SafeVisit Digital Credential
                    </span>
                  </div>
                  <StatusBadge status="Official" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pass Code</span>
                    <p className="font-mono font-bold text-white mt-0.5">
                      {journey?.journey_code || user?.journey_code || 'TM-DEL-2026-X89K'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Validity</span>
                    <p className="text-emerald-400 font-semibold mt-0.5">7 Days (Auto-expiring)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Privacy Model</span>
                    <p className="text-slate-300 mt-0.5">Zero-Document Ephemeral</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Accepted for ASI monument entry & emergency police verification
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQRModalOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    View Full QR Pass
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name / Alias</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Country / Nationality</label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {NATIONALITIES.map((n) => (
                        <option key={n} value={n} className="bg-slate-900 text-white">{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Preferred Language</label>
                    <select
                      value={formData.preferred_language}
                      onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code} className="bg-slate-900 text-white">{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="e.g. +44 7700 900077"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 cursor-pointer"
                  >
                    Save Profile Updates
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: DATABASE EXPLORER & CREDENTIAL INSPECTOR                   */}
          {/* ================================================================= */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold font-display text-white">
                      Live Database Explorer & Credential Inspector
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct access to records stored in backend <code className="text-emerald-400 font-mono">users</code> and <code className="text-indigo-400 font-mono">otps</code> tables.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={fetchDatabase}
                    disabled={isDbLoading}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{isDbLoading ? 'Refreshing...' : 'Refresh DB'}</span>
                  </button>

                  {dbData && (
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `travelmate_database_export_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notice Card: Sandbox Simulated Mode vs SMTP Active */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Why OTP Was Not Delivered to Your External Inbox (e.g. Gmail)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {authDiag?.smtp?.configured ? 'SMTP Active' : 'Sandbox Simulated Mode'}
                      </span>
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      To protect user security and privacy, cloud containers cannot send unsolicited real-world emails to public mail servers without an authorized <strong>SMTP mail provider</strong>. For instant SIH evaluation, dynamic OTPs are generated and inspected live below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Storage Engine</span>
                  <div className="text-sm font-bold text-white mt-1 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{dbData?.database?.engine || 'Supabase PostgreSQL'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {dbData?.database?.connected ? 'Live PostgreSQL Pool' : 'Resilient In-Memory Store'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Registered Users</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {dbData?.counts?.total_users ?? 3}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {dbData?.counts?.verified_users ?? 3} verified accounts
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Dynamic OTPs</span>
                  <div className="text-lg font-bold text-indigo-400 mt-1">
                    {dbData?.counts?.active_otps ?? 1}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Single-use 10-min TTL</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Password Encryption</span>
                  <div className="text-xs font-bold text-cyan-300 mt-1 truncate">PBKDF2-SHA512 / scrypt</div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Salted Key Derivation</span>
                </div>
              </div>

              {/* Sub-Tabs: users vs otps vs sql */}
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => setDbSubTab('users')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    dbSubTab === 'users'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Users Table ({dbData?.tables?.users?.length || 3})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDbSubTab('otps')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    dbSubTab === 'otps'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Dynamic OTPs Table ({dbData?.tables?.otps?.length || 1})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDbSubTab('sql')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    dbSubTab === 'sql'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>SQL Schema & Queries</span>
                </button>
              </div>

              {/* USERS TABLE */}
              {dbSubTab === 'users' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-[11px] font-semibold text-slate-300">
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Password Hash</th>
                          <th className="p-3">Salt</th>
                          <th className="p-3">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {(dbData?.tables?.users || []).map((u, idx) => (
                          <tr key={u.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-semibold text-white font-sans">{u.email}</td>
                            <td className="p-3 text-slate-300 font-sans">{u.name || '—'}</td>
                            <td className="p-3">
                              {u.is_verified ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 w-fit">
                                  <span>Unverified</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 max-w-[180px]">
                              <div className="flex items-center space-x-1.5">
                                <span className="truncate text-indigo-300 text-[10px]" title={u.password_hash}>
                                  {u.password_hash ? `${u.password_hash.substring(0, 14)}...` : '—'}
                                </span>
                                {u.password_hash && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(u.password_hash, `hash-${idx}`)}
                                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                    title="Copy full password hash"
                                  >
                                    {copiedKey === `hash-${idx}` ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3 max-w-[120px]">
                              <div className="flex items-center space-x-1.5">
                                <span className="truncate text-cyan-300 text-[10px]" title={u.salt}>
                                  {u.salt ? `${u.salt.substring(0, 10)}...` : '—'}
                                </span>
                                {u.salt && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(u.salt, `salt-${idx}`)}
                                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                    title="Copy cryptographic salt"
                                  >
                                    {copiedKey === `salt-${idx}` ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-400 text-[10px] whitespace-nowrap">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Today'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OTPS TABLE */}
              {dbSubTab === 'otps' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-[11px] font-semibold text-slate-300">
                          <th className="p-3">Email / Identity</th>
                          <th className="p-3">Plain Code (Sandbox Demo)</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Expires In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                        {(dbData?.tables?.otps || []).map((otp, idx) => (
                          <tr key={otp.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 text-white font-sans font-semibold">{otp.email}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 text-xs">
                                {otp.code}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 font-sans">{otp.purpose}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {otp.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[10px]">10 minutes</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SQL SCHEMA */}
              {dbSubTab === 'sql' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
                    <div className="text-emerald-400 font-bold">// PostgreSQL DDL Schema for TravelMate Platform</div>
                    <pre className="text-slate-300 text-[11px] leading-relaxed">
{`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(150) NOT NULL,
  auth_provider VARCHAR(50) DEFAULT 'local',
  role VARCHAR(50) DEFAULT 'tourist',
  nationality VARCHAR(100) DEFAULT 'International',
  journey_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE travelers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temp_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  preferred_language VARCHAR(50) DEFAULT 'en',
  emergency_contact VARCHAR(100),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveler_id UUID NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
  journey_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ACCOUNT & SECURITY                                         */}
          {/* ================================================================= */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">
                  User Account, Authentication & Backend Credential Storage
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete authentication architecture: Registration, Google OAuth, salted password hashing, and ephemeral handles.
                </p>
              </div>

              {/* Account Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-500/20">
                      {isAuthenticated ? (user?.name ? user.name.charAt(0).toUpperCase() : 'U') : 'G'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white">
                          {isAuthenticated ? user?.name : 'Guest Tourist Session'}
                        </h3>
                        {isAuthenticated ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified Account
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Unauthenticated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {isAuthenticated ? user?.email : 'Ephemeral local tourist handle active'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={logout}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          to="/signup"
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Authentication Flow</span>
                    <p className="text-emerald-400 font-bold mt-0.5">PBKDF2 & Google OAuth</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Key Derivation</span>
                    <p className="text-cyan-300 font-mono mt-0.5">100,000 Iterations</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Token Mechanism</span>
                    <p className="text-indigo-300 font-mono mt-0.5">Secure Bearer Sessions</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Data Sovereignty</span>
                    <p className="text-slate-300 mt-0.5">Delhi SafePass Standard</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: MY JOURNEYS                                                */}
          {/* ================================================================= */}
          {activeTab === 'journeys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">My Journeys</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage and inspect your active and planned Indian travel chains.
                  </p>
                </div>
                <Link
                  to="/my-journey"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  Open Journey Timeline
                </Link>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border bg-emerald-500/10 border-emerald-500/40 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {journey?.journey_code || user?.journey_code || 'TM-DEL-2026-X89K'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Delhi Heritage & Tourist Safety Expedition</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                    <span>Destination: National Capital Territory of Delhi</span>
                    <span>•</span>
                    <span>Valid: 7 Days (Auto-expiring)</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status: Currently Monitored via Safe Route Cockpit</span>
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Pass</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: TRAVEL RECORDS                                             */}
          {/* ================================================================= */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Connected Travel Records</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Records associated with active SafePass: <span className="font-mono text-emerald-400">{journey?.journey_code || 'TM-DEL-2026-X89K'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xl font-bold font-display text-amber-400">3</div>
                  <div className="text-[11px] text-slate-400 mt-1">Fares Checked</div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xl font-bold font-display text-teal-400">2</div>
                  <div className="text-[11px] text-slate-400 mt-1">Plates in Vault</div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xl font-bold font-display text-emerald-400">4</div>
                  <div className="text-[11px] text-slate-400 mt-1">Visited Places</div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-xl font-bold font-display text-rose-400">0</div>
                  <div className="text-[11px] text-slate-400 mt-1">Open Grievances</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <span className="font-bold text-white block">Recent Verified Checkins</span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Red Fort (Lal Qila)</span>
                    <span className="text-emerald-400 font-mono">Official Fee ₹550 Paid</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Qutub Minar Complex</span>
                    <span className="text-emerald-400 font-mono">Official Fee ₹550 Paid</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Auto DL-1R-TA-4921 (CP to India Gate)</span>
                    <span className="text-cyan-400 font-mono">Fair Fare ₹72 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: SAFETY & EMERGENCY                                         */}
          {/* ================================================================= */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Emergency Assistance & Helplines</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official 24x7 emergency contacts and foreign mission representations in New Delhi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300">Police & Medical Emergency</span>
                    <span className="text-xs font-mono font-bold text-red-400">112</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Unified Emergency Response Support System (ERSS) with multi-lingual dispatch.
                  </p>
                  <a href="tel:112" className="inline-block mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors">
                    Call 112
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">Tourist Infoline & Assistance</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">1363</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ministry of Tourism 24/7 multi-lingual helpline (toll-free in India).
                  </p>
                  <a href="tel:1363" className="inline-block mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors">
                    Call 1363
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">Women Safety Helpline</span>
                    <span className="text-xs font-mono font-bold text-purple-400">1091</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Delhi Police specialized Women Safety & Rapid Response Cell.
                  </p>
                  <a href="tel:1091" className="inline-block mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors">
                    Call 1091
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300">Delhi Tourist Police Cell</span>
                    <span className="text-xs font-mono font-bold text-blue-400">8750871111</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Dedicated patrol unit at Connaught Place, airports & major railway stations.
                  </p>
                  <a href="tel:8750871111" className="inline-block mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                    Call 8750871111
                  </a>
                </div>
              </div>

              {/* Embassies Directory */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white">Foreign Diplomatic Missions in New Delhi (Chanakyapuri)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {embassies.slice(0, 6).map((emb, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <span>{emb.flag}</span>
                          <span>{emb.country}</span>
                        </span>
                        <a href={`tel:${emb.phone}`} className="text-emerald-400 font-mono font-bold hover:underline">
                          {emb.phone}
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{emb.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: MY REPORTS                                                 */}
          {/* ================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">My Incident & Grievance Reports</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track the investigation and resolution status of reports filed with Delhi Police.
                  </p>
                </div>
                <Link
                  to="/incident"
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                >
                  File New Report
                </Link>
              </div>

              <div className="p-8 text-center rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">No Open Incidents or Disputes</p>
                <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                  Your active trip is safe and compliant. If you ever encounter an overcharging taxi or unauthorized tout, tap above to lodge an instant digital incident ticket.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: LANGUAGE SETTINGS                                          */}
          {/* ================================================================= */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Language & Translation Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure speech synthesis, interface localization, and voice translation options.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">Digital India Bhashini Speech Engine</div>
                    <div className="text-[11px] text-slate-400">
                      Real-time voice-to-voice translation in 29 international & 23 Indian languages
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <Link
                  to="/bhashini-translator"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold hover:underline"
                >
                  <span>Launch Fullscreen Voice Translator</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 9: PRIVACY & STORAGE                                          */}
          {/* ================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Privacy & Zero-Document Storage</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  TravelMate is engineered with a privacy-first architecture compliant with SIH 2026 mandates.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>No Passport or ID Document Upload</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    TravelMate does not require or store passport scans, visa copies, or payment cards. Only an ephemeral 7-day cryptographic handle is generated on your device.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>On-Device Cryptographic Ephemeral Handles</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    All ride evidence, vehicle plate photos, and temporary location pings are encrypted locally and automatically purged after your journey concludes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 10: HELP & FAQS                                               */}
          {/* ================================================================= */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-display text-white">
                  First-Time Foreign Tourist Survival Guide
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Essential advice for navigating Delhi safely, comfortably, and respectfully.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="font-bold text-white">1. Auto-Rickshaw Meter Rules</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Delhi law requires auto-rickshaw drivers to run by the electronic meter. If a driver demands a fixed price, politely say <em>"Meter se chaliye"</em> or check the official fare using TravelMate's Fair Fare tool.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="font-bold text-white">2. Official Monument Ticketing vs Touts</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Never buy monument tickets from individuals outside Red Fort or Qutub Minar claiming the counters are closed. Buy strictly through official ASI QR codes or the verified ASI online portal.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="font-bold text-white">3. Delhi Metro (DMRC) Convenience</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    The Delhi Metro is air-conditioned, world-class, and the fastest way to avoid traffic jams. Purchase a Tourist Card at any metro station for unlimited travel across 1 to 3 days.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* QR Modal for SafeVisit Pass Display */}
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
}
