import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { machinesAPI, moldsAPI, maintenanceAPI } from '../services/api';
import { ArrowLeft, Settings, Activity, Clock, Wrench, Thermometer, Gauge, Zap, Package, Play, Square } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

export default function MachineDetail() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [logs, setLogs] = useState([]);
  const [molds, setMolds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const [machineRes, logsRes, moldsRes] = await Promise.all([
          machinesAPI.getById(id),
          machinesAPI.getLogs(id),
          moldsAPI.getAll()
        ]);
        setMachine(machineRes.data);
        setLogs(logsRes.data);
        setMolds(moldsRes.data);
      } catch (error) {
        console.error('Error fetching machine:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMachine();
  }, [id]);

  const telemetryData = Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, '0')}:00`,
    temperature: 200 + Math.random() * 50,
    pressure: 80 + Math.random() * 30,
    cycleTime: 25 + Math.random() * 10
  }));

  const currentMold = molds.find(m => m.id === machine?.current_mold);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-8 w-24 mb-2 rounded"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!machine) {
    return <div className="text-center py-12">Machine not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/machines" className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{machine.machine_code}</h1>
          <p className="text-on-surface-variant">{machine.branch?.name || 'N/A'} • {machine.serial_number || 'No Serial'}</p>
        </div>
        <span className="ml-auto px-4 py-1.5 rounded-full text-sm font-medium" 
          style={{ backgroundColor: STATUS_COLORS[machine.status] + '20', color: STATUS_COLORS[machine.status] }}>
          {STATUS_LABELS[machine.status] || machine.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-primary" />
            <span className="text-xs text-on-surface-variant">Tonnage</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{machine.spec?.tonnage || 'N/A'}T</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={16} className="text-tertiary" />
            <span className="text-xs text-on-surface-variant">Clamp Force</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{machine.clamping_force_kn || machine.tonnage * 10} kN</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer size={16} className="text-error" />
            <span className="text-xs text-on-surface-variant">Screw Ø</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{machine.screw_diameter || 0} mm</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-secondary" />
            <span className="text-xs text-on-surface-variant">Max Daylight</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{machine.max_daylight || 0} mm</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-warning" />
            <span className="text-xs text-on-surface-variant">Mold Thick</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{machine.mold_thickness_min || 0}-{machine.mold_thickness_max || 0}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-warning" />
            <span className="text-xs text-on-surface-variant">Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{Math.floor(Math.random() * 15 + 80)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Live Telemetry
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-on-surface-variant">Live</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" name="Temp (°C)" />
                <Area type="monotone" dataKey="pressure" stroke="#38bdf8" fillOpacity={1} fill="url(#colorPressure)" name="Pressure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Current Mold
          </h3>
          {currentMold ? (
            <div className="space-y-3">
              <div className="p-3 bg-surface-container-high rounded-lg">
                <p className="text-sm text-on-surface-variant">Code</p>
                <p className="font-semibold text-on-surface">{currentMold.code}</p>
              </div>
              <div className="p-3 bg-surface-container-high rounded-lg">
                <p className="text-sm text-on-surface-variant">Product</p>
                <p className="font-semibold text-on-surface">{currentMold.product_name}</p>
              </div>
              <div className="p-3 bg-surface-container-high rounded-lg">
                <p className="text-sm text-on-surface-variant">Cavities</p>
                <p className="font-semibold text-on-surface">{currentMold.cavities}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package size={40} className="mx-auto text-on-surface-variant mb-3" />
              <p className="text-on-surface-variant">No mold assigned</p>
              <Link to="/production" className="text-sm text-primary hover:underline mt-2 inline-block">
                Assign Mold
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            Machine Logs
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {logs.length > 0 ? logs.slice(0, 10).map(log => (
              <div key={log.id} className="p-3 bg-surface-container-high rounded-lg flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.event_type === 'status_change' ? 'bg-primary' : 
                  log.event_type === 'reglage_saved' ? 'bg-secondary' : 'bg-warning'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{log.event_type}</p>
                  <p className="text-xs text-on-surface-variant">{log.description}</p>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            )) : (
              <p className="text-on-surface-variant text-center py-4">No logs available</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={20} className="text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to={`/parameter-check?machine=${machine.id}`} className="p-4 bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors flex flex-col items-center gap-2">
              <Activity size={24} className="text-primary" />
              <span className="text-sm text-on-surface">Parameter Check</span>
            </Link>
            <button className="p-4 bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors flex flex-col items-center gap-2">
              <Play size={24} className="text-secondary" />
              <span className="text-sm text-on-surface">Start</span>
            </button>
            <button className="p-4 bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors flex flex-col items-center gap-2">
              <Square size={24} className="text-error" />
              <span className="text-sm text-on-surface">Stop</span>
            </button>
            <Link to="/maintenance" className="p-4 bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors flex flex-col items-center gap-2">
              <Wrench size={24} className="text-warning" />
              <span className="text-sm text-on-surface">Maintenance</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}