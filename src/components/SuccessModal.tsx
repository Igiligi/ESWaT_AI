import React from 'react';
import { CheckCircle, X, Map as MapIcon, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  aiPrediction?: { wasteType: string; confidence: number } | null;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, reportId, aiPrediction }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Waste type colors for display
  const wasteTypeColors: Record<string, string> = {
    'plastic': '#10B981',
    'glass': '#3B82F6',
    'metal': '#94A3B8',
    'paper': '#F59E0B',
    'cardboard': '#8B5CF6',
    'trash': '#EF4444'
  };
  
  const wasteColor = aiPrediction ? wasteTypeColors[aiPrediction.wasteType.toLowerCase()] || '#4F46E5' : '#4F46E5';

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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
              backgroundColor: 'var(--bg-card)'
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

            <h2 style={{ color: 'var(--ai-primary)', marginBottom: '0.75rem', fontSize: '1.5rem', lineHeight: 1.2 }}>
              Report Submitted Successfully!
            </h2>
            
            {/* AI Prediction Display - Only show if available */}
            {aiPrediction && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem',
                backgroundColor: `${wasteColor}20`,
                borderRadius: '12px',
                borderLeft: `4px solid ${wasteColor}`
              }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>
                  <Brain size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  AI Identified
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: wasteColor, textTransform: 'uppercase' }}>
                  {aiPrediction.wasteType}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {aiPrediction.confidence.toFixed(1)}% confidence
                </div>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Your waste report has been recorded. Authorities have been notified.
            </p>

            <div style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.05)', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '2rem',
              border: '1px dashed rgba(79, 70, 229, 0.3)'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#4F46E5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
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
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Close
              </button>
              
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
                    backgroundColor: 'var(--ai-primary)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
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