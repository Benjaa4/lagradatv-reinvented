import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassModal } from '../../components/ui/GlassModal';
import { Button } from '../../components/ui/Button';
import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { Match, GlobalTeam } from '../../types';
import { getMatches, createMatch, updateMatch } from '../../services/matchesService';
import { useToast } from '../../context/ToastContext';

interface AdminBracketEditorProps {
  tournamentId: string;
  teams: GlobalTeam[];
  teamIds: string[];
}

export const AdminBracketEditor: React.FC<AdminBracketEditorProps> = ({ tournamentId, teams, teamIds }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { toast } = useToast();

  const loadBracket = async () => {
    try {
      const allMatches = await getMatches({ tournament_id: tournamentId });
      // Only keep matches that are part of a bracket (e.g. have a round > 0 or explicitly 'bracket')
      const bracketMatches = allMatches.filter(m => m.round);
      setMatches(bracketMatches);
    } catch (e) {
      toast('Error al cargar bracket', 'error');
    }
  };

  useEffect(() => {
    loadBracket();
  }, [tournamentId]);

  const handleGenerate = async () => {
    if (teamIds.length < 2) {
      toast('Se requieren al menos 2 equipos para generar un bracket', 'error');
      return;
    }
    
    // Simplistic generator for Semis (4 teams) or Final (2 teams)
    const shuffled = [...teamIds].sort(() => 0.5 - Math.random());
    const isSemis = shuffled.length >= 3;
    const teamCount = isSemis ? 4 : 2;
    
    // Fill missing with TBD if less than teamCount
    while(shuffled.length < teamCount) shuffled.push('TBD');
    
    try {
      if (isSemis) {
        // Create 2 semis and 1 final
        const m1 = { tournament_id: tournamentId, status: 'scheduled' as any, home_team_id: shuffled[0], away_team_id: shuffled[1], match_type: 'f7' as any, home_score: 0, away_score: 0, round: '1', match_order: 1, date: '', time: '' };
        const m2 = { tournament_id: tournamentId, status: 'scheduled' as any, home_team_id: shuffled[2], away_team_id: shuffled[3], match_type: 'f7' as any, home_score: 0, away_score: 0, round: '1', match_order: 2, date: '', time: '' };
        const m3 = { tournament_id: tournamentId, status: 'scheduled' as any, home_team_id: 'TBD', away_team_id: 'TBD', match_type: 'f7' as any, home_score: 0, away_score: 0, round: '2', match_order: 1, date: '', time: '' };
        await Promise.all([createMatch(m1), createMatch(m2), createMatch(m3)]);
      } else {
        const m1 = { tournament_id: tournamentId, status: 'scheduled' as any, home_team_id: shuffled[0], away_team_id: shuffled[1], match_type: 'f7' as any, home_score: 0, away_score: 0, round: '1', match_order: 1, date: '', time: '' };
        await createMatch(m1);
      }
      toast('Bracket generado', 'success');
      loadBracket();
    } catch (e) {
      toast('Error al generar bracket', 'error');
    }
  };

  const handleSaveMatch = async () => {
    if (!selectedMatch || !selectedMatch.id) return;
    try {
      // Automatic projection
      if (selectedMatch.winner_id && parseInt(selectedMatch.round || '1') < 2) {
        const nextRound = (parseInt(selectedMatch.round || '1') + 1).toString();
        const nextMatchOrder = Math.ceil((selectedMatch.match_order || 1) / 2);
        const nextMatch = matches.find(m => m.round === nextRound && m.match_order === nextMatchOrder);
        
        if (nextMatch) {
          const isHome = (selectedMatch.match_order || 1) % 2 !== 0;
          if (isHome) {
            await updateMatch(nextMatch.id, { home_team_id: selectedMatch.winner_id });
          } else {
            await updateMatch(nextMatch.id, { away_team_id: selectedMatch.winner_id });
          }
        }
      }

      await updateMatch(selectedMatch.id, selectedMatch);
      setSelectedMatch(null);
      toast('Cruce actualizado', 'success');
      loadBracket();
    } catch (e) {
      toast('Error al guardar cruce', 'error');
    }
  };

  const getTeamName = (tid: string) => {
    if (tid === 'TBD') return 'TBD';
    return teams.find(t => t.id === tid)?.name || tid;
  };

  const getNodesByRound = (round: string) => matches.filter(m => m.round === round).sort((a, b) => (a.match_order || 0) - (b.match_order || 0));

  if (matches.length === 0) {
    return (
      <div className="text-center py-16">
        <GlassCard className="inline-block p-8">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-6">El cuadro aún no ha sido generado para este torneo.</p>
          <Button variant="primary" onClick={handleGenerate} className="flex items-center gap-2 mx-auto"><Zap className="w-4 h-4" /> Auto-generar</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex items-center gap-16 min-w-max">
        {/* Round 1 */}
        {getNodesByRound('1').length > 0 && (
          <div className="flex flex-col gap-8">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center">Semifinales / Cuartos</h3>
            {getNodesByRound('1').map(m => (
              <GlassCard key={m.id} className="p-3 w-48 sm:w-64 min-w-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedMatch(m)}>
                <div className="flex justify-between items-center py-1 border-b border-white/5 gap-2">
                  <span className={`truncate text-xs md:text-sm flex-1 min-w-0 ${m.winner_id === m.home_team_id ? 'font-bold text-white' : 'text-gray-300'}`} title={getTeamName(m.home_team_id)}>{getTeamName(m.home_team_id)}</span>
                  <span className="font-mono text-sm sm:text-lg font-bold shrink-0">{m.status !== 'scheduled' ? m.home_score : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1 pt-2 gap-2">
                  <span className={`truncate text-xs md:text-sm flex-1 min-w-0 ${m.winner_id === m.away_team_id ? 'font-bold text-white' : 'text-gray-300'}`} title={getTeamName(m.away_team_id)}>{getTeamName(m.away_team_id)}</span>
                  <span className="font-mono text-sm sm:text-lg font-bold shrink-0">{m.status !== 'scheduled' ? m.away_score : '-'}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {getNodesByRound('1').length > 0 && getNodesByRound('2').length > 0 && (
          <div className="flex flex-col gap-32 opacity-20">
             <ChevronRight className="w-8 h-8" />
             {getNodesByRound('1').length > 2 && <ChevronRight className="w-8 h-8" />}
          </div>
        )}

        {/* Round 2 */}
        {getNodesByRound('2').length > 0 && (
          <div className="flex flex-col justify-center">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6 text-center flex items-center justify-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Final</h3>
            {getNodesByRound('2').map(m => (
              <GlassCard key={m.id} className="p-3 w-48 sm:w-64 min-w-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors border-primary/20" onClick={() => setSelectedMatch(m)}>
                <div className="flex justify-between items-center py-1 border-b border-white/5 gap-2">
                  <span className={`truncate text-xs md:text-sm flex-1 min-w-0 ${m.winner_id === m.home_team_id ? 'font-bold text-white' : 'text-gray-300'}`} title={getTeamName(m.home_team_id)}>{getTeamName(m.home_team_id)}</span>
                  <span className="font-mono text-sm sm:text-lg font-bold shrink-0">{m.status !== 'scheduled' ? m.home_score : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1 pt-2 gap-2">
                  <span className={`truncate text-xs md:text-sm flex-1 min-w-0 ${m.winner_id === m.away_team_id ? 'font-bold text-white' : 'text-gray-300'}`} title={getTeamName(m.away_team_id)}>{getTeamName(m.away_team_id)}</span>
                  <span className="font-mono text-sm sm:text-lg font-bold shrink-0">{m.status !== 'scheduled' ? m.away_score : '-'}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <GlassModal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title="Definir Cruce">
        {selectedMatch && (
          <div className="space-y-6">
            <div className="flex justify-center items-center gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate w-24 text-center">{getTeamName(selectedMatch.home_team_id)}</span>
                <input type="number" className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-black text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={selectedMatch.home_score ?? 0} onChange={e=>setSelectedMatch({...selectedMatch, home_score: parseInt(e.target.value)||0})} />
              </div>
              <span className="text-2xl font-black text-white/20">-</span>
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider truncate w-24 text-center">{getTeamName(selectedMatch.away_team_id)}</span>
                <input type="number" className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-black text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={selectedMatch.away_score ?? 0} onChange={e=>setSelectedMatch({...selectedMatch, away_score: parseInt(e.target.value)||0})} />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block text-center">¿Quién avanza / Ganador?</label>
              <div className="flex gap-4">
                <button 
                  className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${selectedMatch.winner_id === selectedMatch.home_team_id ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  onClick={() => setSelectedMatch({...selectedMatch, winner_id: selectedMatch.home_team_id, status: 'played'})}
                >
                  {getTeamName(selectedMatch.home_team_id)}
                </button>
                <button 
                  className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${selectedMatch.winner_id === selectedMatch.away_team_id ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                  onClick={() => setSelectedMatch({...selectedMatch, winner_id: selectedMatch.away_team_id, status: 'played'})}
                >
                  {getTeamName(selectedMatch.away_team_id)}
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button onClick={handleSaveMatch} variant="primary" className="flex-1">Guardar y Proyectar</Button>
              <Button onClick={() => setSelectedMatch(null)} variant="glass" className="flex-1">Cancelar</Button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
