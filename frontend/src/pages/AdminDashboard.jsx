import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiImage, 
  FiSettings, 
  FiTool, 
  // FiBarChart3,
  FiShield,
  FiKey,
  FiDatabase,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, toolAPI } from '../services/api';
import clsx from 'clsx';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [images, setImages] = useState([]);
  const [tools, setTools] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar estadísticas (dashboard)
      const statsResponse = await adminAPI.getDashboard();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data.stats);
      }

      // Cargar usuarios
      const usersResponse = await adminAPI.getAllUsers();
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data.users);
      }

      // Cargar imágenes
      const imagesResponse = await adminAPI.getAllImages();
      if (imagesResponse.data.success) {
        setImages(imagesResponse.data.data.images);
      }

      // Cargar herramientas
      const toolsResponse = await toolAPI.getAllTools();
      if (toolsResponse.data.success) {
        setTools(toolsResponse.data.data.tools);
      }

      // Cargar configuración
      const configResponse = await adminAPI.getSystemConfig();
      if (configResponse.data.success) {
        setSystemConfig(configResponse.data.data.config);
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: FiUsers },
    { id: 'users', name: 'Usuarios', icon: FiUsers },
    { id: 'images', name: 'Imágenes', icon: FiImage },
    { id: 'tools', name: 'Herramientas', icon: FiTool },
    { id: 'config', name: 'Configuración', icon: FiSettings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
              <p className="text-slate-400">Usuarios Totales</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total_images || 0}</p>
              <p className="text-slate-400">Imágenes Generadas</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FiTool className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total_tools || 0}</p>
              <p className="text-slate-400">Herramientas Activas</p>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total_quota_used || 0}</p>
              <p className="text-slate-400">Créditos Usados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-lg font-bold text-white mb-4">Usuarios Recientes</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-nanoBlue-400">{user.quota_remaining} créditos</p>
                  <p className="text-xs text-slate-400">{user.role_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-bold text-white mb-4">Imágenes Recientes</h3>
          <div className="space-y-3">
            {images.slice(0, 5).map(image => (
              <div key={image.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <img 
                  src={image.image_url} 
                  alt="Imagen generada" 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{image.tool_name}</p>
                  <p className="text-sm text-slate-400 truncate">{image.original_prompt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{new Date(image.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Gestión de Usuarios</h3>
        <button className="btn-primary flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Créditos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Imágenes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role_name === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.quota_remaining} / {user.quota_used + user.quota_remaining}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.quota_used}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-nanoBlue-400 hover:text-nanoBlue-300">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Todas las Imágenes</h3>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Buscar imágenes..." 
            className="input-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map(image => (
          <div key={image.id} className="image-card group">
            <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative">
              <img
                src={image.image_url}
                alt={image.original_prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex space-x-2">
                  <button className="w-8 h-8 bg-nanoBlue-500 rounded-full flex items-center justify-center">
                    <FiEye className="w-4 h-4 text-white" />
                  </button>
                  <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <FiTrash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                {image.original_prompt}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{image.tool_name}</span>
                <span>{new Date(image.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Gestión de Herramientas</h3>
        <button className="btn-primary flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Nueva Herramienta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <div key={tool.id} className="card-glass p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{tool.name}</h4>
                <p className="text-sm text-slate-400">{tool.description}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-yellow-400 hover:text-yellow-300">
                  <FiEdit className="w-4 h-4" />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Estado:</span>
                <span className={`font-medium ${tool.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {tool.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Usos:</span>
                <span className="text-white">{tool.usage_count || 0}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Prompt base:</p>
              <p className="text-xs text-slate-300 font-mono line-clamp-3">
                {tool.base_prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Configuración del Sistema</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiKey className="w-5 h-5 text-nanoBlue-400" />
            <h4 className="text-lg font-bold text-white">API de Nano-Banana</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={systemConfig.nano_api_key || ''}
                onChange={(e) => setSystemConfig(prev => ({
                  ...prev,
                  nano_api_key: e.target.value
                }))}
                placeholder="Ingresa tu API Key de Nano-Banana"
                className="input-primary w-full"
              />
            </div>
            
            <button className="btn-primary w-full">
              Guardar API Key
            </button>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiDatabase className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-bold text-white">Configuración General</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cuota por defecto para nuevos usuarios
              </label>
              <input
                type="number"
                value={systemConfig.default_quota || 5}
                onChange={(e) => setSystemConfig(prev => ({
                  ...prev,
                  default_quota: parseInt(e.target.value)
                }))}
                className="input-primary w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Máximo de imágenes por solicitud
              </label>
              <input
                type="number"
                value={systemConfig.max_images_per_request || 5}
                onChange={(e) => setSystemConfig(prev => ({
                  ...prev,
                  max_images_per_request: parseInt(e.target.value)
                }))}
                className="input-primary w-full"
              />
            </div>
            
            <button className="btn-primary w-full">
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando panel de administración..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="navbar-glass sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/editor" className="btn-ghost">
                ← Volver al Editor
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <div className="flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-red-400" />
                <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-red-400">Administrador</p>
              </div>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-nanoBlue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'images' && renderImages()}
          {activeTab === 'tools' && renderTools()}
          {activeTab === 'config' && renderConfig()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;