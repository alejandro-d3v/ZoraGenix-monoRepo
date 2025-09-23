const express = require('express');
const ToolController = require('../controllers/toolController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /tools
 * @desc    Obtener herramientas disponibles para el usuario
 * @access  Private
 */
router.get('/', ToolController.getUserTools);

/**
 * @route   GET /tools/all
 * @desc    Obtener todas las herramientas (para admin)
 * @access  Private
 */
router.get('/all', ToolController.getAllTools);

/**
 * @route   GET /tools/stats
 * @desc    Obtener estadísticas de herramientas
 * @access  Private
 */
router.get('/stats', ToolController.getToolStats);

/**
 * @route   GET /tools/:id
 * @desc    Obtener herramienta específica
 * @access  Private
 */
router.get('/:id', ToolController.getTool);

/**
 * @route   GET /tools/:id/config
 * @desc    Obtener configuración de herramienta
 * @access  Private
 */
router.get('/:id/config', ToolController.getToolConfig);

/**
 * @route   POST /tools/build-prompt
 * @desc    Construir prompt basado en opciones
 * @access  Private
 */
router.post('/build-prompt', ToolController.buildPrompt);

module.exports = router;