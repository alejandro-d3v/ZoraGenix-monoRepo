const Role = require('../models/Role');

/**
 * Obtener todos los roles
 */
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAllWithTools();
    
    res.json({
      success: true,
      data: {
        roles,
        total: roles.length
      }
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener un rol por ID
 */
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Obtener herramientas del rol
    role.tools = await Role.getTools(id);
    
    res.json({
      success: true,
      data: { role }
    });
  } catch (error) {
    console.error('Error getting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo rol
 */
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validaciones
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del rol es requerido'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del rol es requerida'
      });
    }

    // Verificar que el nombre no exista
    const existingRole = await Role.findByName(name.trim().toLowerCase());
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }

    // Crear el rol
    const newRole = await Role.create({
      name: name.trim().toLowerCase(),
      description: description.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: { role: newRole }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Actualizar un rol
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validaciones
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del rol es requerido'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del rol es requerida'
      });
    }

    // Verificar que el rol existe
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Verificar que el nuevo nombre no esté en uso (excepto por el mismo rol)
    const roleWithSameName = await Role.findByName(name.trim().toLowerCase());
    if (roleWithSameName && roleWithSameName.id !== parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }

    // Actualizar el rol
    const updatedRole = await Role.update(id, {
      name: name.trim().toLowerCase(),
      description: description.trim()
    });

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: { role: updatedRole }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar un rol
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // No permitir eliminar roles del sistema (admin, user)
    if (['admin', 'user'].includes(existingRole.name)) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden eliminar los roles del sistema'
      });
    }

    // Intentar eliminar el rol
    const deleted = await Role.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el rol'
      });
    }

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    
    if (error.message.includes('usuarios asignados')) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el rol porque hay usuarios asignados'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Asignar herramientas a un rol
 */
const assignToolsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { toolIds } = req.body;

    // Verificar que el rol existe
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Validar que toolIds sea un array
    if (!Array.isArray(toolIds)) {
      return res.status(400).json({
        success: false,
        message: 'toolIds debe ser un array'
      });
    }

    // Asignar herramientas
    const assignedTools = await Role.assignTools(id, toolIds);

    res.json({
      success: true,
      message: 'Herramientas asignadas exitosamente',
      data: { 
        role: existingRole,
        tools: assignedTools 
      }
    });
  } catch (error) {
    console.error('Error assigning tools to role:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Obtener herramientas de un rol
 */
const getRoleTools = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    const tools = await Role.getTools(id);

    res.json({
      success: true,
      data: { 
        role: existingRole,
        tools 
      }
    });
  } catch (error) {
    console.error('Error getting role tools:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignToolsToRole,
  getRoleTools
};
