import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TravelerProvider } from './context/TravelerContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import HelplineFloatingBadge from './components/common/HelplineFloatingBadge';
import QRModal from './components/common/QRModal';
import ClaudeChatbotModal from './components/chat/ClaudeChatbotModal';
import LanguageSupportModal from './components/common/LanguageSupportModal';

// Pages
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import FareMeterPage from './pages/FareMeterPage';
import SafeJourneyPage from './pages/SafeJourneyPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import IncidentReportPage from './pages/IncidentReportPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TripPlannerPage from './pages/TripPlannerPage';
import PhraseHelperPage from './pages/PhraseHelperPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import { Bot } from 'lucide-react';

export default function App() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
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
    <ThemeProvider>
      <TravelerProvider>
        <BrowserRouter>
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
                <main className="flex-1 pb-24 md:pb-16 overflow-x-hidden">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/safe-pass" element={<OnboardingPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/home" element={<DiscoverPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/place/:id" element={<PlaceDetailPage />} />
                    <Route path="/places/:id" element={<PlaceDetailPage />} />
                    <Route path="/planner" element={<TripPlannerPage />} />
                    <Route path="/trip-planner" element={<TripPlannerPage />} />
                    <Route path="/phrase-helper" element={<PhraseHelperPage />} />
                    <Route path="/language" element={<PhraseHelperPage />} />
                    <Route path="/fare-meter" element={<FareMeterPage />} />
                    <Route path="/safe-journey" element={<SafeJourneyPage />} />
                    <Route path="/vault" element={<EvidenceVaultPage />} />
                    <Route path="/incident" element={<IncidentReportPage />} />
                    <Route path="/emergency" element={<IncidentReportPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                  </Routes>
                </main>
              </div>
            </div>

            {/* Floating Claude Chatbot Launcher Button - Dynamically adapts to collapsed/expanded sidebar */}
            <div
              className={`fixed bottom-4 left-4 z-30 transition-all duration-300 ${
                isSidebarCollapsed
                  ? 'md:bottom-6 md:left-[5.5rem]'
                  : 'md:bottom-6 md:left-[17.5rem]'
              }`}
            >
              <button
                id="btn-floating-claude-chat"
                onClick={() => setIsChatOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-3.5 py-2.5 rounded-full shadow-xl shadow-indigo-600/35 border border-indigo-400/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide font-display hidden sm:inline">
                  Ask Claude AI
                </span>
              </button>
            </div>

            {/* Floating Emergency & Embassy Helpline Directory */}
            <HelplineFloatingBadge />

            {/* QR Pass Modal */}
            <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

            {/* Claude Chatbot Grounded Modal */}
            <ClaudeChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* Language Support & Bhashini Phrase Cards Modal */}
            <LanguageSupportModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
          </div>
        </BrowserRouter>
      </TravelerProvider>
    </ThemeProvider>
  );
}
