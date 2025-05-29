# Agent Rules Kit v1

<p align="center">
  <img src="assets/banner_agent_rules_kit.jpg" alt="Agent Rules Kit Logo" width="729" />
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/agent-rules-kit.svg" alt="Version" />
  <img src="https://img.shields.io/npm/dm/agent-rules-kit.svg" alt="Downloads" />
  <img src="https://img.shields.io/github/license/tecnomanu/agent-rules-kit" alt="License" />
  <img src="https://img.shields.io/github/last-commit/tecnomanu/agent-rules-kit" alt="Last Commit" />
  <img src="https://img.shields.io/github/actions/workflow/status/tecnomanu/agent-rules-kit/CI" alt="Build Status" />
</p>

> Bootstrap **Cursor** rules (`.mdc`) for AI agent-guided projects. This tool helps you generate and maintain project-specific rules for multiple frameworks and architectures.

## What is Agent Rules Kit?

Agent Rules Kit is a CLI tool that facilitates the installation and configuration of rules for Cursor AI, the
AI-powered IDE. The rules help AI agents better understand the structure, patterns, and best practices of
different technology stacks.

## 🎧 Audio Introduction

Listen to a brief introduction about Agent Rules Kit:

https://github.com/user-attachments/assets/7d65c696-245d-421d-9ddc-90331a92c9b2

[English Version](assets/podcast_en.mp3)

https://github.com/user-attachments/assets/8e91d651-c15f-4892-a250-684ab60d8594

[Spanish Version](assets/podcast_es.mp3)

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [New Architecture](#-new-architecture)
3. [New Features](#-new-features)
4. [Supported Stacks](#supported-stacks)
5. [Implementation Status](#implementation-status)
6. [Contributing](#contributing)
7. [Code of Conduct](#code-of-conduct)
8. [License](#license)

## 🚀 Quick Start

### Installation

#### Option 1: Run directly (Recommended)

No installation needed, run directly with:

```bash
npx agent-rules-kit
# or
pnpx agent-rules-kit
```

#### Option 2: Global installation

```bash
npm install -g agent-rules-kit
# Then run
agent-rules-kit
```

#### Option 3: Development/Contribution

```bash
git clone https://github.com/tecnomanu/agent-rules-kit.git
cd agent-rules-kit
pnpm install
pnpm start
```

### Basic Usage

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
-   React Native
-   Angular (v14-17)
-   NestJS
-   Vue (v2-3)
-   Nuxt (v2-3)
-   Svelte (v3-5)
-   SvelteKit (v1-2)
-   Astro
-   Generic (for any project)

## Implementation Status

<p align="center">

| Stack                                                                                                                                            | Status                                | Features                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| <img src="https://img.shields.io/badge/MCP-0066CC?style=for-the-badge&logo=protocol&logoColor=white" alt="MCP" width="100"/>                     | ![100%](https://progress-bar.dev/100) | Complete SDK coverage (Python, TypeScript, Java, Kotlin, C#, Swift), server/client patterns, architecture concepts             |
| <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" width="100"/>              | ![100%](https://progress-bar.dev/100) | Multiple architectures, version detection, casting rules                                                                       |
| <img src="https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt" width="100"/>                    | ![100%](https://progress-bar.dev/100) | Testing guidelines, architectural patterns, version-specific docs                                                              |
| <img src="https://img.shields.io/badge/Generic-4B32C3?style=for-the-badge&logo=dev.to&logoColor=white" alt="Generic" width="100"/>               | ![100%](https://progress-bar.dev/100) | Best practices, file operations, code standards, extensibility docs                                                            |
| <img src="https://img.shields.io/badge/Pampa-FF6B35?style=for-the-badge&logo=search&logoColor=white" alt="Pampa" width="100"/>                   | ![100%](https://progress-bar.dev/100) | Semantic code search, AI agent integration, MCP support, multi-language indexing                                               |
| <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" width="100"/>                    | ![95%](https://progress-bar.dev/95)   | Architecture options, state management, testing guidelines, version-specific guidance (v18 concurrent features)                |
| <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" width="100"/>    | ![25%](https://progress-bar.dev/25)   | Base rules (architecture, best practices, styling, naming, navigation, platform code, state, testing, version info)            |
| <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" width="100"/>            | ![95%](https://progress-bar.dev/95)   | App & Pages router support, version detection, testing docs, version-specific guidance (v13 API routes, v14 Server Components) |
| <img src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte" width="100"/>                 | ![70%](https://progress-bar.dev/70)   | Component organization, runes (v5), lifecycle, state management                                                                |
| <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" width="100"/>                             | ![75%](https://progress-bar.dev/75)   | Multiple architectures, project structure, error handling patterns                                                             |
| <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" width="100"/>           | ![70%](https://progress-bar.dev/70)   | Routing system, layouts, SSR/CSR strategies, form actions                                                                      |
| <img src="https://img.shields.io/badge/Astro-0D0D0D?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" width="100"/>                    | ![60%](https://progress-bar.dev/60)   | Content collections, static/dynamic content, integration guides                                                                |
| <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" width="100"/>              | ![55%](https://progress-bar.dev/55)   | Signals support, base project structure                                                                                        |
| <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" width="100"/>                 | ![75%](https://progress-bar.dev/75)   | Standard and Microservices architectures, NestJS 9.x and 10.x features                                                         |
| <img src="https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue" width="100"/>                       | ![45%](https://progress-bar.dev/45)   | Testing guidelines, architecture concepts                                                                                      |
| <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" width="100"/> | ![100%](https://progress-bar.dev/100) | Standard, Reactive, Microservices                                                                                              |
| <img src="https://img.shields.io/badge/MCP-0066CC?style=for-the-badge&logo=protocol&logoColor=white" alt="MCP" width="100"/>                     | ![100%](https://progress-bar.dev/100) | Python, TypeScript, Java, Kotlin, C#, Swift                                                                                    |
| <img src="https://img.shields.io/badge/Pampa-FF2D20?style=for-the-badge&logo=pampa&logoColor=white" alt="Pampa" width="100"/>                    | ![100%](https://progress-bar.dev/100) | Latest                                                                                                                         |

</p>

> **Enhanced Extensibility**: Detailed documentation has been added on how to [extend Agent Rules Kit with new services](/docs/extending-services.md), making it easier to contribute new stacks and features.

## Contributing

For guidelines on contributing to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our project.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🎯 Available Stacks

Choose from a wide range of technology stacks:

| Stack                               | SDKs/Versions                               | Architectures                         |
| ----------------------------------- | ------------------------------------------- | ------------------------------------- |
| **Laravel**                         | 8, 9, 10, 11                                | Standard, DDD, Hexagonal              |
| **Next.js**                         | 12, 13, 14, 15                              | App Router, Pages Router              |
| **Angular**                         | 12, 13, 14, 15, 16, 17, 18                  | Standard, Standalone, Micro-frontends |
| **React**                           | 16, 17, 18, 19                              | Standard, Hooks, Concurrent           |
| **Vue.js**                          | 2, 3                                        | Options API, Composition API, Nuxt    |
| **Astro**                           | 3, 4                                        | Static, SSR, Hybrid                   |
| **React Native**                    | 0.70, 0.71, 0.72, 0.73, 0.74                | Standard, Expo                        |
| **NestJS**                          | 8, 9, 10                                    | Standard, Microservices, GraphQL      |
| **Go**                              | 1.20, 1.21, 1.22                            | Standard, DDD, Hexagonal              |
| **Django**                          | 4, 5                                        | MVT, API, Full-Stack                  |
| **FastAPI**                         | 0.100+                                      | Standard, Async, Microservices        |
| **Express.js**                      | 4                                           | Standard, REST, GraphQL               |
| **Spring Boot**                     | 2, 3                                        | Standard, Reactive, Microservices     |
| **🆕 MCP (Model Context Protocol)** | Python, TypeScript, Java, Kotlin, C#, Swift | Server, Client, Toolkit               |
| **🆕 Pampa**                        | Latest                                      | Standard                              |

### 🔥 Featured: Model Context Protocol (MCP)

MCP is an open standard that enables AI applications to securely connect to data sources. Our rules kit includes comprehensive implementation guides for all major SDKs:

-   **📖 Architecture Concepts**: Core MCP patterns and best practices
-   **🐍 Python SDK**: Async/await patterns with Pydantic validation
-   **🟦 TypeScript SDK**: Type-safe implementations with modern JS
-   **☕ Java SDK**: Enterprise-grade patterns with Spring Boot integration
-   **🎯 Kotlin SDK**: Coroutines and concise syntax
-   **🔷 C# SDK**: .NET integration with dependency injection
-   **🍎 Swift SDK**: Modern Swift with actors and memory safety

Choose your SDK as a "version" when setting up MCP rules!

### 🎯 Featured: Pampa Semantic Code Search

Pampa is our own AI-powered semantic code search tool designed specifically for AI agents:

-   **🔍 Semantic Search**: Understand code meaning, not just syntax
-   **🤖 AI Agent Optimized**: Built specifically for AI agent workflows
-   **🌍 Multi-Language**: Python, TypeScript, Java, Go, PHP, and more
-   **🚀 Simple Setup**: No versions, no complex config - just install and use
-   **🔌 MCP Integration**: Built-in MCP server for seamless AI integration

Perfect for AI agents to quickly understand and navigate any codebase!
