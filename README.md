# CirculApp - Backend

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.18.2-880000?logo=mongoose\&logoColor=white)](https://mongoosejs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-1.41.3-3448C5?logo=cloudinary\&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-Academic-blue)](#)
[![Wiki](https://img.shields.io/badge/Documentation-Wiki-blue?logo=github)](https://github.com/MayraMoy/backendCirculApp/wiki)

Backend de **CirculApp**, una plataforma web de economía colaborativa orientada a la gestión integral de materiales reciclables.

El backend proporciona la API REST encargada de gestionar usuarios, autenticación, materiales, ubicaciones, validaciones, calificaciones y reportes.

> [!NOTE]
> Este repositorio corresponde exclusivamente al backend de CirculApp. El frontend se encuentra en un repositorio independiente.

## Descripción

CirculApp busca facilitar la gestión comunitaria de materiales reciclables mediante una plataforma digital que permita centralizar su publicación, búsqueda, procesamiento, validación y seguimiento.

El backend centraliza las reglas de negocio, la persistencia de datos, la autenticación y el control de acceso según los roles de usuario.

La documentación del proyecto establece una arquitectura desacoplada, separando la interfaz de usuario del procesamiento de datos y las reglas de negocio.


## Tecnologías

### Backend

| Tecnología | Versión | Uso                  |
| ---------- | ------: | -------------------- |
| Node.js    |       — | Entorno de ejecución |
| Express.js |   5.1.0 | Framework web        |
| Mongoose   |  8.18.2 | ODM para MongoDB     |
| Axios      |  1.12.2 | Cliente HTTP         |
| Morgan     |  1.10.0 | Logging HTTP         |
| Nodemon    |  3.1.10 | Desarrollo           |

### Seguridad

| Tecnología     | Versión | Uso                                 |
| -------------- | ------: | ----------------------------------- |
| JSON Web Token |   9.0.2 | Autenticación mediante tokens       |
| bcryptjs       |   3.0.2 | Hash de contraseñas                 |
| Helmet         |   8.1.0 | Cabeceras HTTP de seguridad         |
| CORS           |   2.8.5 | Control de solicitudes cross-origin |

### Archivos y almacenamiento

| Tecnología                | Versión | Uso                             |
| ------------------------- | ------: | ------------------------------- |
| Multer                    |   2.0.2 | Procesamiento de uploads        |
| Cloudinary                |  1.41.3 | Almacenamiento en la nube       |
| multer-storage-cloudinary |   4.0.0 | Integración Multer + Cloudinary |

### Variables de entorno

| Tecnología       | Versión | Uso                             |
| ---------------- | ------: | ------------------------------- |
| dotenv           |  17.2.2 | Gestión de variables de entorno |
| @dotenvx/dotenvx |  1.51.0 | Gestión avanzada de `.env`      |

La documentación técnica del proyecto especifica este stack para el backend.

## Funcionalidades

### Autenticación

* Registro de usuarios.
* Validación de roles.
* Inicio de sesión.
* Autenticación mediante JWT.
* Tokens con expiración de 7 días.
* Hash de contraseñas mediante bcrypt.
* Retorno de información del usuario autenticado.

### Gestión de materiales

* Crear materiales.
* Consultar materiales.
* Obtener detalle de un material.
* Eliminar materiales.
* Asociar materiales con su propietario.
* Registrar ubicación mediante coordenadas GPS.
* Buscar materiales mediante filtros.

### Búsqueda

La API permite filtrar materiales mediante:

* Texto.
* Título.
* Descripción.
* Categoría.
* Estado de procesamiento.
* Propietario.
* Proximidad geográfica.

### Estados de procesamiento

| Estado         | Descripción                                 |
| -------------- | ------------------------------------------- |
| `sin_procesar` | Material recién recolectado.                |
| `en_proceso`   | Material que se encuentra siendo procesado. |
| `fardado`      | Material compactado en un fardo.            |
| `validado`     | Material verificado por un gestor.          |

### Validación

Los usuarios con rol `gestor` pueden:

* Marcar materiales como fardados.
* Validar materiales.
* Participar en el seguimiento del procesamiento.

### Calificaciones

El backend permite:

* Consultar calificaciones.
* Crear evaluaciones.

### Reportes

Los administradores pueden generar reportes mediante la API administrativa.

## Roles

| Rol      | Descripción                                                   |
| -------- | ------------------------------------------------------------- |
| `user`   | Ciudadano que puede publicar y buscar materiales.             |
| `gestor` | Especialista encargado de validar materiales y marcar fardos. |
| `admin`  | Administrador del sistema.                                    |

> [!IMPORTANT]
> El acceso a determinadas operaciones depende del rol del usuario autenticado.

La definición de estos roles se encuentra en la documentación funcional de CirculApp.

## API

### Autenticación

| Método | Endpoint             | Descripción       |
| ------ | -------------------- | ----------------- |
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login`    | Iniciar sesión    |

### Materiales

| Método   | Endpoint                    | Descripción         |
| -------- | --------------------------- | ------------------- |
| `GET`    | `/api/items`                | Buscar materiales   |
| `POST`   | `/api/items`                | Crear material      |
| `GET`    | `/api/items/:id`            | Obtener material    |
| `DELETE` | `/api/items/:id`            | Eliminar material   |
| `POST`   | `/api/items/:id/mark-baled` | Marcar como fardado |

### Usuarios

| Método | Endpoint         | Descripción       |
| ------ | ---------------- | ----------------- |
| `GET`  | `/api/users/:id` | Obtener perfil    |
| `PUT`  | `/api/users/:id` | Actualizar perfil |

### Validación

| Método | Endpoint          | Descripción      |
| ------ | ----------------- | ---------------- |
| `POST` | `/api/validation` | Validar material |

### Calificaciones

| Método | Endpoint       | Descripción            |
| ------ | -------------- | ---------------------- |
| `GET`  | `/api/ratings` | Obtener calificaciones |
| `POST` | `/api/ratings` | Crear evaluación       |

### Ubicación

| Método | Endpoint        | Descripción                      |
| ------ | --------------- | -------------------------------- |
| `GET`  | `/api/location` | Obtener información de ubicación |

### Administración

| Método | Endpoint             | Descripción      |
| ------ | -------------------- | ---------------- |
| `POST` | `/api/admin/reports` | Generar reportes |

Los endpoints anteriores corresponden a los definidos en la documentación actual del proyecto.

## Requisitos previos

Antes de ejecutar el proyecto se necesita:

* Node.js.
* npm.
* MongoDB.
* Cuenta de Cloudinary para las funcionalidades que requieran almacenamiento de archivos.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/MayraMoy/backendCirculApp.git
```

### 2. Ingresar al proyecto

```bash
cd backendCirculApp
```

### 3. Instalar dependencias

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/circulapp

JWT_SECRET=tu_clave_secreta

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

| Variable                | Descripción                     |
| ----------------------- | ------------------------------- |
| `PORT`                  | Puerto del servidor.            |
| `MONGODB_URI`           | Conexión a MongoDB.             |
| `JWT_SECRET`            | Clave para firmar los JWT.      |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta Cloudinary. |
| `CLOUDINARY_API_KEY`    | API Key de Cloudinary.          |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary.       |

> [!WARNING]
> Nunca publiques el archivo `.env` ni las credenciales reales en GitHub.

## Ejecución

Para ejecutar el backend en desarrollo:

```bash
npm run dev
```

El servidor se ejecutará en:

```text
http://localhost:5000
```

La documentación original indica el puerto `5000` como configuración de desarrollo.


## Arquitectura

```text
                  ┌───────────────────┐
                  │     Frontend      │
                  │    React + Vite   │
                  └─────────┬─────────┘
                            │
                         HTTP/REST
                            │
                            ▼
                  ┌───────────────────┐
                  │      Backend      │
                  │ Node.js + Express │
                  └─────────┬─────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐      ┌─────────────┐
          │   MongoDB   │      │  Cloudinary │
          └─────────────┘      └─────────────┘
```

## Seguridad

El backend incorpora:

* JWT para autenticación.
* bcryptjs para hash de contraseñas.
* Control de acceso mediante roles.
* Helmet para cabeceras HTTP.
* CORS.
* Variables de entorno para información sensible.

> [!NOTE]
> La autenticación utiliza tokens JWT con una expiración definida de 7 días.


## Cloudinary

La gestión de archivos utiliza el siguiente flujo:

```text
Cliente
   │
   ▼
Multer
   │
   ▼
multer-storage-cloudinary
   │
   ▼
Cloudinary
```

Las credenciales necesarias deben configurarse mediante variables de entorno.

## Repositorio

[![GitHub](https://img.shields.io/badge/GitHub-BackendCirculApp-181717?logo=github)](https://github.com/MayraMoy/backendCirculApp)

Repositorio:

https://github.com/MayraMoy/backendCirculApp

## Proyecto

**CirculApp — Plataforma de Economía Colaborativa para Gestión Integral de Materiales**

Proyecto académico desarrollado en equipo.
