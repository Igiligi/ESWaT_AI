import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Helper: perform a CORS-safe GET to Google Apps Script.
// axios adds an 'Accept: application/json' header which triggers a preflight
// OPTIONS request that GAS cannot handle → CORS error.
// Native fetch with no custom headers is a "simple request" → no preflight.
async function gasGet(url: string): Promise<any[]> {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  
  // Handle your Apps Script format: { status: 'success', data: [...] }
  if (json && json.status === 'success' && Array.isArray(json.data)) {
    console.log(`✅ Found ${json.data.length} records in json.data array`);
    return json.data;
  }
  
  // Handle direct array format (fallback)
  if (Array.isArray(json)) {
    console.log(`✅ Found ${json.length} records in direct array format`);
    return json;
  }
  
  // Handle single object wrapped as array
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    console.log('⚠️ Received single object, wrapping as array');
    return [json];
  }
  
  console.error('❌ Unexpected response format:', json);
  throw new Error('Expected an array from the API, got: ' + typeof json);
}

// Columns: Timestamp, Location, Street Name or Landmark, GPS Coordinates, Bin Status, Bin Type, Comments, Photo URL
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
  // Fallback for older data or partial matches
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
  'Status'?: 'Active' | 'Cleaned'; // Added for tracking removal
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
        console.warn('VITE_SHEET_API_URL is not set in .env');
        setReports([]);
        setLoading(false);
        return;
      }

      // Use gasGet (native fetch) to avoid CORS preflight that axios triggers
      const data = await gasGet(DEFAULT_API_URL);
      console.log(`✅ Fetched ${data.length} records from Google Sheet.`);

      const validReports = data
        .filter((r: any) => r.Timestamp || r.Location)
        .map((r: any) => {
          const normalized: any = { ...r };

          const statusKey = Object.keys(r).find(k =>
            k.toLowerCase().includes('bin status') || k.toLowerCase() === 'status'
          ) || 'What is the current bin status?';
          normalized['What is the current bin status?'] = r[statusKey] || '';

          const typeKey = Object.keys(r).find(k =>
            k.toLowerCase() === 'bin type' || k.toLowerCase() === 'type'
          ) || 'Bin type';
          normalized['Bin type'] = r[typeKey] || r['Bin Type'] || '';

          const landmarkKey = Object.keys(r).find(k =>
            k.toLowerCase().includes('landmark') || k.toLowerCase().includes('street')
          ) || 'Street Name or Landmark';
          normalized['Street Name or Landmark'] = r[landmarkKey] || '';

          const photoKey = Object.keys(r).find(k =>
            k.toLowerCase().includes('photo') || k.toLowerCase().includes('image')
          ) || 'Upload a photo of the bin or dump area';
          normalized['Upload a photo of the bin or dump area'] = r[photoKey] || '';

          return {
            ...normalized,
            id: r.id || r.Timestamp || `id-${Math.random().toString(36).substr(2, 9)}`
          } as Report;
        });

      setReports(validReports);
    } catch (error: any) {
      console.error('❌ Failed to fetch data from Google Sheet:', error);
      const msg = error?.message || 'Unknown error';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        toast.error('Network error: Check your internet connection.');
      } else if (msg.includes('404') || msg.includes('EOF')) {
        toast.error('API not found: Please re-deploy your Google Apps Script and update VITE_SHEET_API_URL.');
      } else {
        toast.error(`Connection failed: ${msg}`);
      }
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
        const response = await axios.post(DEFAULT_API_URL, JSON.stringify(report), {
          timeout: 15000,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        if (response.status === 201 || response.status === 200 || response.data?.status === 'success') {
          await refreshData();
          setLoading(false);
          return true;
        }
        throw new Error(`Submission failed with status: ${response.status}`);
      } else {
        // Mock save
        setReports(prev => [report, ...prev]);
        setLoading(false);
        return true;
      }
    } catch (error: any) {
      console.error('Failed to add report:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Submission failed: ${message}`);
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
          // Instant UI Update: Mark locally as cleaned
          setReports(prev => prev.map(r => (r.id === id ? { 
            ...r, 
            'What is the current bin status?': newStatus,
            'Status': 'Cleaned'
          } : r)));
          return true;
        }
        throw new Error(`Update failed with status: ${response.status}`);
      } else {
        setReports(prev => prev.map(r => (r.id === id ? { ...r, 'What is the current bin status?': newStatus } : r)));
        return true;
      }
    } catch (error: any) {
      console.error('Failed to update report:', error);
      toast.error('Failed to update status. Please try again.');
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