## Tareas Pendientes

### Refactorización Arquitectónica

-   [x] Crear una estructura de servicios en lugar de helpers:

    -   [x] Crear `services/base-service.js` con funciones compartidas como `debugLog` y `copyFiles`
    -   [x] Crear servicios específicos por stack: `laravel-service.js`, `nextjs-service.js`, `react-service.js`
    -   [x] Mover las constantes específicas de cada stack de `config.js` a cada servicio
    -   [x] Refactorizar `index.js` para hacerlo más limpio delegando a servicios

-   [x] Eliminar redundancias entre helpers de arquitectura:

    -   [x] Refactorizar `copyArchitectureRules` para que sea una función genérica
    -   [x] Usar estrategia de composición donde cada servicio aporta su comportamiento específico

-   [x] Reorganizar funcionalidades de CLI:
    -   [x] Crear `cli-service.js` para manejar la interfaz de línea de comandos
    -   [x] Separar claramente la lógica UI/UX de la lógica de procesamiento
    -   [x] Estandarizar los mensajes y emojis en un solo lugar

### Mejoras Pendientes UI/UX

-   [x] Se debe dar un alerta si la carpeta de rules-kit ya existe o si la del stack seleccionado también.
-   [x] Si la carpeta existe debería generar un backup con fecha de hoy y copiar los actuales.
-   [x] Aclarar mensaje de rutas relativas del proyecto: "Relative path to your project (if not in the root)" aclarando "from .cursor directory"
-   [x] Mover los logs a un modo debug, no eliminarlos pero si quitarlos en el modo normal.
-   [x] Sumar más colores y emojis al CLI.

### Nuevas Implementaciones

-   [x] Crear React-specific helpers para arquitecturas y state management
-   [ ] Crear Angular-specific helpers
-   [ ] Implementar arquitecturas atómicas para React
-   [ ] Implementar arquitecturas feature-sliced para React
-   [ ] Crear versión state management para Redux
-   [ ] Crear versión state management para MobX
-   [ ] Crear versión state management para Recoil
-   [ ] Crear versión state management para Zustand
-   [ ] Create testing guidelines for Svelte
-   [ ] Create testing guidelines for SvelteKit
-   [ ] Agregar documentación sobre prácticas de testing E2E para todos los frameworks
-   [ ] Add integration tests
-   [ ] Add CI/CD pipeline configuration
-   [x] Add contribution guidelines
-   [x] Add code of conduct

### Documentación

-   [ ] Actualizar el README con una mejor descripción de la nueva arquitectura
-   [ ] Documentar cómo extender con nuevos servicios
-   [ ] Actualizar la sección de Implementation Status a medida que se completan las tareas
