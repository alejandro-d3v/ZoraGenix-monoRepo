const Joi = require('joi');
const Tool = require('../models/Tool');

// Esquemas de validación
const createToolSchema = Joi.object({
  icon: Joi.string().max(50).required(),
  name: Joi.string().max(100).required(),
  description: Joi.string().required(),
  base_prompt: Joi.string().required(),
  custom_config: Joi.object().required(),
  is_active: Joi.boolean().default(true)
});

const updateToolSchema = Joi.object({
  icon: Joi.string().max(50).optional(),
  name: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  base_prompt: Joi.string().optional(),
  custom_config: Joi.object().optional(),
  is_active: Joi.boolean().optional()
});

const buildPromptSchema = Joi.object({
  toolId: Joi.number().integer().positive().required(),
  selectedOptions: Joi.object().required()
});

class ToolController {
  /**
   * Obtener todas las herramientas
   */
  static async getAllTools(req, res, next) {
    try {
      const activeOnly = req.query.active === 'true';
      const tools = await Tool.findAll(activeOnly);

      res.json({
        success: true,
        message: 'Herramientas obtenidas exitosamente',
        data: {
          tools
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener herramientas disponibles para el usuario actual
   */
  static async getUserTools(req, res, next) {
    try {
      const userRole = req.user.role;
      let tools;

      if (userRole === 'admin') {
        // Admin tiene acceso a todas las herramientas activas
        tools = await Tool.findAll(true);
      } else {
        // Usuario normal solo ve herramientas asignadas a su rol
        const roleId = userRole === 'user' ? 2 : 1; // Asumiendo que user = 2
        tools = await Tool.findByRole(roleId);
      }

      res.json({
        success: true,
        message: 'Herramientas del usuario obtenidas exitosamente',
        data: {
          tools,
          user_role: userRole
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener herramienta específica
   */
  static async getTool(req, res, next) {
    try {
      const toolId = parseInt(req.params.id);

      if (!toolId) {
        return res.status(400).json({
          success: false,
          message: 'ID de herramienta inválido'
        });
      }

      const tool = await Tool.findById(toolId);

      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Herramienta obtenida exitosamente',
        data: {
          tool
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nueva herramienta (solo admin)
   */
  static async createTool(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = createToolSchema.validate(req.body);
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

      const newTool = await Tool.create(value);

      res.status(201).json({
        success: true,
        message: 'Herramienta creada exitosamente',
        data: {
          tool: newTool
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar herramienta (solo admin)
   */
  static async updateTool(req, res, next) {
    try {
      const toolId = parseInt(req.params.id);

      if (!toolId) {
        return res.status(400).json({
          success: false,
          message: 'ID de herramienta inválido'
        });
      }

      // Validar datos de entrada
      const { error, value } = updateToolSchema.validate(req.body);
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

      const updatedTool = await Tool.update(toolId, value);

      res.json({
        success: true,
        message: 'Herramienta actualizada exitosamente',
        data: {
          tool: updatedTool
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar herramienta (solo admin)
   */
  static async deleteTool(req, res, next) {
    try {
      const toolId = parseInt(req.params.id);

      if (!toolId) {
        return res.status(400).json({
          success: false,
          message: 'ID de herramienta inválido'
        });
      }

      const deleted = await Tool.delete(toolId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Herramienta eliminada exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Activar/Desactivar herramienta (solo admin)
   */
  static async toggleTool(req, res, next) {
    try {
      const toolId = parseInt(req.params.id);

      if (!toolId) {
        return res.status(400).json({
          success: false,
          message: 'ID de herramienta inválido'
        });
      }

      const updatedTool = await Tool.toggleActive(toolId);

      res.json({
        success: true,
        message: `Herramienta ${updatedTool.is_active ? 'activada' : 'desactivada'} exitosamente`,
        data: {
          tool: updatedTool
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener configuración personalizada de una herramienta
   */
  static async getToolConfig(req, res, next) {
    try {
      const toolId = parseInt(req.params.id);

      if (!toolId) {
        return res.status(400).json({
          success: false,
          message: 'ID de herramienta inválido'
        });
      }

      const config = await Tool.getCustomConfig(toolId);

      res.json({
        success: true,
        message: 'Configuración obtenida exitosamente',
        data: {
          tool_id: toolId,
          config
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Construir prompt basado en opciones seleccionadas
   */
  static async buildPrompt(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = buildPromptSchema.validate(req.body);
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

      const { toolId, selectedOptions } = value;

      const prompt = await Tool.buildPrompt(toolId, selectedOptions);

      res.json({
        success: true,
        message: 'Prompt construido exitosamente',
        data: {
          tool_id: toolId,
          selected_options: selectedOptions,
          generated_prompt: prompt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de herramientas
   */
  static async getToolStats(req, res, next) {
    try {
      const stats = await Tool.getUsageStats();

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
}

module.exports = ToolController;