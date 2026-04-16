import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setDirection(theme === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('dir', direction);
  }, [direction]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setLanguage = (lang) => {
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, direction, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}