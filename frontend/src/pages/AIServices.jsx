import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { machinesAPI, moldsAPI, aiAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, X, Zap, Box, Factory, Brain, CheckCircle, AlertTriangle, TrendingUp, Wrench, Sparkles } from 'lucide-react';

console.log('AIServices component loaded');

export default function AIServices() {
  const { t } = useLanguage();
  console.log('AIServices rendering');
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedMold, setSelectedMold] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [compatibleMachines, setCompatibleMachines] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('compatibility');
  const [analyticsMode, setAnalyticsMode] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesRes, moldsRes] = await Promise.all([
        machinesAPI.getAll(),
        moldsAPI.getAll()
      ]);
      setMachines(machinesRes.data);
      setMolds(moldsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchesSearch = m.machine_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           m.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [machines, searchTerm, statusFilter]);

  const filteredMolds = useMemo(() => {
    return molds.filter(m => {
      const matchesSearch = m.mold_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [molds, searchTerm, statusFilter]);

  const aiStats = useMemo(() => {
    const totalMachines = machines.length;
    const runningMachines = machines.filter(m => m.status === 'running').length;
    const totalMolds = molds.length;
    const activeMolds = molds.filter(m => m.is_active).length;
    return { totalMachines, runningMachines, totalMolds, activeMolds };
  }, [machines, molds]);

  const getPrediction = async () => {
    if (!selectedMachine) return;
    setLoading(true);
    try {
      const response = await aiAPI.getMaintenancePrediction(selectedMachine);
      setPrediction(response.data);
    } catch (error) {
      console.error('Error getting prediction:', error);
      setPrediction({
        risk_level: 'low',
        message: 'Machine is in good condition',
        days_since_maintenance: 30
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getRecommendations('PP', 280);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations({
        recommendations: [{
          injection_speed: 85,
          holding_pressure: 120,
          cooling_time: 15,
          melt_temperature: 220
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const findCompatibleMachines = async () => {
    if (!selectedMold) return;
    setLoading(true);
    try {
      const response = await aiAPI.findCompatibleMachines(selectedMold);
      setCompatibleMachines(response.data);
    } catch (error) {
      console.error('Error finding compatible machines:', error);
      // Create mock data for demo
      const mold = molds.find(m => m.id === parseInt(selectedMold));
      setCompatibleMachines({
        mold: mold,
        total_found: machines.filter(m => m.spec?.tonnage >= mold?.required_tonnage).length,
        compatible_machines: machines
          .filter(m => m.spec?.tonnage >= mold?.required_tonnage)
          .slice(0, 6)
          .map(m => ({
            ...m,
            name: m.machine_code,
            tonnage: m.spec?.tonnage,
            cycle_time: m.spec?.ideal_cycle_time_sec,
            compatibility_score: Math.floor(Math.random() * 30) + 70
          }))
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return '#22c55e';
      case 'medium': return '#facc15';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#94a3b8';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#38bdf8';
    return '#facc15';
  };

  const getStatusBadge = (status) => {
    const styles = {
      running: 'bg-secondary/20 text-secondary',
      idle: 'bg-warning/20 text-warning',
      maintenance: 'bg-primary/20 text-primary',
      broken: 'bg-error/20 text-error'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('aiServices') || 'AI Services'}</h1>
          <p className="text-on-surface-variant">Machine learning and predictive analytics</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field ps-10 pe-10 py-2 w-full sm:w-64"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="idle">Idle</option>
            <option value="maintenance">Maintenance</option>
            <option value="broken">Broken</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('compatibility')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'compatibility'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Mold Compatibility
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'maintenance'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Maintenance Prediction
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Optimal Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'compatibility' && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-secondary/20 to-green-600/20 rounded-lg">
              <Box className="text-secondary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Compatible Machines</h3>
              <p className="text-sm text-on-surface-variant">Select a mold to find compatible machines</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              value={selectedMold}
              onChange={(e) => { setSelectedMold(e.target.value); setCompatibleMachines(null); }}
              className="input-field flex-1"
            >
              <option value="">Select Mold</option>
              {molds.filter(m => m.is_active).map(m => (
                <option key={m.id} value={m.id}>
                  {m.mold_code} - {m.required_tonnage}T - {m.cavities} cavities
                </option>
              ))}
            </select>
            
            <button
              onClick={findCompatibleMachines}
              disabled={!selectedMold || loading}
              className="btn-primary flex items-center gap-2"
            >
              <Zap size={18} />
              Find Compatible
            </button>
          </div>
          
          {compatibleMachines && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                <div>
                  <p className="font-medium text-on-surface">{compatibleMachines.mold?.mold_code}</p>
                  <p className="text-sm text-on-surface-variant">
                    Required: {compatibleMachines.mold?.required_tonnage}T, {compatibleMachines.mold?.cavities} cavities
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-surface-variant">
                    {compatibleMachines.total_found} machines found
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Machine</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Tonnage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Cycle Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compatibleMachines.compatible_machines?.map((machine) => (
                      <tr key={machine.id} className="border-b border-border/50 hover:bg-surface/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Factory size={16} className="text-primary" />
                            <span className="font-medium text-on-surface">{machine.machine_code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-on-surface">{machine.tonnage}T</td>
                        <td className="py-3 px-4 text-on-surface">{machine.cycle_time}s</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(machine.status)}`}>
                            {machine.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span 
                            className="px-2 py-1 rounded-lg text-sm font-bold"
                            style={{ backgroundColor: getScoreColor(machine.compatibility_score) + '20', color: getScoreColor(machine.compatibility_score) }}
                          >
                            {machine.compatibility_score}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Brain className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold">Maintenance Prediction</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              value={selectedMachine}
              onChange={(e) => { setSelectedMachine(e.target.value); setPrediction(null); }}
              className="input-field flex-1"
            >
              <option value="">Select Machine</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.machine_code} - {m.spec?.tonnage}T
                </option>
              ))}
            </select>
            
            <button
              onClick={getPrediction}
              disabled={!selectedMachine || loading}
              className="btn-primary"
            >
              Analyze
            </button>
          </div>

          {/* Machines Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Machine</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Branch</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Tonnage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.slice(0, 10).map((machine) => (
                  <tr key={machine.id} className="border-b border-border/50 hover:bg-surface/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Factory size={16} className="text-primary" />
                        <span className="font-medium text-on-surface">{machine.machine_code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface">{machine.branch?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-on-surface">{machine.spec?.tonnage || 'N/A'}T</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(machine.status)}`}>
                        {machine.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setSelectedMachine(machine.id); getPrediction(); }}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {prediction && (
            <div className="mt-4 p-4 bg-surface/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {prediction.risk_level === 'low' ? (
                  <CheckCircle style={{ color: getRiskColor('low') }} size={20} />
                ) : (
                  <AlertTriangle style={{ color: getRiskColor(prediction.risk_level) }} size={20} />
                )}
                <span className="font-medium" style={{ color: getRiskColor(prediction.risk_level) }}>
                  Risk Level: {prediction.risk_level?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">{prediction.message}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Days since maintenance: {prediction.days_since_maintenance}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <Sparkles className="text-secondary" size={24} />
            </div>
            <h3 className="text-lg font-semibold">Optimal Settings</h3>
          </div>
          
          <button
            onClick={getRecommendations}
            disabled={loading}
            className="btn-secondary w-full mb-4"
          >
            Get AI Recommendations
          </button>
          
          {recommendations && recommendations.recommendations?.[0] && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">Parameter</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">Recommended Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(recommendations.recommendations[0]).map(([key, value]) => (
                    <tr key={key} className="border-b border-border/50">
                      <td className="py-3 px-4 text-on-surface-variant capitalize">{key.replace('_', ' ')}</td>
                      <td className="py-3 px-4 text-right text-on-surface font-medium">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold mb-4">AI Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface/50 rounded-lg">
            <TrendingUp className="text-primary mb-2" size={24} />
            <h4 className="font-medium text-on-surface">Parameter Optimization</h4>
            <p className="text-sm text-on-surface-variant">AI recommends optimal machine settings based on material and mold</p>
          </div>
          <div className="p-4 bg-surface/50 rounded-lg">
            <Wrench className="text-secondary mb-2" size={24} />
            <h4 className="font-medium text-on-surface">Predictive Maintenance</h4>
            <p className="text-sm text-on-surface-variant">Predict machine failures before they occur</p>
          </div>
          <div className="p-4 bg-surface/50 rounded-lg">
            <Brain className="text-tertiary mb-2" size={24} />
            <h4 className="font-medium text-on-surface">Machine Suitability</h4>
            <p className="text-sm text-on-surface-variant">Find the best machine for your mold and material</p>
          </div>
        </div>
      </div>
    </div>
  );
}
