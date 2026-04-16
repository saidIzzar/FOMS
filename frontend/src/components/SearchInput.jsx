/**
 * FOMS - Search Bar with Autocomplete
 */
import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  options = [],
  onSelect,
  selectedLabel,
  debounce = 300,
  clearable = true,
  className = ''
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (options && inputValue) {
      const filtered = options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : opt;
        const searchStr = String(label).toLowerCase();
        return searchStr.includes(inputValue.toLowerCase());
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options || []);
    }
  }, [options, inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (debounce > 0) {
      debounceTimeout.current = setTimeout(() => {
        onChange?.(newValue);
        onSearch?.(newValue);
      }, debounce);
    } else {
      onChange?.(newValue);
      onSearch?.(newValue);
    }
  };

  const handleSelect = (option) => {
    const optionValue = typeof option === 'object' ? option.value : option;
    const optionLabel = typeof option === 'object' ? option.label : option;

    setInputValue(optionLabel);
    setShowDropdown(false);
    onSelect?.(optionValue);
    onChange?.(optionValue);
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions(options || []);
    onChange?.('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const hasOptions = filteredOptions && filteredOptions.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-surface/50 border border-border rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {clearable && inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded-full transition-colors"
          >
            <X size={14} className="text-on-surface-variant" />
          </button>
        )}
        {!clearable && inputValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown size={14} className="text-on-surface-variant" />
          </div>
        )}
      </div>

      {showDropdown && hasOptions && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const isSelected = selectedLabel === optionLabel;

            return (
              <button
                key={optionValue || index}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2.5 text-start hover:bg-surface/50 transition-colors flex items-center justify-between ${
                  isSelected ? 'bg-primary/10 text-primary' : 'text-on-surface'
                }`}
              >
                <span>{optionLabel}</span>
                {isSelected && <span className="text-xs text-primary">Selected</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Filter dropdown component
 */
export function FilterDropdown({
  value,
  onChange,
  options,
  placeholder = 'Filter...',
  label,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find(opt =>
    (typeof opt === 'object' ? opt.value : opt) === value
  );
  const displayValue = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : value || placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-surface/50 border border-border rounded-xl text-on-surface hover:bg-surface/70 transition-colors"
      >
        <span className={value ? 'text-on-surface' : 'text-on-surface-variant'}>
          {displayValue}
        </span>
        <ChevronDown
          size={16}
          className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg py-1">
          {options?.map((option, index) => {
            const optionValue = typeof option === 'object' ? option.value : option;
            const optionLabel = typeof option === 'object' ? option.label : option;
            const isSelected = optionValue === value;

            return (
              <button
                key={optionValue || index}
                onClick={() => {
                  onChange?.(optionValue);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-start hover:bg-surface/50 transition-colors flex items-center gap-2 ${
                  isSelected ? 'bg-primary/10 text-primary' : 'text-on-surface'
                }`}
              >
                <span>{optionLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Table filter bar
 */
export function TableFilterBar({
  searchValue,
  onSearch,
  filterValue,
  onFilter,
  filterOptions,
  searchPlaceholder = 'Search...',
  filterPlaceholder = 'Filter...',
  onRefresh,
  className = ''
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <SearchInput
        value={searchValue}
        onChange={onSearch}
        placeholder={searchPlaceholder}
        className="flex-1 min-w-[200px]"
      />
      {filterOptions && (
        <FilterDropdown
          value={filterValue}
          onChange={onFilter}
          options={filterOptions}
          placeholder={filterPlaceholder}
        />
      )}
    </div>
  );
}

export default {
  SearchInput,
  FilterDropdown,
  TableFilterBar
};