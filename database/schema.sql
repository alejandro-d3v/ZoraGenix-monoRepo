-- =====================================================
-- ZoraGenix v1 - Base de Datos MySQL - FASE 1
-- =====================================================

CREATE DATABASE IF NOT EXISTS zoragenix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zoragenix_db;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  quota_remaining INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE TABLE images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  img_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_prompt TEXT NOT NULL,                -- Prompt base con placeholders {{opciones}}
  custom_config JSON,                       -- Configuraciones personalizadas en JSON
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE role_tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  tool_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_tool (role_id, tool_id)
);
CREATE TABLE system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES 
('admin', 'Administrador del sistema con acceso completo'),
('user', 'Usuario estándar con acceso limitado');

INSERT INTO tools (name, icon, description, base_prompt, custom_config) VALUES 
(
  'Cambiar Color', 
  'paintbrush',
  'Permite cambiar el color de elementos específicos en la imagen', 
  'cambiar el color de {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'camiseta', 
        'type', 'color', 
        'prompt', 'camiseta a color {{ color }}',
        'choices', JSON_ARRAY('rojo', 'azul', 'rosado')
      ),
      JSON_OBJECT(
        'name', 'pantalón', 
        'type', 'color', 
        'prompt', 'pantalón a color {{ color }}',
        'choices', JSON_ARRAY('rojo', 'azul', 'rosado')
      ),
      JSON_OBJECT(
        'name', 'pelo', 
        'type', 'color', 
        'prompt', 'pelo a color {{ color }}',
        'choices', JSON_ARRAY('rojo', 'azul', 'rosado')
      )
    )
  )
),
(
  'Maquillaje', 
  'wand-2',
  'Aplicar efectos de maquillaje profesional', 
  'aplicar maquillaje con {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'labios', 
        'type', 'color', 
        'prompt', 'labios de color {{ color }}',
        'choices', JSON_ARRAY('rojo', 'rosado', 'nude')
      ),
      JSON_OBJECT(
        'name', 'ojos', 
        'type', 'select', 
        'prompt', 'ojos con estilo {{ choice }}',
        'choices', JSON_ARRAY('natural', 'dramático', 'ahumado')
      ),
      JSON_OBJECT(
        'name', 'base', 
        'type', 'select', 
        'prompt', 'base con tono {{ choice }}',
        'choices', JSON_ARRAY('claro', 'medio', 'oscuro')
      )
    )
  )
),
-- no paso en la query
(
  'Peinado', 
  'scissors',
  'Cambiar el estilo, tipo y color de peinado', 
  'cambiar el peinado con {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'estilo', 
        'type', 'select', 
        'prompt', 'peinado estilo {{ choice }}',
        'choices', JSON_ARRAY('liso', 'rizado', 'ondulado', 'mohawk', 'trenzas')
      ),
      JSON_OBJECT(
        'name', 'tipo', 
        'type', 'select', 
        'prompt', 'peinado tipo {{ choice }}',
        'choices', JSON_ARRAY('largo', 'corto', 'afro', 'calvo', 'bob', 'rapado')
      ),
      JSON_OBJECT(
        'name', 'color', 
        'type', 'color', 
        'prompt', 'cabello de color {{ color }}',
        'choices', JSON_ARRAY('negro', 'rubio', 'castaño', 'pelirrojo', 'gris', 'fantasía', 'rosa', 'verde', 'azul')
      ),
      JSON_OBJECT(
        'name', 'forma', 
        'type', 'select', 
        'prompt', 'cabello {{ choice }}',
        'choices', JSON_ARRAY('recogido', 'suelto')
      ),
      JSON_OBJECT(
        'name', 'flequillo', 
        'type', 'select', 
        'prompt', '{{ choice }}',
        'choices', JSON_ARRAY('con flequillo recto', 'sin flequillo', 'con flequillo de lado')
      )
    )
  )
),
(
  'Nueva Pose', 
  'move',
  'Modificar la pose de la persona en la imagen', 
  'cambiar la pose con {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'posición', 
        'type', 'select', 
        'prompt', 'en posición {{ choice }}',
        'choices', JSON_ARRAY('sentado', 'de pie', 'corriendo', 'saltando', 'acostado')
      ),
      JSON_OBJECT(
        'name', 'orientación', 
        'type', 'select', 
        'prompt', 'orientación {{ choice }}',
        'choices', JSON_ARRAY('frontal', 'perfil', 'de espaldas', 'tres cuartos')
      ),
      JSON_OBJECT(
        'name', 'acción', 
        'type', 'select', 
        'prompt', 'acción {{ choice }}',
        'choices', JSON_ARRAY('levantando las manos', 'cruzando los brazos', 'apuntando', 'tocándose la cara', 'mirando hacia arriba')
      ),
      JSON_OBJECT(
        'name', 'expresión', 
        'type', 'select', 
        'prompt', 'con expresión {{ choice }}',
        'choices', JSON_ARRAY('feliz', 'seria', 'sorprendida', 'enojada', 'neutral')
      ),
      JSON_OBJECT(
        'name', 'inclinación', 
        'type', 'select', 
        'prompt', 'inclinación {{ choice }}',
        'choices', JSON_ARRAY('hacia adelante', 'hacia atrás', 'de lado', 'recta')
      )
    )
  )
),
(
  'Restaurar Imagen', 
  'image-plus',
  'Mejorar la calidad de imágenes dañadas o antiguas', 
  'restaurar y mejorar la imagen con {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'tipo', 
        'type', 'select', 
        'prompt', 'restauración {{ choice }}',
        'choices', JSON_ARRAY('básica', 'profunda', 'conservadora', 'automática', 'colorización')
      ),
      JSON_OBJECT(
        'name', 'enfoque', 
        'type', 'select', 
        'prompt', 'mejora enfocada en {{ choice }}',
        'choices', JSON_ARRAY('detalles', 'textura', 'nitidez', 'reducción de ruido')
      ),
      JSON_OBJECT(
        'name', 'estilo', 
        'type', 'select', 
        'prompt', 'estilo final {{ choice }}',
        'choices', JSON_ARRAY('natural', 'artístico', 'vintage', 'moderno')
      )
    )
  )
),
(
  'Accesorios', 
  'sparkles',
  'Agregar accesorios a diferentes partes del cuerpo', 
  'agregar {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'cabeza', 
        'type', 'select', 
        'prompt', 'accesorio {{ choice }} en la cabeza',
        'choices', JSON_ARRAY('sombrero', 'gafas', 'auriculares', 'diadema')
      ),
      JSON_OBJECT(
        'name', 'cuello', 
        'type', 'select', 
        'prompt', 'accesorio {{ choice }} en el cuello',
        'choices', JSON_ARRAY('collar', 'cadena', 'bufanda')
      ),
      JSON_OBJECT(
        'name', 'mano', 
        'type', 'select', 
        'prompt', 'accesorio {{ choice }} en la mano',
        'choices', JSON_ARRAY('reloj', 'anillo', 'pulsera')
      )
    )
  )
),
(
  'Mejorar Calidad', 
  'wand',
  'Aumentar la resolución y nitidez de la imagen', 
  'mejorar la calidad de la imagen {{ options }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'factor', 
        'type', 'select', 
        'prompt', 'con factor {{ choice }}',
        'choices', JSON_ARRAY('2x', '4x', '8x')
      ),
      JSON_OBJECT(
        'name', 'método', 
        'type', 'select', 
        'prompt', 'usando método {{ choice }}',
        'choices', JSON_ARRAY('superresolución', 'deconvolución', 'restauración AI', 'filtrado de ruido', 'mejora de nitidez')
      ),
      JSON_OBJECT(
        'name', 'enfoque', 
        'type', 'select', 
        'prompt', 'con enfoque en {{ choice }}',
        'choices', JSON_ARRAY('textura', 'bordes', 'detalles faciales', 'colores', 'contraste')
      ),
      JSON_OBJECT(
        'name', 'reducción_ruido', 
        'type', 'select', 
        'prompt', 'reducción de ruido {{ choice }}',
        'choices', JSON_ARRAY('baja', 'media', 'alta')
      )
    )
  )
),
(
  'Quitar Elemento',
  'eraser',
  'Eliminar objetos o elementos específicos de la imagen',
  'quitar {{ options }} de la imagen',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'objeto', 
        'type', 'select', 
        'prompt', 'el objeto {{ choice }}',
        'choices', JSON_ARRAY(
          'persona', 'animal', 'vehículo', 'fondo', 'texto', 'marca de agua', 'sombra', 'mancha', 'objeto no deseado'
        )
      ),
      JSON_OBJECT(
        'name', 'detalle', 
        'type', 'text', 
        'prompt', 'con detalle "{{ value }}"'
      )
    )
  )
),
(
  'Ubicar en Maravilla',
  'landmark',
  'Situar a la persona o grupo en una de las maravillas del mundo en la imagen',
  'ubicar a la persona o grupo visitando {{ maravilla }} {{ estilo }}',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'estilo',
        'type', 'select',
        'prompt', 'con estilo {{ choice }}',
        'choices', JSON_ARRAY('posando', 'caminando', 'admirando', 'tomando fotos')
      )
    ),
    'maravilla', JSON_OBJECT(
      'name', 'maravilla',
      'type', 'select',
      'prompt', 'en {{ choice }}',
      'choices', JSON_ARRAY(
        'La Gran Muralla China',
        'Machu Picchu',
        'Petra',
        'El Coliseo',
        'Chichén Itzá',
        'El Taj Mahal',
        'Cristo Redentor'
      )
    )
  )
),
(
  'Tiempo y Clima',
  'cloud-sun',
  'Modificar las condiciones de tiempo y clima en la imagen',
  'establecer clima {{ clima }} y tiempo {{ tiempo }} en la imagen',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'clima',
        'type', 'select',
        'prompt', 'clima {{ choice }}',
        'choices', JSON_ARRAY('soleado', 'nublado', 'lluvioso', 'nevado', 'brumoso', 'tormentoso', 'ventoso')
      ),
      JSON_OBJECT(
        'name', 'tiempo',
        'type', 'select',
        'prompt', 'tiempo {{ choice }}',
        'choices', JSON_ARRAY('mañana', 'tarde', 'noche', 'amanecer', 'atardecer')
      ),
      JSON_OBJECT(
        'name', 'temperatura',
        'type', 'range',
        'prompt', 'temperatura {{ value }}°C',
        'min', -30,
        'max', 50,
        'default', 20
      )
    )
  )
),
(
  'Combinar Imágenes',
  'layers',
  'Unir dos imágenes para que los sujetos interactúen de forma coherente según su tipo',
  'combinar imagen 1 con sujeto {{ tipo1 }} y imagen 2 con sujeto {{ tipo2 }} para que {{ interacción }} de forma coherente',
  JSON_OBJECT(
    'options', JSON_ARRAY(
      JSON_OBJECT(
        'name', 'tipo1',
        'type', 'select',
        'prompt', '',
        'choices', JSON_ARRAY('persona', 'celebridad', 'vehículo', 'animal', 'objeto')
      ),
      JSON_OBJECT(
        'name', 'tipo2',
        'type', 'select',
        'prompt', '',
        'choices', JSON_ARRAY('persona', 'celebridad', 'vehículo', 'animal', 'objeto')
      ),
      JSON_OBJECT(
        'name', 'interacción',
        'type', 'select',
        'prompt', 'su interacción sea de {{ choice }}',
        'choices', JSON_ARRAY(
          'abrazar', 'besar', 'saludar', 'hablar',
          'montar', 'posar junto', 'conducir',
          'acariciar', 'alimentar',
          'sostener', 'usar',
          'interactuar de forma coherente'
        )
      )
    )
  )
);

-- Admin tiene acceso a TODAS las herramientas
INSERT INTO role_tools (role_id, tool_id) 
SELECT 1, id FROM tools;

-- Usuario normal solo tiene acceso a herramientas básicas (IDs 1, 2, 5, 7, 8)
INSERT INTO role_tools (role_id, tool_id) VALUES
(2, 1),  -- Cambiar Color
(2, 2),  -- Maquillaje  
(2, 5),  -- Restaurar Imagen
(2, 7),  -- Mejorar Calidad
(2, 8);  -- Quitar Elemento

INSERT INTO system_config (config_key, config_value) VALUES 
('nano_api_key', 'AIzaSyDNnmT8iY0a-tTjiL704MI0gYZCf1t4_P0'),
('app_name', 'ZoraGenix'),
('app_version', '1.0.0');

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_tools_active ON tools(is_active);
CREATE INDEX idx_role_tools_role ON role_tools(role_id);
CREATE INDEX idx_system_config_key ON system_config(config_key);