const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const SystemConfig = require('../models/SystemConfig');

/**
 * Servicio para interactuar con la API de Nano-Banana (Gemini 2.5 Flash Image Preview)
 * Maneja generación y edición de imágenes usando el SDK oficial de Google GenAI
 */
class NanoBananaService {
  constructor() {
    this.genAI = null;
    this.apiKey = null;
    this.model = 'gemini-2.5-flash-image-preview';
  }

  /**
   * Inicializar el servicio con la API Key
   */
  async initialize() {
    try {
      // Obtener API Key desde la base de datos (helper del modelo)
      const apiKey = await SystemConfig.getNanoApiKey();
      if (!apiKey) {
        throw new Error('API Key de Nano-Banana no configurada');
      }

      this.apiKey = apiKey;
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
      
      console.log('✅ Nano-Banana service inicializado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Nano-Banana service:', error.message);
      return false;
    }
  }

  /**
   * Verificar si el servicio está inicializado
   */
  isInitialized() {
    return this.genAI !== null && this.apiKey !== null;
  }

  /**
   * Generar imagen con texto solamente (sin imagen base)
   */
  async generateImageFromText(prompt, options = {}) {
    try {
      if (!this.isInitialized()) {
        await this.initialize();
      }

      if (!this.isInitialized()) {
        throw new Error('Servicio Nano-Banana no inicializado');
      }

      console.log('🎨 Generando imagen desde texto:', prompt.substring(0, 100) + '...');

      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ text: prompt }],
        ...options
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('❌ Error generando imagen desde texto:', error);
      throw new Error(`Error en Nano-Banana: ${error.message}`);
    }
  }

  /**
   * Editar imagen con texto y una imagen base
   */
  async editImageWithText(prompt, imageBase64, mimeType = 'image/png', options = {}) {
    try {
      if (!this.isInitialized()) {
        await this.initialize();
      }

      if (!this.isInitialized()) {
        throw new Error('Servicio Nano-Banana no inicializado');
      }

      console.log('✏️ Editando imagen con texto:', prompt.substring(0, 100) + '...');

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64,
          },
        },
      ];

      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: contents,
        ...options
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('❌ Error editando imagen:', error);
      throw new Error(`Error en Nano-Banana: ${error.message}`);
    }
  }

  /**
   * Trabajar con múltiples imágenes de entrada
   */
  async editMultipleImages(prompt, images, options = {}) {
    try {
      if (!this.isInitialized()) {
        await this.initialize();
      }

      if (!this.isInitialized()) {
        throw new Error('Servicio Nano-Banana no inicializado');
      }

      console.log('🖼️ Editando múltiples imágenes:', images.length, 'imágenes');

      const contents = [{ text: prompt }];

      // Agregar todas las imágenes al prompt
      images.forEach((image, index) => {
        contents.push({
          inlineData: {
            mimeType: image.mimeType || 'image/png',
            data: image.base64Data,
          },
        });
      });

      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: contents,
        ...options
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('❌ Error editando múltiples imágenes:', error);
      throw new Error(`Error en Nano-Banana: ${error.message}`);
    }
  }

  /**
   * Edición conversacional (mantiene contexto)
   */
  async createConversationalSession() {
    try {
      if (!this.isInitialized()) {
        await this.initialize();
      }

      if (!this.isInitialized()) {
        throw new Error('Servicio Nano-Banana no inicializado');
      }

      const chat = this.genAI.chats.create({ model: this.model });
      return chat;
    } catch (error) {
      console.error('❌ Error creando sesión conversacional:', error);
      throw new Error(`Error en Nano-Banana: ${error.message}`);
    }
  }

  /**
   * Enviar mensaje en sesión conversacional
   */
  async sendConversationalMessage(chat, prompt, images = []) {
    try {
      const message = [{ text: prompt }];

      // Agregar imágenes si las hay
      images.forEach(image => {
        message.push({
          inlineData: {
            mimeType: image.mimeType || 'image/png',
            data: image.base64Data,
          },
        });
      });

      const response = await chat.sendMessage({ message });
      return this.processResponse(response);
    } catch (error) {
      console.error('❌ Error en mensaje conversacional:', error);
      throw new Error(`Error en Nano-Banana: ${error.message}`);
    }
  }

  /**
   * Procesar respuesta de la API
   */
  processResponse(response) {
    try {
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No se recibieron candidatos en la respuesta');
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error('Respuesta inválida de la API');
      }

      const results = {
        text: null,
        images: [],
        metadata: {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings || []
        }
      };

      // Procesar cada parte de la respuesta
      candidate.content.parts.forEach(part => {
        if (part.text) {
          results.text = part.text;
        } else if (part.inlineData) {
          results.images.push({
            mimeType: part.inlineData.mimeType,
            base64Data: part.inlineData.data,
            size: Buffer.from(part.inlineData.data, 'base64').length
          });
        }
      });

      console.log('✅ Respuesta procesada:', {
        hasText: !!results.text,
        imageCount: results.images.length,
        finishReason: results.metadata.finishReason
      });

      return results;
    } catch (error) {
      console.error('❌ Error procesando respuesta:', error);
      throw new Error(`Error procesando respuesta: ${error.message}`);
    }
  }

  /**
   * Guardar imagen en el sistema de archivos
   */
  async saveImageToFile(base64Data, filename, uploadDir = 'uploads/generated') {
    try {
      // Crear directorio si no existe
      const fullUploadDir = path.join(process.cwd(), uploadDir);
      if (!fs.existsSync(fullUploadDir)) {
        fs.mkdirSync(fullUploadDir, { recursive: true });
      }

      // Generar nombre único si no se proporciona
      if (!filename) {
        filename = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      }

      const filePath = path.join(fullUploadDir, filename);
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(filePath, buffer);
      
      console.log('💾 Imagen guardada:', filePath);
      return {
        filename,
        path: filePath,
        relativePath: path.join(uploadDir, filename),
        size: buffer.length
      };
    } catch (error) {
      console.error('❌ Error guardando imagen:', error);
      throw new Error(`Error guardando imagen: ${error.message}`);
    }
  }

  /**
   * Convertir archivo a base64
   */
  fileToBase64(filePath) {
    try {
      const imageData = fs.readFileSync(filePath);
      return imageData.toString('base64');
    } catch (error) {
      console.error('❌ Error convirtiendo archivo a base64:', error);
      throw new Error(`Error leyendo archivo: ${error.message}`);
    }
  }

  /**
   * Obtener tipo MIME desde extensión de archivo
   */
  getMimeTypeFromExtension(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/png';
  }

  /**
   * Validar imagen base64
   */
  validateBase64Image(base64Data) {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de la imagen
   */
  getImageInfo(base64Data) {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return {
        size: buffer.length,
        sizeKB: Math.round(buffer.length / 1024),
        sizeMB: Math.round(buffer.length / (1024 * 1024) * 100) / 100
      };
    } catch (error) {
      return null;
    }
  }
}

// Crear instancia singleton
const nanoBananaService = new NanoBananaService();

module.exports = {
  NanoBananaService,
  nanoBananaService
};