import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiStar, 
  FiScissors, 
  FiUser, 
  FiRefreshCw, 
  FiShoppingBag,
  FiZap,
  FiTrash2,
  FiMapPin,
  FiCloud,
  FiLayers,
  FiX
} from 'react-icons/fi';
import clsx from 'clsx';
import { useTool } from '../context/ToolContext';

const ToolPalette = ({ className = '' }) => {
  const { 
    tools, 
    selectedTools, 
    toggleTool, 
    isLoading, 
    clearSelection,
    isToolSelected 
  } = useTool();

  // Iconos para cada herramienta
  const toolIcons = {
    1: FiDroplet,     // Cambiar Color
    2: FiStar,        // Maquillaje
    3: FiScissors,    // Peinado
    4: FiUser,        // Nueva Pose
    5: FiRefreshCw,   // Restaurar Imagen
    6: FiShoppingBag, // Accesorios
    7: FiZap,         // Mejorar Calidad
    8: FiTrash2,      // Quitar Elemento
    9: FiMapPin,      // Ubicar en Maravilla
    10: FiCloud,      // Tiempo y Clima
    11: FiLayers      // Combinar Imágenes
  };

  // Colores para cada herramienta
  const toolColors = {
    1: 'from-pink-500 to-rose-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-amber-500 to-orange-500',
    4: 'from-blue-500 to-cyan-500',
    5: 'from-green-500 to-emerald-500',
    6: 'from-indigo-500 to-purple-500',
    7: 'from-yellow-500 to-amber-500',
    8: 'from-red-500 to-pink-500',
    9: 'from-teal-500 to-cyan-500',
    10: 'from-sky-500 to-blue-500',
    11: 'from-violet-500 to-purple-500'
  };

  if (isLoading) {
    return (
      <div className={clsx('p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header con contador y botón limpiar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Herramientas de Edición
          </h2>
          <p className="text-slate-400">
            Selecciona múltiples herramientas para combinar efectos
          </p>
        </div>
        {selectedTools.length > 0 && (
          <button
            onClick={clearSelection}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>Limpiar ({selectedTools.length})</span>
          </button>
        )}
      </div>

      {/* Grid de herramientas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tools.map((tool, index) => {
          const IconComponent = toolIcons[tool.id] || FiZap;
          const isSelected = isToolSelected(tool.id);
          const gradientClass = toolColors[tool.id] || 'from-nanoBlue-500 to-purple-500';

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => toggleTool(tool)}
                className={clsx(
                  'tool-item w-full p-4 rounded-xl transition-all duration-300 relative overflow-hidden group',
                  isSelected 
                    ? 'ring-2 ring-nanoBlue-500 bg-nanoBlue-500/20 border-nanoBlue-500' 
                    : 'hover:scale-105'
                )}
              >
                {/* Fondo con gradiente */}
                <div className={clsx(
                  'absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity',
                  gradientClass
                )} />

                {/* Contenido */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  {/* Icono */}
                  <div className={clsx(
                    'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300',
                    isSelected 
                      ? `bg-gradient-to-br ${gradientClass} shadow-lg` 
                      : 'bg-slate-700 group-hover:bg-slate-600'
                  )}>
                    <IconComponent className={clsx(
                      'w-6 h-6 transition-colors',
                      isSelected ? 'text-white' : 'text-slate-300'
                    )} />
                  </div>

                  {/* Nombre */}
                  <div className="text-center">
                    <h3 className={clsx(
                      'font-medium text-sm transition-colors',
                      isSelected ? 'text-nanoBlue-300' : 'text-slate-200'
                    )}>
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Indicador de selección */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-nanoBlue-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">
                        {selectedTools.findIndex(t => t.id === tool.id) + 1}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Lista de herramientas seleccionadas */}
      {selectedTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            Herramientas Seleccionadas ({selectedTools.length})
          </h3>
          
          <div className="space-y-4">
            {selectedTools.map((tool, index) => {
              const IconComponent = toolIcons[tool.id] || FiZap;
              const gradientClass = toolColors[tool.id] || 'from-nanoBlue-500 to-purple-500';
              
              return (
                <div
                  key={tool.id}
                  className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-nanoBlue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                      gradientClass
                    )}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{tool.name}</h4>
                      <p className="text-xs text-slate-400">{tool.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleTool(tool)}
                    className="ml-auto w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <FiX className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Mensaje cuando no hay herramientas */}
      {tools.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No hay herramientas disponibles
          </h3>
          <p className="text-slate-400">
            Contacta al administrador para configurar las herramientas de edición.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolPalette;