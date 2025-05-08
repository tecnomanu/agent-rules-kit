## Template Variables

Templates can use special variables that will be replaced when generating the rules:

| Variable            | Description             | Example            |
| ------------------- | ----------------------- | ------------------ |
| `{projectPath}`     | Path to the project     | `/path/to/project` |
| `{detectedVersion}` | Detected version number | `10`               |
| `{versionRange}`    | Version range for rules | `v10-11`           |
| `{stack}`           | The technology stack    | `laravel`          |

## Frontmatter Configuration

Rule files (.md) in the templates can now include their own frontmatter configuration:

```md
---
globs: ['<root>/app/**/*.php', '<root>/routes/**/*.php']
alwaysApply: true
---

# Rule Title

Rule content...
```

### Available Frontmatter Properties

-   `globs`: Defines which files this rule applies to. Can be a string or an array.
-   `alwaysApply`: When `true`, the rule is applied regardless of file type.

### Configuration Precedence

1. Frontmatter in the template file takes highest precedence
2. If no frontmatter is present, the CLI will apply defaults from `kit-config.json`

## Exporting Rules

You can export rules without the Cursor-specific frontmatter using the `exportMdcToMd` function:

```js
const fileService = new FileService();
await fileService.exportMdcToMd('path/to/rule.mdc', 'path/to/exported.md');
```

This allows using rules in other documentation contexts.
