import React, { useState } from 'react';
import { Trophy, Calendar, Shield, Film, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { AdminMatchesTab } from './AdminMatchesTab';
import { AdminTournamentsTab } from './AdminTournamentsTab';
import { AdminTeamsTab } from './AdminTeamsTab';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { AdminMediaTab } from './AdminMediaTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { seedSupabaseData } from '../../services/seedSupabase';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'matches'|'tournaments'|'media'|'teams'|'settings'>('matches');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedSupabaseData();
    setIsSeeding(false);
    if (result.success) {
      toast(result.message, 'success');
      window.location.reload();
    } else {
      toast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-150 max-w-full overflow-x-hidden mx-auto md:max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Panel de Control</h1>
          <p className="text-gray-400 text-sm mt-1">Conectado como <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{user?.email}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleSeed} variant="ghost" isLoading={isSeeding} className="border border-white/10 text-gray-400 hover:text-white hover:bg-white/5">Cargar datos de prueba</Button>
          <Button onClick={logout} variant="ghost" className="border border-danger/30 text-danger hover:bg-danger/10 hover:text-danger">Cerrar Sesión</Button>
        </div>
      </div>

      <AdminTabs 
        tabs={[
          { id: 'tournaments', label: 'Torneos', icon: Trophy },
          { id: 'matches', label: 'Partidos', icon: Calendar },
          { id: 'teams', label: 'Equipos', icon: Shield },
          { id: 'media', label: 'Media', icon: Film },
          { id: 'settings', label: 'Ajustes', icon: Settings }
        ]} 
        value={activeTab} 
        onChange={(v) => setActiveTab(v as any)} 
      />

      <GlassCard className="p-8 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent min-h-[500px]">
        {activeTab === 'matches' && <AdminMatchesTab />}
        {activeTab === 'tournaments' && <AdminTournamentsTab />}
        {activeTab === 'teams' && <AdminTeamsTab />}
        {activeTab === 'media' && <AdminMediaTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </GlassCard>
    </div>
  );
};
