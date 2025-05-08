---
description: 
globs: cli/**/*,templates/**/*
alwaysApply: false
---
# Template Processing & Variables

This document explains how templates are processed and variables are substituted in Agent Rules Kit.

## Template Variables

The following variables are available for use in template files:

| Variable | Description | Example |
|----------|-------------|---------|
| `{projectPath}` | Path to the project | `/path/to/project` |
| `{detectedVersion}` | Detected version of the framework | `10` |
| `{versionRange}` | Compatible version range | `v10-11` |
| `{stack}` | Selected stack | `laravel` |

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
    { value: meta.stack, replace: 'stack' }
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
