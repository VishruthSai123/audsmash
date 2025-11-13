import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Leaderboard from './pages/Leaderboard';
import Upload from './pages/Upload';
import Listen from './pages/Listen';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="app">
      <TopBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/listen" element={<Listen />} />
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
