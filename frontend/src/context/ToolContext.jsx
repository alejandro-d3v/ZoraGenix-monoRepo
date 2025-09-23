import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Estado inicial
const initialState = {
  tools: [],
  selectedTool: null,
  selectedOptions: {},
  generatedPrompt: '',
  isLoading: false,
  error: null
};

// Tipos de acciones
const TOOL_ACTIONS = {
  FETCH_TOOLS_START: 'FETCH_TOOLS_START',
  FETCH_TOOLS_SUCCESS: 'FETCH_TOOLS_SUCCESS',
  FETCH_TOOLS_FAILURE: 'FETCH_TOOLS_FAILURE',
  SELECT_TOOL: 'SELECT_TOOL',
  UPDATE_OPTIONS: 'UPDATE_OPTIONS',
  CLEAR_OPTIONS: 'CLEAR_OPTIONS',
  BUILD_PROMPT_START: 'BUILD_PROMPT_START',
  BUILD_PROMPT_SUCCESS: 'BUILD_PROMPT_SUCCESS',
  BUILD_PROMPT_FAILURE: 'BUILD_PROMPT_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const toolReducer = (state, action) => {
  switch (action.type) {
    case TOOL_ACTIONS.FETCH_TOOLS_START:
    case TOOL_ACTIONS.BUILD_PROMPT_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case TOOL_ACTIONS.FETCH_TOOLS_SUCCESS:
      return {
        ...state,
        tools: action.payload,
        isLoading: false,
        error: null
      };

    case TOOL_ACTIONS.FETCH_TOOLS_FAILURE:
    case TOOL_ACTIONS.BUILD_PROMPT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case TOOL_ACTIONS.SELECT_TOOL:
      return {
        ...state,
        selectedTool: action.payload,
        selectedOptions: {}, // Limpiar opciones al cambiar herramienta
        generatedPrompt: ''
      };

    case TOOL_ACTIONS.UPDATE_OPTIONS:
      return {
        ...state,
        selectedOptions: {
          ...state.selectedOptions,
          ...action.payload
        }
      };

    case TOOL_ACTIONS.CLEAR_OPTIONS:
      return {
        ...state,
        selectedOptions: {},
        generatedPrompt: ''
      };

    case TOOL_ACTIONS.BUILD_PROMPT_SUCCESS:
      return {
        ...state,
        generatedPrompt: action.payload,
        isLoading: false,
        error: null
      };

    case TOOL_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Crear contexto
const ToolContext = createContext();

// Hook personalizado para usar el contexto
export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool debe ser usado dentro de ToolProvider');
  }
  return context;
};

// Provider del contexto
export const ToolProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toolReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Cargar herramientas cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchTools();
    }
  }, [isAuthenticated]);

  // Función para obtener herramientas
  const fetchTools = async () => {
    try {
      dispatch({ type: TOOL_ACTIONS.FETCH_TOOLS_START });

      const response = await api.get('/tools');
      
      dispatch({
        type: TOOL_ACTIONS.FETCH_TOOLS_SUCCESS,
        payload: response.data.data.tools
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cargar herramientas';
      
      dispatch({
        type: TOOL_ACTIONS.FETCH_TOOLS_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
    }
  };

  // Función para seleccionar herramienta
  const selectTool = (tool) => {
    dispatch({
      type: TOOL_ACTIONS.SELECT_TOOL,
      payload: tool
    });
  };

  // Función para actualizar opciones
  const updateOptions = (options) => {
    dispatch({
      type: TOOL_ACTIONS.UPDATE_OPTIONS,
      payload: options
    });
  };

  // Función para limpiar opciones
  const clearOptions = () => {
    dispatch({ type: TOOL_ACTIONS.CLEAR_OPTIONS });
  };

  // Función para construir prompt
  const buildPrompt = async (toolId, selectedOptions) => {
    try {
      dispatch({ type: TOOL_ACTIONS.BUILD_PROMPT_START });

      const response = await api.post('/tools/build-prompt', {
        toolId,
        selectedOptions
      });
      
      dispatch({
        type: TOOL_ACTIONS.BUILD_PROMPT_SUCCESS,
        payload: response.data.data.generated_prompt
      });

      return response.data.data.generated_prompt;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al construir prompt';
      
      dispatch({
        type: TOOL_ACTIONS.BUILD_PROMPT_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return null;
    }
  };

  // Función para obtener configuración de herramienta
  const getToolConfig = async (toolId) => {
    try {
      const response = await api.get(`/tools/${toolId}/config`);
      return response.data.data.config;
    } catch (error) {
      console.error('Error obteniendo configuración de herramienta:', error);
      return null;
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: TOOL_ACTIONS.CLEAR_ERROR });
  };

  // Función para obtener herramienta por ID
  const getToolById = (toolId) => {
    return state.tools.find(tool => tool.id === toolId);
  };

  // Función para verificar si una herramienta está seleccionada
  const isToolSelected = (toolId) => {
    return state.selectedTool?.id === toolId;
  };

  // Función para obtener opciones disponibles de una herramienta
  const getToolOptions = (tool) => {
    try {
      const config = typeof tool.custom_config === 'string' 
        ? JSON.parse(tool.custom_config) 
        : tool.custom_config;
      
      return config.options || [];
    } catch (error) {
      console.error('Error parsing tool config:', error);
      return [];
    }
  };

  const value = {
    // Estado
    tools: state.tools,
    selectedTool: state.selectedTool,
    selectedOptions: state.selectedOptions,
    generatedPrompt: state.generatedPrompt,
    isLoading: state.isLoading,
    error: state.error,
    
    // Funciones
    fetchTools,
    selectTool,
    updateOptions,
    clearOptions,
    buildPrompt,
    getToolConfig,
    clearError,
    getToolById,
    isToolSelected,
    getToolOptions
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};