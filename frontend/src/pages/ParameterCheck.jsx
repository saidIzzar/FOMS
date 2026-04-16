import { useState, useEffect } from 'react';
import { machinesAPI, moldsAPI, aiAPI } from '../services/api';
import { CheckCircle, AlertTriangle, Save, Factory, Box, Thermometer, Gauge, Clock, Zap } from 'lucide-react';

const MATERIALS = [
  { code: 'PP', name: 'Polypropylene', tempRange: [180, 260], moldTemp: [20, 40] },
  { code: 'ABS', name: 'Acrylonitrile Butadiene Styrene', tempRange: [190, 280], moldTemp: [40, 80] },
  { code: 'PC', name: 'Polycarbonate', tempRange: [280, 320], moldTemp: [80, 120] },
  { code: 'PE', name: 'Polyethylene', tempRange: [180, 240], moldTemp: [20, 40] },
  { code: 'PVC', name: 'Polyvinyl Chloride', tempRange: [160, 210], moldTemp: [20, 40] },
  { code: 'PS', name: 'Polystyrene', tempRange: [180, 260], moldTemp: [20, 50] },
  { code: 'POM', name: 'Polyoxymethylene', tempRange: [190, 210], moldTemp: [60, 90] },
];

const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  maintenance: '#38bdf8',
  broken: '#ef4444'
};

export default function ParameterCheck() {
  const [machines, setMachines] = useState([]);
  const [molds, setMolds] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedMold, setSelectedMold] = useState('');
  const [material, setMaterial] = useState('PP');
  const [parameters, setParameters] = useState({
    injection_temp: 220,
    mold_temp: 25,
    injection_speed: 50,
    holding_pressure: 100,
    cooling_time: 10,
    cycle_time: 30
  });
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
    fetchData();
  }, []);

  useEffect(() => {
    const mat = MATERIALS.find(m => m.code === material);
    if (mat) {
      setParameters(prev => ({
        ...prev,
        injection_temp: (mat.tempRange[0] + mat.tempRange[1]) / 2,
        mold_temp: (mat.moldTemp[0] + mat.moldTemp[1]) / 2
      }));
    }
  }, [material]);

  const checkCompatibility = async () => {
    if (!selectedMachine) return;
    setLoading(true);
    try {
      const machine = machines.find(m => m.id === parseInt(selectedMachine));
      const response = await aiAPI.getRecommendations(material, machine.tonnage);
      
      const mat = MATERIALS.find(m => m.code === material);
      const tempInRange = parameters.injection_temp >= mat.tempRange[0] && parameters.injection_temp <= mat.tempRange[1];
      const moldTempInRange = parameters.mold_temp >= mat.moldTemp[0] && parameters.mold_temp <= mat.moldTemp[1];
      
      const score = tempInRange && moldTempInRange ? 95 : tempInRange || moldTempInRange ? 70 : 40;
      
      setCompatibility({
        score,
        compatible: score >= 70,
        recommendations: response.data.recommendations || [],
        warnings: !tempInRange ? [`Injection temp should be ${mat.tempRange[0]}-${mat.tempRange[1]}°C`] : 
                   !moldTempInRange ? [`Mold temp should be ${mat.moldTemp[0]}-${mat.moldTemp[1]}°C`] : []
      });
    } catch (error) {
      console.error('Error checking parameters:', error);
      setCompatibility({
        score: 50,
        compatible: false,
        warnings: ['Could not connect to AI service. Using default validation.'],
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReglage = async () => {
    if (!selectedMachine) return;
    try {
      await machinesAPI.saveReglage(parseInt(selectedMachine), {
        ...parameters,
        material,
        mold_id: selectedMold || null
      });
      alert('Parameters saved successfully!');
    } catch (error) {
      console.error('Error saving reglage:', error);
    }
  };

  const selectedMaterialData = MATERIALS.find(m => m.code === material);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Parameter Checker</h1>
        <p className="text-on-surface-variant">Machine-mold compatibility validation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Factory size={20} className="text-primary" />
            Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-2">Machine</label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Select Machine</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.machine_code} - {m.spec?.tonnage || 'N/A'}T</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2">Mold</label>
              <select
                value={selectedMold}
                onChange={(e) => setSelectedMold(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Select Mold (Optional)</option>
                {molds.map(m => (
                  <option key={m.id} value={m.id}>{m.mold_code} - {m.steel_type} ({m.cavities}cav)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2">Material Type</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="input-field w-full"
              >
                {MATERIALS.map(m => (
                  <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={checkCompatibility}
              disabled={!selectedMachine || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : 'Check Compatibility'}
              <CheckCircle size={18} />
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gauge size={20} className="text-primary" />
            Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-2 flex items-center gap-2">
                <Thermometer size={14} />
                Injection Temperature (°C)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="150"
                  max="350"
                  value={parameters.injection_temp}
                  onChange={(e) => setParameters({...parameters, injection_temp: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={parameters.injection_temp}
                  onChange={(e) => setParameters({...parameters, injection_temp: parseFloat(e.target.value)})}
                  className="input-field w-20 text-center"
                />
              </div>
              {selectedMaterialData && (
                <p className="text-xs text-on-surface-variant mt-1">Range: {selectedMaterialData.tempRange[0]}-{selectedMaterialData.tempRange[1]}°C</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2 flex items-center gap-2">
                <Thermometer size={14} />
                Mold Temperature (°C)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={parameters.mold_temp}
                  onChange={(e) => setParameters({...parameters, mold_temp: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={parameters.mold_temp}
                  onChange={(e) => setParameters({...parameters, mold_temp: parseFloat(e.target.value)})}
                  className="input-field w-20 text-center"
                />
              </div>
              {selectedMaterialData && (
                <p className="text-xs text-on-surface-variant mt-1">Range: {selectedMaterialData.moldTemp[0]}-{selectedMaterialData.moldTemp[1]}°C</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2 flex items-center gap-2">
                <Zap size={14} />
                Injection Speed (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={parameters.injection_speed}
                  onChange={(e) => setParameters({...parameters, injection_speed: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={parameters.injection_speed}
                  onChange={(e) => setParameters({...parameters, injection_speed: parseFloat(e.target.value)})}
                  className="input-field w-20 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2 flex items-center gap-2">
                <Gauge size={14} />
                Holding Pressure (bar)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={parameters.holding_pressure}
                  onChange={(e) => setParameters({...parameters, holding_pressure: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={parameters.holding_pressure}
                  onChange={(e) => setParameters({...parameters, holding_pressure: parseFloat(e.target.value)})}
                  className="input-field w-20 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-2 flex items-center gap-2">
                <Clock size={14} />
                Cooling Time (s)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={parameters.cooling_time}
                  onChange={(e) => setParameters({...parameters, cooling_time: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={parameters.cooling_time}
                  onChange={(e) => setParameters({...parameters, cooling_time: parseFloat(e.target.value)})}
                  className="input-field w-20 text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-primary" />
            Results
          </h3>
          
          {compatibility ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                compatibility.compatible 
                  ? 'bg-secondary/20 border border-secondary/30' 
                  : 'bg-error/20 border border-error/30'
              }`}>
                {compatibility.compatible ? (
                  <CheckCircle className="text-secondary" size={24} />
                ) : (
                  <AlertTriangle className="text-error" size={24} />
                )}
                <div>
                  <p className={`font-semibold ${compatibility.compatible ? 'text-secondary' : 'text-error'}`}>
                    {compatibility.compatible ? 'Compatible' : 'Adjust Required'}
                  </p>
                  <p className="text-sm text-on-surface-variant">Score: {compatibility.score}/100</p>
                </div>
              </div>

              {compatibility.warnings.length > 0 && (
                <div className="space-y-2">
                  {compatibility.warnings.map((warn, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <AlertTriangle size={16} className="text-warning" />
                      <span className="text-sm text-warning">{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {compatibility.recommendations[0] && (
                <div className="p-4 bg-surface-container-high rounded-xl">
                  <p className="text-sm font-medium text-on-surface mb-2">Recommended Values:</p>
                  <div className="space-y-1 text-sm">
                    {Object.entries(compatibility.recommendations[0]).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-on-surface-variant capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-on-surface">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-surface-container-high rounded-xl">
              <AlertTriangle size={20} className="text-on-surface-variant" />
              <span className="text-sm text-on-surface-variant">Select a machine and check compatibility</span>
            </div>
          )}
          
          <button
            onClick={saveReglage}
            disabled={!selectedMachine}
            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
}