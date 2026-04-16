import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, ChevronDown } from 'lucide-react';
import { theme } from '../styles/theme';

export function SearchableMoldSelect({
  value,
  onChange,
  molds = [],
  onAddNew,
  placeholder = 'Search mold...'
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length >= 2) {
      const matched = molds.some(m => 
        m.mold_code?.toLowerCase().includes(search.toLowerCase())
      );
      setShowAddButton(!matched);
    } else {
      setShowAddButton(false);
    }
  }, [search, molds]);

  const filteredMolds = molds.filter(m => 
    m.is_active && (
      !search || m.mold_code?.toLowerCase().includes(search.toLowerCase()) ||
      m.steel_type?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const selectedMold = molds.find(m => m.id === value);

  const handleSelect = (mold) => {
    onChange(mold.id);
    setSearch('');
    setIsOpen(false);
    setShowAddButton(false);
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    setIsOpen(false);
  };

  const handleAddClick = () => {
    setIsOpen(false);
    onAddNew?.(search);
  };

  return (
    <div ref={containerRef} className="relative">
      {value && selectedMold ? (
        <div className="flex items-center gap-2 p-2.5 bg-surface/50 border border-border rounded-xl">
          <div className="flex-1">
            <span className="text-on-surface font-medium">{selectedMold.mold_code}</span>
            <span className="text-on-surface-variant text-sm ml-2">
              ({selectedMold.steel_type})
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-surface rounded-full transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 bg-surface/50 border border-border rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded-full transition-colors"
              >
                <X size={14} className="text-on-surface-variant" />
              </button>
            )}
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
              {filteredMolds.length > 0 ? (
                filteredMolds.map((mold) => (
                  <button
                    key={mold.id}
                    onClick={() => handleSelect(mold)}
                    className="w-full px-4 py-2.5 text-start hover:bg-surface/50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-on-surface">{mold.mold_code}</span>
                    <span className="text-on-surface-variant text-sm">{mold.steel_type}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-on-surface-variant text-sm">
                  {search.length >= 2 ? 'No molds found' : 'Type to search molds'}
                </div>
              )}

              {showAddButton && (
                <div className="border-t border-border p-2">
                  <button
                    onClick={handleAddClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    <Plus size={16} />
                    Add "{search}" as new mold
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchableMoldSelect;