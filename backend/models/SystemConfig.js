const { query } = require('../config/db');

class SystemConfig {
  /**
   * Obtener configuración por clave
   */
  static async get(key) {
    try {
      const sql = 'SELECT config_value FROM system_config WHERE config_key = ?';
      const result = await query(sql, [key]);
      
      return result[0]?.config_value || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Establecer configuración
   */
  static async set(key, value) {
    try {
      const sql = `
        INSERT INTO system_config (config_key, config_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)
      `;

      await query(sql, [key, value]);
      return { key, value };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las configuraciones
   */
  static async getAll() {
    try {
      const sql = 'SELECT * FROM system_config ORDER BY config_key';
      const configs = await query(sql);
      
      // Convertir a objeto para fácil acceso
      const configObj = {};
      configs.forEach(config => {
        configObj[config.config_key] = config.config_value;
      });

      return configObj;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar configuración
   */
  static async delete(key) {
    try {
      const sql = 'DELETE FROM system_config WHERE config_key = ?';
      const result = await query(sql, [key]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener API Key de Nano-Banana
   */
  static async getNanoApiKey() {
    try {
      return await this.get('nano_api_key');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Establecer API Key de Nano-Banana
   */
  static async setNanoApiKey(apiKey) {
    try {
      return await this.set('nano_api_key', apiKey);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuración de la aplicación
   */
  static async getAppConfig() {
    try {
      const appName = await this.get('app_name');
      const appVersion = await this.get('app_version');
      const nanoApiKey = await this.get('nano_api_key');

      return {
        app_name: appName || 'SoraGemiX',
        app_version: appVersion || '1.0.0',
        has_nano_api_key: !!nanoApiKey
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar múltiples configuraciones
   */
  static async updateMultiple(configs) {
    try {
      const promises = Object.entries(configs).map(([key, value]) => 
        this.set(key, value)
      );

      await Promise.all(promises);
      return configs;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si la API Key de Nano-Banana está configurada
   */
  static async hasNanoApiKey() {
    try {
      const apiKey = await this.getNanoApiKey();
      return !!apiKey && apiKey.trim().length > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuraciones públicas (sin datos sensibles)
   */
  static async getPublicConfig() {
    try {
      const appName = await this.get('app_name');
      const appVersion = await this.get('app_version');

      return {
        app_name: appName || 'SoraGemiX',
        app_version: appVersion || '1.0.0'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SystemConfig;