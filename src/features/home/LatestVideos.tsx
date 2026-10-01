import React, { useState, useEffect } from 'react';
import { Play, Video } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Link } from 'react-router-dom';
import { Video as VideoType } from '../../types';
import { getVideos } from '../../services/videosService';

export const LatestVideos: React.FC = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">Últimos Videos</h2>
      
      {videos.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <Video className="w-12 h-12 text-gray-500 opacity-50" />
          <p className="text-gray-400 font-medium">No hay videos publicados</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map(video => (
            <Link to={`/video/${video.id}`} key={video.id} className="block group">
              <GlassCard interactive className="p-2 cursor-pointer h-full">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  <img 
                    src={video.thumbnail || ''} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.6)]">
                      <Play className="w-5 h-5 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{video.date ? new Date(video.date).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
