import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tournament } from '../types';
import { getTournaments } from '../services/tournamentsService';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';

export const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    getTournaments().then(setTournaments);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Todas las Competiciones</h1>
      <p className="text-gray-400 text-lg">Descubre las ligas y copas activas en la red de La Grada TV.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {tournaments.map(t => (
          <Link key={t.id} to={`/torneo/${t.id}`} className="block group">
            <GlassCard interactive className="h-64 overflow-hidden relative p-0 border border-white/10 group-hover:border-primary/50">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url(${t.image})`}} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                <div className="flex gap-2 mb-3">
                  <Badge variant="league">{t.type === 'league' ? 'Liga' : 'Eliminatoria'}</Badge>
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{t.name}</h2>
                <p className="text-gray-300 text-sm line-clamp-2 mt-1">{t.description}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
};
