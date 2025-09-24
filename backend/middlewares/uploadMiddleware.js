const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configuración de Multer para manejo de archivos de imagen
 */

// Crear directorio de uploads si no existe
const uploadDir = path.join(process.cwd(), 'uploads');
const tempDir = path.join(uploadDir, 'temp');
const generatedDir = path.join(uploadDir, 'generated');

[uploadDir, tempDir, generatedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Configuración principal de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 5 // Máximo 5 archivos por request
  }
});

/**
 * Middleware para manejar errores de multer
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 10MB por archivo.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo 5 archivos por solicitud.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error subiendo archivo.',
          error: error.code
        });
    }
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

/**
 * Middleware para procesar archivos subidos y convertirlos a base64
 */
const processUploadedFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    req.processedImages = [];

    req.files.forEach(file => {
      try {
        // Leer archivo y convertir a base64
        const imageData = fs.readFileSync(file.path);
        const base64Data = imageData.toString('base64');

        req.processedImages.push({
          originalName: file.originalname,
          filename: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          base64Data: base64Data,
          tempPath: file.path
        });

        console.log(`📁 Archivo procesado: ${file.originalname} (${Math.round(file.size / 1024)}KB)`);
      } catch (error) {
        console.error(`❌ Error procesando archivo ${file.originalname}:`, error);
      }
    });

    next();
  } catch (error) {
    console.error('❌ Error en processUploadedFiles:', error);
    next(error);
  }
};

/**
 * Middleware para limpiar archivos temporales
 */
const cleanupTempFiles = (req, res, next) => {
  // Limpiar archivos después de la respuesta
  res.on('finish', () => {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Archivo temporal eliminado: ${file.filename}`);
          }
        } catch (error) {
          console.error(`❌ Error eliminando archivo temporal ${file.filename}:`, error);
        }
      });
    }
  });

  next();
};

/**
 * Configuraciones específicas para diferentes endpoints
 */

// Para subir una sola imagen
const singleImage = upload.single('image');

// Para subir múltiples imágenes
const multipleImages = upload.array('images', 5);

// Para subir imágenes con campos específicos
const imageFields = upload.fields([
  { name: 'baseImage', maxCount: 1 },
  { name: 'referenceImages', maxCount: 4 }
]);

/**
 * Utilidades para trabajar con imágenes
 */
const imageUtils = {
  /**
   * Convertir archivo a base64
   */
  fileToBase64: (filePath) => {
    try {
      const imageData = fs.readFileSync(filePath);
      return imageData.toString('base64');
    } catch (error) {
      throw new Error(`Error leyendo archivo: ${error.message}`);
    }
  },

  /**
   * Guardar base64 como archivo
   */
  base64ToFile: (base64Data, filename, directory = generatedDir) => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = path.join(directory, filename);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (error) {
      throw new Error(`Error guardando archivo: ${error.message}`);
    }
  },

  /**
   * Obtener información de imagen base64
   */
  getImageInfo: (base64Data) => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return {
        size: buffer.length,
        sizeKB: Math.round(buffer.length / 1024),
        sizeMB: Math.round(buffer.length / (1024 * 1024) * 100) / 100
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Validar formato de imagen
   */
  validateImageFormat: (base64Data) => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Verificar headers de diferentes formatos
      const png = buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
      const jpg = buffer.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]));
      const gif = buffer.slice(0, 6).equals(Buffer.from('GIF87a')) || buffer.slice(0, 6).equals(Buffer.from('GIF89a'));
      const webp = buffer.slice(8, 12).equals(Buffer.from('WEBP'));

      return png || jpg || gif || webp;
    } catch (error) {
      return false;
    }
  }
};

module.exports = {
  upload,
  singleImage,
  multipleImages,
  imageFields,
  handleMulterError,
  processUploadedFiles,
  cleanupTempFiles,
  imageUtils,
  uploadDir,
  tempDir,
  generatedDir
};