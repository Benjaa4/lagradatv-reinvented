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

export async function createVideo(video: Partial<Video>): Promise<void> {
  const { error } = await supabase.from('videos').insert([video]);
  if (error) throw error;
}

export async function updateVideo(id: string, video: Partial<Video>): Promise<void> {
  const { error } = await supabase.from('videos').update(video).eq('id', id);
  if (error) throw error;
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

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
  const { error } = await supabase.from('albums').insert([album]);
  if (error) throw error;
}

export async function updateAlbum(id: string, album: Partial<Album>): Promise<void> {
  const { error } = await supabase.from('albums').update(album).eq('id', id);
  if (error) throw error;
}

export async function deleteAlbum(id: string): Promise<void> {
  const { error } = await supabase.from('albums').delete().eq('id', id);
  if (error) throw error;
}
