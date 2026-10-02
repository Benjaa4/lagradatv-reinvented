import React from 'react';
import { Search, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getTournaments } from '../../services/tournamentsService';
import { getTeams } from '../../services/teamsService';
import { getMatches } from '../../services/matchesService';
import { getAlbums, getVideos } from '../../services/videosService';


export const FloatingNavbar: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Partidos', href: '/partidos' },
    { name: 'Torneos', href: '/torneos' },
    { name: 'Álbumes', href: '/albumes' },
  ];

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{type:string, label:string, href:string}[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
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
      
      tData.forEach(t => {
        if (t.name.toLowerCase().includes(lowerQ)) results.push({ type: 'Torneo', label: t.name, href: `/torneo/${t.id}` });
      });
      teamData.forEach(t => {
        if (t.name.toLowerCase().includes(lowerQ)) results.push({ type: 'Equipo', label: t.name, href: `/equipo/${t.id}` });
      });
      mData.forEach(m => {
        const ht = teamData.find(t=>t.id===m.home_team_id)?.name || 'Local';
        const at = teamData.find(t=>t.id===m.away_team_id)?.name || 'Visita';
        const name = `${ht} vs ${at}`;
        if (name.toLowerCase().includes(lowerQ) || (m.title && m.title.toLowerCase().includes(lowerQ))) {
          results.push({ type: 'Partido', label: name, href: `/partido/${m.id}` });
        }
      });
      aData.forEach(a => {
        if (a.title.toLowerCase().includes(lowerQ)) results.push({ type: 'Álbum', label: a.title, href: `/album/${a.id}` });
      });
      vData.forEach(v => {
        if (v.title.toLowerCase().includes(lowerQ)) results.push({ type: 'Video', label: v.title, href: `/video/${v.id}` }); // assuming video route or album
      });
      
      setSearchResults(results.slice(0, 10)); // max 10
    };
    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <nav className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
      <div className="relative rounded-full glass">
        {/* Top Shine */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto hover:opacity-80 transition-opacity">
            {settings?.brand_logo ? (
              <img src={settings.brand_logo} alt="Logo" className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[#009955] flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                LG
              </div>
            )}
            <span className="font-bold text-white tracking-wide hidden sm:block">
              {settings?.hero_title || 'LA GRADA'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </div>

          {/* Actions (Solo Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center bg-black/50 border border-white/5 rounded-full px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-colors shadow-inner">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent border-none outline-none text-sm text-white ml-2 w-24 focus:w-48 transition-all duration-300 placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="p-1 hover:bg-white/10 rounded-full transition-colors ml-1">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              
              {isSearchOpen && (searchQuery.trim().length > 0) && (
                <div className="absolute top-full mt-2 right-0 w-72 max-h-96 overflow-y-auto glass border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">Sin resultados</div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {searchResults.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => { navigate(res.href); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="flex flex-col text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                        >
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">{res.type}</span>
                          <span className="text-sm font-medium line-clamp-1">{res.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link to={user ? "/admin" : "/login"} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors shadow-sm block relative">
              <User className="w-4 h-4" />
              {user && <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />}
            </Link>
          </div>
        </div>
      </div>

    </nav>
  );
};
