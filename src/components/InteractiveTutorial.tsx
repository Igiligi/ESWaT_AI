import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Camera, Brain, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  tip?: string;
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome-ai',
      title: '🤖 Welcome to AI-Powered Waste Tracking!',
      content: 'ESWaT now uses Artificial Intelligence to automatically identify waste types from your photos. Let me show you how it works!',
      icon: <Sparkles size={24} />,
      tip: 'Powered by TensorFlow.js - 96% accuracy'
    },
    {
      id: 'take-photo',
      title: 'Step 1: Take a Clear Photo',
      content: 'Use your phone camera to take a clear, well-lit photo of the waste. For best results, place a single waste item on a plain background.',
      icon: <Camera size={24} />,
      tip: '📸 Tip: Single item photos work best!'
    },
    {
      id: 'ai-analysis',
      title: 'Step 2: AI Analyzes Your Photo',
      content: 'Our AI model instantly analyzes your photo and identifies the waste type - Plastic, Glass, Metal, Paper, Cardboard, or Trash - with 96% accuracy.',
      icon: <Brain size={24} />,
      tip: '🤖 The model runs directly in your browser. No server needed!'
    },
    {
      id: 'confidence-score',
      title: 'Step 3: Check the Confidence Score',
      content: 'The AI shows a confidence percentage (e.g., "Plastic - 94%"). Green = High confidence, Orange = Medium, Red = Low confidence.',
      icon: <CheckCircle size={24} />,
      tip: '📊 Green (80%+): Very reliable | Orange (50-80%): Good | Red (<50%): Try another photo'
    },
    {
      id: 'location-submit',
      title: 'Step 4: Confirm Location & Submit',
      content: 'Tap "Detect my location" to auto-capture GPS coordinates, fill in the address, review the AI prediction, and submit your report.',
      icon: <MapPin size={24} />,
      tip: '📍 Enable location services for automatic coordinate capture'
    },
    {
      id: 'complete',
      title: 'You\'re Ready to Make a Difference!',
      content: 'You now know how to use ESWaT\'s AI-powered waste reporting system. Every report helps keep your community clean!',
      icon: <Send size={24} />,
      tip: 'TechCrush Group Golf Project - AI Integration'
    }
  ];

  const steps = tutorialSteps;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '1rem'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            padding: '1.75rem 1.5rem 1.5rem',
            color: 'white',
            position: 'relative'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentStepData.icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                  {currentStepData.title}
                </h2>
              </div>
            </div>

            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: '#ffffff',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ fontSize: '0.65rem', margin: '0.5rem 0 0', opacity: 0.7, textAlign: 'right' }}>
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>

          <div style={{ padding: '1.75rem', backgroundColor: 'var(--bg-main)' }}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '20px 20px 20px 8px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}
            >
              <p style={{
                margin: 0,
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--text-main)'
              }}>
                {currentStepData.content}
              </p>
            </motion.div>

            {currentStepData.tip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  borderRadius: '12px',
                  borderLeft: `3px solid #06B6D4`
                }}
              >
                <p style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: '#06B6D4',
                  fontWeight: 500
                }}>
                  💡 {currentStepData.tip}
                </p>
              </motion.div>
            )}
          </div>

          <div style={{
            padding: '1rem 1.5rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-card)'
          }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '40px',
                border: '1px solid var(--border-color)',
                backgroundColor: currentStep === 0 ? 'transparent' : 'var(--bg-card)',
                color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-main)',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                opacity: currentStep === 0 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    width: i === currentStep ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: i === currentStep ? '#3B82F6' : 'var(--border-color)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            {currentStep === totalSteps - 1 ? (
              <button
                onClick={handleFinish}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '40px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started <CheckCircle size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '40px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InteractiveTutorial;