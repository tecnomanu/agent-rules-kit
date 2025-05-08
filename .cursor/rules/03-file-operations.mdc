---
description: 
globs: 
alwaysApply: true
---
# File Operations Guidelines

These guidelines apply to all file operations in the Agent Rules Kit project.
!Important: Al the system and files most be in english 
 <!-- In the future: or using the translations system -->

## File Creation and Modification

- Before creating a file, check if it already exists to avoid duplication
- When modifying existing files, preserve the original formatting and style
- If a file exists and there is no explicit instruction to overwrite, merge content instead of replacing
- Ensure all new files have appropriate permissions
- Add file headers with description and copyright information where applicable

## Template Files

- Template files in the `templates/` directory should:
  - Use clear, descriptive names
  - Include meaningful comments
  - Provide examples for customization
  - Follow the established naming patterns
  - Use proper file extensions

## Rule Files Structure

- All rule files should follow a consistent structure:
  - Title at the top
  - Brief description of purpose
  - Sections with clear headings
  - Code examples where appropriate
  - Version compatibility information if relevant

## Path Handling

- Use path manipulation utilities (like Node.js `path` module) instead of string concatenation
- Handle both relative and absolute paths correctly
- Use platform-appropriate path separators
- Normalize paths when comparing or storing them
- Validate paths before file operations

## File I/O

- Use asynchronous file operations when possible
- Properly handle file operation errors
- Close file handles after use
- Use appropriate encoding for text files (UTF-8 preferred)
- Implement proper error recovery for file operations

## Configuration Files

- Keep configuration files in standard formats (JSON, YAML, etc.)
- Validate configuration files against schemas
- Provide sensible defaults
- Document all configuration options
- Use environment variables for sensitive information

## Version Control Considerations

- Don't track generated files in version control
- Add appropriate entries to .gitignore
- Consider using .gitattributes for handling line endings
- Backup important files before destructive operations
- Ensure file timestamps are preserved when appropriate
