import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { TeamStanding } from '../../types';
import { getStandingsByTournament } from '../../services/tournamentsService';
import { Shield } from 'lucide-react';
import { getSettings } from '../../services/settingsService';

export const BracketPreview: React.FC = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [tournamentName] = useState('Liga / Torneo');

  useEffect(() => {
    // We can fetch standings of the featured tournament or just any tournament.
    // Let's get the featured tournament if possible, or just skip it for now and load empty
    // Actually we can get global settings to know featured_tournament_ids
    const load = async () => {
      const settings = await getSettings().catch(() => null);
      if (settings?.featured_tournament_ids?.length) {
        const tId = settings.featured_tournament_ids[0];
        const s = await getStandingsByTournament(tId);
        setStandings(s.slice(0, 5)); // top 5
      }
    };
    load();
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">Posiciones y Cuadros</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">{tournamentName}</h3>
            <span className="text-xs text-primary">Top 5</span>
          </div>
          
          {standings.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-8 h-8 text-gray-500 opacity-50 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay equipos creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b border-white/10">
                  <tr>
                    <th className="px-2 py-3 font-medium">Equipo</th>
                    <th className="px-2 py-3 font-medium text-center">PJ</th>
                    <th className="px-2 py-3 font-medium text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => (
                    <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-2 py-3 font-medium text-white flex items-center gap-2">
                        <span className={`w-5 text-center ${index === 0 ? 'text-primary' : 'text-gray-500'}`}>{index + 1}</span>
                        <span className="truncate max-w-[120px]">{team.name}</span>
                      </td>
                      <td className="px-2 py-3 text-center text-gray-400">{team.played}</td>
                      <td className="px-2 py-3 text-center font-bold text-white">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Visualización de bracket estilo abstracta */}
        <GlassCard className="p-6 lg:col-span-2 relative overflow-hidden flex flex-col justify-center items-center min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-danger/5" />
          
          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center transform rotate-45 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <div className="w-8 h-8 rounded-lg border-2 border-primary -rotate-45" />
            </div>
            <h3 className="text-xl font-bold text-white">Fase Eliminatoria Activa</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              Sigue el camino hacia el título de los torneos activos.
            </p>
            <Link to="/torneos" className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10 inline-block">
              Ver Cuadros
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};
