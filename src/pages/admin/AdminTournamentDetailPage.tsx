import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournamentById, updateTournament, getStandingsByTournament, upsertStanding, updateStanding } from '../../services/tournamentsService';
import { getMatches, createMatch, updateMatch } from '../../services/matchesService';
import { getTeams } from '../../services/teamsService';
import { Tournament, Match, TeamStanding, GlobalTeam } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassModal } from '../../components/ui/GlassModal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { CustomSwitch } from '../../components/ui/CustomSwitch';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Save, Zap, ExternalLink, ShieldAlert, Plus, Minus, Edit2, Play, Trash2, Sliders, Calendar, ListOrdered, GitBranch, Users } from 'lucide-react';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { useToast } from '../../context/ToastContext';
import { AdminBracketEditor } from './AdminBracketEditor';
import { StandingsSkeleton } from '../../components/ui/Skeleton';
import { TacticalPitch } from '../../features/matches/components/TacticalPitch';

export const AdminTournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [teams, setTeams] = useState<GlobalTeam[]>([]);
  const [newLocalTeamName, setNewLocalTeamName] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'teams' | 'matches' | 'standings' | 'brackets'>('config');
  const [activeConfigTab, setActiveConfigTab] = useState<'basics'|'visibility'>('basics');
  
  // Team editing
  const [editingTeam, setEditingTeam] = useState<GlobalTeam | null>(null);
  
  const [saving, setSaving] = useState(false);

  const [isMatchModalOpen, setMatchModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Partial<Match>>({});
  const [isWO, setIsWO] = useState(false);

  const fetchAll = async () => {
    if (!id) return;
    try {
      const [tData, mData, sData, teamsData] = await Promise.all([
        getTournamentById(id),
        getMatches({ tournament_id: id }),
        getStandingsByTournament(id),
        getTeams()
      ]);
      if (tData) setTournament(tData);
      setMatches(mData);
      setStandings(sData);
      setTeams(teamsData);
    } catch (e) {
      toast('Error al cargar torneo', 'error');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleSaveConfig = async () => {
    if (!tournament) return;
    setSaving(true);
    try {
      await updateTournament(tournament.id, tournament);
      toast('Torneo actualizado', 'success');
    } catch (e) {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeam = (teamId: string) => {
    if (!tournament) return;
    const ids = tournament.team_ids || [];
    const newIds = ids.includes(teamId) ? ids.filter(i => i !== teamId) : [...ids, teamId];
    setTournament({ ...tournament, team_ids: newIds });
  };

  const removeTeamCompletely = async (team: GlobalTeam) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el equipo "${team.name}"?`)) return;
    try {
      const { deleteTeam } = await import('../../services/teamsService');
      await deleteTeam(team.id);
      setTeams(teams.filter(t => t.id !== team.id));
      if (tournament?.team_ids?.includes(team.id)) {
        toggleTeam(team.id);
      }
      toast('Equipo eliminado correctamente', 'success');
    } catch (e: any) {
      toast(e.message || 'Error al eliminar equipo', 'error');
    }
  };

  const saveEditedTeam = async () => {
    if (!editingTeam) return;
    try {
      const { updateTeam } = await import('../../services/teamsService');
      await updateTeam(editingTeam.id, editingTeam);
      setTeams(teams.map(t => t.id === editingTeam.id ? editingTeam : t));
      setEditingTeam(null);
      toast('Equipo actualizado', 'success');
    } catch (e: any) {
      toast(e.message || 'Error al actualizar equipo', 'error');
    }
  };

  const handleCreateLocalTeam = async () => {
    if (!newLocalTeamName.trim() || !tournament) return;
    try {
      const { createTeam } = await import('../../services/teamsService');
      const newTeam = await createTeam({ name: newLocalTeamName, is_global: false });
      setTeams([...teams, newTeam]);
      const newIds = [...(tournament.team_ids || []), newTeam.id];
      const updatedTourney = { ...tournament, team_ids: newIds };
      setTournament(updatedTourney);
      await updateTournament(updatedTourney.id, updatedTourney);
      setNewLocalTeamName('');
      toast('Equipo local creado y añadido al torneo', 'success');
    } catch (e: any) {
      toast(e.message || 'Error al crear equipo local', 'error');
    }
  };

  const handleAutoCalcStandings = async () => {
    if (!tournament) return;
    const playedMatches = matches.filter(m => m.status === 'played');
    
    // Compute standings from scratch
    const stats: Record<string, any> = {};
    (tournament.team_ids || []).forEach(tid => {
      stats[tid] = { played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, fouls: 0 };
    });

    playedMatches.forEach(m => {
      const h = m.home_team_id;
      const a = m.away_team_id;
      if (!stats[h]) stats[h] = { played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, fouls: 0 };
      if (!stats[a]) stats[a] = { played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, fouls: 0 };
      
      stats[h].played++;
      stats[a].played++;
      stats[h].goals_for += m.home_score;
      stats[h].goals_against += m.away_score;
      stats[a].goals_for += m.away_score;
      stats[a].goals_against += m.home_score;

      if (m.home_score > m.away_score) {
        stats[h].won++; stats[h].points += 3; stats[a].lost++;
      } else if (m.home_score < m.away_score) {
        stats[a].won++; stats[a].points += 3; stats[h].lost++;
      } else {
        stats[h].drawn++; stats[a].drawn++; stats[h].points += 1; stats[a].points += 1;
      }
    });

    try {
      for (const [tid, s] of Object.entries(stats)) {
        const teamName = teams.find(t => t.id === tid)?.name || tid;
        const existing = standings.find(st => st.name === teamName);
        const data: Partial<TeamStanding> = {
          tournament_id: tournament.id,
          name: teamName,
          played: s.played,
          won: s.won,
          drawn: s.drawn,
          lost: s.lost,
          goals_for: s.goals_for,
          goals_against: s.goals_against,
          goal_difference: s.goals_for - s.goals_against,
          points: s.points,
          fouls: s.fouls,
          disqualified: existing?.disqualified || false,
          points_penalty: existing?.points_penalty || 0
        };
        // apply penalty
        data.points = Math.max(0, (data.points || 0) - (data.points_penalty || 0));

        if (existing) {
          await updateStanding(existing.id, data);
        } else {
          await upsertStanding(data); // Needs to handle id or let supabase generate it
        }
      }
      toast('Posiciones recalculadas', 'success');
      fetchAll();
    } catch (e) {
      toast('Error al recalcular', 'error');
    }
  };

  const handlePenaltyUpdate = async (id: string, penalty: number) => {
    try {
      await updateStanding(id, { points_penalty: penalty });
      toast('Sanción actualizada', 'success');
      fetchAll();
    } catch (e) {
      toast('Error al aplicar sanción', 'error');
    }
  };

  const toggleDisqualified = async (st: TeamStanding) => {
    try {
      await updateStanding(st.id, { disqualified: !st.disqualified });
      toast(st.disqualified ? 'Equipo habilitado' : 'Equipo descalificado', 'success');
      fetchAll();
    } catch (e) {
      toast('Error al actualizar estado', 'error');
    }
  };

  const openMatchModal = (m?: Match) => {
    setCurrentMatch(m || { tournament_id: tournament?.id, status: 'scheduled', home_score: 0, away_score: 0, match_type: tournament?.match_type || 'f7', has_penalties: false });
    setIsWO(false);
    setMatchModalOpen(true);
  };

  const saveMatch = async () => {
    const dataToSave = { ...currentMatch };
    if (isWO) {
      dataToSave.home_score = 3;
      dataToSave.away_score = 0;
      dataToSave.status = 'played';
    }
    try {
      if (dataToSave.id) await updateMatch(dataToSave.id, dataToSave);
      else await createMatch(dataToSave as Match);
      setMatchModalOpen(false);
      fetchAll();
      toast('Partido guardado', 'success');
    } catch (e) {
      toast('Error al guardar partido', 'error');
    }
  };

  if (!tournament) return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-7xl mx-auto pt-8">
      <StandingsSkeleton />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-full overflow-x-hidden mx-auto md:max-w-7xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
          <p className="text-gray-400 text-sm">Edición del Torneo</p>
        </div>
      </div>

      <AdminTabs 
        tabs={[
          { id: 'config', label: 'General', icon: Sliders },
          { id: 'matches', label: 'Partidos', icon: Calendar },
          { id: 'standings', label: 'Posiciones', icon: ListOrdered },
          { id: 'brackets', label: 'Brackets', icon: GitBranch },
          { id: 'teams', label: 'Equipos', icon: Users }
        ]} 
        value={activeTab} 
        onChange={(v) => setActiveTab(v as any)} 
      />

      {activeTab === 'config' && (
        <GlassCard className="p-8 space-y-6">
          <div className="flex gap-4 mb-6 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveConfigTab('basics')} className={`text-sm pb-2 border-b-2 transition-colors shrink-0 ${activeConfigTab === 'basics' ? 'border-primary text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>Básicos</button>
            <button onClick={() => setActiveConfigTab('visibility')} className={`text-sm pb-2 border-b-2 transition-colors shrink-0 ${activeConfigTab === 'visibility' ? 'border-primary text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>Visibilidad</button>
          </div>

          {activeConfigTab === 'basics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Nombre</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={tournament.name} onChange={e => setTournament({...tournament, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Temporada</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={tournament.season || ''} onChange={e => setTournament({...tournament, season: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Tipo</label>
                <CustomSelect options={[{value:'league',label:'Liga Regular'}, {value:'knockout',label:'Eliminatoria'}]} value={tournament.type} onChange={v => setTournament({...tournament, type: v as any})} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Modalidad</label>
                <CustomSelect options={[{value:'f5',label:'Fútbol 5'}, {value:'f7',label:'Fútbol 7'}, {value:'f11',label:'Fútbol 11'}]} value={tournament.match_type} onChange={v => setTournament({...tournament, match_type: v as any})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">URL Portada</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={tournament.image || ''} onChange={e => setTournament({...tournament, image: e.target.value})} />
              </div>
            </div>
          )}

          {activeConfigTab === 'visibility' && (
            <div className="bg-black/20 border border-white/5 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CustomSwitch checked={!!tournament.show_standings} onChange={c => setTournament({...tournament, show_standings: c})} label="Mostrar Tabla de Posiciones" />
              <CustomSwitch checked={!!tournament.show_brackets} onChange={c => setTournament({...tournament, show_brackets: c})} label="Mostrar Bracket Eliminatorio" />
              <CustomSwitch checked={!!tournament.show_scorers} onChange={c => setTournament({...tournament, show_scorers: c})} label="Mostrar Tabla de Goleadores" />
              <CustomSwitch checked={!!tournament.show_discipline} onChange={c => setTournament({...tournament, show_discipline: c})} label="Mostrar Tabla de Disciplina" />
            </div>
          )}

          <div className="pt-4 border-t border-white/10 mt-4">
            <Button onClick={handleSaveConfig} variant="primary" isLoading={saving} className="flex items-center gap-2 min-h-[44px] px-6"><Save className="w-4 h-4" /> Guardar Cambios</Button>
          </div>
        </GlassCard>
      )}

      {activeTab === 'teams' && (
        <GlassCard className="p-4 sm:p-6 space-y-4">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Gestión de Equipos</h4>
          
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-black/40 p-3 rounded-lg border border-white/5">
            <input 
              type="text" 
              placeholder="Nombre equipo local..." 
              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-3 sm:py-2 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" 
              value={newLocalTeamName} 
              onChange={e => setNewLocalTeamName(e.target.value)} 
            />
            <Button onClick={handleCreateLocalTeam} variant="primary" className="whitespace-nowrap min-h-[44px]">
              Crear Equipo
            </Button>
          </div>

          <div className="grid gap-2 max-h-96 overflow-y-auto custom-scrollbar bg-black/40 p-2 rounded-lg border border-white/5">
            {teams.map(t => {
              const isSelected = (tournament.team_ids||[]).includes(t.id);
              return (
                <div key={t.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                  <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer min-h-[32px]">
                    <input type="checkbox" checked={isSelected} onChange={()=>toggleTeam(t.id)} className="accent-primary w-5 h-5 rounded shrink-0" />
                    <span className="text-gray-300 text-sm font-medium flex items-center gap-2 flex-1 min-w-0" title={t.name}>
                      {t.logo && <img src={t.logo} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />}
                      <span className="truncate max-w-[120px] sm:max-w-none">{t.name}</span> <span className="text-gray-500 text-xs shrink-0">{t.is_global ? '(Global)' : '(Local)'}</span>
                    </span>
                  </label>
                  <div className="flex gap-2 justify-end shrink-0">
                    <Button variant="glass" className="w-11 h-11 sm:h-9 sm:w-auto p-0 sm:px-3 text-xs" onClick={() => setEditingTeam(t)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="w-11 h-11 sm:h-9 sm:w-auto p-0 sm:px-3 text-xs text-danger hover:bg-danger/10" onClick={() => removeTeamCompletely(t)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Partidos del Torneo</h3>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => openMatchModal()} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo Partido</Button>
              <Button variant="glass" onClick={() => navigate('/admin')}>Ir a Gestión General</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {matches.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No hay partidos en este torneo.</p>
              ) : (
                <div className="space-y-3">
                  {matches.map(m => (
                    <div key={m.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/30 transition-colors flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center text-xs text-gray-400 mb-2 gap-2">
                          <span>{m.date} {m.time}</span>
                          <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${m.status==='live'?'bg-danger/20 text-danger animate-pulse':'bg-white/10'}`}>{m.status}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-white text-lg">
                          <span className="truncate w-1/3">{teams.find(t=>t.id===m.home_team_id)?.name || m.home_team_id}</span>
                          <span className="text-primary bg-primary/10 px-3 py-1 rounded-lg font-mono">{m.home_score} - {m.away_score}</span>
                          <span className="truncate w-1/3 text-right">{teams.find(t=>t.id===m.away_team_id)?.name || m.away_team_id}</span>
                        </div>
                      </div>
                      <button onClick={() => openMatchModal(m)} className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
            <GlassCard className="p-4 overflow-hidden relative min-h-[500px]">
              <h4 className="text-sm font-bold text-white mb-4">Vista Previa Táctica ({tournament.match_type.toUpperCase()})</h4>
              <div className="absolute inset-0 top-12 scale-75 origin-top">
                <TacticalPitch homeLineup={undefined} awayLineup={undefined} />
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'standings' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-bold text-white">Tabla de Posiciones</h3>
            <div className="flex gap-2">
              <Button onClick={() => window.open(`/torneo/${tournament.id}`)} variant="glass" className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Ver en la Web</Button>
              <Button onClick={handleAutoCalcStandings} variant="primary" className="flex items-center gap-2"><Zap className="w-4 h-4" /> Recalcular Automáticamente</Button>
            </div>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-white/10 bg-black/20">
             <table className="w-full text-left text-sm whitespace-nowrap text-white table-auto min-w-[500px]">
               <thead className="text-gray-400 uppercase text-xs tracking-wider sticky top-[var(--nav-h,4rem)] z-20 bg-[rgba(18,22,34,0.75)] backdrop-blur-md border-b border-white/10 after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-[rgba(18,22,34,0.6)] after:to-transparent after:pointer-events-none">
                 <tr>
                   <th className="py-3 px-2 sm:px-4">Pos</th>
                   <th className="py-3 px-2 sm:px-4 sticky left-0 bg-[#0c101a]/95 backdrop-blur-md z-10 border-r border-white/5">Equipo</th>
                   <th className="py-3 px-2 sm:px-4 text-center">PJ</th>
                   <th className="py-3 px-4 text-center hidden sm:table-cell">PG</th>
                   <th className="py-3 px-4 text-center hidden sm:table-cell">PE</th>
                   <th className="py-3 px-4 text-center hidden sm:table-cell">PP</th>
                   <th className="py-3 px-4 text-center hidden md:table-cell">GF</th>
                   <th className="py-3 px-4 text-center hidden md:table-cell">GC</th>
                   <th className="py-3 px-2 sm:px-4 text-center">PTS</th>
                   <th className="py-3 px-2 sm:px-4 text-center">Sanción</th>
                   <th className="py-3 px-2 sm:px-4 text-right">Estado</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {standings.map((st, idx) => (
                   <tr key={st.id} className={`hover:bg-white/5 transition-colors ${st.disqualified ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-2 sm:px-4 text-gray-400">{idx + 1}</td>
                      <td className="py-3 px-2 sm:px-4 font-medium min-w-[110px] max-w-[130px] sm:max-w-none truncate sticky left-0 bg-[#0c101a]/95 backdrop-blur-md z-10 border-r border-white/5" title={st.name}>{st.name}</td>
                      <td className="py-3 px-2 sm:px-4 text-center">{st.played}</td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">{st.won}</td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">{st.drawn}</td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">{st.lost}</td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">{st.goals_for}</td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">{st.goals_against}</td>
                      <td className="py-3 px-2 sm:px-4 text-center font-bold text-primary">{st.points}</td>
                      <td className="py-3 px-2 sm:px-4 text-center">
                        <input type="number" min="0" className="w-12 bg-black/40 border border-white/10 rounded px-1 py-1 text-center text-sm text-white outline-none focus:border-primary shrink-0" value={st.points_penalty || 0} onChange={e => handlePenaltyUpdate(st.id, parseInt(e.target.value)||0)} />
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <Button onClick={() => toggleDisqualified(st)} variant="ghost" className={st.disqualified ? 'text-primary' : 'text-danger'}>
                           <ShieldAlert className="w-4 h-4" /> <span className="hidden sm:inline">{st.disqualified ? 'Habilitar' : 'Descalificar'}</span>
                        </Button>
                      </td>
                   </tr>
                 ))}
                 {standings.length === 0 && (
                   <tr>
                     <td colSpan={11} className="py-8 text-center text-gray-500">Haz clic en "Recalcular Automáticamente" para generar la tabla.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </GlassCard>
      )}

      {activeTab === 'brackets' && (
        <AdminBracketEditor tournamentId={tournament.id} teams={teams} teamIds={tournament.team_ids || []} />
      )}

      <GlassModal isOpen={isMatchModalOpen} onClose={() => setMatchModalOpen(false)} title="Edición Rápida de Partido">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect options={teams.map(t=>({value:t.id,label:t.name}))} value={currentMatch.home_team_id||''} onChange={v=>setCurrentMatch({...currentMatch, home_team_id:v})} placeholder="Local" />
            <CustomSelect options={teams.map(t=>({value:t.id,label:t.name}))} value={currentMatch.away_team_id||''} onChange={v=>setCurrentMatch({...currentMatch, away_team_id:v})} placeholder="Visitante" />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <CustomSelect options={[
              {value:'scheduled',label:'Programado'}, {value:'live',label:'En Vivo'}, 
              {value:'played',label:'Finalizado'}, {value:'suspended',label:'Suspendido'}, 
              {value:'cancelled',label:'Cancelado'}
            ]} value={currentMatch.status||'scheduled'} onChange={v => setCurrentMatch({...currentMatch, status: v as any})} placeholder="Estado" />
            
            {currentMatch.status === 'live' && (
              <input type="text" placeholder="Minuto (ej. PT 25')" className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-2 text-danger text-sm outline-none animate-pulse focus:border-danger" value={currentMatch.current_minute||''} onChange={e=>setCurrentMatch({...currentMatch, current_minute:e.target.value})} />
            )}
          </div>

          {!isWO && (
            <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
              <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Local</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentMatch({...currentMatch, home_score: Math.max(0, (currentMatch.home_score || 0) - 1)})} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Minus className="w-4 h-4" /></button>
                    <div className="w-16 h-20 bg-white/10 rounded-xl flex items-center justify-center text-4xl font-black text-white">{currentMatch.home_score || 0}</div>
                    <button onClick={() => setCurrentMatch({...currentMatch, home_score: (currentMatch.home_score || 0) + 1})} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-2xl font-black text-white/20">-</div>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Visitante</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentMatch({...currentMatch, away_score: Math.max(0, (currentMatch.away_score || 0) - 1)})} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Minus className="w-4 h-4" /></button>
                    <div className="w-16 h-20 bg-white/10 rounded-xl flex items-center justify-center text-4xl font-black text-white">{currentMatch.away_score || 0}</div>
                    <button onClick={() => setCurrentMatch({...currentMatch, away_score: (currentMatch.away_score || 0) + 1})} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <CustomSwitch checked={isWO} onChange={c => setIsWO(c)} label="Resolución W.O. / Escritorio (3-0)" />
            {!isWO && (
              <CustomSwitch checked={!!currentMatch.has_penalties} onChange={c => setCurrentMatch({...currentMatch, has_penalties: c, home_penalties: c ? 0 : undefined, away_penalties: c ? 0 : undefined})} label="Definición por Penales" />
            )}
          </div>

          {!isWO && currentMatch.has_penalties && (
            <div className="grid grid-cols-2 gap-6 bg-primary/5 p-5 rounded-xl border border-primary/20">
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-primary/70 uppercase tracking-widest font-bold">Penales Local</label>
                <input type="number" min="0" className="w-20 bg-black/40 border border-primary/30 rounded-lg px-2 py-2 text-center text-xl font-mono text-white outline-none focus:border-primary" value={currentMatch.home_penalties||0} onChange={e=>setCurrentMatch({...currentMatch, home_penalties:parseInt(e.target.value)||0})} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-primary/70 uppercase tracking-widest font-bold">Penales Visitante</label>
                <input type="number" min="0" className="w-20 bg-black/40 border border-primary/30 rounded-lg px-2 py-2 text-center text-xl font-mono text-white outline-none focus:border-primary" value={currentMatch.away_penalties||0} onChange={e=>setCurrentMatch({...currentMatch, away_penalties:parseInt(e.target.value)||0})} />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-white/5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2"><Play className="w-4 h-4"/> Stream URL (YouTube/Twitch)</label>
            <input type="text" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentMatch.stream_url||''} onChange={e=>setCurrentMatch({...currentMatch, stream_url:e.target.value})} />
          </div>

          <div className="flex gap-4 pt-6 mt-4">
            <Button onClick={saveMatch} variant="primary" className="flex-1">Guardar Partido</Button>
            <Button onClick={()=>setMatchModalOpen(false)} variant="glass" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={!!editingTeam} onClose={() => setEditingTeam(null)} title="Editar Equipo">
        {editingTeam && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Nombre</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={editingTeam.name} onChange={e => setEditingTeam({...editingTeam, name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Sigla</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={editingTeam.acronym||''} onChange={e => setEditingTeam({...editingTeam, acronym: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">URL Escudo</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={editingTeam.logo||''} onChange={e => setEditingTeam({...editingTeam, logo: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Plantilla / Rosters (Opcional)</label>
              <textarea placeholder="Jugadores, notas..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 h-24 resize-none" value={editingTeam.roster_image||''} onChange={e => setEditingTeam({...editingTeam, roster_image: e.target.value})} />
            </div>
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button onClick={saveEditedTeam} variant="primary" className="flex-1">Guardar Equipo</Button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
