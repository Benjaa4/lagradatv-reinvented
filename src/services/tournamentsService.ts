import { supabase } from './supabase';
import { Tournament, TeamStanding } from '../types';

export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(t => ({
    ...t,
    show_bracket: t.show_bracket ?? t.show_brackets ?? true,
    show_brackets: t.show_brackets ?? t.show_bracket ?? true,
  }));
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
  if (error) return undefined;
  
  if (data) {
    const standings = await getStandingsByTournament(id);
    return {
      ...data,
      show_bracket: data.show_bracket ?? data.show_brackets ?? true,
      show_brackets: data.show_brackets ?? data.show_bracket ?? true,
      standings
    };
  }
  return undefined;
}

export async function createTournament(tournament: Partial<Tournament>): Promise<void> {
  const payload = {
    name: tournament.name,
    type: tournament.type,
    season: tournament.season || '',
    description: tournament.description || '',
    image: tournament.image || '',
    match_type: tournament.match_type || 'f7',
    team_ids: tournament.team_ids || [],
    show_standings: tournament.show_standings ?? true,
    show_bracket: (tournament as any).show_bracket ?? tournament.show_brackets ?? true,
    show_brackets: tournament.show_brackets ?? (tournament as any).show_bracket ?? true,
    show_scorers: tournament.show_scorers ?? true,
    show_discipline: tournament.show_discipline ?? true,
  };
  const { error } = await supabase.from('tournaments').insert([payload]);
  if (error) throw error;
}

export async function updateTournament(id: string, tournament: Partial<Tournament>): Promise<void> {
  const payload = {
    name: tournament.name,
    type: tournament.type,
    season: tournament.season || '',
    description: tournament.description || '',
    image: tournament.image || '',
    match_type: tournament.match_type || 'f7',
    team_ids: tournament.team_ids || [],
    show_standings: tournament.show_standings ?? true,
    show_bracket: (tournament as any).show_bracket ?? tournament.show_brackets ?? true,
    show_brackets: tournament.show_brackets ?? (tournament as any).show_bracket ?? true,
    show_scorers: tournament.show_scorers ?? true,
    show_discipline: tournament.show_discipline ?? true,
  };
  const { error } = await supabase.from('tournaments').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) throw error;
}

// Standings
export async function getStandingsByTournament(tournamentId: string): Promise<TeamStanding[]> {
  const { data, error } = await supabase
    .from('team_standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function upsertStanding(standing: Partial<TeamStanding>): Promise<void> {
  const { error } = await supabase.from('team_standings').upsert(standing);
  if (error) throw error;
}

export async function updateStanding(id: string, updates: Partial<TeamStanding>): Promise<void> {
  const { error } = await supabase.from('team_standings').update(updates).eq('id', id);
  if (error) throw error;
}
