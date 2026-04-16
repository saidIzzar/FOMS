import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { theme, getStatusStyle } from '../../styles/theme';
import { machinesAPI, moldsAPI, maintenanceAPI, productionAPI } from '../../services/api';
import { Card, Badge, LoadingSpinner } from '../../components/ui';
import { 
  Factory, Box, Activity, Clock, Play, Square,
  AlertTriangle, TrendingUp, Gauge, Wrench, Package
} from 'lucide-react';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  maintenance: '#38bdf8',
  broken: '#ef4444'
};

const CHART_COLORS = ['#22c55e', '#facc15', '#38bdf8', '#ef4444'];

export default function Dashboard() {
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesRes, moldsRes, maintenanceRes, productionRes] = await Promise.all([
        machinesAPI.getAll(),
        moldsAPI.getAll(),
        maintenanceAPI.getAll(),
        productionAPI.getAll()
      ]);
      setMachines(machinesRes.data);
      setMolds(moldsRes.data);
      setMaintenance(maintenanceRes.data);
      setProduction(productionRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const runningCount = machines.filter(m => m.status === 'running').length;
  const idleCount = machines.filter(m => m.status === 'idle').length;
  const maintenanceCount = machines.filter(m => m.status === 'maintenance').length;
  const brokenCount = machines.filter(m => m.status === 'broken').length;

  const activeMolds = molds.filter(m => m.status === 'active').length;
  const inStorageMolds = molds.filter(m => m.status === 'in_storage').length;

  const pendingMaintenance = maintenance.filter(m => m.status === 'pending').length;

  const machineStatusData = [
    { name: 'Running', value: runningCount },
    { name: 'Idle', value: idleCount },
    { name: 'Maintenance', value: maintenanceCount },
    { name: 'Broken', value: brokenCount }
  ].filter(d => d.value > 0);

  const machineEfficiencyData = machines.map(m => ({
    name: m.name,
    efficiency: m.efficiency || 0
  }));

  const avgEfficiency = machines.length > 0
    ? Math.round(machines.reduce((sum, m) => sum + (m.efficiency || 0), 0) / machines.length)
    : 0;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.colors.onSurface, marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <Card style={{ background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={24} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Running</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>{runningCount}</p>
            </div>
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(145deg, rgba(250, 204, 21, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(250, 204, 21, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Square size={24} color="#facc15" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Idle</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#facc15' }}>{idleCount}</p>
            </div>
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(145deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={24} color="#38bdf8" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Maintenance</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8' }}>{maintenanceCount}</p>
            </div>
          </div>
        </Card>

        <Card style={{ background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Broken</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>{brokenCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gauge size={24} color="#a855f7" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Avg Efficiency</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors.onSurface }}>{avgEfficiency}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Factory size={24} color="#38bdf8" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Total Machines</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors.onSurface }}>{machines.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={24} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Active Molds</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors.onSurface }}>{activeMolds}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(250, 204, 21, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="#facc15" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>Pending Maintenance</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors.onSurface }}>{pendingMaintenance}</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        <Card title="Machine Status">
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {machineStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: theme.gradients.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            {machineStatusData.map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[idx] }} />
                <span style={{ fontSize: '0.8rem', color: theme.colors.onSurfaceVariant }}>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Machine Efficiency">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineEfficiencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    background: theme.gradients.card,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="efficiency" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Card title="Active Machines">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {machines.slice(0, 6).map((machine) => {
              const statusStyle = getStatusStyle(machine.status);
              return (
                <Link
                  key={machine.id}
                  to={`/machines/${machine.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: theme.layout.borderRadius,
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: `1px solid ${theme.colors.border}`,
                    textDecoration: 'none',
                    transition: theme.transitions.normal,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusStyle.dot, boxShadow: `0 0 8px ${statusStyle.dot}` }} />
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.colors.onSurface }}>{machine.name}</p>
                      <p style={{ fontSize: '0.75rem', color: theme.colors.onSurfaceVariant }}>{machine.model} • {machine.location}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge variant={machine.status === 'running' ? 'success' : machine.status === 'idle' ? 'warning' : machine.status === 'maintenance' ? 'info' : 'danger'}>
                      {machine.status}
                    </Badge>
                    <p style={{ fontSize: '0.75rem', color: theme.colors.onSurfaceVariant, marginTop: '0.25rem' }}>Efficiency: {machine.efficiency}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
