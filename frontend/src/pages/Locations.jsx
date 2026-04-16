import { useState, useEffect } from 'react';
import { moldsAPI } from '../services/api';
import { Plus, Search, MapPin } from 'lucide-react';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await moldsAPI.getLocations();
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.zone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Locations</h1>
          <p className="text-on-surface-variant">Mold storage locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90">
          <Plus size={20} />
          Add Location
        </button>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full ps-10 pe-4 py-3 bg-surface-container-high rounded-lg border border-outline-variant focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map(location => (
          <div key={location.id} className="glass-panel rounded-xl p-5 hover:bg-surface-container-high transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <MapPin className="text-primary" size={24} />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
                {location.current_count}/{location.capacity}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-1">{location.name}</h3>
            <p className="text-sm text-on-surface-variant mb-3">Zone {location.zone} • Rack {location.rack}</p>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-surface-container-high rounded text-center">
                <p className="text-xs text-on-surface-variant">Rack</p>
                <p className="text-sm font-medium text-on-surface">{location.rack || '-'}</p>
              </div>
              <div className="flex-1 p-2 bg-surface-container-high rounded text-center">
                <p className="text-xs text-on-surface-variant">Shelf</p>
                <p className="text-sm font-medium text-on-surface">{location.shelf || '-'}</p>
              </div>
              <div className="flex-1 p-2 bg-surface-container-high rounded text-center">
                <p className="text-xs text-on-surface-variant">Capacity</p>
                <p className="text-sm font-medium text-on-surface">{location.capacity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant">No locations found</p>
        </div>
      )}
    </div>
  );
}