import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiImage, FiPlus } from 'react-icons/fi';
import clsx from 'clsx';

const ImageUploader = ({ 
  onImagesChange, 
  maxImages = 5, 
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  maxSizePerFile = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);

  // Validar archivo
  const validateFile = (file) => {
    const errors = [];

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`Tipo de archivo no válido: ${file.type}`);
    }

    // Validar tamaño
    if (file.size > maxSizePerFile) {
      const maxSizeMB = Math.round(maxSizePerFile / (1024 * 1024));
      errors.push(`Archivo demasiado grande: ${Math.round(file.size / (1024 * 1024))}MB (máximo ${maxSizeMB}MB)`);
    }

    return errors;
  };

  // Procesar archivos
  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Verificar límite de archivos
    if (images.length + fileArray.length > maxImages) {
      newErrors.push(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    fileArray.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`Archivo ${index + 1}: ${fileErrors.join(', ')}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convertir archivos válidos a objetos con preview
    const processedFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));

    const updatedImages = [...images, ...processedFiles];
    setImages(updatedImages);
    setErrors([]);

    // Notificar cambio al componente padre
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  }, [images, maxImages, acceptedTypes, maxSizePerFile, onImagesChange]);

  // Manejar drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Manejar drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  // Manejar drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Manejar selección de archivos
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Limpiar input
    e.target.value = '';
  };

  // Remover imagen
  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    
    // Limpiar URL de preview
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  // Limpiar todas las imágenes
  const clearAllImages = () => {
    // Limpiar URLs de preview
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });

    setImages([]);
    setErrors([]);
    
    if (onImagesChange) {
      onImagesChange([]);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Área de drop */}
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
          dragActive 
            ? 'border-nanoBlue-500 bg-nanoBlue-500/10' 
            : 'border-slate-600 hover:border-slate-500',
          images.length === 0 ? 'min-h-[200px]' : 'min-h-[120px]'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={clsx(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            dragActive ? 'bg-nanoBlue-500' : 'bg-slate-700'
          )}>
            <FiUpload className="w-8 h-8 text-white" />
          </div>

          <div>
            <p className="text-lg font-medium text-slate-200 mb-2">
              {images.length === 0 
                ? 'Arrastra imágenes aquí o haz clic para seleccionar'
                : `${images.length}/${maxImages} imágenes seleccionadas`
              }
            </p>
            <p className="text-sm text-slate-400">
              Formatos soportados: PNG, JPG, GIF, WebP (máximo {Math.round(maxSizePerFile / (1024 * 1024))}MB por archivo)
            </p>
          </div>

          {images.length < maxImages && (
            <button
              type="button"
              className="btn-secondary flex items-center space-x-2"
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              <FiPlus className="w-4 h-4" />
              <span>Agregar imágenes</span>
            </button>
          )}
        </div>
      </div>

      {/* Errores */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <h4 className="text-red-400 font-medium mb-2">Errores de validación:</h4>
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview de imágenes */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-200">
                Imágenes seleccionadas ({images.length})
              </h3>
              <button
                onClick={clearAllImages}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Limpiar todo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay con información */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(image.id)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <FiX className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Información del archivo */}
                  <div className="mt-2 text-xs text-slate-400">
                    <p className="truncate" title={image.name}>{image.name}</p>
                    <p>{formatFileSize(image.size)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;