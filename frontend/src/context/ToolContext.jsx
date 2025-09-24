import React, { createContext, useContext, useState, useEffect } from 'react';
import { toolAPI } from '../services/api';
import toast from 'react-hot-toast';

const ToolContext = createContext();

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool debe ser usado dentro de un ToolProvider');
  }
  return context;
};

export const ToolProvider = ({ children }) => {
  const [tools, setTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]); // Cambio: array de herramientas
  const [selectedOptions, setSelectedOptions] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar herramientas disponibles
  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setIsLoading(true);
      // Obtener herramientas disponibles para el usuario autenticado
      const response = await toolAPI.getUserTools();
      if (response.data.success) {
        setTools(response.data.data.tools);
      } else {
        toast.error('Error cargando herramientas');
      }
    } catch (error) {
      console.error('Error cargando herramientas:', error);
      toast.error('Error cargando herramientas');
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar/deseleccionar herramienta
  const toggleTool = (tool) => {
    setSelectedTools(prev => {
      const isSelected = prev.find(t => t.id === tool.id);
      if (isSelected) {
        // Remover herramienta
        const newTools = prev.filter(t => t.id !== tool.id);
        // Limpiar opciones de esta herramienta
        const newOptions = { ...selectedOptions };
        delete newOptions[tool.id];
        setSelectedOptions(newOptions);
        return newTools;
      } else {
        // Agregar herramienta
        return [...prev, tool];
      }
    });
  };

  // Actualizar opciones de una herramienta específica
  const updateToolOptions = (toolId, options) => {
    setSelectedOptions(prev => ({
      ...prev,
      [toolId]: options
    }));
  };

  // Obtener opciones de una herramienta
  const getToolOptions = (tool) => {
    if (!tool) return [];

    // Las opciones vienen dentro de custom_config (JSON) desde el backend
    try {
      const config = typeof tool.custom_config === 'string'
        ? JSON.parse(tool.custom_config)
        : (tool.custom_config || {});

      const options = Array.isArray(config.options) ? config.options : [];

      // Normalizar estructura esperada por el panel de opciones
      return options.map((opt) => ({
        key: opt.name || opt.key,
        name: opt.name || opt.key,
        label: opt.label || opt.name || opt.key,
        type: opt.type || 'text',
        options: opt.choices?.map((c) => ({ value: c, label: String(c) })) || opt.options || [],
        min: opt.min,
        max: opt.max,
        step: opt.step,
        default: opt.default,
        placeholder: opt.placeholder,
        description: opt.description,
        required: opt.required === true
      }));
    } catch (error) {
      console.error('Error parsing tool custom_config:', error);
      return [];
    }
  };

  // Construir prompt combinado de todas las herramientas seleccionadas
  const buildCombinedPrompt = async () => {
    if (selectedTools.length === 0) {
      setGeneratedPrompt('');
      return '';
    }

    try {
      const prompts = [];
      
      for (const tool of selectedTools) {
        const toolOptions = selectedOptions[tool.id] || {};
        
        // Construir prompt para esta herramienta
        try {
          const response = await toolAPI.buildPrompt(tool.id, toolOptions);
          if (response.data.success) {
            // Backend devuelve generated_prompt
            const gp = response.data.data.generated_prompt || response.data.data.prompt || '';
            prompts.push(`${tool.name}: ${gp}`);
          } else {
            prompts.push(`${tool.name}: ${tool.base_prompt}`);
          }
        } catch (error) {
          console.error(`Error building prompt for tool ${tool.id}:`, error);
          prompts.push(`${tool.name}: ${tool.base_prompt}`);
        }
      }

      const combinedPrompt = prompts.join('. ');
      setGeneratedPrompt(combinedPrompt);
      return combinedPrompt;
    } catch (error) {
      console.error('Error building combined prompt:', error);
      const fallbackPrompt = selectedTools.map(tool => `${tool.name}: ${tool.base_prompt}`).join('. ');
      setGeneratedPrompt(fallbackPrompt);
      return fallbackPrompt;
    }
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedTools([]);
    setSelectedOptions({});
    setGeneratedPrompt('');
  };

  // Verificar si una herramienta está seleccionada
  const isToolSelected = (toolId) => {
    return selectedTools.some(tool => tool.id === toolId);
  };

  // Obtener opciones de una herramienta específica
  const getOptionsForTool = (toolId) => {
    return selectedOptions[toolId] || {};
  };

  const value = {
    // Estado
    tools,
    selectedTools, // Cambio: array en lugar de objeto único
    selectedOptions,
    generatedPrompt,
    isLoading,

    // Acciones
    toggleTool, // Cambio: toggle en lugar de select
    updateToolOptions, // Nuevo: actualizar opciones por herramienta
    getToolOptions,
    buildCombinedPrompt, // Nuevo: construir prompt combinado
    clearSelection,
    isToolSelected, // Nuevo: verificar selección
    getOptionsForTool, // Nuevo: obtener opciones por herramienta

    // Compatibilidad hacia atrás
    selectedTool: selectedTools[0] || null, // Para compatibilidad
    selectTool: (tool) => {
      if (tool) {
        setSelectedTools([tool]);
      } else {
        clearSelection();
      }
    },
    updateOptions: (options) => {
      if (selectedTools.length > 0) {
        updateToolOptions(selectedTools[0].id, options);
      }
    },
    buildPrompt: buildCombinedPrompt
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};