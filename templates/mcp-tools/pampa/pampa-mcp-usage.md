---
globs: ['<root>/**/*']
alwaysApply: false
---

# PAMPA MCP Usage Rules

You have access to PAMPA, a code memory system that indexes and allows semantic search in projects.

## Critical Instructions

1. **ALWAYS use FULL ABSOLUTE PATHS** (not relative paths):

    - Use `/Users/user-name/project-path` as the base path
    - Never use `.` or relative paths like `./`
    - All PAMPA commands must receive the complete absolute path

2. **Handle Connection Errors**:
    - If you receive "connection closed" error, immediately run `get_project_stats`
    - This checks if `.pampa/` exists and have database.
    - If no database exists, run `index_project` with full path
    - Then retry the original operation

## Basic Instructions

1. **ALWAYS at the start of a session:**

    - Run `get_project_stats` to check if the project is indexed
    - If no database exists, run `index_project`
    - Run `update_project` to sync with recent changes

2. **BEFORE creating any function:**

    - Use `search_code` with semantic queries like "user authentication", "validate email", "error handling"
    - Review existing code with `get_code_chunk` before writing new code

3. **AFTER modifying code:**
    - Run `update_project` to update the knowledge base
    - This keeps the project memory synchronized

## Available Tools

-   `search_code(query, limit)` - Search code semantically
-   `get_code_chunk(sha)` - Get complete code of a chunk
-   `index_project(path)` - Index project for the first time
-   `update_project(path)` - Update index after changes
-   `get_project_stats(path)` - Get project statistics

## Strategy

Use PAMPA as your project memory. Search before creating, keep updated after changes, and leverage existing knowledge to avoid code duplication.

## Query Examples

```
"user authentication middleware"
"database connection setup"
"error handling patterns"
"form validation logic"
"API endpoint configuration"
```

Always use descriptive, intent-based queries that describe what the code does, not just keywords.
