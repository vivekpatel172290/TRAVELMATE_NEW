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

        {/* Right Actions: SafePass QR Button + Coder Army Login / Account Section */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick SafePass QR Button */}
          <button
            onClick={onOpenQR}
            title="View Official SafeVisit QR Pass"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-mono tracking-wider text-xs hidden sm:inline">{journey?.journey_code || user?.journey_code || 'TM-DEL-2026-X89K'}</span>
            <span className="sm:hidden text-xs">SafePass</span>
          </button>

          {/* Coder Army Signature Glowing Login Button or Authenticated Profile Menu */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="btn-user-profile-menu"
                title={`Logged in as ${user.name}`}
                className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#131622] hover:bg-[#1a1f30] border border-white/15 text-white transition-all group"
              >
                <div className="relative">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-cyan-400/50"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0e1017] rounded-full animate-pulse" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 leading-tight">
                    {user.nationality ? `${user.nationality.slice(0, 8)}` : 'Verified'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0e111a] border border-white/15 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                        {user.journey_code || journey?.journey_code || 'TM-DEL-2026-X89K'}
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
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My SafePass QR Code</span>
                    </Link>
                    <Link
                      to="/safe-journey"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Active Journey Corridor</span>
                    </Link>
                  </div>
                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center space-x-2 w-full px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              id="btn-coder-army-login"
              title="Tourist SafePass Login & Registration"
              className="relative group/coderlogin inline-flex items-center"
            >
              {/* Coder Army Outer Ambient Halo */}
              <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400 opacity-70 group-hover/coderlogin:opacity-100 blur-sm transition-all duration-300 animate-pulse" />
              {/* Coder Army Inner Cyber Core Button */}
              <span className="relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0e1017] group-hover/coderlogin:bg-[#141824] border border-white/20 text-xs sm:text-sm font-extrabold font-display text-white group-hover/coderlogin:text-cyan-300 flex items-center space-x-1.5 transition-all shadow-md active:scale-95">
                <LogIn className="w-3.5 h-3.5 text-cyan-400 group-hover/coderlogin:translate-x-0.5 transition-transform" />
                <span>Login</span>
              </span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
