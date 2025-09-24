import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiImage, FiCheck } from 'react-icons/fi';

const GenerationProgress = ({ isGenerating, currentStep, totalSteps = 3 }) => {
  const steps = [
    { id: 1, name: 'Procesando opciones', icon: FiZap },
    { id: 2, name: 'Generando imagen', icon: FiImage },
    { id: 3, name: 'Finalizando', icon: FiCheck }
  ];

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-nanoBlue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="w-8 h-8 text-nanoBlue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Generando tu imagen</h3>
          <p className="text-slate-400 text-sm">Esto puede tomar unos segundos...</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-nanoBlue-500/20 border border-nanoBlue-500/30' 
                    : isCompleted 
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-slate-800/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-nanoBlue-500/30 text-nanoBlue-400' 
                    : isCompleted 
                    ? 'bg-green-500/30 text-green-400'
                    : 'bg-slate-700 text-slate-500'
                }`}>
                  {isActive ? (
                    <Icon className="w-4 h-4 animate-pulse" />
                  ) : isCompleted ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive 
                    ? 'text-nanoBlue-400' 
                    : isCompleted 
                    ? 'text-green-400'
                    : 'text-slate-400'
                }`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progreso</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-nanoBlue-500 to-nanoBlue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GenerationProgress;
