import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MatchStatusBadge } from '../../components/ui/MatchStatusBadge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { getMatches } from '../../services/matchesService';
import { getTeams } from '../../services/teamsService';
import { Match, GlobalTeam } from '../../types';
import { Calendar } from 'lucide-react';

export const LiveMatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<GlobalTeam[]>([]);
  const [filter, setFilter] = useState<'all' | 'live'>('all');

  useEffect(() => {
    Promise.all([getMatches(), getTeams()]).then(([m, t]) => {
      setMatches(m.slice(0, 6)); // limit to 6 recent matches
      setTeams(t);
    });
  }, []);

  const getTeamName = (tid: string) => teams.find(t => t.id === tid)?.name || tid;
  const getTeamLogo = (tid: string) => {
    const logo = teams.find(t => t.id === tid)?.logo;
    if (logo) return <img src={logo} className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1.5 rounded-full object-cover shrink-0" alt=""/>;
    return <div className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1.5 rounded-full bg-white/10 shrink-0"/>;
  };

  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Partidos Destacados</h2>
        <div className="flex gap-2 bg-black/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Todos</button>
          <button onClick={() => setFilter('live')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === 'live' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>En Vivo</button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Calendar className="w-12 h-12 text-gray-500 opacity-50" />
          <p className="text-gray-400 font-medium">No hay partidos registrados</p>
        </GlassCard>
      ) : (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {filteredMatches.map((match) => (
            <GlassCard key={match.id} interactive className={`p-5 md:p-6 flex flex-col h-full w-[85vw] md:w-auto shrink-0 snap-center transition-all duration-200 active:scale-[0.98] md:hover:bg-white/[0.06] md:hover:border-white/20 ${match.status === 'live' ? 'border-red-500/20 shadow-[0_0_24px_-8px_rgba(239,68,68,0.35)]' : ''}`}>
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider">
                  {match.match_type.toUpperCase()} • Jornada
                </h3>
                <MatchStatusBadge 
                  status={match.status} 
                  time={match.time} 
                  minute={match.current_minute} 
                />
              </div>
              
              <div className="flex justify-between items-center py-3 border-y border-white/5 flex-grow">
                <div className="text-center w-5/12 flex flex-col items-center justify-center">
                  {getTeamLogo(match.home_team_id)}
                  <span className="font-bold text-sm truncate min-w-0 w-full">{getTeamName(match.home_team_id)}</span>
                </div>
                
                <div className="text-center w-2/12 flex flex-col items-center justify-center px-1">
                  {match.status === 'scheduled' ? (
                    <span className="text-lg md:text-xl font-bold text-gray-600">VS</span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl md:text-3xl font-black tabular-nums ${match.status === 'live' ? 'text-primary' : 'text-white'}`}>
                        {match.home_score} - {match.away_score}
                      </span>
                      {(match.home_penalties != null || match.away_penalties != null) && (
                        <span className="text-[10px] md:text-xs text-gray-400 mt-1 whitespace-nowrap">
                          ({match.home_penalties}-{match.away_penalties} pen)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-center w-5/12 flex flex-col items-center justify-center">
                  {getTeamLogo(match.away_team_id)}
                  <span className="font-bold text-sm truncate min-w-0 w-full">{getTeamName(match.away_team_id)}</span>
                </div>
              </div>

              <div className="pt-4 md:pt-6 mt-auto">
                <Link to={`/partido/${match.id}`} className="w-full block">
                  <Button 
                    variant={match.status === 'live' ? 'primary' : match.status === 'scheduled' ? 'glass' : 'ghost'} 
                    className="w-full"
                  >
                    {match.status === 'live' ? 'Ver Transmisión' : match.status === 'scheduled' ? 'Ver Detalles' : 'Resumen'}
                  </Button>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  );
};
