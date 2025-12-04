# API Veterinaria - Sistema de Gestión con Autenticación JWT

Proyecto desarrollado para la evaluación de portafolio del módulo 7.

## 📋 Descripción

API RESTful completa para la gestión de una clínica veterinaria, implementando:
- Sistema de autenticación con JWT (JSON Web Tokens)
- Gestión de usuarios con perfiles
- Subida de imágenes de perfil usando express-fileupload
- CRUD completo para tutores y pacientes
- Operaciones transaccionales con Sequelize ORM
- Seguridad con bcryptjs para encriptación de contraseñas

## 🚀 Tecnologías Utilizadas

- **Node.js** v18+
- **Express.js** v5.1.0
- **PostgreSQL** (Base de datos relacional)
- **Sequelize** v6.37.7 (ORM)
- **JWT** v9.0.2 (Autenticación)
- **bcryptjs** v2.4.3 (Encriptación de contraseñas)
- **express-fileupload** v1.5.0 (Subida de archivos)
- **dotenv** v17.2.3 (Variables de entorno)

## 📁 Estructura del Proyecto

```
m7-evportafolio-IVAN/
├── src/
│   ├── config/
│   │   └── db.js                 # Configuración de Sequelize
│   ├── controllers/
│   │   ├── auth.js               # Controlador de autenticación
│   │   ├── usuarios.js           # Controlador de usuarios
│   │   ├── tutores.js            # Controlador de tutores
│   │   └── pacientes.js          # Controlador de pacientes
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   ├── models/
│   │   ├── Usuario.js            # Modelo Usuario
│   │   ├── Tutor.js              # Modelo Tutor
│   │   ├── Paciente.js           # Modelo Paciente
│   │   └── index.js              # Asociaciones entre modelos
│   └── routes/
│       ├── auth.js               # Rutas de autenticación
│       ├── usuarios.js           # Rutas de usuarios
│       ├── tutores.js            # Rutas de tutores
│       └── pacientes.js          # Rutas de pacientes
├── uploads/                      # Carpeta para imágenes de perfil
├── app.js                        # Archivo principal
├── .env                          # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Modelos de Datos

### Usuario
- `id` (INTEGER, PK, Auto-increment)
- `username` (STRING, UNIQUE, NOT NULL)
- `password` (STRING, NOT NULL) - Encriptado con bcryptjs
- `email` (STRING, UNIQUE, NOT NULL)
- `rol` (ENUM: 'admin', 'usuario', 'veterinario', DEFAULT: 'usuario')
- `imagenPerfil` (STRING, NULL)
- `refreshToken` (TEXT, NULL)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### Tutor
- `id` (INTEGER, PK, Auto-increment)
- `nombre` (STRING, NOT NULL)
- `apellido` (STRING, NOT NULL)
- `email` (STRING, UNIQUE, NOT NULL)
- `telefono` (STRING, NOT NULL)
- `direccion` (STRING, NOT NULL)

### Paciente
- `id` (INTEGER, PK, Auto-increment)
- `nombre` (STRING, NOT NULL)
- `especie` (STRING)
- `raza` (STRING)
- `edad` (INTEGER)
- `esterilizado` (BOOLEAN, DEFAULT: false)
- `sexo` (ENUM: 'Masculino', 'Femenino', NOT NULL)
- `tutor_id` (INTEGER, FK → Tutor)

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/IJaqueP/M7-EvaluacionModulo.git
cd M7-EvaluacionModulo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=3000

# Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_super_segura_12345

# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veterinaria_modulo7
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_DIALECT=postgres

# Entorno
NODE_ENV=development
```

### 4. Crear la base de datos en PostgreSQL
```bash
psql -U postgres
CREATE DATABASE veterinaria_modulo7;
\q
```

### 5. Iniciar el servidor
```bash
npm start
# O para desarrollo con nodemon:
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### 🔐 Autenticación

#### POST `/api/auth/login` - Iniciar sesión
**Request Body:**
```json
{
  "username": "ivanjaque",
  "password": "mipassword123"
}
```

**Response (200):**
```json
{
  "mensaje": "Login exitoso",
  "usuario": {
    "id": 1,
    "username": "ivanjaque",
    "email": "ivan@ejemplo.com",
    "rol": "admin",
    "imagenPerfil": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/refresh` - Refrescar token
**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "mensaje": "Token refrescado exitosamente",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/logout` - Cerrar sesión 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "mensaje": "Logout exitoso"
}
```

#### GET `/api/auth/me` - Obtener perfil autenticado 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "usuario": {
    "id": 1,
    "username": "ivanjaque",
    "email": "ivan@ejemplo.com",
    "rol": "admin",
    "imagenPerfil": "perfil_1_1234567890.jpg"
  }
}
```

### 👥 Usuarios

#### POST `/api/usuarios` - Crear usuario (Registro)
**Request Body:**
```json
{
  "username": "ivanjaque",
  "password": "mipassword123",
  "email": "ivan@ejemplo.com",
  "rol": "usuario"
}
```

**Response (201):**
```json
{
  "mensaje": "Usuario creado exitosamente",
  "usuario": {
    "id": 1,
    "username": "ivanjaque",
    "email": "ivan@ejemplo.com",
    "rol": "usuario",
    "imagenPerfil": null
  }
}
```

#### GET `/api/usuarios/:id` - Obtener usuario 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "usuario": {
    "id": 1,
    "username": "ivanjaque",
    "email": "ivan@ejemplo.com",
    "rol": "usuario",
    "imagenPerfil": "perfil_1_1234567890.jpg"
  }
}
```

#### PUT `/api/usuarios/:id` - Actualizar usuario 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "username": "ivan_nuevo",
  "email": "nuevo@ejemplo.com",
  "password": "nuevapassword123"
}
```

**Response (200):**
```json
{
  "mensaje": "Usuario actualizado exitosamente",
  "usuario": {
    "id": 1,
    "username": "ivan_nuevo",
    "email": "nuevo@ejemplo.com",
    "rol": "usuario"
  }
}
```

#### DELETE `/api/usuarios/:id` - Eliminar usuario 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "mensaje": "Usuario eliminado exitosamente"
}
```

#### POST `/api/usuarios/:id/imagen` - Subir imagen de perfil 🔒
**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `imagen`: archivo de imagen (JPEG, PNG, GIF, WEBP, máx 5MB)

**Response (200):**
```json
{
  "mensaje": "Imagen de perfil subida exitosamente",
  "imagenUrl": "/uploads/perfil_1_1234567890.jpg"
}
```

### 🔒 = Requiere autenticación (Header: `Authorization: Bearer <token>`)

## 🧪 Pruebas con Postman/Insomnia

### 1. Crear un usuario
```
POST http://localhost:3000/api/usuarios
Content-Type: application/json

{
  "username": "ivanjaque",
  "password": "mipassword123",
  "email": "ivan@ejemplo.com",
  "rol": "admin"
}
```

### 2. Iniciar sesión
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "ivanjaque",
  "password": "mipassword123"
}
```

**Copiar el `accessToken` del response**

### 3. Obtener perfil autenticado
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <accessToken>
```

### 4. Actualizar perfil
```
PUT http://localhost:3000/api/usuarios/1
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "username": "ivan_actualizado",
  "email": "nuevo@ejemplo.com"
}
```

### 5. Subir imagen de perfil
```
POST http://localhost:3000/api/usuarios/1/imagen
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

imagen: [seleccionar archivo de imagen]
```

### 6. Refrescar token (cuando expire el accessToken)
```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

## 🔐 Seguridad Implementada

1. **Encriptación de contraseñas**: Usando bcryptjs con salt rounds
2. **JWT**: Access tokens (1 hora) y Refresh tokens (7 días)
3. **Validación de archivos**: Solo imágenes, máximo 5MB
4. **Validación de datos**: Usando Sequelize validators
5. **Protección de rutas**: Middleware de autenticación
6. **Control de permisos**: Solo el usuario puede modificar su propio perfil (o admin)

## 📝 Notas Importantes

- El token de acceso expira en **1 hora**
- El refresh token expira en **7 días**
- Las contraseñas se encriptan automáticamente antes de guardarlas
- Las imágenes se guardan en la carpeta `uploads/`
- Tamaño máximo de imagen: **5 MB**
- Formatos de imagen permitidos: **JPEG, PNG, GIF, WEBP**
- Los usuarios solo pueden acceder/modificar su propio perfil (excepto admins)

## 👨‍💻 Autor

**Iván Jaque Pinto**
- GitHub: [@IJaqueP](https://github.com/IJaqueP)
- Proyecto: M7-EvaluacionModulo

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos para la evaluación del Módulo 7.

---
