import React from 'react';
import { Match } from '../../../types';
import { MatchStatusBadge } from '../../../components/ui/MatchStatusBadge';
import { GlassCard } from '../../../components/ui/GlassCard';

export const ScoreboardBanner: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <GlassCard className="p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center bg-black/40 gap-6">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-danger/10 opacity-50" />
      <div className="flex-1 text-center md:text-right z-10 w-full min-w-0">
        <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{match.home_team_id}</h2>
      </div>
      <div className="flex-shrink-0 text-center px-4 z-10 flex flex-col items-center">
        <div className="mb-4">
          <MatchStatusBadge 
            status={match.status} 
            time={match.time} 
            minute={match.current_minute} 
          />
        </div>
        <div className="text-3xl md:text-5xl font-black text-white bg-black/50 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex items-center">
          <span className={match.status === 'live' ? 'text-primary drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]' : ''}>{match.home_score}</span>
          <span className="text-gray-600 mx-3 md:mx-4">-</span>
          <span className={match.status === 'live' ? 'text-primary drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]' : ''}>{match.away_score}</span>
        </div>
      </div>
      <div className="flex-1 text-center md:text-left z-10 w-full min-w-0">
        <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{match.away_team_id}</h2>
      </div>
    </GlassCard>
  );
}
