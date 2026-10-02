import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Album, Video } from '../types';
import { getAlbumById, getVideos } from '../services/videosService';
import { GlassCard } from '../components/ui/GlassCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import { Play } from 'lucide-react';

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if(id) {
      getAlbumById(id).then(a => setAlbum(a || null));
      getVideos().then(v => setVideos(v.filter(vid => vid.album_id === id)));
    }
  }, [id]);

  if (!album) return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
      {/* Header */}
      <GlassCard className="relative overflow-hidden p-0 h-[300px] border border-white/10 shadow-2xl flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url(${album.thumbnail})`}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="relative z-10 p-8 w-full flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{album.title}</h1>
            <p className="text-gray-300 text-lg">{album.description}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold">{videos.length} Videos</p>
            <p className="text-sm text-gray-500">{album.date}</p>
          </div>
        </div>
      </GlassCard>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videos.map(video => (
          <Link to={`/video/${video.id}`} key={video.id} className="block group">
            <GlassCard interactive className="p-2 cursor-pointer h-full">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="px-2 pb-2">
                <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h4>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{video.views} vistas</span>
                  <span>{video.date}</span>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
};
