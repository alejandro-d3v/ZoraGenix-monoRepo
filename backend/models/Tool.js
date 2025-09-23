const { query } = require('../config/db');

class Tool {
  /**
   * Obtener todas las herramientas
   */
  static async findAll(activeOnly = false) {
    try {
      let sql = 'SELECT * FROM tools';
      
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      
      sql += ' ORDER BY name';

      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar herramienta por ID
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM tools WHERE id = ?';
      const tools = await query(sql, [id]);
      return tools[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener herramientas disponibles para un rol específico
   */
  static async findByRole(roleId) {
    try {
      const sql = `
        SELECT t.*
        FROM tools t
        JOIN role_tools rt ON t.id = rt.tool_id
        WHERE rt.role_id = ? AND t.is_active = 1
        ORDER BY t.name
      `;

      return await query(sql, [roleId]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear una nueva herramienta
   */
  static async create({ icon, name, description, base_prompt, custom_config, is_active = true }) {
    try {
      const sql = `
        INSERT INTO tools (icon, name, description, base_prompt, custom_config, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const configJson = typeof custom_config === 'object' 
        ? JSON.stringify(custom_config) 
        : custom_config;

      const result = await query(sql, [icon, name, description, base_prompt, configJson, is_active]);
      
      return {
        id: result.insertId,
        icon,
        name,
        description,
        base_prompt,
        custom_config: configJson,
        is_active
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar herramienta
   */
  static async update(id, { icon, name, description, base_prompt, custom_config, is_active }) {
    try {
      const sql = `
        UPDATE tools 
        SET icon = ?, name = ?, description = ?, base_prompt = ?, custom_config = ?, is_active = ?
        WHERE id = ?
      `;

      const configJson = typeof custom_config === 'object' 
        ? JSON.stringify(custom_config) 
        : custom_config;

      const result = await query(sql, [icon, name, description, base_prompt, configJson, is_active, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Herramienta no encontrada');
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar herramienta
   */
  static async delete(id) {
    try {
      // Primero eliminar las asignaciones de roles
      await query('DELETE FROM role_tools WHERE tool_id = ?', [id]);
      
      // Luego eliminar la herramienta
      const sql = 'DELETE FROM tools WHERE id = ?';
      const result = await query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activar/Desactivar herramienta
   */
  static async toggleActive(id) {
    try {
      const sql = 'UPDATE tools SET is_active = NOT is_active WHERE id = ?';
      const result = await query(sql, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Herramienta no encontrada');
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuración personalizada de una herramienta
   */
  static async getCustomConfig(id) {
    try {
      const tool = await this.findById(id);
      
      if (!tool) {
        throw new Error('Herramienta no encontrada');
      }

      try {
        return typeof tool.custom_config === 'string' 
          ? JSON.parse(tool.custom_config) 
          : tool.custom_config;
      } catch (parseError) {
        console.error('Error parsing custom_config:', parseError);
        return {};
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Construir prompt basado en las opciones seleccionadas
   */
  static async buildPrompt(toolId, selectedOptions) {
    try {
      const tool = await this.findById(toolId);
      
      if (!tool) {
        throw new Error('Herramienta no encontrada');
      }

      let prompt = tool.base_prompt;
      const config = await this.getCustomConfig(toolId);

      // Reemplazar placeholders en el prompt base
      if (config.options && Array.isArray(config.options)) {
        config.options.forEach(option => {
          const optionValue = selectedOptions[option.name];
          
          if (optionValue) {
            // Construir el prompt específico de la opción
            let optionPrompt = option.prompt || '';
            
            if (option.type === 'color') {
              optionPrompt = optionPrompt.replace('{{ color }}', optionValue);
            } else if (option.type === 'select') {
              optionPrompt = optionPrompt.replace('{{ choice }}', optionValue);
            } else if (option.type === 'text') {
              optionPrompt = optionPrompt.replace('{{ value }}', optionValue);
            } else if (option.type === 'range') {
              optionPrompt = optionPrompt.replace('{{ value }}', optionValue);
            }

            // Reemplazar en el prompt base
            prompt = prompt.replace(`{{ ${option.name} }}`, optionPrompt);
          }
        });
      }

      // Manejar configuraciones especiales (como maravillas)
      if (config.maravilla && selectedOptions.maravilla) {
        prompt = prompt.replace('{{ maravilla }}', selectedOptions.maravilla);
      }

      // Limpiar placeholders no reemplazados
      prompt = prompt.replace(/\{\{\s*\w+\s*\}\}/g, '').trim();

      return prompt;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de herramientas
   */
  static async getUsageStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_tools,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_tools,
          COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_tools
        FROM tools
      `;

      const stats = await query(sql);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Tool;