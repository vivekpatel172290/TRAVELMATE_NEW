import React from 'react';
import { Shield, QrCode, Globe, AlertTriangle, Sun, Moon, Menu, X, ShieldCheck } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function Header({ onOpenQR, onOpenLang, onToggleMobileNav, isMobileNavOpen }) {
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 w-full glass-panel border-b border-surface-border">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Mobile Left: Hamburger Button & Brand */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            id="btn-mobile-nav-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-emerald-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight font-display text-white">
              TRAVEL<span className="text-emerald-400">MATE</span>
            </span>
          </Link>
        </div>

        {/* Desktop Left: Contextual Verification Badge */}
        <div className="hidden md:flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ASI & Delhi Police Safety Network</span>
          </div>
          <span className="text-xs text-slate-400 hidden lg:inline">
            Official Anti-Scam & Transit Protection Protocol
          </span>
        </div>

        {/* Center / Active SafeVisit Pass Pill */}
        <div className="hidden sm:flex items-center space-x-2.5 bg-surface-card/90 px-3 py-1.5 rounded-full border border-surface-border">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-slate-300">
            Journey Pass: <strong className="text-white font-mono">{journey?.journey_code || 'TM-DEL-2026-X89K'}</strong>
          </span>
          <StatusBadge status="Official" />
          <button
            id="btn-header-view-pass"
            onClick={onOpenQR}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center space-x-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Right Actions: Theme Toggle, Nationality/Language & Emergency Quick Tap */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Global Light / Dark Theme Toggle Button */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button
            id="btn-header-language-support"
            onClick={onOpenLang}
            title="Open Bhashini Language Support & Phrase Cards"
            className="flex items-center space-x-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-indigo-400/40 transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{traveler?.nationality || 'UK'}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="uppercase text-[11px] font-bold text-emerald-400">
              {traveler?.preferred_language || 'EN'} ⇄ HI
            </span>
          </button>

          <Link
            to="/emergency"
            id="btn-header-sos-link"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>SOS 112</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
