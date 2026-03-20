import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, LogOut, ChevronRight, Info, Shield, Camera, Calendar, MapPin, Bell, Moon, Globe, Users, Award, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import InteractiveTutorial from '../components/InteractiveTutorial';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      category: 'App Guide',
      items: [
        { 
          icon: <BookOpen size={20} />, 
          label: 'Interactive Tutorial', 
          description: 'Learn how to use the app step by step',
          action: () => setShowTutorial(true),
          color: '#128C7E'
        },
        { 
          icon: <Info size={20} />, 
          label: 'About ESWaT', 
          description: 'Version 1.0.0 - Enugu Smart Waste Tracker',
          action: () => alert('ESWaT v1.0.0\nBuilt for 3MTT NextGen Challenge\n© 2026 Chibueze Igiligi'),
          color: '#075E54'
        },
      ]
    },
    {
      category: 'Your Account',
      items: [
        { 
          icon: <Users size={20} />, 
          label: 'Account Type', 
          description: user?.role === 'officer' ? 'ESWAMA Officer' : 'Resident User',
          action: () => {},
          color: '#128C7E'
        },
        { 
          icon: <Award size={20} />, 
          label: 'User ID', 
          description: user?.id || 'Not available',
          action: () => {},
          color: '#f97316'
        },
      ]
    },
    {
      category: 'Report Settings',
      items: [
        { 
          icon: <Camera size={20} />, 
          label: 'Photo Quality', 
          description: 'Images are compressed for faster upload',
          action: () => alert('Photos are automatically compressed to 70% quality for faster upload. Max size: 10MB'),
          color: '#a855f7'
        },
        { 
          icon: <Calendar size={20} />, 
          label: 'Daily Limit', 
          description: '1 report per day',
          action: () => alert('You can only submit one report per day to ensure data quality.'),
          color: '#eab308'
        },
        { 
          icon: <MapPin size={20} />, 
          label: 'Location Accuracy', 
          description: 'GPS priority, falls back to street names',
          action: () => alert('The app uses GPS coordinates first. If not available, it uses street names + landmarks.'),
          color: '#ef4444'
        },
      ]
    },
    {
      category: 'Preferences',
      items: [
        { 
          icon: <Bell size={20} />, 
          label: 'Notifications', 
          description: 'Toast notifications enabled',
          action: () => alert('Notifications are shown as popups for important actions.'),
          color: '#f97316'
        },
        { 
          icon: <Moon size={20} />, 
          label: 'Theme', 
          description: 'Light mode (Dark mode coming soon)',
          action: () => alert('Dark mode will be available in a future update.'),
          color: '#64748b'
        },
        { 
          icon: <Globe size={20} />, 
          label: 'Language', 
          description: 'English (Nigerian English)',
          action: () => alert('The app uses simple, clear English for all users.'),
          color: '#075E54'
        },
      ]
    },
    {
      category: 'Support',
      items: [
        { 
          icon: <Shield size={20} />, 
          label: 'Privacy Policy', 
          description: 'Your data is secure with Google Sheets',
          action: () => alert('All reports are stored securely in Google Sheets. Photos are saved to Google Drive with public access for viewing.'),
          color: '#128C7E'
        },
        { 
          icon: <Star size={20} />, 
          label: 'Rate the App', 
          description: 'Help us improve ESWaT',
          action: () => alert('Thank you! We appreciate your feedback.'),
          color: '#eab308'
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
      {/* Header */}
      <div style={{ 
        padding: '1.5rem 0',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '1rem'
      }}>
        <h1 style={{ 
          color: 'var(--primary)', 
          margin: 0, 
          fontSize: '1.75rem', 
          fontWeight: 800,
          letterSpacing: '-0.5px' 
        }}>
          Settings
        </h1>
        <p style={{ color: '#667781', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          Manage your ESWaT preferences
        </p>
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h3 style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: '#667781',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem 0.5rem'
            }}>
              {section.category}
            </h3>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              border: '1px solid #f1f5f9'
            }}>
              {section.items.map((item, itemIdx) => (
                <motion.div
                  key={itemIdx}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: itemIdx < section.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: item.action ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (item.action) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (item.action) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: `${item.color}10`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                        {item.label}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.action && <ChevronRight size={18} color="#94a3b8" />}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
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
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
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

        {/* App Version */}
        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.6rem', 
          color: '#94a3b8',
          marginTop: '2rem'
        }}>
          ESWaT v1.0.0 | Built for 3MTT NextGen Challenge
        </p>
      </div>

      {/* Interactive Tutorial Modal */}
      <InteractiveTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </motion.div>
  );
};

export default Settings;