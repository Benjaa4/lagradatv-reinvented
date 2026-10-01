import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/admin');
    } catch (err: any) {
      toast('Credenciales incorrectas o usuario no registrado', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-in fade-in zoom-in duration-500 px-4">
      <GlassCard className="w-full max-w-md p-8 md:p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 opacity-80" />
        <h2 className="text-3xl font-black text-white text-center mb-2">Acceso a La Grada</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Ingresa para administrar los torneos y transmisiones.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Correo Electrónico</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors shadow-inner" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Contraseña</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors shadow-inner" placeholder="••••••••" />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={loading} size="lg">Iniciar Sesión</Button>
        </form>
      </GlassCard>
    </div>
  );
};
