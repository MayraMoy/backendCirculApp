# Guía de Contribución — CirculApp Backend

<img width="2000" height="600" alt="BACKEND-C" src="https://github.com/user-attachments/assets/9d061728-f576-49f6-ab12-f2c445c0dcd0" />

Este documento establece las reglas y el flujo de trabajo que debe seguir el equipo para mantener el código organizado, facilitar la revisión de cambios y evitar conflictos durante el desarrollo.

## 1. Objetivo

Esta guía define:

* Organización de ramas.
* Ramas personales de los integrantes.
* Ramas específicas para cada tarea.
* Gestión de Issues.
* Convenciones de commits.
* Proceso de Pull Requests.
* Revisión de código.
* Resolución de conflictos.
* Criterios para realizar Merge.

Todos los integrantes deben seguir este flujo al realizar cambios en el repositorio.

## 2. Requisitos previos

Antes de comenzar a trabajar en el Backend se debe contar con:

* Git instalado.
* Node.js instalado.
* npm instalado.
* Acceso al repositorio de GitHub.
* Acceso al GitHub Project correspondiente.
* Variables de entorno configuradas.
* Acceso a MongoDB o a la instancia correspondiente.

Para conocer el proceso de instalación y configuración del proyecto, consultar el `README.md`.

## 3. Flujo general de trabajo

El flujo de trabajo utiliza una rama personal para cada integrante y ramas específicas para cada tarea.

La estructura general es:

```text
develop
   │
   ├── nombre_integrante/
   │       │
   │       ├── feature/nombre-tarea
   │       ├── fix/nombre-error
   │       └── docs/nombre-documentacion
   │
   ├── nombre_integrante/
   │       │
   │       ├── feature/nombre-tarea
   │       └── fix/nombre-error
   │
   └── nombre_integrante/
           │
           └── feature/nombre-tarea
```

El flujo consiste en:

```text
develop
   ↓
Rama personal
   ↓
Rama de la tarea
   ↓
Desarrollo
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
Revisión
   ↓
Merge a rama personal
   ↓
Integración a develop
```

# 4. Organización de ramas

## 4.1 Rama `main`

La rama `main` contiene las versiones estables del proyecto.

No se deben realizar cambios directamente sobre esta rama.

```text
main
└── Código estable
```

Los cambios deben llegar a `main` únicamente mediante el flujo de integración establecido por el equipo.

## 4.2 Rama `develop`

La rama `develop` es la rama principal de desarrollo.

Las ramas personales de los integrantes deben crearse a partir de `develop`.

```text
develop
└── Desarrollo integrado
```

No se deben realizar commits directamente sobre `develop`.

## 4.3 Ramas personales de los integrantes

Cada integrante debe contar con una rama personal creada a partir de `develop`.

Formato:

```text
nombre/
```

Ejemplos:

```text
mayra/
ricardo/
ana/
nahuel/
```

La rama personal funciona como espacio de integración individual para las tareas desarrolladas por cada integrante.

Cada integrante debe trabajar exclusivamente dentro de su propia rama personal y las ramas de tareas derivadas de ella.

## 4.4 Ramas específicas para cada tarea

Cada tarea debe desarrollarse en una rama específica creada a partir de la rama personal del integrante.

Se deben utilizar los siguientes prefijos:

### Nuevas funcionalidades

```text
feature/nombre-de-la-funcionalidad
```

Ejemplos:

```text
feature/gestion-materiales
feature/autenticacion
feature/validacion-materiales
```

### Correcciones

```text
fix/nombre-del-error
```

Ejemplos:

```text
fix/error-login
fix/validacion-usuario
fix/error-geolocalizacion
```

### Documentación

```text
docs/nombre-del-cambio
```

Ejemplos:

```text
docs/actualizar-readme
docs/documentar-api
```

# 5. Crear la rama personal

Cada integrante debe crear su rama personal a partir de `develop`.

Primero se debe actualizar `develop`:

```bash
git checkout develop
git pull origin develop
```

Luego crear la rama personal:

```bash
git checkout -b nombre/
```

Ejemplo:

```bash
git checkout -b mayra/
```

Finalmente, subir la rama al repositorio:

```bash
git push -u origin mayra/
```

La rama personal debe crearse una sola vez.

A partir de ese momento, el integrante utilizará esa rama como base para sus ramas de tareas.

# 6. Mantener actualizada la rama personal

Antes de comenzar una nueva tarea, se debe verificar que la rama personal esté actualizada respecto de `develop`.

Primero:

```bash
git checkout develop
git pull origin develop
```

Luego volver a la rama personal:

```bash
git checkout mayra/
```

Actualizarla:

```bash
git merge develop
```

Si existen conflictos, deben resolverse antes de comenzar una nueva tarea.

# 7. Crear una rama para una tarea

Una vez actualizada la rama personal, se debe crear la rama correspondiente a la tarea.

Por ejemplo, si el integrante es Mayra y debe desarrollar la gestión de materiales:

```bash
git checkout mayra/
git checkout -b feature/gestion-materiales
```

La estructura resultante será:

```text
develop
   │
   └── mayra/
          │
          └── feature/gestion-materiales
```

A partir de ese momento, todos los cambios correspondientes a esa tarea deben realizarse en:

```text
feature/gestion-materiales
```

No se deben realizar cambios directamente sobre la rama personal mientras se desarrolla una tarea.

# 8. Issues

Todas las tareas deben estar registradas mediante Issues de GitHub.

Antes de comenzar una tarea:

1. Buscar si existe un Issue relacionado.
2. Si no existe, crear uno.
3. Describir claramente la tarea.
4. Definir los criterios de aceptación.
5. Asignar un responsable.
6. Asociar el Issue al Project correspondiente.
7. Crear una rama específica para la tarea.

Cada rama de tarea debe estar relacionada con un Issue.

# 9. Convenciones de commits

Los commits deben ser claros, breves y descriptivos.

Se utilizarán los siguientes tipos:

| Tipo       | Uso                           |
| ---------- | ----------------------------- |
| `feat`     | Nueva funcionalidad           |
| `fix`      | Corrección de errores         |
| `docs`     | Documentación                 |
| `refactor` | Refactorización               |
| `test`     | Pruebas                       |
| `chore`    | Configuración o mantenimiento |

Ejemplos:

```bash
git commit -m "feat: agregar endpoint de materiales"
```

```bash
git commit -m "fix: corregir validacion de usuario"
```

```bash
git commit -m "docs: actualizar documentacion de API"
```

```bash
git commit -m "refactor: reorganizar MaterialService"
```

```bash
git commit -m "test: agregar pruebas de autenticacion"
```

Se deben evitar mensajes genéricos como:

```text
cambios
arreglos
update
final
cosas nuevas
```

El mensaje debe indicar claramente qué modificación se realizó.

# 10. Desarrollo de una tarea

Durante el desarrollo se debe:

* Trabajar únicamente sobre la rama correspondiente a la tarea.
* Mantener los cambios relacionados con el Issue.
* Evitar modificar archivos que no sean necesarios.
* Mantener la estructura existente del proyecto.
* Probar los cambios realizados.
* Evitar incorporar código temporal o innecesario.
* No subir información sensible.
* Actualizar la documentación cuando sea necesario.

# 11. Variables de entorno y datos sensibles

Está prohibido subir al repositorio:

* Contraseñas.
* Tokens.
* Claves API.
* Credenciales de bases de datos.
* Secretos JWT.
* Archivos `.env`.
* Información personal sensible.

Las variables de entorno deben permanecer fuera del control de versiones.

El archivo `.env` debe encontrarse incluido en `.gitignore`.

En la documentación se deben indicar únicamente los nombres de las variables necesarias, nunca sus valores reales.

# 12. Mantener actualizada la rama de tarea

Durante una tarea puede ser necesario incorporar cambios recientes realizados en `develop`.

Para hacerlo:

```bash
git checkout develop
git pull origin develop
```

Volver a la rama personal:

```bash
git checkout mayra/
```

Actualizar la rama personal:

```bash
git merge develop
```

Luego volver a la rama de tarea:

```bash
git checkout feature/gestion-materiales
```

Y actualizar la rama de tarea:

```bash
git merge mayra/
```

La estructura queda:

```text
develop
   ↓
mayra/
   ↓
feature/gestion-materiales
```

# 13. Verificaciones antes del Push

Antes de realizar un Push se debe comprobar:

* Que el código compile correctamente.
* Que la aplicación pueda ejecutarse.
* Que la funcionalidad desarrollada funcione.
* Que las validaciones disponibles hayan sido ejecutadas.
* Que no existan errores evidentes.
* Que no se hayan agregado credenciales.
* Que los cambios correspondan al Issue.
* Que no se hayan modificado archivos innecesariamente.

# 14. Pull Requests

Las ramas de tareas no deben integrarse directamente en `develop`.

El primer Pull Request debe realizarse hacia la rama personal del integrante.

Ejemplo:

```text
feature/gestion-materiales
              ↓
           mayra/
```

El Pull Request debe:

* Tener un título descriptivo.
* Indicar el Issue relacionado.
* Explicar los cambios realizados.
* Indicar las pruebas realizadas.
* Completar el checklist correspondiente.
* Solicitar revisión a otro integrante.

Ejemplo de título:

```text
feat: implementar gestión de materiales
```

# 15. Integración de la rama personal

Una vez que las ramas de tareas hayan sido revisadas y aprobadas, los cambios pueden integrarse en la rama personal del integrante.

Ejemplo:

```text
mayra/
   ├── feature/gestion-materiales
   ├── feature/autenticacion
   └── fix/error-login
```

Después de que las tareas correspondientes hayan sido revisadas, la rama personal contiene los cambios desarrollados por ese integrante.

La rama personal podrá integrarse posteriormente a `develop` mediante el Pull Request correspondiente.

# 16. Revisión de código

Los Pull Requests deben ser revisados por otro integrante del equipo antes de realizar el Merge.

Durante la revisión se debe comprobar:

* Que el cambio resuelva el objetivo del Issue.
* Que el código sea comprensible.
* Que respete la arquitectura del proyecto.
* Que no introduzca errores evidentes.
* Que no contenga información sensible.
* Que las pruebas correspondientes hayan sido realizadas.
* Que la documentación esté actualizada cuando corresponda.

Los comentarios de revisión deben ser respondidos y resueltos antes del Merge.

# 17. Criterios para realizar Merge

Un Pull Request podrá realizarse Merge cuando:

* [ ] Está asociado a un Issue.
* [ ] Cumple los criterios de aceptación.
* [ ] La funcionalidad fue probada.
* [ ] El proyecto funciona correctamente.
* [ ] Las validaciones disponibles fueron ejecutadas.
* [ ] El CI finaliza correctamente, cuando corresponda.
* [ ] El código fue revisado por otro integrante.
* [ ] Los comentarios de revisión fueron resueltos.
* [ ] No existen conflictos pendientes.
* [ ] No contiene credenciales ni información sensible.
* [ ] La documentación fue actualizada cuando corresponde.

No se debe realizar Merge si existen observaciones críticas pendientes.


# 18. Resolución de conflictos

Si aparecen conflictos entre ramas, el integrante responsable debe resolverlos antes de realizar el Merge.

Primero actualizar `develop`:

```bash
git checkout develop
git pull origin develop
```

Actualizar la rama personal:

```bash
git checkout mayra/
git merge develop
```

Resolver los conflictos.

Después:

```bash
git add .
git commit -m "chore: resolver conflictos con develop"
git push origin mayra/
```

Luego actualizar la rama de tarea:

```bash
git checkout feature/gestion-materiales
git merge mayra/
```

Resolver cualquier conflicto adicional y volver a probar el proyecto.

# 19. Finalización de una tarea

Una tarea se considera finalizada cuando:

* Cumple los criterios de aceptación del Issue.
* El código fue probado.
* Se creó el Pull Request.
* El código fue revisado.
* Las observaciones fueron resueltas.
* El Pull Request fue aprobado.
* Los cambios fueron integrados a la rama personal.
* El Issue fue actualizado.
* El Project fue actualizado.

# 20. Integración a `develop`

Cuando la rama personal contenga las tareas correspondientes y se encuentre en condiciones de integración, se realizará un Pull Request:

```text
mayra/
   ↓
develop
```

Antes de solicitar la integración se debe:

* Actualizar la rama personal con `develop`.
* Verificar que no existan conflictos.
* Verificar que las funcionalidades continúen funcionando.
* Comprobar las validaciones disponibles.
* Solicitar revisión.
* Resolver las observaciones realizadas.

La integración a `develop` requiere aprobación antes del Merge.

# 21. Recomendaciones

Para mantener el repositorio organizado:

* Cada integrante debe utilizar su propia rama personal.
* Cada tarea debe tener su propia rama.
* No realizar cambios directamente sobre `main`.
* No realizar cambios directamente sobre `develop`.
* No trabajar directamente sobre la rama personal mientras se desarrolla una tarea.
* Mantener las ramas actualizadas.
* Mantener los commits relacionados con una única tarea.
* Evitar Pull Requests excesivamente grandes.
* No mezclar funcionalidades diferentes en una misma rama.
* Mantener actualizado el Issue.
* Mantener actualizado el Project.
* Comunicar bloqueos al equipo.

# 22. Resumen del flujo

El flujo completo para cada integrante es:

```text
1. develop
      ↓
2. Crear rama personal
      ↓
3. Actualizar rama personal
      ↓
4. Crear rama de tarea
      ↓
5. Desarrollar
      ↓
6. Probar
      ↓
7. Commit
      ↓
8. Push
      ↓
9. Pull Request
      ↓
10. Revisión
      ↓
11. Resolver observaciones
      ↓
12. Merge → rama personal
      ↓
13. Actualizar rama personal
      ↓
14. Pull Request → develop
      ↓
15. Revisión
      ↓
16. Merge → develop
```

Ejemplo completo:

```text
develop
   │
   └── mayra/
          │
          ├── feature/gestion-materiales
          │        ↓
          │      PR
          │        ↓
          │      mayra/
          │
          ├── feature/autenticacion
          │        ↓
          │      PR
          │        ↓
          │      mayra/
          │
          └── fix/error-login
                   ↓
                 PR
                   ↓
                 mayra/

mayra/
   ↓
Pull Request
   ↓
develop
```

Este flujo permite que cada integrante tenga un espacio propio de integración y, al mismo tiempo, que cada tarea permanezca aislada hasta ser revisada.

