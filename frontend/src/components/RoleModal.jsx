import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiSave, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const RoleModal = ({ isOpen, onClose, role = null, onRoleSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!role;

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras, números, guiones y guiones bajos';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del rol es requerida';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.trim().length > 255) {
      newErrors.description = 'La descripción no puede exceder 255 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim().toLowerCase(),
        description: formData.description.trim()
      };

      let response;
      if (isEditing) {
        response = await adminAPI.updateRole(role.id, payload);
        toast.success('Rol actualizado exitosamente');
      } else {
        response = await adminAPI.createRole(payload);
        toast.success('Rol creado exitosamente');
      }

      if (response.data.success) {
        onRoleSaved();
        onClose();
      } else {
        toast.error(response.data.message || 'Error al guardar el rol');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar el rol');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-nanoBlue-400" />
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nombre del rol */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-primary w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="ej: moderator, editor, viewer"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Solo letras, números, guiones y guiones bajos. Se convertirá a minúsculas.
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`input-primary w-full ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe las responsabilidades y permisos de este rol..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Entre 10 y 255 caracteres
                </p>
              </div>

              {/* Información adicional para edición */}
              {isEditing && role && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Información del Rol</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p><span className="font-medium">ID:</span> {role.id}</p>
                    <p><span className="font-medium">Creado:</span> {new Date(role.created_at).toLocaleDateString()}</p>
                    {role.tools && (
                      <p><span className="font-medium">Herramientas asignadas:</span> {role.tools.length}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Advertencia para roles del sistema */}
              {isEditing && role && ['admin', 'user'].includes(role.name) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">Rol del Sistema</p>
                      <p className="text-yellow-300 text-xs mt-1">
                        Este es un rol del sistema. Ten cuidado al modificarlo ya que puede afectar el funcionamiento de la aplicación.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      <span>{isEditing ? 'Actualizar' : 'Crear'} Rol</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoleModal;
