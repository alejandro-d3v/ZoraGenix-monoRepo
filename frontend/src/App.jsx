import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToolProvider } from './context/ToolContext';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';

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

// Componente de ruta protegida para admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permisos..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role_name !== 'admin') {
    return <Navigate to="/editor" replace />;
  }

  return children;
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
            <Editor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
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