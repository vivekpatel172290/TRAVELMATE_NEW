import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Sun, Moon, Menu, X } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({
  isSidebarCollapsed,
  onToggleCollapse,
  onOpenQR,
  onToggleMobileNav,
  isMobileNavOpen
}) {
  const { journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Signature scroll-up navigation detection & sticky-to-top persistence
  const [showNavLinks, setShowNavLinks] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // At top of page, always show
      if (currentScrollY <= 30) {
        setShowNavLinks(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down: tuck away center pills for minimal distraction
        setShowNavLinks(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP: instantly stick to top & surface all navigation links smoothly
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
    { to: '/fare-meter', label: 'Fair Fare' },
    { to: '/phrase-helper', label: 'Phrase Translator' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0c10]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-md shadow-black/50 select-none transition-all duration-300">
      <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: YouTube-style Hamburger Toggle + Fixed TravelMate Brand (Never shifts on sidebar toggle) */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Hamburger Menu Toggle (Desktop toggles sidebar collapse; Mobile toggles drawer) */}
          <button
            id="btn-nav-toggle"
            onClick={() => {
              if (window.innerWidth < 768) {
                if (onToggleMobileNav) onToggleMobileNav();
              } else {
                if (onToggleCollapse) onToggleCollapse();
              }
            }}
            aria-label="Toggle Navigation Guide"
            title="Toggle Guide Sidebar"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-indigo-400 md:hidden" />
            ) : null}
            <Menu className={`w-5 h-5 ${isMobileNavOpen ? 'hidden md:block' : 'block'}`} />
          </button>

          {/* Fixed Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight font-display text-white">
                TRAVEL<span className="coder-text-gradient">MATE</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-widest hidden xs:inline-block">
                Delhi
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Even-Sized Quick Top Navigation (Home, SafePass, Places, Fair Fare, Phrase Translator) */}
        <nav
          className={`hidden md:flex items-center justify-center flex-1 max-w-2xl mx-auto transition-all duration-300 transform ${
            showNavLinks
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-2 pointer-events-none scale-95'
          }`}
          aria-label="Quick Top Navigation"
        >
          <div className="flex items-center w-full p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30 backdrop-blur-md gap-1">
            {topNavLinks.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover'))
                  || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                  || (item.to === '/phrase-helper' && (location.pathname === '/phrase-helper' || location.pathname === '/language'))
                  || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex-1 min-w-[100px] lg:min-w-[120px] h-9 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center text-center transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right Actions: SafePass QR Button & Global Theme Switcher ONLY */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick SafePass QR Button */}
          <button
            onClick={onOpenQR}
            title="View Official SafeVisit QR Pass"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-mono tracking-wider text-xs">{journey?.journey_code || 'TM-DEL-2026-X89K'}</span>
          </button>

          {/* Global Light / Dark Theme Toggle */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
