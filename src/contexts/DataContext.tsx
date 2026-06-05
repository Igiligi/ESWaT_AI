import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

async function gasGet(url: string): Promise<any[]> {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  
  if (json && json.status === 'success' && Array.isArray(json.data)) {
    return json.data;
  }
  
  if (Array.isArray(json)) {
    return json;
  }
  
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    return [json];
  }
  
  throw new Error('Expected an array from the API');
}

export type BinStatus = 'Overflowing' | '75% full' | 'Half-full' | 'Empty' | 'Open dump';
export type BinType = 'Public bin' | 'Commercial bin' | 'Residential bin' | 'Open dump' | 'Street dump' | 'Empty land' | 'Roadside';

export const categorizeBinType = (type: string = "") => {
  const t = type.toLowerCase().trim();
  if (t.includes('public bin') || t.includes('commercial bin') || t.includes('residential bin')) {
    return 'Waste Bin Site';
  }
  if (t.includes('open dump') || t.includes('street dump') || t.includes('empty land') || t.includes('roadside')) {
    return 'Open Dump Site';
  }
  if (t.includes('bin')) return 'Waste Bin Site';
  if (t.includes('dump') || t.includes('land') || t.includes('side')) return 'Open Dump Site';
  return 'Other';
};

export interface Report {
  id?: string;
  Timestamp: string;
  'Email Address'?: string;
  'Your Name'?: string;
  Location: string;
  'Street Name or Landmark': string;
  'GPS Coordinates': string;
  'What is the current bin status?': BinStatus | string;
  'Bin type': BinType | string;
  'Additional comments': string;
  'Upload a photo of the bin or dump area': string;
  'Estimated waste volume'?: string;
  'WhatsApp number'?: string;
  'How long has this site been used for dumping?'?: string;
  'Last Collected'?: string;
  'Collected By'?: string;
  'Status'?: 'Active' | 'Cleaned';
  'AI Prediction'?: string;
  'AI Confidence'?: number;
  aiPrediction?: string;
  aiConfidence?: number;
  base64Image?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface DataContextType {
  reports: Report[];
  loading: boolean;
  addReport: (report: Report) => Promise<boolean>;
  updateReportStatus: (id: string, newStatus: BinStatus) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const DEFAULT_API_URL = import.meta.env.VITE_SHEET_API_URL || '';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      if (!DEFAULT_API_URL) {
        setReports([]);
        setLoading(false);
        return;
      }

      const data = await gasGet(DEFAULT_API_URL);
      
      const validReports = data
        .filter((r: any) => r.Timestamp || r.Location)
        .map((r: any) => {
          const normalized: any = { ...r };
          
          const aiPrediction = r['AI Prediction'] || r.aiPrediction || '';
          const aiConfidence = parseFloat(r['AI Confidence'] || r.aiConfidence || '0');
          
          return {
            ...normalized,
            id: r.id || r.Timestamp || `id-${Math.random().toString(36).substr(2, 9)}`,
            'AI Prediction': aiPrediction,
            'AI Confidence': isNaN(aiConfidence) ? 0 : aiConfidence,
            aiPrediction: aiPrediction,
            aiConfidence: isNaN(aiConfidence) ? 0 : aiConfidence,
          } as Report;
        });
      
      setReports(validReports);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addReport = async (report: Report) => {
    setLoading(true);
    try {
      if (DEFAULT_API_URL) {
        // Create a clean copy without undefined values
        const submissionData: any = {
          Timestamp: report.Timestamp,
          'Your Name': report['Your Name'] || '',
          Location: report.Location,
          'Street Name or Landmark': report['Street Name or Landmark'],
          'GPS Coordinates': report['GPS Coordinates'] || '',
          'What is the current bin status?': report['What is the current bin status?'],
          'Estimated waste volume': report['Estimated waste volume'] || '',
          'Bin type': report['Bin type'],
          'WhatsApp number': report['WhatsApp number'] || '',
          'How long has this site been used for dumping?': report['How long has this site been used for dumping?'] || '',
          'Additional comments': report['Additional comments'] || '',
          id: report.id,
          // AI Prediction fields - send in both formats to ensure capture
          'AI Prediction': report.aiPrediction || report['AI Prediction'] || '',
          aiPrediction: report.aiPrediction || report['AI Prediction'] || '',
          'AI Confidence': report.aiConfidence || report['AI Confidence'] || 0,
          aiConfidence: report.aiConfidence || report['AI Confidence'] || 0,
          // Photo - this is critical
          base64Image: report.base64Image || ''
        };
        
        console.log('Sending AI Prediction:', submissionData['AI Prediction']);
        console.log('Sending AI Confidence:', submissionData['AI Confidence']);
        console.log('Has base64Image:', !!submissionData.base64Image);
        
        const response = await axios.post(DEFAULT_API_URL, JSON.stringify(submissionData), {
          timeout: 30000,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        if (response.status === 200 || response.data?.status === 'success') {
          await refreshData();
          setLoading(false);
          return true;
        }
        throw new Error(`Submission failed`);
      } else {
        setReports(prev => [report, ...prev]);
        setLoading(false);
        return true;
      }
    } catch (error: any) {
      console.error('Failed to add report:', error);
      toast.error(`Submission failed: ${error.message}`);
      setLoading(false);
      return false;
    }
  };

  const updateReportStatus = async (id: string, newStatus: BinStatus) => {
    setLoading(true);
    try {
      if (DEFAULT_API_URL) {
        const response = await axios.post(DEFAULT_API_URL, JSON.stringify({
          action: 'updateStatus',
          id: id,
          'What is the current bin status?': newStatus,
          'Last Collected': new Date().toISOString()
        }), {
          timeout: 10000,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        if (response.status === 200) {
          setReports(prev => prev.map(r => (r.id === id ? { 
            ...r, 
            'What is the current bin status?': newStatus,
            'Status': 'Cleaned'
          } : r)));
          return true;
        }
        throw new Error(`Update failed`);
      } else {
        setReports(prev => prev.map(r => (r.id === id ? { ...r, 'What is the current bin status?': newStatus } : r)));
        return true;
      }
    } catch (error: any) {
      console.error('Failed to update report:', error);
      toast.error('Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ reports, loading, addReport, updateReportStatus, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};