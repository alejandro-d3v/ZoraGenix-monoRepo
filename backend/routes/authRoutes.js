const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /auth/verify
 * @desc    Verificar token JWT
 * @access  Private
 */
router.get('/verify', authMiddleware, AuthController.verifyToken);

/**
 * @route   POST /auth/refresh
 * @desc    Refrescar token JWT
 * @access  Private
 */
router.post('/refresh', authMiddleware, AuthController.refreshToken);

/**
 * @route   POST /auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authMiddleware, AuthController.logout);

module.exports = router;