import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useData, categorizeBinType } from '../contexts/DataContext';
import L from 'leaflet';
import { MapPin, Target, ChevronDown, ChevronUp, Layers, CheckCircle2, Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Nigeria Center Coordinates (Abuja)
const NIGERIA_CENTER: [number, number] = [9.0820, 8.6753];
const ENUGU_CENTER: [number, number] = [6.4584, 7.5464];

// AI Waste Type Colors
const wasteTypeColors = {
  plastic: '#10B981',
  glass: '#3B82F6',
  metal: '#94A3B8',
  paper: '#F59E0B',
  cardboard: '#8B5CF6',
  trash: '#EF4444',
  unknown: '#64748B'
};

// Helper function to parse GPS coordinates from string
const parseGPS = (gpsString: string): [number, number] | null => {
  if (!gpsString) return null;
  
  const match = gpsString.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lat, lng];
    }
  }
  return null;
};

// Get waste type color based on AI prediction or fallback to status
const getWasteTypeColor = (report: any) => {
  const aiPrediction = report.aiPrediction || report['AI Prediction'];
  if (aiPrediction && wasteTypeColors[aiPrediction.toLowerCase() as keyof typeof wasteTypeColors]) {
    return wasteTypeColors[aiPrediction.toLowerCase() as keyof typeof wasteTypeColors];
  }
  
  const status = String(report['What is the current bin status?'] || "").toLowerCase().trim();
  if (status.includes('overflowing')) return wasteTypeColors.plastic;
  if (status.includes('75% full')) return wasteTypeColors.glass;
  if (status.includes('half-full')) return wasteTypeColors.metal;
  if (status.includes('empty')) return wasteTypeColors.paper;
  if (status.includes('open dump')) return wasteTypeColors.trash;
  
  return wasteTypeColors.unknown;
};

// Get waste type name from existing AI prediction
const getWasteTypeName = (report: any) => {
  const aiPrediction = report.aiPrediction || report['AI Prediction'];
  if (aiPrediction) return aiPrediction.charAt(0).toUpperCase() + aiPrediction.slice(1);
  
  const status = String(report['What is the current bin status?'] || "").toLowerCase().trim();
  if (status.includes('overflowing')) return 'Plastic';
  if (status.includes('75% full')) return 'Glass';
  if (status.includes('half-full')) return 'Metal';
  if (status.includes('empty')) return 'Paper';
  if (status.includes('open dump')) return 'Trash';
  
  return 'Unknown';
};

// Get AI confidence if available
const getAIConfidence = (report: any): number | null => {
  const confidence = report.aiConfidence || report['AI Confidence'];
  if (confidence && typeof confidence === 'number') return confidence;
  return null;
};

// Get confidence color based on percentage
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return '#10B981';
  if (confidence >= 50) return '#F59E0B';
  return '#EF4444';
};

// Enugu area coordinates for fallback when no GPS
const areaCoords: Record<string, [number, number]> = {
  'Abakpa': [6.4912, 7.5255],
  'Independence Layout': [6.4328, 7.5144],
  'Emene': [6.4491, 7.5835],
  'New Artisan': [6.4422, 7.5348],
  '9th Mile': [6.4251, 7.4206],
  'Zik Avenue': [6.4310, 7.5020],
  'Ogui': [6.4449, 7.5015],
  'GRA': [6.4578, 7.5103],
  'Enugu': [6.4584, 7.5464],
  'Nsukka': [6.8575, 7.3958],
  'Coal Camp': [6.4500, 7.5000],
  'Uwani': [6.4400, 7.4900],
  'Achara Layout': [6.4350, 7.4950],
  'Trans-Ekulu': [6.4650, 7.5300],
  'Asata': [6.4250, 7.4800],
  'Maryland': [6.4600, 7.5200]
};

// Create custom icon based on waste type color
const createCustomIcon = (color: string, isCritical: boolean = false) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px ${color}40, 0 2px 5px rgba(0,0,0,0.3); ${isCritical ? 'animation: pulse-red 1.5s infinite;' : ''}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7]
  });
};

// Photo component for map popups
const MapPhoto = ({ url }: { url: string }) => {
  const [status, setStatus] = React.useState<'loading' | 'ok' | 'error'>(
    url && url.startsWith('http') ? 'loading' : 'none' as any
  );

  if (!url || !url.startsWith('http')) {
    return (
      <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem', border: '1px dashed #cbd5e1' }}>
        📸 No photo submitted
      </div>
    );
  }
  if (status === 'error') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#fef9c3', borderRadius: '8px', textAlign: 'center', fontSize: '0.7rem', color: '#854d0e', marginBottom: '0.5rem', border: '1px solid #fde047' }}>
        📎 View photo (tap to open)
      </a>
    );
  }
  return (
    <div style={{ marginBottom: '0.5rem', position: 'relative', minHeight: status === 'loading' ? '80px' : undefined }}>
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b' }}>
          Loading…
        </div>
      )}
      <img
        src={url}
        alt="Waste site evidence"
        style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', display: status === 'loading' ? 'none' : 'block' }}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
        onClick={() => window.open(url, '_blank')}
      />
    </div>
  );
};

// Component to handle Geolocation view
const LocationMarker = () => {
  const [position, setPosition] = React.useState<[number, number] | null>(null);
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  };

  return (
    <button
      onClick={handleLocate}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '5px',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: 'var(--ai-primary)',
        color: 'white',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-premium)',
        border: 'none',
        cursor: 'pointer'
      }}
      title="Find my location"
    >
      <Target size={24} />
      {position && <Marker position={position} icon={new L.Icon.Default()} />}
    </button>
  );
};

export default function MapDirectory() {
  const { reports: allReports, updateReportStatus, refreshData, loading } = useData();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [showLegend, setShowLegend] = React.useState(false);

  // Filter states
  const [wasteTypeFilter, setWasteTypeFilter] = React.useState<string>('all');
  const [locationFilter, setLocationFilter] = React.useState<string>('all');

  // Waste type options for filter
  const wasteTypeOptions = [
    { value: 'all', label: 'All Waste Types' },
    { value: 'plastic', label: 'Plastic', color: '#10B981' },
    { value: 'glass', label: 'Glass', color: '#3B82F6' },
    { value: 'metal', label: 'Metal', color: '#94A3B8' },
    { value: 'paper', label: 'Paper', color: '#F59E0B' },
    { value: 'cardboard', label: 'Cardboard', color: '#8B5CF6' },
    { value: 'trash', label: 'Trash', color: '#EF4444' }
  ];

  // Filter out cleaned reports
  const reports = React.useMemo(() => {
    return allReports.filter(r => r.Status !== 'Cleaned');
  }, [allReports]);

  // Filter logic - by waste type and location
  const filteredReports = React.useMemo(() => {
    let list = reports;

    if (wasteTypeFilter !== 'all') {
      list = list.filter(r => {
        const aiPrediction = (r.aiPrediction || r['AI Prediction'] || '').toLowerCase();
        return aiPrediction === wasteTypeFilter;
      });
    }

    if (locationFilter !== 'all') {
      list = list.filter(r => r.Location === locationFilter);
    }

    const uniqueMap = new Map();
    list.forEach(report => {
      if (report.id && !uniqueMap.has(report.id)) {
        uniqueMap.set(report.id, report);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [reports, wasteTypeFilter, locationFilter]);

  // Generate positions for markers
  const plottedReports = React.useMemo(() => {
    return filteredReports.map((r, idx) => {
      let position: [number, number];
      
      const gpsCoords = parseGPS(r['GPS Coordinates'] as string);
      if (gpsCoords) {
        position = gpsCoords;
      } 
      else if (areaCoords[r.Location as string]) {
        position = areaCoords[r.Location as string];
      }
      else {
        position = ENUGU_CENTER;
      }
      
      const seedText = (r.id || r.Timestamp || "");
      const hash = seedText.split("").reduce((a: number, b: string) => { 
        a = ((a << 5) - a) + b.charCodeAt(0); 
        return a & a; 
      }, 0);
      const jitterLat = ((Math.abs(hash) % 200) / 200 - 0.5) * 0.002;
      const jitterLng = ((Math.abs(hash * 31) % 200) / 200 - 0.5) * 0.002;
      
      return { 
        ...r, 
        position: [position[0] + jitterLat, position[1] + jitterLng], 
        tempId: r.id || `map-marker-${idx}-${r.Timestamp}` 
      };
    });
  }, [filteredReports]);

  const handleMarkCollected = async (id: string) => {
    if (!id) return;
    setUpdatingId(id);
    await updateReportStatus(id, 'Empty');
    setUpdatingId(null);
  };

  const uniqueLocations = React.useMemo(() => {
    const locations = new Set<string>();
    reports.forEach(r => {
      if (r.Location) locations.add(r.Location);
    });
    return Array.from(locations).sort();
  }, [reports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: '1rem', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} color="var(--ai-primary)" />
            <h2 style={{ color: 'var(--ai-primary)', margin: 0, lineHeight: 1.2 }}>AI-Powered Waste Map</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>
            Visualizing {filteredReports.length} waste reports across Nigeria
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }} className="map-filters">
          
          <select
            value={wasteTypeFilter}
            onChange={(e) => setWasteTypeFilter(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)'
            }}
          >
            {wasteTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div style={{ position: 'relative', flex: '1 1 150px' }}>
            <input
              list="location-list"
              value={locationFilter === 'all' ? '' : locationFilter}
              onChange={(e) => setLocationFilter(e.target.value || 'all')}
              placeholder="Search Area..."
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '100%', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
            />
            <datalist id="location-list">
              <option value="all">All Areas</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <button
            onClick={() => {
              const p = refreshData();
              toast.promise(p, { loading: 'Syncing Map...', success: 'Map Data Updated', error: 'Sync Failed' });
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--ai-primary)', background: 'var(--ai-primary)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Sync Data
          </button>

          <button
            onClick={() => { setWasteTypeFilter('all'); setLocationFilter('all'); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-color)', position: 'relative' }}>
        {filteredReports.length === 0 && !loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000, backgroundColor: 'var(--bg-card)', padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-premium)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--ai-primary)' }}>No waste reports match your filters</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try changing filters or check your data.</p>
          </div>
        )}
        <MapContainer center={ENUGU_CENTER} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {plottedReports.map((report) => {
            const wasteColor = getWasteTypeColor(report);
            const wasteTypeName = getWasteTypeName(report);
            const isCritical = wasteTypeName === 'Trash' || wasteTypeName === 'Plastic';
            const photoUrl = report['Upload a photo of the bin or dump area'] as string || '';
            const hasPhoto = photoUrl && photoUrl.startsWith('http');
            
            // Get existing AI prediction data
            const aiPrediction = report.aiPrediction || report['AI Prediction'];
            const aiConfidence = getAIConfidence(report);
            const hasAIPrediction = !!aiPrediction;

            return (
              <Marker
                key={report.tempId}
                position={report.position}
                icon={createCustomIcon(wasteColor, isCritical)}
                zIndexOffset={isCritical ? 1000 : 0}
              >
                <Popup className="map-popup">
                  <div style={{ width: '280px', maxWidth: '85vw', padding: '0.5rem', fontFamily: 'var(--font-family)' }}>
                    
                    <MapPhoto url={photoUrl} />

                    {/* Display existing AI Prediction from report form */}
                    {hasAIPrediction && (
                      <div style={{
                        marginBottom: '0.75rem',
                        padding: '0.5rem',
                        backgroundColor: `${wasteColor}20`,
                        borderRadius: '8px',
                        borderLeft: `4px solid ${wasteColor}`,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <Brain size={12} /> AI Prediction
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: wasteColor, textTransform: 'uppercase' }}>
                          {wasteTypeName}
                        </div>
                        {aiConfidence && (
                          <>
                            <div style={{ 
                              marginTop: '0.3rem',
                              width: '100%', 
                              height: '3px', 
                              backgroundColor: 'rgba(0,0,0,0.1)', 
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${aiConfidence}%`, 
                                height: '100%', 
                                backgroundColor: getConfidenceColor(aiConfidence),
                                borderRadius: '2px'
                              }} />
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {aiConfidence.toFixed(1)}% confidence
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <h4 style={{
                      margin: '0 0 0.1rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {report['Street Name or Landmark']}
                    </h4>

                    <p style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <MapPin size={10} color="var(--ai-primary)" /> {report.Location}
                    </p>

                    {/* Show GPS coordinates if available */}
                    {report['GPS Coordinates'] && (
                      <p style={{
                        margin: '0 0 0.5rem',
                        fontSize: '0.6rem',
                        color: '#94a3b8',
                        fontFamily: 'monospace'
                      }}>
                        📍 {report['GPS Coordinates']}
                      </p>
                    )}

                    {/* Show bin status if no AI prediction */}
                    {!hasAIPrediction && report['What is the current bin status?'] && (
                      <div style={{
                        marginBottom: '0.75rem',
                        padding: '0.3rem 0.5rem',
                        backgroundColor: 'rgba(100, 116, 139, 0.1)',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status: </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: wasteColor }}>
                          {report['What is the current bin status?']}
                        </span>
                      </div>
                    )}

                    {report['Additional comments'] && (
                      <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-main)',
                        marginBottom: '0.75rem',
                        background: 'var(--bg-elevated)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        maxHeight: '60px',
                        overflowY: 'auto',
                        borderLeft: `3px solid ${wasteColor}`,
                        fontStyle: 'italic'
                      }}>
                        "{report['Additional comments']}"
                      </p>
                    )}

                    <button
                      onClick={() => handleMarkCollected(report.id || '')}
                      disabled={updatingId === report.id || loading}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: 'var(--ai-primary)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        opacity: updatingId === report.id || loading ? 0.7 : 1,
                        cursor: 'pointer'
                      }}
                    >
                      {updatingId === report.id ? 'Updating...' : <><CheckCircle2 size={14} /> MARK COLLECTED</>}
                    </button>

                    <p style={{
                      fontSize: '0.55rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      {new Date(report.Timestamp).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <LocationMarker />
        </MapContainer>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-premium)',
          width: showLegend ? '200px' : '44px',
          transition: 'all 0.3s ease-in-out',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div
            onClick={() => setShowLegend(!showLegend)}
            style={{
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: showLegend ? 'var(--ai-primary)' : 'var(--bg-card)',
              color: showLegend ? 'white' : 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} />
              {showLegend && <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Waste Types</span>}
            </div>
            {showLegend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showLegend && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Plastic', color: '#10B981' },
                { label: 'Glass', color: '#3B82F6' },
                { label: 'Metal', color: '#94A3B8' },
                { label: 'Paper', color: '#F59E0B' },
                { label: 'Cardboard', color: '#8B5CF6' },
                { label: 'Trash', color: '#EF4444' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, border: '2px solid white', boxShadow: '0 0 0 1px var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#64748B', border: '2px solid white', boxShadow: '0 0 0 1px var(--border-color)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Unknown</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}