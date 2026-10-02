import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { CustomSwitch } from '../../components/ui/CustomSwitch';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getSettings, saveSettings, AppSettings } from '../../services/settingsService';
import { getTournaments, updateTournament } from '../../services/tournamentsService';
import { getMatches, updateMatch } from '../../services/matchesService';
import { getTeams } from '../../services/teamsService';
import { Tournament, Match, Team } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Settings, Image, Monitor, Trophy } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { StandingsSkeleton } from '../../components/ui/Skeleton';
export const AdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [featuredMatchId, setFeaturedMatchId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { refreshSettings } = useSettings();

  useEffect(() => {
    Promise.all([getSettings(), getTournaments(), getMatches(), getTeams()]).then(([s, t, m, tData]) => {
      setSettings(s);
      setTournaments(t);
      setMatches(m);
      setTeams(tData);
      const featured = m.find(match => match.is_featured);
      if (featured) setFeaturedMatchId(featured.id);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSettings(settings);

      // Save featured match
      if (featuredMatchId) {
        const currentlyFeatured = matches.find(m => m.is_featured);
        if (currentlyFeatured && currentlyFeatured.id !== featuredMatchId) {
          await updateMatch(currentlyFeatured.id, { is_featured: false });
        }
        await updateMatch(featuredMatchId, { is_featured: true });
      }

      await refreshSettings();
      toast('Configuración guardada exitosamente', 'success');
    } catch (e: any) {
      console.error('Error al guardar configuración:', e?.message || e, e?.details);
      toast('Error al guardar configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTournamentFeatured = async (t: Tournament) => {
    try {
      const newValue = !t.is_featured;
      await updateTournament(t.id, { is_featured: newValue });
      setTournaments(tournaments.map(tour => tour.id === t.id ? { ...tour, is_featured: newValue } : tour));
      toast('Torneo actualizado', 'success');
    } catch (e) {
      toast('Error al actualizar torneo', 'error');
    }
  };

  if (loading || !settings) return (
    <div className="animate-in fade-in pt-8">
      <StandingsSkeleton />
    </div>
  );

  const matchOptions = [{ value: '', label: 'Ninguno' }, ...matches.map(m => {
    const ht = teams.find(t => t.id === m.home_team_id)?.name || m.home_team_id;
    const at = teams.find(t => t.id === m.away_team_id)?.name || m.away_team_id;
    return { value: m.id, label: `${ht} vs ${at} (${m.date})` };
  })];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Configuración Global</h2>
        <Button variant="primary" onClick={handleSave} isLoading={saving}>Guardar Cambios</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3"><Monitor className="w-5 h-5 text-primary" /> Hero Banner (Home)</h3>
          
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">Partido Destacado Principal</label>
            <CustomSelect options={matchOptions} value={featuredMatchId} onChange={v => setFeaturedMatchId(v)} placeholder="Seleccionar partido..." />
          </div>

          <CustomSwitch checked={settings.prioritize_live} onChange={c => setSettings({...settings, prioritize_live: c})} label="Priorizar automáticamente partidos en vivo" />

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Título del Hero</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={settings.hero_title ?? ''} onChange={e => setSettings({...settings, hero_title: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Subtítulo del Hero</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={settings.hero_subtitle ?? ''} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Texto del Botón</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={settings.hero_button_text ?? ''} onChange={e => setSettings({...settings, hero_button_text: e.target.value})} />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3"><Image className="w-5 h-5 text-primary" /> Identidad de Marca</h3>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">URL del Logo</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={settings.brand_logo ?? ''} onChange={e => setSettings({...settings, brand_logo: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Eslogan</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30" value={settings.brand_slogan ?? ''} onChange={e => setSettings({...settings, brand_slogan: e.target.value})} />
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3"><Trophy className="w-5 h-5 text-primary" /> Torneos Destacados en Home</h3>
            <p className="text-sm text-gray-400">Selecciona qué torneos quieres que aparezcan en la portada de la web.</p>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {tournaments.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => toggleTournamentFeatured(t)}>
                  <span className="text-sm text-white font-medium">{t.name}</span>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${t.is_featured ? 'bg-primary border-primary' : 'border-white/20'}`}>
                    {t.is_featured && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
