const { query } = require('../config/db');

class Image {
  /**
   * Crear una nueva imagen
   */
  static async create({ user_id, img_url, prompt }) {
    try {
      const sql = `
        INSERT INTO images (user_id, img_url, prompt)
        VALUES (?, ?, ?)
      `;

      const result = await query(sql, [user_id, img_url, prompt]);
      
      return {
        id: result.insertId,
        user_id,
        img_url,
        prompt,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar imagen por ID
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT i.*, u.name as user_name, u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `;

      const images = await query(sql, [id]);
      return images[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener imágenes de un usuario específico
   */
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT i.*, u.name as user_name
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `;

      return await query(sql, [userId, limit, offset]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las imágenes (para admin)
   */
  static async findAll(limit = 100, offset = 0) {
    try {
      const sql = `
        SELECT i.*, u.name as user_name, u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `;

      return await query(sql, [limit, offset]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar imágenes por prompt (búsqueda)
   */
  static async searchByPrompt(searchTerm, userId = null, limit = 50, offset = 0) {
    try {
      let sql = `
        SELECT i.*, u.name as user_name, u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.prompt LIKE ?
      `;
      
      const params = [`%${searchTerm}%`];

      if (userId) {
        sql += ' AND i.user_id = ?';
        params.push(userId);
      }

      sql += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return await query(sql, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar imagen
   */
  static async delete(id, userId = null) {
    try {
      let sql = 'DELETE FROM images WHERE id = ?';
      const params = [id];

      // Si se especifica userId, solo permitir eliminar imágenes propias
      if (userId) {
        sql += ' AND user_id = ?';
        params.push(userId);
      }

      const result = await query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de imágenes
   */
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_images,
          COUNT(DISTINCT user_id) as users_with_images,
          DATE(created_at) as date,
          COUNT(*) as daily_count
        FROM images
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      const dailyStats = await query(sql);

      const totalSql = `
        SELECT 
          COUNT(*) as total_images,
          COUNT(DISTINCT user_id) as users_with_images,
          AVG(CHAR_LENGTH(prompt)) as avg_prompt_length
        FROM images
      `;

      const totalStats = await query(totalSql);

      return {
        total: totalStats[0],
        daily: dailyStats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener imágenes recientes
   */
  static async getRecent(limit = 10) {
    try {
      const sql = `
        SELECT i.*, u.name as user_name
        FROM images i
        JOIN users u ON i.user_id = u.id
        ORDER BY i.created_at DESC
        LIMIT ?
      `;

      return await query(sql, [limit]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar imágenes de un usuario
   */
  static async countByUserId(userId) {
    try {
      const sql = 'SELECT COUNT(*) as count FROM images WHERE user_id = ?';
      const result = await query(sql, [userId]);
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener imágenes por rango de fechas
   */
  static async findByDateRange(startDate, endDate, userId = null) {
    try {
      let sql = `
        SELECT i.*, u.name as user_name, u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.created_at BETWEEN ? AND ?
      `;
      
      const params = [startDate, endDate];

      if (userId) {
        sql += ' AND i.user_id = ?';
        params.push(userId);
      }

      sql += ' ORDER BY i.created_at DESC';

      return await query(sql, params);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Image;