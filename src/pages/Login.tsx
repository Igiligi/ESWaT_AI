import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { loginAsOfficer, loginAsResident } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'officer' | 'resident' | null>(null);
  const [error, setError] = useState('');

  // Officer Form
  const [officerId, setOfficerId] = useState('');

  // Resident Form
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
    <div style={{ maxWidth: '400px', margin: '4rem auto', backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>ESWaT Login</h2>
      
      {!role && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>I am a:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => { setRole('officer'); setError(''); }}
              style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '4px', fontWeight: 'bold' }}
            >
              ESWAMA Officer
            </button>
            <button 
              onClick={() => { setRole('resident'); setError(''); }}
              style={{ backgroundColor: 'white', color: 'var(--primary)', border: '2px solid var(--primary)', padding: '1rem', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Resident
            </button>
          </div>
        </div>
      )}

      {role === 'officer' && (
        <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4>Officer Login</h4>
          {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="officerId" style={{ fontSize: '0.875rem' }}>Officer ID</label>
            <input 
              id="officerId"
              type="text" 
              value={officerId} 
              onChange={(e) => setOfficerId(e.target.value)} 
              placeholder="e.g. ESW-001"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              required
            />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '4px', marginTop: '1rem', fontWeight: 'bold' }}>
            Login
          </button>
          <button type="button" onClick={() => { setRole(null); setError(''); }} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Back
          </button>
        </form>
      )}

      {role === 'resident' && (
        <form onSubmit={handleResidentLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4>Resident Login</h4>
          {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="username" style={{ fontSize: '0.875rem' }}>Username</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem' }}>Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              required
            />
          </div>

          <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '4px', marginTop: '1rem', fontWeight: 'bold' }}>
            Login
          </button>
          <button type="button" onClick={() => { setRole(null); setError(''); }} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'underline' }}>
             Back
          </button>
        </form>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <strong>Officer Access:</strong> ESW-001 to ESW-010<br/>
        <strong>Resident Access:</strong> citizen / 123456 OR enugu_res01-10 / password01-10
      </div>
    </div>
  );
};

export default Login;
