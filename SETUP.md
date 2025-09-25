# 🚀 Guía de Instalación y Configuración - ZoraGemiX v1.0

Esta guía te ayudará a configurar y ejecutar el sistema ZoraGemiX completo en tu entorno local.

## 📋 Requisitos Previos

### Software Requerido
- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **MySQL 8.0+** - [Descargar aquí](https://dev.mysql.com/downloads/)
- **Git** - [Descargar aquí](https://git-scm.com/)

### Verificar Instalaciones
```bash
node --version    # Debe ser 18.0.0 o superior
npm --version     # Incluido con Node.js
mysql --version   # Debe ser 8.0.0 o superior
```

## 🛠️ Instalación Automática

### Opción 1: Script de Instalación (Recomendado)
```bash
# Hacer el script ejecutable
chmod +x install.sh

# Ejecutar instalación automática
./install.sh
```

### Opción 2: Instalación Manual
```bash
# 1. Instalar dependencias del proyecto raíz
npm install

# 2. Instalar dependencias del backend
cd backend
npm install
cd ..

# 3. Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:
```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus configuraciones:
```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zoragenix_db
DB_USER=root
DB_PASSWORD=tu_password_mysql

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_cambiame_en_produccion
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=development

# API Nano-Banana (configurar después)
NANO_API_KEY=

# CORS
FRONTEND_URL=http://localhost:5173
```

### 2. Configurar Base de Datos

#### Crear la Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos y ejecutar el schema
mysql -u root -p < database/schema.sql
```

#### Verificar la Instalación
```sql
-- Conectar a MySQL y verificar
USE zoragenix_db;
SHOW TABLES;
SELECT * FROM roles;
SELECT * FROM tools LIMIT 5;
```

## 🚀 Ejecutar el Proyecto

### Desarrollo (Ambos servidores simultáneamente)
```bash
npm run dev
```

Esto iniciará:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### Ejecutar por Separado

#### Solo Backend
```bash
cd backend
npm run dev
```

#### Solo Frontend
```bash
cd frontend
npm run dev
```

## 🔧 Configuración Adicional

### 1. API Key de Nano-Banana

Una vez que el sistema esté ejecutándose:

1. Registra una cuenta de administrador
2. Ve al panel de administración
3. Configura tu API Key de Nano-Banana en la sección "Configuración"

### 2. Crear Usuario Administrador

El primer usuario que se registre puede ser promovido a administrador manualmente en la base de datos:

```sql
-- Conectar a MySQL
USE zoragenix_db;

-- Ver usuarios registrados
SELECT id, name, email, role_id FROM users;

-- Cambiar rol a administrador (role_id = 1)
UPDATE users SET role_id = 1 WHERE email = 'tu@email.com';
```

## 📱 Uso del Sistema

### Para Usuarios Normales
1. **Registro**: Crea tu cuenta en `/register`
2. **Login**: Inicia sesión en `/login`
3. **Editor**: Accede al editor de imágenes
4. **Galería**: Ve tus imágenes generadas

### Para Administradores
Además de las funciones de usuario normal:
1. **Dashboard**: Panel de control administrativo
2. **Gestión de Usuarios**: CRUD completo de usuarios
3. **Herramientas**: Configurar herramientas de edición
4. **Roles**: Asignar herramientas a roles
5. **Configuración**: API Keys y configuración del sistema

## 🔍 Verificación de la Instalación

### 1. Verificar Backend
```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "ZoraGemiX API está funcionando correctamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. Verificar Frontend
Abre http://localhost:5173 en tu navegador. Deberías ver la página de login de ZoraGemiX.

### 3. Verificar Base de Datos
```sql
USE zoragenix_db;
SELECT COUNT(*) as total_tools FROM tools;
-- Debería devolver 11 herramientas
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to MySQL"
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Iniciar MySQL si no está ejecutándose
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS
```

### Error: "Port 5000 already in use"
```bash
# Cambiar el puerto en backend/.env
PORT=5001

# O terminar el proceso que usa el puerto
lsof -ti:5000 | xargs kill -9
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Para backend y frontend por separado
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### Error: "JWT_SECRET not defined"
Asegúrate de que el archivo `backend/.env` existe y contiene todas las variables requeridas.

## 📊 Estructura de Archivos Importante

```
ZoraGemiX/
├── backend/
│   ├── .env                 # Variables de entorno (crear desde .env.example)
│   ├── server.js           # Servidor principal
│   └── config/db.js        # Configuración de base de datos
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas principales
│   │   ├── components/     # Componentes reutilizables
│   │   └── context/        # Contextos de React
├── database/
│   └── schema.sql          # Schema de base de datos
└── package.json            # Configuración del monorepo
```

## 🎯 Próximos Pasos

1. **Configurar API Key**: Obtén tu API Key de Nano-Banana
2. **Personalizar**: Modifica colores y branding según tus necesidades
3. **Desplegar**: Configura para producción cuando esté listo
4. **Monitorear**: Revisa logs y métricas de uso

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs**: `npm run dev` muestra errores en tiempo real
2. **Verifica configuración**: Asegúrate de que todas las variables de entorno estén configuradas
3. **Base de datos**: Confirma que MySQL esté ejecutándose y accesible
4. **Puertos**: Verifica que los puertos 5000 y 5173 estén disponibles

---

¡Disfruta transformando imágenes con ZoraGemiX! ✨🚀