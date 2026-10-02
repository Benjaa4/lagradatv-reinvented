import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Trophy, Film, Shield, User, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTournaments } from '../../services/tournamentsService';
import { getTeams } from '../../services/teamsService';
import { getMatches } from '../../services/matchesService';
import { getAlbums, getVideos } from '../../services/videosService';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio', exact: true },
    { to: '/partidos', icon: Calendar, label: 'Partidos' },
    { to: '/torneos', icon: Trophy, label: 'Torneos' },
    { to: '/albumes', icon: Film, label: 'Videos' },
  ];

  if (user) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
  } else {
    navItems.push({ to: '/login', icon: User, label: 'Ingresar' });
  }

  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{type:string, label:string, href:string}[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchSearch = async () => {
      const lowerQ = searchQuery.toLowerCase();
      const [tData, teamData, mData, aData, vData] = await Promise.all([
        getTournaments(), getTeams(), getMatches(), getAlbums(), getVideos()
      ]);
      const results: {type:string, label:string, href:string}[] = [];
      
      tData.forEach(t => { if (t.name.toLowerCase().includes(lowerQ)) results.push({ type: 'Torneo', label: t.name, href: `/torneo/${t.id}` }); });
      teamData.forEach(t => { if (t.name.toLowerCase().includes(lowerQ)) results.push({ type: 'Equipo', label: t.name, href: `/equipo/${t.id}` }); });
      mData.forEach(m => {
        const ht = teamData.find(t=>t.id===m.home_team_id)?.name || 'Local';
        const at = teamData.find(t=>t.id===m.away_team_id)?.name || 'Visita';
        const name = `${ht} vs ${at}`;
        if (name.toLowerCase().includes(lowerQ) || (m.title && m.title.toLowerCase().includes(lowerQ))) {
          results.push({ type: 'Partido', label: name, href: `/partido/${m.id}` });
        }
      });
      aData.forEach(a => { if (a.title.toLowerCase().includes(lowerQ)) results.push({ type: 'Álbum', label: a.title, href: `/album/${a.id}` }); });
      vData.forEach(v => { if (v.title.toLowerCase().includes(lowerQ)) results.push({ type: 'Video', label: v.title, href: `/video/${v.id}` }); });
      
      setSearchResults(results.slice(0, 10));
    };
    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <div className="flex md:hidden fixed left-1/2 -translate-x-1/2 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 rounded-full glass px-3 py-2 items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);
              
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.25)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} />
              </NavLink>
            );
          })}

          <button 
            onClick={() => setIsSearchOpen(true)}
            title="Buscar"
            aria-label="Buscar"
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
          >
            <Search size={20} />
          </button>
      </div>

      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="pt-[max(1rem,env(safe-area-inset-top))] px-4 pb-4">
            <div className="flex items-center gap-3 glass rounded-full p-2 mt-4 shadow-xl border border-white/10">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input 
                autoFocus
                type="text" 
                placeholder="Buscar torneos, equipos..." 
                className="bg-transparent border-none outline-none text-base text-white flex-1 min-w-0"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1 bg-white/5"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 max-h-[70vh] overflow-y-auto custom-scrollbar px-1 pb-20">
              {searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">Sin resultados</div>
              )}
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(res.href); setIsSearchOpen(false); setSearchQuery(''); }}
                  className="flex flex-col text-left px-4 py-3 rounded-2xl glass border border-white/5 hover:bg-white/10 transition-colors text-white"
                >
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{res.type}</span>
                  <span className="text-base font-medium">{res.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
