# Agent Rules Kit v1.0

<p align="center">
  <img src="assets/banner_agent_rules_kit.jpg" alt="Agent Rules Kit Logo" width="729" />
</p>

> Bootstrap of **Cursor** rules (`.mdc`) and mirror documentation (`.md`) for AI agent-guided projects.

## What is Agent Rules Kit?

Agent Rules Kit is a CLI tool that facilitates the installation and configuration of rules for Cursor AI, the AI-powered IDE. The rules help AI agents better understand the structure, patterns, and best practices of different technology stacks.

## 🎉 New Architecture

We've completely redesigned the internal architecture to provide a more maintainable and extensible system:

-   **Service-Based Architecture**: Replaced the helper-based system with a clean service-oriented architecture that enhances maintainability and extensibility
-   **Automatic Backups**: Smart backup system that preserves your custom rules when updating
-   **Enhanced Debug Mode**: Better visibility into the rule generation process with standardized logging
-   **Improved Testing Framework**: More robust testing with better mocking and service isolation
-   **React Architecture Options**: Now includes support for atomic design and feature-sliced design
-   **Better State Management Support**: Enhanced support for modern state management libraries

## 🎉 New Features in Version 1.0

-   🚀 Quick setup of rules for different frameworks and stacks
-   🔍 Automatic framework version detection
-   🏗️ Support for multiple architectural styles
-   📚 Mirror documentation generation for human reference
-   🧩 Modular system for easy expansion to new frameworks
-   💾 Automatic backups of existing rules
-   🔄 Version-specific rule overlays

## Supported Stacks

-   Laravel (v8-12)
-   Next.js (v12-14)
-   React (v17-18)
-   Angular (v14-17)
-   NestJS
-   Vue (v2-3)
-   Nuxt (v2-3)
-   Astro
-   Generic (for any project)

## Implementation Status

<p align="center">

| Stack                                                                                                                                 | Status                              | Features                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" width="100"/>   | ![95%](https://progress-bar.dev/95) | Multiple architectures, version detection, casting rules    |
| <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width="100"/> | ![80%](https://progress-bar.dev/80) | App & Pages router support, version detection, testing docs |
| <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" width="100"/>   | ![55%](https://progress-bar.dev/55) | Signals support, base project structure                     |
| <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" width="100"/>      | ![45%](https://progress-bar.dev/45) | Base project structure, patterns documentation              |
| <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" width="100"/>         | ![80%](https://progress-bar.dev/80) | Architecture options, state management, testing guidelines  |
| <img src="https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue" width="100"/>            | ![45%](https://progress-bar.dev/45) | Testing guidelines, architecture concepts                   |
| <img src="https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt" width="100"/>         | ![40%](https://progress-bar.dev/40) | Testing guidelines, architecture concepts                   |
| <img src="https://img.shields.io/badge/Astro-0D0D0D?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" width="100"/>         | ![20%](https://progress-bar.dev/20) | Basic configuration                                         |
| <img src="https://img.shields.io/badge/Generic-4B32C3?style=for-the-badge&logo=dev.to&logoColor=white" alt="Generic" width="100"/>    | ![90%](https://progress-bar.dev/90) | Best practices, file operations, code standards             |

</p>

## Installation

### Option 1: Run directly (Recommended)

No installation needed, run directly with:

```bash
npx agent-rules-kit
# or
pnpx agent-rules-kit
```

This will execute the latest version from npm without installing it globally.

### Option 2: Global installation

```bash
npm install -g agent-rules-kit
# Then run
agent-rules-kit
```

### Option 3: Development/Contribution

```bash
git clone https://github.com/tecnomanu/agent-rules-kit.git
cd agent-rules-kit
pnpm install
pnpm start
```

## Basic Usage

Run the command in your project root:

```bash
npx agent-rules-kit
```

Follow the interactive instructions to select the stack, architecture, and other options.

### Available Options

-   **Stack Selection**: Choose the main framework or technology for your project
-   **Global Rules**: Include general best practice rules
-   **Cursor Directory**: Specify the location of the Cursor directory
-   **Project Path**: Define the relative path if the project is not in the root
-   **Mirror Documentation**: Generate .md files that reflect the rules for human reference
-   **Debug Mode**: Enable detailed logging for troubleshooting

### Supported Architectures

#### Laravel

-   **Standard**: Traditional MVC structure with Repositories
-   **DDD (Domain-Driven Design)**: Business domain organization
-   **Hexagonal**: Ports and adapters architecture

#### Next.js

-   **App Router**: For Next.js 13+ projects
-   **Pages Router**: Traditional router
-   **Hybrid**: Both router types

#### React

-   **Standard**: Component-based organization
-   **Atomic Design**: Atoms, molecules, organisms, templates, pages
-   **Feature-Sliced Design**: Features-first organization

### State Management (React)

-   **Context API**: Built-in React state management
-   **Redux**: Predictable state container
-   **MobX**: Simple, scalable state management
-   **Recoil**: Experimental state management library by Facebook
-   **Zustand**: Lightweight state management solution

## File Structure

Rules are installed in:

```
.cursor/rules/rules-kit/
├── global/     # Global best practice rules
└── [stack]/    # Stack-specific rules
```

Mirror documentation is generated in:

```
docs/
├── global/
└── [stack]/
```

## Project Architecture

The codebase is organized using a comprehensive service-oriented architecture:

```
cli/
├── index.js                # Entry point
├── services/               # Services directory
│   ├── base-service.js     # Base class with shared functionality across all services
│   ├── cli-service.js      # CLI interface and user interaction management
│   ├── config-service.js   # Configuration loading, validation and management
│   ├── file-service.js     # File operations and template processing
│   ├── stack-service.js    # Core stack functionality and orchestration
│   ├── laravel-service.js  # Laravel-specific implementations
│   ├── nextjs-service.js   # Next.js-specific implementations
│   └── react-service.js    # React-specific implementations
└── version-detector.js     # Framework version detection utilities
```

### Service-Oriented Design

Each service has specific responsibilities:

-   **BaseService**: Provides common utilities like debugging, file operations, and shared functions
-   **FileService**: Handles all file operations, template processing, and MDC conversion
-   **ConfigService**: Manages configuration from kit-config.json and default settings
-   **CLIService**: Standardizes user interaction, messaging, and prompts
-   **Stack-specific Services**: Implement specialized processing for each framework

Key benefits of this architecture:

-   **High Cohesion**: Services have clear, focused responsibilities
-   **Low Coupling**: Services communicate through well-defined interfaces
-   **Extensibility**: New stacks can be added by creating new service classes
-   **Testability**: Isolated services are easier to test independently
-   **Maintainability**: Consistent patterns and organization across the codebase

For more details on the service architecture, see [docs/services-architecture.md](/docs/services-architecture.md).

## Advanced Configuration

### Template Files

Templates for all stacks are located in:

```
templates/
├── global/              # Global rules
└── stacks/
    ├── laravel/
    │   ├── base/        # Laravel base rules
    │   ├── architectures/
    │   │   ├── standard/  # Standard architecture rules
    │   │   ├── ddd/       # DDD architecture rules
    │   │   └── hexagonal/ # Hexagonal architecture rules
    │   └── v10-11/      # Laravel 10-11 specific rules
    ├── nextjs/
    │   └── ...
    └── ...
```

### Kit Configuration

The main configuration is in `templates/kit-config.json`, where it defines:

-   Version ranges for each stack
-   File patterns for specific rules
-   Architecture configurations

## Development

### Prerequisites

-   Node.js 16+
-   pnpm (preferred) or npm

### Development Installation

```bash
git clone https://github.com/tecnomanu/agent-rules-kit.git
cd agent-rules-kit
pnpm install
```

### Available Commands

```bash
pnpm start           # Run the CLI
pnpm test            # Run tests
pnpm run lint        # Lint code
pnpm run test -- --update  # Update snapshots
```

## License

ISC
