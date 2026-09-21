import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  Key,
  ExternalLink,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Safe JWT parser for Google Identity Services (GSI) ID Tokens
const parseGoogleJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT credential:', e);
    return null;
  }
};

const COUNTRIES = [
  { name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { name: 'United States', flag: '🇺🇸', code: '+1' },
  { name: 'Germany', flag: '🇩🇪', code: '+49' },
  { name: 'France', flag: '🇫🇷', code: '+33' },
  { name: 'Japan', flag: '🇯🇵', code: '+81' },
  { name: 'Australia', flag: '🇦🇺', code: '+61' },
  { name: 'Canada', flag: '🇨🇦', code: '+1' },
  { name: 'Spain', flag: '🇪🇸', code: '+34' },
  { name: 'Italy', flag: '🇮🇹', code: '+39' },
  { name: 'Netherlands', flag: '🇳🇱', code: '+31' },
  { name: 'India', flag: '🇮🇳', code: '+91' },
  { name: 'Singapore', flag: '🇸🇬', code: '+65' }
];

export default function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, googleLogin, isAuthenticated, user } = useAuth();

  const [mode, setMode] = useState(defaultMode); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  // Google OAuth Client ID resolution: env variable -> localStorage -> blank
  const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [googleClientId, setGoogleClientId] = useState(() => {
    return envGoogleClientId || localStorage.getItem('tm_google_client_id') || '';
  });
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientIdSaved, setClientIdSaved] = useState(false);
  const googleBtnRef = useRef(null);

  // Google Identity Services Credential Handler (Real Google OAuth response)
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setError('Google Sign-In credential token not received. Please try again.');
      return;
    }
    const payload = parseGoogleJwt(response.credential);
    if (!payload || !payload.email) {
      setError('Failed to extract Google account information from token.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await googleLogin({
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        avatar_url: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
        google_id: payload.sub,
        nationality: 'International'
      });
      setGoogleModalOpen(false);
      setSuccessMsg(`Signed in with Google as ${res.user?.name || payload.name}! SafePass active.`);
      setTimeout(() => navigate(redirectPath), 800);
    } catch (err) {
      setError(err.message || 'Google authentication failed on backend.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize official Google Identity Services (GSI) when Google Client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    let checkTimer = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_black',
              size: 'large',
              shape: 'pill',
              text: mode === 'signup' ? 'signup_with' : 'signin_with',
              width: 320,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('Google GSI initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkTimer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkTimer);
          initGsi();
        }
      }, 250);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
    };
  }, [googleClientId, mode]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) return;
    localStorage.setItem('tm_google_client_id', cleanId);
    setGoogleClientId(cleanId);
    setClientIdSaved(true);
    setTimeout(() => {
      setClientIdSaved(false);
      setGoogleModalOpen(false);
    }, 1200);
  };

  const handleClearClientId = () => {
    localStorage.removeItem('tm_google_client_id');
    setGoogleClientId('');
    setClientIdInput('');
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nationality: 'United Kingdom',
    phone: '',
    emergency_contact: ''
  });

  const redirectPath = location.state?.from || '/safe-journey';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSelectCountry = (countryName) => {
    setFormData((prev) => ({ ...prev, nationality: countryName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!formData.name.trim()) throw new Error('Please enter your full name.');
        if (!formData.email.trim()) throw new Error('Please enter a valid email.');
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters.');

        const res = await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          nationality: formData.nationality,
          phone: formData.phone.trim(),
          emergency_contact: formData.emergency_contact.trim()
        });

        setSuccessMsg(`Welcome ${res.user?.name}! SafePass ${res.user?.journey_code || ''} generated.`);
        setTimeout(() => navigate(redirectPath), 1000);
      } else {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Please provide both email and password.');
        }

        const res = await login(formData.email.trim().toLowerCase(), formData.password);
        setSuccessMsg(`Welcome back, ${res.user?.name || 'Traveler'}!`);
        setTimeout(() => navigate(redirectPath), 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Trigger (used for demo profiles or simulated fallback)
  const handleGoogleSignIn = async (simulatedAccount = null) => {
    setError('');
    setLoading(true);
    try {
      const googleUser = simulatedAccount || {
        name: 'Elena Rostova',
        email: 'elena.rostova@gmail.com',
        avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIdk3j5=s96-c',
        google_id: 'google_oauth_elena_france_2026',
        nationality: 'France'
      };

      const res = await googleLogin(googleUser);
      setGoogleModalOpen(false);
      setSuccessMsg(`Signed in with Google as ${res.user.name}! SafePass active.`);
      setTimeout(() => navigate(redirectPath), 900);
    } catch (err) {
      setError(err.message || 'Google authentication encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Fast Login
  const handleQuickDemo = (type) => {
    if (type === 'uk') {
      setFormData({
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        password: 'Password123!',
        nationality: 'United Kingdom',
        phone: '+44 7700 900077',
        emergency_contact: '+44 7700 900077'
      });
      setMode('login');
    } else if (type === 'google') {
      handleGoogleSignIn({
        name: 'Elena Rostova',
        email: 'elena.rostova@gmail.com',
        avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIdk3j5=s96-c',
        google_id: 'google_1082374928374928374',
        nationality: 'France'
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#0a0c10] overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows matching Coder Army & TravelMate Theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg">
        {/* Top Header & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161b26] border border-white/10 text-xs font-bold text-cyan-300 shadow-md shadow-cyan-500/10 mb-3">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official SafeVisit Security Layer • Delhi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            {mode === 'signup' ? 'Create Tourist SafePass' : 'Tourist Account Sign In'}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {mode === 'signup'
              ? 'Get your verified SafeVisit digital QR badge, ASI monument booking sync, and 24/7 cloud telemetry.'
              : 'Sign in to access your active journey route, real-time NCRB safety heatmaps, and ride evidence vault.'}
          </p>
        </div>

        {/* Card Shell with Coder Army Glowing Gradient Halo */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 opacity-40 group-hover:opacity-75 blur-md transition-all duration-500" />
          
          <div className="relative bg-[#0d1017]/95 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80">
            
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#131722] border border-white/10 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Feedback Alerts */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-5 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Google Sign-In Section */}
            <div className="mb-6">
              {googleClientId ? (
                <div className="flex flex-col items-center space-y-2">
                  <div
                    ref={googleBtnRef}
                    id="google-signin-btn-container"
                    className="w-full flex justify-center min-h-[44px]"
                  />
                  <div className="flex items-center justify-between w-full px-1 text-[11px] text-slate-400">
                    <span className="flex items-center text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                      Google Identity Services Active
                    </span>
                    <button
                      type="button"
                      onClick={() => setGoogleModalOpen(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-dashed"
                    >
                      OAuth Setup / Demo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-google-signin"
                  disabled={loading}
                  onClick={() => setGoogleModalOpen(true)}
                  className="w-full relative group/btn overflow-hidden rounded-2xl p-[1px] focus:outline-none transition-transform active:scale-[0.99]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 opacity-60 group-hover/btn:opacity-100 transition-opacity blur-sm" />
                  <div className="relative flex items-center justify-center space-x-3 w-full py-3 px-4 rounded-2xl bg-[#11141f] hover:bg-[#151928] border border-white/15 text-white transition-all">
                    {/* Official Google Color SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-bold font-display tracking-wide">
                      {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/30">
                      OAUTH SETUP
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Modern Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0d1017] px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 shrink-0">
                Or continue with email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name (As on Passport / Travel ID)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#141824] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Extended Sign Up Fields */}
              {mode === 'signup' && (
                <>
                  {/* Nationality Country Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Country of Origin / Nationality
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleSelectCountry(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#141824] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name} className="bg-[#11141f] text-white">
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Emergency Contact (Home or Embassy)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        placeholder="+44 7700 900077 or +1 202 555 0123"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141824] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                      />
                    </div>
                    <p className="mt-1 text-[10.5px] text-slate-400 flex items-center space-x-1">
                      <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Used strictly by Delhi Police in case of verified SOS distress broadcast.</span>
                    </p>
                  </div>
                </>
              )}

              {/* Submit Button with Exact Coder Army Glowing Theme */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-3 sm:py-3.5 px-6 bg-[#6b30e3] backdrop-blur-xl rounded-full border cursor-pointer border-white/10 text-white hover:text-white transition-all duration-300 overflow-hidden hover:scale-[1.02] shadow-md hover:shadow-lg shadow-[#6b30e3]/40 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span className="font-semibold font-display text-sm tracking-wide">Verifying SafePass Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold font-display text-sm tracking-wide">
                          {mode === 'signup' ? 'Generate SafePass Account' : 'Sign In to SafeVisit'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6b30e3] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                </button>
              </div>
            </form>

            {/* Quick Demo Fill Buttons for Testing & Evaluation Convenience */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>1-Tap Demo Credentials</span>
                </span>
                <span className="text-[10px] text-slate-500">Instant test fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('uk')}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>🇬🇧 Alex Morgan (UK)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('google')}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>🇫🇷 Google (Elena)</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {mode === 'signup' ? (
                <p>
                  Already have a tourist account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                    className="font-bold text-cyan-400 hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              ) : (
                <p>
                  New tourist in Delhi?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                    className="font-bold text-cyan-400 hover:underline"
                  >
                    Create SafePass Account
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Interactive Google OAuth Account Chooser Modal */}
      {/* Google OAuth Configuration & Sign-In Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#111420] border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/15">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.35 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.13z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Google Sign-In & OAuth</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      GSI SDK
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Official Google Identity Services Integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Why Google Sign-In needs a Client ID explanation */}
            <div className="my-4 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Why doesn&apos;t Google popup automatically on other domains?</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-300">
                To prevent phishing, Google strictly requires every website to register an <strong>OAuth 2.0 Client ID</strong> in the Google Cloud Console. Once provided, clicking &quot;Continue with Google&quot; immediately opens the authentic Google Account selector popup.
              </p>
            </div>

            {/* Section 1: Connect Real Google Client ID */}
            <div className="p-4 rounded-2xl bg-[#161a28] border border-white/10 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Connect Google OAuth Client ID</span>
                </span>
                {googleClientId && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                    <Check className="w-3 h-3 mr-0.5" /> Connected
                  </span>
                )}
              </div>

              {googleClientId ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono break-all flex items-center justify-between">
                    <span className="truncate mr-2">{googleClientId}</span>
                    <button
                      type="button"
                      onClick={handleClearClientId}
                      className="shrink-0 text-[10px] text-rose-400 hover:text-rose-300 underline font-sans"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real Google Sign-In is active! Close this dialog and click the official Google button to sign in with your real Google account.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveClientId} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      placeholder="Paste your Google Client ID (e.g. 12345...apps.googleusercontent.com)"
                      className="w-full px-3 py-2 rounded-xl bg-[#0f121c] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline"
                    >
                      <span>Get free Client ID from Google Cloud</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                    <button
                      type="submit"
                      disabled={!clientIdInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs disabled:opacity-40 hover:opacity-90 transition-all flex items-center space-x-1"
                    >
                      {clientIdSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>Activate Client ID</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Section 2: 1-Click Demo Tourist Login */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Or Test Instantly With Pre-Verified Profiles:</span>
                </span>
                <span className="text-[10px] text-slate-500">PostgreSQL sync</span>
              </div>

              <div className="space-y-2">
                {/* Profile 1 */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn({
                    name: 'Elena Rostova',
                    email: 'elena.rostova@gmail.com',
                    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    google_id: 'google_1082374928374928374',
                    nationality: 'France'
                  })}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-[#171c2c] hover:bg-[#1e253b] border border-white/10 hover:border-cyan-400/40 transition-all text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Elena"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Elena Rostova 🇫🇷
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        France
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 truncate">elena.rostova@gmail.com</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Profile 2 */}
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn({
                    name: 'Michael Chen',
                    email: 'm.chen.travels@gmail.com',
                    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    google_id: 'google_2948201948201948201',
                    nationality: 'Canada'
                  })}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-[#171c2c] hover:bg-[#1e253b] border border-white/10 hover:border-cyan-400/40 transition-all text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Michael"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Michael Chen 🇨🇦
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        Canada
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 truncate">m.chen.travels@gmail.com</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Footer Close */}
            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
