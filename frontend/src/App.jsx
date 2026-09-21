import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { TravelerProvider } from './context/TravelerContext';
import { JourneyProvider } from './context/JourneyContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import HelplineFloatingBadge from './components/common/HelplineFloatingBadge';
import QRModal from './components/common/QRModal';
import ClaudeChatbotModal from './components/chat/ClaudeChatbotModal';
import LanguageSupportModal from './components/common/LanguageSupportModal';

// Pages
import HomePage from './pages/HomePage';
import MyJourneyPage from './pages/MyJourneyPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthPage from './pages/AuthPage';
import DiscoverPage from './pages/DiscoverPage';
import FareMeterPage from './pages/FareMeterPage';
import SafeJourneyPage from './pages/SafeJourneyPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import IncidentReportPage from './pages/IncidentReportPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TripPlannerPage from './pages/TripPlannerPage';
import PhraseHelperPage from './pages/PhraseHelperPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import { Bot, Languages, Mic } from 'lucide-react';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPlaceDetailPage = location.pathname.startsWith('/place');

  const [isQROpen, setIsQROpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // YouTube / GitHub style collapsible sidebar persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tm_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tm_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Keyboard shortcut: Press '[' or 'Ctrl+B' to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '[' || (e.ctrlKey && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Fixed / Sticky Navigation Bar across 100% full width */}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Main Body: Left YouTube-style Sidebar + Right Page Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar (Desktop Collapsible Rail vs Full + Mobile Slide-Out Drawer) */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onOpenQR={() => setIsQROpen(true)}
        />

        {/* Main Routing Container */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <main className={`flex-1 ${isPlaceDetailPage ? 'h-[calc(100vh-4rem)] overflow-hidden' : 'pb-24 md:pb-16 overflow-x-hidden'}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage defaultMode="login" />} />
              <Route path="/signup" element={<AuthPage defaultMode="signup" />} />
              <Route path="/safe-pass" element={<OnboardingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/home" element={<DiscoverPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/place/:id" element={<PlaceDetailPage />} />
              <Route path="/places/:id" element={<PlaceDetailPage />} />
              <Route path="/planner" element={<TripPlannerPage />} />
              <Route path="/trip-planner" element={<TripPlannerPage />} />
              <Route path="/phrase-helper" element={<PhraseHelperPage />} />
              <Route path="/bhashini-translator" element={<PhraseHelperPage />} />
              <Route path="/language" element={<PhraseHelperPage />} />
              <Route path="/fare-meter" element={<FareMeterPage />} />
              <Route path="/safe-journey" element={<SafeJourneyPage />} />
              <Route path="/vault" element={<EvidenceVaultPage />} />
              <Route path="/incident" element={<IncidentReportPage />} />
              <Route path="/emergency" element={<IncidentReportPage />} />
              <Route path="/my-journey" element={<MyJourneyPage />} />
              <Route path="/journey" element={<MyJourneyPage />} />
              <Route path="/journey-chain" element={<MyJourneyPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Floating Bottom AI & Translation Assist Dock - Dynamically adapts to sidebar */}
      {!isPlaceDetailPage && (
        <div
          className={`fixed bottom-4 left-4 z-30 transition-all duration-300 ${
            isSidebarCollapsed
              ? 'md:bottom-6 md:left-[5.5rem]'
              : 'md:bottom-6 md:left-[17.5rem]'
          }`}
        >
          <div className="flex items-center space-x-2 bg-[#0c0e14]/90 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl shadow-black/70 ring-1 ring-white/5">
            
            {/* 1. TM Chatbot Button */}
            <button
              id="btn-floating-travelmate-ai"
              onClick={() => setIsChatOpen(true)}
              className="group relative flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2 rounded-full shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Open TM Chatbot"
            >
              <Bot className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform animate-pulse" />
              <span className="text-xs font-bold font-display tracking-wide">
                TM Chatbot
              </span>
            </button>

            {/* Legacy ID alias for backwards compatibility with tests/selectors */}
            <button
              id="btn-floating-claude-chat"
              onClick={() => setIsChatOpen(true)}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* 2. Digital India Bhashini Multilingual Translator Icon Button */}
            <button
              id="btn-floating-bhashini-translate"
              onClick={() => {
                navigate('/phrase-helper');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex items-center justify-center bg-gradient-to-r from-[#6b30e3] to-[#8b5cf6] hover:from-[#7c3aed] hover:to-[#a78bfa] text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Open Bhashini AI Multilingual Translator"
              title="Digital India Bhashini Multilingual AI Translator"
            >
              <Languages className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Emergency & Embassy Helpline Directory */}
      <HelplineFloatingBadge />

      {/* Modals */}
      <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <ClaudeChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <LanguageSupportModal
        isOpen={isLangOpen}
        onClose={() => {
          setIsLangOpen(false);
          setIsVoiceActive(false);
        }}
        initialVoiceActive={isVoiceActive}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TravelerProvider>
        <JourneyProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </AuthProvider>
        </JourneyProvider>
      </TravelerProvider>
    </ThemeProvider>
  );
}
