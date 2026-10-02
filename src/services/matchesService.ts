import { supabase } from './supabase';
import { Match } from '../types';

export async function getMatches(filters?: { tournament_id?: string; status?: string; is_featured?: boolean }): Promise<Match[]> {
  let query = supabase.from('matches').select('*').order('date', { ascending: false });
  if (filters?.tournament_id) query = query.eq('tournament_id', filters.tournament_id);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.is_featured !== undefined) query = query.eq('is_featured', filters.is_featured);
  
  const { data, error } = await query;
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    return undefined;
  }
  return data;
}

const sanitizeMatchPayload = (match: Partial<Match>) => {
  const payload = { ...match };
  
  if (payload.title && !payload.description) payload.description = payload.title;
  delete payload.title;

  if (!payload.tournament_id || payload.tournament_id === "") payload.tournament_id = undefined; // wait, needs to be null for Supabase uuid? Supabase accepts null for nullable uuid.
  // wait, if I assign undefined, it won't send it. Better to send null so it clears it.
  if (!payload.tournament_id || payload.tournament_id === "") (payload as any).tournament_id = null;

  if (!payload.home_team_id || payload.home_team_id === "") payload.home_team_id = 'TBD';
  if (!payload.away_team_id || payload.away_team_id === "") payload.away_team_id = 'TBD';

  payload.home_score = Number(payload.home_score) || 0;
  payload.away_score = Number(payload.away_score) || 0;

  if (payload.has_penalties === false) {
    (payload as any).home_penalties = null;
    (payload as any).away_penalties = null;
  }

  if (typeof payload.lineups === 'string') {
    try {
      payload.lineups = JSON.parse(payload.lineups);
    } catch {
      (payload as any).lineups = null;
    }
  } else if (!payload.lineups) {
    (payload as any).lineups = null;
  }

  delete (payload as any).id;
  delete (payload as any).created_at;

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

export async function createMatch(match: Partial<Match>): Promise<void> {
  const payload = sanitizeMatchPayload(match);
  const doInsert = async (currentPayload: any) => {
    const { error } = await supabase.from('matches').insert([currentPayload]);
    if (error) return await handleSupabaseError(error, async (p) => { const r = await supabase.from('matches').insert([p]); if(r.error) throw r.error; }, currentPayload);
  };
  await doInsert(payload);
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<void> {
  const cleanUpdates: Record<string, any> = {};
  if (updates.tournament_id !== undefined) cleanUpdates.tournament_id = updates.tournament_id || null;
  if (updates.home_team_id !== undefined) cleanUpdates.home_team_id = updates.home_team_id || 'TBD';
  if (updates.away_team_id !== undefined) cleanUpdates.away_team_id = updates.away_team_id || 'TBD';
  if (updates.date !== undefined) cleanUpdates.date = updates.date || '';
  if (updates.time !== undefined) cleanUpdates.time = updates.time || '';
  if (updates.location_id !== undefined) cleanUpdates.location_id = updates.location_id || null;
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  if (updates.current_minute !== undefined) cleanUpdates.current_minute = updates.current_minute || null;
  if (updates.home_score !== undefined) cleanUpdates.home_score = Number(updates.home_score) || 0;
  if (updates.away_score !== undefined) cleanUpdates.away_score = Number(updates.away_score) || 0;
  if (updates.has_penalties !== undefined) cleanUpdates.has_penalties = Boolean(updates.has_penalties);
  if (updates.home_penalties !== undefined) cleanUpdates.home_penalties = updates.home_penalties;
  if (updates.away_penalties !== undefined) cleanUpdates.away_penalties = updates.away_penalties;
  if (updates.stream_url !== undefined) cleanUpdates.stream_url = updates.stream_url || null;
  if (updates.video_id !== undefined) cleanUpdates.video_id = updates.video_id || null;
  if (updates.round !== undefined) cleanUpdates.round = updates.round;
  if (updates.match_order !== undefined) cleanUpdates.match_order = updates.match_order;
  if (updates.bracket_code !== undefined) cleanUpdates.bracket_code = updates.bracket_code;
  if (updates.winner_id !== undefined) cleanUpdates.winner_id = updates.winner_id || null;
  if (updates.description !== undefined) cleanUpdates.description = updates.description || null;
  if (updates.match_type !== undefined) cleanUpdates.match_type = updates.match_type;
  if (updates.is_featured !== undefined) cleanUpdates.is_featured = Boolean(updates.is_featured);
  if (updates.lineups !== undefined) {
    cleanUpdates.lineups = typeof updates.lineups === 'string'
      ? (updates.lineups.trim() ? JSON.parse(updates.lineups) : null)
      : updates.lineups;
  }

  const doUpdate = async (currentPayload: any) => {
    const { error } = await supabase.from('matches').update(currentPayload).eq('id', id);
    if (error) return await handleSupabaseError(error, async (p) => { const r = await supabase.from('matches').update(p).eq('id', id); if(r.error) throw r.error; }, currentPayload);
  };
  await doUpdate(cleanUpdates);
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) {
    console.error('Detalle Error Supabase:', JSON.stringify(error, null, 2));
    throw error;
  }
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
