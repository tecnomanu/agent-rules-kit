# [3.1.0](https://github.com/tecnomanu/agent-rules-kit/compare/v3.0.1...v3.1.0) (2025-09-14)


### Features

* ✨ enhance --info command with comprehensive details ([cab9b08](https://github.com/tecnomanu/agent-rules-kit/commit/cab9b08744b514ffbd3dce430ab4557f0513170b))

## [3.0.1](https://github.com/tecnomanu/agent-rules-kit/compare/v3.0.0...v3.0.1) (2025-09-14)


### Bug Fixes

* 🐛 revert incorrect version bump to v3.0.0 ([65cf80d](https://github.com/tecnomanu/agent-rules-kit/commit/65cf80d295a21967f78a4d7549e07e8fbd5ab614))

## [2.4.2](https://github.com/tecnomanu/agent-rules-kit/compare/v2.4.1...v2.4.2) (2025-06-16)

### Bug Fixes

-   expand globs in templates ([0e45d84](https://github.com/tecnomanu/agent-rules-kit/commit/0e45d84cbd2c281ad254e885378bf6008f897595))

## [2.4.1](https://github.com/tecnomanu/agent-rules-kit/compare/v2.4.0...v2.4.1) (2025-06-16)

### Bug Fixes

-   replace root placeholder in docs ([9a4d750](https://github.com/tecnomanu/agent-rules-kit/commit/9a4d750dd2acd6f70b23b08f13e988ac638a5bbf))

# [2.4.0](https://github.com/tecnomanu/agent-rules-kit/compare/v2.3.0...v2.4.0) (2025-06-16)

### Features

-   add command options and agent instructions ([fe0fa6f](https://github.com/tecnomanu/agent-rules-kit/commit/fe0fa6f59c9ea621f871e972710598bc5628e70b))
-   **cli:** add auto-install flag ([9bf8337](https://github.com/tecnomanu/agent-rules-kit/commit/9bf83370a0b2574acd4d053a7f092cbd1a6d928e))

# [2.3.0](https://github.com/tecnomanu/agent-rules-kit/compare/v2.2.0...v2.3.0) (2025-06-09)

### Bug Fixes

-   🐛 complete version-info.md templates and add Astro version detection ([deea278](https://github.com/tecnomanu/agent-rules-kit/commit/deea27861a003b67bf0d7f2fc9e1c5d80a2c4135))

### Features

-   ✨ add Astro v4 and v5 template support with comprehensive feature guides ([b6a375b](https://github.com/tecnomanu/agent-rules-kit/commit/b6a375beee7268330ad38b11b572e57683c4392e))
-   ✨ refactor service architecture with stack-specific version detection ([9024409](https://github.com/tecnomanu/agent-rules-kit/commit/902440958fcb055c24305773a75642f1f8867726))

# [2.2.0](https://github.com/tecnomanu/agent-rules-kit/compare/v2.1.0...v2.2.0) (2025-05-29)

### Features

-   :fire: update go rules ([0706a37](https://github.com/tecnomanu/agent-rules-kit/commit/0706a379e6512783a0365f25f91b2a77bef9c6fc))

# [2.1.0](https://github.com/tecnomanu/agent-rules-kit/compare/v2.0.0...v2.1.0) (2025-05-29)

### Features

-   :fire: add rules for angular ([fb37727](https://github.com/tecnomanu/agent-rules-kit/commit/fb377275af20468f6e0d24c9872f5ee6153fd266))

# [2.0.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.15.0...v2.0.0) (2025-05-29)

### Features

-   :zap: Release new version 2.0 with MCP rules! ([fc89584](https://github.com/tecnomanu/agent-rules-kit/commit/fc89584337d060517b6b2763e7175d94f3293555))

### BREAKING CHANGES

-   Add new options to use rules of mcp tools

# [1.15.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.14.0...v1.15.0) (2025-05-29)

### Features

-   :rocket: Change to version 2.0 with MCP rules now ([3d63abc](https://github.com/tecnomanu/agent-rules-kit/commit/3d63abc505f96d37bebd065972a3936c38027144))

# [1.14.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.13.0...v1.14.0) (2025-05-29)

### Features

-   🎉 complete MCP Tools documentation and upgrade to v2.0.0 - Add comprehensive MCP Tools Development section to CONTRIBUTING.md - Create detailed MCP Tools Integration Guide (docs/mcp-tools-guide.md) - Update services architecture documentation with McpService details - Update CLI development rules with MCP Tools workflow - Upgrade package.json to version 2.0.0 with new MCP keywords - Add multi-select MCP tools support documentation - Document new cli/services/stack/ and cli/services/mcp/ architecture - Include testing guidelines for MCP service development - All 144 tests passing with comprehensive MCP coverage BREAKING CHANGE: Major version 2.0.0 introduces comprehensive MCP Tools integration as a core feature, representing a significant expansion of Agent Rules Kit capabilities. The service architecture has been completely reorganized with new directory structure and dedicated MCP service. ([bfaaadd](https://github.com/tecnomanu/agent-rules-kit/commit/bfaaadd4bb84132fb22375d39d016f11c2be7686))

# [1.13.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.12.0...v1.13.0) (2025-05-29)

### Features

-   🎉 refactor services architecture and enhance MCP tools support - Reorganize services into logical directories (stack/, mcp/) - Create dedicated McpService for better separation of concerns - Move all stack-specific services to cli/services/stack/ directory - Move MCP functionality to cli/services/mcp/ directory - Update all import paths to reflect new structure - Add comprehensive tests for McpService (15 test cases) - Update README with enhanced MCP tools documentation - Add multi-select capability for MCP tools installation - Improve CLI workflow with better organization - All 144 tests passing with new architecture BREAKING CHANGE: Service architecture has been completely reorganized. Stack services moved to cli/services/stack/ and MCP functionality extracted to cli/services/mcp/. Import paths for services have changed, requiring updates for any external integrations. ([31c70d3](https://github.com/tecnomanu/agent-rules-kit/commit/31c70d3752124ff80a9119122ae400a3897a238a))

# [1.12.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.11.1...v1.12.0) (2025-05-29)

### Features

-   ✨ add complete MCP (Model Context Protocol) support - Add comprehensive MCP stack with 6 SDKs (Python, TypeScript, Java, Kotlin, C#, Swift) - Implement base architecture concepts and best practices guides - Create server/client/toolkit architecture options - Add complete SDK-specific implementation guides - Update README with MCP documentation and 100% implementation status - Add kit-config.json support for SDK-as-version approach - Successfully tested with Python and TypeScript SDKs - All 129 tests passing, no regressions ([58500de](https://github.com/tecnomanu/agent-rules-kit/commit/58500de45c69ff1bb91f9aef6da1de227f45b903))
-   ✨ add Pampa semantic code search support - Add Pampa as simple stack with no version complexity - Include semantic search concepts and MCP integration rules - Create installation guide for AI agents - Add comprehensive usage patterns and best practices - Update README with Pampa documentation and 100% status - All 129 tests passing, fully functional ([6d043d1](https://github.com/tecnomanu/agent-rules-kit/commit/6d043d160d8d670a1d581dc4329c1a76db300ec2))
-   🎉 add MCP Tools support and upgrade to v2.0.0 - Add comprehensive MCP tools integration with 5 popular tools (PAMPA, GitHub, Memory, Filesystem, Git) - Create short, practical usage rules focused on agent workflows - Implement checkbox selection for multiple MCP tools - Add new mcp_tools configuration section in kit-config.json - Update CLI with MCP tools selection and installation flow - Add copyMcpToolsRules method to StackService - Update README with MCP Tools Integration section - Upgrade to version 2.0.0 for major feature addition - All 129 tests passing, fully functional BREAKING CHANGE: This introduces a new major feature set with MCP tools support, representing a significant expansion of the Agent Rules Kit capabilities. ([1497ae2](https://github.com/tecnomanu/agent-rules-kit/commit/1497ae2862399f6c36c83f55f220b561b5b8741c))

## [1.11.1](https://github.com/tecnomanu/agent-rules-kit/compare/v1.11.0...v1.11.1) (2025-05-29)

### Bug Fixes

-   🐛 improve service loading system and stack selection ([e10156f](https://github.com/tecnomanu/agent-rules-kit/commit/e10156fe2d44710ca5de77bbd6855de059ec3401))

# [1.11.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.10.0...v1.11.0) (2025-05-29)

### Features

-   ✨ improve CLI UX and fix global rules installation ([5f157f8](https://github.com/tecnomanu/agent-rules-kit/commit/5f157f898c6c47719f298bd63232667816f18d50))

# [1.10.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.9.0...v1.10.0) (2025-05-29)

### Features

-   🎉 implement improved CLI flow and reorganize project structure ([82eb358](https://github.com/tecnomanu/agent-rules-kit/commit/82eb35837ea23f6af6ee126e7a726d4b18724f4f))

# [1.9.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.8.0...v1.9.0) (2025-05-29)

### Features

-   Add generic-service module for testing ([80e103b](https://github.com/tecnomanu/agent-rules-kit/commit/80e103bd851d56edc0e6ebd14557bf7658f28723))
-   Add generic-service module for testing ([2bb0f31](https://github.com/tecnomanu/agent-rules-kit/commit/2bb0f31ee9b7d2c0390114fa2b4fabc26c6bd5cd))

# [1.8.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.7.0...v1.8.0) (2025-05-25)

### Features

-   Add initial support for React Native stack ([5f420b6](https://github.com/tecnomanu/agent-rules-kit/commit/5f420b6c287854edb8f6a589af884b557839cf84))
-   Add version-specific rule templates for React and Next.js ([02e0b41](https://github.com/tecnomanu/agent-rules-kit/commit/02e0b418f8271eea996446312fc7aeae7781c75b))

# [1.7.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.6.0...v1.7.0) (2025-05-16)

### Features

-   Add comprehensive guides for security, SEO, performance optimization, and testing in Nuxt 3 ([082d386](https://github.com/tecnomanu/agent-rules-kit/commit/082d3864924ce33e65d2174d91d22fe3d3ecdcbb))

# [1.6.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.5.0...v1.6.0) (2025-05-15)

### Features

-   ✨ implementación completa del stack de NestJS con arquitecturas standard y microservicios ([c92d8f7](https://github.com/tecnomanu/agent-rules-kit/commit/c92d8f7b1658d53a853c03fedb90abaa001cb35b))

# [1.5.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.4.3...v1.5.0) (2025-05-15)

### Features

-   ✨ implementación completa del stack de Go con múltiples arquitecturas ([c7fa319](https://github.com/tecnomanu/agent-rules-kit/commit/c7fa31928fa4404cce5fdca0445317d8e8838c37))

## [1.4.3](https://github.com/tecnomanu/agent-rules-kit/compare/v1.4.2...v1.4.3) (2025-05-13)

### Bug Fixes

-   📝 Implementación de documentación para SvelteKit al 70% ([b76a55b](https://github.com/tecnomanu/agent-rules-kit/commit/b76a55b3e2fd7d15430d06e1ffca427275f15d32))

## [1.4.2](https://github.com/tecnomanu/agent-rules-kit/compare/v1.4.1...v1.4.2) (2025-05-13)

### Bug Fixes

-   📝 Implementación de documentación para Svelte al 70% ([07fd39c](https://github.com/tecnomanu/agent-rules-kit/commit/07fd39c7adcc8d6f22de572bb631e25b90b6cc60))

## [1.4.1](https://github.com/tecnomanu/agent-rules-kit/compare/v1.4.0...v1.4.1) (2025-05-13)

### Bug Fixes

-   ✨ Make supported stacks list dynamic in info display ([0851ef7](https://github.com/tecnomanu/agent-rules-kit/commit/0851ef77f1d81f114c501153f9ef8d5cf421b492))

# [1.4.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.3.3...v1.4.0) (2025-05-13)

### Features

-   ✨ Add --info flag for project information display ([06f1547](https://github.com/tecnomanu/agent-rules-kit/commit/06f1547f7c49df2d47494f431010d92e328dc269))

# [1.4.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.3.3...v1.4.0) (2025-05-14)

### Features

-   ✨ Add --info flag for project information display ([43feac9](https://github.com/tecnomanu/agent-rules-kit/commit/43feac9))
-   ♻️ Improve test-cli.js with better documentation and options ([26edff3](https://github.com/tecnomanu/agent-rules-kit/commit/26edff3))

### Added

-   New `--info` flag to show project information, usage and repository link
-   Improved documentation for testing with `test-cli.js`
-   Enhanced CLI help messages

### Changed

-   Refactored test CLI script with better documentation
-   Updated glob pattern handling in template files
-   Removed need for test-astro.js by enhancing main test script

## [1.3.3](https://github.com/tecnomanu/agent-rules-kit/compare/v1.3.2...v1.3.3) (2025-05-13)

### Bug Fixes

-   :sparkles: Add Astro documentation ([917755a](https://github.com/tecnomanu/agent-rules-kit/commit/917755a46800e89b7995aa23c93987081a593d23))
-   ✅ update documents globs attribute ([0e29c42](https://github.com/tecnomanu/agent-rules-kit/commit/0e29c42c044fcab965775cff54cdf9efb85bcc62))
-   📝 Add Astro documentation with content collection and integration guides ([a6dcf4a](https://github.com/tecnomanu/agent-rules-kit/commit/a6dcf4afaece94ee6ce8e50fd363dcaf8d5b42c7))
-   🔧 Remove pattern_rules and globs from kit-config.json ([d882b88](https://github.com/tecnomanu/agent-rules-kit/commit/d882b88f725f9810159163b1ad34d6701c76528b))

## [1.3.2](https://github.com/tecnomanu/agent-rules-kit/compare/v1.3.1...v1.3.2) (2025-05-13)

### Bug Fixes

-   :memo: update documentation for nuxt ([f5160d0](https://github.com/tecnomanu/agent-rules-kit/commit/f5160d03a17cc3f1b67c9c893f170520829cb7bc))

## [1.3.1](https://github.com/tecnomanu/agent-rules-kit/compare/v1.3.0...v1.3.1) (2025-05-12)

### Bug Fixes

-   🐛 complete Nuxt 3 documentation and test suite ([b8203a7](https://github.com/tecnomanu/agent-rules-kit/commit/b8203a764e7b1b71c31160f6fbaf9d4d460dca00))

# [1.3.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.2.1...v1.3.0) (2025-05-12)

### Features

-   update environment and fixes new release ([020f518](https://github.com/tecnomanu/agent-rules-kit/commit/020f5183ea596934cf13dc5fe46290e0b4a69b26))

## [1.2.1](https://github.com/tecnomanu/agent-rules-kit/compare/v1.2.0...v1.2.1) (2025-05-08)

### Bug Fixes

-   :zap: show version by package.json on cli and readme update ([ec4ed5a](https://github.com/tecnomanu/agent-rules-kit/commit/ec4ed5ab72866cc8b194c9a4ce6d19fec95937b6))

# [1.2.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.1.0...v1.2.0) (2025-05-08)

### Features

-   :zap: add git commit guidelines as global rules ([b97338a](https://github.com/tecnomanu/agent-rules-kit/commit/b97338a3b7dd7519ceeb0ad3edf73628e5222c33))

# [1.1.0](https://github.com/tecnomanu/agent-rules-kit/compare/v1.0.0...v1.1.0) (2025-05-07)

### Features

-   :memo: set rules as always ([74bc35b](https://github.com/tecnomanu/agent-rules-kit/commit/74bc35bcbae1c1480f328dd998cf2c51dd74ab86))

# [1.0.0](https://github.com/tecnomanu/agent-rules-kit/compare/v0.4.0...v1.0.0) (2025-05-07)

### Features

-   :tada: prepare for major version release with service architecture ([3bba84e](https://github.com/tecnomanu/agent-rules-kit/commit/3bba84ed3ad7cb1812227deb49e8f997566a09c2))

### BREAKING CHANGES

-   Complete refactoring from helper-based to service-based architecture. Service files are now in cli/services/ instead of cli/utils/

# [0.4.0](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.3...v0.4.0) (2025-05-07)

### Bug Fixes

-   **cli:** Actualizar index.js para usar métodos correctos del CliService ([27837d6](https://github.com/tecnomanu/agent-rules-kit/commit/27837d6735b59086af34d56cd2497e14faffa2d3))
-   corregir configuración de mocks en pruebas de servicios para fs-extra ([a2c1a02](https://github.com/tecnomanu/agent-rules-kit/commit/a2c1a0255fd87f22e2a0dd1c39828b7ed08fd6bd))

### Features

-   **core:** Reestructuración completa a arquitectura de servicios v1.0.0 ([a170da1](https://github.com/tecnomanu/agent-rules-kit/commit/a170da1c54a61b6ac28d1ff54ef236955a7153fb))

## [0.3.3](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.2...v0.3.3) (2025-05-07)

### Bug Fixes

-   :zap: add version for some new stacks ([3256689](https://github.com/tecnomanu/agent-rules-kit/commit/3256689dff93b403e97e10bb1ca511e32246bcf3))

## [0.3.2](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.1...v0.3.2) (2025-05-06)

### Bug Fixes

-   :ambulance: add glob rules always and files from configs ([b7252ae](https://github.com/tecnomanu/agent-rules-kit/commit/b7252ae952959498f7e226d2ee89b3ab55bfd6b3))

## [0.3.1](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.0...v0.3.1) (2025-05-06)

### Performance Improvements

-   :zap: Adapting rules and new todos ([2fe7409](https://github.com/tecnomanu/agent-rules-kit/commit/2fe740922e6eb99e18be208e892437dd7b65d743))

# [0.3.0](https://github.com/tecnomanu/agent-rules-kit/compare/v0.2.1...v0.3.0) (2025-05-06)

### Bug Fixes

-   :ambulance: variable uppercase to npm ([4dc8a4c](https://github.com/tecnomanu/agent-rules-kit/commit/4dc8a4c36247649c074fbaf3a15afcf9992f536e))
-   :bug: install pnpm on release workflow ([cda33a3](https://github.com/tecnomanu/agent-rules-kit/commit/cda33a3df0596e2c9055eb183009b859aafd5343))
-   :bug: projectPath default ([8b733c1](https://github.com/tecnomanu/agent-rules-kit/commit/8b733c162a45b6d6c396cc91870fb669f9bb425d))
-   :bug: semantic release ([4af97f7](https://github.com/tecnomanu/agent-rules-kit/commit/4af97f7eac4c0554dab9222c6e5b3a00c80b3a9f))
-   :sparkles: fix variable name ([3ed2a47](https://github.com/tecnomanu/agent-rules-kit/commit/3ed2a47f895cbc48c7f40081915ba9b78d1e1de9))

### Features

-   :bug: add permissions to release ([d53e17c](https://github.com/tecnomanu/agent-rules-kit/commit/d53e17c9c5313d4ae74ef074ab113b3833a4e904))
-   :zap: Changes on release semantic ([7fc5845](https://github.com/tecnomanu/agent-rules-kit/commit/7fc5845e3f1d63e0878b23ba7f0433a736728aee))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   ✨ **Astro v4 and v5 Support**: Extended Astro templates to support the latest framework versions

    -   **Astro v4 Features**: Astro DB, Actions, enhanced i18n, development toolbar enhancements, request rewriting, CSRF protection
    -   **Astro v5 Features**: Content Layer API, Server Islands, astro:env, Sessions (experimental), responsive images, Container API
    -   Comprehensive guides with practical examples for all new features
    -   Updated kit-config.json to include v4 and v5 version ranges
    -   Support for modern Astro development patterns and best practices

-   ✨ **Refactored Service Architecture**: Improved modularity and maintainability
    -   **Stack-specific Services**: Each stack now has its own service with specialized version detection
    -   **Generic Fallback**: Automatic fallback to generic detection patterns when specific services aren't available
    -   **Dynamic Service Loading**: Services are loaded on-demand for better performance
    -   **Centralized Stack Service**: Moved stack-service.js to services/ directory for better organization
    -   **Removed Generic Service**: Eliminated unused generic-service.js and related functionality

### Fixed

-   🐛 **Version Info Templates**: Completed missing version-info.md files
    -   Added comprehensive version-info.md template for examples
    -   Created Astro-specific version-info.md with proper metadata
    -   Enhanced version detection for all supported stacks
    -   Improved template variable substitution and formatting

## [0.2.1] - 2023-10-25

### Added

-   Architecture management for Next.js (app, pages, hybrid)
-   Template variable processing for all files
-   Improved replacement of template variables using array-based approach
-   Status badges in README showing implementation progress
-   Pre-commit and pre-push hooks with Husky
-   Additional Cursor rules for architecture and template processing

### Changed

-   Reorganized Next.js specific code into separate helper file
-   Updated CLI to use architecture selection for Next.js
-   Improved README with direct execution instructions (npx/pnpx)
-   Refactored file helper methods for better maintainability
-   Enhanced test suite with additional tests for Next.js helpers

### Fixed

-   Template variables not being replaced in mirror documentation
-   Default architecture selection in prompts
-   Router/architecture terminology consistency

## [0.2.0] - 2023-10-15

### Added

-   Modular code restructuring for better maintainability
-   Template variable substitution: `{projectPath}`, `{detectedVersion}`, `{versionRange}`
-   Option to confirm or manually select detected framework version
-   English localization of all texts
-   Complete unit tests for all modules
-   Improved README documentation
-   Project logo

### Changed

-   Reorganized `architectures` within each stack in `kit-config.json`
-   Improved architecture/version selection experience in CLI
-   Restructured folders for better organization
-   Updated dependencies versions

### Fixed

-   Template variables not being replaced correctly
-   Architecture detection from new locations

## [0.1.1] - 2023-09-30

### Added

-   Initial support for Laravel, Next.js, React, Angular, NestJS and Astro
-   Framework version detection
-   Base templates for most common stacks
-   Integration with .cursor/rules for use with Cursor AI

### Changed

-   Improved version detection for Laravel
-   Updated documentation

## [0.1.0] - 2023-09-15

### Added

-   Initial CLI version
-   Base project structure
-   Basic Laravel support
