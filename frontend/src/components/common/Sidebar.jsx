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
  Radio,
  UserCheck,
  Home,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenQR,
  onOpenLang
}) {
  const { traveler } = useTraveler();
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

  const renderSidebarContent = (forceExpanded = false) => {
    const collapsed = !forceExpanded && isCollapsed;

    return (
      <div className="relative flex flex-col h-full bg-[#0a0c10]/95 backdrop-blur-2xl border-r border-white/[0.08] select-none text-slate-200">
        
        {/* RIGHT EDGE FLOATING TOGGLE TAB (Desktop only) */}
        {!forceExpanded && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand Sidebar (Ctrl+B / [ )" : "Collapse Sidebar (Ctrl+B / [ )"}
            aria-label="Toggle Sidebar Position"
            className="hidden md:flex absolute -right-3.5 top-16 z-50 w-7 h-7 rounded-full bg-[#161a24] border border-white/25 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-400 shadow-xl shadow-black items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            )}
          </button>
        )}

        {/* Sidebar Header: Brand & Right-Side Toggle Button */}
        <div
          className={`p-4 border-b border-white/[0.08] flex items-center shrink-0 bg-gradient-to-r from-indigo-500/[0.05] via-transparent to-transparent ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {collapsed ? (
            /* Collapsed Header: Centered Icon / Expand Trigger */
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar (Click or press [ )"
              aria-label="Expand Sidebar"
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 transition-all group"
            >
              <PanelLeftOpen className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            /* Expanded Header: Logo on Left, Toggle on Right */
            <>
              <Link to="/" onClick={handleLinkClick} className="flex items-center space-x-3 group min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/25 ring-1 ring-white/25 group-hover:scale-105 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#0a0c10] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-lg font-black tracking-tight font-display text-white">
                      TRAVEL<span className="coder-text-gradient">MATE</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 uppercase tracking-widest shadow-sm">
                      Delhi
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium tracking-tight truncate">
                    Tourist Trust & Safety Layer
                  </p>
                </div>
              </Link>

              {/* RIGHT SIDE TOGGLE BUTTON */}
              <div className="flex items-center space-x-1 shrink-0 ml-2">
                <button
                  onClick={onToggleCollapse}
                  title="Collapse Sidebar ([)"
                  aria-label="Collapse Sidebar"
                  className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 transition-all active:scale-95"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>

                {/* Mobile Close */}
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
                  aria-label="Close navigation sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Links Scrollable Area */}
        <div
          className={`flex-1 overflow-y-auto ${
            collapsed ? 'px-2.5 py-4 space-y-3.5' : 'px-3.5 py-4 space-y-5'
          } custom-scrollbar`}
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-3 flex items-center space-x-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${group.dotColor} shadow-[0_0_8px_currentColor]`} />
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300 font-display">
                    {group.title}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover'))
                      || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                      || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

                  if (collapsed) {
                    return (
                      <div key={item.to} className="relative group flex justify-center">
                        <NavLink
                          to={item.to}
                          onClick={handleLinkClick}
                          aria-label={item.label}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-xl shadow-indigo-600/40 ring-2 ring-indigo-400/80 scale-105'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.08] hover:scale-105'
                          }`}
                        >
                          <Icon className="w-7 h-7 transition-transform group-hover:scale-110" />
                        </NavLink>

                        {/* Floating Tooltip for Minimized Rail */}
                        <div className="absolute left-full ml-3.5 px-3.5 py-2 bg-[#121622] text-white text-sm rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 flex items-center space-x-2.5">
                          <span className="font-bold">{item.label}</span>
                          {item.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 font-extrabold uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleLinkClick}
                      id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/25 via-purple-500/10 to-transparent text-white font-bold border-l-4 border-indigo-400 shadow-md shadow-indigo-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border-l-4 border-transparent hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-500/50 shadow-sm shadow-indigo-500/30'
                              : 'bg-white/[0.04] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.08]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`truncate tracking-tight text-sm sm:text-base ${isActive ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-300 group-hover:text-slate-200 truncate tracking-tight font-medium">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider shrink-0 ml-2 ${
                            isActive
                              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                              : item.badgeColor === 'violet'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : item.badgeColor === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.badgeColor === 'indigo'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : item.badgeColor === 'cyan'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : item.badgeColor === 'amber'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
        <div
          className={`border-t border-white/[0.08] bg-[#07090e]/95 shrink-0 ${
            collapsed ? 'p-2.5 space-y-3 flex flex-col items-center' : 'p-4 space-y-3'
          }`}
        >
          {collapsed ? (
            <>
              {/* Collapsed SOS Icon Button */}
              <div className="relative group">
                <Link
                  to="/emergency"
                  onClick={handleLinkClick}
                  aria-label="Emergency SOS 112"
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-all hover:scale-105"
                >
                  <AlertTriangle className="w-7 h-7 animate-bounce" />
                </Link>
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-red-950 text-red-200 text-xs rounded-xl shadow-2xl border border-red-500/30 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  EMERGENCY SOS 112
                </div>
              </div>

              {/* Collapsed Language Button */}
              <div className="relative group">
                <button
                  onClick={onOpenLang}
                  aria-label="Language"
                  className="w-12 h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-all"
                >
                  <Globe className="w-5 h-5 text-indigo-400" />
                </button>
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#141822] text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {traveler?.preferred_language?.toUpperCase() || 'EN'} ⇄ HI
                </div>
              </div>

              {/* Collapsed Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-12 h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-amber-300 flex items-center justify-center border border-white/10 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              </button>
            </>
          ) : (
            <>
              {/* Full SOS Emergency Button */}
              <Link
                to="/emergency"
                onClick={handleLinkClick}
                id="btn-sidebar-sos"
                className="group relative flex items-center justify-center space-x-2.5 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-extrabold shadow-lg shadow-red-600/30 border border-red-400/40 transition-all duration-200 hover:scale-[1.02] active:scale-98"
              >
                <AlertTriangle className="w-5 h-5 animate-bounce shrink-0" />
                <span className="tracking-wider">EMERGENCY SOS 112</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full ring-2 ring-[#080e18] animate-ping" />
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
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/40 text-slate-200 hover:text-white text-xs font-bold transition-all group"
                >
                  <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                  <span className="truncate">
                    {traveler?.preferred_language?.toUpperCase() || 'EN'} ⇄ HI
                  </span>
                </button>

                <button
                  id="btn-sidebar-theme"
                  onClick={toggleTheme}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-amber-300 transition-all"
                  aria-label="Toggle Theme"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  )}
                </button>
              </div>

              {/* Active Protection Status Pill */}
              <div className="flex items-center justify-between text-xs text-slate-300 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold truncate max-w-[120px]">
                    {traveler?.nationality || 'United Kingdom'}
                  </span>
                </div>
                <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-extrabold text-xs">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span>Protected</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Left Sidebar (Collapsible: w-22 vs w-72) */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30 shadow-2xl shadow-black/60 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-22 sm:w-24' : 'w-64 lg:w-72'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop (Always Expanded) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-300">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
