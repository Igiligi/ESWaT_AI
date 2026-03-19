import * as React from 'react';
import { useData } from '../contexts/DataContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin } from 'lucide-react';

const getStatusColor = (status: string = "") => {
  const s = status.toLowerCase().trim();
  if (s.includes('overflowing')) return '#ef4444';
  if (s.includes('75% full')) return '#f97316';
  if (s.includes('half-full')) return '#eab308';
  if (s.includes('empty')) return '#22c55e';
  if (s.includes('open dump')) return '#a855f7';
  return '#94a3b8';
};

const CollectionLog = () => {
  const { reports, loading, updateReportStatus, refreshData } = useData();
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  // Show only actionable reports (Overflowing, 75% full, or Open dump)
  const actionableReports = React.useMemo(() => {
    const list = reports.filter(r => {
      const statusValue = (r['What is the current bin status?'] || "").toLowerCase().trim();
      const isActionable = statusValue.includes('overflowing') || 
                          statusValue.includes('75% full') || 
                          statusValue.includes('open dump');
      const rid = r.id || r.Timestamp || "";
      return isActionable && r.Status !== 'Cleaned' && !checkedIds.has(rid);
    });
    return list;
  }, [reports, checkedIds]);

  const handleMarkCollected = async () => {
    const id = confirmingId;
    if (!id) return;
    
    setCheckedIds(prev => new Set(prev).add(id));
    setUpdatingId(id);
    setConfirmingId(null);
    
    const promise = updateReportStatus(id, 'Empty');
    
    toast.promise(promise, {
      loading: 'Updating status...',
      success: 'Marked as cleaned!',
      error: 'Failed to update.',
    });

    await promise;
    setUpdatingId(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
        <div>
          <h2 style={{ color: 'var(--wa-dark)', margin: 0 }}>Collection Dispatch</h2>
          <p style={{ color: '#667781', margin: 0, fontSize: '0.75rem' }}>{actionableReports.length} pending pickups</p>
        </div>
        <button 
          onClick={() => {
            const p = refreshData();
            toast.promise(p, { loading: 'Refreshing...', success: 'Data updated', error: 'Refresh failed' });
          }}
          disabled={loading}
          style={{ fontSize: '0.75rem', color: 'var(--wa-dark)', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--wa-dark)' }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <AnimatePresence>
          {actionableReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
              style={{ padding: '4rem 2rem', textAlign: 'center', margin: '0 1rem' }}
            >
              <CheckCircle size={48} color="#25D366" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>All clear!</p>
            </motion.div>
          ) : (
            actionableReports.map((report, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                key={report.id || report.Timestamp || i} 
                className="chat-item"
                onClick={() => setConfirmingId(report.id || report.Timestamp || '')}
              >
                <div className="avatar" style={{ backgroundColor: `${getStatusColor(report['What is the current bin status?'] as any)}15` }}>
                  <MapPin size={24} color={getStatusColor(report['What is the current bin status?'] as any)} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {report['Street Name or Landmark']}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: '#667781', fontWeight: 500 }}>
                      {new Date(report.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#667781', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'var(--wa-dark)', fontWeight: 600 }}>{report.Location}</span>
                      <span>•</span>
                      <span>{report['Bin type']}</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span style={{ 
                        color: getStatusColor(report['What is the current bin status?'] as any), 
                        fontSize: '0.65rem', 
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        {report['What is the current bin status?']}
                      </span>
                      {checkedIds.has(report.id || report.Timestamp || '') ? (
                        <CheckCircle size={18} color="#25D366" />
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmingId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
              }}
            >
              <CheckCircle size={48} color="#25D366" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>Mark as Cleaned?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Confirming will mark this location as serviced.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setConfirmingId(null)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'white', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMarkCollected}
                  disabled={updatingId !== null}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--wa-dark)', color: 'white', fontWeight: 600 }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionLog;
