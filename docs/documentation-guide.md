# Documentation Guide for Agent Rules Kit

This document provides guidelines for creating and improving documentation in Agent Rules Kit, focusing on a maintainable and coherent structure that facilitates both automatic generation and use of rules.

## Documentation Structure

### 1. Global Rules

Global rules are located in `templates/global/` and apply to all projects regardless of framework:

```
templates/global/
├── best-practices.md      # General best practices
├── code-standards.md      # Universal code standards
├── file-guard.md          # Guide for safe file operations
└── log-process.md         # Process documentation
```

### 2. Framework-Specific Rules

Each framework has its own documentation organized as follows:

```
templates/stacks/<framework>/
├── base/                  # Fundamental concepts independent of version
├── architectures/         # Architecture-specific rules
│   ├── standard/
│   ├── ddd/
│   └── hexagonal/
└── v<version>/            # Version-specific implementations
```

## Configuration in kit-config.json

The `kit-config.json` file is fundamental for defining how rules are applied:

```json
{
	"laravel": {
		"default_architecture": "standard",
		"version_ranges": {
			"10": {
				"name": "Laravel 10-11",
				"range_name": "v10-11"
			}
		},
		"pattern_rules": {
			"<root>/app/Models/**/*.php": [
				"stacks/laravel/base/best-practices.md",
				"stacks/laravel/v10-11/model-casting.md"
			]
		},
		"architectures": {
			"standard": {
				"name": "Standard Laravel (MVC with Repositories)",
				"pattern_rules": {
					"<root>/app/Models/**/*.php": [
						"stacks/laravel/architectures/standard/models.md"
					]
				}
			}
		}
	}
}
```

### Main Elements

1. **default_architecture**: The default architecture for the stack
2. **version_ranges**: Mapping of versions to ranges with descriptive names
3. **pattern_rules**: Assignment of rules to file patterns
4. **architectures**: Configuration of specific architectures

## Frontmatter for Rules

Each rule file can include frontmatter configuration:

```markdown
---
globs: <root>/app/**/*.php,<root>/routes/**/*.php
alwaysApply: true
---

# Example Rule

Rule content...
```

### Header Configuration (Frontmatter)

It is critical that each documentation file includes proper configuration in its header to determine which files it will apply to. There are two recommended approaches:

1. **Universal Application** - Using `always: true`:

    ```markdown
    ---
    title: Best Practices
    description: Best practices guide
    tags: [Framework, Best Practices]
    always: true
    ---
    ```

    This approach makes the rule apply to all files in the stack regardless of their type or location. Ideal for fundamental rules such as naming conventions or best practices.

2. **Specific Application** - Using `globs`:

    ```markdown
    ---
    title: Version X Features
    description: Specific features of version X
    tags: [Framework, Version X]
    globs: <root>/src/**/*.js,<root>/config/*.js
    ---
    ```

    This approach specifies exact glob patterns to determine which files the rule applies to. This allows precise granularity and is ideal for component or feature-specific rules.

### Glob Patterns - Important Considerations

When defining glob patterns in frontmatter, it's important to consider these limitations:

1. **Don't use braces with alternatives and commas**: The system interprets commas within `{...}` as separators of complete patterns, not as alternatives within the same pattern. For example:

    **Incorrect (don't use):**

    ```
    globs: <root>/src/**/*.{md,mdx},<root>/astro.config.{js,mjs,ts}
    ```

    **Correct (use separate patterns):**

    ```
    globs: <root>/src/**/*.md,<root>/src/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts
    ```

2. **Alternative for similar files**: If you need to include many similar extensions, consider using a more general pattern:
    ```
    globs: <root>/src/**/*.*
    ```
    But keep in mind that this could include unwanted files.

> **IMPORTANT**: For stacks like Astro, Vue, or React, it is recommended to define application rules directly in the documents using `always: true` or specific `globs`, instead of relying on patterns in `kit-config.json`. This provides greater flexibility and clarity.

## Template Variables

Use template variables to make your documentation dynamic:

| Variable            | Description              | Example        |
| ------------------- | ------------------------ | -------------- |
| `{projectPath}`     | Path to the project      | `/path/to/app` |
| `{detectedVersion}` | Detected version         | `10`           |
| `{versionRange}`    | Compatible version range | `v10-11`       |
| `{stack}`           | Technology stack         | `laravel`      |
| `{architecture}`    | Selected architecture    | `standard`     |

Example:

```markdown
# Guide for {stack} {versionRange}

This documentation applies to projects using {stack} version {detectedVersion}.
```

## Documentation Best Practices

### Consistent Structure

Each rule file should follow this structure:

1. **Title**: Clear name indicating the purpose
2. **Brief Description**: Concise explanation of the concept
3. **Guidelines**: Specific instructions
4. **Examples**: Code exemplifying the correct implementation
5. **Version Notes**: Information about compatibility (if applicable)

### Separation of Concepts and Implementation

-   In `base/`: Document concepts without specific implementation details
-   In `v<version>/`: Provide concrete implementations with real code
-   In `architectures/`: Detail specific architectural patterns

### Use of Examples

Examples should be:

-   Concise but complete
-   Executable without modification
-   Representative of real use cases
-   With explanatory comments

```php
// Good example: Laravel model implementation
class User extends Model
{
    // Use type properties
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Use relationships with return type
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

## Documentation Update Process

1. **Identify Gaps**: Review existing documentation and detect gaps
2. **Update kit-config.json**: Add new patterns or version ranges if necessary
3. **Create/Update Rules**: Edit .md files following the established structure
4. **Test Generation**: Run `npx agent-rules-kit --debug` to verify
5. **Request Review**: Ask for feedback before integrating major changes

## Example of New Documentation Development

### 1. Identify Need

Let's say we want to add documentation for repository patterns in Laravel.

### 2. File Structure

```
templates/stacks/laravel/
├── base/
│   └── repository-pattern-concept.md    # Repository concepts
├── architectures/
│   └── standard/
│       └── repository-implementation.md # Specific implementation
└── v10-11/
    └── repository-example.md            # Concrete example for v10-11
```

### 3. Update kit-config.json

```json
"pattern_rules": {
  "<root>/app/Repositories/**/*.php": [
    "stacks/laravel/base/repository-pattern-concept.md",
    "stacks/laravel/architectures/standard/repository-implementation.md",
    "stacks/laravel/v10-11/repository-example.md"
  ]
}
```

### 4. Create the Rule Files

Consistent structure in each file with concepts, guidelines, and examples.

## Best Practices for Rule Generation

1. **Keep Documentation in English**: According to project policies
2. **Be Concise**: Avoid excessively long documentation
3. **Update with Each Version**: Review rules when there are new framework versions
4. **Provide Context**: Explain why a practice is recommended
5. **Document Common Pitfalls**: Help avoid frequent errors
6. **Maintain Visual Consistency**: Use consistent formats throughout the documentation

## Using Generation Scripts

For complex projects, consider creating scripts that generate documentation:

```javascript
const fs = require('fs-extra');
const path = require('path');

// Example: generate documentation for multiple versions
async function generateVersionDocs(framework, versions, template) {
	for (const version of versions) {
		const targetDir = path.join(
			'templates/stacks',
			framework,
			`v${version}`
		);
		await fs.ensureDir(targetDir);

		const content = fs
			.readFileSync(template, 'utf8')
			.replace('{version}', version);

		await fs.writeFile(path.join(targetDir, 'implementation.md'), content);
	}
}

// Usage
generateVersionDocs(
	'laravel',
	['8', '9', '10', '11'],
	'templates/base-template.md'
);
```

## Conclusion

Effective documentation is essential for Agent Rules Kit to fulfill its mission of guiding AI agents. By following these guidelines, you will contribute to maintaining a coherent system of rules that evolves with the technologies it supports.
