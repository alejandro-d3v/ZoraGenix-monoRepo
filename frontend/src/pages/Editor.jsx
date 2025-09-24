import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSettings, FiImage, FiZap, FiDownload, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTool } from '../context/ToolContext';
import { imageAPI } from '../services/api';
import toast from 'react-hot-toast';

// Componentes
import ToolPalette from '../components/ToolPalette';
import ToolOptionsPanel from '../components/ToolOptionsPanel';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';

const Editor = () => {
  const { user, logout } = useAuth();
  const { selectedTools, selectedOptions, generatedPrompt, buildCombinedPrompt } = useTool();
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generationMode, setGenerationMode] = useState('text');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // Cargar estadísticas del usuario
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await imageAPI.getUserImages(1, 1);
      setUserStats({
        totalImages: response.data.data.pagination.total,
        quotaRemaining: user?.quota_remaining || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Determinar modo de generación basado en imágenes subidas
  useEffect(() => {
    if (uploadedImages.length === 0) {
      setGenerationMode('text');
    } else if (uploadedImages.length === 1) {
      setGenerationMode('single_image');
    } else {
      setGenerationMode('multiple_images');
    }
  }, [uploadedImages]);

  // Manejar cambio de imágenes
  const handleImagesChange = (images) => {
    setUploadedImages(images);
  };

  // Generar imagen
  const handleGenerateImage = async () => {
    if (selectedTools.length === 0) {
      toast.error('Selecciona al menos una herramienta');
      return;
    }

    if (user?.quota_remaining <= 0) {
      toast.error('No tienes créditos suficientes');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Construir prompt combinado si no hay prompt personalizado
      let finalPrompt = customPrompt.trim();
      if (!finalPrompt) {
        finalPrompt = await buildCombinedPrompt();
      }

      if (!finalPrompt) {
        toast.error('No se pudo generar el prompt');
        return;
      }

      // Preparar FormData
      const formData = new FormData();
      
      // Usar la primera herramienta para compatibilidad con el backend
      formData.append('toolId', selectedTools[0].id);
      
      // Combinar todas las opciones de todas las herramientas
      const combinedOptions = {};
      selectedTools.forEach(tool => {
        const toolOptions = selectedOptions[tool.id] || {};
        Object.keys(toolOptions).forEach(key => {
          combinedOptions[`${tool.name}_${key}`] = toolOptions[key];
        });
      });
      
      formData.append('selectedOptions', JSON.stringify(combinedOptions));
      formData.append('generationMode', generationMode);
      formData.append('customPrompt', finalPrompt);

      // Agregar imágenes si las hay
      uploadedImages.forEach((imageObj) => {
        formData.append('images', imageObj.file);
      });

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(result.data.image);
        toast.success('¡Imagen generada exitosamente!');
        
        // Actualizar estadísticas
        setUserStats(prev => ({
          ...prev,
          totalImages: (prev?.totalImages || 0) + 1,
          quotaRemaining: result.data.user.quota_remaining
        }));
      } else {
        throw new Error(result.message || 'Error generando imagen');
      }
    } catch (error) {
      console.error('Error generando imagen:', error);
      toast.error(error.message || 'Error generando imagen');
    } finally {
      setIsGenerating(false);
    }
  };

  // Descargar imagen generada
  const handleDownloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(`/api/images/${generatedImage.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soragemi-x-${generatedImage.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Imagen descargada');
      } else {
        throw new Error('Error descargando imagen');
      }
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast.error('Error descargando imagen');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="navbar-glass sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-nanoBlue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-holographic">SoraGemiX</h1>
                <p className="text-xs text-slate-400">Editor de Imágenes IA</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-slate-400">Imágenes creadas</p>
                <p className="text-lg font-bold text-nanoBlue-400">
                  {userStats?.totalImages || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Créditos restantes</p>
                <p className="text-lg font-bold text-green-400">
                  {userStats?.quotaRemaining || user?.quota_remaining || 0}
                </p>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <Link
                to="/gallery"
                className="btn-ghost flex items-center space-x-2"
              >
                <FiImage className="w-4 h-4" />
                <span className="hidden sm:inline">Galería</span>
              </Link>
              
              {user?.role_name === 'admin' && (
                <Link
                  to="/admin"
                  className="btn-ghost flex items-center space-x-2 text-red-400 hover:text-red-300"
                >
                  <FiShield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                title="Cerrar sesión"
              >
                <FiLogOut className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Tool Palette */}
        <div className="w-80 sidebar min-h-screen overflow-y-auto p-6">
          <ToolPalette />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Tool Options Panel - Inline */}
            <ToolOptionsPanel />

            {/* Control Panel */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Panel de Control
                </h2>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>Herramientas: {selectedTools.length}</span>
                  <span>Modo: {generationMode.replace('_', ' ')}</span>
                  <span>Imágenes: {uploadedImages.length}</span>
                </div>
              </div>

              {/* Tool Info */}
              {selectedTools.length > 0 ? (
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-nanoBlue-400 mb-2">
                    {selectedTools.length === 1 
                      ? selectedTools[0].name 
                      : `${selectedTools.length} herramientas combinadas`
                    }
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">
                    {selectedTools.length === 1 
                      ? selectedTools[0].description
                      : `Combinando: ${selectedTools.map(t => t.name).join(', ')}`
                    }
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>Modo: {generationMode.replace('_', ' ')}</span>
                    <span>Imágenes: {uploadedImages.length}</span>
                    <span>Opciones configuradas: {Object.keys(selectedOptions).length}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                  <p className="text-amber-300 text-sm">
                    ⚠️ Selecciona al menos una herramienta de la paleta para comenzar
                  </p>
                </div>
              )}

              {/* Image Uploader */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Imágenes de Entrada (Opcional)
                </h3>
                <ImageUploader
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />
              </div>

              {/* Custom Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prompt Personalizado (Opcional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe específicamente lo que quieres lograr con la imagen..."
                  rows={3}
                  className="input-primary w-full resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Si proporcionas un prompt personalizado, se usará en lugar del prompt generado automáticamente
                </p>
              </div>

              {/* Generated Prompt Preview */}
              {generatedPrompt && !customPrompt && selectedTools.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Prompt Combinado Generado
                  </label>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <p className="text-sm text-slate-300 font-mono">
                      {generatedPrompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateImage}
                disabled={selectedTools.length === 0 || isGenerating || (user?.quota_remaining <= 0)}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Generando imagen...</span>
                  </>
                ) : (
                  <>
                    <FiZap className="w-5 h-5" />
                    <span>
                      Generar Imagen {selectedTools.length > 1 && `(${selectedTools.length} herramientas)`}
                    </span>
                  </>
                )}
              </button>

              {user?.quota_remaining <= 0 && (
                <p className="text-red-400 text-sm text-center mt-2">
                  No tienes créditos suficientes. Contacta al administrador.
                </p>
              )}
            </div>

            {/* Result Panel */}
            {(isGenerating || generatedImage) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Resultado
                </h2>

                {isGenerating ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" text="Generando tu imagen con IA..." />
                    <p className="text-slate-400 mt-4">
                      Esto puede tomar unos momentos...
                    </p>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-6">
                    {/* Image */}
                    <div className="bg-slate-800 rounded-lg p-4">
                      <img
                        src={generatedImage.url}
                        alt="Imagen generada"
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-300 mb-2">Información</h4>
                        <div className="space-y-1 text-sm text-slate-400">
                          <p>Herramienta: {generatedImage.tool_name}</p>
                          <p>Tamaño: {Math.round(generatedImage.file_size / 1024)} KB</p>
                          <p>Creada: {new Date(generatedImage.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-300 mb-2">Prompt Usado</h4>
                        <p className="text-sm text-slate-400 font-mono">
                          {generatedImage.prompt.substring(0, 150)}...
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleDownloadImage}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={() => setGeneratedImage(null)}
                        className="btn-secondary"
                      >
                        Generar otra
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;