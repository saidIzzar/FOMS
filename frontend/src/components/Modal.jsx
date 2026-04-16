import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`glass-card w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-slide-up`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-xl font-semibold text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
}