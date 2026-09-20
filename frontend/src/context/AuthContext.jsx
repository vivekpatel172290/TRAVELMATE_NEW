import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { useTraveler } from './TravelerContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('tm_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync to TravelerContext if present
  const travelerCtx = useTraveler();

  const syncTravelerData = useCallback((userData) => {
    if (!userData || !travelerCtx?.updateProfile) return;
    travelerCtx.updateProfile(
      {
        name: userData.name,
        nationality: userData.nationality || 'International',
        preferred_language: 'en',
        emergency_contact: userData.emergency_contact || '',
        avatar_url: userData.avatar_url,
        email: userData.email,
        auth_provider: userData.auth_provider,
        id: userData.id
      },
      userData.journey_code ? {
        journey_code: userData.journey_code,
        status: 'active',
        current_lat: 28.6139,
        current_lng: 77.2090,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } : null
    );
  }, [travelerCtx]);

  // Verify active session on initial load
  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe(token);
        if (mounted && res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('tm_auth_user', JSON.stringify(res.user));
          syncTravelerData(res.user);
        }
      } catch (err) {
        console.warn('[AuthContext] Session verification note:', err.message);
        // If server rejected token, fall back to preserved user or clear
        if (err.message && err.message.toLowerCase().includes('expired')) {
          localStorage.removeItem('tm_auth_token');
          localStorage.removeItem('tm_auth_user');
          if (mounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    verifySession();
    return () => { mounted = false; };
  }, [token, syncTravelerData]);

  // Login with email and password
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('tm_auth_token', res.token);
        localStorage.setItem('tm_auth_user', JSON.stringify(res.user));
        syncTravelerData(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Register new account
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register(userData);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('tm_auth_token', res.token);
        localStorage.setItem('tm_auth_user', JSON.stringify(res.user));
        syncTravelerData(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in / Sign up with Google
  const googleLogin = async (googlePayload) => {
    setIsLoading(true);
    try {
      const res = await authAPI.googleAuth(googlePayload);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('tm_auth_token', res.token);
        localStorage.setItem('tm_auth_user', JSON.stringify(res.user));
        syncTravelerData(res.user);
        return { success: true, user: res.user, isNewUser: res.isNewUser };
      }
      throw new Error(res.error || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateUser = async (updates) => {
    if (!token) throw new Error('Not authenticated');
    const res = await authAPI.updateProfile(token, updates);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('tm_auth_user', JSON.stringify(res.user));
      syncTravelerData(res.user);
      return { success: true, user: res.user };
    }
    throw new Error(res.error || 'Update failed');
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout(token);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('tm_auth_token');
    localStorage.removeItem('tm_auth_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
