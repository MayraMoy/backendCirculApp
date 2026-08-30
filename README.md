# 🌐 CirculApp — Backend API

> **API RESTful para la Plataforma Web Colaborativa de Reciclaje Vecinal**  
> Servidor robusto, escalable y seguro encargado de la lógica de negocio, persistencia de datos, autenticación de usuarios, subida multimedia y reportes administrativos.

---

## 📋 Descripción del Proyecto

El **Backend de CirculApp** provee una API modular y centralizada para gestionar el flujo de reciclaje vecinal. Procesa operaciones para publicaciones de materiales, coordinación de intercambios, cálculo de reputación mediante calificaciones, administración de reportes vecinales, notificaciones y generación de métricas exportables en formato Excel para los administradores.

---

## 🚀 Tecnologías Principales

- **Entorno de Ejecución:** [Node.js](https://nodejs.org/)
- **Framework Web:** [Express.js](https://expressjs.com/) (Arquitectura MVC / Capas)
- **Base de Datos & ODM:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Autenticación y Seguridad:** [JSON Web Tokens (JWT)](https://jwt.io/), [Bcryptjs](https://github.dcodeIO/bcrypt.js), [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- **Validación de Esquemas:** [Zod](https://zod.dev/)
- **Gestión Multimedia:** [Multer](https://github.com/expressjs/multer) + [Cloudinary](https://cloudinary.com/) (`multer-storage-cloudinary`)
- **Exportación & Utilidades:** [ExcelJS](https://github.com/exceljs/exceljs), [Nodemailer](https://nodemailer.com/), [Morgan](https://github.com/expressjs/morgan)
- **Testing:** Node Test Runner & [Supertest](https://github.com/ladjs/supertest)

---

## 📁 Estructura del Proyecto

```text
backendCirculApp-main/
├── src/
│   ├── config/             # Conexión a MongoDB, Cloudinary y configuración general
│   ├── controllers/        # Controladores de la lógica de peticiones y respuestas
│   ├── middleware/         # Middlewares (Auth JWT, validación de roles, rate limit, upload)
│   ├── models/             # Esquemas de datos Mongoose (User, Item, Report, Rating, Notification)
│   ├── routes/             # Definición de rutas y endpoints de la API
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── item.routes.js
│   │   ├── location.routes.js
│   │   ├── notification.routes.js
│   │   ├── rating.routes.js
│   │   ├── report.routes.js
│   │   ├── user.routes.js
│   │   └── validation.routes.js
│   ├── services/           # Lógica de negocio desacoplada (reportes, correos, etc.)
│   ├── utils/              # Funciones auxiliares y respuestas estandarizadas
│   ├── validators/         # Esquemas de validación de entrada con Zod
│   └── app.js              # Configuración de Express, middlewares y rutas
├── tests/                  # Pruebas de integración y unitarias
├── .env.example            # Plantilla de variables de entorno
├── server.js               # Punto de entrada y arranque del servidor
└── package.json
```

---

## 🛣️ Módulos y Endpoints Principales

| Prefijo de Ruta | Descripción |
| :--- | :--- |
| `/api/auth` | Registro, inicio de sesión, renovación de token y recuperación de credenciales. |
| `/api/users` | Perfil de usuario, actualización de datos y reputación vecinal. |
| `/api/items` | CRUD de materiales reciclables, filtros por categoría y carga de imágenes. |
| `/api/location` | Coordenadas, zonas de reciclaje y puntos de encuentro. |
| `/api/ratings` | Calificaciones y reseñas entre vecinos tras completar intercambios. |
| `/api/notifications`| Avisos y notificaciones de actividad en tiempo real. |
| `/api/reports` | Creación y seguimiento de denuncias/reportes sobre publicaciones o usuarios. |
| `/api/admin` | Panel administrativo: moderación, métricas globales y exportación a Excel. |

---

## ⚙️ Instalación y Configuración Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18+)
- Instancia local de [MongoDB](https://www.mongodb.com/) o conexión a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Cuenta activa en [Cloudinary](https://cloudinary.com/) (para gestión de imágenes)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/backendCirculApp.git
cd backendCirculApp-main
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Completa los valores en tu archivo `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/circulapp
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Iniciar el servidor

**Modo Desarrollo (con recarga automática):**
```bash
npm run dev
```

**Modo Producción:**
```bash
npm start
```

El servidor estará escuchando en `http://localhost:5000`.

---

## 🧪 Pruebas Automatizadas

Para ejecutar la suite de pruebas del servidor:

```bash
npm test
```

---

## 👥 Equipo y Créditos

Este proyecto fue desarrollado colaborativamente por:

- **Mayra Moyano**
- **Ricardo Cejas**
- **Ana Luz Nieto**
- **Nahuel Aguero**

---

## 📄 Licencia

Distribuido bajo la Licencia ISC / MIT. Consulta el archivo `LICENSE` para más detalles.
