import React, { useState, useEffect, useMemo } from 'react';
import { Match, Tournament, GlobalTeam } from '../../types';
import { getMatches, createMatch, updateMatch, deleteMatch } from '../../services/matchesService';
import { getTournaments } from '../../services/tournamentsService';
import { getTeams } from '../../services/teamsService';
import { GlassModal } from '../../components/ui/GlassModal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { CustomSwitch } from '../../components/ui/CustomSwitch';
import { CustomDatePicker } from '../../components/ui/CustomDatePicker';
import { CustomTimePicker } from '../../components/ui/CustomTimePicker';
import { Button } from '../../components/ui/Button';
import { AdminLineupEditor } from '../../features/matches/components/AdminLineupEditor';
import { Search, Edit2, Trash2, ExternalLink, Plus, Minus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminMatchesTab: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<GlobalTeam[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Match>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTournament, setFilterTournament] = useState<string>('all');
  const [modalTab, setModalTab] = useState<'schedule'|'score'|'extras'>('schedule');
  const [isWO, setIsWO] = useState(false);
  const { toast } = useToast();

  const fetchAll = () => {
    getMatches().then(setMatches);
    getTournaments().then(setTournaments);
    getTeams().then(setTeams);
  };
  useEffect(() => { fetchAll(); }, []);

  const openModal = (match?: Match) => {
    setCurrent(match || { status: 'scheduled', home_score: 0, away_score: 0, match_type: 'f7', has_penalties: false });
    setIsWO(false);
    setModalTab('schedule');
    setModalOpen(true);
  };

  const save = async () => {
    const dataToSave = { ...current };
    if (!dataToSave.tournament_id || dataToSave.tournament_id === '') {
      dataToSave.tournament_id = undefined; // it will be sanitized to null
    }
    if (isWO) {
      dataToSave.home_score = 3;
      dataToSave.away_score = 0;
      dataToSave.status = 'played';
    }
    if (!dataToSave.description && !dataToSave.title) {
      const h = teams.find(t=>t.id===current.home_team_id)?.name || 'Local';
      const a = teams.find(t=>t.id===current.away_team_id)?.name || 'Visitante';
      dataToSave.description = `${h} vs ${a}`;
    }
    try {
      if (dataToSave.id) await updateMatch(dataToSave.id, dataToSave);
      else await createMatch(dataToSave as Match);
      setModalOpen(false);
      fetchAll();
      toast('Partido guardado exitosamente', 'success');
    } catch (e: any) {
      toast(`Error al guardar el partido: ${e?.message || 'Desconocido'}`, 'error');
    }
  };

  const remove = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este partido?')) {
      try {
        await deleteMatch(id);
        fetchAll();
        toast('Partido eliminado', 'success');
      } catch (e) {
        toast('Error al eliminar', 'error');
      }
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchTournament = filterTournament === 'all' || m.tournament_id === filterTournament;
      const homeTeam = teams.find(t => t.id === m.home_team_id)?.name.toLowerCase() || '';
      const awayTeam = teams.find(t => t.id === m.away_team_id)?.name.toLowerCase() || '';
      const matchSearch = searchQuery === '' || homeTeam.includes(searchQuery.toLowerCase()) || awayTeam.includes(searchQuery.toLowerCase());
      return matchTournament && matchSearch;
    });
  }, [matches, filterTournament, searchQuery, teams]);

  const parsedLineups = useMemo(() => {
    if (typeof current.lineups === 'string') {
      try { return JSON.parse(current.lineups); } catch { return { home: { starting: [], substitutes: [] }, away: { starting: [], substitutes: [] } }; }
    }
    return current.lineups || { home: { starting: [], substitutes: [] }, away: { starting: [], substitutes: [] } };
  }, [current.lineups]);

  const getTeamLogo = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.logo ? <img src={team.logo} className="w-5 h-5 rounded-full object-cover inline-block mr-2" alt="" /> : <div className="w-5 h-5 rounded-full bg-white/10 inline-block mr-2 align-middle"/>;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Partidos</h2>
        <Button variant="primary" onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Partido
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por equipo..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors sm:w-64" 
          value={filterTournament} 
          onChange={e=>setFilterTournament(e.target.value)}
        >
          <option value="all">Todos los Torneos</option>
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-sm whitespace-nowrap text-white">
          <thead className="text-gray-400 bg-white/5">
            <tr>
              <th className="py-3 px-4 font-medium">Torneo</th>
              <th className="py-3 px-4 font-medium">Equipos</th>
              <th className="py-3 px-4 font-medium">Fecha/Sede</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium text-center">Marcador</th>
              <th className="py-3 px-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMatches.map(m => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-gray-400 text-xs">{tournaments.find(t=>t.id===m.tournament_id)?.name || m.tournament_id}</td>
                <td className="py-3 px-4 font-medium flex flex-col gap-1 min-w-0">
                  <div className="flex items-center min-w-0"><span className="shrink-0">{getTeamLogo(m.home_team_id)}</span><span className="truncate max-w-[90px] sm:max-w-[140px]" title={teams.find(t=>t.id===m.home_team_id)?.name || m.home_team_id}>{teams.find(t=>t.id===m.home_team_id)?.name || m.home_team_id}</span></div>
                  <div className="flex items-center min-w-0"><span className="shrink-0">{getTeamLogo(m.away_team_id)}</span><span className="truncate max-w-[90px] sm:max-w-[140px]" title={teams.find(t=>t.id===m.away_team_id)?.name || m.away_team_id}>{teams.find(t=>t.id===m.away_team_id)?.name || m.away_team_id}</span></div>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs min-w-0">
                  <div className="whitespace-nowrap">{m.date} {m.time}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5 truncate max-w-[80px] sm:max-w-[120px]" title={m.location_id}>{m.location_id}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${m.status === 'live' ? 'bg-danger/20 text-danger animate-pulse' : 'bg-white/10 text-gray-300'}`}>{m.status}</span>
                </td>
                <td className="py-3 px-4 text-center font-mono text-lg tracking-widest font-bold">
                  {m.home_score} - {m.away_score}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openModal(m)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => remove(m.id)} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => window.open(`/partido/${m.id}`)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Partido">
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setModalTab('schedule')} className={`text-sm pb-2 border-b-2 transition-colors shrink-0 ${modalTab === 'schedule' ? 'border-primary text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>Equipos y Horario</button>
          <button onClick={() => setModalTab('score')} className={`text-sm pb-2 border-b-2 transition-colors shrink-0 ${modalTab === 'score' ? 'border-primary text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>Marcador y Estado</button>
          <button onClick={() => setModalTab('extras')} className={`text-sm pb-2 border-b-2 transition-colors shrink-0 ${modalTab === 'extras' ? 'border-primary text-white font-medium' : 'border-transparent text-gray-400 hover:text-white'}`}>Extras y Stream</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
          {modalTab === 'schedule' && (
            <div className="space-y-6">
              <CustomSelect options={[{value: '', label: 'Partido Amistoso / Libre (Sin Torneo)'}, ...tournaments.map(t=>({value:t.id,label:t.name}))]} value={current.tournament_id||''} onChange={v=>setCurrent({...current, tournament_id:v})} placeholder="Selecciona un Torneo..." />
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre / Etiqueta del Partido (Opcional)</label>
                  <button 
                    onClick={() => {
                      const h = teams.find(t=>t.id===current.home_team_id)?.name || 'Local';
                      const a = teams.find(t=>t.id===current.away_team_id)?.name || 'Visitante';
                      setCurrent({...current, title: `${h} vs ${a}`});
                    }}
                    className="text-[10px] text-primary hover:text-white transition-colors"
                  >
                    Usar nombres de equipos
                  </button>
                </div>
                <input type="text" placeholder='Ej. "Fecha 1: Equipo A vs Equipo B"' className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.title||current.description||''} onChange={e=>setCurrent({...current, title:e.target.value, description:e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <CustomSelect options={teams.map(t=>({value:t.id,label:t.name}))} value={current.home_team_id||''} onChange={v=>setCurrent({...current, home_team_id:v})} placeholder="Local" />
                <CustomSelect options={teams.map(t=>({value:t.id,label:t.name}))} value={current.away_team_id||''} onChange={v=>setCurrent({...current, away_team_id:v})} placeholder="Visitante" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CustomDatePicker value={current.date||''} onChange={v=>setCurrent({...current, date:v})} placeholder="Fecha" />
                <CustomTimePicker value={current.time||''} onChange={v=>setCurrent({...current, time:v})} />
                <input type="text" placeholder="Cancha" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.location_id||''} onChange={e=>setCurrent({...current, location_id:e.target.value})} />
              </div>
            </div>
          )}

          {modalTab === 'score' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-4 items-start">
                  <CustomSelect options={[
                    {value:'scheduled',label:'Programado'}, {value:'live',label:'En Vivo'}, 
                    {value:'played',label:'Finalizado'}, {value:'suspended',label:'Suspendido'}, 
                    {value:'postponed',label:'Pospuesto'}, {value:'cancelled',label:'Cancelado'}
                  ]} value={current.status||'scheduled'} onChange={v => setCurrent({...current, status: v as any})} placeholder="Estado" />
                  
                  {current.status === 'live' && (
                    <input type="text" placeholder="Minuto (ej. PT 25')" className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-2 text-danger text-sm outline-none animate-pulse focus:border-danger" value={current.current_minute||''} onChange={e=>setCurrent({...current, current_minute:e.target.value})} />
                  )}
                  {(current.status === 'suspended' || current.status === 'cancelled') && (
                    <input type="text" placeholder="Motivo público" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={current.description||''} onChange={e=>setCurrent({...current, description:e.target.value})} />
                  )}
                </div>
              </div>

              {!isWO && (
                <div className="bg-black/30 rounded-2xl p-4 sm:p-6 border border-white/5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Local</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrent({...current, home_score: Math.max(0, (current.home_score || 0) - 1)})} className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors active:scale-95"><Minus className="w-4 h-4" /></button>
                        <div className="w-12 h-12 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-2xl font-black text-white">{current.home_score || 0}</div>
                        <button onClick={() => setCurrent({...current, home_score: (current.home_score || 0) + 1})} className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors active:scale-95"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-white/20 hidden sm:block">-</div>
                    <div className="w-full h-px bg-white/10 block sm:hidden my-2"></div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Visitante</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrent({...current, away_score: Math.max(0, (current.away_score || 0) - 1)})} className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors active:scale-95"><Minus className="w-4 h-4" /></button>
                        <div className="w-12 h-12 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-2xl font-black text-white">{current.away_score || 0}</div>
                        <button onClick={() => setCurrent({...current, away_score: (current.away_score || 0) + 1})} className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors active:scale-95"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <CustomSwitch checked={isWO} onChange={c => setIsWO(c)} label="Resolución W.O. / Escritorio (3-0)" />
                {!isWO && (
                  <CustomSwitch checked={!!current.has_penalties} onChange={c => setCurrent({...current, has_penalties: c, home_penalties: c ? 0 : undefined, away_penalties: c ? 0 : undefined})} label="Definición por Penales" />
                )}
              </div>

              {!isWO && current.has_penalties && (
                <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] sm:text-xs text-primary/70 uppercase tracking-widest font-bold">Penales Local</label>
                    <input type="number" min="0" className="w-16 bg-black/40 border border-primary/30 rounded-lg px-1 py-1.5 text-center text-lg font-mono text-white outline-none focus:border-primary shrink-0" value={current.home_penalties||0} onChange={e=>setCurrent({...current, home_penalties:parseInt(e.target.value)||0})} />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] sm:text-xs text-primary/70 uppercase tracking-widest font-bold">Penales Visita</label>
                    <input type="number" min="0" className="w-16 bg-black/40 border border-primary/30 rounded-lg px-1 py-1.5 text-center text-lg font-mono text-white outline-none focus:border-primary shrink-0" value={current.away_penalties||0} onChange={e=>setCurrent({...current, away_penalties:parseInt(e.target.value)||0})} />
                  </div>
                </div>
              )}
            </div>
          )}

          {modalTab === 'extras' && (
            <div className="space-y-6">
               <div className="space-y-2">
                <CustomSwitch checked={!!current.is_featured} onChange={c => setCurrent({...current, is_featured: c})} label="Fijar como Partido Destacado en el Hero de la Home" />
              </div>
               <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stream URL (YouTube/Twitch)</label>
                <input type="text" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.stream_url||''} onChange={e=>setCurrent({...current, stream_url:e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">ID Video Guardado</label>
                <input type="text" placeholder="ID Opcional" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.video_id||''} onChange={e=>setCurrent({...current, video_id:e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Crónica / Resumen Oculto</label>
                <textarea placeholder="Notas internas o resumen..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors h-32 resize-none" value={current.description||''} onChange={e=>setCurrent({...current, description:e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alineaciones y Sucesos (Visual Editor)</label>
                <AdminLineupEditor 
                  lineups={parsedLineups as any}
                  onChange={(v) => setCurrent({...current, lineups: v})}
                  homeTeamName={teams.find(t=>t.id===current.home_team_id)?.name || 'Local'}
                  awayTeamName={teams.find(t=>t.id===current.away_team_id)?.name || 'Visitante'}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-white/10 mt-4">
          <Button onClick={save} variant="primary" className="flex-1">Guardar</Button>
          <Button onClick={()=>setModalOpen(false)} variant="glass" className="flex-1">Cancelar</Button>
        </div>
      </GlassModal>
    </div>
  );
};

