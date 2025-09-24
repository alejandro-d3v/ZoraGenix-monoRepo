import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiTool, FiCheck, FiSearch } from 'react-icons/fi';
import { adminAPI, toolAPI } from '../services/api';
import toast from 'react-hot-toast';

const RoleToolsModal = ({ isOpen, onClose, role = null, onRoleUpdated }) => {
  const [availableTools, setAvailableTools] = useState([]);
  const [assignedTools, setAssignedTools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && role) {
      loadToolsData();
    }
  }, [isOpen, role]);

  const loadToolsData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar todas las herramientas disponibles
      const toolsResponse = await toolAPI.getAllTools();
      if (toolsResponse.data.success) {
        setAvailableTools(toolsResponse.data.data.tools);
      }

      // Cargar herramientas asignadas al rol (si existe)
      if (role?.tools) {
        setAssignedTools(role.tools.map(t => t.id));
      } else {
        setAssignedTools([]);
      }
    } catch (error) {
      console.error('Error loading tools data:', error);
      toast.error('Error cargando herramientas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolToggle = (toolId) => {
    setAssignedTools(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleSave = async () => {
    if (!role) return;
    
    setIsLoading(true);
    
    try {
      const response = await adminAPI.assignToolsToRole(role.id, assignedTools);
      
      if (response.data.success) {
        toast.success('Herramientas asignadas exitosamente');
        onRoleUpdated();
        onClose();
      } else {
        toast.error(response.data.message || 'Error al asignar herramientas');
      }
    } catch (error) {
      console.error('Error assigning tools:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al asignar herramientas');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedCount = assignedTools.length;
  const totalCount = availableTools.length;

  return (
    <AnimatePresence>
      {isOpen && role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-nanoBlue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Asignar Herramientas</h3>
                  <p className="text-sm text-slate-400">Rol: {role.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Stats */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Herramientas asignadas</p>
                  <p className="text-2xl font-bold text-nanoBlue-400">
                    {assignedCount} / {totalCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Porcentaje</p>
                  <p className="text-2xl font-bold text-white">
                    {totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-slate-700">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-primary pl-10 w-full"
                />
              </div>
            </div>

            {/* Tools List */}
            <div className="overflow-y-auto max-h-96 p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-nanoBlue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-400">Cargando herramientas...</p>
                </div>
              ) : filteredTools.length === 0 ? (
                <div className="text-center py-8">
                  <FiTool className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {searchTerm ? 'No se encontraron herramientas' : 'No hay herramientas disponibles'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTools.map(tool => {
                    const isAssigned = assignedTools.includes(tool.id);
                    
                    return (
                      <div
                        key={tool.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          isAssigned
                            ? 'bg-nanoBlue-500/10 border-nanoBlue-500/30 hover:bg-nanoBlue-500/20'
                            : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50'
                        }`}
                        onClick={() => handleToolToggle(tool.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isAssigned ? 'bg-nanoBlue-500/20' : 'bg-slate-700'
                              }`}>
                                <FiTool className={`w-4 h-4 ${
                                  isAssigned ? 'text-nanoBlue-400' : 'text-slate-400'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{tool.name}</h4>
                                <p className="text-xs text-slate-500">ID: {tool.id}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">
                              {tool.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs">
                              <span className={`px-2 py-1 rounded ${
                                tool.is_active 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {tool.is_active ? 'Activa' : 'Inactiva'}
                              </span>
                              <span className="text-slate-500">
                                Creada: {new Date(tool.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isAssigned
                              ? 'bg-nanoBlue-500 border-nanoBlue-500'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}>
                            {isAssigned && <FiCheck className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 p-6 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : 'Guardar Asignaciones'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoleToolsModal;
