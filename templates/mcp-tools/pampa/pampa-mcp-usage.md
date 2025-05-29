---
globs: ['<root>/**/*']
alwaysApply: false
---

# PAMPA MCP Usage Rules

You have access to PAMPA, a code memory system that indexes and allows semantic search in projects.

## Basic Instructions

1. **ALWAYS at the start of a session:**

    - Run `pampa_get_project_stats` to check if the project is indexed
    - If no database exists, run `pampa_index_project`
    - Run `pampa_update_project` to sync with recent changes

2. **BEFORE creating any function:**

    - Use `pampa_search_code` with semantic queries like "user authentication", "validate email", "error handling"
    - Review existing code with `pampa_get_code_chunk` before writing new code

3. **AFTER modifying code:**
    - Run `pampa_update_project` to update the knowledge base
    - This keeps the project memory synchronized

## Available Tools

-   `pampa_search_code(query, limit)` - Search code semantically
-   `pampa_get_code_chunk(sha)` - Get complete code of a chunk
-   `pampa_index_project(path)` - Index project for the first time
-   `pampa_update_project(path)` - Update index after changes
-   `pampa_get_project_stats(path)` - Get project statistics

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
