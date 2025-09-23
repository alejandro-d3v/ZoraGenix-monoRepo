const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Crear un nuevo usuario
   */
  static async create({ name, email, password, role_id = 2 }) {
    try {
      // Hash de la contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const sql = `
        INSERT INTO users (name, email, password, role_id, quota_remaining)
        VALUES (?, ?, ?, ?, 5)
      `;

      const result = await query(sql, [name, email, hashedPassword, role_id]);
      
      return {
        id: result.insertId,
        name,
        email,
        role_id,
        quota_remaining: 5
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
      `;

      const users = await query(sql, [email]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    try {
      const sql = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;

      const users = await query(sql, [id]);
      return users[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios (para admin)
   */
  static async findAll() {
    try {
      const sql = `
        SELECT u.id, u.name, u.email, u.quota_remaining, u.created_at, u.updated_at,
               r.name as role_name, r.id as role_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
      `;

      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar cuota de usuario
   */
  static async updateQuota(userId, newQuota) {
    try {
      const sql = 'UPDATE users SET quota_remaining = ? WHERE id = ?';
      const result = await query(sql, [newQuota, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuario no encontrado');
      }

      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar contraseña de usuario
   */
  static async updatePassword(userId, newPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const sql = 'UPDATE users SET password = ? WHERE id = ?';
      const result = await query(sql, [hashedPassword, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar rol de usuario
   */
  static async updateRole(userId, roleId) {
    try {
      const sql = 'UPDATE users SET role_id = ? WHERE id = ?';
      const result = await query(sql, [roleId, userId]);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuario no encontrado');
      }

      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async delete(userId) {
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = await query(sql, [userId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN r.name = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN r.name = 'user' THEN 1 END) as regular_users,
          AVG(quota_remaining) as avg_quota,
          SUM(quota_remaining) as total_quota
        FROM users u
        JOIN roles r ON u.role_id = r.id
      `;

      const stats = await query(sql);
      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;