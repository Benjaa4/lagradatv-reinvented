import React, { useState, useEffect } from 'react';
import { Album, Video, Match } from '../../types';
import { getAlbums, createAlbum, updateAlbum, deleteAlbum, getVideos, createVideo, updateVideo, deleteVideo } from '../../services/videosService';
import { getMatches } from '../../services/matchesService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { GlassModal } from '../../components/ui/GlassModal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Plus, Edit2, Trash2, Video as VideoIcon, Image as ImageIcon, Link as LinkIcon, Folder } from 'lucide-react';

export const AdminMediaTab: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAlbumModalOpen, setAlbumModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState<Partial<Album>>({});
  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({});

  const fetchAll = () => {
    getAlbums().then(setAlbums);
    getVideos().then(setVideos);
    getMatches().then(setMatches);
  };
  useEffect(() => { fetchAll(); }, []);

  const openAlbumModal = (a?: Album) => { setCurrentAlbum(a || { title: '', date: '' }); setAlbumModalOpen(true); };
  const openVideoModal = (v?: Video) => { setCurrentVideo(v || { title: '', date: new Date().toISOString().split('T')[0], type: 'Transmisión Completa', views: 0 }); setVideoModalOpen(true); };

  const saveAlbum = async () => { if (currentAlbum.id) await updateAlbum(currentAlbum.id, currentAlbum); else await createAlbum(currentAlbum as Album); setAlbumModalOpen(false); fetchAll(); };
  const saveVideo = async () => { if (currentVideo.id) await updateVideo(currentVideo.id, currentVideo); else await createVideo(currentVideo as Video); setVideoModalOpen(false); fetchAll(); };

  return (
    <div className="space-y-12 animate-in fade-in">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Folder className="w-6 h-6 text-primary" /> Álbumes y Colecciones</h2>
          <Button variant="primary" onClick={() => openAlbumModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Álbum
          </Button>
        </div>
        
        {albums.length === 0 && <p className="text-sm text-gray-500">No hay álbumes creados.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(a => {
            const albumVideos = videos.filter(v => v.album_id === a.id);
            return (
              <GlassCard key={a.id} className="p-0 overflow-hidden border border-white/10 hover:border-primary/30 transition-colors group">
                <div className="h-32 relative bg-black/50">
                  {a.thumbnail ? (
                    <img src={a.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={a.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5"><ImageIcon className="w-8 h-8 text-white/20" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-bold text-white leading-tight truncate text-lg">{a.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-primary font-medium">{albumVideos.length} videos</p>
                      <p className="text-[10px] text-gray-400">{a.date}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 flex justify-end gap-2 bg-white/5">
                  <button onClick={() => openAlbumModal(a)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { if(window.confirm('¿Borrar álbum?')){ deleteAlbum(a.id); fetchAll(); } }} className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><VideoIcon className="w-6 h-6 text-primary" /> Videoteca</h2>
          <Button variant="primary" onClick={() => openVideoModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Video
          </Button>
        </div>
        
        {videos.length === 0 && <p className="text-sm text-gray-500">No hay videos registrados.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map(v => {
            const albumName = albums.find(a => a.id === v.album_id)?.title;
            return (
              <GlassCard key={v.id} className="p-4 border border-white/10 flex flex-col hover:border-white/20 transition-colors">
                <div className="flex-1 mb-3">
                  <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1">{v.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {albumName && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded tracking-wider uppercase">{albumName}</span>}
                    <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded tracking-wider uppercase">{v.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50 mb-4 truncate bg-black/30 p-1.5 rounded w-full">
                  <LinkIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[200px] block" title={v.url}>{v.url}</span>
                </div>
                <div className="flex gap-2 mt-auto border-t border-white/5 pt-3">
                  <button onClick={() => openVideoModal(v)} className="flex-1 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" /> Editar</button>
                  <button onClick={() => { if(window.confirm('¿Borrar video?')){ deleteVideo(v.id); fetchAll(); } }} className="px-2.5 py-1.5 text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      <GlassModal isOpen={isAlbumModalOpen} onClose={() => setAlbumModalOpen(false)} title="Álbum">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Título del Álbum</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentAlbum.title||''} onChange={e=>setCurrentAlbum({...currentAlbum, title:e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">URL Portada / Miniatura</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentAlbum.thumbnail||''} onChange={e=>setCurrentAlbum({...currentAlbum, thumbnail:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Fecha</label>
               <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentAlbum.date||''} onChange={e=>setCurrentAlbum({...currentAlbum, date:e.target.value})} />
             </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Descripción (Opcional)</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors h-24 resize-none" value={currentAlbum.description||''} onChange={e=>setCurrentAlbum({...currentAlbum, description:e.target.value})} />
          </div>
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <Button onClick={saveAlbum} variant="primary" className="flex-1">Guardar Álbum</Button>
            <Button onClick={() => setAlbumModalOpen(false)} variant="glass" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={isVideoModalOpen} onClose={() => setVideoModalOpen(false)} title="Video">
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Título del Video</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentVideo.title||''} onChange={e=>setCurrentVideo({...currentVideo, title:e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">URL (YouTube / Twitch)</label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentVideo.url||''} onChange={e=>setCurrentVideo({...currentVideo, url:e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Clasificación</label>
               <CustomSelect options={[{value:'Transmisión Completa',label:'Transmisión Completa'}, {value:'Resumen',label:'Resumen'}, {value:'Mejores Jugadas',label:'Mejores Jugadas'}]} value={currentVideo.type||'Transmisión Completa'} onChange={v=>setCurrentVideo({...currentVideo, type:v})} />
             </div>
             <div>
               <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Fecha</label>
               <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors" value={currentVideo.date||''} onChange={e=>setCurrentVideo({...currentVideo, date:e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div>
               <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Vincular a un Partido (Opcional)</label>
               <CustomSelect options={[{value:'',label:'Ninguno'}, ...matches.map(m=>({value:m.id,label:`${m.home_team_id} vs ${m.away_team_id}`}))]} value={currentVideo.match_id||''} onChange={v=>setCurrentVideo({...currentVideo, match_id:v})} placeholder="Seleccionar partido..." />
             </div>
             <div>
               <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1 block">Asignar a Álbum (Opcional)</label>
               <CustomSelect options={[{value:'',label:'Ninguno'}, ...albums.map(a=>({value:a.id,label:a.title}))]} value={currentVideo.album_id||''} onChange={v=>setCurrentVideo({...currentVideo, album_id:v})} placeholder="Seleccionar..." />
             </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10 mt-2">
            <Button onClick={saveVideo} variant="primary" className="flex-1">Guardar Video</Button>
            <Button onClick={() => setVideoModalOpen(false)} variant="glass" className="flex-1">Cancelar</Button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
