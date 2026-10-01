import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { getTournaments } from '../../services/tournamentsService';
import { Tournament } from '../../types';
import { Trophy } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const FeaturedTournaments: React.FC = () => {
  const { settings } = useSettings();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    getTournaments().then(allTournaments => {
      if (settings?.featured_tournament_ids && settings.featured_tournament_ids.length > 0) {
        setTournaments(allTournaments.filter(t => settings.featured_tournament_ids!.includes(t.id)));
      } else {
        // Fallback to latest created or is_featured fallback
        const featured = allTournaments.filter(t => t.is_featured);
        if (featured.length > 0) setTournaments(featured);
        else setTournaments(allTournaments.slice(0, 4));
      }
    });
  }, [settings]);

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Competiciones</h2>
          <p className="text-gray-400 text-sm">Los torneos más competitivos del momento</p>
        </div>
        <Link to="/torneos" className="text-primary text-sm font-medium hover:underline hover:text-white transition-colors">
          Ver todas
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Trophy className="w-12 h-12 text-gray-500 opacity-50" />
          <p className="text-gray-400 font-medium">No hay torneos registrados</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map(tournament => (
            <Link to={`/torneo/${tournament.id}`} key={tournament.id} className="block group">
              <GlassCard interactive className="relative h-64 overflow-hidden p-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tournament.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 backdrop-blur-[2px]" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="league">{tournament.type}</Badge>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                      {tournament.match_type.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {tournament.name}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-1">
                    {tournament.description}
                  </p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
