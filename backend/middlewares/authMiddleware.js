const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Middleware de autenticación JWT
 * Verifica el token y añade la información del usuario a req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información actualizada del usuario
    const userQuery = `
      SELECT u.id, u.name, u.email, u.quota_remaining, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    
    const users = await query(userQuery, [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Añadir información del usuario a la request
    req.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      quota_remaining: users[0].quota_remaining,
      role: users[0].role_name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en authMiddleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }

  next();
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero añade user info si existe
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userQuery = `
      SELECT u.id, u.name, u.email, u.quota_remaining, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    
    const users = await query(userQuery, [decoded.userId]);
    
    if (users.length > 0) {
      req.user = {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        quota_remaining: users[0].quota_remaining,
        role: users[0].role_name
      };
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin usuario autenticado
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};