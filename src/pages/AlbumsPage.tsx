import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Album } from '../types';
import { getAlbums } from '../services/videosService';
import { GlassCard } from '../components/ui/GlassCard';
import { Play } from 'lucide-react';

export const AlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    getAlbums().then(setAlbums);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-white">Álbumes Multimedia</h1>
      <p className="text-gray-400 text-lg">Explora nuestras colecciones exclusivas de videos, entrevistas y transmisiones guardadas.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {albums.map(album => (
          <Link key={album.id} to={`/album/${album.id}`} className="block group">
            <GlassCard interactive className="p-3 h-full overflow-hidden border border-white/10 group-hover:border-primary/50 flex flex-col">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: `url(${album.thumbnail || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80'})`}} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,255,136,0.6)] transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play fill="currentColor" className="w-6 h-6 ml-1" />
                  </div>
                </div>
              </div>
              <div className="px-2 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{album.title}</h2>
                <p className="text-gray-400 text-sm mt-1 mb-4 flex-1 line-clamp-2">{album.description}</p>
                <div className="text-xs text-gray-500 font-medium border-t border-white/10 pt-3">Publicado: {album.date}</div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
};
