import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Globe, AlertTriangle, Sun, Moon, Menu, X, ShieldCheck } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({
  onOpenQR,
  onOpenLang,
  onToggleMobileNav,
  isMobileNavOpen
}) {
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Coder Army signature scroll-up navigation detection
  const [showNavLinks, setShowNavLinks] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // At top, always show
      if (currentScrollY <= 30) {
        setShowNavLinks(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down: gracefully hide top nav links
        setShowNavLinks(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP: reveal Coder Army style navigation bar immediately!
        setShowNavLinks(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topNavLinks = [
    { to: '/', label: 'Home', exact: true },
    { to: '/safe-pass', label: 'SafeVisit Pass' },
    { to: '/home', label: 'Verified Places' },
    { to: '/fare-meter', label: 'Fair Fare' }
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-[#0a0c10]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-md shadow-black/40 select-none transition-all duration-300">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Mobile Drawer Toggle */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Mobile Hamburger Button (ONLY visible on mobile, completely removed on desktop) */}
          <button
            id="btn-mobile-nav-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle Mobile Navigation"
            className="md:hidden p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 hover:text-white border border-white/[0.08] transition-all"
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-indigo-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight font-display text-white">
                  TRAVEL<span className="coder-text-gradient">MATE</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-widest">
                  Delhi
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Coder Army Signature Scroll-Up Navigation Bar */}
        <nav
          className={`hidden md:flex items-center transition-all duration-300 transform ${
            showNavLinks
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-2 pointer-events-none scale-95'
          }`}
          aria-label="Quick Top Navigation"
        >
          <div className="flex items-center space-x-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30 backdrop-blur-md">
            {topNavLinks.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover'))
                  || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                  || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right Actions: QR Action, Theme Toggle, Language Switcher & SOS */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick SafePass QR Button (Accessible directly from header) */}
          <button
            onClick={onOpenQR}
            title="View Official SafeVisit QR Pass"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-mono tracking-wider">{journey?.journey_code || 'TM-DEL-2026-X89K'}</span>
          </button>

          {/* Global Light / Dark Theme Toggle Button */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Bhashini Language Trigger */}
          <button
            id="btn-header-language-support"
            onClick={onOpenLang}
            title="Open Bhashini Language Support & Phrase Cards"
            className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 bg-white/[0.04] hover:bg-white/[0.09] px-3 sm:px-3.5 py-2 rounded-xl border border-white/[0.08] hover:border-indigo-400/40 transition-all group font-bold"
          >
            <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:inline">{traveler?.nationality || 'UK'}</span>
            <span className="hidden lg:inline text-slate-500">•</span>
            <span className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-extrabold">
              {traveler?.preferred_language || 'EN'} ⇄ HI
            </span>
          </button>

          {/* Quick SOS 112 Emergency Dispatch Link */}
          <Link
            to="/emergency"
            id="btn-header-sos-link"
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-red-600/30 border border-red-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 text-white animate-bounce shrink-0" />
            <span className="tracking-wide">SOS 112</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
