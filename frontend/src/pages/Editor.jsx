import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSettings, FiImage, FiZap, FiDownload, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTool } from '../context/ToolContext';
import { imageAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/Editor.css';

// Componentes
import ToolPalette from '../components/ToolPalette';
import ToolOptionsPanel from '../components/ToolOptionsPanel';
import ToolConfigSidebar from '../components/ToolConfigSidebar';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import GenerationProgress from '../components/GenerationProgress';
import ZoraLogo from '../components/ZoraLogo';

const Editor = () => {
  const { user, logout } = useAuth();
  const { selectedTools, selectedOptions, generatedPrompt, buildCombinedPrompt } = useTool();
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generationMode, setGenerationMode] = useState('text');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cargar estadísticas del usuario
  useEffect(() => {
    loadUserStats();
  }, []);

  // Abrir sidebar automáticamente cuando se seleccionen herramientas
  useEffect(() => {
    if (selectedTools.length > 0) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [selectedTools.length]);

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

    try {
      setIsGenerating(true);
      setGeneratedImage(null);
      setGenerationStep(1);
      
      // Paso 1: Construir prompt final
      let finalPrompt = '';
      if (customPrompt.trim()) {
        finalPrompt = customPrompt.trim();
      } else {
        finalPrompt = await buildCombinedPrompt();
      }

      if (!finalPrompt) {
        toast.error('No se pudo generar el prompt');
        return;
      }

      setGenerationStep(2);

      // Preparar FormData
      const formData = new FormData();
      
      // Combinar opciones de todas las herramientas activas
      const combinedOptions = {};
      let primaryToolId = null;
      
      selectedTools.forEach(tool => {
        const toolOptions = selectedOptions[tool.id] || {};
        Object.entries(toolOptions).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            combinedOptions[`${tool.name}_${key}`] = value;
            if (!primaryToolId) primaryToolId = tool.id; // Usar la primera herramienta como principal
          }
        });
      });
      
      // Enviar datos estructurados
      if (primaryToolId) {
        formData.append('toolId', primaryToolId);
      }
      formData.append('selectedOptions', JSON.stringify(combinedOptions));
      formData.append('generationMode', generationMode);
      formData.append('customPrompt', finalPrompt);

      // Agregar imágenes si las hay
      uploadedImages.forEach((imageObj) => {
        formData.append('images', imageObj.file);
      });

      console.log('📤 Enviando datos:', {
        toolId: primaryToolId,
        selectedOptions: combinedOptions,
        generationMode,
        customPrompt: finalPrompt,
        imagesCount: uploadedImages.length
      });

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      setGenerationStep(3);

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
          <div className="flex items-center justify-between h-20 py-3">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="zora-logo-container">
                <ZoraLogo 
                  size={36} 
                  color="gradient" 
                  strokeWidth={2}
                  animated={isGenerating}
                  className="transition-all duration-300 hover:scale-110 z-10"
                />
                {/* Enhanced glow effect */}
                <div className="zora-logo-glow"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center space-x-1">
                  <span className="brand-text">Zora</span>
                  <span className="text-nanoBlue-400">Gemi</span>
                  <span className="text-purple-400">X</span>
                </h1>
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

      <div className="flex relative">
        {/* Sidebar - Tool Palette */}
        <div className="w-80 sidebar min-h-screen overflow-y-auto p-6">
          <ToolPalette />
        </div>

        {/* Main Content */}
        <div className={`flex-1 p-6 editor-main-content ${isSidebarOpen ? 'lg:mr-96' : ''}`}>
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Control Panel */}
            <div className="card-glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Panel de Control
                </h2>
                <div className="flex items-center space-x-4">
                  {selectedTools.length > 0 && (
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="btn-primary config-toggle-btn flex items-center space-x-2"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isSidebarOpen ? 'Ocultar Config' : 'Configurar'}
                      </span>
                    </button>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>Herramientas: {selectedTools.length}</span>
                    <span>Modo: {generationMode.replace('_', ' ')}</span>
                    <span>Imágenes: {uploadedImages.length}</span>
                  </div>
                </div>
              </div>

              {/* Tool Info - Herramientas Seleccionadas */}
              {selectedTools.length > 0 ? (
                <div className="tool-info-card rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-nanoBlue-400">
                      Herramientas Seleccionadas
                    </h3>
                    <span className="text-xs text-slate-400">
                      {selectedTools.length} herramienta{selectedTools.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Lista de herramientas con descripciones */}
                  <div className="space-y-3 mb-4">
                    {selectedTools.map((tool, index) => (
                      <div key={tool.id} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-nanoBlue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 tool-selection-badge">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white">
                            {tool.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                    <span>Modo: {generationMode.replace('_', ' ')}</span>
                    <span>Imágenes: {uploadedImages.length}</span>
                    <span>Opciones: {Object.keys(selectedOptions).length}</span>
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
                    <div className="w-16 h-16 bg-nanoBlue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiZap className="w-8 h-8 text-nanoBlue-400 animate-pulse" />
                    </div>
                    <p className="text-slate-400">
                      Procesando tu solicitud...
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
                          <p>ID: #{generatedImage.id}</p>
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

        {/* Tool Configuration Sidebar */}
        <ToolConfigSidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Generation Progress Modal */}
      <GenerationProgress 
        isGenerating={isGenerating} 
        currentStep={generationStep} 
      />
    </div>
  );
};

export default Editor;