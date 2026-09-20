import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  MapPin,
  CalendarDays,
  Calculator,
  Navigation,
  Camera,
  AlertCircle,
  LayoutDashboard,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Globe,
  User,
  LogIn,
  LogOut,
  Shield
} from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { journey } = useTraveler();

  const navGroups = [
    {
      title: 'Portal & Identity',
      dotColor: 'bg-indigo-400',
      items: [
        {
          to: '/',
          label: 'Home',
          shortLabel: 'Home',
          badge: 'Live',
          badgeColor: 'violet',
          icon: Home,
          exact: true,
          description: 'Home portal & verified stream'
        },
        {
          to: '/safe-pass',
          label: 'SafeVisit Pass',
          shortLabel: 'SafePass',
          badge: 'Verified',
          badgeColor: 'emerald',
          icon: QrCode,
          description: 'Digital 7-day QR identity'
        },
        {
          to: '/phrase-helper',
          label: 'Phrase Converter',
          shortLabel: 'Phrases',
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
          shortLabel: 'Places',
          badge: 'ASI Auth',
          badgeColor: 'cyan',
          icon: MapPin,
          description: 'Official entry fees & ticketing'
        },
        {
          to: '/planner',
          label: 'Trip Planner',
          shortLabel: 'Planner',
          icon: CalendarDays,
          description: 'Automated itinerary & news radar'
        },
        {
          to: '/fare-meter',
          label: 'Fair Fare Meter',
          shortLabel: 'Fare',
          icon: Calculator,
          description: 'Delhi Transport Dept rates benchmark'
        },
        {
          to: '/safe-journey',
          label: 'Safe Track',
          shortLabel: 'Track',
          badge: 'Live GPS',
          badgeColor: 'amber',
          icon: Navigation,
          description: 'Police beat corridor safety & alerts'
        },
        {
          to: '/vault',
          label: 'RideSafe Vault',
          shortLabel: 'Vault',
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
          shortLabel: 'Incident',
          icon: AlertCircle,
          description: 'Direct authority complaint logging'
        },
        {
          to: '/admin',
          label: 'Admin Portal',
          shortLabel: 'Admin',
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
            className="hidden md:flex absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-[#161a24] border border-white/25 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-400 shadow-xl shadow-black items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        )}

        {/* Mobile Slide-over Header (Only visible on mobile drawer) */}
        {forceExpanded && (
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-white/[0.02]">
            <Link to="/" onClick={onCloseMobile} className="flex items-center space-x-2.5">
              <img
                src="/logo.jpg"
                alt="TravelMate Official Logo"
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20 shadow-md shadow-cyan-500/20"
              />
              <span className="text-base font-black tracking-tight font-display text-white">
                TRAVEL<span className="coder-text-gradient">MATE</span>
              </span>
            </Link>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Links Scrollable Area */}
        <div
          className={`flex-1 overflow-y-auto ${
            collapsed ? 'px-1.5 py-3 space-y-3' : 'px-3 py-4 space-y-4'
          } custom-scrollbar`}
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="px-2.5 flex items-center space-x-2 mb-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.dotColor} shadow-[0_0_6px_currentColor]`} />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                    {group.title}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : (item.to === '/home' && (location.pathname === '/home' || location.pathname === '/discover'))
                      || (item.to === '/safe-pass' && (location.pathname === '/safe-pass' || location.pathname === '/onboarding'))
                      || (item.to === '/phrase-helper' && (location.pathname === '/phrase-helper' || location.pathname === '/language'))
                      || (location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/'));

                  if (collapsed) {
                    return (
                      <div key={item.to} className="relative group flex justify-center">
                        <NavLink
                          to={item.to}
                          onClick={handleLinkClick}
                          aria-label={item.label}
                          className={`w-15 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-600/20 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="text-[10px] font-semibold leading-tight text-center truncate max-w-[58px] text-slate-200">
                            {item.shortLabel || item.label}
                          </span>
                        </NavLink>

                        {/* Floating Tooltip for Minimized Rail */}
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#121622] text-white text-xs rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 flex items-center space-x-2">
                          <span className="font-bold text-slate-100">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-extrabold uppercase">
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
                      className={`relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-indigo-500/20 text-white font-bold border-l-3 border-indigo-400 shadow-sm shadow-indigo-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border-l-3 border-transparent hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/50'
                              : 'bg-white/[0.05] text-slate-300 group-hover:text-white group-hover:bg-white/[0.1]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-[13.5px] font-semibold tracking-tight whitespace-nowrap ${
                                isActive ? 'text-white font-bold' : 'text-slate-100 group-hover:text-white'
                              }`}
                            >
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9.5px] leading-none px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider shrink-0 ${
                                  isActive
                                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.25)]'
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
                          </div>
                          <div className="text-[11.5px] text-slate-400 group-hover:text-slate-300 truncate tracking-tight font-normal pt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* TOURIST ACCOUNT SECTION */}
        {collapsed ? (
          /* Collapsed Mini Rail Account Icon */
          <div className="p-2 border-t border-white/[0.08] flex justify-center shrink-0">
            {isAuthenticated && user ? (
              <div className="relative group/miniacc flex justify-center">
                <Link
                  to="/safe-pass"
                  onClick={handleLinkClick}
                  className="relative p-1 rounded-xl hover:bg-white/10 transition-all block"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-400/50"
                  />
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0a0c10] rounded-full animate-pulse" />
                </Link>
                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#121622] text-white text-xs rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover/miniacc:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all">
                  <p className="font-bold text-slate-100">{user.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono">{user.journey_code || journey?.journey_code || 'SafePass Active'}</p>
                </div>
              </div>
            ) : (
              <div className="relative group/minilogin flex justify-center">
                <Link
                  to="/login"
                  onClick={handleLinkClick}
                  className="w-9 h-9 rounded-full bg-[#6b30e3] hover:bg-[#8b5cf6] border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 shadow-md shadow-[#6b30e3]/40"
                  title="Tourist SafePass Login"
                >
                  <LogIn className="w-4 h-4 text-white" />
                </Link>
                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#121622] text-white text-xs rounded-xl shadow-2xl border border-white/15 whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover/minilogin:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all">
                  <span className="font-bold text-slate-100">Sign In / Register</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Expanded Full Account Card */
          <div className="p-3 border-t border-white/[0.08] bg-[#0c0f18]/90 shrink-0">
            {isAuthenticated && user ? (
              <div>
                <div className="flex items-center space-x-3 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="relative">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-cyan-400/40 shrink-0"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0c0f18] rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-400 font-mono truncate">{user.journey_code || journey?.journey_code || 'TM-DEL-2026-X89K'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.nationality || 'International'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <Link
                    to="/safe-pass"
                    onClick={handleLinkClick}
                    className="px-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>My SafePass</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-2 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold text-rose-300 hover:text-rose-200 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group/acc">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-40 group-hover/acc:opacity-75 blur-sm transition-all" />
                <div className="relative p-3 rounded-2xl bg-[#111420] border border-white/15">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white font-display">Tourist SafePass</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mb-3">
                    Sign in to sync your live GPS telemetry, access verified ASI tickets, and activate priority SOS.
                  </p>
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="w-full block no-underline"
                  >
                    <button
                      type="button"
                      className="group relative w-full px-4 py-2.5 bg-[#6b30e3] backdrop-blur-xl rounded-full border cursor-pointer border-white/10 text-white hover:text-white transition-all duration-300 overflow-hidden hover:scale-[1.02] shadow-md hover:shadow-lg shadow-[#6b30e3]/40 flex items-center justify-center gap-2"
                    >
                      <div className="flex items-center gap-2 relative z-10">
                        <LogIn className="w-4 h-4 text-white" />
                        <span className="font-semibold text-xs font-display tracking-wide">Sign In / Register</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6b30e3] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Clean Status Beat Line */}
            <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300 text-[11px]">Delhi Police Beat Sync</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Left Sidebar (Collapsible: w-18 mini rail vs w-72 full) */}
      <aside
        className={`hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)] shrink-0 z-30 shadow-xl shadow-black/50 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-72'
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
