import { useState, useEffect, useCallback } from 'react';
import { getUserImages, searchImages, deleteImage } from '../services/nanoBanana';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejo de galería de imágenes
 */
export const useImageGallery = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  // Cargar imágenes
  const loadImages = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await getUserImages(page, 20);
      if (result.success) {
        setImages(result.data.images);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Error cargando imágenes');
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      toast.error('Error cargando imágenes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar imágenes
  const handleSearch = useCallback(async (query, page = 1) => {
    if (!query.trim()) {
      loadImages(page);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchImages(query, page, 20);
      if (result.success) {
        setImages(result.data.images);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Error buscando imágenes');
      }
    } catch (error) {
      console.error('Error buscando imágenes:', error);
      toast.error('Error buscando imágenes');
    } finally {
      setIsSearching(false);
    }
  }, [loadImages]);

  // Eliminar imagen
  const handleDeleteImage = useCallback(async (imageId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const result = await deleteImage(imageId);
      if (result.success) {
        // Remover imagen de la lista local
        setImages(prev => prev.filter(img => img.id !== imageId));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
        toast.success('Imagen eliminada correctamente');
      } else {
        toast.error(result.error || 'Error eliminando imagen');
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      toast.error('Error eliminando imagen');
    }
  }, []);

  // Cambiar página
  const handlePageChange = useCallback((page) => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, page);
    } else {
      loadImages(page);
    }
  }, [searchQuery, handleSearch, loadImages]);

  // Recargar galería
  const refreshGallery = useCallback(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, 1);
    } else {
      loadImages(1);
    }
  }, [searchQuery, handleSearch, loadImages]);

  // Cargar imágenes al montar
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return {
    // Estado
    images,
    isLoading,
    isSearching,
    searchQuery,
    pagination,
    
    // Acciones
    setSearchQuery,
    handleSearch,
    handleDeleteImage,
    handlePageChange,
    refreshGallery,
    loadImages
  };
};

export default useImageGallery;
