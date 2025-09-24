const express = require('express');
const AdminController = require('../controllers/adminController');
const ToolController = require('../controllers/toolController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación y permisos de admin
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route   GET /admin/dashboard
 * @desc    Obtener dashboard con estadísticas
 * @access  Admin
 */
router.get('/dashboard', AdminController.getDashboard);

// === GESTIÓN DE USUARIOS ===

/**
 * @route   GET /admin/users
 * @desc    Obtener todos los usuarios
 * @access  Admin
 */
router.get('/users', AdminController.getAllUsers);
/**
 * @route   POST /admin/users
 * @desc    Crear nuevo usuario (admin)
 * @access  Admin
 */
router.post('/users', AdminController.createUser);


/**
 * @route   GET /admin/users/:id
 * @desc    Obtener usuario específico
 * @access  Admin
 */
router.get('/users/:id', AdminController.getUser);

/**
 * @route   PATCH /admin/users/:id/quota
 * @desc    Actualizar cuota de usuario
 * @access  Admin
 */
router.patch('/users/:id/quota', AdminController.updateUserQuota);

/**
 * @route   PATCH /admin/users/:id/reset-password
 * @desc    Restablecer contraseña de usuario
 * @access  Admin
 */
router.patch('/users/:id/reset-password', AdminController.resetUserPassword);

/**
 * @route   PATCH /admin/users/:id
 * @desc    Actualizar usuario (nombre, email, rol, cuota, password)
 * @access  Admin
 */
router.patch('/users/:id', AdminController.updateUser);

/**
 * @route   PATCH /admin/users/:id/role
 * @desc    Cambiar rol de usuario
 * @access  Admin
 */
router.patch('/users/:id/role', AdminController.updateUserRole);

/**
 * @route   DELETE /admin/users/:id
 * @desc    Eliminar usuario
 * @access  Admin
 */
router.delete('/users/:id', AdminController.deleteUser);

// === GESTIÓN DE IMÁGENES ===

/**
 * @route   GET /admin/images
 * @desc    Obtener todas las imágenes del sistema
 * @access  Admin
 */
router.get('/images', AdminController.getAllImages);

// === GESTIÓN DE HERRAMIENTAS ===

/**
 * @route   POST /admin/tools
 * @desc    Crear nueva herramienta
 * @access  Admin
 */
router.post('/tools', ToolController.createTool);

/**
 * @route   PUT /admin/tools/:id
 * @desc    Actualizar herramienta
 * @access  Admin
 */
router.put('/tools/:id', ToolController.updateTool);

/**
 * @route   DELETE /admin/tools/:id
 * @desc    Eliminar herramienta
 * @access  Admin
 */
router.delete('/tools/:id', ToolController.deleteTool);

/**
 * @route   PATCH /admin/tools/:id/toggle
 * @desc    Activar/Desactivar herramienta
 * @access  Admin
 */
router.patch('/tools/:id/toggle', ToolController.toggleTool);

// === GESTIÓN DE ROLES ===

/**
 * @route   GET /admin/roles
 * @desc    Obtener todos los roles
 * @access  Admin
 */
router.get('/roles', AdminController.getAllRoles);

/**
 * @route   POST /admin/roles/:roleId/tools
 * @desc    Asignar herramientas a rol
 * @access  Admin
 */
router.post('/roles/:roleId/tools', AdminController.assignToolsToRole);

// === CONFIGURACIÓN DEL SISTEMA ===

/**
 * @route   POST /admin/api-key
 * @desc    Configurar API Key de Nano-Banana
 * @access  Admin
 */
router.post('/api-key', AdminController.setApiKey);

/**
 * @route   GET /admin/api-key/verify
 * @desc    Verificar estado de API Key
 * @access  Admin
 */
router.get('/api-key/verify', AdminController.verifyApiKey);

/**
 * @route   GET /admin/config
 * @desc    Obtener configuración del sistema
 * @access  Admin
 */
router.get('/config', AdminController.getSystemConfig);

module.exports = router;