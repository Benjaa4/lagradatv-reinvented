import { supabase } from './supabase';
import { GlobalTeam } from '../types';

// Helper to map DB row to TS interface
const mapToTeam = (row: any): GlobalTeam => {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name || row.shortName || '',
    logo: row.logo || '',
    description: row.description || '',
    is_global: row.is_global ?? true,
    players: row.roster || row.players || []
  };
};

export async function getTeams(): Promise<GlobalTeam[]> {
  const { data, error } = await supabase.from('global_teams').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapToTeam);
}

export async function createTeam(team: Partial<GlobalTeam>): Promise<GlobalTeam> {
  const payload = {
    name: team.name,
    short_name: team.shortName || (team as any).short_name || '',
    logo: team.logo || '',
    description: team.description || '',
    is_global: team.is_global ?? true,
    roster: team.players || (team as any).roster || [],
  };

  const { data, error } = await supabase.from('global_teams').insert([payload]).select().single();
  if (error) throw error;
  return mapToTeam(data);
}

export async function updateTeam(id: string, team: Partial<GlobalTeam>): Promise<void> {
  const payload: any = {};
  if (team.name !== undefined) payload.name = team.name;
  if (team.shortName !== undefined || (team as any).short_name !== undefined) {
    payload.short_name = team.shortName || (team as any).short_name || '';
  }
  if (team.logo !== undefined) payload.logo = team.logo;
  if (team.description !== undefined) payload.description = team.description;
  if (team.is_global !== undefined) payload.is_global = team.is_global;
  if (team.players !== undefined || (team as any).roster !== undefined) {
    payload.roster = team.players || (team as any).roster || [];
  }

  const { error } = await supabase.from('global_teams').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase.from('global_teams').delete().eq('id', id);
  if (error) throw error;
}
