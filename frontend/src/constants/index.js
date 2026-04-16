/**
 * FOMS - Constants & Configuration
 * Production-grade configuration constants
 */

export const APP_CONFIG = {
  name: 'FOMS',
  fullName: 'Factory Operations Management System',
  version: '2.0.0',
  apiVersion: 'v1'
};

export const STATUS_COLORS = {
  running: '#22c55e',
  idle: '#facc15',
  active: '#22c55e',
  in_storage: '#facc15',
  in_maintenance: '#38bdf8',
  completed: '#64748b',
  maintenance: '#a855f7',
  broken: '#ef4444',
  paused: '#f97316',
  available: '#22c55e',
  full: '#f97316'
};

export const STATUS_LABELS = {
  running: 'Running',
  idle: 'Idle',
  active: 'Active',
  in_storage: 'In Storage',
  in_maintenance: 'In Maintenance',
  completed: 'Completed',
  maintenance: 'Maintenance',
  broken: 'Broken',
  paused: 'Paused',
  available: 'Available',
  full: 'Full'
};

export const ROLE_CONFIG = {
  admin: { name: 'Administrator', level: 3, color: '#ef4444' },
  engineer: { name: 'Engineer', level: 2, color: '#38bdf8' },
  operator: { name: 'Operator', level: 1, color: '#22c55e' },
  viewer: { name: 'Viewer', level: 0, color: '#64748b' }
};

export const MATERIALS = [
  { value: 'ABS', label: 'ABS', color: '#3b82f6' },
  { value: 'PP', label: 'PP', color: '#10b981' },
  { value: 'PC', label: 'PC', color: '#8b5cf6' },
  { value: 'PE', label: 'PE', color: '#f59e0b' },
  { value: 'PVC', label: 'PVC', color: '#06b6d4' },
  { value: 'PS', label: 'PS', color: '#ec4899' },
  { value: 'POM', label: 'POM', color: '#6366f1' },
  { value: 'PA', label: 'PA (Nylon)', color: '#14b8a6' },
  { value: 'PMMA', label: 'PMMA', color: '#f97316' }
];

export const STEEL_TYPES = [
  { value: 'P20', label: 'P20', description: 'Pre-hardened tool steel' },
  { value: 'H13', label: 'H13', description: 'Hot work tool steel' },
  { value: 'S136', label: 'S136', description: 'Stainless tool steel' },
  { value: 'NAK80', label: 'NAK80', description: 'Pre-hardened mirror steel' },
  { value: '718', label: '718', description: 'Pre-hardened tool steel' },
  { value: 'PMS', label: 'PMS', description: 'Plastic mold steel' }
];

export const TIME_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

export const PAGE_SIZES = [10, 25, 50, 100];

export const API_ENDPOINTS = {
  machines: '/machines',
  molds: '/molds',
  production: '/production-runs',
  maintenance: '/maintenance-records',
  users: '/accounts',
  materials: '/materials',
  rayouns: '/rayouns',
  branches: '/branches',
  compatibility: '/compatibility',
  ai: '/ai',
  efficiency: '/efficiency'
};

export const PERMISSION_MATRIX = {
  machines: { create: ['admin'], read: ['admin', 'engineer', 'operator'] },
  molds: { create: ['admin'], read: ['admin', 'engineer', 'operator'] },
  production: { create: ['admin', 'engineer'], read: ['admin', 'engineer', 'operator'] },
  maintenance: { create: ['admin', 'engineer'], read: ['admin', 'engineer', 'operator'] },
  users: { create: ['admin'], read: ['admin'] },
  settings: { create: ['admin'], read: ['admin'] }
};

export const UI_CONFIG = {
  animations: {
    duration: 300,
    spring: { stiffness: 300, damping: 30 }
  },
  glass: {
    opacity: 0.95,
    blur: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
    surface: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  }
};

export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  DATE: 'date',
  DATETIME: 'datetime-local',
  CHECKBOX: 'checkbox',
  RADIO: 'radio'
};

export const VALIDATION_RULES = {
  code: { required: true, minLength: 2, maxLength: 30 },
  tonnage: { min: 50, max: 1000 },
  cavities: { min: 1, max: 32 },
  dimensions: { min: 1, max: 9999 },
  weight: { min: 0.1, max: 9999 },
  volume: { min: 0.1, max: 9999 }
};

export const ERROR_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email',
  invalidNumber: 'Please enter a valid number',
  minLength: 'Minimum {{count}} characters required',
  maxLength: 'Maximum {{count}} characters allowed',
  minValue: 'Minimum value is {{count}}',
  maxValue: 'Maximum value is {{count}}'
};

export const SUCCESS_MESSAGES = {
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  saved: 'Saved successfully'
};

export const STORAGE_KEYS = {
  token: 'token',
  language: 'language',
  theme: 'theme',
  sidebar: 'sidebar',
  user: 'user'
};

export const ROUTES = {
  dashboard: '/',
  machines: '/machines',
  molds: '/molds',
  rayoun: '/rayoun',
  production: '/production',
  maintenance: '/maintenance',
  materials: '/materials',
  users: '/users',
  settings: '/settings',
  reports: '/reports'
};

export const DEBOUNCE_DELAYS = {
  search: 300,
  save: 500,
  filter: 200
};

export default {
  APP_CONFIG,
  STATUS_COLORS,
  STATUS_LABELS,
  ROLE_CONFIG,
  MATERIALS,
  STEEL_TYPES,
  TIME_RANGES,
  PAGE_SIZES,
  API_ENDPOINTS,
  PERMISSION_MATRIX,
  UI_CONFIG,
  FIELD_TYPES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
  DEBOUNCE_DELAYS
};