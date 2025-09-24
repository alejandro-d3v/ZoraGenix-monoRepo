import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSettings, FiInfo } from 'react-icons/fi';
import { useTool } from '../context/ToolContext';
import ToolOptionsPanel from './ToolOptionsPanel';

const ToolConfigSidebar = ({ isOpen, onClose }) => {
  const { selectedTools } = useTool();

  return (
    <AnimatePresence>
      {isOpen && selectedTools.length > 0 && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 sidebar-overlay z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md config-sidebar border-l border-slate-700 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-nanoBlue-500/20 rounded-lg flex items-center justify-center">
                    <FiSettings className="w-4 h-4 text-nanoBlue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Configuración
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedTools.length} herramienta{selectedTools.length !== 1 ? 's' : ''} seleccionada{selectedTools.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FiX className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Selected Tools Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiInfo className="w-4 h-4 text-nanoBlue-400" />
                  <h4 className="text-sm font-medium text-nanoBlue-400">
                    Herramientas Seleccionadas
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {selectedTools.map((tool, index) => (
                    <div
                      key={tool.id}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-nanoBlue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-white truncate">
                            {tool.name}
                          </h5>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool Options Panel */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiSettings className="w-4 h-4 text-nanoBlue-400" />
                  <h4 className="text-sm font-medium text-nanoBlue-400">
                    Opciones de Configuración
                  </h4>
                </div>
                
                {/* Render the tool options panel without its own container */}
                <div className="space-y-4">
                  <ToolOptionsPanel compact={true} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolConfigSidebar;
