import React from 'react';
import { CheckCircle, X, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, reportId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 46, 22, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card"
            style={{
              padding: '2.5rem',
              maxWidth: '450px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              backgroundColor: 'white'
            }}
          >
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              style={{ marginBottom: '1.5rem', color: '#10b981' }}
            >
              <CheckCircle size={80} strokeWidth={2} />
            </motion.div>

            <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.5rem', lineHeight: 1.2 }}>
              Thank you for helping keep Enugu clean! 🇳🇬
            </h2>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Your report has been recorded. ESWAMA has been notified.
            </p>

            <div style={{ 
              backgroundColor: '#f0fdf4', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              border: '1px dashed #10b981'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Report ID
              </span>
              <div style={{ 
                fontFamily: 'monospace', 
                fontWeight: 800, 
                fontSize: '1.1rem', 
                color: 'var(--text-main)',
                marginTop: '0.25rem'
              }}>
                {reportId}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'white',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Close
              </button>
              
              {/* Only show View on Map button for officers */}
              {user?.role === 'officer' && (
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/map');
                  }}
                  style={{
                    flex: 1.5,
                    padding: '0.875rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(11, 94, 31, 0.2)'
                  }}
                >
                  <MapIcon size={18} /> View on Map
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;