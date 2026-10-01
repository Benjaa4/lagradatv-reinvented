import { supabase } from './supabase';

export interface AppSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  prioritize_live: boolean; // mapped to auto_live in DB
  brand_logo: string;
  brand_slogan: string;
  featured_match_id?: string | null;
  featured_tournament_ids?: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
  hero_title: 'La Pasión del Fútbol Amateur',
  hero_subtitle: 'Sigue los torneos más emocionantes en vivo.',
  hero_button_text: 'Ver Partidos',
  prioritize_live: true,
  brand_logo: '/logo.png',
  brand_slogan: 'Tu Liga en Vivo',
  featured_match_id: null,
  featured_tournament_ids: []
};

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global_config').maybeSingle();
  if (error) {
    console.error('Error fetching settings:', error.message, error.details);
    return DEFAULT_SETTINGS;
  }
  if (!data) return DEFAULT_SETTINGS;
  
  return { 
    ...DEFAULT_SETTINGS, 
    ...data,
    prioritize_live: data.auto_live !== undefined ? data.auto_live : data.prioritize_live ?? DEFAULT_SETTINGS.prioritize_live
  };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const payload: any = {
    id: 'global_config',
    hero_title: settings.hero_title || '',
    hero_subtitle: settings.hero_subtitle || '',
    hero_button_text: settings.hero_button_text || '',
    brand_logo: settings.brand_logo || '',
    brand_slogan: settings.brand_slogan || '',
    auto_live: settings.prioritize_live ?? true,
    prioritize_live: settings.prioritize_live ?? true, // Send both just in case the DB was updated
    featured_tournament_ids: settings.featured_tournament_ids || [],
    featured_match_id: settings.featured_match_id === '' ? null : settings.featured_match_id,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('site_settings').upsert(payload);
  if (error) {
    console.error('Error saving settings:', error.message, error.details);
    throw error;
  }
}
