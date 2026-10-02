import { supabase } from './supabase';
import { Tournament, TeamStanding } from '../types';

export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
  return (data || []).map(t => ({
    ...t,
    show_bracket: t.show_bracket ?? t.show_brackets ?? true,
    show_brackets: t.show_brackets ?? t.show_bracket ?? true,
  }));
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    return undefined;
  }
  
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
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
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
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Standings
export async function getStandingsByTournament(tournamentId: string): Promise<TeamStanding[]> {
  const { data, error } = await supabase
    .from('team_standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false });
    
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
}

const sanitizeStandingPayload = async (standing: Partial<TeamStanding>) => {
  let finalTeamId = standing.team_id;
  if (!finalTeamId && standing.name) {
    const { data: teamData } = await supabase.from('global_teams').select('id').eq('name', standing.name.trim()).maybeSingle();
    if (teamData?.id) finalTeamId = teamData.id;
  }
  
  const payload: Record<string, any> = {
    tournament_id: standing.tournament_id,
    team_id: finalTeamId || standing.id || crypto.randomUUID(),
    name: standing.name?.trim() || 'Equipo',
    played: Number(standing.played) || 0,
    won: Number(standing.won) || 0,
    drawn: Number(standing.drawn) || 0,
    lost: Number(standing.lost) || 0,
    goals_for: Number(standing.goals_for) || 0,
    goals_against: Number(standing.goals_against) || 0,
    points: (Number(standing.points) || 0) - (Number(standing.points_penalty) || 0),
    disqualified: Boolean(standing.disqualified),
  };

  if (standing.logo !== undefined) {
    payload.logo = standing.logo || '';
  }

  return payload;
};

const handleSupabaseError = async (error: any, retryOperation: (cleanedPayload: any) => Promise<any>, payload: any) => {
  console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
  if (error?.code === 'PGRST204') {
    const colMatch = error.message?.match(/column "([^"]+)" of relation/i) || error.message?.match(/column ([^\s]+) does not exist/i);
    if (colMatch && colMatch[1]) {
      const colName = colMatch[1];
      console.warn(`Removiendo columna inválida: ${colName}`);
      const cleanPayload = { ...payload };
      delete cleanPayload[colName];
      return await retryOperation(cleanPayload);
    }
  }
  throw error;
};

export async function upsertStanding(standing: Partial<TeamStanding>): Promise<void> {
  if (!standing.tournament_id || !standing.name) {
    throw new Error('tournament_id y name son obligatorios en team_standings');
  }

  const payload = await sanitizeStandingPayload(standing);

  const doUpdate = async (id: string, currentPayload: any) => {
    const { error } = await supabase.from('team_standings').update(currentPayload).eq('id', id);
    if (error) return await handleSupabaseError(error, async (p) => { const r = await supabase.from('team_standings').update(p).eq('id', id); if(r.error) throw r.error; }, currentPayload);
  };

  if (standing.id) {
    await doUpdate(standing.id, payload);
    return;
  }

  let query = supabase.from('team_standings').select('id').eq('tournament_id', standing.tournament_id);
  if (payload.team_id) {
    query = query.or(`team_id.eq.${payload.team_id},name.eq.${payload.name}`);
  } else {
    query = query.eq('name', payload.name);
  }
  const { data: existing, error: errSelect } = await query.maybeSingle();

  if (errSelect) {
    console.error('Detalle Error Supabase:', JSON.stringify(errSelect, null, 2));
  }

  if (existing?.id) {
    await doUpdate(existing.id, payload);
  } else {
    payload.id = crypto.randomUUID();
    const doInsert = async (currentPayload: any) => {
      const { error } = await supabase.from('team_standings').insert([currentPayload]);
      if (error) return await handleSupabaseError(error, async (p) => { const r = await supabase.from('team_standings').insert([p]); if(r.error) throw r.error; }, currentPayload);
    };
    await doInsert(payload);
  }
}

export async function updateStanding(id: string, updates: Partial<TeamStanding>): Promise<void> {
  const cleanUpdates: Record<string, any> = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.played !== undefined) cleanUpdates.played = Number(updates.played) || 0;
  if (updates.won !== undefined) cleanUpdates.won = Number(updates.won) || 0;
  if (updates.drawn !== undefined) cleanUpdates.drawn = Number(updates.drawn) || 0;
  if (updates.lost !== undefined) cleanUpdates.lost = Number(updates.lost) || 0;
  if (updates.goals_for !== undefined) cleanUpdates.goals_for = Number(updates.goals_for) || 0;
  if (updates.goals_against !== undefined) cleanUpdates.goals_against = Number(updates.goals_against) || 0;
  if (updates.points !== undefined) cleanUpdates.points = Number(updates.points) || 0;
  if (updates.disqualified !== undefined) cleanUpdates.disqualified = Boolean(updates.disqualified);
  if (updates.logo !== undefined) cleanUpdates.logo = updates.logo;

  const doUpdate = async (currentPayload: any) => {
    const { error } = await supabase.from('team_standings').update(currentPayload).eq('id', id);
    if (error) return await handleSupabaseError(error, async (p) => { const r = await supabase.from('team_standings').update(p).eq('id', id); if(r.error) throw r.error; }, currentPayload);
  };
  await doUpdate(cleanUpdates);
}
