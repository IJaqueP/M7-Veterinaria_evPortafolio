# API Veterinaria - Gestión y Transacciones

Proyecto desarrollado para la evaluación de portafolio del módulo 7.

## Descripción

API RESTful para la gestión de tutores y pacientes de una clínica veterinaria, implementando operaciones CRUD completas y transacciones con Sequelize ORM.

## Tecnologías Utilizadas

- **Node.js** v22.16.0
- **Express.js** v4.21.1
- **PostgreSQL** (Base de datos relacional)
- **Sequelize** v6.37.5 (ORM)
- **dotenv** v16.4.7 (Variables de entorno)

## Estructura del Proyecto

m7-evportafolio-IVAN/
├── src/
│ ├── config/
│ │ └── db.js # Configuración de Sequelize
│ ├── controllers/
│ │ ├── tutores.js # Controlador de Tutores
│ │ └── pacientes.js # Controlador de Pacientes
│ ├── models/
│ │ ├── Tutor.js # Modelo Tutor
│ │ ├── Paciente.js # Modelo Paciente
│ │ └── index.js # Asociaciones entre modelos
│ └── routes/
│ ├── tutores.js # Rutas de Tutores
│ └── pacientes.js # Rutas de Pacientes
├── app.js # Archivo principal
├── .env # Variables de entorno
├── .gitignore
├── package.json
└── README.md

## Modelos de Datos

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

### Relación
- **Un Tutor tiene muchos Pacientes** (1:N)
- **Un Paciente pertenece a un Tutor**

## Instalación

### 1. Clonar el repositorio
bash
git clone https://github.com/IJaqueP/M7-Veterinaria_evPortafolio.git
cd M7-Veterinaria_evPortafolio

### 2. Instalar dependencias
npm install

### 3. Configurar variables de entorno
Crear archivo .env en la raíz del proyecto

DB_USER=postgres
DB_NAME=veterinaria_modulo7
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
PORT=3000

### 4. Crear la base de datos en PostreSQL
psql -U postgres
CREATE DATABASE veterinaria_modulo7;
\q

### 5. Iniciar el servidor
node app.js

El servidor estará disponible en http://localhost:3000

## 👨‍💻 Autor
Iván Jaque Pinto
GitHub: @IJaqueP
Proyecto: M7-EvaluacionModulo

## 📄 Licencia
Este proyecto fue desarrollado con fines educativos para la evaluación del Módulo 7.