const Joi = require('joi');
const Image = require('../models/Image');
const User = require('../models/User');
const Tool = require('../models/Tool');
const { nanoBananaService } = require('../services/nanoBananaService');

/**
 * Construir prompt inteligente desde opciones seleccionadas
 */
const buildPromptFromOptions = (selectedOptions) => {
  const parts = [];
  
  Object.entries(selectedOptions).forEach(([key, value]) => {
    if (value && value !== '') {
      // Separar el nombre de la herramienta del campo
      const [toolName, fieldName] = key.includes('_') ? key.split('_') : [key, ''];
      
      if (toolName && fieldName) {
        switch (toolName.toLowerCase()) {
          case 'cambiar color':
            parts.push(`cambiar el color de la ${fieldName} a ${value}`);
            break;
          case 'nueva pose':
            if (fieldName === 'acción') {
              parts.push(`realizar la acción de ${value}`);
            } else if (fieldName === 'expresión') {
              parts.push(`mostrar expresión ${value}`);
            } else {
              parts.push(`cambiar la pose con ${fieldName} ${value}`);
            }
            break;
          case 'accesorios':
            parts.push(`agregar ${value} en la ${fieldName}`);
            break;
          case 'maquillaje':
            parts.push(`aplicar maquillaje en ${fieldName} con ${value}`);
            break;
          case 'peinado':
            parts.push(`cambiar el peinado con ${fieldName} ${value}`);
            break;
          default:
            parts.push(`${fieldName}: ${value}`);
        }
      } else {
        parts.push(`${key}: ${value}`);
      }
    }
  });
  
  if (parts.length === 0) {
    return 'Editar la imagen manteniendo la calidad y coherencia visual';
  }
  
  return parts.join(', ');
};

const { imageUtils } = require('../middlewares/uploadMiddleware');
const path = require('path');

/**
 * Controlador para manejo de imágenes
 */

/**
 * Generar imagen usando Nano-Banana API
 */
const generateImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Validar datos de entrada
    const schema = Joi.object({
      toolId: Joi.number().integer().optional(),
      selectedOptions: Joi.alternatives().try(
        Joi.object(),
        Joi.string().custom((value, helpers) => {
          try {
            return JSON.parse(value);
          } catch (error) {
            return helpers.error('any.invalid');
          }
        })
      ).default({}),
      customPrompt: Joi.string().allow('').optional(),
      generationMode: Joi.string().valid('text', 'single_image', 'multiple_images').default('text')
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { toolId, selectedOptions, customPrompt, generationMode } = value;
    
    console.log('📝 Datos recibidos:', {
      toolId,
      selectedOptions: typeof selectedOptions === 'object' ? selectedOptions : 'string',
      customPrompt,
      generationMode
    });

    // Verificar cuota del usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.quota_remaining <= 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes créditos suficientes para generar imágenes',
        quota_remaining: user.quota_remaining
      });
    }

    // Construir prompt inteligente
    let finalPrompt = '';
    
    // Verificar si el prompt personalizado es genérico o incompleto
    const isGenericPrompt = customPrompt && (
      customPrompt.includes('agregar.') || 
      customPrompt.includes('cambiar la pose con.') || 
      customPrompt.includes('cambiar el color de') ||
      customPrompt.trim().length < 20
    );
    
    if (customPrompt && customPrompt.trim() && !isGenericPrompt) {
      // Si hay prompt personalizado completo, usarlo
      finalPrompt = customPrompt.trim();
    } else if (toolId && Object.keys(selectedOptions).length > 0) {
      // Si hay herramienta y opciones, construir prompt desde la herramienta
      try {
        const tool = await Tool.findById(toolId);
        if (tool) {
          finalPrompt = await Tool.buildPrompt(toolId, selectedOptions);
        }
      } catch (error) {
        console.error('Error building prompt from tool:', error);
      }
    }
    
    // Si no hay prompt o es genérico, construir uno desde las opciones
    if (!finalPrompt || isGenericPrompt) {
      if (Object.keys(selectedOptions).length > 0) {
        const optionsPrompt = buildPromptFromOptions(selectedOptions);
        finalPrompt = optionsPrompt;
      }
    }
    
    // Si aún no hay prompt, usar uno por defecto
    if (!finalPrompt) {
      finalPrompt = 'Editar la imagen manteniendo la calidad y coherencia visual';
    }
    
    console.log('🎯 Prompt final construido:', finalPrompt);

    console.log(`🎨 Generando imagen para usuario ${userId}`);
    console.log(`📝 Prompt: ${finalPrompt.substring(0, 200)}...`);

    let nanoBananaResult;

    // Procesar según el modo de generación
    switch (generationMode) {
      case 'text':
        // Solo texto, sin imágenes base
        nanoBananaResult = await nanoBananaService.generateImageFromText(finalPrompt);
        break;

      case 'single_image':
        // Una imagen base
        if (!req.processedImages || req.processedImages.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Se requiere una imagen base para este modo'
          });
        }

        const baseImage = req.processedImages[0];
        nanoBananaResult = await nanoBananaService.editImageWithText(
          finalPrompt,
          baseImage.base64Data,
          baseImage.mimeType
        );
        break;

      case 'multiple_images':
        // Múltiples imágenes
        if (!req.processedImages || req.processedImages.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Se requieren imágenes base para este modo'
          });
        }

        const images = req.processedImages.map(img => ({
          base64Data: img.base64Data,
          mimeType: img.mimeType
        }));

        nanoBananaResult = await nanoBananaService.editMultipleImages(finalPrompt, images);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Modo de generación no válido'
        });
    }

    // Verificar que se generó al menos una imagen
    if (!nanoBananaResult.images || nanoBananaResult.images.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo generar la imagen',
        details: nanoBananaResult.text || 'Sin detalles adicionales'
      });
    }

    // Guardar la primera imagen generada
    const generatedImage = nanoBananaResult.images[0];
    const filename = `generated_${userId}_${Date.now()}.png`;
    
    const savedFile = await nanoBananaService.saveImageToFile(
      generatedImage.base64Data,
      filename
    );

    // Crear registro en base de datos
    const imageData = {
      user_id: userId,
      image_url: `/uploads/generated/${filename}`,
      prompt: finalPrompt
    };

    const newImage = await Image.create(imageData);

    // Descontar crédito del usuario
    await User.decrementQuota(userId, 1);

    // Obtener cuota actualizada
    const updatedUser = await User.findById(userId);

    console.log(`✅ Imagen generada exitosamente para usuario ${userId}`);
    console.log(`💳 Créditos restantes: ${updatedUser.quota_remaining}`);

    res.status(201).json({
      success: true,
      message: 'Imagen generada exitosamente',
      data: {
        image: {
          id: newImage.id,
          url: imageData.image_url,
          prompt: finalPrompt,
          created_at: newImage.created_at,
          file_size: savedFile.size
        },
        user: {
          quota_remaining: updatedUser.quota_remaining
        },
        nano_banana_response: {
          text: nanoBananaResult.text,
          images_generated: nanoBananaResult.images.length,
          metadata: nanoBananaResult.metadata
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generando imagen:', error);
    next(error);
  }
};

/**
 * Obtener imágenes del usuario
 */
const getUserImages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Validar parámetros
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de paginación inválidos'
      });
    }

    const result = await Image.findByUserId(userId, limit, offset);

    res.json({
      success: true,
      message: 'Imágenes obtenidas exitosamente',
      data: {
        images: result.images,
        pagination: {
          current_page: page,
          per_page: limit,
          total: result.total,
          total_pages: Math.ceil(result.total / limit),
          has_next: page < Math.ceil(result.total / limit),
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo imágenes del usuario:', error);
    next(error);
  }
};

/**
 * Obtener imagen específica
 */
const getImage = async (req, res, next) => {
  try {
    const imageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: 'ID de imagen inválido'
      });
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Verificar que la imagen pertenece al usuario (excepto admin)
    if (req.user.role_name !== 'admin' && image.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta imagen'
      });
    }

    res.json({
      success: true,
      message: 'Imagen obtenida exitosamente',
      data: { image }
    });

  } catch (error) {
    console.error('❌ Error obteniendo imagen:', error);
    next(error);
  }
};

/**
 * Eliminar imagen
 */
const deleteImage = async (req, res, next) => {
  try {
    const imageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: 'ID de imagen inválido'
      });
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Verificar que la imagen pertenece al usuario (excepto admin)
    if (req.user.role_name !== 'admin' && image.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta imagen'
      });
    }

    // Eliminar archivo físico si existe
    try {
      const fs = require('fs');
      const fullPath = path.join(process.cwd(), image.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Archivo eliminado: ${image.file_path}`);
      }
    } catch (fileError) {
      console.error('⚠️ Error eliminando archivo físico:', fileError);
      // Continuar con la eliminación del registro aunque falle el archivo
    }

    // Eliminar registro de base de datos
    await Image.delete(imageId);

    console.log(`✅ Imagen ${imageId} eliminada por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    next(error);
  }
};

/**
 * Buscar imágenes por prompt
 */
const searchImages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerido'
      });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de paginación inválidos'
      });
    }

    const result = await Image.searchByPrompt(userId, query.trim(), limit, offset);

    res.json({
      success: true,
      message: 'Búsqueda completada exitosamente',
      data: {
        query: query.trim(),
        images: result.images,
        pagination: {
          current_page: page,
          per_page: limit,
          total: result.total,
          total_pages: Math.ceil(result.total / limit),
          has_next: page < Math.ceil(result.total / limit),
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error buscando imágenes:', error);
    next(error);
  }
};

/**
 * Descargar imagen
 */
const downloadImage = async (req, res, next) => {
  try {
    const imageId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: 'ID de imagen inválido'
      });
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Verificar que la imagen pertenece al usuario (excepto admin)
    if (req.user.role_name !== 'admin' && image.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para descargar esta imagen'
      });
    }

    const fs = require('fs');
    const fullPath = path.join(process.cwd(), image.file_path);

    // Verificar que el archivo existe
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de imagen no encontrado en el servidor'
      });
    }

    // Obtener información del archivo
    const stats = fs.statSync(fullPath);
    const filename = path.basename(image.file_path);
    const ext = path.extname(filename);
    
    // Generar nombre de descarga amigable
    const downloadName = `soragemi-x-${image.id}-${Date.now()}${ext}`;

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Length', stats.size);

    // Enviar archivo
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

    console.log(`📥 Imagen ${imageId} descargada por usuario ${userId}`);

  } catch (error) {
    console.error('❌ Error descargando imagen:', error);
    next(error);
  }
};

/**
 * Obtener estadísticas de imágenes del usuario
 */
const getUserImageStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Image.getUserStats(userId);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: { stats }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    next(error);
  }
};

module.exports = {
  generateImage,
  getUserImages,
  getImage,
  deleteImage,
  searchImages,
  downloadImage,
  getUserImageStats
};