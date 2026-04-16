import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';
import { theme } from '../../styles/theme';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.onSurface,
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 500,
          transition: theme.transitions.normal,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = theme.colors.border;
        }}
      >
        <Globe size={16} style={{ color: theme.colors.primary }} />
        <span>{currentLang.flag}</span>
        <span style={{ fontWeight: 600 }}>{currentLang.code.toUpperCase()}</span>
        <ChevronDown 
          size={14} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: language === 'ar' ? 0 : 'auto',
            left: language === 'ar' ? 'auto' : 0,
            marginTop: '0.5rem',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            padding: '0.5rem',
            minWidth: '160px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: 'none',
                borderRadius: '8px',
                background: language === lang.code ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: language === lang.code ? theme.colors.primary : theme.colors.onSurface,
                cursor: 'pointer',
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: theme.transitions.normal,
              }}
              onMouseEnter={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== lang.code) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{lang.flag}</span>
              <span style={{ fontWeight: language === lang.code ? 600 : 400 }}>{lang.label}</span>
              {language === lang.code && (
                <span style={{ 
                  marginLeft: 'auto', 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: theme.colors.primary 
                }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}