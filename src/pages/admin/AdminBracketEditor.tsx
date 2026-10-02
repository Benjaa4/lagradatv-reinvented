import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassModal } from '../../components/ui/GlassModal';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { CustomSwitch } from '../../components/ui/CustomSwitch';
import { Trophy, Zap, ShieldAlert, Award } from 'lucide-react';
import { Match, GlobalTeam, TeamStanding } from '../../types';
import { getMatches, createMatch, updateMatch, deleteMatch } from '../../services/matchesService';
import { useToast } from '../../context/ToastContext';
import { getTeamDisplayName } from '../../utils/matchUtils';
import { getStandingsByTournament, upsertStanding, updateStanding } from '../../services/tournamentsService';

interface AdminBracketEditorProps {
  tournamentId: string;
  teams: GlobalTeam[];
  teamIds: string[];
}

const BRACKET_MAP = {
  // Octavos
  O1: { round: '8', next: 'C1', order: 1, nextPos: 'home' },
  O2: { round: '8', next: 'C1', order: 2, nextPos: 'away' },
  O3: { round: '8', next: 'C2', order: 3, nextPos: 'home' },
  O4: { round: '8', next: 'C2', order: 4, nextPos: 'away' },
  O5: { round: '8', next: 'C3', order: 5, nextPos: 'home' },
  O6: { round: '8', next: 'C3', order: 6, nextPos: 'away' },
  O7: { round: '8', next: 'C4', order: 7, nextPos: 'home' },
  O8: { round: '8', next: 'C4', order: 8, nextPos: 'away' },
  // Cuartos
  C1: { round: '4', next: 'S1', order: 1, nextPos: 'home' },
  C2: { round: '4', next: 'S1', order: 2, nextPos: 'away' },
  C3: { round: '4', next: 'S2', order: 3, nextPos: 'home' },
  C4: { round: '4', next: 'S2', order: 4, nextPos: 'away' },
  // Semis
  S1: { round: '2', next: 'F1', order: 1, nextPos: 'home', nextLoser: 'T1' },
  S2: { round: '2', next: 'F1', order: 2, nextPos: 'away', nextLoser: 'T1' },
  // Final
  F1: { round: '1', next: null, order: 1 },
  // Tercer Puesto
  T1: { round: 'third_place', next: null, order: 2 },
};

export const AdminBracketEditor: React.FC<AdminBracketEditorProps> = ({ tournamentId, teams, teamIds }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [initialRound, setInitialRound] = useState<'quarterfinal' | 'semifinal' | 'final'>('semifinal');
  const [hasThirdPlace, setHasThirdPlace] = useState(true);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const { toast } = useToast();

  const loadBracket = async () => {
    try {
      const allMatches = await getMatches({ tournament_id: tournamentId });
      const bracketMatches = allMatches.filter(m => m.bracket_code);
      setMatches(bracketMatches);
      setHasThirdPlace(bracketMatches.some(m => m.bracket_code === 'T1' || m.round === 'third_place'));
      const s = await getStandingsByTournament(tournamentId);
      setStandings(s);
    } catch (e) {
      toast('Error al cargar bracket', 'error');
    }
  };

  useEffect(() => {
    loadBracket();
  }, [tournamentId]);

  const handleGenerate = async () => {
    let size = initialRound === 'quarterfinal' ? 8 : initialRound === 'semifinal' ? 4 : 2;
    if (teamIds.length < 2 && size > 2) {
      // It's ok to generate TBD brackets
    }

    const shuffled = [...teamIds].sort(() => 0.5 - Math.random());
    while (shuffled.length < size) shuffled.push('TBD');

    const toCreate: Partial<Match>[] = [];

    const createNodes = (codes: string[], isFirstRound: boolean) => {
      codes.forEach((code, index) => {
        const hTeam = isFirstRound ? shuffled[index * 2] : 'TBD';
        const aTeam = isFirstRound ? shuffled[index * 2 + 1] : 'TBD';
        toCreate.push({
          tournament_id: tournamentId,
          status: 'scheduled',
          match_type: 'f7',
          home_team_id: hTeam,
          away_team_id: aTeam,
          home_score: 0,
          away_score: 0,
          round: BRACKET_MAP[code as keyof typeof BRACKET_MAP].round,
          match_order: BRACKET_MAP[code as keyof typeof BRACKET_MAP].order,
          bracket_code: code,
          date: '',
          time: ''
        });
      });
    };

    if (size === 8) {
      createNodes(['C1','C2','C3','C4'], true);
      createNodes(['S1','S2'], false);
    } else if (size === 4) {
      createNodes(['S1','S2'], true);
    }
    
    // Always create F1
    createNodes(['F1'], size === 2);
    
    if (hasThirdPlace && size > 2) {
      createNodes(['T1'], false);
    }

    try {
      // First, delete old bracket
      const oldMatches = await getMatches({ tournament_id: tournamentId });
      const oldBracket = oldMatches.filter(m => m.bracket_code);
      for (const om of oldBracket) {
        await deleteMatch(om.id);
      }
      
      // Create new bracket
      for (const nm of toCreate) {
        await createMatch(nm as Match);
      }

      toast('Bracket generado correctamente', 'success');
      loadBracket();
    } catch (e) {
      toast('Error al generar bracket', 'error');
    }
  };

  const handleToggleThirdPlace = async (val: boolean) => {
    setHasThirdPlace(val);
    if (matches.length === 0) return;
    try {
      const t1Match = matches.find(m => m.bracket_code === 'T1');
      if (val && !t1Match) {
        await createMatch({
          tournament_id: tournamentId,
          round: 'third_place',
          bracket_code: 'T1',
          match_order: 1,
          home_team_id: 'TBD',
          away_team_id: 'TBD',
          status: 'scheduled',
          home_score: 0,
          away_score: 0,
          match_type: 'f7'
        } as Match);
        toast('Partido por el 3er Puesto creado', 'success');
        loadBracket();
      } else if (!val && t1Match) {
        if (t1Match.id) await deleteMatch(t1Match.id);
        toast('Partido por el 3er Puesto eliminado', 'success');
        loadBracket();
      }
    } catch (e) {
      toast('Error al actualizar Tercer Puesto', 'error');
    }
  };

  const handleSaveMatch = async () => {
    if (!selectedMatch || !selectedMatch.id || !selectedMatch.bracket_code) return;
    try {
      let winnerId = selectedMatch.winner_id;
      
      if (!winnerId && selectedMatch.status === 'played' && selectedMatch.home_score !== selectedMatch.away_score) {
        winnerId = (selectedMatch.home_score || 0) > (selectedMatch.away_score || 0) 
          ? selectedMatch.home_team_id 
          : selectedMatch.away_team_id;
      }
      
      const loserId = winnerId ? (winnerId === selectedMatch.home_team_id ? selectedMatch.away_team_id : selectedMatch.home_team_id) : undefined;
      
      const cfg = BRACKET_MAP[selectedMatch.bracket_code as keyof typeof BRACKET_MAP];
      
      if (cfg && cfg.next && winnerId && winnerId !== 'TBD') {
        const nextMatch = matches.find(m => m.bracket_code === cfg.next);
        if (nextMatch && nextMatch.id) {
          const updatePayload: any = {};
          if (cfg.nextPos === 'home') updatePayload.home_team_id = winnerId;
          else updatePayload.away_team_id = winnerId;
          await updateMatch(nextMatch.id, updatePayload);
        }

        if ((cfg as any).nextLoser && loserId && loserId !== 'TBD') {
          const loserMatch = matches.find(m => m.bracket_code === (cfg as any).nextLoser);
          if (loserMatch && loserMatch.id) {
            const updateLoserPayload: any = {};
            if (cfg.nextPos === 'home') updateLoserPayload.home_team_id = loserId;
            else updateLoserPayload.away_team_id = loserId;
            await updateMatch(loserMatch.id, updateLoserPayload);
          }
        }
      }

      await updateMatch(selectedMatch.id, {
        home_team_id: selectedMatch.home_team_id,
        away_team_id: selectedMatch.away_team_id,
        home_score: selectedMatch.home_score,
        away_score: selectedMatch.away_score,
        winner_id: winnerId,
        status: winnerId ? 'played' : selectedMatch.status,
        round: selectedMatch.round,
        bracket_code: selectedMatch.bracket_code,
        match_order: selectedMatch.match_order,
      });

      setSelectedMatch(null);
      toast('Cruce actualizado y proyectado', 'success');
      loadBracket();
    } catch (e) {
      toast('Error al guardar cruce', 'error');
    }
  };

  const handleDisqualify = async (teamId: string, isHome: boolean) => {
    if (teamId === 'TBD') return;
    try {
      const existing = standings.find(s => s.name === getTeamName(teamId));
      let isNowDisqualified = true;
      if (existing) {
        isNowDisqualified = !existing.disqualified;
        await updateStanding(existing.id, { disqualified: isNowDisqualified });
      } else {
        await upsertStanding({
          tournament_id: tournamentId,
          team_id: teamId,
          name: getTeamName(teamId),
          played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, fouls: 0,
          disqualified: true, points_penalty: 0, goal_difference: 0
        } as any);
      }
      
      if (isNowDisqualified && selectedMatch) {
        const rivalId = isHome ? selectedMatch.away_team_id : selectedMatch.home_team_id;
        if (rivalId && rivalId !== 'TBD') {
          const updatedMatch = { ...selectedMatch, 
            status: 'played', 
            home_score: isHome ? 0 : 3, 
            away_score: isHome ? 3 : 0, 
            winner_id: rivalId 
          } as Match;
          setSelectedMatch(updatedMatch);
          // Don't auto-save here, let user click Guardar y Proyectar
        }
      }
      toast(isNowDisqualified ? 'Equipo descalificado' : 'Equipo rehabilitado', 'success');
      loadBracket();
    } catch(e) {
      toast('Error al descalificar', 'error');
    }
  };

  const getTeamName = (tid: string) => {
    return getTeamDisplayName(tid, teams);
  };

  const isTeamDisqualified = (tid: string) => {
    if (tid === 'TBD') return false;
    const s = standings.find(x => x.name === getTeamName(tid));
    return s?.disqualified || false;
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

  const renderMatchCard = (m: Match, extraClass?: string) => {
    const homeDesc = isTeamDisqualified(m.home_team_id);
    const awayDesc = isTeamDisqualified(m.away_team_id);
    return (
    <GlassCard key={m.id} className={`p-3 w-48 sm:w-64 min-w-0 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors ${m.bracket_code === 'F1' ? 'border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]' : ''} ${extraClass || ''}`} onClick={() => setSelectedMatch(m)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{m.bracket_code}</span>
      </div>
      <div className="flex justify-between items-center py-1 border-b border-white/5 gap-2">
        <span className={`truncate text-xs md:text-sm flex-1 min-w-0 flex items-center gap-1 ${m.winner_id === m.home_team_id ? 'font-bold text-white' : 'text-gray-300'} ${homeDesc ? 'line-through text-rose-400/80' : ''}`} title={getTeamName(m.home_team_id)}>
          {homeDesc && <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1 rounded-sm no-underline">DESC</span>}
          {getTeamName(m.home_team_id)}
        </span>
        <span className="font-mono text-sm sm:text-lg font-bold shrink-0 text-white">{m.status !== 'scheduled' ? m.home_score : '-'}</span>
      </div>
      <div className="flex justify-between items-center py-1 pt-2 gap-2">
        <span className={`truncate text-xs md:text-sm flex-1 min-w-0 flex items-center gap-1 ${m.winner_id === m.away_team_id ? 'font-bold text-white' : 'text-gray-300'} ${awayDesc ? 'line-through text-rose-400/80' : ''}`} title={getTeamName(m.away_team_id)}>
          {awayDesc && <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1 rounded-sm no-underline">DESC</span>}
          {getTeamName(m.away_team_id)}
        </span>
        <span className="font-mono text-sm sm:text-lg font-bold shrink-0 text-white">{m.status !== 'scheduled' ? m.away_score : '-'}</span>
      </div>
    </GlassCard>
  )};

  return (
    <div className="p-6 overflow-x-auto custom-scrollbar">
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <CustomSelect 
            options={[
              {value: 'final', label: 'Final Directa (2 equipos)'},
              {value: 'semifinal', label: 'Semifinales (4 equipos)'},
              {value: 'quarterfinal', label: 'Cuartos de Final (8 equipos)'}
            ]} 
            value={initialRound} 
            onChange={(v) => setInitialRound(v as any)} 
          />
          {(initialRound === 'quarterfinal' || initialRound === 'semifinal') && (
            <CustomSwitch checked={hasThirdPlace} onChange={handleToggleThirdPlace} label="Partido por el 3er Puesto" />
          )}
        </div>
        <Button variant="primary" onClick={() => {
          if (matches.length > 0) {
            if(window.confirm('¿Estás seguro de regenerar el cuadro? Se perderán las llaves actuales.')) {
              handleGenerate();
            }
          } else {
            handleGenerate();
          }
        }} className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4"/> Generar / Reiniciar Cuadro</Button>
      </div>

      <div className="flex items-center gap-12 min-w-max pb-8">
        
        {/* Octavos */}
        {getNodesByRound('8').length > 0 && (
          <div className="flex flex-col gap-4 justify-around h-full">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center sticky top-0">Octavos</h3>
            {getNodesByRound('8').map(m => renderMatchCard(m))}
          </div>
        )}

        {/* Cuartos */}
        {getNodesByRound('4').length > 0 && (
          <div className="flex flex-col gap-12 justify-around h-full">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center sticky top-0">Cuartos</h3>
            {getNodesByRound('4').map(m => renderMatchCard(m))}
          </div>
        )}

        {/* Semis */}
        {getNodesByRound('2').length > 0 && (
          <div className="flex flex-col gap-24 justify-around h-full">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center sticky top-0">Semifinales</h3>
            {getNodesByRound('2').map(m => renderMatchCard(m))}
          </div>
        )}

        {/* Final & Tercer Puesto */}
        {(getNodesByRound('1').length > 0 || getNodesByRound('third_place').length > 0) && (
          <div className="flex flex-col justify-center gap-12 h-full">
            {getNodesByRound('1').length > 0 && (
              <div>
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center flex items-center justify-center gap-2 sticky top-0"><Trophy className="w-4 h-4 text-primary" /> Final</h3>
                {getNodesByRound('1').map(m => renderMatchCard(m))}
              </div>
            )}
            
            {getNodesByRound('third_place').length > 0 && (
              <div className="mt-8">
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 text-center text-amber-500/80 flex items-center justify-center gap-2"><Award className="w-4 h-4" /> Tercer Puesto</h3>
                {getNodesByRound('third_place').map(m => renderMatchCard(m, 'border-amber-500/30'))}
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModal isOpen={!!selectedMatch} onClose={() => setSelectedMatch(null)} title={`Definir Cruce ${selectedMatch?.bracket_code || ''}`}>
        {selectedMatch && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-3">
                <CustomSelect 
                  options={[{value: 'TBD', label: 'Por definir (TBD)'}, ...teams.map(t => ({value: t.id, label: t.name}))]} 
                  value={selectedMatch.home_team_id || 'TBD'} 
                  onChange={(v) => {
                    const newHome = String(v);
                    const newWinner = (selectedMatch.winner_id === selectedMatch.home_team_id) ? undefined : selectedMatch.winner_id;
                    setSelectedMatch({...selectedMatch, home_team_id: newHome, winner_id: newWinner});
                  }} 
                />
                <input type="number" className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-black text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={selectedMatch.home_score ?? 0} onChange={e=>setSelectedMatch({...selectedMatch, home_score: parseInt(e.target.value)||0})} />
                <Button variant="ghost" className="text-[10px] text-danger hover:bg-danger/10 p-1 h-auto w-full flex items-center justify-center gap-1" onClick={() => handleDisqualify(selectedMatch.home_team_id, true)}>
                  <ShieldAlert className="w-3 h-3" /> {isTeamDisqualified(selectedMatch.home_team_id) ? 'Rehabilitar' : 'Descalificar'}
                </Button>
              </div>
              <div className="flex flex-col items-center gap-3">
                <CustomSelect 
                  options={[{value: 'TBD', label: 'Por definir (TBD)'}, ...teams.map(t => ({value: t.id, label: t.name}))]} 
                  value={selectedMatch.away_team_id || 'TBD'} 
                  onChange={(v) => {
                    const newAway = String(v);
                    const newWinner = (selectedMatch.winner_id === selectedMatch.away_team_id) ? undefined : selectedMatch.winner_id;
                    setSelectedMatch({...selectedMatch, away_team_id: newAway, winner_id: newWinner});
                  }} 
                />
                <input type="number" className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-3xl font-black text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={selectedMatch.away_score ?? 0} onChange={e=>setSelectedMatch({...selectedMatch, away_score: parseInt(e.target.value)||0})} />
                <Button variant="ghost" className="text-[10px] text-danger hover:bg-danger/10 p-1 h-auto w-full flex items-center justify-center gap-1" onClick={() => handleDisqualify(selectedMatch.away_team_id, false)}>
                  <ShieldAlert className="w-3 h-3" /> {isTeamDisqualified(selectedMatch.away_team_id) ? 'Rehabilitar' : 'Descalificar'}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block text-center">¿Quién avanza / Ganador?</label>
              <div className="flex gap-4">
                <button 
                  className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${selectedMatch.winner_id === selectedMatch.home_team_id ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                  onClick={() => setSelectedMatch({...selectedMatch, winner_id: selectedMatch.home_team_id, status: 'played'})}
                >
                  {getTeamName(selectedMatch.home_team_id)}
                </button>
                <button 
                  className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${selectedMatch.winner_id === selectedMatch.away_team_id ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                  onClick={() => setSelectedMatch({...selectedMatch, winner_id: selectedMatch.away_team_id, status: 'played'})}
                >
                  {getTeamName(selectedMatch.away_team_id)}
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button onClick={handleSaveMatch} variant="primary" className="flex-1 text-sm font-bold">Guardar y Proyectar</Button>
              <Button onClick={() => setSelectedMatch(null)} variant="glass" className="flex-1 text-sm">Cancelar</Button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
