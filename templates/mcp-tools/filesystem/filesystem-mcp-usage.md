---
globs: <root>/**/*
alwaysApply: false
---

# Filesystem MCP Usage Rules

You have access to Filesystem MCP for secure file operations with configurable access controls.

## Basic Instructions

1. **ALWAYS check permissions first:**

    - Verify allowed paths with `filesystem_list_allowed_directories`
    - Ensure you have read/write access to target directories
    - Stay within configured access boundaries

2. **BEFORE file operations:**

    - Use `filesystem_read_directory` to understand structure
    - Check if files exist with `filesystem_read_file`
    - Plan operations to avoid overwriting important files

3. **WHEN working with files:**
    - Read existing content before modifying
    - Create backups for important file changes
    - Use appropriate file paths and extensions

## Available Tools

-   `filesystem_read_file(path)` - Read file contents
-   `filesystem_write_file(path, content)` - Write/create file
-   `filesystem_read_directory(path)` - List directory contents
-   `filesystem_create_directory(path)` - Create new directory
-   `filesystem_delete_file(path)` - Delete file (use carefully)
-   `filesystem_move_file(source, destination)` - Move/rename file
-   `filesystem_get_file_info(path)` - Get file metadata
-   `filesystem_list_allowed_directories()` - Show accessible paths

## Strategy

Always read before writing. Understand directory structure first. Respect file permissions and access boundaries.

## Common Patterns

### Project Setup:

1. `filesystem_list_allowed_directories` → Check access
2. `filesystem_read_directory` → Understand structure
3. `filesystem_create_directory` → Create needed folders
4. `filesystem_write_file` → Add project files

### File Analysis:

1. `filesystem_read_directory` → List files
2. `filesystem_get_file_info` → Check file details
3. `filesystem_read_file` → Analyze content
4. Document findings

### Safe Updates:

1. `filesystem_read_file` → Get current content
2. `filesystem_write_file` → Create backup copy
3. `filesystem_write_file` → Write updated version
4. Verify changes work correctly

### Code Organization:

1. `filesystem_read_directory` → Analyze structure
2. `filesystem_create_directory` → Organize into folders
3. `filesystem_move_file` → Reorganize files
4. Update import/require paths

## Security Notes

-   Only operate within allowed directories
-   Never delete files without explicit permission
-   Always backup before major changes
-   Verify file paths before operations
-   Use relative paths when possible
