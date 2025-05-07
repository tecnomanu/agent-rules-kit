# Arquitectura de Servicios en Agent Rules Kit

## Introducción

La versión 1.0.0 de Agent Rules Kit introduce una arquitectura orientada a servicios que mejora la mantenibilidad, extensibilidad y organización del código. Esta documentación explica la estructura y cómo extenderla.

## Estructura de Servicios

### BaseService

La clase base que proporciona funcionalidades compartidas entre todos los servicios:

-   **debugLog**: Registro centralizado para depuración
-   Operaciones de archivos básicas:
    -   directoryExists
    -   ensureDirectoryExists
    -   getFilesInDirectory
    -   readFile
    -   writeFile
    -   copyFile

### FileService

Gestiona todas las operaciones relacionadas con archivos y procesamiento de reglas:

-   **addFrontMatter**: Añade metadatos a contenido markdown
-   **processTemplateVariables**: Procesa variables de plantilla en contenido
-   **wrapMdToMdc**: Convierte archivos markdown a formato .mdc con frontmatter
-   **copyRuleGroup**: Copia grupos de reglas manteniendo organización

### ConfigService

Maneja la configuración del kit:

-   **loadKitConfig**: Carga la configuración desde config.json
-   **getDefaultConfig**: Proporciona configuración por defecto
-   **saveKitConfig**: Guarda la configuración en config.json

### Servicios específicos por stack

#### LaravelService

-   **copyArchitectureRules**: Copia reglas de arquitectura específicas
-   **copyVersionOverlay**: Aplica reglas específicas de versión
-   **copyBaseRules**: Copia reglas base

#### NextjsService

-   **copyArchitectureRules**: Gestiona reglas de arquitectura App/Pages
-   **copyVersionOverlay**: Aplica reglas específicas de versión
-   **copyBaseRules**: Copia reglas base

#### ReactService

-   **copyArchitectureRules**: Copia reglas de arquitectura
-   **copyTestingRules**: Copia reglas de testing
-   **copyStateManagementRules**: Copia reglas de gestión de estado
-   **copyBaseRules**: Copia reglas base

### CliService

-   Manejo de interfaz de usuario estandarizada
-   Métodos para mostrar mensajes (info, success, warning, error)
-   Métodos para solicitar input al usuario (askStack, askArchitecture, etc.)

## Cómo ampliar la arquitectura

### Añadir un nuevo stack

1. Crear una nueva clase de servicio que extienda BaseService
2. Implementar métodos específicos como copyBaseRules
3. Registrar el nuevo servicio en el código principal

Ejemplo:

```javascript
export class AngularService extends BaseService {
	constructor(options = {}) {
		super(options);
		this.fileService = options.fileService;
		this.configService = options.configService;
	}

	copyBaseRules(targetRules, versionMeta, options) {
		// Implementación específica para Angular
	}

	// Otros métodos específicos...
}
```

### Añadir nueva funcionalidad a un stack existente

Para extender un servicio existente, simplemente añade nuevos métodos a la clase correspondiente:

```javascript
// En ReactService:
copyPerformanceRules(targetRules, options = {}) {
  // Implementación para reglas de rendimiento
}
```

## Patrones de diseño utilizados

-   **Patrón Composite**: Los servicios de stack componen funcionalidades del FileService
-   **Singleton**: ConfigService mantiene una única instancia de configuración
-   **Strategy**: Diferentes implementaciones específicas por stack
-   **Factory**: Creación centralizada de servicios

## Flujo de ejecución típico

1. El usuario inicia la aplicación
2. CliService recoge los inputs del usuario
3. Se inicializan los servicios necesarios
4. El servicio correspondiente al stack seleccionado procesa las reglas
5. FileService se encarga de convertir y escribir los archivos
6. ConfigService proporciona metadatos para cada regla

## Ventajas de la nueva arquitectura

-   **Mayor cohesión**: Cada servicio tiene responsabilidades bien definidas
-   **Menor acoplamiento**: Los servicios se comunican a través de interfaces claras
-   **Extensibilidad**: Fácil adición de nuevos stacks o funcionalidades
-   **Testabilidad**: Las clases de servicio son más fáciles de probar de forma aislada
-   **Mantenibilidad**: Código más organizado y predecible
