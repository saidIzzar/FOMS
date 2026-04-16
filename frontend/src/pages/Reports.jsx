import { useState, useEffect } from 'react';
import { machinesAPI, moldsAPI, productionAPI } from '../services/api';
import { FileText, TrendingUp, Activity, Clock, Target, Gauge, BarChart3, PieChart, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area } from 'recharts';
import { exportToCSV, exportToPDF } from '../utils/export';

const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  maintenance: '#38bdf8',
  broken: '#ef4444'
};

export default function Reports() {
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('oee');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, moldsRes, productionRes] = await Promise.all([
          machinesAPI.getAll(),
          moldsAPI.getAll(),
          productionAPI.getAll()
        ]);
        setMachines(machinesRes.data);
        setMolds(moldsRes.data);
        setProduction(productionRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateOEE = () => {
    const running = machines.filter(m => m.status === 'running').length;
    const total = machines.length || 1;
    const availability = (running / total) * 100;
    const performance = 85 + Math.random() * 10;
    const quality = 95 + Math.random() * 4;
    return {
      oee: Math.round(availability * performance * quality / 10000 * 100) / 100,
      availability: Math.round(availability),
      performance: Math.round(performance),
      quality: Math.round(quality)
    };
  };

  const oee = calculateOEE();

  const machineEfficiency = machines.map(m => ({
    name: m.name,
    efficiency: Math.floor(Math.random() * 20 + 75),
    uptime: Math.floor(Math.random() * 10 + 90),
    output: Math.floor(Math.random() * 5000 + 2000)
  }));

  const moldPerformance = molds.slice(0, 6).map(m => ({
    name: m.code,
    cycles: m.total_cycles || 0,
    efficiency: Math.floor(Math.random() * 20 + 75)
  }));

  const productionTrend = [
    { day: 'Mon', output: 4500, target: 5000 },
    { day: 'Tue', output: 4800, target: 5000 },
    { day: 'Wed', output: 4200, target: 5000 },
    { day: 'Thu', output: 5100, target: 5000 },
    { day: 'Fri', output: 4900, target: 5000 },
    { day: 'Sat', output: 3000, target: 3000 },
    { day: 'Sun', output: 0, target: 0 }
  ];

  const defectData = [
    { name: 'Flash', value: 35 },
    { name: 'Short Shot', value: 25 },
    { name: 'Warpage', value: 20 },
    { name: 'Burrs', value: 15 },
    { name: 'Other', value: 5 }
  ];

  const machineStatusData = Object.entries(
    machines.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status]
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-8 w-24 mb-2 rounded"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getExportData = () => {
    switch(activeTab) {
      case 'oee':
        return [
          { metric: 'OEE', value: oee.oee + '%' },
          { metric: 'Availability', value: oee.availability + '%' },
          { metric: 'Performance', value: oee.performance + '%' },
          { metric: 'Quality', value: oee.quality + '%' }
        ];
      case 'machines':
        return machines.map(m => ({
          name: m.name,
          model: m.model,
          tonnage: m.tonnage,
          status: m.status,
          efficiency: m.efficiency || 0
        }));
      case 'molds':
        return molds.map(m => ({
          code: m.code,
          product_name: m.product_name,
          material: m.material,
          cavities: m.cavities,
          total_cycles: m.total_cycles
        }));
      case 'production':
        return productionTrend;
      case 'quality':
        return defectData;
      default:
        return [];
    }
  };

  const getColumns = () => {
    switch(activeTab) {
      case 'oee':
        return [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }];
      case 'machines':
        return [{ key: 'name', label: 'Machine' }, { key: 'model', label: 'Model' }, { key: 'tonnage', label: 'Tonnage' }, { key: 'status', label: 'Status' }];
      case 'molds':
        return [{ key: 'code', label: 'Code' }, { key: 'product_name', label: 'Product' }, { key: 'material', label: 'Material' }, { key: 'cavities', label: 'Cavities' }];
      case 'production':
        return [{ key: 'day', label: 'Day' }, { key: 'output', label: 'Output' }, { key: 'target', label: 'Target' }];
      case 'quality':
        return [{ key: 'name', label: 'Defect Type' }, { key: 'value', label: 'Percentage' }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
          <p className="text-on-surface-variant mt-1">Production analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(getExportData(), `report_${activeTab}`, getColumns().map(c => c.label))}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            CSV
          </button>
          <button 
            onClick={() => exportToPDF(getExportData(), `report_${activeTab}`, `Analytics - ${activeTab.toUpperCase()} Report`, getColumns())}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'oee', label: 'OEE Dashboard', icon: Gauge },
          { id: 'machines', label: 'Machine Comparison', icon: Activity },
          { id: 'molds', label: 'Mold Efficiency', icon: Target },
          { id: 'production', label: 'Production', icon: TrendingUp },
          { id: 'quality', label: 'Quality/Defects', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface/70'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'oee' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card border-2 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Gauge size={26} className="text-primary" />
                </div>
                <span className="text-xs text-primary font-medium">Overall</span>
              </div>
              <p className="text-5xl font-bold text-gradient mb-1">{oee.oee}%</p>
              <p className="text-sm text-on-surface-variant">OEE Score</p>
              <div className="mt-4 h-2.5 bg-surface/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all" style={{ width: `${oee.oee}%` }}></div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/20 rounded-xl">
                  <Clock size={26} className="text-secondary" />
                </div>
                <span className="text-xs text-secondary font-medium">Availability</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-1">{oee.availability}%</p>
              <p className="text-sm text-on-surface-variant">Run Time / Planned</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-tertiary/20 rounded-xl">
                  <Activity size={26} className="text-tertiary" />
                </div>
                <span className="text-xs text-tertiary font-medium">Performance</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-1">{oee.performance}%</p>
              <p className="text-sm text-on-surface-variant">Actual / Theoretical</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-error/20 rounded-xl">
                  <Target size={26} className="text-error" />
                </div>
                <span className="text-xs text-error font-medium">Quality</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-1">{oee.quality}%</p>
              <p className="text-sm text-on-surface-variant">Good / Total Parts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-5">Machine Status Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={machineStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {machineStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {machineStatusData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-on-surface-variant">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-5">OEE Factors Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Availability', value: oee.availability, color: '#22c55e' },
                  { label: 'Performance', value: oee.performance, color: '#facc15' },
                  { label: 'Quality', value: oee.quality, color: '#38bdf8' }
                ].map(factor => (
                  <div key={factor.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-on-surface-variant">{factor.label}</span>
                      <span className="text-sm font-semibold text-on-surface">{factor.value}%</span>
                    </div>
                    <div className="h-2.5 bg-surface/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${factor.value}%`, backgroundColor: factor.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 bg-surface/50 rounded-xl">
                <p className="text-sm text-on-surface-variant mb-2">Formula:</p>
                <p className="text-xl font-mono text-gradient">OEE = A × P × Q</p>
                <p className="text-xs text-on-surface-variant mt-2">{oee.availability}% × {oee.performance}% × {oee.quality}% = {oee.oee}%</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'machines' && (
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-5">Machine Efficiency Ranking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineEfficiency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="efficiency" fill="#38bdf8" radius={[0, 6, 6, 0]} name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <h3 className="text-lg font-semibold mb-5 p-5 border-b border-white/5">Machine Performance Details</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-5 text-sm font-medium text-on-surface-variant">Machine</th>
                  <th className="text-right py-3 px-5 text-sm font-medium text-on-surface-variant">Efficiency</th>
                  <th className="text-right py-3 px-5 text-sm font-medium text-on-surface-variant">Uptime</th>
                  <th className="text-right py-3 px-5 text-sm font-medium text-on-surface-variant">Output</th>
                  <th className="text-right py-3 px-5 text-sm font-medium text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {machineEfficiency.map((m, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-surface/50">
                    <td className="py-3 px-5 font-medium text-on-surface">{m.name}</td>
                    <td className="py-3 px-5 text-right">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                        m.efficiency >= 90 ? 'bg-secondary/20 text-secondary' :
                        m.efficiency >= 80 ? 'bg-primary/20 text-primary' :
                        'bg-warning/20 text-warning'
                      }`}>{m.efficiency}%</span>
                    </td>
                    <td className="py-3 px-5 text-right text-on-surface">{m.uptime}%</td>
                    <td className="py-3 px-5 text-right text-on-surface">{m.output.toLocaleString()}</td>
                    <td className="py-3 px-5 text-right">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[machines[idx]?.status] }}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'molds' && (
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-5">Mold Efficiency Ranking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moldPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="efficiency" fill="#22c55e" radius={[0, 6, 6, 0]} name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moldPerformance.map((m, idx) => (
              <div key={idx} className="glass-card">
                <h4 className="font-semibold text-on-surface mb-3">{m.name}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface/50 rounded-lg p-3">
                    <p className="text-on-surface-variant">Total Cycles</p>
                    <p className="font-semibold text-on-surface">{m.cycles.toLocaleString()}</p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3">
                    <p className="text-on-surface-variant">Efficiency</p>
                    <p className="font-semibold text-secondary">{m.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-6">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Weekly Production vs Target</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  Actual
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500"></div>
                  Target
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="output" fill="#38bdf8" name="Actual" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#475569" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">Total Output</p>
              <p className="text-4xl font-bold text-on-surface">26,500</p>
              <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                <span className="text-secondary">↑</span> +8% vs last week
              </p>
            </div>
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">Target Achievement</p>
              <p className="text-4xl font-bold text-secondary">97%</p>
              <p className="text-xs text-secondary mt-2">On track</p>
            </div>
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">Shift Average</p>
              <p className="text-4xl font-bold text-on-surface">4,417</p>
              <p className="text-xs text-on-surface-variant mt-2">Units/shift</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">Defect Rate</p>
              <p className="text-4xl font-bold text-on-surface">2.3%</p>
              <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                <span className="text-secondary">↓</span> -0.5% vs last week
              </p>
            </div>
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">First Pass Yield</p>
              <p className="text-4xl font-bold text-secondary">97.7%</p>
              <p className="text-xs text-secondary mt-2">Above target</p>
            </div>
            <div className="glass-card">
              <p className="text-sm text-on-surface-variant mb-1">Total Defects</p>
              <p className="text-4xl font-bold text-on-surface">610</p>
              <p className="text-xs text-on-surface-variant mt-2">This week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-5">Defect Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={defectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {defectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#facc15', '#38bdf8', '#22c55e', '#64748b'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {defectData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="text-xs text-on-surface-variant">{item.name}</span>
                    <span className="text-xs font-medium text-on-surface">({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-5">Defect Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { week: 'W1', defects: 120 },
                    { week: 'W2', defects: 95 },
                    { week: 'W3', defects: 110 },
                    { week: 'W4', defects: 85 },
                    { week: 'W5', defects: 70 },
                    { week: 'W6', defects: 60 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="defects" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Defects" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}