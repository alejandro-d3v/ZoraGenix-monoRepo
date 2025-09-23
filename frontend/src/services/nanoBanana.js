import axios from 'axios';

/**
 * Servicio para interactuar con la API de Nano-Banana (Gemini)
 * Este archivo maneja las llamadas directas a la API de IA
 */

class NanoBananaService {
  constructor() {
    this.baseURL = 'https://api.nano-banana.com/v1'; // URL de ejemplo
    this.apiKey = null;
  }

  /**
   * Configurar API Key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Crear cliente axios con configuración
   */
  createClient() {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 segundos para generación de imágenes
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generar imagen con prompt
   */
  async generateImage(prompt, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key no configurada');
      }

      const client = this.createClient();

      const requestData = {
        model: 'gemini-2.5-flash-image-preview',
        prompt: prompt,
        ...options
      };

      console.log('🤖 Generando imagen con Nano-Banana:', {
        prompt: prompt.substring(0, 100) + '...',
        options
      });

      const response = await client.post('/generate', requestData);

      return {
        success: true,
        imageUrl: response.data.image_url,
        metadata: response.data.metadata || {}
      };

    } catch (error) {
      console.error('❌ Error en Nano-Banana API:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al generar imagen'
      };
    }
  }

  /**
   * Editar imagen existente
   */
  async editImage(imageUrl, prompt, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key no configurada');
      }

      const client = this.createClient();

      const requestData = {
        model: 'gemini-2.5-flash-image-preview',
        image_url: imageUrl,
        prompt: prompt,
        operation: 'edit',
        ...options
      };

      console.log('✏️ Editando imagen con Nano-Banana:', {
        prompt: prompt.substring(0, 100) + '...',
        options
      });

      const response = await client.post('/edit', requestData);

      return {
        success: true,
        imageUrl: response.data.image_url,
        metadata: response.data.metadata || {}
      };

    } catch (error) {
      console.error('❌ Error editando imagen:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al editar imagen'
      };
    }
  }

  /**
   * Mejorar calidad de imagen
   */
  async enhanceImage(imageUrl, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key no configurada');
      }

      const client = this.createClient();

      const requestData = {
        model: 'gemini-2.5-flash-image-preview',
        image_url: imageUrl,
        operation: 'enhance',
        ...options
      };

      console.log('🔧 Mejorando imagen con Nano-Banana');

      const response = await client.post('/enhance', requestData);

      return {
        success: true,
        imageUrl: response.data.image_url,
        metadata: response.data.metadata || {}
      };

    } catch (error) {
      console.error('❌ Error mejorando imagen:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al mejorar imagen'
      };
    }
  }

  /**
   * Verificar estado de la API
   */
  async checkStatus() {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'API Key no configurada' };
      }

      const client = this.createClient();
      const response = await client.get('/status');

      return {
        success: true,
        status: response.data.status,
        quota: response.data.quota || null
      };

    } catch (error) {
      console.error('❌ Error verificando estado de API:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al verificar estado'
      };
    }
  }

  /**
   * Obtener modelos disponibles
   */
  async getAvailableModels() {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'API Key no configurada' };
      }

      const client = this.createClient();
      const response = await client.get('/models');

      return {
        success: true,
        models: response.data.models || []
      };

    } catch (error) {
      console.error('❌ Error obteniendo modelos:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al obtener modelos'
      };
    }
  }
}

// Crear instancia singleton
const nanoBananaService = new NanoBananaService();

export default nanoBananaService;

// Funciones de utilidad para usar en componentes
export const generateImageWithAI = async (prompt, options = {}) => {
  return await nanoBananaService.generateImage(prompt, options);
};

export const editImageWithAI = async (imageUrl, prompt, options = {}) => {
  return await nanoBananaService.editImage(imageUrl, prompt, options);
};

export const enhanceImageWithAI = async (imageUrl, options = {}) => {
  return await nanoBananaService.enhanceImage(imageUrl, options);
};

export const checkNanoBananaStatus = async () => {
  return await nanoBananaService.checkStatus();
};

export const setNanoBananaApiKey = (apiKey) => {
  nanoBananaService.setApiKey(apiKey);
};