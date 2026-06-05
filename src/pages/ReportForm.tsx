import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import type { Report, BinStatus, BinType } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import { toast } from 'react-hot-toast';
import { FileText, MapPin, Camera, MessageSquare, Send, Layers, Loader2, User, Phone, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

const STATUSES: BinStatus[] = ['Empty', 'Half-full', '75% full', 'Overflowing'];

const TYPES: BinType[] = [
  'Waste Bin',
  'Open Dump'
];

// Image compression function
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 768;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const ReportForm = () => {
  const navigate = useNavigate();
  const { addReport, loading } = useData();
  const { user } = useAuth();

  // Form state
  const [yourName, setYourName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [street, setStreet] = useState('');
  const [gps, setGps] = useState('');
  const [status, setStatus] = useState<BinStatus | ''>('');
  const [volume, setVolume] = useState('');
  const [type, setType] = useState<BinType | ''>('');
  const [duration, setDuration] = useState('');
  const [comments, setComments] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Modal and submission state
  const [showModal, setShowModal] = useState(false);
  const [lastReportId, setLastReportId] = useState('');
  const [lastAIPrediction, setLastAIPrediction] = useState<{ wasteType: string; confidence: number } | null>(null);

  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI state
  const [aiModel, setAiModel] = useState<tf.GraphModel | null>(null);
  const [aiPredicting, setAiPredicting] = useState(false);   
  const [aiPrediction, setAiPrediction] = useState<{ wasteType: string; confidence: number } | null>(null);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const modelLoadAttempted = useRef(false);

  // Load AI model when component mounts
  useEffect(() => {
    if (modelLoadAttempted.current) return;
    modelLoadAttempted.current = true;

    const loadModel = async () => {
      try {
        console.log('Loading AI model from /tfjs_eswat_model/model.json...');
        const model = await tf.loadGraphModel('/tfjs_eswat_model/model.json');
        setAiModel(model);
        console.log('✅ AI model loaded successfully');
        
        // Warm up the model
        const dummyInput = tf.zeros([1, 224, 224, 3]);
        const warmupResult = model.predict(dummyInput) as tf.Tensor;
        await warmupResult.data();
        warmupResult.dispose();
        dummyInput.dispose();
        console.log('✅ Model warmed up');
      } catch (error: any) {
        console.error('Failed to load AI model:', error);
        setModelLoadError(error.message || 'Model failed to load');
      }
    };
    loadModel();
  }, []);

  // Function to classify waste type from image
  const classifyWasteImage = async (imageUrl: string) => {
    if (!aiModel) {
      console.warn('Model not loaded yet');
      return null;
    }
    
    setAiPredicting(true);
    
    try {
      const img = new Image();
      img.src = imageUrl;
      await img.decode();

      if (img.width === 0 || img.height === 0) {
        throw new Error('Invalid image dimensions');
      }
      
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(tf.scalar(127.5))
        .sub(tf.scalar(1))
        .expandDims(0);
      
      const predictions = await aiModel.predict(tensor) as tf.Tensor;
      const data = await predictions.data();
      const classNames = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash'];
      const maxIndex = data.indexOf(Math.max(...data));
      const confidence = data[maxIndex] * 100;
      
      const result = {
        wasteType: classNames[maxIndex],
        confidence: confidence
      };
      
      setAiPrediction(result);
      console.log('AI Prediction saved:', result);
      
      tensor.dispose();
      predictions.dispose();
      return result;
      
    } catch (error) {
      console.error('Prediction failed:', error);
      return null;
    } finally {
      setAiPredicting(false);
    }
  };

  const generateReportId = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#ESW-${dateStr}-${randomStr}`;
  };

  const resetForm = () => {
    setStreet('');
    setGps('');
    setStatus('');
    setComments('');
    setBase64Image(null);
    setPhotoName('');
    setWhatsapp('');
    setYourName('');
    setLocation('');
    setVolume('');
    setType('');
    setDuration('');
    setAiPrediction(null);
    setLatitude(null);
    setLongitude(null);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Please select an image under 10MB.');
      return;
    }

    setPhotoName(file.name);
    setIsCompressing(true);
    setAiPrediction(null);

    try {
      toast.loading('Compressing image...', { id: 'compress' });
      const compressed = await compressImage(file);
      setBase64Image(compressed);
      
      if (aiModel) {
        await classifyWasteImage(compressed);
      } else {
        // Wait for model to load
        const checkModel = setInterval(async () => {
          if (aiModel) {
            clearInterval(checkModel);
            await classifyWasteImage(compressed);
          }
        }, 100);
      }

      if (!latitude && !longitude) {
        getCurrentLocation();
      }

      toast.success('Image ready! AI analyzing...', { id: 'compress' });
    } catch (error) {
      console.error('Compression failed:', error);
      toast.error('Image compression failed. Please try another image.', { id: 'compress' });
    } finally {
      setIsCompressing(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGps(`${position.coords.latitude}, ${position.coords.longitude}`);
        setIsGettingLocation(false);
        toast.success('📍 Location captured automatically!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Could not get location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'Please enter coordinates manually.';
        }
        setLocationError(errorMsg);
        toast.error(errorMsg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!street.trim()) {
      toast.error('Street name is required');
      return;
    }

    if (!base64Image) {
      toast.error('Photo is required');
      return;
    }

    const reportId = generateReportId();

    // Store AI prediction data to be saved to Google Sheets
    const aiPredictionValue = aiPrediction?.wasteType || '';
    const aiConfidenceValue = aiPrediction?.confidence || 0;

    console.log('Submitting with AI Prediction:', aiPredictionValue);
    console.log('Submitting with AI Confidence:', aiConfidenceValue);

    const newReport: Report = {
      Timestamp: new Date().toISOString(),
      'Email Address': user?.email || '',
      'Your Name': yourName,
      Location: location,
      'Additional comments': comments,
      'Street Name or Landmark': street,
      'GPS Coordinates': gps,
      'What is the current bin status?': status as BinStatus,
      'Estimated waste volume': volume,
      'Bin type': type as BinType,
      'Upload a photo of the bin or dump area': '',
      'WhatsApp number': whatsapp,
      'How long has this site been used for dumping?': duration,
      id: reportId,
      base64Image: base64Image,
      latitude: latitude,
      longitude: longitude,
      // AI Prediction fields to be saved to Google Sheets
      'AI Prediction': aiPredictionValue,
      'AI Confidence': aiConfidenceValue,
      // Also store in alternative format for compatibility
      aiPrediction: aiPredictionValue,
      aiConfidence: aiConfidenceValue
    };

    toast.loading('Submitting report with AI analysis...', { id: 'submit' });

    const success = await addReport(newReport);

    if (success) {
      toast.success('Report submitted successfully!', { id: 'submit' });
      setLastReportId(reportId);
      setLastAIPrediction(aiPrediction);
      setShowModal(true);
      resetForm();
    } else {
      toast.error('Submission failed. Please try again.', { id: 'submit' });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color)',
    fontSize: '14px',
    width: '100%',
    transition: 'all 0.2s',
    outline: 'none',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem'
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', color: 'white', borderRadius: '14px', marginBottom: '1rem' }}>
            <FileText size={32} />
          </div>
          <h2 style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: 0, 
            fontSize: '1.75rem' 
          }}>
            Waste Disposal Report
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '0.2rem 0.5rem', borderRadius: '20px', display: 'inline-block', verticalAlign: 'middle' }}>
              🤖 Powered by AI
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>AI will identify waste type from your photo – automatically saved with your report</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}><User size={16} /> Your Name</label>
              <input value={yourName} onChange={e => setYourName(e.target.value)} type="text" placeholder="e.g. John Johnbosco" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><Phone size={16} /> WhatsApp Number</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="text" placeholder="e.g. 0803..." style={inputStyle} />
            </div>
          </div>

          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}><MapPin size={16} /> Street Name or Landmark *</label>
              <input required value={street} onChange={e => setStreet(e.target.value)} type="text" placeholder="e.g. Near Shoprite, Zik Avenue" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}><MapPin size={16} /> Location (City, State) *</label>
              <input required value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="e.g. Enugu, Enugu State" style={inputStyle} />
            </div>
          </div>

          {/* GPS Coordinates Section with FIXED button visibility */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}><MapPin size={16} /> GPS Coordinates</label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid #3B82F6',
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  fontWeight: 600,
                  cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                  opacity: isGettingLocation ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isGettingLocation) {
                    e.currentTarget.style.backgroundColor = '#DBEAFE';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGettingLocation) {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                  }
                }}
              >
                {isGettingLocation ? '📍 Locating...' : '📍 Detect My Location'}
              </button>
            </div>
            <input 
              value={gps} 
              onChange={e => setGps(e.target.value)} 
              type="text" 
              placeholder="e.g. 6.4455, 7.5534 (or tap Detect My Location)" 
              style={inputStyle} 
            />
          </div>

          {locationError && !latitude && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginTop: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.75rem' }}>{locationError}</span>
            </div>
          )}

          <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}><Layers size={16} /> Current Waste Status *</label>
              <select required value={status} onChange={e => setStatus(e.target.value as BinStatus)} style={inputStyle}>
                <option value="">Select Waste Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><BarChart3 size={16} /> Estimated Waste Volume *</label>
              <select required value={volume} onChange={e => setVolume(e.target.value)} style={inputStyle}>
                <option value="">Select Waste Volume</option>
                <option value="Low">Low (Few bags)</option>
                <option value="Medium">Medium (Half full)</option>
                <option value="High">High (Overflowing)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}><Layers size={16} /> Waste Bin Type *</label>
              <select required value={type} onChange={e => setType(e.target.value as BinType)} style={inputStyle}>
                <option value="">Select Type</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Clock size={16} /> How long is waste at site? *</label>
              <select required value={duration} onChange={e => setDuration(e.target.value)} style={inputStyle}>
                <option value="">Select Duration</option>
                <option value="New">Just today</option>
                <option value="2-3 days">2-3 days</option>
                <option value="1 week">Over a week</option>
                <option value="Long term">Established dumpsite</option>
              </select>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label style={labelStyle}><Camera size={16} /> Upload Photo Evidence of the Waste Site *</label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isCompressing}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: isCompressing ? 'not-allowed' : 'pointer',
                  zIndex: 2
                }}
              />
              <div style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: isCompressing ? 'var(--bg-elevated)' : 'var(--bg-card)',
                borderStyle: 'dashed',
                borderWidth: '2px',
                color: photoName ? 'var(--ai-primary)' : 'var(--text-muted)',
                opacity: isCompressing ? 0.7 : 1,
                cursor: 'pointer'
              }}>
                {isCompressing ? <Loader2 size={20} className="spin" /> : <Camera size={20} />}
                {isCompressing ? 'Compressing image...' : (photoName ? `Selected: ${photoName}` : 'Tap to take or choose photo')}
              </div>
            </div>
            
            {/* Image Preview */}
            {base64Image && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '150px' }}
              >
                <img src={base64Image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
            )}
            
            {/* AI Prediction Display - Will be saved to Google Sheets */}
            {aiPredicting && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Loader2 size={16} className="spin" style={{ display: 'inline-block', marginRight: '8px' }} />
                <span>🤖 AI analyzing waste type...</span>
              </div>
            )}
            
            {aiPrediction && !aiPredicting && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
                borderLeft: `4px solid ${getConfidenceColor(aiPrediction.confidence)}`
              }}>
                <strong>🤖 AI Identified:</strong> {aiPrediction.wasteType.toUpperCase()} 
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                  ({aiPrediction.confidence.toFixed(1)}% confidence)
                </span>
                <div style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${aiPrediction.confidence}%`,
                    height: '100%',
                    backgroundColor: getConfidenceColor(aiPrediction.confidence),
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.3rem', marginBottom: 0 }}>
                  ✅ This AI prediction will be saved with your report
                </p>
              </div>
            )}
            
            {modelLoadError && !aiModel && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#c62828'
              }}>
                ⚠️ AI model not loaded. Report will still be submitted without AI prediction.
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}><MessageSquare size={16} /> Additional Comments</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={2} placeholder="Any more details for the clearing crew..." style={{ ...inputStyle, resize: 'none' }} />
          </div>

          <button
            disabled={loading || isCompressing || !base64Image}
            type="submit"
            style={{
              background: (loading || isCompressing || !base64Image) ? 'var(--text-muted)' : 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              marginTop: '1rem',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1rem',
              boxShadow: (loading || isCompressing || !base64Image) ? 'none' : '0 8px 16px -4px rgba(59, 130, 246, 0.3)',
              cursor: (loading || isCompressing || !base64Image) ? 'not-allowed' : 'pointer',
              opacity: (loading || isCompressing || !base64Image) ? 0.6 : 1,
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Submitting with AI data...</>
            ) : isCompressing ? (
              <><Loader2 size={18} className="spin" /> Compressing image...</>
            ) : !base64Image ? (
              <><Camera size={18} /> Select a photo first</>
            ) : (
              <><Send size={18} /> Submit Report with AI Analysis</>
            )}
          </button>
          
          {/* Help text for the button */}
          {!base64Image && (
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
              Please select a photo to enable submission
            </p>
          )}
        </form>
      </div>

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reportId={lastReportId}
        aiPrediction={lastAIPrediction}
      />
    </motion.div>
  );
};

export default ReportForm;