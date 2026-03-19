import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import './index.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapDirectory from './pages/MapDirectory';
import ReportForm from './pages/ReportForm';
import Hotspots from './pages/Hotspots';
import CollectionLog from './pages/CollectionLog';

// Redirect Component based on auth role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'resident') return <Navigate to="/report" replace />;
  if (user.role === 'officer') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {user && <Header />}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            {/* Resident & Officer Routes */}
            <Route path="/report" element={<ProtectedRoute allowedRoles={['resident', 'officer']}><ReportForm /></ProtectedRoute>} />

            {/* Officer Only Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['officer']}><Dashboard /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute allowedRoles={['officer']}><MapDirectory /></ProtectedRoute>} />
            <Route path="/hotspots" element={<ProtectedRoute allowedRoles={['officer']}><Hotspots /></ProtectedRoute>} />
            <Route path="/collection-log" element={<ProtectedRoute allowedRoles={['officer']}><CollectionLog /></ProtectedRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
