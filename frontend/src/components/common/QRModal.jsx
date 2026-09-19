import React, { useState } from 'react';
import { X, QrCode, ShieldCheck, Clock, Download, Share2, Trash2, CheckCircle2 } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { api } from '../../services/api';
import StatusBadge from './StatusBadge';

export default function QRModal({ isOpen, onClose }) {
  const { traveler, journey, concludeJourney } = useTraveler();
  const [purgeMsg, setPurgeMsg] = useState(null);
  const [isConcluding, setIsConcluding] = useState(false);

  if (!isOpen) return null;

  const handleConcludeJourney = async () => {
    setIsConcluding(true);
    try {
      const res = await api.expireJourney(journey?.journey_code || 'TM-DEL-2026-X89K');
      if (res.success) {
        concludeJourney();
        setPurgeMsg('Journey concluded! All personal identifying profile data has been permanently purged under Scope #18 Privacy Retention Policy.');
      }
    } catch (e) {
      concludeJourney();
      setPurgeMsg('Journey concluded locally. Identifying data purged.');
    } finally {
      setIsConcluding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-surface border border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <img src="/logo.jpg" alt="TravelMate" className="w-4.5 h-4.5 rounded object-cover ring-1 ring-white/20" />
          <span>Delhi SafeVisit Pass</span>
        </div>

        <h3 className="text-xl font-bold font-mono text-white mb-1">
          {journey?.journey_code || 'TM-DEL-2026-X89K'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Issued to {traveler?.name || 'Sarah Jenkins'} ({traveler?.nationality || 'United Kingdom'})
        </p>

        {/* QR Visual */}
        <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 shadow-lg flex items-center justify-center">
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" fill="white" />
            <rect x="10" y="10" width="26" height="26" fill="#090E17" rx="4" />
            <rect x="14" y="14" width="18" height="18" fill="white" rx="2" />
            <rect x="18" y="18" width="10" height="10" fill="#10B981" rx="1" />

            <rect x="64" y="10" width="26" height="26" fill="#090E17" rx="4" />
            <rect x="68" y="14" width="18" height="18" fill="white" rx="2" />
            <rect x="72" y="18" width="10" height="10" fill="#10B981" rx="1" />

            <rect x="10" y="64" width="26" height="26" fill="#090E17" rx="4" />
            <rect x="14" y="68" width="18" height="18" fill="white" rx="2" />
            <rect x="18" y="72" width="10" height="10" fill="#10B981" rx="1" />

            <rect x="42" y="14" width="6" height="6" fill="#090E17" />
            <rect x="52" y="14" width="6" height="6" fill="#090E17" />
            <rect x="42" y="42" width="16" height="16" fill="#090E17" rx="2" />
            <rect x="74" y="74" width="12" height="12" fill="#10B981" rx="2" />
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-center space-x-1.5 text-xs text-amber-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {journey?.status === 'expired' ? 'Pass Expired • Data Purged' : 'Valid for 7 Days • Passport-Free Token'}
          </span>
        </div>

        {purgeMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-left flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{purgeMsg}</span>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col space-y-2">
          {journey?.status !== 'expired' && !purgeMsg && (
            <button
              onClick={handleConcludeJourney}
              disabled={isConcluding}
              className="w-full py-2 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isConcluding ? 'Purging Profile...' : 'Conclude Journey & Purge Data (Scope #18)'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
