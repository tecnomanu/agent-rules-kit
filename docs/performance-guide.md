# Performance Optimization Guide

## Introduction

This document describes the performance optimizations implemented in Agent Rules Kit and provides recommendations for contributors who want to maintain a high level of performance in future versions.

## Implemented Optimizations

### 1. Dynamic Service Loading

Instead of loading all stack services at startup, they are now dynamically loaded on demand:

```javascript
// Before: Static loading of all services
import { AngularService } from './services/angular-service.js';
import { LaravelService } from './services/laravel-service.js';
import { NextjsService } from './services/nextjs-service.js';
import { ReactService } from './services/react-service.js';

// After: Dynamic loading with cache
async function loadStackService(stack) {
	// Return from cache if already loaded
	if (stackServices.has(stack)) {
		return stackServices.get(stack);
	}

	// Dynamically import the required service
	const servicePath = `./services/${stack}-service.js`;
	const serviceModule = await import(servicePath);

	// Instantiate and cache the service
	const ServiceClass =
		serviceModule[
			`${stack.charAt(0).toUpperCase() + stack.slice(1)}Service`
		];
	// ...
}
```

Benefits:

-   Faster startup time
-   Lower memory usage when only one service is needed
-   Faster loading on systems with limited resources

### 2. Template Caching System

A caching system was implemented to avoid repeatedly loading the same templates:

```javascript
class TemplateCache {
	constructor(options = {}) {
		this.cache = new Map();
		this.maxSize = options.maxSize || 100;
		this.ttl = options.ttl || 300000; // 5 minutes
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

Benefits:

-   Reduction of repetitive I/O operations
-   Faster generation time for rules with common templates
-   Memory control through size limits and TTL

### 3. Asynchronous File Operations

Synchronous file operations were replaced with asynchronous ones:

```javascript
// Before
const files = this.getFilesInDirectory(tmplDir);
files.forEach((f) => {
	// Synchronous operations
});

// After
const files = await this.getFilesInDirectoryAsync(tmplDir);
await Promise.all(
	batch.map(async (f) => {
		// Asynchronous operations
	})
);
```

Benefits:

-   Better performance on systems with slow I/O
-   Doesn't block the main thread
-   Better error handling

### 4. Batch Processing

To improve memory handling, files are processed in batches:

```javascript
async processBatch(items, processFn, batchSize = 10) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processFn(item))
        );
        results.push(...batchResults);

        // Allow event loop to handle other tasks
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return results;
}
```

Benefits:

-   Lower memory peak in large projects
-   Improved responsiveness during generation
-   Avoids "memory exhaustion" issues

### 5. Incremental Updates

A system was implemented to regenerate only rules that have changed:

```javascript
async needsUpdate(srcFile, destFile) {
    try {
        if (!await fs.pathExists(destFile)) return true;

        const srcStat = await fsPromises.stat(srcFile);
        const destStat = await fsPromises.stat(destFile);

        return srcStat.mtime > destStat.mtime;
    } catch (error) {
        return true; // When in doubt, update
    }
}
```

Benefits:

-   Faster generation during updates
-   Fewer I/O operations when only some rules change
-   Better experience for iterative development

### 6. Optimization for Large Files

For large files, we use an optimized approach:

```javascript
async readFileOptimized(filePath) {
    // Check size to determine strategy
    const stats = await fsPromises.stat(filePath);

    // For large files (>1MB), use streaming
    if (stats.size > 1024 * 1024) {
        return new Promise((resolve, reject) => {
            let data = '';
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

            stream.on('data', (chunk) => { data += chunk; });
            stream.on('end', () => { resolve(data); });
            stream.on('error', reject);
        });
    }

    // For small files, read at once
    return await fsPromises.readFile(filePath, 'utf8');
}
```

Benefits:

-   Lower memory usage for large templates
-   Better performance when handling large files
-   Avoids blocking when loading extensive files

## Best Practices for Contributors

When contributing to the project, keep these recommendations in mind to maintain good performance:

1. **Prioritize asynchronous operations**: Always use async methods for I/O operations.

2. **Avoid unnecessary loading**: Don't load resources (like templates or services) until they are needed.

3. **Use batch processing**: For large operations, divide the work into manageable batches.

4. **Cache frequent results**: Use the cache system for results that are queried repeatedly.

5. **Check for redundant operations**: Avoid reading/writing the same file multiple times.

6. **Monitor memory usage**: Be careful with the accumulation of large objects in memory.

7. **Measure performance**: Before and after significant changes, conduct performance tests.

## Performance Measurement

To evaluate the project's performance, you can use the following techniques:

1. **Time logging**: Use `Date.now()` to measure the time of critical operations:

```javascript
const startTime = Date.now();
// Operation to measure
const endTime = Date.now();
console.log(`Operation completed in ${endTime - startTime}ms`);
```

2. **Memory monitoring**: Use `process.memoryUsage()` to check memory usage:

```javascript
console.log(process.memoryUsage());
```

3. **Profiling**: For more detailed analysis, use tools such as:
    - Node.js Profiler
    - Chrome DevTools when running with `--inspect`
    - Tools like `clinic.js`

## Future Optimizations

For future versions, the following optimizations could be considered:

1. **Parallel workers**: Use worker threads for CPU-intensive tasks.

2. **Template compilation**: Pre-compile frequent templates for faster substitution.

3. **Deferred configuration loading**: Load configuration sections only when needed.

4. **Template indexing**: Create template indexes for faster searches.

5. **Cache compression**: Store compressed templates in memory to reduce RAM usage.

## Considerations for Large Projects

For projects with thousands of rule files:

1. **Low memory mode**: Implement a mode that sacrifices speed for lower memory usage.

2. **Rule fragmentation**: Split large rule sets into smaller groups.

3. **On-demand rules**: Load rules only when the agent requests them, not all at startup.

4. **Adaptive configuration**: Automatically adjust performance parameters based on project size.

---

By following these practices and considerations, we can keep Agent Rules Kit efficient and responsive, even for very large projects and environments with limited resources.
