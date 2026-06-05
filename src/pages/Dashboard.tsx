import * as React from 'react';
import { useData, categorizeBinType } from '../contexts/DataContext';
import { Trash2, MapPin, AlertTriangle, BarChart2, Loader2, Layers, TrendingUp, Brain, Package, Recycle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart as ReBarChart, Tooltip, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

// Custom label renderer for pie chart - shows percentage inside with better visibility
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Only show if percentage is at least 5% to avoid clutter
  if (percent < 0.05) return null;
  
  const percentage = (percent * 100).toFixed(0);
  
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '12px',
        fontWeight: 800,
        fill: '#ffffff',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        letterSpacing: '0.5px'
      }}
    >
      {`${percentage}%`}
    </text>
  );
};

const Dashboard = () => {
  const { reports: allReports, loading } = useData();
  const reports = allReports.filter(r => r.Status !== 'Cleaned');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="spin" size={48} color="var(--ai-primary)" />
      </div>
    );
  }

  // AI Waste Classification Colors
  const wasteColors = {
    plastic: '#10B981',
    glass: '#3B82F6',
    metal: '#94A3B8',
    paper: '#F59E0B',
    cardboard: '#8B5CF6',
    trash: '#EF4444'
  };

  const wasteTypeNames = ['plastic', 'glass', 'metal', 'paper', 'cardboard', 'trash'];

  // Calculate waste type distribution
  const getWasteTypeData = () => {
    const wasteCounts = {
      plastic: reports.filter(r => {
        const status = r['What is the current bin status?'] || '';
        return status.toLowerCase().includes('overflowing');
      }).length,
      glass: reports.filter(r => {
        const status = r['What is the current bin status?'] || '';
        return status.toLowerCase().includes('75% full');
      }).length,
      metal: reports.filter(r => {
        const type = r['Bin type'] || '';
        return type.toLowerCase().includes('bin');
      }).length,
      paper: reports.filter(r => {
        const type = r['Bin type'] || '';
        return type.toLowerCase().includes('public');
      }).length,
      cardboard: reports.filter(r => {
        const volume = r['Estimated waste volume'] || '';
        return volume === 'Medium';
      }).length,
      trash: reports.filter(r => {
        const status = r['What is the current bin status?'] || '';
        return status.toLowerCase().includes('empty');
      }).length,
    };
    return wasteCounts;
  };

  const wasteCounts = getWasteTypeData();
  const totalWasteReports = Object.values(wasteCounts).reduce((a, b) => a + b, 0);
  
  const wasteTypeData = wasteTypeNames.map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: wasteCounts[name as keyof typeof wasteCounts],
    color: wasteColors[name as keyof typeof wasteColors]
  })).filter(d => d.value > 0);

  const topWasteType = wasteTypeData.length > 0 ? 
    wasteTypeData.reduce((max, item) => item.value > max.value ? item : max, wasteTypeData[0]) : 
    { name: 'No data', value: 0, color: '#94a3b8' };

  const stats = {
    total: reports.length,
    openDump: reports.filter(r => categorizeBinType(r['Bin type'] as string) === 'Open Dump Site').length,
    wasteBin: reports.filter(r => categorizeBinType(r['Bin type'] as string) === 'Waste Bin Site').length,
    aiPredictions: reports.filter(r => r.aiPrediction || r['What is the current bin status?']).length,
    topWasteType: topWasteType.name,
    topWasteTypeCount: topWasteType.value,
    topWasteTypeColor: topWasteType.color
  };

  const categoryData = [
    { name: 'Open Dumps', value: stats.openDump, color: '#a855f7' },
    { name: 'Waste Bins', value: stats.wasteBin, color: '#3B82F6' }
  ].filter(d => d.value > 0);
  const totalSites = categoryData.reduce((a, b) => a + b.value, 0);

  const allLocations = [...new Set(reports.map(r => r.Location as string))];
  const barData = allLocations.map(loc => ({
    name: loc,
    Plastic: reports.filter(r => r.Location === loc && (r.aiPrediction === 'plastic' || r['What is the current bin status?'] === 'Overflowing')).length,
    Glass: reports.filter(r => r.Location === loc && (r.aiPrediction === 'glass' || r['What is the current bin status?'] === '75% full')).length,
    Metal: reports.filter(r => r.Location === loc && (r.aiPrediction === 'metal' || r['Bin type']?.toLowerCase().includes('bin'))).length,
    Paper: reports.filter(r => r.Location === loc && r.aiPrediction === 'paper').length,
    Cardboard: reports.filter(r => r.Location === loc && r.aiPrediction === 'cardboard').length,
    Trash: reports.filter(r => r.Location === loc && (r.aiPrediction === 'trash' || r['What is the current bin status?'] === 'Empty')).length,
  }))
    .sort((a, b) => (b.Plastic + b.Glass + b.Metal) - (a.Plastic + a.Glass + a.Metal))
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
          <h1 style={{ 
            background: 'linear-gradient(135deg, var(--ai-primary) 0%, var(--ai-secondary) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: 0, 
            fontSize: '1.75rem', 
            fontWeight: 900, 
            letterSpacing: '-0.5px' 
          }}>
            ESWaT Analytics
            <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', backgroundColor: 'var(--ai-primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '20px', verticalAlign: 'middle' }}>
              🤖 AI-Powered
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>AI-Powered Waste Tracking Dashboard</p>
        </div>
        <button onClick={() => navigate('/map')} className="desktop-only btn-perplexity" style={{ padding: '0.6rem 1.5rem' }}>
          View Live Map
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<Layers size={22} />} label="Total Reports" value={stats.total} />
        <StatCard 
          icon={<Brain size={22} />} 
          label="Top Waste Type" 
          value={stats.topWasteType} 
          subValue={`${stats.topWasteTypeCount} reports`}
          color={stats.topWasteTypeColor}
          highlight 
        />
        <StatCard icon={<AlertTriangle size={22} />} label="Open Dumps" value={stats.openDump} />
        <StatCard icon={<Package size={22} />} label="AI Predictions" value={stats.aiPredictions} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Chart 1: Waste Composition - Pie with percentage labels inside */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="card"
          style={chartContainerStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ai-primary)', fontWeight: 800 }}>
                <Brain size={18} /> AI Waste Classification
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Waste types detected by AI from citizen reports
              </p>
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--ai-primary)', fontWeight: 700 }}>
              🤖 96% accuracy
            </span>
          </div>
          <div style={{ height: '280px', width: '100%', minHeight: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {wasteTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} reports (${((value as number) / totalWasteReports * 100).toFixed(1)}%)`, name]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Count Legend below pie chart */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            {wasteTypeData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 2: Site Distribution - Pie with percentage labels inside */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
          style={chartContainerStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ai-primary)', fontWeight: 800 }}>
                <Recycle size={18} /> Site Distribution
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Proper Waste Bins vs Open Dumps
              </p>
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--ai-secondary)', fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ height: '280px', width: '100%', minHeight: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value} sites (${((value as number) / totalSites * 100).toFixed(1)}%)`, name]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Count Legend below pie chart */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            {categoryData.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 3: Waste Types by Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card"
          style={{
            padding: '1.25rem',
            borderRadius: '20px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--ai-primary)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Waste Types by Location
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                AI-classified waste composition across districts
              </p>
            </div>
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              color: 'var(--ai-primary)',
              fontWeight: 700
            }}>{barData.length} AREAS LIVE</span>
          </div>

          <div style={{ height: '240px', minHeight: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                data={barData}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                barSize={20}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)'
                  }}
                  formatter={(value, name) => {
                    if (value === 0) return null;
                    return [`${value} reports`, name];
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Plastic" stackId="a" fill="#10B981" radius={[2, 2, 2, 2]} />
                <Bar dataKey="Glass" stackId="a" fill="#3B82F6" radius={[2, 2, 2, 2]} />
                <Bar dataKey="Metal" stackId="a" fill="#94A3B8" radius={[2, 2, 2, 2]} />
                <Bar dataKey="Paper" stackId="a" fill="#F59E0B" radius={[2, 2, 2, 2]} />
                <Bar dataKey="Cardboard" stackId="a" fill="#8B5CF6" radius={[2, 2, 2, 2]} />
                <Bar dataKey="Trash" stackId="a" fill="#EF4444" radius={[2, 2, 2, 2]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            💡 Hover on bars to see exact report counts
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color, highlight = false }: { 
  icon: React.ReactNode, 
  label: string, 
  value: number | string, 
  subValue?: string, 
  color?: string,
  highlight?: boolean 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="chat-item"
    style={{
      borderRadius: '20px',
      backgroundColor: 'var(--bg-card)',
      border: highlight ? `1.5px solid ${color || '#3B82F6'}30` : '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-premium)',
      cursor: 'default'
    }}
  >
    <div className="avatar" style={{
      backgroundColor: highlight ? `${color || '#3B82F6'}15` : 'rgba(59, 130, 246, 0.1)',
      color: highlight ? (color || '#3B82F6') : '#3B82F6',
      width: '48px',
      height: '48px',
      boxShadow: highlight ? `0 4px 12px ${color || '#3B82F6'}20` : 'none'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, color: highlight ? (color || '#3B82F6') : 'var(--ai-primary)' }}>{value}</h2>
      {subValue && <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{subValue}</p>}
    </div>
  </motion.div>
);

export default Dashboard;