const Joi = require('joi');
const User = require('../models/User');
const Role = require('../models/Role');
const Tool = require('../models/Tool');
const Image = require('../models/Image');
const SystemConfig = require('../models/SystemConfig');

// Esquemas de validación
const updateQuotaSchema = Joi.object({
  quota: Joi.number().integer().min(0).required()
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required()
});

const updateRoleSchema = Joi.object({
  roleId: Joi.number().integer().positive().required()
});

const assignToolsSchema = Joi.object({
  toolIds: Joi.array().items(Joi.number().integer().positive()).required()
});

const setApiKeySchema = Joi.object({
  apiKey: Joi.string().required()
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.number().integer().positive().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  roleId: Joi.number().integer().positive().optional(),
  password: Joi.string().min(6).optional(),
  quota: Joi.number().integer().min(0).optional()
});

class AdminController {
  /**
   * Obtener dashboard con estadísticas generales
   */
  static async getDashboard(req, res, next) {
    try {
      // Obtener estadísticas de usuarios
      const userStats = await User.getStats();
      
      // Obtener estadísticas de imágenes
      const imageStats = await Image.getGlobalStats();
      
      // Obtener estadísticas de herramientas
      const toolStats = await Tool.getUsageStats();
      
      // Obtener configuración de la app
      const appConfig = await SystemConfig.getAppConfig();

      // Obtener imágenes recientes (usar findAll con límite)
      const recentImages = await Image.findAll(5, 0);

      res.json({
        success: true,
        message: 'Dashboard obtenido exitosamente',
        data: {
          stats: {
            users: userStats,
            images: imageStats.total_images,
            tools: toolStats
          },
          recent_images: recentImages,
          app_config: appConfig
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear usuario (admin)
   */
  static async createUser(req, res, next) {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      const { name, email, password, roleId } = value;

      const exists = await User.findByEmail(email);
      if (exists) {
        return res.status(409).json({ success: false, message: 'El email ya está registrado' });
      }

      let finalRoleId = roleId;
      if (!finalRoleId) {
        const userRole = await Role.findByName('user');
        finalRoleId = userRole?.id || 2;
      }

      const created = await User.create({ name, email, password, role_id: finalRoleId });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: { user: created }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar usuario (admin)
   */
  static async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      if (!userId) {
        return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
      }

      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
        });
      }

      const { name, email, roleId, password, quota } = value;

      if (email) {
        const existing = await User.findByEmail(email);
        if (existing && existing.id !== userId) {
          return res.status(409).json({ success: false, message: 'El email ya está en uso' });
        }
      }

      let updated = null;
      if (name || email) {
        updated = await User.updateBasic(userId, { name, email });
      }
      if (typeof roleId === 'number') {
        updated = await User.updateRole(userId, roleId);
      }
      if (typeof quota === 'number') {
        updated = await User.updateQuota(userId, quota);
      }
      if (password) {
        await User.updatePassword(userId, password);
        updated = await User.findById(userId);
      }

      res.json({
        success: true,
        message: 'Usuario actualizado',
        data: { user: updated || (await User.findById(userId)) }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Obtener todos los usuarios
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll();

      res.json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: {
          users
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuario específico
   */
  static async getUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Obtener estadísticas adicionales del usuario
      const imageCount = await Image.countByUserId(userId);
      const recentImages = await Image.findByUserId(userId, 5, 0);

      const { password, ...userProfile } = user;

      res.json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: {
          user: {
            ...userProfile,
            image_count: imageCount,
            recent_images: recentImages
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar cuota de usuario
   */
  static async updateUserQuota(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Validar datos de entrada
      const { error, value } = updateQuotaSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { quota } = value;

      const updatedUser = await User.updateQuota(userId, quota);

      res.json({
        success: true,
        message: 'Cuota actualizada exitosamente',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Restablecer contraseña de usuario
   */
  static async resetUserPassword(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Validar datos de entrada
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { newPassword } = value;

      await User.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar rol de usuario
   */
  static async updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Validar datos de entrada
      const { error, value } = updateRoleSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { roleId } = value;

      // Verificar que el rol existe
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      const updatedUser = await User.updateRole(userId, roleId);

      res.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      // Verificar que no se está intentando eliminar a sí mismo
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propia cuenta'
        });
      }

      const deleted = await User.delete(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todas las imágenes del sistema
   */
  static async getAllImages(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const images = await Image.findAll(limit, offset);

      res.json({
        success: true,
        message: 'Imágenes obtenidas exitosamente',
        data: {
          images,
          pagination: {
            current_page: page,
            per_page: limit
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los roles
   */
  static async getAllRoles(req, res, next) {
    try {
      const roles = await Role.findAllWithTools();

      res.json({
        success: true,
        message: 'Roles obtenidos exitosamente',
        data: {
          roles
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar herramientas a un rol
   */
  static async assignToolsToRole(req, res, next) {
    try {
      const roleId = parseInt(req.params.roleId);

      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
      }

      // Validar datos de entrada
      const { error, value } = assignToolsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { toolIds } = value;

      const assignedTools = await Role.assignTools(roleId, toolIds);

      res.json({
        success: true,
        message: 'Herramientas asignadas exitosamente',
        data: {
          role_id: roleId,
          assigned_tools: assignedTools
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Configurar API Key de Nano-Banana
   */
  static async setApiKey(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = setApiKeySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { apiKey } = value;

      await SystemConfig.setNanoApiKey(apiKey);

      res.json({
        success: true,
        message: 'API Key configurada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar API Key de Nano-Banana
   */
  static async verifyApiKey(req, res, next) {
    try {
      const hasApiKey = await SystemConfig.hasNanoApiKey();

      res.json({
        success: true,
        message: 'Estado de API Key obtenido',
        data: {
          has_api_key: hasApiKey
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener configuración del sistema
   */
  static async getSystemConfig(req, res, next) {
    try {
      const config = await SystemConfig.getAll();

      // Ocultar datos sensibles
      const publicConfig = { ...config };
      if (publicConfig.nano_api_key) {
        publicConfig.nano_api_key = '***HIDDEN***';
      }

      res.json({
        success: true,
        message: 'Configuración obtenida exitosamente',
        data: {
          config: publicConfig
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;