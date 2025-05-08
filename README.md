# Agent Rules Kit v1

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

## 🎉 New Features

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

| Stack                                                                                                                                 | Status                                | Features                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" width="100"/>   | ![95%](https://progress-bar.dev/95)   | Multiple architectures, version detection, casting rules            |
| <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width="100"/> | ![85%](https://progress-bar.dev/85)   | App & Pages router support, version detection, testing docs         |
| <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" width="100"/>   | ![55%](https://progress-bar.dev/55)   | Signals support, base project structure                             |
| <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" width="100"/>      | ![45%](https://progress-bar.dev/45)   | Base project structure, patterns documentation                      |
| <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" width="100"/>         | ![85%](https://progress-bar.dev/85)   | Architecture options, state management, testing guidelines          |
| <img src="https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue" width="100"/>            | ![45%](https://progress-bar.dev/45)   | Testing guidelines, architecture concepts                           |
| <img src="https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt" width="100"/>         | ![40%](https://progress-bar.dev/40)   | Testing guidelines, architecture concepts                           |
| <img src="https://img.shields.io/badge/Astro-0D0D0D?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" width="100"/>         | ![20%](https://progress-bar.dev/20)   | Basic configuration                                                 |
| <img src="https://img.shields.io/badge/Generic-4B32C3?style=for-the-badge&logo=dev.to&logoColor=white" alt="Generic" width="100"/>    | ![100%](https://progress-bar.dev/100) | Best practices, file operations, code standards, extensibility docs |

</p>

> **Enhanced Extensibility**: Detailed documentation has been added on how to [extend Agent Rules Kit with new services](/docs/extending-services.md), making it easier to contribute new stacks and features.

## Installation

### Option 1: Run directly (Recommended)

No installation needed, run directly with:

```bash
npx agent-rules-kit
# or
pnpx agent-rules-kit
```
