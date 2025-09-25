# ZoraGemiX v1.0 🌟

Sistema de edición de imágenes con IA utilizando la API Nano-Banana (Gemini 2.5 Flash Image Preview).

## 🎨 Branding

**ZoraGemiX** combina "Sora" (cielo en japonés) con "Gemini" y "X" (transformación), representando la transformación de imágenes hacia nuevas dimensiones creativas.

### Logo y Colores
- **Isotipo**: Slime estilizado con efecto holográfico
- **Paleta principal**: 
  - Azul cielo neón (`#00D4FF`) - Color de acento principal
  - Gris oscuro (`#1F2937`) - Color base
  - Gradientes holográficos para efectos especiales

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Base de datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Gestión de estado**: React Context API + Hooks

## 📋 Funcionalidades

### ✅ Usuarios
- Registro y login con JWT
- Sistema de cuotas (5 imágenes iniciales)
- Roles: Admin y Usuario estándar
- Galería personal de imágenes

### ✅ Herramientas de Edición (10+)
1. **Cambiar Color** - Modificar colores de ropa, cabello, etc.
2. **Maquillaje** - Aplicar efectos de maquillaje profesional
3. **Peinado** - Cambiar estilo, tipo y color de cabello
4. **Nueva Pose** - Modificar posición y expresión
5. **Restaurar Imagen** - Mejorar calidad de imágenes antiguas
6. **Accesorios** - Agregar sombreros, gafas, joyas
7. **Mejorar Calidad** - Aumentar resolución y nitidez
8. **Quitar Elemento** - Eliminar objetos no deseados
9. **Ubicar en Maravilla** - Situar en lugares famosos
10. **Tiempo y Clima** - Modificar condiciones ambientales
11. **Combinar Imágenes** - Fusionar múltiples imágenes

### ✅ Administración
- Panel de administración completo
- Gestión de usuarios y cuotas
- CRUD de herramientas de edición
- Configuración de roles y permisos
- Gestión de API Key Nano-Banana

## 🛠️ Instalación

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- NPM o Yarn

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ZoraGemiX
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar base de datos**
```bash
# Crear la base de datos usando el archivo schema.sql
mysql -u root -p < database/schema.sql
```

4. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales
```

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:5000`.

## 📁 Estructura del Proyecto

```
ZoraGemiX/
├── package.json                 # Monorepo configuration
├── README.md
├── database/
│   └── schema.sql              # Database schema
├── logo/                       # Brand assets
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── pages/             # Route pages
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # React contexts
│   │   ├── services/          # API services
│   │   └── utils/             # Utilities
│   └── ...
└── backend/                    # Node.js + Express
    ├── config/                # Database config
    ├── controllers/           # Route controllers
    ├── middlewares/           # Express middlewares
    ├── models/               # Data models
    ├── routes/               # API routes
    └── ...
```

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zoragenix_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=development

# API Nano-Banana (se guardará en system_config)
NANO_API_KEY=
```

## 🌐 API Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Usuarios
- `GET /users/me` - Perfil del usuario actual
- `GET /images` - Lista de imágenes del usuario

### Imágenes
- `POST /images/generate` - Generar imagen con IA
- `GET /images/:id` - Obtener imagen específica

### Administración (Solo Admin)
- `GET /admin/users` - Listar todos los usuarios
- `PATCH /admin/users/:id/quota` - Modificar cuota de usuario
- `POST /admin/tools` - CRUD de herramientas
- `POST /admin/api-key` - Configurar API Key

## 🎯 Uso

1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Editor**: Subir imagen y seleccionar herramientas de edición
3. **Personalización**: Configurar opciones específicas de cada herramienta
4. **Generación**: Procesar imagen con IA
5. **Descarga**: Guardar resultado final

## 🔒 Seguridad

- Autenticación JWT con expiración configurable
- Validación de datos de entrada
- Rate limiting en endpoints críticos
- Sanitización de prompts de usuario
- Protección de rutas administrativas

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado por el equipo ZoraGemiX

---

**¡Transforma tus imágenes con el poder de la IA! 🚀**