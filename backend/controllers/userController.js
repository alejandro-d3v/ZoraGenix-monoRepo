const Joi = require('joi');
const User = require('../models/User');

// Esquemas de validación
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

class UserController {
  /**
   * Obtener perfil del usuario actual
   */
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No devolver la contraseña
      const { password, ...userProfile } = user;

      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          user: userProfile
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = updateProfileSchema.validate(req.body);
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

      const { name, email } = value;
      const userId = req.user.id;

      // Si se está actualizando el email, verificar que no exista
      if (email && email !== req.user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: 'El email ya está en uso'
          });
        }
      }

      // Actualizar campos que se proporcionaron
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      // Actualizar perfil usando el método updateBasic
      const updatedUser = await User.updateBasic(userId, updateData);
      const { password, ...userProfile } = updatedUser;

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: userProfile
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = changePasswordSchema.validate(req.body);
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

      const { currentPassword, newPassword } = value;
      const userId = req.user.id;

      // Obtener usuario actual
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isValidPassword = await User.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Actualizar contraseña
      await User.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      
      // TODO: Implementar estadísticas del usuario
      // Por ahora devolvemos datos básicos
      const stats = {
        quota_remaining: req.user.quota_remaining,
        total_images: 0, // TODO: Contar imágenes del usuario
        account_created: new Date(), // TODO: Obtener fecha real de creación
        last_image_generated: null // TODO: Obtener fecha de última imagen
      };

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          stats
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar cuenta del usuario
   */
  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      // Verificar que no sea administrador
      if (req.user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No se puede eliminar una cuenta de administrador'
        });
      }

      // Eliminar usuario (esto también eliminará sus imágenes por CASCADE)
      const deleted = await User.delete(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Cuenta eliminada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;