import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import ToastContainer from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Molds from './pages/Molds';
import Rayoun from './pages/Rayoun';
import Locations from './pages/Locations';
import Production from './pages/Production';
import Maintenance from './pages/Maintenance';
import Materials from './pages/Materials';
import ParameterCheck from './pages/ParameterCheck';
import AIServices from './pages/AIServices';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Register from './pages/Register';
import { useState, useEffect, Component } from 'react';
import { Factory, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#38bdf8] via-blue-500 to-[#a855f7] rounded-3xl mb-4 shadow-xl">
          <Factory size={40} className="text-white" />
        </div>
        <div className="w-10 h-10 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[#94a3b8] mt-4">Loading FOMS...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullScreenLoader />;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  return (
    <>
      <Layout />
      <ToastContainer />
    </>
  );
}

function App({ onReady }) {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    const timer = setTimeout(() => {
      setAppReady(true);
      if (onReady) onReady();
    }, 100);
    return () => clearTimeout(timer);
  }, [onReady]);

  if (!appReady) {
    return <FullScreenLoader />;
  }

  console.log('App rendering with routes');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<PrivateRoute><AppContent /></PrivateRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="machines" element={<Machines />} />
                    <Route path="machines/:id" element={<MachineDetail />} />
                    <Route path="molds" element={<Molds />} />
                    <Route path="rayoun" element={<Rayoun />} />
                    <Route path="production" element={<Production />} />
                    <Route path="maintenance" element={<Maintenance />} />
                    <Route path="materials" element={<Materials />} />
                    <Route path="parameter-check" element={<ParameterCheck />} />
                    <Route path="ai-services" element={<AIServices />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="users" element={<Users />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="locations" element={<Locations />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
