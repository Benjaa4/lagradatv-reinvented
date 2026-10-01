import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <GlassCard className="p-8 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Verificando sesión...</p>
        </GlassCard>
      </div>
    );
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
