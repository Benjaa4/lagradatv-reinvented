import React from 'react';
import { Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const FloatingNavbar: React.FC = () => {
  const { settings } = useSettings();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Partidos', href: '/partidos' },
    { name: 'Torneos', href: '/torneos' },
    { name: 'Álbumes', href: '/albumes' },
  ];

  return (
    <nav className="fixed top-2 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
      <div className="relative rounded-full glass">
        {/* Top Shine */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
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
          </div>

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
            <div className="flex items-center bg-black/50 border border-white/5 rounded-full px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-colors shadow-inner">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none text-sm text-white ml-2 w-24 focus:w-36 transition-all duration-300 placeholder:text-gray-500"
              />
            </div>
            
            <Link to="/login" className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors shadow-sm block">
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

    </nav>
  );
};
