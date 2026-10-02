import React, { useState } from 'react';
import { LineupsData, TeamLineup, LineupPlayer } from '../../../types';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Button } from '../../../components/ui/Button';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface AdminLineupEditorProps {
  lineups: LineupsData;
  onChange: (lineups: LineupsData) => void;
  homeTeamName: string;
  awayTeamName: string;
}

export const AdminLineupEditor: React.FC<AdminLineupEditorProps> = ({ lineups, onChange, homeTeamName, awayTeamName }) => {
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');

  const getTeam = () => activeTeam === 'home' ? lineups.home : lineups.away;

  const updateTeam = (newTeam: TeamLineup) => {
    onChange({
      ...lineups,
      [activeTeam]: newTeam
    });
  };

  const addPlayer = (roleType: 'starting' | 'substitutes') => {
    const team = getTeam();
    const newPlayer: LineupPlayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Jugador',
      number: 0,
      role: 'Jugador',
      yellowCards: 0,
      redCards: 0,
      priorYellowCount: 0,
      goals: 0
    };
    updateTeam({
      ...team,
      [roleType]: [...(team[roleType] || []), newPlayer]
    });
  };

  const updatePlayer = (roleType: 'starting' | 'substitutes', id: string, updates: Partial<LineupPlayer>) => {
    const team = getTeam();
    updateTeam({
      ...team,
      [roleType]: team[roleType].map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const removePlayer = (roleType: 'starting' | 'substitutes', id: string) => {
    const team = getTeam();
    updateTeam({
      ...team,
      [roleType]: team[roleType].filter(p => p.id !== id)
    });
  };

  const movePlayer = (id: string, from: 'starting' | 'substitutes', to: 'starting' | 'substitutes') => {
    const team = getTeam();
    const player = team[from].find(p => p.id === id);
    if (!player) return;
    updateTeam({
      ...team,
      [from]: team[from].filter(p => p.id !== id),
      [to]: [...(team[to] || []), player]
    });
  };

  const renderPlayerRow = (p: LineupPlayer, type: 'starting' | 'substitutes') => (
    <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className="flex gap-2 items-center w-full sm:w-auto flex-1">
        <input 
          type="number" 
          className="w-12 bg-black/40 border border-white/10 rounded-lg px-1 py-2 text-center text-white text-sm outline-none focus:border-primary shrink-0" 
          value={p.number} 
          onChange={e => updatePlayer(type, p.id, { number: parseInt(e.target.value) || 0 })}
          placeholder="#"
        />
        <input 
          type="text" 
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary" 
          value={p.name || ''} 
          onChange={e => updatePlayer(type, p.id, { name: e.target.value })}
          placeholder="Nombre..."
        />
      </div>
      <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
        <div className="flex gap-4">
          <label className="flex flex-col items-center gap-1 cursor-pointer">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Capitán</span>
            <input type="checkbox" checked={!!p.isCaptain} onChange={e => updatePlayer(type, p.id, { isCaptain: e.target.checked })} className="accent-yellow-400" />
          </label>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Goles</span>
            <div className="flex items-center gap-1">
              <button onClick={() => updatePlayer(type, p.id, { goals: Math.max(0, (p.goals || 0) - 1) })} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-mono w-3 text-center">{p.goals || 0}</span>
              <button onClick={() => updatePlayer(type, p.id, { goals: (p.goals || 0) + 1 })} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Amarilla</span>
             <div className="flex items-center gap-1">
              <button onClick={() => updatePlayer(type, p.id, { yellowCards: Math.max(0, p.yellowCards - 1) })} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-mono w-3 text-center">{p.yellowCards}</span>
              <button onClick={() => updatePlayer(type, p.id, { yellowCards: p.yellowCards + 1 })} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Roja</span>
             <div className="flex items-center gap-1">
              <button onClick={() => updatePlayer(type, p.id, { redCards: Math.max(0, p.redCards - 1) })} className="text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
              <span className="text-xs font-mono w-3 text-center">{p.redCards}</span>
              <button onClick={() => updatePlayer(type, p.id, { redCards: p.redCards + 1 })} className="text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-center border-l border-white/10 pl-3">
          <Button variant="ghost" onClick={() => movePlayer(p.id, type, type === 'starting' ? 'substitutes' : 'starting')} className="text-xs h-8 px-2 whitespace-nowrap text-gray-400">
             Mover a {type === 'starting' ? 'Banca' : 'Titular'}
          </Button>
          <Button variant="ghost" onClick={() => removePlayer(type, p.id)} className="text-danger hover:bg-danger/10 h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl">
        <button onClick={() => setActiveTeam('home')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTeam === 'home' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{homeTeamName}</button>
        <button onClick={() => setActiveTeam('away')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTeam === 'away' ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{awayTeamName}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Formación</label>
          <CustomSelect 
            options={[
              {value:'',label:'Desconocida'},
              {value:'1-2-1',label:'1-2-1 (F5)'},
              {value:'2-2',label:'2-2 (F5)'},
              {value:'2-1-1',label:'2-1-1 (F5/F7)'},
              {value:'2-3-1',label:'2-3-1 (F7)'},
              {value:'3-2-1',label:'3-2-1 (F7)'},
              {value:'4-3-3',label:'4-3-3 (F11)'},
              {value:'4-4-2',label:'4-4-2 (F11)'},
              {value:'4-2-3-1',label:'4-2-3-1 (F11)'},
              {value:'3-5-2',label:'3-5-2 (F11)'}
            ]} 
            value={getTeam().formation || ''} 
            onChange={v => updateTeam({ ...getTeam(), formation: v })}
          />
        </div>
        <div>
           <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">DT / Entrenador</label>
           <input 
             type="text" 
             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-white text-sm outline-none focus:border-primary/50" 
             value={getTeam().coach || ''} 
             onChange={e => updateTeam({ ...getTeam(), coach: e.target.value })}
           />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-primary font-bold uppercase tracking-widest text-xs">Titulares</h4>
            <Button variant="glass" className="h-8 text-xs py-0" onClick={() => addPlayer('starting')}><Plus className="w-3 h-3 mr-1" /> Añadir</Button>
          </div>
          <div className="space-y-2 bg-black/20 p-2 sm:p-4 rounded-xl border border-white/5 min-h-[100px]">
            {getTeam().starting?.map(p => renderPlayerRow(p, 'starting'))}
            {(!getTeam().starting || getTeam().starting.length === 0) && <div className="text-center text-gray-500 text-sm py-4">Sin titulares registrados</div>}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white/60 font-bold uppercase tracking-widest text-xs">Suplentes</h4>
            <Button variant="glass" className="h-8 text-xs py-0" onClick={() => addPlayer('substitutes')}><Plus className="w-3 h-3 mr-1" /> Añadir</Button>
          </div>
          <div className="space-y-2 bg-black/20 p-2 sm:p-4 rounded-xl border border-white/5 min-h-[100px]">
            {getTeam().substitutes?.map(p => renderPlayerRow(p, 'substitutes'))}
            {(!getTeam().substitutes || getTeam().substitutes.length === 0) && <div className="text-center text-gray-500 text-sm py-4">Sin suplentes registrados</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
