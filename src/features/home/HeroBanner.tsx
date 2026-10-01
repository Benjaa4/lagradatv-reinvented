import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { MatchStatusBadge } from '../../components/ui/MatchStatusBadge';
import { Button } from '../../components/ui/Button';
import { getMatches, subscribeToMatchUpdates } from '../../services/matchesService';
import { Match, GlobalTeam } from '../../types';
import { getTeams } from '../../services/teamsService';
import { getTournaments } from '../../services/tournamentsService';
import { useSettings } from '../../context/SettingsContext';

export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<GlobalTeam[]>([]);
  const [tournamentName, setTournamentName] = useState<string>('');
  
  useEffect(() => {
    const loadData = async () => {
      const [matches, allTeams, allTournaments] = await Promise.all([
        getMatches(),
        getTeams(),
        getTournaments()
      ]);
      setTeams(allTeams);
      
      let match: Match | undefined;

      if (settings?.prioritize_live) {
        match = matches.find(m => m.status === 'live');
      }
      
      if (!match && settings?.featured_match_id) {
        match = matches.find(m => m.id === settings.featured_match_id);
      }
      
      if (!match) {
        match = matches.find(m => m.is_featured);
      }

      if (match) {
        setFeaturedMatch(match);
        const tourney = allTournaments.find(t => t.id === match?.tournament_id);
        if (tourney) setTournamentName(tourney.name);
      } else {
        setFeaturedMatch(null);
      }
    };
    loadData();
  }, [settings]);

  useEffect(() => {
    if (!featuredMatch) return;
    const sub = subscribeToMatchUpdates((updated) => {
      if (updated.id === featuredMatch.id) {
        setFeaturedMatch(updated);
      }
    });
    return () => { sub.unsubscribe(); };
  }, [featuredMatch]);

  const homeTeam = teams.find(t => t.id === featuredMatch?.home_team_id);
  const awayTeam = teams.find(t => t.id === featuredMatch?.away_team_id);

  const title = settings?.hero_title || 'LA GRADA TV';
  const subtitle = settings?.hero_subtitle || 'Vive la emoción de tus torneos favoritos con estadísticas en tiempo real, transmisiones en vivo y el mejor análisis táctico.';
  const btnText = settings?.hero_button_text || 'Ver Partido Destacado';

  return (
    <section className="relative pt-8 pb-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="flex-1 space-y-8 z-10">
        <div className="animate-in slide-in-from-left duration-500 mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/25 px-2 py-0.5 text-[11px] font-mono tabular-nums text-primary">
          Nuevo Torneo Disponible
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white animate-in slide-in-from-bottom-4 duration-700 whitespace-pre-line">
          {title}
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-xl animate-in slide-in-from-bottom-6 duration-700 delay-150">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-4 pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
          {featuredMatch ? (
            <Button variant="primary" size="lg" onClick={() => navigate(`/partido/${featuredMatch.id}`)}>{btnText}</Button>
          ) : (
             <Button variant="primary" size="lg" onClick={() => navigate(`/partidos`)}>Ver Todos los Partidos</Button>
          )}
          <Button variant="glass" size="lg" onClick={() => navigate(`/torneos`)}>Explorar Torneos</Button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-1000 delay-300">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
        {featuredMatch && (
          <GlassCard interactive className="p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer" onClick={() => navigate(`/partido/${featuredMatch.id}`)}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-semibold text-gray-400">{tournamentName || 'Torneo'}</span>
              <MatchStatusBadge 
                status={featuredMatch.status} 
                time={featuredMatch.time} 
                minute={featuredMatch.current_minute} 
              />
            </div>
            <div className="flex justify-between items-center text-center gap-2">
              <div className="space-y-2 w-[40%] flex flex-col items-center">
                {homeTeam?.logo ? (
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover bg-white/5 border border-white/10 shrink-0" />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg md:text-xl shrink-0">{homeTeam?.shortName || featuredMatch.home_team_id.substring(0,3)}</div>
                )}
                <p className="font-bold text-xs md:text-base truncate min-w-0 w-full">{homeTeam?.name || featuredMatch.home_team_id}</p>
              </div>
              <div className="text-2xl md:text-4xl font-black text-primary drop-shadow-[0_0_15px_rgba(0,255,136,0.5)] shrink-0 px-2">
                {featuredMatch.status === 'scheduled' ? '- : -' : `${featuredMatch.home_score} - ${featuredMatch.away_score}`}
              </div>
              <div className="space-y-2 w-[40%] flex flex-col items-center">
                {awayTeam?.logo ? (
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover bg-white/5 border border-white/10 shrink-0" />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg md:text-xl shrink-0">{awayTeam?.shortName || featuredMatch.away_team_id.substring(0,3)}</div>
                )}
                <p className="font-bold text-xs md:text-base truncate min-w-0 w-full">{awayTeam?.name || featuredMatch.away_team_id}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </section>
  );
};
