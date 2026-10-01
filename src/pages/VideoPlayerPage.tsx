import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Video } from '../types';
import { getVideos } from '../services/videosService';
import { getEmbedUrl } from '../utils/videoUtils';
import { GlassCard } from '../components/ui/GlassCard';
import { MatchStatusBadge } from '../components/ui/MatchStatusBadge';
import { VideoCardSkeleton } from '../components/ui/Skeleton';

export const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    getVideos().then(v => {
      const found = v.find(vid => vid.id === id);
      if(found) setVideo(found);
    });
  }, [id]);

  if (!video) return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-700 pt-8">
      <VideoCardSkeleton />
    </div>
  );

  const embedUrl = getEmbedUrl(video.url);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-700">
      {/* Cinema Ambilight Container */}
      <div className="relative aspect-video w-full rounded-3xl mt-8">
        {/* Glow effect */}
        <div className="absolute inset-[-20px] bg-primary/20 blur-[60px] rounded-[30px] opacity-70 animate-pulse pointer-events-none" />
        <div className="absolute inset-0 bg-black rounded-3xl overflow-hidden border border-white/10 z-10 shadow-2xl">
          <iframe 
            src={embedUrl || ''} 
            className="w-full h-full" 
            allowFullScreen 
          />
        </div>
      </div>

      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="mb-3">
              <MatchStatusBadge status={video.type === 'live' ? 'live' : 'played'} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{video.title}</h1>
            <p className="text-sm text-gray-400">{video.views.toLocaleString()} reproducciones • Publicado: {video.date}</p>
          </div>
          <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all shadow-sm">
            Compartir Video
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
