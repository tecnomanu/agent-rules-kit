## [0.3.3](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.2...v0.3.3) (2025-05-07)


### Bug Fixes

* :zap: add version for some new stacks ([3256689](https://github.com/tecnomanu/agent-rules-kit/commit/3256689dff93b403e97e10bb1ca511e32246bcf3))

## [0.3.2](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.1...v0.3.2) (2025-05-06)


### Bug Fixes

* :ambulance: add glob rules always and files from configs ([b7252ae](https://github.com/tecnomanu/agent-rules-kit/commit/b7252ae952959498f7e226d2ee89b3ab55bfd6b3))

## [0.3.1](https://github.com/tecnomanu/agent-rules-kit/compare/v0.3.0...v0.3.1) (2025-05-06)


### Performance Improvements

* :zap: Adapting rules and new todos ([2fe7409](https://github.com/tecnomanu/agent-rules-kit/commit/2fe740922e6eb99e18be208e892437dd7b65d743))

# [0.3.0](https://github.com/tecnomanu/agent-rules-kit/compare/v0.2.1...v0.3.0) (2025-05-06)


### Bug Fixes

* :ambulance: variable uppercase to npm ([4dc8a4c](https://github.com/tecnomanu/agent-rules-kit/commit/4dc8a4c36247649c074fbaf3a15afcf9992f536e))
* :bug: install pnpm on release workflow ([cda33a3](https://github.com/tecnomanu/agent-rules-kit/commit/cda33a3df0596e2c9055eb183009b859aafd5343))
* :bug: projectPath default ([8b733c1](https://github.com/tecnomanu/agent-rules-kit/commit/8b733c162a45b6d6c396cc91870fb669f9bb425d))
* :bug: semantic release ([4af97f7](https://github.com/tecnomanu/agent-rules-kit/commit/4af97f7eac4c0554dab9222c6e5b3a00c80b3a9f))
* :sparkles: fix variable name ([3ed2a47](https://github.com/tecnomanu/agent-rules-kit/commit/3ed2a47f895cbc48c7f40081915ba9b78d1e1de9))


### Features

* :bug: add permissions to release ([d53e17c](https://github.com/tecnomanu/agent-rules-kit/commit/d53e17c9c5313d4ae74ef074ab113b3833a4e904))
* :zap: Changes on release semantic ([7fc5845](https://github.com/tecnomanu/agent-rules-kit/commit/7fc5845e3f1d63e0878b23ba7f0433a736728aee))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
