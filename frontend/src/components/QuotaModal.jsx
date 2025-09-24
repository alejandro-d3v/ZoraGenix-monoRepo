import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiPlus, FiMinus } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const QuotaModal = ({ isOpen, onClose, user = null, onQuotaUpdated }) => {
  const [quota, setQuota] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState('set'); // 'set', 'add', 'subtract'

  useEffect(() => {
    if (user) {
      setQuota(user.quota_remaining || 0);
      setOperation('set');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let finalQuota = quota;
      
      if (operation === 'add') {
        finalQuota = user.quota_remaining + quota;
      } else if (operation === 'subtract') {
        finalQuota = Math.max(0, user.quota_remaining - quota);
      }
      
      const response = await adminAPI.updateUserQuota(user.id, finalQuota);

      if (response.data.success) {
        toast.success('Cuota actualizada exitosamente');
        onQuotaUpdated();
        onClose();
      } else {
        toast.error(response.data.message || 'Error al actualizar cuota');
      }
    } catch (error) {
      console.error('Error updating quota:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar cuota');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewQuota = () => {
    if (!user) return 0;
    
    switch (operation) {
      case 'add':
        return user.quota_remaining + quota;
      case 'subtract':
        return Math.max(0, user.quota_remaining - quota);
      default:
        return quota;
    }
  };

  const quickActions = [
    { label: '+5', value: 5, op: 'add' },
    { label: '+10', value: 10, op: 'add' },
    { label: '+25', value: 25, op: 'add' },
    { label: '-5', value: 5, op: 'subtract' },
    { label: 'Reset', value: 5, op: 'set' },
  ];

  return (
    <AnimatePresence>
      {isOpen && user && (
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
              <div>
                <h3 className="text-xl font-bold text-white">Modificar Cuota</h3>
                <p className="text-sm text-slate-400">{user.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Current Status */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Cuota Actual</p>
                  <p className="text-2xl font-bold text-white">{user.quota_remaining}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Nueva Cuota</p>
                  <p className="text-2xl font-bold text-nanoBlue-400">{getPreviewQuota()}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Operation Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperation('set')}
                    className={`p-3 rounded-lg border transition-colors ${
                      operation === 'set'
                        ? 'bg-nanoBlue-500 border-nanoBlue-400 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <FiImage className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Establecer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('add')}
                    className={`p-3 rounded-lg border transition-colors ${
                      operation === 'add'
                        ? 'bg-green-500 border-green-400 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <FiPlus className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Agregar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation('subtract')}
                    className={`p-3 rounded-lg border transition-colors ${
                      operation === 'subtract'
                        ? 'bg-red-500 border-red-400 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <FiMinus className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Restar</span>
                  </button>
                </div>
              </div>

              {/* Quota Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {operation === 'set' ? 'Nueva Cuota' : 
                   operation === 'add' ? 'Cantidad a Agregar' : 'Cantidad a Restar'}
                </label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="input-primary w-full text-center text-xl"
                  placeholder="0"
                />
              </div>

              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Acciones Rápidas
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setOperation(action.op);
                        setQuota(action.value);
                      }}
                      className="p-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Resultado:</span>
                  <span className="text-white font-medium">
                    {user.quota_remaining} → {getPreviewQuota()} imágenes
                  </span>
                </div>
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
                  {isLoading ? 'Actualizando...' : 'Actualizar Cuota'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotaModal;
