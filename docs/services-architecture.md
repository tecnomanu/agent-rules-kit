# Service Architecture in Agent Rules Kit

## Introduction

Version 1.0.0 of Agent Rules Kit introduces a service-oriented architecture that improves maintainability, extensibility, and code organization. This documentation explains the structure and how to extend it.

## Service Structure

### BaseService

The base class that provides shared functionality across all services:

-   **debugLog**: Centralized logging for debugging
-   Basic file operations:
    -   directoryExists / directoryExistsAsync
    -   ensureDirectoryExists / ensureDirectoryExistsAsync
    -   getFilesInDirectory / getFilesInDirectoryAsync
    -   readFile / readFileAsync / readFileOptimized
    -   writeFile / writeFileAsync
    -   copyFile / copyFileAsync
-   **processBatch**: Process items in batches to optimize memory usage

### FileService

Manages all operations related to files and rule processing:

-   **addFrontMatter**: Adds metadata to markdown content
-   **processTemplateVariables**: Processes template variables in content
-   **wrapMdToMdc**: Converts markdown files to .mdc format with frontmatter
-   **copyRuleGroup**: Copies rule groups maintaining organization
-   **clearCache**: Clears template cache to free memory
-   **createBackup**: Creates backups of existing rules

### ConfigService

Handles kit configuration:

-   **loadKitConfig**: Loads configuration from kit-config.json
-   **getDefaultConfig**: Provides default configuration
-   **saveKitConfig**: Saves configuration to kit-config.json
-   **getConfig**: Retrieves cached configuration
-   **validateOptions**: Validates user configuration
-   **processTemplateVariables**: Processes variables in templates

### CliService

-   Standardized user interface management:
    -   showBanner: Displays the application banner
    -   startProgress / updateProgress / completeProgress: Manages progress bars
    -   info / success / warning / error: Standardized message output
-   User input functions:
    -   askStack: Prompts for stack selection
    -   askArchitecture: Prompts for architecture selection
    -   askVersion: Prompts for version selection
    -   askProjectPath: Prompts for project location
    -   askDirectoryAction: Asks what to do with existing rules

### StackService

Handles stack-agnostic operations:

-   **detectStackVersion**: Detects framework version from project files
-   **getAvailableStacks**: Lists available stacks from configuration
-   **getAvailableArchitectures**: Lists architectures for a stack
-   **getAvailableVersions**: Lists versions for a stack
-   **mapVersionToRange**: Maps specific versions to version ranges
-   **generateRulesAsync**: Orchestrates rule generation
-   **countTotalRules**: Counts total rules for progress tracking
-   **createBackupAsync**: Creates backup of existing rules

### Stack-specific Services

#### LaravelService

-   **copyArchitectureRules**: Copies specific architecture rules (Standard, DDD, Hexagonal)
-   **copyVersionOverlay**: Applies version-specific rules (v8-9, v10-11, v12)
-   **copyBaseRules**: Copies base rules

#### NextjsService

-   **copyArchitectureRules**: Manages App/Pages router architecture rules
-   **copyVersionOverlay**: Applies version-specific rules (v12, v13, v14)
-   **copyBaseRules**: Copies base rules

#### ReactService

-   **copyArchitectureRules**: Copies architecture rules (Standard, Atomic, Feature-Sliced)
-   **copyStateManagementRules**: Copies state management rules (Redux, Context, Zustand, etc.)
-   **copyBaseRules**: Copies base rules

#### AngularService

-   **copyBaseRules**: Copies Angular base rules
-   **copySignalsRules**: Copies rules for Angular Signals (optional)
-   **copyVersionOverlay**: Applies version-specific rules (v14-15, v16-17)

### McpService (New in v2.0)

Manages Model Context Protocol (MCP) tools integration:

-   **getAvailableMcpTools**: Retrieves available MCP tools from configuration
-   **copyMcpToolsRules**: Copies selected MCP tool rules with batch processing
-   **countMcpToolsRules**: Counts files to be generated for selected tools
-   **validateMcpTools**: Validates selected tools against available options
-   **pathExistsAsync**: Utility for asynchronous path existence checking
-   **ensureDirectoryExistsAsync**: Utility for asynchronous directory creation

#### MCP Tools Integration

The McpService enables the new MCP tools functionality:

```javascript
// Multi-tool selection and processing
const selectedMcpTools = ['pampa', 'github', 'memory'];
const mcpCount = await mcpService.copyMcpToolsRules(
	rulesDir,
	selectedMcpTools,
	meta,
	config
);
```

Key features:

-   **Multi-select interface**: Users can choose multiple MCP tools
-   **Batch processing**: Efficient handling of multiple tool rule sets
-   **Validation**: Ensures selected tools are available and valid
-   **Separation of concerns**: MCP rules are independent from stack rules
-   **Asynchronous operations**: Non-blocking file operations for better performance

## Architecture Implementation

### Dynamic Service Loading

Services are loaded on-demand to improve startup time and memory usage:

```javascript
async function loadStackService(stack) {
	// Return from cache if already loaded
	if (stackServices.has(stack)) {
		return stackServices.get(stack);
	}

	// Dynamically import the required service
	const servicePath = `./services/${stack}-service.js`;
	const serviceModule = await import(servicePath);

	// Get the service class
	const ServiceClass =
		serviceModule[
			`${stack.charAt(0).toUpperCase() + stack.slice(1)}Service`
		];

	// Instantiate the service
	const serviceInstance = new ServiceClass({
		debug: debugMode,
		fileService,
		configService,
		templatesDir,
		stackService,
	});

	// Cache the instance
	stackServices.set(stack, serviceInstance);

	return serviceInstance;
}
```

### Batched Processing

For memory efficiency, file processing is done in batches:

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

### Template Caching

Templates are cached to avoid repeated file reads:

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

	set(key, value) {
		// Implement cache eviction if needed
		if (this.cache.size >= this.maxSize) {
			this.evictOldest();
		}

		this.cache.set(key, {
			value,
			expiry: Date.now() + this.ttl,
		});
	}

	// ...other cache methods
}
```

## How to extend the architecture

### Adding a new stack

1. Create a new service class that extends BaseService
2. Implement specific methods like copyBaseRules
3. Register the new service in the main code

Example:

```javascript
export class SvelteService extends BaseService {
	constructor(options = {}) {
		super(options);
		this.fileService = options.fileService;
		this.configService = options.configService;
	}

	copyBaseRules(targetRules, versionMeta, options) {
		// Svelte-specific implementation
	}

	// Other specific methods...
}
```

### Adding new functionality to an existing stack

To extend an existing service, simply add new methods to the corresponding class:

```javascript
// In ReactService:
copyPerformanceRules(targetRules, options = {}) {
  // Implementation for performance rules
}
```

### Adding new architectures to a stack

1. Add the architecture to kit-config.json
2. Create architecture-specific rules in templates/stacks/[stack]/architectures/[new-architecture]/
3. Update the stack's service to handle the new architecture

## Design patterns used

-   **Composite Pattern**: Stack services compose FileService functionality
-   **Singleton**: ConfigService maintains a single configuration instance
-   **Strategy**: Different stack-specific implementations
-   **Factory**: Centralized service creation
-   **Adapter**: Stack services adapt common patterns to framework-specific implementations
-   **Observer**: Progress reporting through callbacks

## Typical execution flow

1. User starts the application with `npx agent-rules-kit`
2. Essential services are initialized (BaseService, ConfigService, FileService, CliService, StackService)
3. CliService collects user inputs (stack, project path, architecture, etc.)
4. Appropriate stack service is dynamically loaded
5. Additional stack-specific options are collected
6. Template processing begins with progress tracking
7. Generated rules are written to the .cursor/rules directory
8. Success message is displayed with summary

## Advantages of the new architecture

-   **Higher cohesion**: Each service has well-defined responsibilities
-   **Lower coupling**: Services communicate through clear interfaces
-   **Extensibility**: Easy addition of new stacks or functionalities
-   **Testability**: Service classes are easier to test in isolation
-   **Maintainability**: More organized and predictable code
-   **Performance**: Dynamic loading, caching, and batch processing
-   **Reliability**: Better error handling and backup systems
