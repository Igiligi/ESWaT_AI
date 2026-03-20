import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useData, categorizeBinType } from '../contexts/DataContext';


import L from 'leaflet';
import { MapPin, Target, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Enugu Coordinates
const ENUGU_CENTER: [number, number] = [6.4584, 7.5464];

// ─── Photo component for map popups ────────────────────────
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


const getStatusColor = (status: any = "") => {
  const s = String(status || "").toLowerCase().trim();
  if (s.includes('overflowing')) return '#ef4444';
  if (s.includes('75% full')) return '#f97316';
  if (s.includes('half-full')) return '#eab308';
  if (s.includes('empty')) return '#22c55e';
  if (s.includes('open dump')) return '#a855f7';
  return '#94a3b8';
};

const createCustomIcon = (status: any) => {
  const color = getStatusColor(status);
  const s = String(status || "").toLowerCase().trim();
  const isCritical = s.includes('overflowing') || s.includes('open dump');

  return new L.DivIcon({
    className: `custom-div-icon ${isCritical ? 'critical-marker' : ''}`,
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px ${color}40, 0 2px 5px rgba(0,0,0,0.3); ${isCritical ? 'animation: pulse-red 1.5s infinite;' : ''}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7]
  });
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
        backgroundColor: 'var(--primary)',
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
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [locationFilter, setLocationFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  // Filter out cleaned reports (removed from view)
  const reports = React.useMemo(() => {
    return allReports.filter(r => r.Status !== 'Cleaned');
  }, [allReports]);

  // FIXED: Filter logic with exact matching
  const filteredReports = React.useMemo(() => {
  const list = reports.filter(r => {
    // Get status value
    const currentBinStatus = String(r['What is the current bin status?'] || "").toLowerCase().trim();
    
    // Status filter - exact match
    let statusMatch = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'Overflowing') {
        statusMatch = currentBinStatus === 'overflowing';
      } else if (statusFilter === '75% full') {
        statusMatch = currentBinStatus === '75% full';
      } else if (statusFilter === 'Half-full') {
        statusMatch = currentBinStatus === 'half-full';
      } else if (statusFilter === 'Empty') {
        statusMatch = currentBinStatus === 'empty';
      } else {
        statusMatch = false;
      }
    }

    // Location filter
    const locationMatch = locationFilter === 'all' || r.Location === locationFilter;

    // Category filter
    const category = categorizeBinType(r['Bin type'] as string);
    let categoryMatch = true;
    if (categoryFilter === 'waste') {
      categoryMatch = category === 'Waste Bin Site';
    } else if (categoryFilter === 'dump') {
      categoryMatch = category === 'Open Dump Site';
    }

    return statusMatch && locationMatch && categoryMatch;
  });

  // DEDUPLICATE: Keep only unique reports by ID
  const uniqueMap = new Map();
  list.forEach(report => {
    if (report.id && !uniqueMap.has(report.id)) {
      uniqueMap.set(report.id, report);
    }
  });
  
  const uniqueList = Array.from(uniqueMap.values());
  
  console.log(`Map View: ${list.length} reports match filters, ${uniqueList.length} after deduplication`);
  return uniqueList;
}, [reports, statusFilter, locationFilter, categoryFilter]);

  // Debug effect to log filter changes
  React.useEffect(() => {
    console.log('🔍 Filters changed:', { statusFilter, locationFilter, categoryFilter });
  }, [statusFilter, locationFilter, categoryFilter]);

  const plottedReports = React.useMemo(() => {
    return filteredReports.map((r, idx) => {
      const area = r.Location as string;
      const landmark = r['Street Name or Landmark'] || "";

      // Area-based coordinates + seeded jitter
      const areaCoords: Record<string, [number, number]> = {
        'Abakpa': [6.4912, 7.5255],
        'Independence Layout': [6.4328, 7.5144],
        'Emene': [6.4491, 7.5835],
        'New Artisan': [6.4422, 7.5348],
        '9th Mile': [6.4251, 7.4206],
        'Zik Avenue': [6.4310, 7.5020],
        'Ogui': [6.4449, 7.5015],
        'GRA': [6.4578, 7.5103],
      };

      const basePos = areaCoords[area] || ENUGU_CENTER;

      const seedText = landmark + (r.id || r.Timestamp || "");
      const hash = seedText.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      const jitterLat = ((Math.abs(hash) % 200) / 200 - 0.5) * 0.015;
      const jitterLng = ((Math.abs(hash * 31) % 200) / 200 - 0.5) * 0.015;

      const position: [number, number] = [basePos[0] + jitterLat, basePos[1] + jitterLng];

      return {
        ...r,
        position,
        tempId: r.id || `map-marker-${idx}-${r.Timestamp}`
      };
    });
  }, [filteredReports]);


  console.log(`Map: Plotting ${plottedReports.length} markers out of ${reports.length} total reports.`);

  const handleMarkCollected = async (id: string) => {
    if (!id) return;
    setUpdatingId(id);
    await updateReportStatus(id, 'Empty');
    setUpdatingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: '1rem', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0, lineHeight: 1.2 }}>Enugu Waste Map</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>Visualizing {plottedReports.length} sites across Enugu City</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }} className="map-filters">

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Overflowing">Overflowing Only</option>
            <option value="75% full">75% Full</option>
            <option value="Half-full">Half-full</option>
            <option value="Empty">Clean/Empty</option>
          </select>


          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">Show ALL Sites</option>
            <option value="waste">Show Only Waste Bins</option>
            <option value="dump">Show Only Open Dumps</option>
          </select>


          <div style={{ position: 'relative', flex: '1 1 150px' }}>
            <input
              list="location-list"
              value={locationFilter === 'all' ? '' : locationFilter}
              onChange={(e) => setLocationFilter(e.target.value || 'all')}
              placeholder="Search Location..."
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', width: '100%' }}
            />

            <datalist id="location-list">
              <option value="all">All Locations</option>
              {[...new Set(reports.map(r => r.Location as string))].map(loc => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>


          <button
            onClick={() => {
              const p = refreshData();
              toast.promise(p, { loading: 'Syncing Map...', success: 'Map Data Updated', error: 'Sync Failed' });
            }}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Sync Data
          </button>

          <button
            onClick={() => { setStatusFilter('all'); setLocationFilter('all'); setCategoryFilter('all'); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Reset Filters
          </button>

        </div>
      </div>

      <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-color)', position: 'relative' }}>
        {plottedReports.length === 0 && !loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2000, backgroundColor: 'white', padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-premium)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>No active reports match your filters</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try changing filters or check your spreadsheet data.</p>
          </div>
        )}
        <MapContainer center={ENUGU_CENTER} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {plottedReports.map((report) => {
            const s = (report['What is the current bin status?'] as string || "").toLowerCase();
            const isCriticalMarker = s.includes('overflowing') || s.includes('open dump');


            return (
              <Marker
                key={report.tempId}
                position={report.position}
                icon={createCustomIcon(report['What is the current bin status?'] as string)}
                zIndexOffset={isCriticalMarker ? 1000 : 0}
              >
                <Popup className="map-popup">
                  <div style={{
                    width: '260px',
                    maxWidth: '85vw',
                    padding: '0.5rem',
                    fontFamily: 'var(--font-family)'
                  }}>

                    {/* Photo from Google Drive */}
                    <MapPhoto url={report['Upload a photo of the bin or dump area'] as string || ''} />


                    {/* Title with ellipsis for long names */}
                    <h4 style={{
                      margin: '0 0 0.1rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {report['Street Name or Landmark']}
                    </h4>

                    {/* Location with smaller icon */}
                    <p style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <MapPin size={10} color="var(--primary)" /> {report.Location}
                    </p>

                    {/* Status badge - compact */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        backgroundColor: getStatusColor(report['What is the current bin status?']),
                        color: 'white',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        display: 'inline-block'
                      }}>
                        {report['What is the current bin status?']}
                      </span>
                    </div>

                    {/* Comments - scrollable if too long */}
                    {report['Additional comments'] && (
                      <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-main)',
                        marginBottom: '0.75rem',
                        background: '#f8fafc',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        maxHeight: '60px',
                        overflowY: 'auto',
                        borderLeft: `3px solid ${getStatusColor(report['What is the current bin status?'])}`,
                        fontStyle: 'italic'
                      }}>
                        "{report['Additional comments']}"
                      </p>
                    )}

                    {/* Action button - full width compact */}
                    {report['What is the current bin status?'] !== 'Empty' && (
                      <button
                        onClick={() => handleMarkCollected(report.id || '')}
                        disabled={updatingId === report.id || loading}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          backgroundColor: 'var(--primary)',
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
                    )}

                    {/* Timestamp - tiny */}
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
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-premium)',
          width: showLegend ? '220px' : '44px',
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
              background: showLegend ? 'var(--primary)' : 'white',
              color: showLegend ? 'white' : 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} />
              {showLegend && <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Status Legend</span>}
            </div>
            {showLegend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showLegend && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Overflowing', color: '#ef4444' },
                { label: '75% Full', color: '#f97316' },
                { label: 'Half Full', color: '#eab308' },
                { label: 'Empty/Clean', color: '#22c55e' },
                { label: 'Open Dump Site', color: '#a855f7' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, border: '2px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                </div>
              ))}
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