import React from 'react';
import { Clock } from 'lucide-react';

interface MatchStatusBadgeProps {
  status: 'live' | 'scheduled' | 'played' | string;
  time?: string;
  minute?: string;
}

export const MatchStatusBadge: React.FC<MatchStatusBadgeProps> = ({ status, time, minute }) => {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[11px] font-mono tabular-nums text-red-300">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500/70 animate-ping motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500" />
        </span>
        {minute ? `${minute}'` : 'En vivo'}
      </span>
    );
  }

  if (status === 'played') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
        Final
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono tabular-nums text-white/60">
      <Clock className="w-3 h-3" />
      {time || 'Por definir'}
    </span>
  );
};
