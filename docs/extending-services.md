# Extendiendo Agent Rules Kit con Nuevos Servicios

Este documento proporciona una guía paso a paso sobre cómo ampliar Agent Rules Kit con nuevos servicios para stacks adicionales o funcionalidades extendidas.

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Creando un nuevo servicio de stack](#creando-un-nuevo-servicio-de-stack)
3. [Integrando el servicio en el sistema](#integrando-el-servicio-en-el-sistema)
4. [Creando plantillas de reglas](#creando-plantillas-de-reglas)
5. [Actualizando la configuración](#actualizando-la-configuración)
6. [Pruebas](#pruebas)
7. [Ejemplo completo: Creación de un servicio para Svelte](#ejemplo-completo-creación-de-un-servicio-para-svelte)

## Requisitos previos

Antes de extender Agent Rules Kit, asegúrate de comprender:

-   La arquitectura de servicios (consulta [services-architecture.md](./services-architecture.md))
-   La estructura de directorios del proyecto
-   Las interfaces y contratos de los servicios base

## Creando un nuevo servicio de stack

### 1. Crear la clase de servicio

Crea un nuevo archivo en `cli/services/` siguiendo la convención de nombrado:

```javascript
// cli/services/svelte-service.js
import { BaseService } from './base-service.js';

export class SvelteService extends BaseService {
	constructor(options = {}) {
		super(options);
		this.fileService = options.fileService;
		this.configService = options.configService;
		this.cliService = options.cliService;

		// Configuración específica de Svelte
		this.stackName = 'svelte';
	}

	/**
	 * Copia las reglas base para Svelte
	 * @param {string} targetRules - Ruta al directorio de destino
	 * @param {object} versionMeta - Metadatos de versión
	 * @param {object} options - Opciones adicionales
	 */
	copyBaseRules(targetRules, versionMeta, options = {}) {
		this.debugLog(`Copiando reglas base de Svelte a ${targetRules}`);

		// Implementación específica para Svelte
		const { fileService } = this;

		fileService.copyRuleGroup({
			sourcePath: 'templates/stacks/svelte/base',
			targetPath: targetRules,
			variables: {
				projectPath: options.projectPath || '',
				detectedVersion: versionMeta.detectedVersion || '',
				versionRange: versionMeta.versionRange || '',
			},
		});

		return true;
	}

	/**
	 * Copia reglas de arquitectura específicas
	 * @param {string} targetRules - Ruta al directorio de destino
	 * @param {string} architecture - Nombre de la arquitectura elegida
	 * @param {object} options - Opciones adicionales
	 */
	copyArchitectureRules(targetRules, architecture, options = {}) {
		this.debugLog(
			`Copiando reglas de arquitectura ${architecture} para Svelte`
		);

		const { fileService } = this;
		const architecturePath = `templates/stacks/svelte/architectures/${architecture}`;

		if (!fileService.directoryExists(architecturePath)) {
			this.debugLog(
				`Arquitectura ${architecture} no encontrada en ${architecturePath}`
			);
			return false;
		}

		fileService.copyRuleGroup({
			sourcePath: architecturePath,
			targetPath: targetRules,
			variables: {
				projectPath: options.projectPath || '',
				architecture: architecture,
			},
		});

		return true;
	}

	/**
	 * Copia reglas específicas de una versión
	 * @param {string} targetRules - Ruta al directorio de destino
	 * @param {object} versionMeta - Metadatos de versión
	 * @param {object} options - Opciones adicionales
	 */
	copyVersionOverlay(targetRules, versionMeta, options = {}) {
		this.debugLog(
			`Buscando reglas específicas para Svelte ${versionMeta.detectedVersion}`
		);

		const { fileService } = this;
		const versionPaths = [
			`templates/stacks/svelte/v${versionMeta.majorVersion}`,
			`templates/stacks/svelte/v${versionMeta.majorVersion}-${versionMeta.minorVersion}`,
		];

		let appliedOverlay = false;

		for (const versionPath of versionPaths) {
			if (fileService.directoryExists(versionPath)) {
				this.debugLog(
					`Aplicando reglas de versión desde ${versionPath}`
				);

				fileService.copyRuleGroup({
					sourcePath: versionPath,
					targetPath: targetRules,
					variables: {
						projectPath: options.projectPath || '',
						detectedVersion: versionMeta.detectedVersion || '',
						versionRange: versionMeta.versionRange || '',
					},
				});

				appliedOverlay = true;
			}
		}

		return appliedOverlay;
	}
}
```

### 2. Implementar métodos requeridos

Tu servicio debe implementar al menos estos métodos clave:

-   **copyBaseRules**: Copia las reglas base del stack
-   **copyArchitectureRules**: Copia reglas específicas de una arquitectura
-   **copyVersionOverlay**: Copia reglas específicas de una versión

## Integrando el servicio en el sistema

### 1. Actualizar el archivo principal

Integra tu nuevo servicio en `cli/index.js`:

```javascript
// Importar el nuevo servicio
import { SvelteService } from './services/svelte-service.js';

// En la función principal, añade el servicio a las opciones
const services = {
	laravel: new LaravelService({
		fileService,
		configService,
		cliService,
		debug,
	}),
	nextjs: new NextjsService({
		fileService,
		configService,
		cliService,
		debug,
	}),
	// Añadir el nuevo servicio
	svelte: new SvelteService({
		fileService,
		configService,
		cliService,
		debug,
	}),
};

// Asegúrate de añadir el stack a las opciones del CLI
const stacks = [
	{ name: 'Laravel', value: 'laravel' },
	{ name: 'Next.js', value: 'nextjs' },
	// Añadir la nueva opción
	{ name: 'Svelte', value: 'svelte' },
];
```

## Creando plantillas de reglas

### 1. Estructura de directorios

Crea la estructura de directorios siguiendo el patrón establecido:

```
templates/
└── stacks/
    └── svelte/
        ├── base/                # Reglas base
        ├── architectures/       # Arquitecturas específicas
        │   ├── component/       # Arquitectura basada en componentes
        │   └── actions/         # Arquitectura basada en acciones
        └── v4/                  # Reglas específicas de Svelte 4
```

### 2. Crear reglas base

Crea archivos de reglas básicas en `templates/stacks/svelte/base/`:

```markdown
# Estructura de Proyecto Svelte

Este documento describe la estructura básica de un proyecto Svelte.

## Organización de Archivos

-   `src/`: Contiene el código fuente de la aplicación
    -   `components/`: Componentes reutilizables
    -   `routes/`: Páginas de la aplicación (si se usa SvelteKit)
    -   `stores/`: Almacenamiento de estado global
    -   `lib/`: Utilidades y funciones auxiliares
-   `public/`: Archivos estáticos
-   `svelte.config.js`: Configuración de Svelte
```

## Actualizando la configuración

### 1. Modificar kit-config.json

Actualiza `templates/kit-config.json` para incluir tu nuevo stack:

```json
{
	"svelte": {
		"version_ranges": {
			"3": "3.0.0 - 3.99.99",
			"4": "4.0.0 - 4.99.99"
		},
		"default_architecture": "component",
		"architectures": {
			"component": {
				"name": "Component-based",
				"description": "Estructura basada en componentes"
			},
			"actions": {
				"name": "Actions-based",
				"description": "Estructura basada en acciones"
			}
		},
		"globs": ["src/**/*.svelte", "svelte.config.js"],
		"pattern_rules": {
			"version_detection": ["package\\.json$"]
		}
	}
}
```

## Pruebas

### 1. Crear pruebas unitarias

Crea pruebas para tu nuevo servicio en `tests/cli/svelte-service.test.js`:

```javascript
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SvelteService } from '../../cli/services/svelte-service.js';

// Mock de dependencias
const mockFileService = {
	directoryExists: vi.fn().mockReturnValue(true),
	copyRuleGroup: vi.fn().mockReturnValue(true),
};

const mockConfigService = {
	// Mocks de configuración
};

const mockCliService = {
	// Mocks de CLI
};

describe('SvelteService', () => {
	let svelteService;

	beforeEach(() => {
		vi.clearAllMocks();
		svelteService = new SvelteService({
			fileService: mockFileService,
			configService: mockConfigService,
			cliService: mockCliService,
			debug: true,
		});
	});

	test('copyBaseRules copia reglas base correctamente', () => {
		const result = svelteService.copyBaseRules('target/path', {
			detectedVersion: '4.0.0',
			majorVersion: 4,
		});

		expect(result).toBe(true);
		expect(mockFileService.copyRuleGroup).toHaveBeenCalledWith(
			expect.objectContaining({
				sourcePath: 'templates/stacks/svelte/base',
			})
		);
	});

	// Más pruebas para otros métodos...
});
```

## Ejemplo completo: Creación de un servicio para Svelte

Este ejemplo muestra el proceso completo para añadir soporte para Svelte:

1. **Crear el servicio**: `cli/services/svelte-service.js`
2. **Crear plantillas**:
    - `templates/stacks/svelte/base/`
    - `templates/stacks/svelte/architectures/component/`
    - `templates/stacks/svelte/architectures/actions/`
    - `templates/stacks/svelte/v4/` (para Svelte 4)
3. **Actualizar configuración** en `templates/kit-config.json`
4. **Integrar** en `cli/index.js`
5. **Crear pruebas** en `tests/cli/svelte-service.test.js`
6. **Probar manualmente** con `pnpm start`
7. **Documentar** en README.md, actualizando la sección de Implementation Status

## Buenas prácticas

-   Sigue el patrón de diseño y arquitectura existente
-   Mantén los nombres de archivos y servicios consistentes
-   Crea tests unitarios para todas las nuevas funcionalidades
-   Documenta las características específicas de tu stack
-   Proporciona reglas para las arquitecturas más comunes
-   Incluye información sobre la documentación más actualizada y mejores prácticas
