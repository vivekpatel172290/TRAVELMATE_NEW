import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Menu, X, LogIn, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({
  isSidebarCollapsed,
  onToggleCollapse,
  onOpenQR,
  onToggleMobileNav,
  isMobileNavOpen
}) {
  const { journey } = useTraveler();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="w-full px-2.5 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: YouTube-style Hamburger Toggle + Fixed TravelMate Brand (Never shifts on sidebar toggle) */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
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
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
          >
            {isMobileNavOpen ? (
              <X className="w-5 h-5 text-indigo-400 md:hidden" />
            ) : null}
            <Menu className={`w-5 h-5 ${isMobileNavOpen ? 'hidden md:block' : 'block'}`} />
          </button>

          {/* Fixed Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 group">
            <img
              src="/logo.jpg"
              alt="TravelMate Official Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/25 shadow-md shadow-cyan-500/20 group-hover:scale-105 group-hover:ring-cyan-400/60 transition-all duration-200"
            />
            <div className="flex items-center space-x-1.5">
              <span className="text-sm sm:text-lg font-black tracking-tight font-display text-white">
                TRAVEL<span className="coder-text-gradient">MATE</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-widest hidden sm:inline-block">
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

        {/* Right Actions: SafePass QR Button + Coder Army Login / Account Section */}
        {/* Right Actions: SafePass QR Button + Coder Army Login / Account Section */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Quick SafePass QR Button */}
          <button
            onClick={onOpenQR}
            title="View Official SafeVisit QR Pass"
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold transition-all"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="font-mono tracking-wider text-xs hidden md:inline">{journey?.journey_code || user?.journey_code || 'TM-DEL-2026-X89K'}</span>
            <span className="md:hidden text-[11px] sm:text-xs font-semibold">Pass</span>
          </button>

          {/* Exact Coder Army Login Button or Authenticated Profile Menu */}
          {isAuthenticated && user ? (
            <div className="relative profile-dropdown-container" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="btn-user-profile-menu"
                title={`Logged in as ${user.name}`}
                className="group flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-black/30 backdrop-blur-xl rounded-full border border-white/10 hover:border-[#6b30e3]/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-[#6b30e3]/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 border-2 border-[#0b0e14] rounded-full animate-pulse" />
                </div>
                <span className="text-xs sm:text-sm font-semibold font-display text-[#f1f5f9] max-w-[65px] sm:max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#94a3b8] transition-transform duration-300 ${userMenuOpen ? 'rotate-180 text-[#8b5cf6]' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-60 sm:w-64 bg-[#0e111a]/95 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#94a3b8] truncate">{user.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6b30e3]/20 text-[#c4b5fd] font-mono border border-[#6b30e3]/40">
                        {user.journey_code || journey?.journey_code || 'SafePass Active'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/safe-pass"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Shield className="w-4 h-4 text-[#8b5cf6]" />
                      <span>My SafePass QR Code</span>
                    </Link>
                    <Link
                      to="/safe-journey"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Active Journey Corridor</span>
                    </Link>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center space-x-2.5 w-full px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="no-underline shrink-0" id="btn-coder-login">
              <button
                type="button"
                className="group relative px-3.5 sm:px-6 py-1.5 sm:py-2.5 bg-[#6b30e3] backdrop-blur-xl rounded-full border cursor-pointer border-white/10 text-white hover:text-white transition-all duration-300 overflow-hidden hover:scale-105 shadow-md hover:shadow-lg shadow-[#6b30e3]/40"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm font-display tracking-wide">Login</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6b30e3] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
