const { query } = require('../config/db');

/**
 * Middleware para verificar cuota de imágenes del usuario
 * Verifica que el usuario tenga créditos disponibles antes de generar imágenes
 */
const quotaMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    // Los administradores tienen cuota ilimitada
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar cuota actual del usuario
    const quotaQuery = 'SELECT quota_remaining FROM users WHERE id = ?';
    const users = await query(quotaQuery, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const currentQuota = users[0].quota_remaining;

    if (currentQuota <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Sin créditos disponibles. Contacta al administrador para obtener más créditos.',
        quota_remaining: currentQuota
      });
    }

    // Actualizar información de cuota en req.user
    req.user.quota_remaining = currentQuota;
    
    next();
  } catch (error) {
    console.error('Error en quotaMiddleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Función para descontar crédito después de generar imagen exitosamente
 */
const deductCredit = async (userId) => {
  try {
    const updateQuery = `
      UPDATE users 
      SET quota_remaining = quota_remaining - 1 
      WHERE id = ? AND quota_remaining > 0
    `;
    
    const result = await query(updateQuery, [userId]);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo descontar el crédito');
    }

    // Obtener cuota actualizada
    const quotaQuery = 'SELECT quota_remaining FROM users WHERE id = ?';
    const users = await query(quotaQuery, [userId]);
    
    return users[0]?.quota_remaining || 0;
  } catch (error) {
    console.error('Error al descontar crédito:', error);
    throw error;
  }
};

/**
 * Función para obtener cuota actual del usuario
 */
const getCurrentQuota = async (userId) => {
  try {
    const quotaQuery = 'SELECT quota_remaining FROM users WHERE id = ?';
    const users = await query(quotaQuery, [userId]);
    
    return users[0]?.quota_remaining || 0;
  } catch (error) {
    console.error('Error al obtener cuota:', error);
    throw error;
  }
};

module.exports = {
  quotaMiddleware,
  deductCredit,
  getCurrentQuota
};