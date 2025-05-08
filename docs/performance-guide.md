# Guía de Optimización de Rendimiento

## Introducción

Este documento describe las optimizaciones de rendimiento implementadas en el Agent Rules Kit y proporciona recomendaciones para los contribuidores que quieran mantener un alto nivel de rendimiento en futuras versiones.

## Optimizaciones implementadas

### 1. Carga dinámica de servicios

En lugar de cargar todos los servicios de pila al inicio, ahora se cargan dinámicamente bajo demanda:

```javascript
// Antes: Carga estática de todos los servicios
import { AngularService } from './services/angular-service.js';
import { LaravelService } from './services/laravel-service.js';
import { NextjsService } from './services/nextjs-service.js';
import { ReactService } from './services/react-service.js';

// Después: Carga dinámica con caché
async function loadStackService(stack) {
	// Retorna desde caché si ya fue cargado
	if (stackServices.has(stack)) {
		return stackServices.get(stack);
	}

	// Importa dinámicamente el servicio requerido
	const servicePath = `./services/${stack}-service.js`;
	const serviceModule = await import(servicePath);

	// Instanciar y cachear el servicio
	const ServiceClass =
		serviceModule[
			`${stack.charAt(0).toUpperCase() + stack.slice(1)}Service`
		];
	// ...
}
```

Beneficios:

-   Tiempo de inicio más rápido
-   Menor uso de memoria cuando solo se necesita un servicio
-   Carga más rápida en sistemas con recursos limitados

### 2. Sistema de caché para plantillas

Se implementó un sistema de caché para evitar cargar repetidamente las mismas plantillas:

```javascript
class TemplateCache {
	constructor(options = {}) {
		this.cache = new Map();
		this.maxSize = options.maxSize || 100;
		this.ttl = options.ttl || 300000; // 5 minutos
	}

	get(key) {
		const item = this.cache.get(key);
		if (item && Date.now() < item.expiry) {
			return item.value;
		}
		return null;
	}

	// ...
}
```

Beneficios:

-   Reducción de operaciones I/O repetitivas
-   Menor tiempo de generación para reglas con plantillas comunes
-   Control de memoria mediante límite de tamaño y TTL

### 3. Operaciones asíncronas de archivo

Se reemplazaron las operaciones de archivo síncronas por asíncronas:

```javascript
// Antes
const files = this.getFilesInDirectory(tmplDir);
files.forEach((f) => {
	// Operaciones síncronas
});

// Después
const files = await this.getFilesInDirectoryAsync(tmplDir);
await Promise.all(
	batch.map(async (f) => {
		// Operaciones asíncronas
	})
);
```

Beneficios:

-   Mejor rendimiento en sistemas con I/O lento
-   No bloquea el hilo principal
-   Mejor manejo de errores

### 4. Procesamiento en lotes

Para mejorar el manejo de memoria, se procesan los archivos en lotes:

```javascript
async processBatch(items, processFn, batchSize = 10) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processFn(item))
        );
        results.push(...batchResults);

        // Permitir que el event loop maneje otras tareas
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return results;
}
```

Beneficios:

-   Menor pico de memoria en proyectos grandes
-   Responsividad mejorada durante la generación
-   Evita problemas de "agotamiento de memoria"

### 5. Actualizaciones incrementales

Se implementó un sistema para regenerar solo las reglas que han cambiado:

```javascript
async needsUpdate(srcFile, destFile) {
    try {
        if (!await fs.pathExists(destFile)) return true;

        const srcStat = await fsPromises.stat(srcFile);
        const destStat = await fsPromises.stat(destFile);

        return srcStat.mtime > destStat.mtime;
    } catch (error) {
        return true; // En caso de duda, actualizar
    }
}
```

Beneficios:

-   Generación más rápida durante actualizaciones
-   Menos operaciones I/O cuando solo cambian algunas reglas
-   Mejor experiencia para desarrollo iterativo

### 6. Optimización para archivos grandes

Para archivos grandes, usamos un enfoque optimizado:

```javascript
async readFileOptimized(filePath) {
    // Verificar tamaño para determinar estrategia
    const stats = await fsPromises.stat(filePath);

    // Para archivos grandes (>1MB), usar streaming
    if (stats.size > 1024 * 1024) {
        return new Promise((resolve, reject) => {
            let data = '';
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

            stream.on('data', (chunk) => { data += chunk; });
            stream.on('end', () => { resolve(data); });
            stream.on('error', reject);
        });
    }

    // Para archivos pequeños, leer de una vez
    return await fsPromises.readFile(filePath, 'utf8');
}
```

Beneficios:

-   Menor uso de memoria para plantillas grandes
-   Mejor rendimiento al manejar archivos grandes
-   Evita bloqueos al cargar archivos extensos

## Buenas prácticas para contribuidores

Al contribuir al proyecto, tenga en cuenta estas recomendaciones para mantener un buen rendimiento:

1. **Priorizar operaciones asíncronas**: Use siempre métodos asíncronos para operaciones I/O.

2. **Evitar cargas innecesarias**: No cargue recursos (como plantillas o servicios) hasta que sean necesarios.

3. **Utilizar procesamiento en lotes**: Para operaciones grandes, divida el trabajo en lotes manejables.

4. **Cachear resultados frecuentes**: Use el sistema de caché para resultados que se consultan repetidamente.

5. **Verificar operaciones redundantes**: Evite leer/escribir el mismo archivo múltiples veces.

6. **Monitorear uso de memoria**: Tenga cuidado con la acumulación de objetos grandes en memoria.

7. **Medir el rendimiento**: Antes y después de cambios importantes, realice pruebas de rendimiento.

## Medición de rendimiento

Para evaluar el rendimiento del proyecto, puede utilizar las siguientes técnicas:

1. **Registro de tiempos**: Use `Date.now()` para medir el tiempo de operaciones críticas:

```javascript
const startTime = Date.now();
// Operación a medir
const endTime = Date.now();
console.log(`Operación completada en ${endTime - startTime}ms`);
```

2. **Monitoreo de memoria**: Use `process.memoryUsage()` para verificar el uso de memoria:

```javascript
console.log(process.memoryUsage());
```

3. **Perfilado**: Para análisis más detallado, use herramientas como:
    - Node.js Profiler
    - Chrome DevTools cuando se ejecuta con `--inspect`
    - Herramientas como `clinic.js`

## Optimizaciones futuras

Para versiones futuras, se pueden considerar las siguientes optimizaciones:

1. **Workers paralelos**: Utilizar worker threads para tareas CPU-intensivas.

2. **Compilación de plantillas**: Pre-compilar plantillas frecuentes para una sustitución más rápida.

3. **Carga diferida de configuración**: Cargar secciones de configuración solo cuando sean necesarias.

4. **Indexación de plantillas**: Crear índices de plantillas para búsquedas más rápidas.

5. **Compresión de caché**: Almacenar plantillas comprimidas en memoria para reducir el uso de RAM.

## Consideraciones para proyectos grandes

Para proyectos con miles de archivos de reglas:

1. **Modo de baja memoria**: Implementar un modo que sacrifique velocidad por menor uso de memoria.

2. **Fragmentación de reglas**: Dividir conjuntos de reglas grandes en grupos más pequeños.

3. **Reglas bajo demanda**: Cargar reglas solo cuando el agente las solicite, no todas al inicio.

4. **Configuración adaptativa**: Ajustar automáticamente parámetros de rendimiento según el tamaño del proyecto.

---

Al seguir estas prácticas y consideraciones, podemos mantener el Agent Rules Kit eficiente y responsivo, incluso para proyectos muy grandes y entornos con recursos limitados.
