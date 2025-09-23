const express = require('express');
const ImageController = require('../controllers/imageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { quotaMiddleware } = require('../middlewares/quotaMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   POST /images/generate
 * @desc    Generar imagen con IA
 * @access  Private (requiere cuota)
 */
router.post('/generate', quotaMiddleware, ImageController.generateImage);

/**
 * @route   GET /images
 * @desc    Obtener imágenes del usuario
 * @access  Private
 */
router.get('/', ImageController.getUserImages);

/**
 * @route   GET /images/search
 * @desc    Buscar imágenes por prompt
 * @access  Private
 */
router.get('/search', ImageController.searchImages);

/**
 * @route   GET /images/:id
 * @desc    Obtener imagen específica
 * @access  Private
 */
router.get('/:id', ImageController.getImage);

/**
 * @route   DELETE /images/:id
 * @desc    Eliminar imagen
 * @access  Private
 */
router.delete('/:id', ImageController.deleteImage);

module.exports = router;