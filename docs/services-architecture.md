# Service Architecture in Agent Rules Kit

## Introduction

Version 1.0.0 of Agent Rules Kit introduces a service-oriented architecture that improves maintainability, extensibility, and code organization. This documentation explains the structure and how to extend it.

## Service Structure

### BaseService

The base class that provides shared functionality across all services:

-   **debugLog**: Centralized logging for debugging
-   Basic file operations:
    -   directoryExists
    -   ensureDirectoryExists
    -   getFilesInDirectory
    -   readFile
    -   writeFile
    -   copyFile

### FileService

Manages all operations related to files and rule processing:

-   **addFrontMatter**: Adds metadata to markdown content
-   **processTemplateVariables**: Processes template variables in content
-   **wrapMdToMdc**: Converts markdown files to .mdc format with frontmatter
-   **copyRuleGroup**: Copies rule groups maintaining organization

### ConfigService

Handles kit configuration:

-   **loadKitConfig**: Loads configuration from config.json
-   **getDefaultConfig**: Provides default configuration
-   **saveKitConfig**: Saves configuration to config.json

### Stack-specific Services

#### LaravelService

-   **copyArchitectureRules**: Copies specific architecture rules
-   **copyVersionOverlay**: Applies version-specific rules
-   **copyBaseRules**: Copies base rules

#### NextjsService

-   **copyArchitectureRules**: Manages App/Pages router architecture rules
-   **copyVersionOverlay**: Applies version-specific rules
-   **copyBaseRules**: Copies base rules

#### ReactService

-   **copyArchitectureRules**: Copies architecture rules
-   **copyTestingRules**: Copies testing rules
-   **copyStateManagementRules**: Copies state management rules
-   **copyBaseRules**: Copies base rules

### CliService

-   Standardized user interface management
-   Methods for displaying messages (info, success, warning, error)
-   Methods for requesting user input (askStack, askArchitecture, etc.)

## How to extend the architecture

### Adding a new stack

1. Create a new service class that extends BaseService
2. Implement specific methods like copyBaseRules
3. Register the new service in the main code

Example:

```javascript
export class AngularService extends BaseService {
	constructor(options = {}) {
		super(options);
		this.fileService = options.fileService;
		this.configService = options.configService;
	}

	copyBaseRules(targetRules, versionMeta, options) {
		// Angular-specific implementation
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

## Design patterns used

-   **Composite Pattern**: Stack services compose FileService functionality
-   **Singleton**: ConfigService maintains a single configuration instance
-   **Strategy**: Different stack-specific implementations
-   **Factory**: Centralized service creation

## Typical execution flow

1. User starts the application
2. CliService collects user inputs
3. Necessary services are initialized
4. The selected stack's service processes the rules
5. FileService converts and writes the files
6. ConfigService provides metadata for each rule

## Advantages of the new architecture

-   **Higher cohesion**: Each service has well-defined responsibilities
-   **Lower coupling**: Services communicate through clear interfaces
-   **Extensibility**: Easy addition of new stacks or functionalities
-   **Testability**: Service classes are easier to test in isolation
-   **Maintainability**: More organized and predictable code
