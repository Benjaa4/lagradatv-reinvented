import { supabase } from './supabase';
import { Match } from '../types';

export async function getMatches(filters?: { tournament_id?: string; status?: string; is_featured?: boolean }): Promise<Match[]> {
  let query = supabase.from('matches').select('*').order('date', { ascending: false });
  if (filters?.tournament_id) query = query.eq('tournament_id', filters.tournament_id);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.is_featured !== undefined) query = query.eq('is_featured', filters.is_featured);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
  if (error) return undefined;
  return data;
}

export async function createMatch(match: Partial<Match>): Promise<void> {
  const { error } = await supabase.from('matches').insert([match]);
  if (error) throw error;
}

export async function updateMatch(id: string, match: Partial<Match>): Promise<void> {
  const { error } = await supabase.from('matches').update(match).eq('id', id);
  if (error) throw error;
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToMatchUpdates(callback: (payload: Match) => void) {
  const channel = supabase.channel('public:matches')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload: any) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        callback(payload.new as Match);
      }
    }).subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}
