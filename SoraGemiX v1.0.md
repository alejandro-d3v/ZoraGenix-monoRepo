Estoy en el repositorio ZoraGemiX v1.0 y necesito que construyas el
sistema con las siguientes especificaciones técnicas y requerimientos de
funcionalidades para la primera entrega parcial.

### **Stack Tecnológico** {#stack-tecnológico .unnumbered}

- **Frontend:** React + Vite + TailwindCSS

- **Backend:** Node.js con Express

- **Base de datos:** MySQL (si no es posible, puede utilizarse MariaDB
  > como alternativa)

- **Gestión de estado en frontend:** React hooks y Context API

- **Autenticación:** JWT (JSON Web Tokens)

### **Funcionalidades obligatorias del primer parcial** {#funcionalidades-obligatorias-del-primer-parcial .unnumbered}

#### **1. Registro y gestión de usuarios** {#registro-y-gestión-de-usuarios .unnumbered}

- Los usuarios deben poder registrarse en el sistema con email,
  > contraseña y nombre.

- Al registrarse, cada usuario nuevo recibe automáticamente una **cuota
  > inicial de 5 imágenes** asignadas.

- El dato de la cuota disponible debe guardarse en base de datos.

#### **2. Inicio de sesión y autenticación** {#inicio-de-sesión-y-autenticación .unnumbered}

- Login funcional con validación de credenciales.

- Todas las rutas privadas deben estar protegidas con **JWT**.

#### **3. Almacenamiento de imágenes y prompts** {#almacenamiento-de-imágenes-y-prompts .unnumbered}

- Cuando un usuario genere una imagen con la API de Gemini, se debe:

  - Guardar la **imagen** (URL o base64 según convenga)

  - Guardar el **prompt usado**

  - Guardar un **timestamp de creación**

- Toda esa información debe guardarse en la base de datos y relacionarse
  > con el usuario.

#### **4. Galería de usuario** {#galería-de-usuario .unnumbered}

- Cada usuario debe tener acceso a una galería donde pueda ver todas sus
  > imágenes generadas junto con el prompt utilizado.

#### **5. Usuario administrador** {#usuario-administrador .unnumbered}

- Debe existir un usuario **admin** con funcionalidades adicionales:

  - Listar todos los usuarios registrados.

  - Modificar la **cuota de imágenes** de cualquier usuario (ejemplo:
    > dar 10 a uno, 3 a otro, etc.).

  - El admin puede aumentar o disminuir la cuota disponible a cada
    > usuario.

  - Panel de administración para usuarios, roles, cuotas, herramientas y
    > la **API-KEY Nano-Banana**.

#### **6. Limitación de imágenes** {#limitación-de-imágenes .unnumbered}

- Los usuarios solo podrán generar imágenes mientras tengan **créditos
  > disponibles** en su cuenta.

- Al generar una nueva imagen, se descuenta **1 crédito** de su cuota.

#### **7. Herramientas de edición** {#herramientas-de-edición .unnumbered}

- El editor de fotos debe tener **mínimo 10 herramientas** de edición.

#### **8. Descarga de imágenes** {#descarga-de-imágenes .unnumbered}

- El usuario debe poder **descargar la imagen procesada** después de
  > editarla o generarla.

### **Consideraciones generales** {#consideraciones-generales .unnumbered}

- Proyecto modular y escalable.

- Código comentado con claridad.

- Rutas bien organizadas (ejemplo: api.com/auth, api.com/users,
  > api.com/images, api.com/admin).

- En frontend mantener diseño responsive con Tailwind.

- Documentación inicial en README.md con instrucciones de instalación y
  > uso.

**Tarea del agente:**

Genera toda la estructura inicial del sistema **ZoraGemiX** con las
funcionalidades antes descritas, dejando el proyecto corriendo con
backend (Node + Express + mysql) y frontend (React + Vite + Tailwind).

## **Estructura de carpetas (a crear dentro del repo)** {#estructura-de-carpetas-a-crear-dentro-del-repo .unnumbered}

Esta estructura solo es a manera de ejemplo, crear los archivos que
crear conveniente, pero manteniendo las buenas practicas y convenciones

ZoraGemiX/

│ package.json \# Raíz monorepo -- define workspaces \"frontend\" y
\"backend\"

│ README.md

│ logo/ \# Assets de branding

└─ frontend/

│ vite.config.js

│ tailwind.config.js

│ postcss.config.js

└─ src/

│ main.jsx

│ App.jsx

├─ assets/

├─ components/

│ ApiKeyInput.jsx

│ ImageUploader.jsx

│ ImagePreview.jsx

│ PromptInput.jsx

│ LoadingSpinner.jsx

│ ResultPanel.jsx

│ MetadataPanel.jsx

│ ToolPalette.jsx \# Renderiza las 10+ herramientas como íconos

│ ToolOptionsDrawer.jsx \# Panel dinámico de opciones por herramienta

├─ hooks/

│ useApiConnection.js

│ useImageUpload.js

│ useImageGeneration.js

│ useAuth.js

├─ context/

│ AuthContext.jsx

│ ToolContext.jsx

├─ pages/

│ Login.jsx

│ Register.jsx

│ Editor.jsx

│ Gallery.jsx

│ AdminDashboard.jsx

├─ services/

│ api.js \# wrapper fetch → backend

│ nanoBanana.js \# llamada directa a
models/gemini-2.5-flash-image-preview

└─ utils/

authGuard.jsx

colorUtils.js

└─ backend/

│ server.js

│ app.js

│ .env.example

├─ config/

│ db.js

├─ controllers/

│ authController.js

│ imageController.js

│ userController.js

│ adminController.js

│ toolController.js

├─ middlewares/

│ authMiddleware.js

│ quotaMiddleware.js

│ errorHandler.js

├─ models/

│ User.js

│ Role.js

│ Image.js

│ Tool.js

│ ToolOption.js

├─ routes/

│ authRoutes.js

│ userRoutes.js

│ adminRoutes.js

│ imageRoutes.js

│ toolRoutes.js

└─ migrations/

001_create_tables.sql

002_seed_admin.sql

## **Branding & UX** {#branding-ux .unnumbered}

1.  Generar un **logo vectorial** (SVG) y una marca "ZoraGemiX" cuyo
    > isotipo sea un slime estilizado con efecto holográfico.

2.  README debe explicar el **significado** y la paleta de colores
    > principal (acento azul cielo-neón + gris oscuro).

3.  Tailwind: crear theme.extend.colors.nanoBlue y fuentes
    > personalizadas.

## **Base de datos (MySQL)** {#base-de-datos-mysql .unnumbered}

### **Tablas** {#tablas .unnumbered}

| **Tabla**     | **Campos clave**                                                                   |
|---------------|------------------------------------------------------------------------------------|
| users         | id,name,email,password,role_id,quota_remaining,created_at,updated_at               |
| roles         | id,name,description,created_at,updated_at                                          |
| images        | id,user_id,img_url,prompt,created_at,updated_at                                    |
| tools         | id,icon,name,description,base_prompt,custom_config,is_active,created_at,updated_at |
| role_tools    | id,role_id,tool_id,created_at                                                      |
| system_config | id,config_key,config_value,updated_at                                              |

## **Backend -- endpoints clave** {#backend-endpoints-clave .unnumbered}

| **Método** | **Ruta**                        | **Descripción**                                       |
|------------|---------------------------------|-------------------------------------------------------|
| POST       | /auth/register                  | Registro; crea usuario con quota_remaining = 5        |
| POST       | /auth/login                     | Devuelve JWT                                          |
| GET        | /users/me                       | Perfil propio                                         |
| GET        | /images                         | Lista imágenes propias                                |
| POST       | /images/generate                | Consume **nano-banana** (verifica cuota; descuenta 1) |
| GET        | /admin/users                    | (admin) listar usuarios                               |
| PATCH      | /admin/users/:id/quota          | Cambiar cuota                                         |
| PATCH      | /admin/users/:id/reset-password | Restablecer contraseña                                |
| POST       | /admin/tools                    | CRUD de herramientas                                  |
| PATCH      | /admin/roles/:id/tools          | Asignar herramientas a rol                            |
| POST       | /admin/api-key                  | Guardar/verificar API-KEY nano-banana                 |

## **Backend - Configuración y Endpoints** {#backend---configuración-y-endpoints .unnumbered}

## Variables de entorno (.env.example) {#variables-de-entorno-.env.example .unnumbered}

## env {#env .unnumbered}

## \# Base de datos MySQL {#base-de-datos-mysql-1 .unnumbered}

## DB_HOST=localhost {#db_hostlocalhost .unnumbered}

## DB_PORT=3306 {#db_port3306 .unnumbered}

## DB_NAME=zoragenix_db {#db_namezoragenix_db .unnumbered}

## DB_USER=root {#db_userroot .unnumbered}

## DB_PASSWORD= {#db_password .unnumbered}

##  {#section .unnumbered}

## \# JWT {#jwt .unnumbered}

## JWT_SECRET=tu_jwt_secret_super_seguro {#jwt_secrettu_jwt_secret_super_seguro .unnumbered}

## JWT_EXPIRES_IN=7d {#jwt_expires_in7d .unnumbered}

##  {#section-1 .unnumbered}

## \# Servidor {#servidor .unnumbered}

## PORT=5000 {#port5000 .unnumbered}

## NODE_ENV=development {#node_envdevelopment .unnumbered}

##  {#section-2 .unnumbered}

## \# API Nano-Banana (se guardará en system_config) {#api-nano-banana-se-guardará-en-system_config .unnumbered}

## NANO_API_KEY= {#nano_api_key .unnumbered}

### **Configuración de conexión a MySQL** {#configuración-de-conexión-a-mysql .unnumbered}

## El backend debe incluir: {#el-backend-debe-incluir .unnumbered}

## Configuración de conexión MySQL usando variables de entorno

## Pool de conexiones para optimizar rendimiento

## Manejo de errores de conexión

## Middleware de autenticación JWT

## Validación de datos de entrada

## Manejo de errores centralizado

##  {#section-3 .unnumbered}

## **Frontend -- flujo detallado** {#frontend-flujo-detallado .unnumbered}

- El usuario ingresa a la plataforma y si no está logueado lo único que
  > podrá ver es la página del registrarse con la opción de
  > redireccionar al login si ya tiene cuenta; también estará presente
  > el navbar, pero solo mostrará en la parte izquierda el logo/nombre
  > ZoraGemiX y al lado izquierdo los botones de "Iniciar Sesión" y
  > "Registrarse" con estilos llamativos en el botón de "Registrarse"

- **Login / Registro** → guarda JWT en localStorage.

- Si el usuario logueado es un usuario con rol usuario u otro que no sea
  > el admin entonces el **Navbar** muestra:  
  > • Logo ZoraGemiX, links: *Galería*, *Editor  
  > * • Contador "Imágenes restantes: X/Y"  
  > • Menú Perfil (editar perfil, cambiar contraseña, cerrar sesión)  
  >   
  > Si el usuario logueado es rol admin entonces aparte de lo anterior
  > se mostrara:  
  > • Dashboard  
  > • en la página de *Galería* como es admin aparte de la galería del
  > admin podrá ver todas las imágenes generadas; dentro de la página de
  > galería debería haber una sección de "Ver todas las imágenes del
  > sistema" donde listara la galería de imágenes con el nombre del
  > usuario que la genero  
  > • Contador "Imágenes restantes: X/Y" (Para el admin no es nenesario
  > mostrar este contado)  
  > • Herramientas de edición, esta página será donde el admin podrá
  > crear las herramientas de edición, el CRUD completo más la opción de
  > activar o no la herramienta  
  > • Roles, en esta página el admin podrá administrar los roles y
  > adicional configurar por cada rol las herramientas de edición del
  > rol  
  > • Usuario, en esta página estará el CRUD completo de usuarios
  > adicional de la modificación de cuota de imágenes

- **Editor.jsx  
  > ** • ToolPalette lista mínimo 10 herramientas con ícono + nombre.  
  > • Al hacer clic, ToolOptionsDrawer carga las opciones configuradas
  > vía API.  
  > • Las elecciones se traducen **automáticamente** a un *prompt
  > composable* (construido en background) pero **no visible** aún al
  > usuario.  
  > • Botón "Personalizar Prompt" abre modal: muestra lista 1. Cambiar
  > color, 2. Maquillaje... y textarea editable del prompt generado.  
  > • Botón "Generar Imagen" → useImageGeneration llama a backend →
  > backend llama a nano-banana.  
  > • Muestra LoadingSpinner mientras espera.  
  > • ResultPanel enseña imagen y MetadataPanel enseña tiempo, tokens,
  > tamaño, etc.  
  > • Botón "Descargar" (\<a download\> con blob).

- **Galería.jsx  
  > ** Tarjetas (Masonry) con miniatura + prompt + nombre de usuario +
  > fecha.

- **AdminDashboard.jsx** (protégelo con rol)  
  > • Secciones: Usuarios, Herramientas, API-KEY, Roles.  
  > • Usuarios: tabla editable (cuota, rol, reset password).  
  > • Herramientas: CRUD completo, toggle *visible/oculta*.  
  > • Roles: asignar herramientas por rol (checkbox matrix).  
  > • API-KEY: input; al guardar hace POST /admin/api-key; muestra verde
  > ✅ éxito o rojo ❌ error.

##  **Hooks esenciales** {#hooks-esenciales .unnumbered}

js

// useApiConnection.js

export default function useApiConnection() {

/\* lee/escribe apiKey nano-banana en localStorage y hace ping
/admin/api-key/verify \*/

}

// useImageUpload.js

/\* gestiona drag&drop, valida tamaño, MIME, produce preview URL \*/

// useImageGeneration.js

/\* recibe { imageFile, toolsPayload } =\> POST /images/generate \*/

## **Paquetes NPM recomendados (agregar en package.json)** {#paquetes-npm-recomendados-agregar-en-package.json .unnumbered}

Frontend: react-router-dom, zustand o context, axios, clsx, react-icons,
color, tailwindcss, postcss, autoprefixer.  
Backend: express, mysql2, sequelize o knex, bcryptjs, jsonwebtoken,
dotenv, cors, multer, uuid.

**Backend:**

json

{

\"express\": \"\^4.18.2\",

\"mysql2\": \"\^3.6.0\",

\"bcryptjs\": \"\^2.4.3\",

\"jsonwebtoken\": \"\^9.0.2\",

\"dotenv\": \"\^16.3.1\",

\"cors\": \"\^2.8.5\",

\"helmet\": \"\^7.0.0\",

\"express-rate-limit\": \"\^6.10.0\"

}

**Frontend:**

json

{

\"react\": \"\^18.2.0\",

\"react-dom\": \"\^18.2.0\",

\"react-router-dom\": \"\^6.15.0\",

\"axios\": \"\^1.5.0\",

\"react-icons\": \"\^4.11.0\",

\"clsx\": \"\^2.0.0\"

}

## **Scripts** {#scripts .unnumbered}

package.json raíz (workspaces):

json

{

\"workspaces\": \[\"frontend\", \"backend\"\],

\"scripts\": {

\"dev\": \"concurrently -k -n FE,BE \\npm:dev \--workspace frontend\\
\\npm:start \--workspace backend\\\",

\"build\": \"npm:build \--workspace frontend\",

\"db:migrate\": \"npm run migrate \--workspace backend\"

}

}

## **README.md (generar)** {#readme.md-generar .unnumbered}

- Requisitos previos (Node 18, MySQL).

- Variables de entorno (DB_URL, JWT_SECRET, NANO_API_KEY).

- Pasos "npm install", "npm run dev".

- Breve explicación de logo y colores.

## **Reglas finales para CodeLLM** {#reglas-finales-para-codellm .unnumbered}

1.  Crea **cada archivo** con contenido real (JSX, controllers, SQL,
    > etc.).

2.  No utilices generadores CLI; escribe el boilerplate manualmente.

3.  Inserta comentarios claros y TODOs para funciones que puedan
    > ampliarse después.

4.  Asegura que el proyecto levante con npm run dev (concurrente FE+BE).
