import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { machinesAPI, moldsAPI, maintenanceAPI, productionAPI, usersAPI } from '../services/api';
import { 
  Factory, Box, AlertTriangle, Activity, Clock, 
  Play, Square, Settings, Plus, Users, Target, Zap,
  Thermometer, Timer, ArrowUpRight, ArrowDownRight, Eye,
  Package, Wrench, TrendingUp, Filter, Calendar, Download,
  BarChart3, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { useNotifications } from '../context/NotificationContext';

const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  maintenance: '#38bdf8',
  broken: '#ef4444'
};

const STATUS_LABELS = {
  running: 'Running',
  idle: 'Idle',
  maintenance: 'Maintenance',
  broken: 'Broken'
};

const TIME_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

const FilterSection = ({ filters, onFilterChange, t, i18n }) => (
  <div className="glass-card p-4">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-on-surface-variant" />
        <span className="text-sm text-on-surface-variant">{t('common.filters') || 'Filters'}:</span>
      </div>
      
      <select
        value={filters.timeRange}
        onChange={(e) => onFilterChange('timeRange', e.target.value)}
        className="input-field py-2 px-3 text-sm"
      >
        {TIME_RANGES.map(range => (
          <option key={range.value} value={range.value}>{range.label}</option>
        ))}
      </select>

      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => onFilterChange('startDate', e.target.value)}
        className="input-field py-2 px-3 text-sm"
      />

      <span className="text-on-surface-variant">-</span>

      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => onFilterChange('endDate', e.target.value)}
        className="input-field py-2 px-3 text-sm"
      />

      <select
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="input-field py-2 px-3 text-sm"
      >
        <option value="all">{t('common.all')}</option>
        <option value="running">{t('status.running')}</option>
        <option value="idle">{t('status.idle')}</option>
        <option value="maintenance">{t('status.maintenance')}</option>
        <option value="broken">{t('status.broken')}</option>
      </select>

      <select
        value={filters.machine}
        onChange={(e) => onFilterChange('machine', e.target.value)}
        className="input-field py-2 px-3 text-sm"
      >
        <option value="all">{t('common.all')} {t('nav.machines')}</option>
        {filters.machinesList?.map(m => (
          <option key={m.id} value={m.id}>{m.machine_code || m.name}</option>
        ))}
      </select>

      <button
        onClick={() => onFilterChange('reset', true)}
        className="btn-secondary py-2 px-3 text-sm flex items-center gap-1"
      >
        <RefreshCw size={14} />
        Reset
      </button>
    </div>
  </div>
);

const AnalyticsCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`glass-card p-5 ${className}`}>
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const MachineCard = ({ machine, index }) => (
  <Link
    key={machine.id}
    to={`/machines/${machine.id}`}
    className="glass-card p-4 group"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[machine.status] }}
          />
          {machine.status === 'running' && (
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: STATUS_COLORS[machine.status], opacity: 0.75 }} />
          )}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[machine.status] + '20', color: STATUS_COLORS[machine.status] }}>
          {STATUS_LABELS[machine.status]}
        </span>
      </div>
      <Eye size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <h4 className="font-semibold text-on-surface mb-1">{machine.name}</h4>
    <p className="text-sm text-on-surface-variant mb-3">{machine.tonnage}T • {machine.model}</p>
    
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-surface/50 rounded-lg p-2">
        <p className="text-on-surface-variant flex items-center gap-1"><Timer size={10} /> Cycle</p>
        <p className="text-on-surface font-medium">{machine.cycle_time}s</p>
      </div>
      <div className="bg-surface/50 rounded-lg p-2">
        <p className="text-on-surface-variant flex items-center gap-1"><Thermometer size={10} /> Temp</p>
        <p className="text-on-surface font-medium">{machine.injection_temp}°C</p>
      </div>
    </div>
    
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Box size={12} className="text-on-surface-variant" />
        <span className="text-xs text-on-surface-variant">Mold: {machine.current_mold || '-'}</span>
      </div>
      <span className="text-xs text-primary font-medium">{machine.efficiency}%</span>
    </div>
  </Link>
);

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, bgColor }) => (
  <div className="glass-card p-4 hover:scale-[1.02] transition-transform cursor-pointer">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2.5 rounded-xl" style={{ backgroundColor: bgColor }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-secondary' : 'text-error'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-on-surface">{value}</p>
    <p className="text-sm text-on-surface-variant">{label}</p>
  </div>
);

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { success } = useNotifications();
  const [stats, setStats] = useState({
    machines: { running: 0, idle: 0, maintenance: 0, broken: 0 },
    maintenance: { scheduled: 0, inProgress: 0 }
  });
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productionOutput, setProductionOutput] = useState(0);
  const [defectRate, setDefectRate] = useState(0);
  const [operators, setOperators] = useState([]);
  const [productionDataRaw, setProductionDataRaw] = useState([]);
  const [rawMachines, setRawMachines] = useState([]);

  const [filters, setFilters] = useState({
    timeRange: 'today',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    machine: 'all',
    machinesList: []
  });

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        timeRange: 'today',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'all',
        machine: 'all',
        machinesList: rawMachines
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const filteredMachines = useMemo(() => {
    return rawMachines.filter(m => {
      if (filters.status !== 'all' && m.status !== filters.status) return false;
      if (filters.machine !== 'all' && m.id !== parseInt(filters.machine)) return false;
      return true;
    });
  }, [rawMachines, filters]);

  const filteredProduction = useMemo(() => {
    return productionDataRaw.filter(p => {
      if (!p || !p.start_time) return false;
      try {
        const pDate = new Date(p.start_time).toISOString().split('T')[0];
        if (pDate < filters.startDate || pDate > filters.endDate) return false;
        if (filters.machine !== 'all' && p.machine_id !== parseInt(filters.machine)) return false;
        return true;
      } catch (e) {
        return false;
      }
    });
  }, [productionDataRaw, filters]);

  const analytics = useMemo(() => {
    const totalOutput = filteredProduction.reduce((acc, p) => acc + (p.quantity_produced || 0), 0);
    const totalRejected = filteredProduction.reduce((acc, p) => acc + (p.quantity_rejected || 0), 0);
    const defectRateCalc = totalOutput > 0 ? ((totalRejected / totalOutput) * 100).toFixed(1) : 0;
    
    const runningCount = filteredMachines.filter(m => m.status === 'running').length;
    const idleCount = filteredMachines.filter(m => m.status === 'idle').length;
    const maintenanceCount = filteredMachines.filter(m => m.status === 'maintenance').length;
    const brokenCount = filteredMachines.filter(m => m.status === 'broken').length;

    const machineEfficiency = filteredMachines.reduce((acc, m) => acc + (m.efficiency || 0), 0);
    const avgEfficiency = filteredMachines.length > 0 ? Math.round(machineEfficiency / filteredMachines.length) : 0;

    const statusDistribution = [
      { name: t('status.running'), value: runningCount, color: '#22c55e' },
      { name: t('status.idle'), value: idleCount, color: '#facc15' },
      { name: t('status.maintenance'), value: maintenanceCount, color: '#38bdf8' },
      { name: t('status.broken'), value: brokenCount, color: '#ef4444' }
    ].filter(s => s.value > 0);

    const dailyProduction = {};
    filteredProduction.forEach(p => {
      const date = new Date(p.start_time).toLocaleDateString('en-US', { weekday: 'short' });
      dailyProduction[date] = (dailyProduction[date] || 0) + (p.quantity_produced || 0);
    });
    const weeklyProduction = Object.entries(dailyProduction).map(([day, qty]) => ({ day, quantity: qty }));

    const machineProduction = {};
    filteredProduction.forEach(p => {
      const machineId = p.machine_id;
      machineProduction[machineId] = (machineProduction[machineId] || 0) + (p.quantity_produced || 0);
    });
    const topMachines = Object.entries(machineProduction)
      .map(([id, qty]) => {
        const machine = rawMachines.find(m => m.id === parseInt(id));
        return { name: machine?.name || `Machine ${id}`, quantity: qty };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const materialUsage = {};
    filteredProduction.forEach(p => {
      const material = p.material_used || 'Unknown';
      materialUsage[material] = (materialUsage[material] || 0) + (p.quantity_produced || 0);
    });
    const materialDistribution = Object.entries(materialUsage)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalOutput,
      totalRejected,
      defectRateCalc,
      runningCount,
      idleCount,
      maintenanceCount,
      brokenCount,
      avgEfficiency,
      statusDistribution,
      weeklyProduction,
      topMachines,
      materialDistribution
    };
  }, [filteredMachines, filteredProduction, rawMachines, t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          machinesAPI.getAll(),
          moldsAPI.getAll(),
          maintenanceAPI.getAll(),
          usersAPI.getAll(),
          productionAPI.getAll()
        ]);

        const [machinesRes, moldsRes, maintenanceRes, usersRes, productionRes] = results;
        
        const machinesData = machinesRes.status === 'fulfilled' ? machinesRes.value.data : [];
        const maintenanceData = maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data : [];
        const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
        const productionData = productionRes.status === 'fulfilled' ? productionRes.value.data : [];

        const machineStats = machinesData.reduce((acc, m) => {
          const status = m?.status || 'idle';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const maintenanceStats = maintenanceData.reduce((acc, m) => {
          const status = m?.status || 'scheduled';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const operatorsCount = usersData.filter(u => u?.role === 'operator' && u?.is_active).length;
        
        const runningProduction = productionData.filter(p => p?.status === 'running');
        const totalOutput = runningProduction.reduce((acc, p) => acc + (p?.quantity_produced || 0), 0);
        const totalRejected = runningProduction.reduce((acc, p) => acc + (p?.quantity_rejected || 0), 0);
        const rate = totalOutput > 0 ? ((totalRejected / totalOutput) * 100).toFixed(1) : 0;

        setStats({
          machines: machineStats,
          maintenance: maintenanceStats
        });
        setMachines(machinesData);
        setRawMachines(machinesData);
        setOperators(operatorsCount);
        setProductionOutput(totalOutput);
        setDefectRate(rate);
        setProductionDataRaw(productionData);
        setFilters(prev => ({ ...prev, machinesList: machinesData }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalMachines = Object.values(stats.machines).reduce((a, b) => a + b, 0);
  const runningMachines = stats.machines.running || 0;
  const alertCount = (stats.maintenance.scheduled || 0) + (stats.maintenance.in_progress || 0);

  const productionData = [
    { time: '06:00', production: 1200 },
    { time: '08:00', production: 2400 },
    { time: '10:00', production: 3100 },
    { time: '12:00', production: 2800 },
    { time: '14:00', production: 3500 },
    { time: '16:00', production: 3200 },
    { time: '18:00', production: 2100 },
  ];

  const efficiencyData = filteredMachines.slice(0, 8).map(m => ({
    name: (m.machine_code || m.name || '').substring(0, 12),
    efficiency: m.efficiency || 0
  }));

  const oeeData = [
    { name: 'Availability', value: totalMachines > 0 ? Math.round((runningMachines / totalMachines) * 100) : 0, fill: '#22c55e' },
    { name: 'Performance', value: analytics.avgEfficiency || 85, fill: '#38bdf8' },
    { name: 'Quality', value: analytics.defectRateCalc ? 100 - parseFloat(analytics.defectRateCalc) : 95, fill: '#a855f7' },
  ];

  const handleQuickAction = (action) => {
    success(`${action} action triggered`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-12 w-20 mb-2 rounded"></div>
              <div className="skeleton h-4 w-24 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtLjU4IDAtMS0uNDEtMS0xcy40Mi0xIDEtMSA5LjY3IDkgOS42NyA5IC0uNDEgMS0xIDEtMXMtMS0uNDEtMS0xSDI4Yy0uNTggMC0xLS40MS0xLTFzLjQyLTEgOS42Ny05IDkuNjctOSAxLS40MSAxLTF6bTAgMTZjLS41OCAwLTExLS40MS0xLTFzLjQyLTEgOS42Ny05IDkuNjctOSAxLS40MSAxLTF6bTAgMTZjLS41OCAwLTExLS40MS0xLTFzLjQyLTEgOS42Ny05IDkuNjctOSAxLS40MSAxLTF6bTAgMTZjLS41OCAwLTExLS40MS0xLTFzLjQyLTEgOS42Ny05IDkuNjctOSAxLS40MSAxLTF6IiBmaWxsPSIjZmZmZmYwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -top-20 -end-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -start-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              {t('dashboard.title')}
              <span className="text-cyan-400 ms-3">FOMS</span>
            </motion.h1>
            <p className="text-slate-400 text-lg">{t('app.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const data = { filters, analytics, machines: rawMachines, production: productionDataRaw };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
            >
              <Download size={18} />
              {t('reports.export')}
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-cyan-400 text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 grid grid-cols-2 md:grid-cols-6 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-sky-500/20"><Factory size={16} className="text-sky-400" /></div>
              <span className="text-slate-400 text-sm">{t('dashboard.totalMachines')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{filteredMachines.length}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20"><Activity size={16} className="text-emerald-400" /></div>
              <span className="text-slate-400 text-sm">{t('status.running')}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{analytics.runningCount}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-violet-500/20"><Target size={16} className="text-violet-400" /></div>
              <span className="text-slate-400 text-sm">{t('dashboard.todayProduction')}</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">{analytics.totalOutput.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20"><AlertTriangle size={16} className="text-red-400" /></div>
              <span className="text-slate-400 text-sm">{t('dashboard.defectRate')}</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{analytics.defectRateCalc}%</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20"><Wrench size={16} className="text-amber-400" /></div>
              <span className="text-slate-400 text-sm">{t('nav.maintenance')}</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{analytics.maintenanceCount + analytics.brokenCount}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-sky-500/20"><Users size={16} className="text-sky-400" /></div>
              <span className="text-slate-400 text-sm">{t('nav.users')}</span>
            </div>
            <p className="text-2xl font-bold text-white">{operators}</p>
          </motion.div>
        </div>
      </div>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        t={t}
        i18n={i18n}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={Factory} 
          label={t('dashboard.totalMachines')} 
          value={filteredMachines.length} 
          color="#38bdf8"
          bgColor="rgba(56, 189, 248, 0.15)"
        />
        <StatCard 
          icon={Activity} 
          label={t('status.running')} 
          value={analytics.runningCount} 
          trend={analytics.runningCount > 0 ? `+${analytics.runningCount}` : null}
          trendUp={analytics.runningCount > 0}
          color="#22c55e"
          bgColor="rgba(34, 197, 94, 0.15)"
        />
        <StatCard 
          icon={Target} 
          label={t('dashboard.todayProduction')} 
          value={analytics.totalOutput.toLocaleString()} 
          color="#a855f7"
          bgColor="rgba(168, 85, 247, 0.15)"
        />
        <StatCard 
          icon={AlertTriangle} 
          label={t('dashboard.defectRate')} 
          value={`${analytics.defectRateCalc}%`}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.15)"
        />
        <StatCard 
          icon={Wrench} 
          label={t('nav.maintenance')} 
          value={analytics.maintenanceCount + analytics.brokenCount}
          color="#facc15"
          bgColor="rgba(250, 204, 21, 0.15)"
        />
        <StatCard 
          icon={Users} 
          label={t('nav.users')} 
          value={operators}
          color="#38bdf8"
          bgColor="rgba(56, 189, 248, 0.15)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title={t('reports.productionReport')}
          subtitle={filters.timeRange !== 'today' ? `${filters.startDate} - ${filters.endDate}` : t('dashboard.todayProduction')}
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {analytics.weeklyProduction.length > 0 ? (
                <BarChart data={analytics.weeklyProduction}>
                  <defs>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="quantity" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="production" 
                    stroke="#38bdf8" 
                    fillOpacity={1} 
                    fill="url(#colorProduction)" 
                    strokeWidth={3}
                    dot={{ fill: '#38bdf8', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title={t('dashboard.oee')} subtitle={t('dashboard.overview')}>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={oeeData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px'
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {oeeData.map((item, idx) => (
              <div key={idx} className="text-center p-2 bg-surface/30 rounded-lg">
                <p className="text-lg font-bold" style={{ color: item.fill }}>{item.value}%</p>
                <p className="text-xs text-on-surface-variant">{item.name}</p>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-on-surface">Machine Efficiency</h3>
              <p className="text-sm text-on-surface-variant">Top performers</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData.slice(0, 5)} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={70} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px'
                  }}
                  formatter={(value) => [`${value}%`, 'Efficiency']}
                />
                <Bar dataKey="efficiency" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Live Machine Grid</h3>
            <p className="text-sm text-on-surface-variant mt-1">Real-time monitoring of all equipment</p>
          </div>
          <Link to="/machines" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMachines.slice(0, 10).map((machine, idx) => (
            <MachineCard key={machine.id} machine={machine} index={idx} />
          ))}
          
          {filteredMachines.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Factory size={56} className="mx-auto text-on-surface-variant mb-4 opacity-50" />
              <p className="text-on-surface-variant text-lg">{t('common.noData')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Production by Shift
          </h3>
          <div className="space-y-4">
            {['Morning Shift', 'Afternoon Shift', 'Night Shift'].map((shift, idx) => (
              <div key={shift} className="flex items-center justify-between p-3 bg-surface/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    idx === 0 ? 'bg-primary/20 text-primary' : idx === 1 ? 'bg-secondary/20 text-secondary' : 'bg-tertiary/20 text-tertiary'
                  }`}>
                    <Clock size={18} />
                  </div>
                  <span className="text-sm font-medium text-on-surface">{shift}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-on-surface">{Math.floor(Math.random() * 3000 + 2000)}</p>
                  <p className="text-xs text-on-surface-variant">units</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" />
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {[
              { type: 'warning', message: 'Machine HT-150 temp above threshold', time: '5 min ago' },
              { type: 'error', message: 'Mold M-023 cycle time exceeded', time: '15 min ago' },
              { type: 'info', message: 'Maintenance scheduled for tomorrow', time: '1 hour ago' },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-surface/30 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'error' ? 'bg-error' : alert.type === 'warning' ? 'bg-warning' : 'bg-primary'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface truncate">{alert.message}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Zap size={20} className="text-secondary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Play, label: 'Start All', color: '#22c55e' },
              { icon: Square, label: 'Stop All', color: '#ef4444' },
              { icon: Settings, label: 'Maintenance', color: '#facc15' },
              { icon: TrendingUp, label: 'Generate Report', color: '#a855f7' },
            ].map((action, idx) => (
              <button key={idx} onClick={() => handleQuickAction(action.label)} className="flex flex-col items-center gap-2 p-4 bg-surface/30 rounded-xl hover:bg-surface/50 transition-colors group">
                <div className="p-2 rounded-lg bg-surface group-hover:scale-110 transition-transform" style={{ color: action.color }}>
                  <action.icon size={20} />
                </div>
                <span className="text-xs text-on-surface-variant">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}