import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToolProvider } from './context/ToolContext';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando SoraGemiX..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente de ruta pública (solo para no autenticados)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando SoraGemiX..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/editor" replace />;
};

// Página temporal del editor
const EditorPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-holographic mb-4">
            ¡Bienvenido a SoraGemiX!
          </h1>
          <p className="text-slate-400 text-lg">
            Hola {user?.name}, tu editor de imágenes con IA está casi listo.
          </p>
        </div>

        <div className="card-glass p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-nanoBlue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🚀</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Sistema en Desarrollo</h2>
          <p className="text-slate-300 mb-6">
            El editor completo con todas las herramientas de IA estará disponible pronto.
          </p>
          
          <div className="bg-nanoBlue-500/10 border border-nanoBlue-500/20 rounded-lg p-4 mb-6">
            <p className="text-nanoBlue-300">
              <strong>Tu cuota actual:</strong> {user?.quota_remaining || 0} créditos disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-nanoBlue-400 mb-2">✨ Herramientas IA</h3>
              <p className="text-sm text-slate-400">10+ herramientas de edición inteligente</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-nanoBlue-400 mb-2">🎨 Editor Visual</h3>
              <p className="text-sm text-slate-400">Interfaz intuitiva y fácil de usar</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold text-nanoBlue-400 mb-2">📱 Responsive</h3>
              <p className="text-sm text-slate-400">Funciona en todos los dispositivos</p>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="btn-primary mt-6"
          >
            Actualizar Página
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal de rutas
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Rutas protegidas */}
      <Route 
        path="/editor" 
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } 
      />

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/editor" replace />} />
      
      {/* Ruta 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-nanoBlue-500 mb-4">404</h1>
              <p className="text-slate-400 mb-6">Página no encontrada</p>
              <button 
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Volver
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// Componente principal de la aplicación
function App() {
  return (
    <AuthProvider>
      <ToolProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </ToolProvider>
    </AuthProvider>
  );
}

export default App;