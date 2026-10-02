import { supabase } from './supabase';
import { Video, Album } from '../types';

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase.from('videos').select('*');
  if (error) throw error;
  return data;
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
  if (error) return undefined;
  return data;
}

export async function getVideosByAlbum(albumId: string): Promise<Video[]> {
  const { data, error } = await supabase.from('videos').select('*').eq('album_id', albumId);
  if (error) throw error;
  return data;
}

const normalizeVideoType = (rawType?: string): 'live' | 'recording' => {
  if (!rawType) return 'recording';
  const lower = rawType.toLowerCase().trim();
  if (lower === 'live' || lower.includes('vivo') || lower.includes('directo')) return 'live';
  return 'recording';
};

const sanitizeVideoPayload = (video: Partial<Video>) => {
  const payload: any = {
    title: video.title?.trim() || 'Sin título',
    url: video.url?.trim() || '',
    thumbnail: video.thumbnail?.trim() || '',
    type: normalizeVideoType(video.type),
    date: video.date || new Date().toISOString().split('T')[0],
    views: typeof video.views === 'number' ? video.views : 0,
    album_id: video.album_id && video.album_id.trim() !== '' ? video.album_id : null,
  };
  return payload;
};

export async function createVideo(video: Partial<Video>): Promise<void> {
  const videoId = video.id || crypto.randomUUID();
  const payload = sanitizeVideoPayload(video);
  payload.id = videoId;
  
  const { error } = await supabase.from('videos').insert([payload]);
  if (error) {
    console.error('Detalle Error Supabase (videos):', JSON.stringify(error, null, 2));
    delete payload.views;
    if (!payload.album_id) delete payload.album_id;
    const { error: retryError } = await supabase.from('videos').insert([payload]);
    if (retryError) throw retryError;
  }
  
  if (video.match_id && video.match_id.trim() !== '') {
    await supabase.from('matches').update({ stream_url: payload.url }).eq('id', video.match_id);
  }
}

export async function updateVideo(id: string, video: Partial<Video>): Promise<void> {
  const payload = sanitizeVideoPayload(video);
  
  const { error } = await supabase.from('videos').update(payload).eq('id', id);
  if (error) {
    console.error('Detalle Error Supabase (videos update):', JSON.stringify(error, null, 2));
    delete payload.views;
    if (!payload.album_id) delete payload.album_id;
    const { error: retryError } = await supabase.from('videos').update(payload).eq('id', id);
    if (retryError) throw retryError;
  }

  if (video.match_id && video.match_id.trim() !== '') {
    await supabase.from('matches').update({ stream_url: payload.url }).eq('id', video.match_id);
  }
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

const sanitizeAlbumPayload = (album: Partial<Album>) => {
  const payload: any = {
    title: album.title?.trim() || 'Sin título',
    thumbnail: album.thumbnail?.trim() || '',
    date: album.date || new Date().toISOString().split('T')[0],
    description: album.description || ''
  };
  return payload;
};

// Albums
export async function getAlbums(): Promise<Album[]> {
  const { data, error } = await supabase.from('albums').select('*');
  if (error) throw error;
  return data;
}

export async function getAlbumById(id: string): Promise<Album | undefined> {
  const { data, error } = await supabase.from('albums').select('*').eq('id', id).single();
  if (error) return undefined;
  return data;
}

export async function createAlbum(album: Partial<Album>): Promise<void> {
  const albumId = album.id || crypto.randomUUID();
  const payload = sanitizeAlbumPayload(album);
  payload.id = albumId;
  const { error } = await supabase.from('albums').insert([payload]);
  if (error) {
    console.error('Detalle Error Supabase (albums):', JSON.stringify(error, null, 2));
    delete payload.description;
    const { error: retryError } = await supabase.from('albums').insert([payload]);
    if (retryError) throw retryError;
  }
}

export async function updateAlbum(id: string, album: Partial<Album>): Promise<void> {
  const payload = sanitizeAlbumPayload(album);
  const { error } = await supabase.from('albums').update(payload).eq('id', id);
  if (error) {
    console.error('Detalle Error Supabase (albums update):', JSON.stringify(error, null, 2));
    delete payload.description;
    const { error: retryError } = await supabase.from('albums').update(payload).eq('id', id);
    if (retryError) throw retryError;
  }
}

export async function deleteAlbum(id: string): Promise<void> {
  const { error } = await supabase.from('albums').delete().eq('id', id);
  if (error) throw error;
}
