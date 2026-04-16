/**
 * FOMS - Safe Utilities
 * Production-grade utilities for safe data handling
 */

export const safeGet = (obj, path, defaultValue = '') => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  return result ?? defaultValue;
};

export const safeString = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

export const safeArray = (value, fallback = []) => {
  if (!value) return fallback;
  if (!Array.isArray(value)) return fallback;
  return value;
};

export const safeNumber = (value, fallback = 0) => {
  if (value == null) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export const formatDate = (dateStr, fallback = '-') => {
  if (!dateStr) return fallback;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleString();
  } catch {
    return fallback;
  }
};

export const formatDuration = (minutes, fallback = '-') => {
  if (!minutes || minutes === 0) return fallback;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
};

export const formatNumber = (value, decimals = 0) => {
  if (value == null) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};

export const getStatusColor = (status, colors = {}) => {
  const defaultColors = {
    running: '#22c55e',
    idle: '#facc15',
    active: '#22c55e',
    in_storage: '#facc15',
    in_maintenance: '#38bdf8',
    completed: '#64748b',
    maintenance: '#a855f7',
    broken: '#ef4444',
    paused: '#f97316'
  };
  return colors[status] || defaultColors[status] || '#64748b';
};

export const truncate = (str, length = 30) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const filterOptions = (options, searchTerm, labelKey = 'label') => {
  if (!searchTerm || !options) return options || [];
  const term = searchTerm.toLowerCase();
  return options.filter(opt =>
    String(opt[labelKey] || opt).toLowerCase().includes(term)
  );
};

export const groupBy = (array, key) => {
  if (!array || !Array.isArray(array)) return {};
  return array.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, ascending = true) => {
  if (!array || !Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = (array, key) => {
  if (!array || !Array.isArray(array)) return [];
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const chunk = (array, size) => {
  if (!array || !Array.isArray(array)) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const parseJSON = (str, fallback = null) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const stringifyJSON = (obj, fallback = '') => {
  if (obj == null) return fallback;
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
};

export default {
  safeGet,
  safeString,
  safeArray,
  safeNumber,
  formatDate,
  formatDuration,
  formatNumber,
  getStatusColor,
  truncate,
  capitalize,
  getInitials,
  debounce,
  classNames,
  generateId,
  filterOptions,
  groupBy,
  sortBy,
  uniqueBy,
  chunk,
  parseJSON,
  stringifyJSON
};