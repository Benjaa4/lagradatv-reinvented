import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Match, Team } from '../types';
import { getMatches } from '../services/matchesService';
import { getTeams } from '../services/teamsService';
import { GlassCard } from '../components/ui/GlassCard';
import { MatchStatusBadge } from '../components/ui/MatchStatusBadge';
import { Button } from '../components/ui/Button';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'played'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMatches(), getTeams()]).then(([matchesData, teamsData]) => {
      setMatches(matchesData);
      setTeams(teamsData);
      setIsLoading(false);
    });
  }, []);

  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter);

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-white">Catálogo de Partidos</h1>
      
      <div className="flex flex-wrap gap-2 p-1 bg-black/40 border border-white/5 rounded-full w-fit backdrop-blur-md">
        <button onClick={()=>setFilter('all')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter==='all'?'bg-white/10 text-white shadow-lg':'text-gray-400 hover:text-white'}`}>Todos</button>
        <button onClick={()=>setFilter('live')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter==='live'?'bg-danger/20 text-danger shadow-[0_0_15px_rgba(255,51,102,0.4)]':'text-gray-400 hover:text-white'}`}>En Vivo</button>
        <button onClick={()=>setFilter('scheduled')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter==='scheduled'?'bg-white/10 text-white shadow-lg':'text-gray-400 hover:text-white'}`}>Programados</button>
        <button onClick={()=>setFilter('played')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter==='played'?'bg-white/10 text-white shadow-lg':'text-gray-400 hover:text-white'}`}>Finalizados</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : matches.length === 0 ? (
        <GlassCard className="p-12 text-center max-w-lg mx-auto mt-12">
          <p className="text-gray-400 text-lg">Aún no hay partidos registrados.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => {
            const homeTeam = getTeam(match.home_team_id);
            const awayTeam = getTeam(match.away_team_id);
            return (
            <GlassCard key={match.id} className={`p-6 transition-all duration-200 active:scale-[0.98] md:hover:bg-white/[0.06] md:hover:border-white/20 ${match.status === 'live' ? 'border-red-500/20 shadow-[0_0_24px_-8px_rgba(239,68,68,0.35)]' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <MatchStatusBadge 
                  status={match.status} 
                  time={match.time} 
                  minute={match.current_minute} 
                />
                <span className="text-xs text-gray-500">{match.date}</span>
              </div>
              
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 my-6">
                <div className="flex items-center gap-2 min-w-0">
                  {homeTeam?.logo ? (
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain shrink-0 drop-shadow-md" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center font-bold text-xs">{homeTeam?.shortName || homeTeam?.name.substring(0, 3)}</div>
                  )}
                  <span className="truncate min-w-0 flex-1 text-sm font-medium text-white" title={homeTeam?.name || match.home_team_id}>{homeTeam?.name || match.home_team_id}</span>
                </div>
                <div className="tabular-nums font-semibold text-xl sm:text-3xl px-2 sm:px-4 text-center min-w-[3.5rem] text-primary bg-primary/10 rounded-xl py-2 border border-primary/20 shadow-inner">
                  {match.status === 'scheduled' ? 'VS' : `${match.home_score} - ${match.away_score}`}
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-row-reverse text-right">
                  {awayTeam?.logo ? (
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain shrink-0 drop-shadow-md" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center font-bold text-xs">{awayTeam?.shortName || awayTeam?.name.substring(0, 3)}</div>
                  )}
                  <span className="truncate min-w-0 flex-1 text-sm font-medium text-white" title={awayTeam?.name || match.away_team_id}>{awayTeam?.name || match.away_team_id}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Link to={`/partido/${match.id}`} className="flex-1 block">
                  <Button variant="glass" className="w-full">Detalles</Button>
                </Link>
                {(match.stream_url || match.video_id) && (
                  <Link to={`/video/${match.video_id || match.id}`} className="flex-1 block">
                    <Button variant="primary" className="w-full">Ver Video</Button>
                  </Link>
                )}
              </div>
            </GlassCard>
            );
          })}
          {filteredMatches.length === 0 && (
            <GlassCard className="col-span-full p-12 text-center">
              <p className="text-gray-400 text-lg">No hay partidos para este filtro.</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
