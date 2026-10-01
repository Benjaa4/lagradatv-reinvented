import React from 'react';
import { LineupPlayer } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';

export const DisciplinePanel: React.FC<{ players?: LineupPlayer[] }> = ({ players = [] }) => {
  const disciplinedPlayers = players.filter(p => p.yellowCards > 0 || p.redCards > 0);
  
  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-white mb-4">Registro Disciplinario</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-white/10 uppercase text-xs">
            <tr>
              <th className="pb-3 px-2 font-medium">Jugador</th>
              <th className="pb-3 px-2 text-center font-medium">Amarillas</th>
              <th className="pb-3 px-2 text-center font-medium">Rojas</th>
            </tr>
          </thead>
          <tbody>
            {disciplinedPlayers.length > 0 ? (
              disciplinedPlayers.map((p, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white font-medium truncate max-w-[200px]">{p.name || p.fullName}</td>
                  <td className="py-3 px-2 text-center text-yellow-500 font-bold bg-yellow-500/10">{p.yellowCards > 0 ? p.yellowCards : '-'}</td>
                  <td className="py-3 px-2 text-center text-red-500 font-bold bg-red-500/10">{p.redCards > 0 ? p.redCards : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500 italic">
                  No hay tarjetas registradas en este encuentro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
