import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTool, FiType, FiFileText, FiCode, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const ToolModal = ({ isOpen, onClose, tool = null, onToolSaved }) => {
  const [formData, setFormData] = useState({
    icon: '',
    name: '',
    description: '',
    base_prompt: '',
    custom_config: {},
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  const [showConfigPreview, setShowConfigPreview] = useState(false);

  const isEditing = !!tool;

  // Configuración de ejemplo para nuevas herramientas
  const exampleConfig = {
    options: [
      {
        name: 'ejemplo',
        type: 'select',
        prompt: 'con estilo \\{\\{ choice \\}\\}',
        choices: ['opcion1', 'opcion2', 'opcion3']
      }
    ]
  };

  useEffect(() => {
    if (tool) {
      const config = typeof tool.custom_config === 'string' 
        ? JSON.parse(tool.custom_config) 
        : tool.custom_config;
      
      setFormData({
        icon: tool.icon || '',
        name: tool.name || '',
        description: tool.description || '',
        base_prompt: tool.base_prompt || '',
        custom_config: config,
        is_active: tool.is_active !== undefined ? tool.is_active : true
      });
      setConfigText(JSON.stringify(config, null, 2));
    } else {
      setFormData({
        icon: '',
        name: '',
        description: '',
        base_prompt: '',
        custom_config: exampleConfig,
        is_active: true
      });
      setConfigText(JSON.stringify(exampleConfig, null, 2));
    }
    setErrors({});
    setConfigError('');
  }, [tool, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.icon.trim()) {
      newErrors.icon = 'El icono es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.base_prompt.trim()) {
      newErrors.base_prompt = 'El prompt base es requerido';
    }

    // Validar JSON de configuración
    try {
      const parsedConfig = JSON.parse(configText);
      if (!parsedConfig.options || !Array.isArray(parsedConfig.options)) {
        newErrors.custom_config = 'La configuración debe tener un array de opciones';
      }
    } catch (error) {
      newErrors.custom_config = 'JSON de configuración inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfigChange = (value) => {
    setConfigText(value);
    setConfigError('');
    
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        custom_config: parsed
      }));
    } catch (error) {
      setConfigError('JSON inválido: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      
      const toolData = {
        ...formData,
        is_active: formData.is_active ? true : false,
        custom_config: JSON.parse(configText)
      };
      
      if (isEditing) {
        response = await adminAPI.updateTool(tool.id, toolData);
      } else {
        response = await adminAPI.createTool(toolData);
      }

      if (response.data.success) {
        toast.success(isEditing ? 'Herramienta actualizada exitosamente' : 'Herramienta creada exitosamente');
        onToolSaved();
        onClose();
      } else {
        toast.error(response.data.message || 'Error al guardar herramienta');
      }
    } catch (error) {
      console.error('Error saving tool:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar herramienta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const insertExample = (type) => {
    let example = '';
    switch (type) {
      case 'select':
        example = `{
  "name": "estilo",
  "type": "select",
  "prompt": "con estilo \\\\{\\\\{ choice \\\\}\\\\}",
  "choices": ["natural", "dramático", "vintage"]
}`;
        break;
      case 'color':
        example = `{
  "name": "color",
  "type": "color",
  "prompt": "de color \\\\{\\\\{ color \\\\}\\\\}",
  "choices": ["rojo", "azul", "verde"]
}`;
        break;
      case 'text':
        example = `{
  "name": "detalle",
  "type": "text",
  "prompt": "con detalle \\\\{\\\\{ value \\\\}\\\\}"
}`;
        break;
      case 'range':
        example = `{
  "name": "intensidad",
  "type": "range",
  "prompt": "con intensidad \\\\{\\\\{ value \\\\}\\\\}",
  "min": 1,
  "max": 10,
  "default": 5
}`;
        break;
    }
    
    // Insertar en la posición del cursor o al final
    const textarea = document.getElementById('config-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = configText.substring(0, start) + example + configText.substring(end);
    setConfigText(newText);
    handleConfigChange(newText);
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
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Editar Herramienta' : 'Crear Herramienta'}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Información Básica</h4>
                    
                    {/* Icon */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <FiTool className="inline w-4 h-4 mr-2" />
                        Icono (react-icons/fi)
                      </label>
                      <input
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className={`input-primary w-full ${errors.icon ? 'border-red-500' : ''}`}
                        placeholder="paintbrush, scissors, wand, etc."
                      />
                      {errors.icon && (
                        <p className="text-red-400 text-sm mt-1">{errors.icon}</p>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <FiType className="inline w-4 h-4 mr-2" />
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`input-primary w-full ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Cambiar Color"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <FiFileText className="inline w-4 h-4 mr-2" />
                        Descripción
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className={`input-primary w-full ${errors.description ? 'border-red-500' : ''}`}
                        placeholder="Permite cambiar el color de elementos específicos en la imagen"
                      />
                      {errors.description && (
                        <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                      )}
                    </div>

                    {/* Base Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        <FiCode className="inline w-4 h-4 mr-2" />
                        Prompt Base
                      </label>
                      <textarea
                        name="base_prompt"
                        value={formData.base_prompt}
                        onChange={handleInputChange}
                        rows="3"
                        className={`input-primary w-full ${errors.base_prompt ? 'border-red-500' : ''}`}
                        placeholder="cambiar el color de &#123;&#123; options &#125;&#125;"
                      />
                      {errors.base_prompt && (
                        <p className="text-red-400 text-sm mt-1">{errors.base_prompt}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Use placeholders como {`{{ options }}`} que serán reemplazados por la configuración
                      </p>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-nanoBlue-500 bg-slate-700 border-slate-600 rounded focus:ring-nanoBlue-500"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
                        Herramienta activa
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">Configuración JSON</h4>
                      <button
                        type="button"
                        onClick={() => setShowConfigPreview(!showConfigPreview)}
                        className="text-sm text-nanoBlue-400 hover:text-nanoBlue-300 flex items-center space-x-1"
                      >
                        {showConfigPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        <span>{showConfigPreview ? 'Ocultar' : 'Vista Previa'}</span>
                      </button>
                    </div>

                    {/* Quick Insert Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => insertExample('select')}
                        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        + Select
                      </button>
                      <button
                        type="button"
                        onClick={() => insertExample('color')}
                        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        + Color
                      </button>
                      <button
                        type="button"
                        onClick={() => insertExample('text')}
                        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        + Text
                      </button>
                      <button
                        type="button"
                        onClick={() => insertExample('range')}
                        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        + Range
                      </button>
                    </div>

                    {/* JSON Editor */}
                    <div>
                      <textarea
                        id="config-textarea"
                        value={configText}
                        onChange={(e) => handleConfigChange(e.target.value)}
                        rows="12"
                        className={`input-primary w-full font-mono text-sm ${
                          errors.custom_config || configError ? 'border-red-500' : 
                          configError === '' && configText ? 'border-green-500' : ''
                        }`}
                        placeholder="Configuración JSON de la herramienta"
                      />
                      {(errors.custom_config || configError) && (
                        <div className="flex items-center space-x-2 mt-1">
                          <FiAlertCircle className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 text-sm">{errors.custom_config || configError}</p>
                        </div>
                      )}
                      {!configError && configText && !errors.custom_config && (
                        <div className="flex items-center space-x-2 mt-1">
                          <FiCheck className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 text-sm">JSON válido</p>
                        </div>
                      )}
                    </div>

                    {/* Preview */}
                    {showConfigPreview && !configError && (
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <h5 className="text-sm font-medium text-slate-300 mb-2">Vista Previa:</h5>
                        <pre className="text-xs text-slate-400 overflow-x-auto">
                          {JSON.stringify(formData.custom_config, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || configError}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ToolModal;
