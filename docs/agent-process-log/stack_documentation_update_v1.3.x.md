# Plan de revisión y actualización de documentación por stack

**IMPORTANTE: NO BORRAR ESTAS INSTRUCCIONES BAJO NINGUNA CIRCUNSTANCIA**

## Método de trabajo

Para cada stack, debemos seguir estos pasos precisos:

1. **Revisar estructura actual y contenido**

    - Verificar qué archivos existen y cuáles faltan
    - Analizar la calidad y completitud de la documentación existente

2. **Actualizar/crear documentación faltante**

    - Crear la estructura básica si no existe
    - Completar documentación siguiendo la estructura estándar
    - Asegurar consistencia con otros stacks

3. **Actualizar configuración**

    - Modificar `templates/kit-config.json` si es necesario
    - Verificar arquitecturas y versiones

4. **Probar con test-cli.js**

    - Ejecutar: `node cli/test-cli.js --stack=[nombre-stack] --path=./testing`
    - Para stacks con múltiples arquitecturas: `node cli/test-cli.js --stack=[nombre-stack] --path=./testing --architecture=[nombre-arquitectura]`

5. **Validar implementación**

    - Verificar que los archivos se generen correctamente en `./testing/.cursor/rules/rules-kit`
    - Comprobar que el contenido sea correcto y las variables se sustituyan adecuadamente

6. **Actualizar documentación de progreso**

    - Actualizar % de completitud en README.md
    - Actualizar este documento con el progreso realizado

7. **Crear commit**
    - Para cambios menores: commit tipo "fix" (incrementa versión patch 1.3.x)
    - Para completar un stack al 100%: commit tipo "feat" (incrementa versión minor 1.x.0)

Si se reciben correcciones o instrucciones adicionales durante el proceso, deberán ser documentadas e incorporadas inmediatamente a este método de trabajo.

Este documento debe mantenerse actualizado con cada avance para facilitar el seguimiento del progreso.

## Estado actual de los stacks

Basado en el README del proyecto, el estado de implementación actual es:

| Stack     | Porcentaje actual | Estado                                         |
| --------- | ----------------- | ---------------------------------------------- |
| Laravel   | 95%               | Casi completo, múltiples arquitecturas         |
| Next.js   | 85%               | Buena cobertura, soporte para App/Pages router |
| React     | 85%               | Buena cobertura, opciones de arquitectura      |
| Angular   | 55%               | Soporte básico, incluye Signals                |
| NestJS    | 45%               | Estructura básica del proyecto                 |
| Vue       | 45%               | Guías de testing, conceptos arquitectura       |
| Nuxt      | 40%               | Guías de testing, conceptos arquitectura       |
| Svelte    | 70%               | Estructura base, V3-V5, componentes, runes     |
| SvelteKit | 70%               | Routing, layouts, SSR/CSR, form actions        |
| Astro     | 20%               | Configuración básica únicamente                |
| Go        | No especificado   | Estado desconocido                             |

## Estructura estándar de documentación

Para cada stack, debemos asegurar que exista la siguiente estructura base:

```ini
templates/stacks/[stack]/
├── base/                     # Reglas comunes para todos los proyectos
│   ├── architecture-concepts.md
│   ├── best-practices.md
│   ├── naming-conventions.md
│   └── testing-best-practices.md
├── architectures/            # Reglas específicas de arquitectura
│   └── [arch_name]/
│       └── specific-rules.md
└── v[major]/                 # Overlays para versiones específicas
    └── version-specific-rules.md
└── v[range-version]/                 # Overlays para rangos de versiones ejemplo v2-3
    └── range-version-specific-rules.md
```

## Plan de trabajo por stack

### 1. Laravel (95% completo)

-   Verificar que toda la documentación existente esté completa
-   Validar documentación para Laravel 12
-   Asegurar que todas las arquitecturas (standard, ddd, hexagonal) estén bien documentadas

### 2. Next.js (85% completo)

-   Revisar soporte para Next.js 14
-   Verificar documentación específica para App Router vs Pages Router
-   Completar guías de testing específicas

### 3. React (85% completo)

-   Verificar documentación para React 18
-   Revisar opciones de arquitectura (standard, atomic, feature-sliced)
-   Completar guías de state management

### 4. Angular (55% completo)

-   Actualizar para Angular 17
-   Mejorar documentación de Signals
-   Añadir mejores prácticas específicas

### 5. NestJS (45% completo)

-   Crear documentación básica completa
-   Añadir mejores prácticas y patrones
-   Añadir documentación de testing

### 6. Vue (45% completo)

-   Mejorar soporte para Vue 3 Composition API
-   Añadir documentación para Options API
-   Completar guías arquitectónicas

### 7. Nuxt (40% completo)

-   Revisar documentación para Nuxt 3
-   Restablecer archivos desde .bak si existen
-   Añadir mejores prácticas específicas

### 8. Svelte (70% completo)

-   ✅ Crear estructura básica de documentación
-   ✅ Añadir arquitectura estándar
-   ✅ Añadir documentación específica para versiones v3, v4 y v5
-   ✅ Implementar guías para manejo de componentes y estado
-   Mejorar testing y buenas prácticas
-   Completar integración con ecosistema

### 9. SvelteKit (70% completo)

-   ✅ Crear estructura básica de documentación
-   ✅ Añadir arquitectura estándar con enfoque en routing y layouts
-   ✅ Añadir documentación específica para versiones v1 y v2
-   ✅ Implementar guías para form actions y data fetching
-   Mejorar testing y buenas prácticas
-   Completar integración con el resto del ecosistema

### 10. Astro (20% completo)

-   Expandir más allá de la configuración básica
-   Añadir mejores prácticas para contenido estático/dinámico
-   Añadir guías de integración con otros frameworks

### 11. Go (No especificado)

-   Crear estructura básica de documentación
-   Añadir mejores prácticas específicas para Go
-   Documentar patrones comunes en aplicaciones Go

## Progreso de Actualización

### Svelte (13/05/2023)

Se ha completado la implementación inicial de Svelte con un 70% de completitud:

1. Se creó la estructura base del stack, incluyendo la carpeta de arquitectura estándar
2. Se crearon carpetas específicas para las versiones v3, v4, y v5
3. Se implementaron documentos detallados para cada versión:
    - v3: Características básicas, sistema de stores, lifecycle, etc.
    - v4: Mejoras sobre v3, cambios en el compilador, soporte TypeScript, etc.
    - v5: Nueva API de "runes", reactivity system, componentes funcionales, etc.
4. Se creó documentación detallada sobre organización de componentes
5. Se ejecutaron pruebas con cli/test-cli.js para validar la implementación
6. Se actualizó el README con el nuevo porcentaje de completitud (70%)

Próximos pasos para Svelte:

-   Mejorar documentación de testing
-   Añadir más ejemplos de casos de uso complejos
-   Completar integración con el ecosistema (como SvelteKit)

### SvelteKit (13/05/2023)

Se ha completado la implementación inicial de SvelteKit con un 70% de completitud:

1. Se creó la estructura base del stack, incluyendo la carpeta de arquitectura estándar
2. Se crearon carpetas específicas para las versiones v1 y v2
3. Se implementó documentación detallada sobre:
    - Sistema de routing y layouts (arquitectura estándar)
    - Guía de implementación para SvelteKit 1.0
    - Guía de implementación para SvelteKit 2.0, con énfasis en nuevas características
4. Se cubrieron temas clave como:
    - Estructura de rutas y páginas
    - Data fetching con load functions
    - Form actions y progressive enhancement
    - SSR, CSR y SSG
    - Middleware y hooks
5. Se ejecutaron pruebas con cli/test-cli.js para validar la implementación
6. Se actualizó el README con el nuevo porcentaje de completitud (70%)

Próximos pasos para SvelteKit:

-   Mejorar documentación de testing específica
-   Añadir más ejemplos de casos de uso avanzados
-   Completar integración con herramientas y bibliotecas del ecosistema

## Proceso de actualización

Para cada stack, seguiremos estos pasos:

1. Revisar estructura actual y contenido
2. Actualizar/crear documentación faltante
3. Probar con test-cli.js para la versión específica
4. Actualizar kit-config.json si es necesario
5. Validar archivos generados en rules-kit
6. Actualizar % de completitud en README
7. Crear commit tipo patch (1.3.x) y hacer push
