// src/pages/Hotspots.tsx
import { useData } from '../contexts/DataContext';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Hotspots = () => {
  const { reports } = useData();

  // Aggregate Overflowing reports by Street + Location
  const hotspotCounts: Record<string, { street: string, location: string, count: number }> = {};

  reports.forEach(r => {
    const status = r['What is the current bin status?'];
    if ((status === 'Overflowing' || status === 'Open dump') && r.Status !== 'Cleaned') {
      const key = `${r['Street Name or Landmark']}-${r.Location}`;
      if (!hotspotCounts[key]) {
        hotspotCounts[key] = {
          street: r['Street Name or Landmark'],
          location: r.Location as string,
          count: 0
        };
      }
      hotspotCounts[key].count += 1;
    }
  });

  // Convert to array and sort by count descending, top 5
  const topHotspots = Object.values(hotspotCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.75rem' }}>Critical Hotspots</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Data-driven priority locations for ESWAMA dispatch</p>
        </div>
        <div style={{ backgroundColor: 'var(--status-overflowing)15', color: 'var(--status-overflowing)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} /> HIGH TENSION
        </div>
      </div>

      {topHotspots.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No critical hotspots detected.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>The city is looking clean!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {topHotspots.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="chat-item"
              style={{ borderLeft: i === 0 ? '4px solid var(--status-overflowing)' : 'none' }}
            >
              {/* Avatar with rank */}
              <div className="avatar" style={{
                backgroundColor: i === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(7, 94, 84, 0.1)',
                color: i === 0 ? '#ef4444' : 'var(--wa-dark)',
                fontWeight: 800
              }}>
                {i + 1}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {h.street}
                  </h4>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: i === 0 ? '#ef4444' : 'var(--wa-dark)', lineHeight: 1 }}>
                      {h.count}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#667781', fontWeight: 700, textTransform: 'uppercase' }}>Reports</div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.875rem', color: '#667781', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  <span>{h.location}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: '#fffbeb',
          color: '#92400e',
          padding: '1.25rem',
          borderLeft: '5px solid #f59e0b',
          borderRadius: '12px',
          marginTop: '1rem'
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <AlertTriangle size={18} /> Hard Zones – Priority Action
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontWeight: 500 }}>
          Schedule <strong>twice-daily pickups</strong> for these high-traffic overflow areas.
        </p>
      </motion.div>

    </div>
  );
};

export default Hotspots;

