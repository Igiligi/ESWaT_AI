import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Info, Shield, Camera, Calendar, MapPin, Bell, Moon, Globe, Users, Award, BookOpen, Star, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import InteractiveTutorial from '../components/InteractiveTutorial';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const menuItems = [
    {
      category: '🤖 AI Features',
      items: [
        { 
          icon: <BookOpen size={20} />, 
          label: 'Interactive Tutorial', 
          description: 'Learn how AI waste classification works',
          action: () => setShowTutorial(true),
          color: '#06B6D4'
        },
        { 
          icon: <Info size={20} />, 
          label: 'About ESWaT', 
          description: 'Version 2.0.0 - AI-Powered Waste Tracker',
          action: () => alert('ESWaT v2.0.0\n🤖 AI-Powered Waste Classification\n✅ 96% accuracy on waste identification\n📍 Real-time map tracking\n© 2026 TechCruch Group Golf Project'),
          color: '#3B82F6'
        },
      ]
    },
    {
      category: 'Your Account',
      items: [
        { 
          icon: <Users size={20} />, 
          label: 'Account Type', 
          description: user?.role === 'officer' ? 'Waste Officer' : 'Citizen User',
          action: undefined,
          color: '#10B981'
        },
        { 
          icon: <Award size={20} />, 
          label: 'User ID', 
          description: user?.id || 'Not available',
          action: undefined,
          color: '#F59E0B'
        },
      ]
    },
    {
      category: 'AI & Report Settings',
      items: [
        { 
          icon: <Camera size={20} />, 
          label: 'AI Image Analysis', 
          description: 'TensorFlow.js model with 96% accuracy',
          action: () => alert('🤖 AI Model: MobileNetV2\n📊 Validation Accuracy: 96.05%\n📦 Model Size: 14MB\n⚡ Runs directly in your browser'),
          color: '#06B6D4'
        },
        { 
          icon: <MapPin size={20} />, 
          label: 'Location Tracking', 
          description: 'Auto-capture GPS coordinates',
          action: () => alert('📍 GPS coordinates are automatically captured when you allow location access. You can also manually enter coordinates.'),
          color: '#3B82F6'
        },
      ]
    },
    {
      category: 'Preferences',
      items: [
        { 
          icon: isDarkMode ? <Sun size={20} /> : <Moon size={20} />, 
          label: 'Theme', 
          description: isDarkMode ? 'Dark mode (Switch to Light)' : 'Light mode (Switch to Dark)',
          action: toggleTheme,
          color: '#8B5CF6'
        },
        { 
          icon: <Bell size={20} />, 
          label: 'Notifications', 
          description: 'Toast notifications enabled',
          action: () => alert('Notifications are shown as popups for important actions like AI predictions and report submissions.'),
          color: '#F59E0B'
        },
        { 
          icon: <Globe size={20} />, 
          label: 'Language', 
          description: 'English (Nigeria)',
          action: () => alert('🌍 Language: English (Nigerian English). Multi-language support planned for future updates.'),
          color: '#10B981'
        },
      ]
    },
    {
      category: 'Support',
      items: [
        { 
          icon: <Shield size={20} />, 
          label: 'Privacy Policy', 
          description: 'Your data is secure',
          action: () => alert('🔒 All reports are stored securely. Photos are saved to Google Drive with restricted access. Location data is only used for waste tracking.'),
          color: '#3B82F6'
        },
        { 
          icon: <Star size={20} />, 
          label: 'Rate the App', 
          description: 'Help us improve ESWaT',
          action: () => alert('⭐ Thank you! Your feedback helps us make ESWaT better. Share your experience with the TechCrush community!'),
          color: '#F59E0B'
        },
      ]
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        paddingBottom: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
    >
      <div style={{ 
        padding: '1.5rem 0',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1rem'
      }}>
        <h1 style={{ 
          background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          margin: 0, 
          fontSize: '1.75rem', 
          fontWeight: 800,
          letterSpacing: '-0.5px' 
        }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          Manage your ESWaT preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h3 style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem 0.5rem'
            }}>
              {section.category}
            </h3>
            <div style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              border: '1px solid var(--border-color)'
            }}>
              {section.items.map((item, itemIdx) => (
                <motion.div
                  key={itemIdx}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: itemIdx < section.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                    cursor: item.action ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (item.action) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                  }}
                  onMouseLeave={(e) => {
                    if (item.action) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {item.label}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.action && <ChevronRight size={18} color="var(--text-muted)" />}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          <LogOut size={20} />
          Logout
        </motion.button>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.6rem', 
          color: 'var(--text-muted)',
          marginTop: '2rem'
        }}>
          ESWaT v2.0.0 | 🤖 AI-Powered | Built for TechCrush Group Golf Project
        </p>
      </div>

      <InteractiveTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </motion.div>
  );
};

export default Settings;