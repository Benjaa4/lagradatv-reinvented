import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Match } from '../types';
import { getMatchById, subscribeToMatchUpdates } from '../services/matchesService';
import { ScoreboardBanner } from '../features/matches/components/ScoreboardBanner';
import { TacticalPitch } from '../features/matches/components/TacticalPitch';
import { DisciplinePanel } from '../features/matches/components/DisciplinePanel';
import { getEmbedUrl } from '../utils/videoUtils';
import { GlassCard } from '../components/ui/GlassCard';
import { PitchSkeleton } from '../components/ui/Skeleton';

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'tactics' | 'discipline' | 'info'>('tactics');

  useEffect(() => {
    if (id) {
      getMatchById(id).then(data => data && setMatch(data));
      
      const sub = subscribeToMatchUpdates(payload => {
        if (payload.id === id) setMatch(payload);
      });
      return () => { sub.unsubscribe(); };
    }
  }, [id]);

  if (!match) return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-7xl mx-auto pt-8">
      <PitchSkeleton />
    </div>
  );

  const lineups = typeof match.lineups === 'string' ? JSON.parse(match.lineups) : match.lineups;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150">
      <ScoreboardBanner match={match} />
      
      {match.stream_url && (
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,255,136,0.15)] group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
          <iframe 
            src={getEmbedUrl(match.stream_url) || ''} 
            className="w-full h-full relative z-10" 
            allowFullScreen 
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 p-1 bg-black/40 border border-white/5 rounded-full w-fit mx-auto backdrop-blur-md">
        <button onClick={() => setActiveTab('tactics')} className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'tactics' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white'}`}>Táctica</button>
        <button onClick={() => setActiveTab('discipline')} className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'discipline' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white'}`}>Disciplina</button>
        <button onClick={() => setActiveTab('info')} className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white'}`}>Información</button>
      </div>

      <div className="pt-4">
        {activeTab === 'tactics' && <TacticalPitch homeLineup={lineups?.home} awayLineup={lineups?.away} />}
        {activeTab === 'discipline' && <DisciplinePanel players={[...(lineups?.home?.starting||[]), ...(lineups?.away?.starting||[])]} />}
        {activeTab === 'info' && (
          <GlassCard className="p-8 text-center text-gray-300 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Detalles Técnicos del Encuentro</h3>
            <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white">Fecha y Hora:</strong> <span>{match.date} {match.time}</span></p>
            <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white">Fase / Ronda:</strong> <span className="capitalize">{match.round || 'Temporada Regular'}</span></p>
            <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white">Modalidad:</strong> <span className="uppercase">{match.match_type}</span></p>
            {match.description && <p className="pt-4 text-sm italic">"{match.description}"</p>}
          </GlassCard>
        )}
      </div>
    </div>
  );
};
