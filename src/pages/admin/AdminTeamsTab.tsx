import React, { useState, useEffect } from 'react';
import { GlobalTeam, Player } from '../../types';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamsService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Users, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminTeamsTab: React.FC = () => {
  const [teams, setTeams] = useState<GlobalTeam[]>([]);
  const [current, setCurrent] = useState<Partial<GlobalTeam>>({});
  const [players, setPlayers] = useState<Partial<Player>[]>([]);
  const { toast } = useToast();

  const fetchAll = () => {
    getTeams().then(setTeams);
  };
  
  useEffect(() => {
    fetchAll();
  }, []);

  const openModal = (t?: GlobalTeam) => {
    setCurrent(t || { name: 'Nuevo Equipo Global', shortName: 'NEW' });
    setPlayers(t?.players || []);
  };

  const handleSave = async () => {
    try {
      const dataToSave = { ...current, players: players as Player[] };
      if (current.id) {
        await updateTeam(current.id, dataToSave);
      } else {
        await createTeam(dataToSave as GlobalTeam);
      }
      toast('Equipo guardado correctamente', 'success');
      setCurrent({});
      setPlayers([]);
      fetchAll();
    } catch (e: any) {
      toast(e.message || 'Error al guardar equipo', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar equipo?')) {
      try {
        await deleteTeam(id);
        toast('Equipo eliminado correctamente', 'success');
        fetchAll();
      } catch (e: any) {
        toast(e.message || 'Error al eliminar equipo', 'error');
      }
    }
  };

  const addPlayer = () => {
    setPlayers([...players, { id: crypto.randomUUID(), name: '', number: 0, position: 'Jugador', stats: { games_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 } }]);
  };

  const updatePlayer = (index: number, field: string, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const removePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Equipos y Roster</h2>
        <Button onClick={() => openModal()} variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Equipo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Master List */}
        <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar snap-x pb-4 lg:pb-0 lg:max-h-[70vh]">
          {teams.map(team => (
            <GlassCard key={team.id} className={`p-4 shrink-0 w-[240px] lg:w-full snap-start border transition-colors cursor-pointer ${current.id === team.id ? 'border-primary/50 bg-white/[0.05]' : 'border-white/10 hover:border-white/20'}`} onClick={() => openModal(team)}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary font-bold border border-white/10 shadow-lg shrink-0 text-sm">
                      {team.shortName || team.name.substring(0,3).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm leading-tight truncate">{team.name}</h4>
                    <span className="text-xs text-gray-400 font-mono tracking-wider">{team.shortName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }} className="p-1.5 text-gray-500 hover:text-danger rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Detail View */}
        {current.name !== undefined && (
          <GlassCard className="w-full lg:w-2/3 p-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Detalle del Equipo</h3>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {current.logo ? (
                    <img src={current.logo} alt={current.name} className="w-24 h-24 rounded-full object-cover border border-white/10 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-primary font-black border border-white/10 shadow-lg text-2xl">
                      {current.shortName || current.name?.substring(0,3).toUpperCase() || 'NEW'}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Avatar</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                     <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Nombre</label>
                     <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.name||''} onChange={e=>setCurrent({...current, name:e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Sigla</label>
                     <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors uppercase" value={current.shortName||''} onChange={e=>setCurrent({...current, shortName:e.target.value})} maxLength={3} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">URL Escudo</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={current.logo||''} onChange={e=>setCurrent({...current, logo:e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-black/20 border border-white/5 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4" /> Plantel / Roster</h4>
                  <button onClick={addPlayer} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded font-medium"><UserPlus className="w-3 h-3" /> Agregar Jugador</button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {players.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No hay jugadores registrados.</p>}
                  {players.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-transparent hover:border-white/10 transition-colors min-w-0">
                      <input type="number" placeholder="#" className="w-12 shrink-0 bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-white text-xs text-center outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={p.number||''} onChange={e=>updatePlayer(i, 'number', parseInt(e.target.value)||0)} />
                      <input type="text" placeholder="Nombre del jugador" className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={p.name||''} onChange={e=>updatePlayer(i, 'name', e.target.value)} />
                      <select className="w-24 shrink-0 bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-white text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={p.position||'Jugador'} onChange={e=>updatePlayer(i, 'position', e.target.value)}>
                        <option value="Portero">POR</option>
                        <option value="Defensa">DEF</option>
                        <option value="Medio">MED</option>
                        <option value="Delantero">DEL</option>
                        <option value="Jugador">JUG</option>
                      </select>
                      <button onClick={() => removePlayer(i)} className="p-1.5 text-gray-500 hover:text-danger hover:bg-danger/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 justify-end">
                <Button onClick={handleSave} variant="primary" className="px-8">Guardar Equipo</Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
