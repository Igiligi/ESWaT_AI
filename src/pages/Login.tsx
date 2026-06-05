import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { loginAsOfficer, loginAsResident } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'officer' | 'resident' | null>(null);
  const [error, setError] = useState('');

  const [officerId, setOfficerId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsOfficer(officerId)) {
      navigate('/dashboard');
    } else {
      setError('Invalid Officer ID');
    }
  };

  const handleResidentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsResident(username, password)) {
      navigate('/report');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        maxWidth: '420px', 
        margin: '4rem auto', 
        backgroundColor: 'var(--bg-card)', 
        padding: '2rem', 
        borderRadius: '24px', 
        boxShadow: 'var(--shadow-premium)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '1rem', 
          background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', 
          borderRadius: '20px', 
          marginBottom: '1rem' 
        }}>
          <Brain size={32} color="white" />
        </div>
        <h2 style={{ color: 'var(--ai-primary)', margin: 0, fontSize: '1.75rem' }}>ESWaT</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Every State Waste Tracker</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>🤖 AI-Powered Waste Management</p>
      </div>
      
      {!role && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', textAlign: 'center', color: 'var(--text-main)' }}>I am a:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => { setRole('officer'); setError(''); }}
              style={{ 
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', 
                color: 'white', 
                padding: '1rem', 
                borderRadius: '12px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Shield size={20} /> Waste Officer
            </button>
            <button 
              onClick={() => { setRole('resident'); setError(''); }}
              style={{ 
                background: 'transparent', 
                color: 'var(--ai-primary)', 
                border: '2px solid var(--ai-primary)', 
                padding: '1rem', 
                borderRadius: '12px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Users size={20} /> Citizen
            </button>
          </div>
        </motion.div>
      )}

      {role === 'officer' && (
        <motion.form 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleOfficerLogin} 
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <h4 style={{ color: 'var(--text-main)' }}>Officer Login</h4>
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="officerId" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Officer ID</label>
            <input 
              id="officerId"
              type="text" 
              value={officerId} 
              onChange={(e) => setOfficerId(e.target.value)} 
              placeholder="Enter Officer ID"
              style={{ 
                padding: '0.75rem', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
              required
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', 
              color: 'white', 
              padding: '0.875rem', 
              borderRadius: '10px', 
              marginTop: '1rem', 
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => { setRole(null); setError(''); }} 
            style={{ 
              background: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.875rem', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </motion.form>
      )}

      {role === 'resident' && (
        <motion.form 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleResidentLogin} 
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <h4 style={{ color: 'var(--text-main)' }}>Citizen Login</h4>
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="username" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Username</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter username"
              style={{ 
                padding: '0.75rem', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password"
              style={{ 
                padding: '0.75rem', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', 
              color: 'white', 
              padding: '0.875rem', 
              borderRadius: '10px', 
              marginTop: '1rem', 
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => { setRole(null); setError(''); }} 
            style={{ 
              background: 'none', 
              color: 'var(--text-muted)', 
              fontSize: '0.875rem', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </motion.form>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: 'rgba(59, 130, 246, 0.05)', 
        borderRadius: '10px', 
        fontSize: '0.7rem', 
        color: 'var(--text-muted)',
        textAlign: 'center',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <strong>Officer Access:</strong> ID: 123<br/>
        <strong>Citizen Access:</strong> Username: resident, Password: 123
      </div>
    </motion.div>
  );
};

export default Login;