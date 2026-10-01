import React from 'react';
import { FloatingNavbar } from './FloatingNavbar';
import { BottomNav } from './BottomNav';
import { useSettings } from '../../context/SettingsContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { settings } = useSettings();
  
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30 selection:text-white relative bg-[#090a0f] max-w-full overflow-x-hidden" style={{ '--nav-h': '5rem' } as React.CSSProperties}>
      {/* Mesh Gradients Dinámicos */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <FloatingNavbar />
      
      <main className="flex-1 pt-24 md:pt-32 pb-28 md:pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="mt-auto py-8 px-6 border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings?.hero_title || 'La Grada TV'}. Todos los derechos reservados.
            </p>
            {settings?.brand_slogan && (
              <p className="text-xs text-gray-400 italic">"{settings.brand_slogan}"</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-primary transition-colors">Políticas de Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
      <BottomNav />
      </div>
    </div>
  );
};
