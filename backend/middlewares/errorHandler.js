/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Error de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          message: 'El registro ya existe'
        });
      
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          success: false,
          message: 'Referencia inválida en los datos'
        });
      
      case 'ECONNREFUSED':
        return res.status(503).json({
          success: false,
          message: 'Error de conexión a la base de datos'
        });
      
      default:
        console.error('Error de MySQL no manejado:', err.code);
    }
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'El archivo es demasiado grande'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      success: false,
      message: 'Demasiados archivos'
    });
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error del servidor'
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} no encontrada`
  });
};

/**
 * Función para crear errores personalizados
 */
const createError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  createError
};