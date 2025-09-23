const express = require('express');
const UserController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /users/me
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get('/me', UserController.getProfile);

/**
 * @route   PUT /users/me
 * @desc    Actualizar perfil del usuario
 * @access  Private
 */
router.put('/me', UserController.updateProfile);

/**
 * @route   POST /users/change-password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 */
router.post('/change-password', UserController.changePassword);

/**
 * @route   GET /users/stats
 * @desc    Obtener estadísticas del usuario
 * @access  Private
 */
router.get('/stats', UserController.getStats);

/**
 * @route   DELETE /users/me
 * @desc    Eliminar cuenta del usuario
 * @access  Private
 */
router.delete('/me', UserController.deleteAccount);

module.exports = router;