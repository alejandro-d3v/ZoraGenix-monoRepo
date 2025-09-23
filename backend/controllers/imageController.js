const Joi = require('joi');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/Image');
const Tool = require('../models/Tool');
const SystemConfig = require('../models/SystemConfig');
const { deductCredit } = require('../middlewares/quotaMiddleware');

// Esquemas de validación
const generateImageSchema = Joi.object({
  toolId: Joi.number().integer().positive().required(),
  selectedOptions: Joi.object().required(),
  baseImage: Joi.string().optional(), // Base64 de la imagen base
  customPrompt: Joi.string().max(1000).optional()
});

class ImageController {
  /**
   * Generar imagen con IA
   */
  static async generateImage(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = generateImageSchema.validate(req.body);
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

      const { toolId, selectedOptions, baseImage, customPrompt } = value;
      const userId = req.user.id;

      // Verificar que la herramienta existe y está activa
      const tool = await Tool.findById(toolId);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      if (!tool.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Herramienta no disponible'
        });
      }

      // Verificar que el usuario tiene acceso a esta herramienta
      const userTools = await Tool.findByRole(req.user.role === 'admin' ? 1 : 2);
      const hasAccess = userTools.some(t => t.id === toolId);
      
      if (!hasAccess && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta herramienta'
        });
      }

      // Construir prompt
      let finalPrompt;
      if (customPrompt) {
        finalPrompt = customPrompt;
      } else {
        finalPrompt = await Tool.buildPrompt(toolId, selectedOptions);
      }

      // Obtener API Key de Nano-Banana
      const nanoApiKey = await SystemConfig.getNanoApiKey();
      if (!nanoApiKey) {
        return res.status(503).json({
          success: false,
          message: 'Servicio de IA no configurado. Contacta al administrador.'
        });
      }

      // Llamar a la API de Nano-Banana (Gemini)
      let generatedImageUrl;
      try {
        generatedImageUrl = await this.callNanoBananaAPI(nanoApiKey, finalPrompt, baseImage);
      } catch (apiError) {
        console.error('Error en API Nano-Banana:', apiError);
        return res.status(503).json({
          success: false,
          message: 'Error al generar la imagen. Inténtalo de nuevo.'
        });
      }

      // Guardar imagen en la base de datos
      const savedImage = await Image.create({
        user_id: userId,
        img_url: generatedImageUrl,
        prompt: finalPrompt
      });

      // Descontar crédito (solo para usuarios no admin)
      let newQuota = req.user.quota_remaining;
      if (req.user.role !== 'admin') {
        newQuota = await deductCredit(userId);
      }

      res.json({
        success: true,
        message: 'Imagen generada exitosamente',
        data: {
          image: savedImage,
          quota_remaining: newQuota,
          tool_used: {
            id: tool.id,
            name: tool.name
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener imágenes del usuario
   */
  static async getUserImages(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const images = await Image.findByUserId(userId, limit, offset);
      const totalImages = await Image.countByUserId(userId);

      res.json({
        success: true,
        message: 'Imágenes obtenidas exitosamente',
        data: {
          images,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(totalImages / limit),
            total_images: totalImages,
            per_page: limit
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener imagen específica
   */
  static async getImage(req, res, next) {
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

      // Verificar que el usuario es propietario o admin
      if (image.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta imagen'
        });
      }

      res.json({
        success: true,
        message: 'Imagen obtenida exitosamente',
        data: {
          image
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar imagen
   */
  static async deleteImage(req, res, next) {
    try {
      const imageId = parseInt(req.params.id);
      const userId = req.user.id;

      if (!imageId) {
        return res.status(400).json({
          success: false,
          message: 'ID de imagen inválido'
        });
      }

      // Para usuarios normales, solo pueden eliminar sus propias imágenes
      const deleted = req.user.role === 'admin' 
        ? await Image.delete(imageId)
        : await Image.delete(imageId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada o no tienes permisos para eliminarla'
        });
      }

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar imágenes
   */
  static async searchImages(req, res, next) {
    try {
      const { q: searchTerm } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Término de búsqueda requerido'
        });
      }

      const userId = req.user.role === 'admin' ? null : req.user.id;
      const images = await Image.searchByPrompt(searchTerm, userId, limit, offset);

      res.json({
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: {
          images,
          search_term: searchTerm,
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
   * Llamar a la API de Nano-Banana (simulado)
   */
  static async callNanoBananaAPI(apiKey, prompt, baseImage = null) {
    try {
      // TODO: Implementar llamada real a la API de Nano-Banana
      // Por ahora simulamos la respuesta
      
      console.log('Llamando a Nano-Banana API con:', {
        prompt: prompt.substring(0, 100) + '...',
        hasBaseImage: !!baseImage
      });

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar URL simulada (en producción sería la URL real de la imagen generada)
      const imageId = uuidv4();
      const simulatedImageUrl = `https://api.nano-banana.com/generated/${imageId}.jpg`;

      return simulatedImageUrl;

      /* 
      // Implementación real sería algo así:
      const response = await axios.post('https://api.nano-banana.com/v1/generate', {
        model: 'gemini-2.5-flash-image-preview',
        prompt: prompt,
        image: baseImage,
        // otros parámetros según la API
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.image_url;
      */

    } catch (error) {
      console.error('Error en Nano-Banana API:', error);
      throw new Error('Error al generar imagen con IA');
    }
  }
}

module.exports = ImageController;