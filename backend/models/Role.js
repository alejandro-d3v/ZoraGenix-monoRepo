const { query } = require('../config/db');

class Role {
  /**
   * Obtener todos los roles
   */
  static async findAll() {
    try {
      const sql = 'SELECT * FROM roles ORDER BY id';
      return await query(sql);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar rol por ID
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM roles WHERE id = ?';
      const roles = await query(sql, [id]);
      return roles[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar rol por nombre
   */
  static async findByName(name) {
    try {
      const sql = 'SELECT * FROM roles WHERE name = ?';
      const roles = await query(sql, [name]);
      return roles[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   */
  static async create({ name, description }) {
    try {
      const sql = 'INSERT INTO roles (name, description) VALUES (?, ?)';
      const result = await query(sql, [name, description]);
      
      return {
        id: result.insertId,
        name,
        description
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  static async update(id, { name, description }) {
    try {
      const sql = 'UPDATE roles SET name = ?, description = ? WHERE id = ?';
      const result = await query(sql, [name, description, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Rol no encontrado');
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar rol
   */
  static async delete(id) {
    try {
      // Verificar que no hay usuarios con este rol
      const usersWithRole = await query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id]);
      
      if (usersWithRole[0].count > 0) {
        throw new Error('No se puede eliminar el rol porque hay usuarios asignados');
      }

      const sql = 'DELETE FROM roles WHERE id = ?';
      const result = await query(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener herramientas asignadas a un rol
   */
  static async getTools(roleId) {
    try {
      const sql = `
        SELECT t.*, rt.created_at as assigned_at
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
   * Asignar herramientas a un rol
   */
  static async assignTools(roleId, toolIds) {
    try {
      // Primero eliminar todas las asignaciones existentes
      await query('DELETE FROM role_tools WHERE role_id = ?', [roleId]);

      // Luego insertar las nuevas asignaciones
      if (toolIds && toolIds.length > 0) {
        const values = toolIds.map(toolId => [roleId, toolId]);
        const placeholders = values.map(() => '(?, ?)').join(', ');
        const flatValues = values.flat();

        const sql = `INSERT INTO role_tools (role_id, tool_id) VALUES ${placeholders}`;
        await query(sql, flatValues);
      }

      return await this.getTools(roleId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener roles con sus herramientas
   */
  static async findAllWithTools() {
    try {
      const roles = await this.findAll();
      
      for (let role of roles) {
        role.tools = await this.getTools(role.id);
      }

      return roles;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Role;