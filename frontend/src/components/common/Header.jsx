import React from 'react';
import { QrCode, Menu, X } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({
  isSidebarCollapsed,
  onToggleCollapse,
  onOpenQR,
  onToggleMobileNav,
  isMobileNavOpen
}) {
  const { journey } = useTraveler();
  const location = useLocation();

  const topNavLinks = [
    { to: '/', label: 'Home', exact: true },
    { to: '/safe-pass', label: 'SafeVisit Pass' },
    { to: '/home', label: 'Verified Places' },
    { to: '/planner', label: 'Trip Planner' },
    { to: '/fare-meter', label: 'Fair Fare' },
    { to: '/vault', label: 'Vault' },
    { to: '/phrase-helper', label: 'Phrase Translator' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-lg shadow-black/40 select-none transition-colors duration-300">
      <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
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
            <img
              src="/logo.jpg"
              alt="TravelMate Official Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/25 shadow-md shadow-cyan-500/20 group-hover:scale-105 group-hover:ring-cyan-400/60 transition-all duration-200"
            />
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

        {/* Center: Permanently Fixed & Visible Top Navigation Links */}
        <nav
          className="hidden md:flex items-center justify-center flex-1 max-w-5xl mx-2 lg:mx-4"
          aria-label="Quick Top Navigation"
        >
          <div className="grid grid-cols-7 gap-1 p-1.5 w-full bg-[#121622]/80 border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30 backdrop-blur-md">
            {topNavLinks.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover' || location.pathname.startsWith('/place')))
                  || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                  || (item.to === '/planner' && (location.pathname === '/planner' || location.pathname === '/trip-planner'))
                  || (item.to === '/vault' && location.pathname === '/vault')
                  || (item.to === '/phrase-helper' && (location.pathname === '/phrase-helper' || location.pathname === '/language'))
                  || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2 lg:px-3 py-2 rounded-xl text-[12px] lg:text-[13px] font-bold flex items-center justify-center text-center transition-all duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20 font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right Actions: SafePass QR Button ONLY (Day/Night mode removed) */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Quick SafePass QR Button */}
          <button
            onClick={onOpenQR}
            title="View Official SafeVisit QR Pass"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-mono tracking-wider text-xs hidden sm:inline">{journey?.journey_code || 'TM-DEL-2026-X89K'}</span>
            <span className="sm:hidden text-xs">SafePass</span>
          </button>
        </div>

      </div>
    </header>
  );
}
