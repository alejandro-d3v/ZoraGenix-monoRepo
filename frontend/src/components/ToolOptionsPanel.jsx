import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import clsx from 'clsx';
import { useTool } from '../context/ToolContext';

const ToolOptionsPanel = ({ className = '', compact = false }) => {
  const { 
    selectedTools, 
    selectedOptions, 
    updateToolOptions, 
    getToolOptions,
    buildCombinedPrompt,
    generatedPrompt,
    getOptionsForTool
  } = useTool();

  const [expandedTools, setExpandedTools] = useState({});
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Auto-expandir herramientas cuando se seleccionan
  useEffect(() => {
    const newExpanded = {};
    selectedTools.forEach(tool => {
      newExpanded[tool.id] = true;
    });
    setExpandedTools(newExpanded);
  }, [selectedTools]);

  // Toggle expansión de herramienta
  const toggleExpanded = (toolId) => {
    setExpandedTools(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  // Manejar cambio de opción
  const handleOptionChange = (toolId, optionKey, value) => {
    const currentOptions = getOptionsForTool(toolId);
    const newOptions = {
      ...currentOptions,
      [optionKey]: value
    };
    updateToolOptions(toolId, newOptions);
  };

  // Generar prompt combinado
  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      await buildCombinedPrompt();
    } catch (error) {
      console.error('Error generando prompt:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Renderizar campo de opción según su tipo
  const renderOptionField = (tool, option) => {
    const value = getOptionsForTool(tool.id)[option.key] || option.default || '';

    switch (option.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
            className="input-primary w-full"
          >
            <option value="">Seleccionar...</option>
            {option.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="flex space-x-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
              className="w-12 h-10 rounded border border-slate-600 bg-slate-800"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
              placeholder="#000000"
              className="input-primary flex-1"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={option.min || 0}
              max={option.max || 100}
              step={option.step || 1}
              value={value}
              onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{option.min || 0}</span>
              <span className="text-nanoBlue-400 font-medium">{value}</span>
              <span>{option.max || 100}</span>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleOptionChange(tool.id, option.key, e.target.checked)}
              className="w-5 h-5 text-nanoBlue-500 bg-slate-800 border-slate-600 rounded focus:ring-nanoBlue-500"
            />
            <span className="text-slate-300">{option.label}</span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
            placeholder={option.placeholder}
            rows={3}
            className="input-primary w-full resize-none"
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleOptionChange(tool.id, option.key, e.target.value)}
            placeholder={option.placeholder}
            className="input-primary w-full"
          />
        );
    }
  };

  if (selectedTools.length === 0) {
    return null;
  }

  return (
    <div className={clsx(compact ? 'space-y-4' : 'space-y-6', className)}>
      {/* Header - Solo mostrar en modo no compacto */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-nanoBlue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Configuración de Herramientas
              </h3>
              <p className="text-sm text-slate-400">
                Ajusta las opciones para cada herramienta seleccionada
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Opciones por herramienta */}
      <div className="space-y-4">
        {selectedTools.map((tool, index) => {
          const toolOptions = getToolOptions(tool);
          const isExpanded = expandedTools[tool.id];
          const hasOptions = toolOptions.length > 0;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
            >
              {/* Header de herramienta */}
              <button
                onClick={() => toggleExpanded(tool.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-nanoBlue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="text-left">
                    <h4 className="font-medium text-white">{tool.name}</h4>
                    <p className="text-xs text-slate-400">
                      {hasOptions ? `${toolOptions.length} opciones` : 'Sin opciones configurables'}
                    </p>
                  </div>
                </div>
                
                {hasOptions && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Ocultar' : 'Mostrar'}
                    </span>
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>

              {/* Opciones expandibles */}
              <AnimatePresence>
                {isExpanded && hasOptions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-700"
                  >
                    <div className="p-4 space-y-4">
                      {toolOptions.map((option) => (
                        <div key={option.key} className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300">
                            {option.label}
                            {option.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                          </label>
                          
                          {renderOptionField(tool, option)}
                          
                          {option.description && (
                            <p className="text-xs text-slate-400">
                              {option.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mensaje cuando no hay opciones */}
              {isExpanded && !hasOptions && (
                <div className="p-4 border-t border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">
                    Esta herramienta no tiene opciones configurables
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Prompt combinado */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">
            Prompt Combinado
          </h4>
          <button
            onClick={handleGeneratePrompt}
            disabled={isGeneratingPrompt}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {isGeneratingPrompt ? 'Generando...' : 'Actualizar Prompt'}
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          {generatedPrompt ? (
            <p className="text-sm text-slate-300 font-mono leading-relaxed">
              {generatedPrompt}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Haz clic en "Actualizar Prompt" para generar el prompt combinado con todas las herramientas y opciones seleccionadas
            </p>
          )}
        </div>

        {selectedTools.length > 1 && (
          <div className="mt-3 text-xs text-slate-400">
            💡 Este prompt combina {selectedTools.length} herramientas: {selectedTools.map(t => t.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolOptionsPanel;