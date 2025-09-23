const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const Role = require('../models/Role');

// Esquemas de validación
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

class AuthController {
  /**
   * Registro de usuario
   */
  static async register(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = registerSchema.validate(req.body);
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

      const { name, email, password } = value;

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Obtener rol de usuario por defecto
      const userRole = await Role.findByName('user');
      if (!userRole) {
        return res.status(500).json({
          success: false,
          message: 'Error de configuración del sistema'
        });
      }

      // Crear usuario
      const newUser = await User.create({
        name,
        email,
        password,
        role_id: userRole.id
      });

      // Generar JWT
      const token = jwt.sign(
        { 
          userId: newUser.id,
          email: newUser.email,
          role: userRole.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: userRole.name,
            quota_remaining: newUser.quota_remaining
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicio de sesión
   */
  static async login(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = loginSchema.validate(req.body);
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

      const { email, password } = value;

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role_name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role_name,
            quota_remaining: user.quota_remaining
          },
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(req, res, next) {
    try {
      // El middleware de autenticación ya verificó el token
      // Solo necesitamos devolver la información del usuario
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Refrescar token
   */
  static async refreshToken(req, res, next) {
    try {
      // Generar nuevo token con la información actual del usuario
      const token = jwt.sign(
        { 
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          user: req.user,
          token
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Cerrar sesión (invalidar token - lado cliente)
   */
  static async logout(req, res, next) {
    try {
      // En una implementación más avanzada, aquí se podría
      // mantener una lista negra de tokens invalidados
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;