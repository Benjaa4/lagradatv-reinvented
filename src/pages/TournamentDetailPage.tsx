import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tournament, Match } from '../types';
import { getTournamentById } from '../services/tournamentsService';
import { getMatches } from '../services/matchesService';
import { processBracketMatches, BracketPhase } from '../utils/bracketUtils';
import { GlassCard } from '../components/ui/GlassCard';
import { StandingsSkeleton } from '../components/ui/Skeleton';
import { ChevronDown } from 'lucide-react';

export const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'standings' | 'brackets' | 'scorers' | 'discipline'>('standings');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };
  useEffect(() => {
    if(id) {
      getTournamentById(id).then(t => {
        if (t) {
          setTournament(t);
          // Set initial active tab based on what's visible
          if (t.show_standings) setActiveTab('standings');
          else if (t.show_brackets) setActiveTab('brackets');
          else if (t.show_scorers) setActiveTab('scorers');
          else if (t.show_discipline) setActiveTab('discipline');
        } else {
          setTournament(null);
        }
      });
      getMatches().then(m => setMatches(m.filter(x => x.tournament_id === id)));
    }
  }, [id]);

  if (!tournament) return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-7xl mx-auto pt-8">
      <StandingsSkeleton />
    </div>
  );

  const bracketPhases: BracketPhase[] = processBracketMatches(matches);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-7xl mx-auto">
      {/* Header */}
      <GlassCard className="relative overflow-hidden p-0 h-64 md:h-[400px] border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${tournament.image})`}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
          <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2">Temporada {tournament.season || 'Actual'}</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{tournament.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{tournament.description}</p>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-black/40 border border-white/5 rounded-full w-fit backdrop-blur-md">
        {tournament.show_standings && (
          <button onClick={()=>setActiveTab('standings')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab==='standings'?'bg-white/10 text-white shadow-lg border border-white/10':'text-gray-400 hover:text-white'}`}>Tabla de Posiciones</button>
        )}
        {tournament.show_brackets && (
          <button onClick={()=>setActiveTab('brackets')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab==='brackets'?'bg-white/10 text-white shadow-lg border border-white/10':'text-gray-400 hover:text-white'}`}>Fase Final / Fixture</button>
        )}
        {tournament.show_scorers && (
          <button onClick={()=>setActiveTab('scorers')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab==='scorers'?'bg-white/10 text-white shadow-lg border border-white/10':'text-gray-400 hover:text-white'}`}>Goleadores</button>
        )}
        {tournament.show_discipline && (
          <button onClick={()=>setActiveTab('discipline')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab==='discipline'?'bg-white/10 text-white shadow-lg border border-white/10':'text-gray-400 hover:text-white'}`}>Disciplina</button>
        )}
      </div>

      {/* Content */}
      <div className="pt-2">
        {activeTab === 'standings' && tournament.show_standings && (
          <GlassCard className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-gray-400 uppercase text-xs sticky top-[var(--nav-h,4rem)] z-20 bg-[rgba(18,22,34,0.75)] backdrop-blur-md border-b border-white/10 after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-[rgba(18,22,34,0.6)] after:to-transparent after:pointer-events-none">
                  <tr>
                    <th className="py-3 px-3 font-bold">Pos</th>
                    <th className="py-3 px-3 w-full font-bold">Equipo</th>
                    <th className="py-3 px-3 text-center font-bold">PJ</th>
                    <th className="py-3 px-3 text-center font-bold hidden sm:table-cell">G</th>
                    <th className="py-3 px-3 text-center font-bold hidden sm:table-cell">E</th>
                    <th className="py-3 px-3 text-center font-bold hidden sm:table-cell">P</th>
                    <th className="py-3 px-3 text-center font-bold hidden md:table-cell">GF</th>
                    <th className="py-3 px-3 text-center font-bold hidden md:table-cell">GC</th>
                    <th className="py-3 px-4 text-center text-white font-black text-base">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {tournament.standings?.sort((a,b)=>b.points - a.points).map((team, idx) => (
                    <React.Fragment key={team.id}>
                      <tr onClick={() => toggleRow(team.id)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer md:cursor-default">
                        <td className={`py-4 px-3 font-black text-lg ${idx<3?'text-primary':'text-gray-500'}`}>{idx+1}</td>
                        <td className="py-4 px-3 text-white font-bold max-w-[120px] sm:max-w-none truncate" title={team.name}>
                          <div className="flex items-center gap-2">
                            {team.name}
                            <ChevronDown className={`w-4 h-4 text-gray-500 md:hidden transition-transform ${expandedRows.has(team.id) ? 'rotate-180' : ''}`} />
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center text-gray-400">{team.played}</td>
                        <td className="py-4 px-3 text-center text-emerald-400 font-medium hidden sm:table-cell">{team.won}</td>
                        <td className="py-4 px-3 text-center text-gray-400 font-medium hidden sm:table-cell">{team.drawn}</td>
                        <td className="py-4 px-3 text-center text-red-400 font-medium hidden sm:table-cell">{team.lost}</td>
                        <td className="py-4 px-3 text-center text-gray-400 hidden md:table-cell">{team.goals_for}</td>
                        <td className="py-4 px-3 text-center text-gray-400 hidden md:table-cell">{team.goals_against}</td>
                        <td className="py-4 px-4 text-center text-primary font-black text-lg bg-primary/10 rounded-r-lg">{team.points}</td>
                      </tr>
                      {expandedRows.has(team.id) && (
                        <tr className="md:hidden bg-white/[0.02] border-b border-white/5">
                          <td colSpan={9} className="px-3 py-4">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
                              <div className="bg-black/30 p-2 rounded-lg sm:hidden"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">G</span><span className="text-emerald-400 font-medium">{team.won}</span></div>
                              <div className="bg-black/30 p-2 rounded-lg sm:hidden"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">E</span><span className="text-gray-400 font-medium">{team.drawn}</span></div>
                              <div className="bg-black/30 p-2 rounded-lg sm:hidden"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">P</span><span className="text-red-400 font-medium">{team.lost}</span></div>
                              <div className="bg-black/30 p-2 rounded-lg"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">GF</span><span className="text-white font-medium">{team.goals_for}</span></div>
                              <div className="bg-black/30 p-2 rounded-lg"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">GC</span><span className="text-white font-medium">{team.goals_against}</span></div>
                              <div className="bg-black/30 p-2 rounded-lg"><span className="block text-gray-500 uppercase tracking-widest font-bold mb-1">DIF</span><span className="text-white font-medium">{(team.goals_for || 0) - (team.goals_against || 0)}</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {(!tournament.standings || tournament.standings.length===0) && (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center opacity-50">
                          <p className="text-white text-lg">Sin registros disponibles</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'brackets' && tournament.show_brackets && (
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8 snap-x">
            {bracketPhases.length > 0 ? bracketPhases.map((phase) => (
              <div key={phase.name} className="min-w-[280px] sm:min-w-[320px] flex flex-col gap-4 snap-center">
                <h3 className="text-center text-primary font-bold uppercase tracking-widest text-sm mb-2">{phase.name}</h3>
                {phase.matches.map(m => (
                  <GlassCard key={m.id} className="p-4 border-l-4 border-l-primary/60 relative hover:border-l-primary transition-colors">
                    <div className="space-y-3 text-sm font-medium">
                      <div className="flex justify-between items-center text-white">
                        <span className="truncate pr-2">{m.home_team_id}</span>
                        <span className={`px-2 py-0.5 rounded bg-white/5 ${m.home_score > m.away_score ? 'text-primary font-bold' : ''}`}>{m.status !== 'scheduled' ? m.home_score : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <span className="truncate pr-2">{m.away_team_id}</span>
                        <span className={`px-2 py-0.5 rounded bg-white/5 ${m.away_score > m.home_score ? 'text-primary font-bold' : ''}`}>{m.status !== 'scheduled' ? m.away_score : '-'}</span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )) : (
              <GlassCard className="w-full text-center py-16">
                <div className="flex flex-col items-center justify-center opacity-50">
                  <p className="text-white text-lg">Sin registros disponibles</p>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'scorers' && tournament.show_scorers && (
          <GlassCard className="p-12 text-center">
            <div className="flex flex-col items-center justify-center opacity-50">
              <p className="text-white text-lg">Sin registros disponibles</p>
            </div>
          </GlassCard>
        )}

        {activeTab === 'discipline' && tournament.show_discipline && (
          <GlassCard className="p-12 text-center">
            <div className="flex flex-col items-center justify-center opacity-50">
              <p className="text-white text-lg">Sin registros disponibles</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
