# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
