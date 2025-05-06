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
