import React from 'react';
import { Shield, QrCode, Globe, AlertTriangle, Sun, Moon, Menu, X, ShieldCheck, PanelLeft, Radio } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function Header({
  onOpenQR,
  onOpenLang,
  onToggleMobileNav,
  isMobileNavOpen,
  isSidebarCollapsed,
  onToggleCollapse
}) {
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 w-full bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md shadow-black/40 select-none">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: YouTube/GitHub Style Toggle & Brand Header */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Universal Toggle Button (Mobile: open drawer | Desktop: collapse/expand sidebar) */}
          <button
            id="btn-sidebar-toggle-master"
            onClick={() => {
              if (window.innerWidth < 768) {
                if (onToggleMobileNav) onToggleMobileNav();
              } else {
                if (onToggleCollapse) onToggleCollapse();
              }
            }}
            title="Toggle Sidebar (Click or press [ )"
            aria-label="Toggle Sidebar Menu"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-200 group active:scale-95"
          >
            <Menu className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Brand Logo (Visible on mobile, or on desktop when sidebar is collapsed) */}
          <Link
            to="/"
            className={`flex items-center space-x-2 group ${
              isSidebarCollapsed ? 'flex' : 'flex md:hidden'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight font-display text-white">
              TRAVEL<span className="coder-text-gradient">MATE</span>
            </span>
          </Link>

          {/* Desktop Verification Badge (Visible when expanded) */}
          <div className={`hidden md:flex items-center space-x-2 ${isSidebarCollapsed ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-slate-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display tracking-wide">ASI & Police Safety Network</span>
              <span className="text-slate-500 hidden xl:inline">•</span>
              <span className="text-[11px] text-indigo-400 hidden xl:inline font-mono">SIH 2026</span>
            </div>
          </div>
        </div>

        {/* Center: Active SafeVisit Pass Pill */}
        <div className="hidden sm:flex items-center space-x-2.5 bg-[#12151d] px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-md shadow-emerald-950/20 shrink-0">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300">
            Journey Pass:{' '}
            <strong className="text-white font-mono tracking-wider">
              {journey?.journey_code || 'TM-DEL-2026-X89K'}
            </strong>
          </span>
          <StatusBadge status="Official" />
          <button
            id="btn-header-view-pass"
            onClick={onOpenQR}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 hover:underline ml-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Right Actions: Theme Toggle, Language Switcher & SOS Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Global Light / Dark Theme Toggle Button */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Bhashini Language Trigger */}
          <button
            id="btn-header-language-support"
            onClick={onOpenLang}
            title="Open Bhashini Language Support & Phrase Cards"
            className="flex items-center space-x-1.5 text-xs text-slate-300 bg-white/[0.04] hover:bg-white/[0.09] px-3 py-2 rounded-xl border border-white/[0.08] hover:border-indigo-400/40 transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{traveler?.nationality || 'UK'}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="uppercase text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {traveler?.preferred_language || 'EN'} ⇄ HI
            </span>
          </button>

          {/* Quick SOS 112 Emergency Dispatch Link */}
          <Link
            to="/emergency"
            id="btn-header-sos-link"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600/90 via-red-500 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-md shadow-red-600/30 border border-red-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
            <span className="tracking-wide">SOS 112</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
