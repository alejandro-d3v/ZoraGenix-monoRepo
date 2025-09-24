import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiImage, 
  FiSettings, 
  FiTool, 
  FiShield,
  FiKey,
  FiDatabase,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiDollarSign
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, toolAPI } from '../services/api';
import clsx from 'clsx';
import LoadingSpinner from '../components/LoadingSpinner';
import UserModal from '../components/UserModal';
import QuotaModal from '../components/QuotaModal';
import ConfirmModal from '../components/ConfirmModal';
import ToolModal from '../components/ToolModal';
import RoleToolsModal from '../components/RoleToolsModal';
import RoleModal from '../components/RoleModal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [images, setImages] = useState([]);
  const [tools, setTools] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [userModal, setUserModal] = useState({ isOpen: false, user: null });
  const [quotaModal, setQuotaModal] = useState({ isOpen: false, user: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, action: null });
  const [toolModal, setToolModal] = useState({ isOpen: false, tool: null });
  const [roleToolsModal, setRoleToolsModal] = useState({ isOpen: false, role: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, role: null });
  
  // User management states
  const [roles, setRoles] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'admin', 'user'

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

      // Cargar roles
      const rolesResponse = await adminAPI.getAllRoles();
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.data.roles);
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // User management functions
  const handleCreateUser = () => {
    setUserModal({ isOpen: true, user: null });
  };

  const handleEditUser = (user) => {
    setUserModal({ isOpen: true, user });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'delete'
    });
  };

  const handleModifyQuota = (user) => {
    setQuotaModal({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    if (!confirmModal.user) return;
    
    try {
      let response;
      if (confirmModal.action === 'deleteTool') {
        response = await adminAPI.deleteTool(confirmModal.user.id);
        if (response.data.success) {
          toast.success('Herramienta eliminada exitosamente');
          setTools(tools.filter(t => t.id !== confirmModal.user.id));
        }
      } else if (confirmModal.action === 'deleteRole') {
        response = await adminAPI.deleteRole(confirmModal.user.id);
        if (response.data.success) {
          toast.success('Rol eliminado exitosamente');
          setRoles(roles.filter(r => r.id !== confirmModal.user.id));
        }
      } else {
        response = await adminAPI.deleteUser(confirmModal.user.id);
        if (response.data.success) {
          toast.success('Usuario eliminado exitosamente');
          setUsers(users.filter(u => u.id !== confirmModal.user.id));
        }
      }
      
      if (response.data.success) {
        setConfirmModal({ isOpen: false, user: null, action: null });
      } else {
        toast.error(response.data.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleUserSaved = () => {
    // Reload users data
    loadDashboardData();
  };

  const handleQuotaUpdated = () => {
    // Reload users data
    loadDashboardData();
  };

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesFilter = userFilter === 'all' || user.role_name === userFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Tool management functions
  const handleCreateTool = () => {
    setToolModal({ isOpen: true, tool: null });
  };

  const handleEditTool = (tool) => {
    setToolModal({ isOpen: true, tool });
  };

  const handleDeleteTool = (tool) => {
    setConfirmModal({
      isOpen: true,
      user: tool, // Reutilizamos la estructura pero con tool
      action: 'deleteTool'
    });
  };

  const handleToggleTool = async (tool) => {
    try {
      const response = await adminAPI.toggleTool(tool.id);
      if (response.data.success) {
        toast.success(`Herramienta ${response.data.data.tool.is_active ? 'activada' : 'desactivada'} exitosamente`);
        // Actualizar la herramienta en la lista local
        setTools(tools.map(t => 
          t.id === tool.id 
            ? { ...t, is_active: response.data.data.tool.is_active }
            : t
        ));
      } else {
        toast.error(response.data.message || 'Error al cambiar estado de herramienta');
      }
    } catch (error) {
      console.error('Error toggling tool:', error);
      toast.error('Error al cambiar estado de herramienta');
    }
  };

  const confirmDeleteTool = async () => {
    if (!confirmModal.user) return; // user contiene el tool
    
    try {
      const response = await adminAPI.deleteTool(confirmModal.user.id);
      if (response.data.success) {
        toast.success('Herramienta eliminada exitosamente');
        setTools(tools.filter(t => t.id !== confirmModal.user.id));
        setConfirmModal({ isOpen: false, user: null, action: null });
      } else {
        toast.error(response.data.message || 'Error al eliminar herramienta');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Error al eliminar herramienta');
    }
  };

  const handleToolSaved = () => {
    // Reload tools data
    loadDashboardData();
  };

  const handleManageRoleTools = (role) => {
    setRoleToolsModal({ isOpen: true, role });
  };

  const handleRoleUpdated = () => {
    // Reload roles data
    loadDashboardData();
  };

  // Role CRUD functions
  const handleCreateRole = () => {
    setRoleModal({ isOpen: true, role: null });
  };

  const handleEditRole = (role) => {
    setRoleModal({ isOpen: true, role });
  };

  const handleDeleteRole = (role) => {
    setConfirmModal({
      isOpen: true,
      user: role, // Reutilizamos la estructura pero con role
      action: 'deleteRole'
    });
  };

  const handleRoleSaved = () => {
    // Reload roles data
    loadDashboardData();
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: FiUsers },
    { id: 'users', name: 'Usuarios', icon: FiUsers },
    { id: 'images', name: 'Imágenes', icon: FiImage },
    { id: 'tools', name: 'Herramientas', icon: FiTool },
    { id: 'roles', name: 'Roles', icon: FiShield },
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
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold text-white">Gestión de Usuarios</h3>
        <button 
          onClick={handleCreateUser}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="input-primary pl-10 w-full"
          />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="input-primary pl-10 pr-8"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cuota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    {userSearch || userFilter !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
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
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {user.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white font-medium">{user.quota_remaining}</span>
                        <span className="text-xs text-slate-400">imágenes</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleModifyQuota(user)}
                          className="text-nanoBlue-400 hover:text-nanoBlue-300 transition-colors"
                          title="Modificar cuota"
                        >
                          <FiDollarSign className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Editar usuario"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        {authUser && user.id !== authUser.id && (
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Eliminar usuario"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-glass p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{filteredUsers.length}</p>
            <p className="text-sm text-slate-400">Usuarios mostrados</p>
          </div>
        </div>
        <div className="card-glass p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-nanoBlue-400">
              {filteredUsers.reduce((sum, user) => sum + (user.quota_remaining || 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Cuota total disponible</p>
          </div>
        </div>
        <div className="card-glass p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {filteredUsers.filter(user => user.role_name === 'admin').length}
            </p>
            <p className="text-sm text-slate-400">Administradores</p>
          </div>
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
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold text-white">Gestión de Herramientas</h3>
        <button 
          onClick={handleCreateTool}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nueva Herramienta</span>
        </button>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiTool className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No hay herramientas creadas</p>
            <p className="text-slate-500 text-sm">Crea tu primera herramienta para comenzar</p>
          </div>
        ) : (
          tools.map(tool => (
            <div key={tool.id} className="card-glass p-6 relative">
              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleToggleTool(tool)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    tool.is_active 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                  title={tool.is_active ? 'Desactivar herramienta' : 'Activar herramienta'}
                >
                  {tool.is_active ? '●' : '○'}
                </button>
              </div>

              {/* Tool info */}
              <div className="mb-4 pr-12">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-nanoBlue-500/20 rounded-lg flex items-center justify-center">
                    <FiTool className="w-5 h-5 text-nanoBlue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{tool.name}</h4>
                    <p className="text-xs text-slate-500">ID: {tool.id}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{tool.description}</p>
              </div>
              
              {/* Tool stats */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado:</span>
                  <span className={`font-medium ${tool.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {tool.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Icono:</span>
                  <span className="text-white font-mono text-xs">{tool.icon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Creada:</span>
                  <span className="text-white text-xs">{new Date(tool.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Prompt preview */}
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Prompt base:</p>
                <p className="text-xs text-slate-300 font-mono line-clamp-2">
                  {tool.base_prompt}
                </p>
              </div>

              {/* Config preview */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Configuración:</p>
                <div className="text-xs text-slate-300">
                  {(() => {
                    try {
                      const config = typeof tool.custom_config === 'string' 
                        ? JSON.parse(tool.custom_config) 
                        : tool.custom_config;
                      const optionsCount = config?.options?.length || 0;
                      return `${optionsCount} opciones configuradas`;
                    } catch {
                      return 'Configuración inválida';
                    }
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditTool(tool)}
                  className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FiEdit className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
                <button 
                  onClick={() => handleDeleteTool(tool)}
                  className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {tools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{tools.length}</p>
              <p className="text-sm text-slate-400">Total herramientas</p>
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {tools.filter(tool => tool.is_active).length}
              </p>
              <p className="text-sm text-slate-400">Herramientas activas</p>
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {tools.filter(tool => !tool.is_active).length}
              </p>
              <p className="text-sm text-slate-400">Herramientas inactivas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold text-white">Gestión de Roles</h3>
        <button 
          onClick={handleCreateRole}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nuevo Rol</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiShield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No hay roles creados</p>
            <p className="text-slate-500 text-sm">Crea tu primer rol personalizado</p>
          </div>
        ) : (
          roles.map(role => (
            <div key={role.id} className="card-glass p-6 relative">
              {/* Actions menu */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditRole(role)}
                  className="w-8 h-8 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg flex items-center justify-center transition-colors"
                  title="Editar rol"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                {!['admin', 'user'].includes(role.name) && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="w-8 h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                    title="Eliminar rol"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-start justify-between mb-4 pr-20">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    role.name === 'admin' 
                      ? 'bg-red-500/20' 
                      : 'bg-green-500/20'
                  }`}>
                    <FiShield className={`w-6 h-6 ${
                      role.name === 'admin' ? 'text-red-400' : 'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white capitalize">{role.name}</h4>
                    <p className="text-xs text-slate-500">ID: {role.id}</p>
                    <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                  </div>
                </div>
              </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Herramientas asignadas:</span>
                <span className="text-white font-medium">
                  {role.tools ? role.tools.length : 0} / {tools.length}
                </span>
              </div>
              
              {role.tools && role.tools.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.tools.slice(0, 3).map(tool => (
                    <span
                      key={tool.id}
                      className="px-2 py-1 text-xs bg-nanoBlue-500/20 text-nanoBlue-400 rounded"
                    >
                      {tool.name}
                    </span>
                  ))}
                  {role.tools.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded">
                      +{role.tools.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </div>

              <button
                onClick={() => handleManageRoleTools(role)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <FiTool className="w-4 h-4" />
                <span>Gestionar Herramientas</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-glass p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{roles.length}</p>
            <p className="text-sm text-slate-400">Roles totales</p>
          </div>
        </div>
        <div className="card-glass p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-nanoBlue-400">
              {roles.reduce((sum, role) => sum + (role.tools ? role.tools.length : 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Asignaciones totales</p>
          </div>
        </div>
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
                <p className="text-sm font-medium text-white">{authUser?.name}</p>
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
          {activeTab === 'roles' && renderRoles()}
          {activeTab === 'config' && renderConfig()}
        </div>

        {/* Modals */}
        <UserModal
          isOpen={userModal.isOpen}
          onClose={() => setUserModal({ isOpen: false, user: null })}
          user={userModal.user}
          onUserSaved={handleUserSaved}
          roles={roles}
        />
        <QuotaModal
          isOpen={quotaModal.isOpen}
          onClose={() => setQuotaModal({ isOpen: false, user: null })}
          user={quotaModal.user}
          onQuotaUpdated={handleQuotaUpdated}
        />
        <ToolModal
          isOpen={toolModal.isOpen}
          onClose={() => setToolModal({ isOpen: false, tool: null })}
          tool={toolModal.tool}
          onToolSaved={handleToolSaved}
        />
        <RoleToolsModal
          isOpen={roleToolsModal.isOpen}
          onClose={() => setRoleToolsModal({ isOpen: false, role: null })}
          role={roleToolsModal.role}
          onRoleUpdated={handleRoleUpdated}
        />
        <RoleModal
          isOpen={roleModal.isOpen}
          onClose={() => setRoleModal({ isOpen: false, role: null })}
          role={roleModal.role}
          onRoleSaved={handleRoleSaved}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
          onConfirm={confirmDeleteUser}
          title={
            confirmModal.action === 'deleteTool' ? 'Eliminar Herramienta' :
            confirmModal.action === 'deleteRole' ? 'Eliminar Rol' :
            'Eliminar Usuario'
          }
          message={
            confirmModal.action === 'deleteTool' 
              ? `¿Seguro que deseas eliminar la herramienta "${confirmModal.user?.name || ''}"? Esta acción no se puede deshacer.`
              : confirmModal.action === 'deleteRole'
              ? `¿Seguro que deseas eliminar el rol "${confirmModal.user?.name || ''}"? Esta acción no se puede deshacer y afectará a todos los usuarios con este rol.`
              : `¿Seguro que deseas eliminar al usuario "${confirmModal.user?.name || ''}"? Esta acción no se puede deshacer.`
          }
          confirmText="Eliminar"
          type="danger"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;