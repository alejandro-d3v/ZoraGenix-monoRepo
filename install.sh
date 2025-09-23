#!/bin/bash

# Script de instalación y configuración de SoraGemiX
echo "🚀 Instalando SoraGemiX v1.0..."
echo "=================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL no detectado. Asegúrate de tener MySQL 8.0+ instalado y ejecutándose."
fi

# Instalar dependencias del proyecto raíz
echo "📦 Instalando dependencias del proyecto raíz..."
npm install

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
cd ..

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# Crear archivo .env para backend si no existe
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creando archivo de configuración backend/.env..."
    cp backend/.env.example backend/.env
    echo "✅ Archivo backend/.env creado. Por favor configura tus variables de entorno."
fi

# Configurar base de datos
echo "🗄️  Configurando base de datos..."
echo "Por favor ejecuta el siguiente comando para crear la base de datos:"
echo "mysql -u root -p < database/schema.sql"

echo ""
echo "🎉 ¡Instalación completada!"
echo "=================================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en backend/.env"
echo "2. Crea la base de datos: mysql -u root -p < database/schema.sql"
echo "3. Ejecuta el proyecto: npm run dev"
echo ""
echo "🌐 URLs del proyecto:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Documentación completa en README.md"
echo ""
echo "¡Disfruta transformando imágenes con SoraGemiX! ✨"