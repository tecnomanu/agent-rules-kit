# Extending Agent Rules Kit with New Services

This document provides a step-by-step guide on how to extend Agent Rules Kit with new services for additional stacks or extended functionalities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a new stack service](#creating-a-new-stack-service)
3. [Integrating the service into the system](#integrating-the-service-into-the-system)
4. [Creating rule templates](#creating-rule-templates)
5. [Updating the configuration](#updating-the-configuration)
6. [Testing](#testing)
7. [Complete example: Creating a service for Svelte](#complete-example-creating-a-service-for-svelte)

## Prerequisites

Before extending Agent Rules Kit, make sure you understand:

-   The service architecture (see [services-architecture.md](./services-architecture.md))
-   The project directory structure
-   The interfaces and contracts of the base services

## Creating a new stack service

### 1. Create the service class

Create a new file in `cli/services/` following the naming convention:

```javascript
// cli/services/svelte-service.js
import { BaseService } from './base-service.js';

export class SvelteService extends BaseService {
	constructor(options = {}) {
		super(options);
		this.fileService = options.fileService;
		this.configService = options.configService;
		this.cliService = options.cliService;

		// Svelte-specific configuration
		this.stackName = 'svelte';
	}

	/**
	 * Copies the base rules for Svelte
	 * @param {string} targetRules - Path to the target directory
	 * @param {object} versionMeta - Version metadata
	 * @param {object} options - Additional options
	 */
	copyBaseRules(targetRules, versionMeta, options = {}) {
		this.debugLog(`Copying Svelte base rules to ${targetRules}`);

		// Svelte-specific implementation
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
	 * Copies architecture-specific rules
	 * @param {string} targetRules - Path to the target directory
	 * @param {string} architecture - Name of the chosen architecture
	 * @param {object} options - Additional options
	 */
	copyArchitectureRules(targetRules, architecture, options = {}) {
		this.debugLog(
			`Copying architecture rules for ${architecture} for Svelte`
		);

		const { fileService } = this;
		const architecturePath = `templates/stacks/svelte/architectures/${architecture}`;

		if (!fileService.directoryExists(architecturePath)) {
			this.debugLog(
				`Architecture ${architecture} not found in ${architecturePath}`
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
	 * Copies version-specific rules
	 * @param {string} targetRules - Path to the target directory
	 * @param {object} versionMeta - Version metadata
	 * @param {object} options - Additional options
	 */
	copyVersionOverlay(targetRules, versionMeta, options = {}) {
		this.debugLog(
			`Looking for specific rules for Svelte ${versionMeta.detectedVersion}`
		);

		const { fileService } = this;
		const versionPaths = [
			`templates/stacks/svelte/v${versionMeta.majorVersion}`,
			`templates/stacks/svelte/v${versionMeta.majorVersion}-${versionMeta.minorVersion}`,
		];

		let appliedOverlay = false;

		for (const versionPath of versionPaths) {
			if (fileService.directoryExists(versionPath)) {
				this.debugLog(`Applying version rules from ${versionPath}`);

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

### 2. Implement required methods

Your service must implement at least these key methods:

-   **copyBaseRules**: Copies the base rules for the stack
-   **copyArchitectureRules**: Copies architecture-specific rules
-   **copyVersionOverlay**: Copies version-specific rules

## Integrating the service into the system

### 1. Update the main file

Integrate your new service in `cli/index.js`:

```javascript
// Import the new service
import { SvelteService } from './services/svelte-service.js';

// In the main function, add the service to the options
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
	// Add the new service
	svelte: new SvelteService({
		fileService,
		configService,
		cliService,
		debug,
	}),
};

// Make sure to add the stack to the CLI options
const stacks = [
	{ name: 'Laravel', value: 'laravel' },
	{ name: 'Next.js', value: 'nextjs' },
	// Add the new option
	{ name: 'Svelte', value: 'svelte' },
];
```

## Creating rule templates

### 1. Directory structure

Create the directory structure following the established pattern:

```
templates/
└── stacks/
    └── svelte/
        ├── base/                # Base rules
        ├── architectures/       # Architecture-specific rules
        │   ├── component/       # Component-based architecture
        │   └── actions/         # Actions-based architecture
        └── v4/                  # Svelte 4-specific rules
```

### 2. Create base rules

Create basic rule files in `templates/stacks/svelte/base/`:

```markdown
# Svelte Project Structure

This document describes the basic structure of a Svelte project.

## File Organization

-   `src/`: Contains the application source code
    -   `components/`: Reusable components
    -   `routes/`: Application pages (if using SvelteKit)
    -   `stores/`: Global state storage
    -   `lib/`: Utilities and helper functions
-   `public/`: Static files
-   `svelte.config.js`: Svelte configuration
```

## Updating the configuration

### 1. Modify kit-config.json

Update `templates/kit-config.json` to include your new stack:

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
				"description": "Component-based structure"
			},
			"actions": {
				"name": "Actions-based",
				"description": "Actions-based structure"
			}
		},
		"globs": ["src/**/*.svelte", "svelte.config.js"],
		"pattern_rules": {
			"version_detection": ["package\\.json$"]
		}
	}
}
```

## Testing

### 1. Create unit tests

Create tests for your new service in `tests/cli/svelte-service.test.js`:

```javascript
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SvelteService } from '../../cli/services/svelte-service.js';

// Dependencies mocks
const mockFileService = {
	directoryExists: vi.fn().mockReturnValue(true),
	copyRuleGroup: vi.fn().mockReturnValue(true),
};

const mockConfigService = {
	// Configuration mocks
};

const mockCliService = {
	// CLI mocks
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

	test('copyBaseRules copies base rules correctly', () => {
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

	// More tests for other methods...
});
```

## Complete example: Creating a service for Svelte

This example shows the complete process for adding support for Svelte:

1. **Create the service**: `cli/services/svelte-service.js`
2. **Create templates**:
    - `templates/stacks/svelte/base/`
    - `templates/stacks/svelte/architectures/component/`
    - `templates/stacks/svelte/architectures/actions/`
    - `templates/stacks/svelte/v4/` (for Svelte 4)
3. **Update configuration** in `templates/kit-config.json`
4. **Integrate** in `cli/index.js`
5. **Create tests** in `tests/cli/svelte-service.test.js`
6. **Test manually** with `pnpm start`
7. **Document** in README.md, updating the Implementation Status section

## Best practices

-   Follow the existing design pattern and architecture
-   Keep file and service names consistent
-   Create unit tests for all new functionalities
-   Document the specific features of your stack
-   Provide rules for the most common architectures
-   Include information about the most up-to-date documentation and best practices
