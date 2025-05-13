---
description:
globs: cli/**/*,templates/**/*
alwaysApply: false
---

# Template Processing & Variables

This document explains how templates are processed and variables are substituted in Agent Rules Kit.

## Template Variables

The following variables are available for use in template files:

| Variable            | Description                       | Example            |
| ------------------- | --------------------------------- | ------------------ |
| `{projectPath}`     | Path to the project               | `/path/to/project` |
| `{detectedVersion}` | Detected version of the framework | `10`               |
| `{versionRange}`    | Compatible version range          | `v10-11`           |
| `{stack}`           | Selected stack                    | `laravel`          |

## Processing Flow

1. **Read Template**: Templates are read from `templates/` directory
2. **Process Variables**: All variables in `{placeholder}` format are replaced
3. **Add Front Matter**: Metadata is added as front matter to MDC files
4. **Output Generation**: Processed content is written to destination

## Implementation

The main processing happens in `cli/utils/file-helpers.js`:

```javascript
// Process template variables (simplified example)
const processTemplateVariables = (content, meta = {}) => {
	let processedContent = content;

	// Replace all template variables with their values
	const templateVariables = [
		{ value: meta.detectedVersion, replace: 'detectedVersion' },
		{ value: meta.versionRange, replace: 'versionRange' },
		{ value: meta.projectPath, replace: 'projectPath' },
		{ value: meta.stack, replace: 'stack' },
	];

	templateVariables.forEach(({ value, replace }) => {
		if (value) {
			const regex = new RegExp(`\\{${replace}\\}`, 'g');
			processedContent = processedContent.replace(regex, value);
		}
	});

	return processedContent;
};
```

## Example

Template file:

```markdown
# {stack} Documentation

This project is using {stack} version {detectedVersion}.
It is located at {projectPath}.
```

After processing (if stack=laravel, detectedVersion=10, projectPath=/app):

```markdown
# laravel Documentation

This project is using laravel version 10.
It is located at /app.
```

# Template Structure Guidelines

This document explains the organization pattern for all stack documentation in Agent Rules Kit.

## Core Organization Pattern

All documentation for stacks follows this three-tier structure:

### 1. Base Documentation (Conceptual)

Files in `templates/stacks/<stack>/base/` contain **ONLY** conceptual information with no implementation-specific code. These files:

-   Explain general concepts
-   Provide architectural guidelines
-   Outline best practices
-   Avoid version-specific implementation details

Example: `templates/stacks/<stack>/base/architecture-concepts.md`

### 2. Version-Specific Implementation

Files in `templates/stacks/<stack>/v<number>/` contain concrete implementation examples specific to that version:

-   Code examples showing actual implementation
-   Version-specific APIs and patterns
-   Testing implementations with exact syntax
-   Configuration examples

Example: `templates/stacks/<stack>/v3/testing-best-practices.md`

### 3. Shared Version Implementations

When implementations are identical across adjacent versions, use a shared folder:

-   `templates/stacks/<stack>/v2-3/` for code shared between versions 2 and 3
-   Avoids duplication while maintaining version specificity
-   Should still be implementation-focused

## Naming Conventions

1. Use consistent file names across versions
2. Same base filename should refer to the same concept
3. Keep extensions as `.md` (they will be converted to `.mdc` by the CLI)

## When Editing Templates

-   If adding new concepts: add to `/base` without implementation details
-   If adding version-specific code: add to the appropriate `/v<number>` folder
-   If updating shared code: ensure it's compatible with all versions in the range

This structure maintains clear separation between concepts and implementation, preventing future maintenance issues and ensuring clear guidance for all supported versions.
