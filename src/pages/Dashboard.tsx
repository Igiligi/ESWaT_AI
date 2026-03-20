import * as React from 'react';
import { useData, categorizeBinType } from '../contexts/DataContext';
import { Trash2, MapPin, AlertTriangle, BarChart2, Loader2, Layers, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart as ReBarChart, Tooltip, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const Dashboard = () => {
  const { reports: allReports, loading } = useData();
  const reports = allReports.filter(r => r.Status !== 'Cleaned');
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = React.useState<number | null>(null);
  const [activeStatus, setActiveStatus] = React.useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="spin" size={48} color="var(--wa-dark)" />
      </div>
    );
  }

  const stats = {
    total: reports.length,
    openDump: reports.filter(r => categorizeBinType(r['Bin type'] as string) === 'Open Dump Site').length,
    wasteBin: reports.filter(r => categorizeBinType(r['Bin type'] as string) === 'Waste Bin Site').length,
    overflowing: reports.filter(r => {
      const statusValue = r['What is the current bin status?'] || '';
      return statusValue.toLowerCase().includes('overflowing');
    }).length,
    urgent: reports.filter(r => {
      const statusValue = r['What is the current bin status?'] || '';
      return statusValue.toLowerCase().includes('75% full');
    }).length
  };

  const statusData = [
    { name: 'Overflowing', value: stats.overflowing, color: '#ef4444' },
    { name: '75% Full', value: stats.urgent, color: '#f97316' },
    { name: 'Half-full', value: reports.filter(r => r['What is the current bin status?'] === 'Half-full').length, color: '#eab308' },
    { name: 'Empty', value: reports.filter(r => r['What is the current bin status?'] === 'Empty').length, color: '#25D366' },
  ].filter(d => d.value > 0);

  const categoryData = [
    { name: 'Open Dumps', value: stats.openDump, color: '#a855f7' },
    { name: 'Bins', value: stats.wasteBin, color: '#128C7E' }
  ].filter(d => d.value > 0);

  const allLocations = [...new Set(reports.map(r => r.Location as string))];
  const barData = allLocations.map(loc => ({
  name: loc,
  Overflowing: reports.filter(r => r.Location === loc && r['What is the current bin status?'] === 'Overflowing').length,
  '75% full': reports.filter(r => r.Location === loc && r['What is the current bin status?'] === '75% full').length,
  'Half-full': reports.filter(r => r.Location === loc && r['What is the current bin status?'] === 'Half-full').length,
  Empty: reports.filter(r => r.Location === loc && r['What is the current bin status?'] === 'Empty').length
  // OpenDump removed
}))
  .sort((a, b) => (b.Overflowing) - (a.Overflowing))
  .slice(0, 5);

  const chartContainerStyle: React.CSSProperties = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      paddingBottom: '2rem', 
      paddingLeft: '1rem', 
      paddingRight: '1rem',
      width: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <header style={{ padding: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--wa-dark)', margin: 0, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px' }}>ESWaT Analytics</h1>
          <p style={{ color: '#667781', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Enugu Smart Waste Tracking Desk</p>
        </div>
        <button onClick={() => navigate('/map')} className="desktop-only ripple" style={{ backgroundColor: 'var(--wa-dark)', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, border: 'none', boxShadow: '0 4px 12px rgba(7, 94, 84, 0.2)' }}>
          View Live Map
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<Layers size={22} />} label="Total Reports" value={stats.total} />
        <StatCard icon={<AlertTriangle size={22} />} label="Overflowing" value={stats.overflowing} highlight />
        <StatCard icon={<BarChart2 size={22} />} label="Open Dumps" value={stats.openDump} />
        <StatCard icon={<Trash2 size={22} />} label="Waste Bins" value={stats.wasteBin} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Site Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="card"
          style={chartContainerStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--wa-dark)', fontWeight: 800 }}>
                <BarChart2 size={18} /> Site Distribution
              </h3>
              {/* Simple description for layperson */}
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#667781' }}>
                Shows how many are proper waste bins vs open dumps
              </p>
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#f0f2f5', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#667781', fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            {/* Center Overlay */}
            <div style={{
              position: 'absolute',
              top: '47%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              {activeCat !== null ? (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: categoryData[activeCat].color, lineHeight: 1 }}>
                    {categoryData[activeCat].value}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667781', marginTop: '2px' }}>
                    {((categoryData[activeCat].value / stats.total) * 100).toFixed(0)}%
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.7rem', color: '#667781', fontWeight: 600, opacity: 0.5, textTransform: 'uppercase' }}>
                  Touch Site
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(_, i) => setActiveCat(i)}
                  onMouseLeave={() => setActiveCat(null)}
                  onClick={(_, i) => setActiveCat(i)}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        filter: activeCat === index ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={() => null} cursor={false} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
          style={chartContainerStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--wa-dark)', fontWeight: 800 }}>
                <TrendingUp size={18} /> Bin Status Overview
              </h3>
              {/* Simple description with emoji legend */}
              {/* <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#667781' }}>
                🔴 Overflowing | 🟠 75% full | 🟡 Half-full | 🟢 Empty
              </p> */}
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#f0f2f5', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#667781', fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            {/* Center Overlay */}
            <div style={{
              position: 'absolute',
              top: '47%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              {activeStatus !== null ? (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: statusData[activeStatus].color, lineHeight: 1 }}>
                    {statusData[activeStatus].value}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667781', marginTop: '2px' }}>
                    {((statusData[activeStatus].value / stats.total) * 100).toFixed(0)}%
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.7rem', color: '#667781', fontWeight: 600, opacity: 0.5, textTransform: 'uppercase' }}>
                  Status Info
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(_, i) => setActiveStatus(i)}
                  onMouseLeave={() => setActiveStatus(null)}
                  onClick={(_, i) => setActiveStatus(i)}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        filter: activeStatus === index ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={() => null} cursor={false} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* District Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: '20px',
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            border: '1px solid #f0f2f5'
          }}
        >
          {/* Simple Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#075E54" />
                <h3 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  Top Districts
                </h3>
              </div>
              {/* Simple description for layperson */}
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#667781' }}>
                Areas with the most waste problems (higher bars = more reports)
              </p>
            </div>
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: '#f0f2f5',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              color: '#667781',
              fontWeight: 700
            }}>{barData.length} LIVE AREAS
            </span>
          </div>

          {/* Chart Container with Rising Bars */}
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                barSize={24}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  width={30}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(7, 94, 84, 0.02)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.98)'
                  }}
                  // Add friendly names to tooltips
                  formatter={(value, name) => {
  const friendlyNames: Record<string, string> = {
    'Overflowing': '🔴 Overflowing',
    '75% full': '🟠 75% full',
    'Half-full': '🟡 Half-full',
    'Empty': '🟢 Empty'
  };
  return [value, friendlyNames[name || ''] || name || ''];
}}
                />

                {/* Animated Bars - Rising from bottom */}
                <Bar
                  dataKey="Overflowing"
                  stackId="a"
                  fill="#ef4444"
                  radius={[2, 2, 2, 2]}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />

                <Bar
                  dataKey="OpenDump"
                  name="Open Dump"
                  stackId="a"
                  fill="#a855f7"
                  radius={[2, 2, 2, 2]}
                  isAnimationActive={true}
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />

                <Bar
                  dataKey="75% full"
                  name="75% Full"
                  stackId="a"
                  fill="#f97316"
                  radius={[2, 2, 2, 2]}
                  isAnimationActive={true}
                  animationBegin={400}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />

                <Bar
                  dataKey="Half-full"
                  stackId="a"
                  fill="#eab308"
                  radius={[2, 2, 2, 2]}
                  isAnimationActive={true}
                  animationBegin={600}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />

                <Bar
                  dataKey="Empty"
                  stackId="a"
                  fill="#22c55e"
                  radius={[2, 2, 2, 2]}
                  isAnimationActive={true}
                  animationBegin={800}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>

          {/* Simple Legend - Mobile Responsive */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <LegendItem color="#ef4444" label="Overflow" />
            {/* <LegendItem color="#a855f7" label="Dump" /> */}
            <LegendItem color="#f97316" label="75%" />
            <LegendItem color="#eab308" label="Half" />
            <LegendItem color="#22c55e" label="Empty" />
          </div>
        </motion.div>
      </div>

      {/* Hotspots List (WhatsApp Style) */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ marginTop: '2.5rem' }}
      >
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f0f2f5', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#667781', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Critical Hotspots</h3>
          <span style={{ fontSize: '0.7rem', color: '#667781', fontWeight: 600 }}>REPORTS SCALE</span>
        </div>
        <div style={{ backgroundColor: '#f0f2f5', borderRadius: '0 0 14px 14px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          {barData.length === 0 ? (
            <div className="chat-item" style={{ padding: '3rem', justifyContent: 'center' }}>
              <p style={{ color: '#667781' }}>No hotspot data recorded yet.</p>
            </div>
          ) : (
            barData.map((loc, i) => (
              <div key={loc.name} className="chat-item">
                <div className="avatar" style={{
                  backgroundColor: i === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(18, 140, 126, 0.1)',
                  color: i === 0 ? '#ef4444' : '#128C7E',
                  fontWeight: 900,
                  fontSize: '1rem'
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{loc.name}</h4>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: (loc.Overflowing + loc.OpenDump) > 5 ? '#ef4444' : 'var(--wa-dark)' }}>
                      {loc.Overflowing + loc.OpenDump}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#667781', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      {(loc.Overflowing + loc.OpenDump) > 5 ? 'Priority Action Zone' : 'High Frequency Site'}
                    </p>
                    <span style={{ fontSize: '0.65rem', color: '#667781', fontWeight: 700, textTransform: 'uppercase' }}>Submissions</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div> */}
    </div>
  );
};

const StatCard = ({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: number, highlight?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="chat-item"
    style={{
      borderRadius: '20px',
      backgroundColor: 'white',
      border: highlight ? '1.5px solid rgba(239, 68, 68, 0.2)' : '1px solid #f1f5f9',
      boxShadow: '0 4px 6px rgba(0,0,0,0.01)',
      cursor: 'default'
    }}
  >
    <div className="avatar" style={{
      backgroundColor: highlight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(18, 140, 126, 0.1)',
      color: highlight ? '#ef4444' : '#128C7E',
      width: '48px',
      height: '48px',
      boxShadow: highlight ? '0 4px 12px rgba(239, 68, 68, 0.1)' : 'none'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: '#667781', fontSize: '0.75rem', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: highlight ? '#ef4444' : 'var(--wa-dark)' }}>{value}</h2>
    </div>
  </motion.div>
);

export default Dashboard;

// LegendItem component
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#475569'
  }}>
    <div style={{
      width: '10px',
      height: '10px',
      borderRadius: '3px',
      background: color
    }} />
    <span>{label}</span>
  </div>
);