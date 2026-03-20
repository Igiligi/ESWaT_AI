import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Map, BarChart, FileText, AlertTriangle, List, Plus, Search, MoreVertical, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Desktop Link Style
  const desktopLinkStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: isActive(path) ? '#ffffff' : 'rgba(255,255,255,0.7)',
    padding: '0.5rem 0.75rem',
    textDecoration: 'none',
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    borderBottom: isActive(path) ? '2px solid white' : '2px solid transparent'
  });

  return (
    <>
      {/* Top Brand Header (WhatsApp Style) */}
      <header style={{ 
        background: '#075E54', 
        color: 'white', 
        padding: '1rem 1.25rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
            <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.5px' }}>ESWaT</span>
            <span style={{ fontSize: '0.55rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginTop: '1px' }}>Enugu State Waste Tracker</span>
          </div>
          <div style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800, alignSelf: 'flex-start', marginTop: '4px' }}>
            {user.role === 'officer' ? 'OFFICER MODE' : 'RESIDENT MODE'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Search size={22} style={{ opacity: 0.9, cursor: 'pointer' }} className="desktop-only" />
          
          {/* Desktop Nav Items */}
          <nav className="desktop-nav" style={{ display: 'none', gap: '0.5rem' }}>
             {user.role === 'officer' && (
                <>
                  <Link to="/dashboard" style={desktopLinkStyle('/dashboard')}>DASHBOARD</Link>
                  <Link to="/map" style={desktopLinkStyle('/map')}>MAP</Link>
                  <Link to="/report" style={desktopLinkStyle('/report')}>REPORT</Link>
                  <Link to="/hotspots" style={desktopLinkStyle('/hotspots')}>HOTSPOTS</Link>
                  <Link to="/collection-log" style={desktopLinkStyle('/collection-log')}>LOGS</Link>
                </>
             )}
             {user.role === 'resident' && (
                <Link to="/report" style={desktopLinkStyle('/report')}>REPORT</Link>
             )}
          </nav>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
              <MoreVertical size={22} />
            </button>
            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                minWidth: '200px',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                padding: '0.5rem 0',
                zIndex: 1100,
                marginTop: '0.5rem',
                border: '1px solid #f1f5f9'
              }}>
                {/* Settings & Tutorial Button - NEW */}
                <button 
                  onClick={handleSettings}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '0.75rem 1rem', 
                    color: '#1f2937', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <HelpCircle size={18} color="#128C7E" /> Settings & Tutorial
                </button>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.25rem 0' }} />

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '0.75rem 1rem', 
                    color: '#ef4444', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (WhatsApp Style) */}
      <nav className="bottom-nav mobile-only">
        {user.role === 'officer' && (
          <>
            <BottomNavItem to="/dashboard" icon={<BarChart size={24} />} label="Stats" active={isActive('/dashboard')} />
            <BottomNavItem to="/map" icon={<Map size={24} />} label="Map" active={isActive('/map')} />
            <BottomNavItem to="/hotspots" icon={<AlertTriangle size={24} />} label="Hotspots" active={isActive('/hotspots')} />
            <BottomNavItem to="/collection-log" icon={<List size={24} />} label="Logs" active={isActive('/collection-log')} />
          </>
        )}
        {user.role === 'resident' && (
          <BottomNavItem to="/report" icon={<FileText size={24} />} label="Report" active={isActive('/report')} />
        )}
      </nav>

      {/* Floating Action Button (FAB) */}
      {location.pathname !== '/report' && (
        <button 
          onClick={() => navigate('/report')}
          className="fab pulse-wa mobile-only"
        >
          <Plus size={30} strokeWidth={3} />
        </button>
      )}

      <style>{`
        .mobile-only { display: flex; }
        .desktop-only { display: none; }
        
        @media (min-width: 1024px) {
          .mobile-only { display: none !important; }
          .desktop-only { display: block !important; }
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
};

const BottomNavItem = ({ to, icon, label, active }: any) => (
  <Link to={to} className={`bottom-nav-item ${active ? 'active' : ''}`}>
    <div style={{ 
      padding: '2px 16px', 
      borderRadius: '16px', 
      backgroundColor: active ? 'rgba(7, 94, 84, 0.1)' : 'transparent',
      transition: 'all 0.2s'
    }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.65rem' }}>{label}</span>
  </Link>
);

export default Header;