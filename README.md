<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-orange?style=flat-square" alt="Estado">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=flat-square&logo=nodedotjs&logoColor=white" alt="Backend">
  <img src="https://img.shields.io/badge/Base%20de%20Datos-MongoDB-4ea94b?style=flat-square&logo=mongodb&logoColor=white" alt="Database">
  <img src="https://img.shields.io/badge/Seguridad-JWT%20%2B%20Zod-blue?style=flat-square" alt="Seguridad">
</p>

# CirculApp — Backend API

> **API RESTful para la Plataforma Web Colaborativa de Reciclaje Vecinal**  
> Servidor robusto, escalable y seguro encargado de la lógica de negocio, persistencia de datos, autenticación de usuarios, subida multimedia y reportes administrativos.

---

## Descripción del Proyecto

El **Backend de CirculApp** provee una API modular y centralizada para gestionar el flujo de reciclaje vecinal. Procesa operaciones para publicaciones de materiales, coordinación de intercambios, cálculo de reputación mediante calificaciones, administración de reportes vecinales, notificaciones y generación de métricas exportables en formato Excel para los administradores.

---

## Tecnologías Principales

- **Entorno de Ejecución:** Node.js
- **Framework Web:** Express.js (Arquitectura MVC / Capas)
- **Base de Datos & ODM:** MongoDB + Mongoose
- **Autenticación y Seguridad:** JSON Web Tokens (JWT), Bcryptjs, Helmet, CORS, Express Rate Limit
- **Validación de Esquemas:** Zod
- **Gestión Multimedia:** Multer + Cloudinary (`multer-storage-cloudinary`)
- **Exportación & Utilidades:** ExcelJS, Nodemailer, Morgan
- **Testing:** Node Test Runner & Supertest

## Equipo de desarrollo

- Mayra Moyano

- Ricardo Cejas

- Ana Luz Nieto

- Nahuel Aguero

© 2026. Todos los derechos reservados.

## Estructura del Proyecto

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
