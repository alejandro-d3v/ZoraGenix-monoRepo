const { query } = require('../config/db');

class Image {
  /**
   * Crear una nueva imagen
   */
  static async create(imageData) {
    try {
      const {
        user_id,
        image_url,
        prompt,
      } = imageData;

      // Intentar con el esquema nuevo primero
      try {
        const sql = `
          INSERT INTO images (
            user_id, image_url, prompt
          )
          VALUES (?, ?, ?)
        `;

        const result = await query(sql, [
          user_id, image_url, prompt
        ]);
        
        return {
          id: result.insertId,
          user_id,
          image_url,
          prompt,
          created_at: new Date()
        };
      } catch (error) {
        // Si falla, usar el esquema antiguo
        console.log('Usando esquema antiguo para crear imagen...');
        const fallbackSql = `
          INSERT INTO images (user_id, img_url, prompt)
          VALUES (?, ?, ?)
        `;

        const result = await query(fallbackSql, [
          user_id, 
          image_url || '', 
          prompt || ''
        ]);
        
        return {
          id: result.insertId,
          user_id,
          image_url: image_url || '',
          prompt: prompt || '',
          created_at: new Date()
        };
      }
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Buscar imagen por ID
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          i.*, 
          u.name as user_name, 
          u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `;

      const images = await query(sql, [id]);
      if (images.length === 0) return null;

      const img = images[0];
      return {
        id: img.id,
        user_id: img.user_id,
        image_url: img.image_url || img.img_url || '',
        prompt: img.prompt || '',
        created_at: img.created_at,
        updated_at: img.updated_at,
        user_name: img.user_name,
        user_email: img.user_email
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener imágenes de un usuario específico
   */
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      // Consulta compatible con ambas versiones del esquema
      const sql = `
        SELECT 
          u.email as user_email,
          i.*
        FROM images i
          JOIN users u ON i.user_id = u.id
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      // Consulta para obtener el total
      const countSql = `
        SELECT
          COUNT(*) as total
        FROM images i
        WHERE i.user_id = ?
      `;

      try {
        const [images, countResult] = await Promise.all([
          query(sql, [userId]),
          query(countSql, [userId])
        ]);

        // Normalizar los datos para compatibilidad
        const normalizedImages = images.map(img => ({
          id: img.id,
          user_id: img.user_id,
          image_url: img.image_url || img.img_url || '',
          prompt: img.prompt || '',
          created_at: img.created_at,
          updated_at: img.updated_at,
          user_name: img.user_name
        }));

        return {
          images: normalizedImages,
          total: countResult[0].total
        };
      } catch (error) {
        // Si falla con las nuevas columnas, intentar con el esquema antiguo
        console.log('Intentando con esquema antiguo...');
        const fallbackSql = `
          SELECT 
            i.*,
            u.name as user_name
          FROM images i
          JOIN users u ON i.user_id = u.id
          WHERE i.user_id = ?
          ORDER BY i.created_at DESC
          LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `;

        const [images, countResult] = await Promise.all([
          query(fallbackSql, [userId]),
          query(countSql, [userId])
        ]);

        // Normalizar para el esquema antiguo
        const normalizedImages = images.map(img => ({
          id: img.id,
          user_id: img.user_id,
          image_url: img.image_url || img.img_url || '',
          prompt: img.prompt || '',
          created_at: img.created_at,
          updated_at: img.updated_at,
          user_name: img.user_name
        }));

        return {
          images: normalizedImages,
          total: countResult[0].total
        };
      }
    } catch (error) {
      console.error('Error en findByUserId:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las imágenes (para admin)
   */
  static async findAll(limit = 100, offset = 0) {
    try {
      const sql = `
        SELECT 
          i.*, 
          u.name as user_name, 
          u.email as user_email
        FROM images i
        JOIN users u ON i.user_id = u.id
        ORDER BY i.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const images = await query(sql);
      
      // Normalizar los datos
      return images.map(img => ({
        id: img.id,
        user_id: img.user_id,
        image_url: img.image_url || img.img_url || '',
        prompt: img.prompt || '',
        created_at: img.created_at,
        updated_at: img.updated_at,
        user_name: img.user_name,
        user_email: img.user_email
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar imágenes por prompt
   */
  static async searchByPrompt(userId, searchTerm, limit = 50, offset = 0) {
    try {
      const sql = `
        SELECT 
          i.*, 
          u.name as user_name
        FROM images i
        JOIN users u ON i.user_id = u.id
        WHERE i.user_id = ? 
        AND (
          COALESCE(i.original_prompt, i.prompt, '') LIKE ?
        )
        ORDER BY i.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const countSql = `
        SELECT COUNT(*) as total
        FROM images i
        WHERE i.user_id = ? 
        AND (
          COALESCE(i.original_prompt, i.prompt, '') LIKE ?
        )
      `;

      const searchPattern = `%${searchTerm}%`;
      
      const [images, countResult] = await Promise.all([
        query(sql, [userId, searchPattern]),
        query(countSql, [userId, searchPattern, searchPattern])
      ]);

      // Normalizar los datos
      const normalizedImages = images.map(img => ({
        id: img.id,
        user_id: img.user_id,
        image_url: img.image_url || img.img_url || '',
        prompt: img.prompt || '',
        created_at: img.created_at,
        updated_at: img.updated_at,
        user_name: img.user_name
      }));

      return {
        images: normalizedImages,
        total: countResult[0].total
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar imagen
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM images WHERE id = ?';
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un usuario
   */
  static async getUserStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_images,
          MIN(created_at) as first_image,
          MAX(created_at) as last_image
        FROM images 
        WHERE user_id = ?
      `;

      const result = await query(sql, [userId]);
      return result[0] || {
        total_images: 0,
        first_image: null,
        last_image: null
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales (para admin)
   */
  static async getGlobalStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_images,
          COUNT(DISTINCT user_id) as total_users_with_images,
          MIN(created_at) as first_image,
          MAX(created_at) as last_image
        FROM images
      `;

      const result = await query(sql);
      return result[0] || {
        total_images: 0,
        total_users_with_images: 0,
        first_image: null,
        last_image: null
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Image;