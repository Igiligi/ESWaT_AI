import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import type { Report, BinStatus, BinType } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import SuccessModal from '../components/SuccessModal';
import { toast } from 'react-hot-toast';
import { FileText, MapPin, Camera, MessageSquare, Send, Layers, Loader2, User, Phone, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const LOCATIONS: string[] = [
  'Abakpa', 'Independence Layout', 'Emene', 'New Artisan', '9th Mile', 'Zik Avenue', 'Ogui', 'GRA', 'Other'
];
const STATUSES: BinStatus[] = ['Empty', 'Half-full', '75% full', 'Overflowing'];

const TYPES: BinType[] = [
  'Public bin', 'Commercial bin', 'Residential bin',
  'Open dump', 'Street dump', 'Empty land', 'Roadside'
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

        // Max dimensions
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

        // Compress to JPEG at 70% quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
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

  const [yourName, setYourName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
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

  const [showModal, setShowModal] = useState(false);
  const [lastReportId, setLastReportId] = useState('');
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Check for daily submission limit
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const lastSubmission = localStorage.getItem(`submission_${user.id}`);
      if (lastSubmission === today) {
        setIsSubmittedToday(true);
      }
    }
  }, [user]);

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
    setOtherLocation('');
    setVolume('');
    setType('');
    setDuration('');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB original)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Please select an image under 10MB.');
      return;
    }

    setPhotoName(file.name);
    setIsCompressing(true);

    try {
      // Show compression toast
      toast.loading('Compressing image...', { id: 'compress' });

      // Compress the image
      const compressed = await compressImage(file);
      setBase64Image(compressed);

      // Success message
      toast.success('Image ready!', { id: 'compress' });
    } catch (error) {
      console.error('Compression failed:', error);
      toast.error('Image compression failed. Please try another image.', { id: 'compress' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittedToday) {
      toast.error("Daily Limit Reached – You've already submitted a report today.");
      return;
    }

    if (!street.trim()) {
      toast.error('Street name is required');
      return;
    }

    if (!base64Image) {
      toast.error('Photo is required');
      return;
    }

    const reportId = generateReportId();

    // Using EXACT column names for Report object to match Google Sheet
    const newReport: Report = {
      Timestamp: new Date().toISOString(),
      'Email Address': user?.email || '',
      'Your Name': yourName,
      Location: location === 'Other' ? otherLocation : location,
      'Additional comments': comments,
      'Street Name or Landmark': street,
      'GPS Coordinates': gps,
      'What is the current bin status?': status as BinStatus,
      'Estimated waste volume': volume,
      'Bin type': type as BinType,
      'Upload a photo of the bin or dump area': '', // Will be filled by backend
      'WhatsApp number': whatsapp,
      'How long has this site been used for dumping?': duration,
      id: reportId,
      // @ts-ignore - base64Image is used by the Apps Script but not in our interface
      base64Image: base64Image
    };

    // Show uploading toast
    toast.loading('Submitting report (this may take 20-30 seconds)...', { id: 'submit' });

    const success = await addReport(newReport);

    if (success) {
      toast.success('Report submitted successfully!', { id: 'submit' });

      if (user) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`submission_${user.id}`, today);
      }

      setLastReportId(reportId);
      setJustSubmitted(true);
      setShowModal(true);
      resetForm();
    } else {
      toast.error('Submission failed. Please try again.', { id: 'submit' });
    }
  };

  // FIXED: Daily limit reached screen - only shows map button for officers
  if (isSubmittedToday && !justSubmitted && !showModal) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🗓️</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Daily Limit Reached</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            You've already submitted a report today. Thank you for helping keep Enugu clean!
          </p>
          
          {/* Only show map button for officers */}
          {user?.role === 'officer' && (
            <button 
              onClick={() => navigate('/map')} 
              style={{ 
                marginTop: '2rem', 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '10px', 
                fontWeight: 600, 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              View Live Map
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color)',
    fontSize: '14px',
    width: '100%',
    transition: 'all 0.2s',
    outline: 'none',
    backgroundColor: 'white'
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
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '14px', marginBottom: '1rem' }}>
            <FileText size={32} />
          </div>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.75rem' }}>Waste Disposal Report</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>Submit a new site for ESWAMA collection.</p>
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
              <label style={labelStyle}><MapPin size={16} /> Area</label>
              <select required value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}>
                <option value="">Select Area</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>


          {location === 'Other' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <label style={labelStyle}><MapPin size={16} /> Specify Location</label>
              <input required value={otherLocation} onChange={e => setOtherLocation(e.target.value)} type="text" placeholder="Enter manual location" style={inputStyle} />
            </motion.div>
          )}

          <div>
            <label style={labelStyle}><MapPin size={16} /> GPS Coordinates (Optional)</label>
            <input value={gps} onChange={e => setGps(e.target.value)} type="text" placeholder="e.g. 6.4455, 7.5534 (Leave empty if unknown)" style={inputStyle} />
          </div>

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
                backgroundColor: isCompressing ? '#f1f5f9' : '#f8fafc',
                borderStyle: 'dashed',
                borderWidth: '2px',
                color: photoName ? 'var(--primary)' : 'var(--text-muted)',
                opacity: isCompressing ? 0.7 : 1
              }}>
                {isCompressing ? <Loader2 size={20} className="spin" /> : <Camera size={20} />}
                {isCompressing ? 'Compressing image...' : (photoName ? `Selected: ${photoName}` : 'Tap to take or choose photo')}
              </div>
            </div>
            {base64Image && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '150px' }}
              >
                <img src={base64Image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </motion.div>
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
              backgroundColor: (loading || isCompressing || !base64Image) ? '#94a3b8' : 'var(--primary)',
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
              boxShadow: '0 8px 16px -4px rgba(11, 94, 31, 0.3)',
              cursor: (loading || isCompressing || !base64Image) ? 'not-allowed' : 'pointer',
              opacity: (loading || isCompressing || !base64Image) ? 0.6 : 1,
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Submitting (may take 30 sec)...</>
            ) : isCompressing ? (
              <><Loader2 size={18} className="spin" /> Compressing image...</>
            ) : !base64Image ? (
              <><Camera size={18} /> Take photo first</>
            ) : (
              <><Send size={18} /> Send to ESWAMA</>
            )}
          </button>

          {loading && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              ⏱️ Uploading photo and saving report. This may take 20-30 seconds. Please don't close the page.
            </p>
          )}
        </form>
      </div>

      <SuccessModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (justSubmitted) {
            setIsSubmittedToday(true);
            setJustSubmitted(false);
          }
        }}
        reportId={lastReportId}
      />
    </motion.div>
  );
};

export default ReportForm;