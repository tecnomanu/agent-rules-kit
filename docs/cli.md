# CLI Documentation

## General Usage

```bash
# Run directly (recommended)
npx agent-rules-kit

# With debug mode
npx agent-rules-kit --debug

# Update existing rules
npx agent-rules-kit --update
```

## Service Architecture

Agent Rules Kit v1.0.0+ uses a service-based architecture for improved modularity:

| Service         | Purpose                                 |
| --------------- | --------------------------------------- |
| `BaseService`   | Core functionality and shared utilities |
| `ConfigService` | Configuration management                |
| `FileService`   | File operations and rule processing     |
| `StackService`  | Common functionality across stacks      |
| `*-Service`     | Stack-specific implementations          |
| `CliService`    | User interface and interaction          |

Services are loaded dynamically to improve performance:

```javascript
// Only essential services are loaded at startup
// Stack-specific services are loaded dynamically when needed
async function loadStackService(stack) {
	// Return from cache if already loaded
	if (stackServices.has(stack)) {
		return stackServices.get(stack);
	}

	// Dynamic import
	const servicePath = `./services/${stack}-service.js`;
	const serviceModule = await import(servicePath);

	// Initialize and cache
	const ServiceClass =
		serviceModule[
			`${stack.charAt(0).toUpperCase() + stack.slice(1)}Service`
		];
	const serviceInstance = new ServiceClass({ ...options });
	stackServices.set(stack, serviceInstance);

	return serviceInstance;
}
```

## Performance Optimizations

The CLI includes several performance optimizations:

1. **Batch Processing**: Files are processed in batches to reduce memory usage
2. **Async Operations**: File operations are performed asynchronously
3. **Template Caching**: Templates are cached to avoid redundant file reads
4. **Dynamic Loading**: Services are loaded on-demand
5. **Incremental Updates**: Only changed files are processed during updates

For large projects, the batch processing system automatically manages memory:

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

## Template Variables

Templates can use special variables that will be replaced when generating the rules:

| Variable            | Description             | Example            |
| ------------------- | ----------------------- | ------------------ |
| `{projectPath}`     | Path to the project     | `/path/to/project` |
| `{detectedVersion}` | Detected version number | `10`               |
| `{versionRange}`    | Version range for rules | `v10-11`           |
| `{stack}`           | The technology stack    | `laravel`          |
| `{architecture}`    | Selected architecture   | `standard`         |
| `{stackFormatted}`  | Formatted stack name    | `Laravel`          |

## Frontmatter Configuration

Rule files (.md) in the templates can include their own frontmatter configuration:

```md
---
globs: <root>/app/**/*.php,<root>/routes/**/*.php
alwaysApply: true
---

# Rule Title

Rule content...
```

### Available Frontmatter Properties

-   `globs`: Defines which files this rule applies to. Can be a string or an array.
-   `alwaysApply`: When `true`, the rule is applied regardless of file type.

### Configuration Precedence

1. Frontmatter in the template file takes highest precedence
2. If no frontmatter is present, the CLI will apply defaults from `kit-config.json`

## Exporting Rules

You can export rules without the Cursor-specific frontmatter using the `exportMdcToMd` function:

```js
const fileService = new FileService();
await fileService.exportMdcToMd('path/to/rule.mdc', 'path/to/exported.md');
```

This allows using rules in other documentation contexts.

## Backup System

When updating existing rules, the system automatically creates backups:

```javascript
// Create timestamp for backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `${rulesDir}-backup-${timestamp}`;

// Backup existing rules
await fs.copy(rulesDir, backupDir);
```

Users can choose to:

1. Create a backup of existing rules
2. Replace existing rules
3. Cancel the operation

## Debug Mode

Enable debug mode to see detailed logs:

```bash
npx agent-rules-kit --debug
```

Debug logs provide insights into:

-   Service initialization
-   File operations
-   Template processing
-   Configuration loading
-   Performance metrics
