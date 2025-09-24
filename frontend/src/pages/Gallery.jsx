import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiImage, 
  FiSearch, 
  FiDownload, 
  FiTrash2, 
  FiEye, 
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiZap,
  FiRefreshCw
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserImages, searchImages, deleteImage, downloadImage } from '../services/nanoBanana';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Gallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  // Cargar imágenes al montar el componente
  useEffect(() => {
    loadImages();
  }, []);

  // Cargar imágenes
  const loadImages = async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await getUserImages(page, 20);
      if (result.success) {
        setImages(result.data.images);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      toast.error('Error cargando imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar imágenes
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      loadImages();
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchImages(query.trim(), 1, 20);
      if (result.success) {
        setImages(result.data.images);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error buscando imágenes:', error);
      toast.error('Error buscando imágenes');
    } finally {
      setIsSearching(false);
    }
  };

  // Eliminar imagen
  const handleDeleteImage = async (imageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const result = await deleteImage(imageId);
      if (result.success) {
        setImages(images.filter(img => img.id !== imageId));
        setSelectedImage(null);
        toast.success('Imagen eliminada');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      toast.error('Error eliminando imagen');
    }
  };

  // Descargar imagen
  const handleDownloadImage = async (imageId) => {
    try {
      const result = await downloadImage(imageId);
      if (result.success) {
        toast.success('Imagen descargada');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast.error('Error descargando imagen');
    }
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      loadImages(newPage);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="navbar-glass sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/editor" className="btn-ghost">
                <FiChevronLeft className="w-4 h-4 mr-2" />
                Volver al Editor
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <h1 className="text-xl font-bold text-white">Mi Galería</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadImages(1)}
                disabled={isLoading}
                className="btn-ghost p-2"
                title="Recargar galería"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-sm text-slate-400">
                {pagination.total} imágenes
              </span>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">
                  {user?.quota_remaining || 0} créditos restantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por prompt o descripción..."
                className="input-primary pl-10 pr-4 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    loadImages();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="btn-primary px-6"
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Cargando galería..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiImage className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-300 mb-2">
              {searchQuery ? 'No se encontraron imágenes' : 'Tu galería está vacía'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera imagen con IA'
              }
            </p>
            {!searchQuery && (
              <Link to="/editor" className="btn-primary">
                <FiZap className="w-4 h-4 mr-2" />
                Crear Primera Imagen
              </Link>
            )}
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && images.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="image-card group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative">
                    <img
                      src={image.image_url}
                      alt={image.prompt || 'Imagen generada'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Error cargando imagen:', image.image_url);
                        e.target.src = '/placeholder-image.svg'; // Fallback image
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiEye className="w-8 h-8 text-white" />
                    </div>

                    {/* ID badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{image.id}
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                      {image.prompt || 'Sin descripción'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {formatDate(image.created_at)}
                      </span>
                      <span>{image.file_size ? Math.round(image.file_size / 1024) : '?'} KB</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className="btn-secondary disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-slate-300">
                  Página {pagination.current_page} de {pagination.total_pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className="btn-secondary disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">
                  Detalles de la Imagen
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FiX className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="space-y-4">
                    <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                      <img
                        src={selectedImage.image_url}
                        alt={selectedImage.prompt || 'Imagen generada'}
                        className="w-full rounded-lg shadow-lg"
                        onError={(e) => {
                          console.error('Error cargando imagen en modal:', selectedImage.image_url);
                          e.target.src = '/placeholder-image.svg';
                        }}
                      />
                      {/* Image overlay with ID */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        #{selectedImage.id}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownloadImage(selectedImage.id)}
                        className="btn-primary flex-1 flex items-center justify-center space-x-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteImage(selectedImage.id)}
                        className="btn-secondary bg-red-600 hover:bg-red-700 flex items-center justify-center px-4"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">
                        Información
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">ID:</span>
                          <span className="text-white">#{selectedImage.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tamaño:</span>
                          <span className="text-white">
                            {selectedImage.file_size ? Math.round(selectedImage.file_size / 1024) : '?'} KB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Creada:</span>
                          <span className="text-white">{formatDate(selectedImage.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Usuario:</span>
                          <span className="text-white">{selectedImage.user_name || 'Usuario'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-3">
                        Prompt Utilizado
                      </h4>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-slate-300 text-sm font-mono leading-relaxed">
                          {selectedImage.prompt || 'Sin descripción disponible'}
                        </p>
                      </div>
                    </div>

                    {selectedImage.generation_metadata && (
                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">
                          Metadatos de Generación
                        </h4>
                        <div className="bg-slate-900 rounded-lg p-4">
                          <pre className="text-slate-300 text-xs overflow-x-auto">
                            {JSON.stringify(JSON.parse(selectedImage.generation_metadata), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;