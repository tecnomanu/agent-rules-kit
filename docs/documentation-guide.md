# Documentation Guide for Agent Rules Kit

Este documento proporciona lineamientos para crear y mejorar la documentación en Agent Rules Kit, enfocándose en una estructura mantenible y coherente que facilite tanto la generación automática como el uso de las reglas.

## Estructura de la Documentación

### 1. Reglas Globales

Las reglas globales se encuentran en `templates/global/` y aplican a todos los proyectos independientemente del framework:

```
templates/global/
├── best-practices.md      # Mejores prácticas generales
├── code-standards.md      # Estándares de código universales
├── file-guard.md          # Guía para operaciones seguras de archivos
└── log-process.md         # Documentación de procesos
```

### 2. Reglas Específicas por Framework

Cada framework tiene su propia documentación organizada de la siguiente manera:

```
templates/stacks/<framework>/
├── base/                  # Conceptos fundamentales independientes de versión
├── architectures/         # Reglas específicas por arquitectura
│   ├── standard/
│   ├── ddd/
│   └── hexagonal/
└── v<version>/            # Implementaciones específicas por versión
```

## Configuración en kit-config.json

El archivo `kit-config.json` es fundamental para definir cómo se aplican las reglas:

```json
{
	"laravel": {
		"default_architecture": "standard",
		"version_ranges": {
			"10": {
				"name": "Laravel 10-11",
				"range_name": "v10-11"
			}
		},
		"pattern_rules": {
			"<root>/app/Models/**/*.php": [
				"stacks/laravel/base/best-practices.md",
				"stacks/laravel/v10-11/model-casting.md"
			]
		},
		"architectures": {
			"standard": {
				"name": "Standard Laravel (MVC with Repositories)",
				"pattern_rules": {
					"<root>/app/Models/**/*.php": [
						"stacks/laravel/architectures/standard/models.md"
					]
				}
			}
		}
	}
}
```

### Elementos Principales

1. **default_architecture**: La arquitectura predeterminada para el stack
2. **version_ranges**: Mapeo de versiones a rangos con nombres descriptivos
3. **pattern_rules**: Asignación de reglas a patrones de archivos
4. **architectures**: Configuración de arquitecturas específicas

## Frontmatter para Reglas

Cada archivo de reglas puede incluir configuración frontmatter:

```markdown
---
globs: <root>/app/**/*.php,<root>/routes/**/*.php
alwaysApply: true
---

# Regla de Ejemplo

Contenido de la regla...
```

### Configuración de Encabezados (Frontmatter)

Es crítico que cada archivo de documentación incluya una configuración adecuada en su encabezado para determinar a qué archivos se aplicará. Hay dos enfoques recomendados:

1. **Aplicación Universal** - Usando `always: true`:

    ```markdown
    ---
    title: Mejores Prácticas
    description: Guía de mejores prácticas
    tags: [Framework, Mejores Prácticas]
    always: true
    ---
    ```

    Este enfoque hace que la regla se aplique a todos los archivos del stack sin importar su tipo o ubicación. Ideal para reglas fundamentales como convenciones de nomenclatura o mejores prácticas.

2. **Aplicación Específica** - Usando `globs`:

    ```markdown
    ---
    title: Características de la Versión X
    description: Funcionalidades específicas de la versión X
    tags: [Framework, Versión X]
    globs: <root>/src/**/*.js,<root>/config/*.js
    ---
    ```

    Este enfoque especifica patrones glob exactos para determinar a qué archivos se aplica la regla. Esto permite una granularidad precisa y es ideal para reglas específicas de componentes o características.

### Patrones Glob - Consideraciones Importantes

Al definir patrones glob en los frontmatter, es importante considerar estas limitaciones:

1. **No usar llaves con alternativas y comas**: El sistema interpreta las comas dentro de `{...}` como separadores de patrones completos, no como alternativas dentro del mismo patrón. Por ejemplo:

    **Incorrecto (no usar):**

    ```
    globs: <root>/src/**/*.{md,mdx},<root>/astro.config.{js,mjs,ts}
    ```

    **Correcto (usar patrones separados):**

    ```
    globs: <root>/src/**/*.md,<root>/src/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts
    ```

2. **Alternativa para archivos similares**: Si necesitas incluir muchas extensiones similares, considera usar un patrón más general:
    ```
    globs: <root>/src/**/*.*
    ```
    Pero ten en cuenta que esto podría incluir archivos no deseados.

> **IMPORTANTE**: Para stacks como Astro, Vue o React, se recomienda definir las reglas de aplicación directamente en los documentos usando `always: true` o `globs` específicos, en lugar de depender de los patrones en `kit-config.json`. Esto proporciona mayor flexibilidad y claridad.

## Variables de Plantilla

Utiliza variables de plantilla para hacer tu documentación dinámica:

| Variable            | Descripción                 | Ejemplo        |
| ------------------- | --------------------------- | -------------- |
| `{projectPath}`     | Ruta al proyecto            | `/path/to/app` |
| `{detectedVersion}` | Versión detectada           | `10`           |
| `{versionRange}`    | Rango de versión compatible | `v10-11`       |
| `{stack}`           | Stack tecnológico           | `laravel`      |
| `{architecture}`    | Arquitectura seleccionada   | `standard`     |

Ejemplo:

```markdown
# Guía para {stack} {versionRange}

Esta documentación aplica para proyectos usando {stack} versión {detectedVersion}.
```

## Buenas Prácticas para la Documentación

### Estructura Coherente

Cada archivo de reglas debe seguir esta estructura:

1. **Título**: Nombre claro que indique el propósito
2. **Descripción Breve**: Explicación concisa del concepto
3. **Lineamientos**: Instrucciones específicas
4. **Ejemplos**: Código ejemplificando la implementación correcta
5. **Notas de Versión**: Información sobre compatibilidad (si aplica)

### Separación de Conceptos e Implementación

-   En `base/`: Documenta conceptos sin detalles de implementación específicos
-   En `v<version>/`: Proporciona implementaciones concretas con código real
-   En `architectures/`: Detalla patrones arquitectónicos específicos

### Uso de Ejemplos

Los ejemplos deben ser:

-   Concisos pero completos
-   Ejecutables sin modificación
-   Representativos de casos de uso reales
-   Con comentarios explicativos

```php
// Ejemplo bueno: Implementación de un modelo Laravel
class User extends Model
{
    // Usar propiedades tipo
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Usar relaciones con tipo de retorno
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

## Proceso de Actualización de Documentación

1. **Identificar Carencias**: Revisar documentación existente y detectar vacíos
2. **Actualizar kit-config.json**: Añadir nuevos patrones o rangos de versión si es necesario
3. **Crear/Actualizar Reglas**: Editar archivos .md siguiendo la estructura establecida
4. **Probar Generación**: Ejecutar `npx agent-rules-kit --debug` para verificar
5. **Solicitar Revisión**: Pedir feedback antes de integrar cambios grandes

## Ejemplo de Desarrollo de Nueva Documentación

### 1. Identificar Necesidad

Supongamos que queremos añadir documentación para patrones de repositorio en Laravel.

### 2. Estructura de Archivos

```
templates/stacks/laravel/
├── base/
│   └── repository-pattern-concept.md    # Conceptos de repositorio
├── architectures/
│   └── standard/
│       └── repository-implementation.md # Implementación específica
└── v10-11/
    └── repository-example.md            # Ejemplo concreto para v10-11
```

### 3. Actualizar kit-config.json

```json
"pattern_rules": {
  "<root>/app/Repositories/**/*.php": [
    "stacks/laravel/base/repository-pattern-concept.md",
    "stacks/laravel/architectures/standard/repository-implementation.md",
    "stacks/laravel/v10-11/repository-example.md"
  ]
}
```

### 4. Crear los Archivos de Reglas

Estructura consistente en cada archivo con conceptos, lineamientos y ejemplos.

## Mejores Prácticas para Generación de Reglas

1. **Mantén la Documentación en Inglés**: Conforme a las políticas del proyecto
2. **Sé Conciso**: Evita documentación excesivamente larga
3. **Actualiza con Cada Versión**: Revisa reglas cuando hay nuevas versiones de frameworks
4. **Proporciona Contexto**: Explica por qué una práctica es recomendada
5. **Documenta Trampas Comunes**: Ayuda a evitar errores frecuentes
6. **Mantén Coherencia Visual**: Usa formatos consistentes en toda la documentación

## Uso de Scripts de Generación

Para proyectos complejos, considera crear scripts que generen documentación:

```javascript
const fs = require('fs-extra');
const path = require('path');

// Ejemplo: generar documentación para múltiples versiones
async function generateVersionDocs(framework, versions, template) {
	for (const version of versions) {
		const targetDir = path.join(
			'templates/stacks',
			framework,
			`v${version}`
		);
		await fs.ensureDir(targetDir);

		const content = fs
			.readFileSync(template, 'utf8')
			.replace('{version}', version);

		await fs.writeFile(path.join(targetDir, 'implementation.md'), content);
	}
}

// Uso
generateVersionDocs(
	'laravel',
	['8', '9', '10', '11'],
	'templates/base-template.md'
);
```

## Conclusión

La documentación efectiva es esencial para que Agent Rules Kit cumpla su misión de guiar a los agentes de IA. Siguiendo estos lineamientos, contribuirás a mantener un sistema coherente de reglas que evoluciona con las tecnologías que soporta.
