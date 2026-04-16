import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Clock } from 'lucide-react';

export default function CrudModal({ 
  isOpen, 
  onClose, 
  title, 
  item, 
  onSubmit, 
  fields, 
  loading = false,
  size = 'md',
  customComponents = {}
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      const initialData = {};
      fields.forEach(field => {
        let val = item[field.name] ?? field.defaultValue ?? '';
        if ((field.type === 'datetime-local' || field.type === 'date') && val) {
          try {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
              val = field.type === 'date' ? date.toISOString().slice(0, 10) : date.toISOString().slice(0, 16);
            }
          } catch (e) {}
        }
        initialData[field.name] = val;
      });
      setFormData(initialData);
    } else {
      const initialData = {};
      fields.forEach(field => {
        let val = field.defaultValue ?? '';
        if ((field.type === 'datetime-local' || field.type === 'date') && !val) {
          val = field.type === 'date' 
            ? new Date().toISOString().slice(0, 10) 
            : new Date().toISOString().slice(0, 16);
        }
        initialData[field.name] = val;
      });
      setFormData(initialData);
    }
    setErrors({});
  }, [item, fields, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const setNow = (name) => {
    const now = new Date().toISOString().slice(0, 16);
    handleChange(name, now);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        validationErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    if (field.type === 'custom' && customComponents[field.name]) {
      const CustomComponent = customComponents[field.name];
      return <CustomComponent value={value} onChange={(val) => handleChange(field.name, val)} formData={formData} />;
    }

    if (field.type === 'datetime-local' || field.type === 'date') {
      return (
        <div className="flex gap-2">
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`input-field flex-1 ${error ? 'border-error' : ''}`}
            disabled={field.disabled}
          />
          <button
            type="button"
            onClick={() => setNow(field.name)}
            className="btn-secondary px-3 text-sm flex items-center gap-1"
            title="Set to now"
          >
            <Clock size={14} />
            Now
          </button>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={`input-field ${error ? 'border-error' : ''}`}
          disabled={field.disabled}
        >
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={`input-field h-24 resize-none ${error ? 'border-error' : ''}`}
          placeholder={field.placeholder}
          disabled={field.disabled}
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={`input-field ${error ? 'border-error' : ''}`}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          disabled={field.disabled}
        />
      );
    }

    if (field.type === 'checkbox') {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-surface-elevated text-primary focus:ring-primary"
            disabled={field.disabled}
          />
          <span className="text-sm text-on-surface-variant">{field.checkboxLabel}</span>
        </label>
      );
    }

    return (
      <input
        type={field.type || 'text'}
        value={value}
        onChange={(e) => handleChange(field.name, e.target.value)}
        className={`input-field ${error ? 'border-error' : ''}`}
        placeholder={field.placeholder}
        disabled={field.disabled}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map((field, index) => (
          <div key={field.name}>
            {field.type !== 'checkbox' && (
              <label className="block text-sm text-on-surface-variant mb-2">
                {field.label}
                {field.required && <span className="text-error ms-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-xs text-error mt-1">{errors[field.name]}</p>
            )}
            {field.help && (
              <p className="text-xs text-on-surface-variant mt-1">{field.help}</p>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Saving...
              </span>
            ) : item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}