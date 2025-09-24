const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { quotaMiddleware } = require('../middlewares/quotaMiddleware');
const { 
  multipleImages, 
  handleMulterError, 
  processUploadedFiles, 
  cleanupTempFiles 
} = require('../middlewares/uploadMiddleware');
const {
  generateImage,
  getUserImages,
  getImage,
  deleteImage,
  searchImages,
  downloadImage,
  getUserImageStats
} = require('../controllers/imageController');

/**
 * Rutas para manejo de imágenes
 * Todas las rutas requieren autenticación
 */

// Middleware común para todas las rutas
router.use(authMiddleware);

/**
 * POST /api/images/generate
 * Generar nueva imagen usando Nano-Banana
 * Soporta múltiples modos: texto, imagen única, múltiples imágenes
 */
router.post('/generate',
  quotaMiddleware, // Verificar cuota antes de procesar
  multipleImages, // Manejar archivos subidos (hasta 5 imágenes)
  handleMulterError, // Manejar errores de multer
  processUploadedFiles, // Convertir archivos a base64
  cleanupTempFiles, // Limpiar archivos temporales después
  generateImage
);

/**
 * GET /api/images
 * Obtener imágenes del usuario con paginación
 * Query params: page, limit
 */
router.get('/', getUserImages);

/**
 * GET /api/images/search
 * Buscar imágenes por prompt
 * Query params: q (query), page, limit
 */
router.get('/search', searchImages);

/**
 * GET /api/images/stats
 * Obtener estadísticas de imágenes del usuario
 */
router.get('/stats', getUserImageStats);

/**
 * GET /api/images/:id
 * Obtener imagen específica por ID
 */
router.get('/:id', getImage);

/**
 * GET /api/images/:id/download
 * Descargar imagen específica
 */
router.get('/:id/download', downloadImage);

/**
 * DELETE /api/images/:id
 * Eliminar imagen específica
 */
router.delete('/:id', deleteImage);

module.exports = router;