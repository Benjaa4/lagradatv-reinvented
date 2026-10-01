import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in text-center space-y-6">
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
      <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 relative z-10">404</h1>
    </div>
    <h2 className="text-3xl font-bold text-white">Página no encontrada</h2>
    <p className="text-gray-400 max-w-md text-lg">La jugada que intentas visualizar no existe o fue anulada por el VAR.</p>
    <Link to="/" className="pt-4 block">
      <Button variant="primary" size="lg">Volver al Inicio</Button>
    </Link>
  </div>
);
