import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  QrCode,
  Globe,
  MapPin,
  CalendarDays,
  Calculator,
  Navigation,
  Camera,
  AlertCircle,
  LayoutDashboard,
  X,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  Radio,
  UserCheck,
  Home
} from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from './StatusBadge';

export default function Sidebar({ isOpenMobile, onCloseMobile, onOpenQR, onOpenLang }) {
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navGroups = [
    {
      title: 'Portal & Identity',
      dotColor: 'bg-indigo-400',
      items: [
        {
          to: '/',
          label: 'Overview & Radar',
          badge: 'Live',
          badgeColor: 'violet',
          icon: Home,
          exact: true,
          description: 'Coder Army style radar & stats'
        },
        {
          to: '/safe-pass',
          label: 'SafeVisit Pass',
          badge: 'Verified',
          badgeColor: 'emerald',
          icon: QrCode,
          description: 'Digital 7-day QR identity'
        },
        {
          to: '/phrase-helper',
          label: 'Phrase Converter',
          badge: 'Bhashini AI',
          badgeColor: 'indigo',
          icon: Globe,
          description: 'Real-time audio & Hindi speech'
        }
      ]
    },
    {
      title: 'Explore & Transit',
      dotColor: 'bg-cyan-400',
      items: [
        {
          to: '/home',
          label: 'Verified Places',
          badge: 'ASI Auth',
          badgeColor: 'cyan',
          icon: MapPin,
          description: 'Official entry fees & ticketing'
        },
        {
          to: '/planner',
          label: 'Trip Planner',
          icon: CalendarDays,
          description: 'Automated itinerary & news radar'
        },
        {
          to: '/fare-meter',
          label: 'Fair Fare Meter',
          icon: Calculator,
          description: 'Delhi Transport Dept rates benchmark'
        },
        {
          to: '/safe-journey',
          label: 'Safe Track',
          badge: 'Live GPS',
          badgeColor: 'amber',
          icon: Navigation,
          description: 'Police beat corridor safety & alerts'
        },
        {
          to: '/vault',
          label: 'RideSafe Vault',
          icon: Camera,
          description: 'Vehicle photo & plate OCR evidence'
        }
      ]
    },
    {
      title: 'Safety & Administration',
      dotColor: 'bg-rose-400',
      items: [
        {
          to: '/incident',
          label: 'Incident Report',
          icon: AlertCircle,
          description: 'Direct authority complaint logging'
        },
        {
          to: '/admin',
          label: 'Admin Portal',
          icon: LayoutDashboard,
          description: 'Supervisory monitoring & audits'
        }
      ]
    }
  ];

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1322]/95 backdrop-blur-2xl border-r border-white/[0.08] select-none text-slate-200">
      {/* Brand Header */}
      <div className="p-4 lg:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-transparent">
        <Link to="/" onClick={handleLinkClick} className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center p-2.5 shadow-xl shadow-emerald-500/25 ring-1 ring-white/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#0b1322] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-tight font-display text-white">
                TRAVEL<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">MATE</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 uppercase tracking-widest shadow-sm">
                Delhi
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Tourist Trust & Safety Layer
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
          aria-label="Close navigation sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* SafeVisit Pass Holographic Card */}
      <div className="p-3.5 lg:p-4 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
        <div className="group relative rounded-2xl p-3.5 bg-gradient-to-br from-emerald-900/25 via-[#132035]/90 to-indigo-950/20 border border-emerald-500/30 shadow-lg shadow-black/40 overflow-hidden hover:border-emerald-400/50 transition-all duration-300">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-400/25 transition-all duration-500" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 font-display">
                SafeVisit Pass
              </span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              Official
            </span>
          </div>

          <div className="mb-2.5">
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Journey Credential</div>
            <div className="text-xs font-mono font-bold text-white tracking-widest bg-black/30 px-2 py-1 rounded-md border border-white/5 inline-block mt-0.5">
              {journey?.journey_code || 'TM-DEL-2026-X89K'}
            </div>
          </div>

          <button
            id="btn-sidebar-view-pass"
            onClick={() => {
              if (onOpenQR) onOpenQR();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all duration-200 group-hover:scale-[1.02] active:scale-98"
          >
            <QrCode className="w-4 h-4 transition-transform group-hover:rotate-6" />
            <span className="tracking-wide">Show QR Pass</span>
          </button>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 flex items-center space-x-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${group.dotColor} shadow-[0_0_8px_currentColor]`} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-display">
                {group.title}
              </span>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.to
                  : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover'))
                    || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                    || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleLinkClick}
                    id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/25 via-purple-500/10 to-transparent text-white font-semibold border-l-[3px] border-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-l-[3px] border-transparent hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40 shadow-sm shadow-indigo-500/30'
                            : 'bg-white/[0.04] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.08]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`truncate tracking-tight ${isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate tracking-tight font-normal">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                            : item.badgeColor === 'violet'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : item.badgeColor === 'emerald'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : item.badgeColor === 'indigo'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : item.badgeColor === 'cyan'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Controls & Emergency */}
      <div className="p-3.5 lg:p-4 border-t border-white/[0.08] bg-[#080e18]/80 space-y-2.5 shrink-0">
        {/* SOS Emergency Button */}
        <Link
          to="/emergency"
          onClick={handleLinkClick}
          id="btn-sidebar-sos"
          className="group relative flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 border border-red-400/40 transition-all duration-200 hover:scale-[1.02] active:scale-98"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
          <span className="tracking-wider">EMERGENCY SOS 112</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#080e18] animate-ping" />
        </Link>

        {/* Quick Utility Row: Language & Theme */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-sidebar-language"
            onClick={() => {
              if (onOpenLang) onOpenLang();
              if (onCloseMobile) onCloseMobile();
            }}
            title="Open Language Support & Phrases"
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="truncate">
              {traveler?.preferred_language?.toUpperCase() || 'EN'} ⇄ HI
            </span>
          </button>

          <button
            id="btn-sidebar-theme"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-amber-300 transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>

        {/* Active Protection Status Pill */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium truncate max-w-[110px]">
              {traveler?.nationality || 'United Kingdom'}
            </span>
          </div>
          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span>Protected</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 shrink-0 z-30 shadow-2xl shadow-black/50">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
