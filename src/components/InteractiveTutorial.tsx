import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, HelpCircle, Camera, Map, BarChart3, LogOut, Calendar, Filter, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  target?: string; // Optional CSS selector to highlight
}

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Reset tutorial when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowWelcome(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resident steps (only report-related)
  const residentSteps: TutorialStep[] = [
    {
      id: 'welcome-resident',
      title: '👋 Welcome, Resident!',
      content: 'You can help keep Enugu clean by reporting waste sites. Let me show you how!',
      icon: <HelpCircle size={24} />
    },
    {
      id: 'report-form',
      title: '📝 Report Form',
      content: 'This is where you submit waste reports. All fields marked with * are required.',
      icon: <HelpCircle size={24} />
    },
    {
      id: 'photo-upload',
      title: '📸 Photo Upload',
      content: 'Take a clear photo of the waste site. The app will compress it automatically for faster upload.',
      icon: <Camera size={24} />
    },
    {
      id: 'photo-tips',
      title: '📷 Photo Tips',
      content: '• Make sure the waste is clearly visible\n• Include landmarks for easier location\n• Avoid blurry or dark photos\n• Max 10MB file size',
      icon: <Camera size={24} />
    },
    {
      id: 'daily-limit',
      title: '⏰ Daily Limit',
      content: 'You can only submit ONE report per day. This helps prevent spam and ensures quality data.',
      icon: <Calendar size={24} />
    },
    {
      id: 'after-submit',
      title: '✅ After Submission',
      content: 'You\'ll see a success message with your report ID. Officers will review and take action.',
      icon: <CheckCircle size={24} />
    },
    {
      id: 'logout',
      title: '🚪 Logout',
      content: 'Click the three dots (⋮) at the top right, then select "Logout" to exit.',
      icon: <LogOut size={24} />
    }
  ];

  // Officer steps (full access)
  const officerSteps: TutorialStep[] = [
    {
      id: 'welcome-officer',
      title: '👋 Welcome, Officer!',
      content: 'You have full access to all monitoring features. Let\'s explore your dashboard.',
      icon: <HelpCircle size={24} />
    },
    {
      id: 'dashboard-stats',
      title: '📊 Dashboard Stats',
      content: '• Total Reports: All submissions\n• Overflowing: Urgent bins\n• Open Dumps: Areas without bins\n• Waste Bins: Proper bin locations',
      icon: <BarChart3 size={24} />
    },
    {
      id: 'charts',
      title: '📈 Data Visualizations',
      content: '• Site Distribution: Compares open dumps vs bins\n• Bin Status Overview: Shows waste levels\n• Top Districts: Areas with most reports',
      icon: <BarChart3 size={24} />
    },
    {
      id: 'map-basics',
      title: '🗺️ Map Navigation',
      content: '• 🔴 Red = Overflowing (urgent)\n• 🟠 Orange = 75% full\n• 🟡 Yellow = Half-full\n• 🟢 Green = Empty\n• 🟣 Purple = Open dump',
      icon: <Map size={24} />
    },
    {
      id: 'map-filters',
      title: '🎯 Map Filters',
      content: 'Use the dropdowns to filter by:\n• Status (Overflowing, 75%, etc.)\n• Category (Bins vs Dumps)\n• Location (Search area)',
      icon: <Filter size={24} />
    },
    {
      id: 'map-mark-collected',
      title: '✅ Mark Collected',
      content: 'Click any pin → Click "MARK COLLECTED" in the popup to update status. The pin will disappear from active view.',
      icon: <CheckCircle size={24} />
    },
    {
      id: 'hotspots',
      title: '🔥 Hotspots',
      content: 'Shows top 5 areas with most overflowing reports. Red background = urgent action needed.',
      icon: <HelpCircle size={24} />
    },
    {
      id: 'collection-log',
      title: '📋 Collection Log',
      content: 'Lists all pending sites. Check boxes to mark as collected and remove from active list.',
      icon: <CheckCircle size={24} />
    },
    {
      id: 'report-form-officer',
      title: '📝 Report Form',
      content: 'Same form as residents. You can also submit reports when you spot issues in the field.',
      icon: <HelpCircle size={24} />
    },
    {
      id: 'photo-upload-officer',
      title: '📸 Photo Upload',
      content: 'Take clear photos as evidence. Images are saved to Google Drive and linked to reports.',
      icon: <Upload size={24} />
    },
    {
      id: 'daily-limit-officer',
      title: '⏰ Daily Limit',
      content: 'Officers also have a daily limit of ONE report to maintain data quality.',
      icon: <Calendar size={24} />
    },
    {
      id: 'logout-officer',
      title: '🚪 Logout',
      content: 'Click the three dots (⋮) at the top right, then select "Logout" to exit.',
      icon: <LogOut size={24} />
    }
  ];

  const steps = user?.role === 'officer' ? officerSteps : residentSteps;
  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setShowWelcome(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowWelcome(false);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 46, 22, 0.8)',
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
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--primary)',
            padding: '1.5rem 1.5rem 1rem',
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
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {steps[currentStep].icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {steps[currentStep].title}
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', opacity: 0.8 }}>
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
            </div>
          </div>

          {/* Content - WhatsApp Style Chat Bubble */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f0f2f5' }}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '18px 18px 18px 4px',
                padding: '1.25rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                position: 'relative',
                maxWidth: '90%'
              }}
            >
              {/* WhatsApp-style arrow */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: 'white',
                transform: 'rotate(45deg)',
                boxShadow: '-2px 2px 2px rgba(0,0,0,0.02)'
              }} />
              
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#1e293b',
                whiteSpace: 'pre-line' // This preserves line breaks in content
              }}>
                {steps[currentStep].content}
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: currentStep === 0 ? '#f1f5f9' : 'white',
                color: currentStep === 0 ? '#94a3b8' : 'var(--text-main)',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i === currentStep ? 'var(--primary)' : '#e2e8f0',
                    transition: 'all 0.2s'
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
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Finish <CheckCircle size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
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