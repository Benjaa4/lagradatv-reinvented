import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { VideoPlayerPage } from './pages/VideoPlayerPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { MatchesPage } from './pages/MatchesPage';
import { AlbumsPage } from './pages/AlbumsPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTournamentDetailPage } from './pages/admin/AdminTournamentDetailPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/partidos" element={<MatchesPage />} />
                <Route path="/partido/:id" element={<MatchDetailPage />} />
                <Route path="/video/:id" element={<VideoPlayerPage />} />
                <Route path="/albumes" element={<AlbumsPage />} />
                <Route path="/album/:id" element={<AlbumDetailPage />} />
                <Route path="/torneos" element={<TournamentsPage />} />
                <Route path="/torneo/:id" element={<TournamentDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/torneo/:id" element={<AdminTournamentDetailPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
