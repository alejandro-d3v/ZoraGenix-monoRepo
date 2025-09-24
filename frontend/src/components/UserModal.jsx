import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock, FiShield, FiImage } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, user = null, onUserSaved, roles = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: 2, // Default to user role
    quota: 5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        roleId: user.role_id || 2,
        quota: user.quota_remaining || 5
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        roleId: 2,
        quota: 5
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.quota < 0) {
      newErrors.quota = 'La cuota no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      
      if (isEditing) {
        // Update user
        const updateData = {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
          quota: formData.quota
        };
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        response = await adminAPI.updateUser(user.id, updateData);
      } else {
        // Create user
        response = await adminAPI.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId
        });
        
        // Update quota if different from default
        if (formData.quota !== 5) {
          await adminAPI.updateUserQuota(response.data.data.user.id, formData.quota);
        }
      }

      if (response.data.success) {
        toast.success(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        onUserSaved();
        onClose();
      } else {
        toast.error(response.data.message || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar usuario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roleId' || name === 'quota' ? parseInt(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 rounded-xl shadow-2xl border border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiUser className="inline w-4 h-4 mr-2" />
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input-primary w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Nombre completo"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-primary w-full ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiLock className="inline w-4 h-4 mr-2" />
                  {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-primary w-full ${errors.password ? 'border-red-500' : ''}`}
                  placeholder={isEditing ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiShield className="inline w-4 h-4 mr-2" />
                  Rol
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className="input-primary w-full"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quota */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FiImage className="inline w-4 h-4 mr-2" />
                  Cuota de Imágenes
                </label>
                <input
                  type="number"
                  name="quota"
                  value={formData.quota}
                  onChange={handleInputChange}
                  min="0"
                  className={`input-primary w-full ${errors.quota ? 'border-red-500' : ''}`}
                  placeholder="5"
                />
                {errors.quota && (
                  <p className="text-red-400 text-sm mt-1">{errors.quota}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;
