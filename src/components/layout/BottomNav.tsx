import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, Film, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio', exact: true },
    { to: '/partidos', icon: Calendar, label: 'Partidos' },
    { to: '/torneos', icon: Trophy, label: 'Torneos' },
    { to: '/videoteca', icon: Film, label: 'Videos' },
  ];

  if (user) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
  } else {
    navItems.push({ to: '/login', icon: User, label: 'Ingresar' });
  }

  // Quitamos la condición de ocultar en admin para que siga apareciendo el pill si lo desean,
  // pero el prompt sugiere que debe estar en móviles.
  // if (isAdmin) { return null; }

  return (
    <div className="block md:hidden fixed left-1/2 -translate-x-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 w-[calc(100%-2rem)] max-w-md rounded-full glass px-2 py-2 flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
            
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-colors active:scale-[0.96] ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/55 hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-[10px] tracking-tight font-medium truncate max-w-full">{item.label}</span>
            </NavLink>
          );
        })}
    </div>
  );
};
