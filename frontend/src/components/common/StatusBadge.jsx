import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, UserCheck } from 'lucide-react';

export default function StatusBadge({ status = 'Official', className = '' }) {
  const getBadgeConfig = () => {
    switch (status.toLowerCase()) {
      case 'official':
        return {
          bg: 'status-badge-official bg-cyan-500/15 border-cyan-500/35 text-cyan-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cyan-400" />,
          label: 'Official (Govt / ASI Verified)'
        };
      case 'authorized':
        return {
          bg: 'status-badge-authorized bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          label: 'Authorized Source'
        };
      case 'estimated':
        return {
          bg: 'status-badge-estimated bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
          label: 'Estimated (Model / Algorithmic)'
        };
      case 'user-reported':
        return {
          bg: 'status-badge-user-reported bg-purple-500/10 border-purple-500/30 text-purple-400',
          icon: <UserCheck className="w-3.5 h-3.5 mr-1" />,
          label: 'User-Reported (Unverified)'
        };
      case 'stale':
        return {
          bg: 'status-badge-stale bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
          label: 'Stale (Pending Audit)'
        };
      default:
        return {
          bg: 'status-badge-default bg-slate-500/10 border-slate-500/30 text-slate-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
          label: status
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
      title={config.label}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
}
