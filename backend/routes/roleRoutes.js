const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignToolsToRole,
  getRoleTools
} = require('../controllers/roleController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/roles - Obtener todos los roles
router.get('/', getAllRoles);

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', getRoleById);

// POST /api/roles - Crear un nuevo rol
router.post('/', createRole);

// PUT /api/roles/:id - Actualizar un rol
router.put('/:id', updateRole);

// DELETE /api/roles/:id - Eliminar un rol
router.delete('/:id', deleteRole);

// GET /api/roles/:id/tools - Obtener herramientas de un rol
router.get('/:id/tools', getRoleTools);

// POST /api/roles/:id/tools - Asignar herramientas a un rol
router.post('/:id/tools', assignToolsToRole);

module.exports = router;
