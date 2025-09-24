/**
 * Servicio frontend para interactuar con la API de imágenes del backend
 * Este servicio maneja la comunicación con el backend que a su vez usa Nano-Banana
 */

import { api } from './api';

/**
 * Generar imagen usando el backend
 */
export const generateImageWithAI = async (toolId, selectedOptions = {}, images = [], customPrompt = '') => {
  try {
    // Preparar FormData
    const formData = new FormData();
    formData.append('toolId', toolId);
    formData.append('selectedOptions', JSON.stringify(selectedOptions));
    
    if (customPrompt.trim()) {
      formData.append('customPrompt', customPrompt.trim());
    }

    // Determinar modo de generación
    let generationMode = 'text';
    if (images.length === 1) {
      generationMode = 'single_image';
    } else if (images.length > 1) {
      generationMode = 'multiple_images';
    }
    
    formData.append('generationMode', generationMode);

    // Agregar imágenes si las hay
    images.forEach((imageFile) => {
      formData.append('images', imageFile);
    });

    // Hacer petición al backend
    const response = await fetch('/api/images/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error generando imagen');
    }

    return {
      success: true,
      data: result.data
    };

  } catch (error) {
    console.error('Error en generateImageWithAI:', error);
    return {
      success: false,
      error: error.message || 'Error generando imagen'
    };
  }
};

/**
 * Obtener imágenes del usuario
 */
export const getUserImages = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/images?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error obteniendo imágenes'
    };
  }
};

/**
 * Buscar imágenes por prompt
 */
export const searchImages = async (query, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/images/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error buscando imágenes:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error buscando imágenes'
    };
  }
};

/**
 * Eliminar imagen
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await api.delete(`/images/${imageId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error eliminando imagen'
    };
  }
};

/**
 * Descargar imagen
 */
export const downloadImage = async (imageId) => {
  try {
    const response = await fetch(`/api/images/${imageId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error descargando imagen');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Crear enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `soragemi-x-${imageId}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error descargando imagen:', error);
    return {
      success: false,
      error: error.message || 'Error descargando imagen'
    };
  }
};

/**
 * Obtener estadísticas de imágenes del usuario
 */
export const getUserImageStats = async () => {
  try {
    const response = await api.get('/images/stats');
    return {
      success: true,
      data: response.data.data.stats
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error obteniendo estadísticas'
    };
  }
};

/**
 * Utilidades para trabajar con imágenes
 */
export const imageUtils = {
  /**
   * Convertir archivo a base64
   */
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Remover prefijo data:
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validar tipo de archivo
   */
  validateImageFile: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no válido: ${file.type}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Archivo demasiado grande: ${Math.round(file.size / (1024 * 1024))}MB (máximo 10MB)`
      };
    }

    return { valid: true };
  },

  /**
   * Redimensionar imagen si es necesario
   */
  resizeImage: (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Redimensionar
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Configuración por defecto
export const nanoBananaConfig = {
  maxImages: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  supportedModes: ['text', 'single_image', 'multiple_images']
};

export default {
  generateImageWithAI,
  getUserImages,
  searchImages,
  deleteImage,
  downloadImage,
  getUserImageStats,
  imageUtils,
  nanoBananaConfig
};