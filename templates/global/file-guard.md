---
description: File operation guidelines to prevent content loss
globs: **/*
alwaysApply: true
---

# File Management Guard

Before creating a file, check if it already exists. If it exists and there is no explicit instruction to overwrite, merge content instead of replacing.

## Best Practices for File Operations

1. **Check Existence**: Always verify if a file exists before creating it.
2. **Preserve Content**: When a file exists, preserve important elements:

    - Comments and documentation
    - Existing imports
    - License headers
    - Configuration settings

3. **Merge Strategies**:

    - For code files: Add new functions, classes, or methods without removing existing ones
    - For configuration files: Add new settings while preserving existing ones
    - For documentation: Append new information or integrate it with existing content

4. **Communicate Changes**: When modifying existing files, document the nature of the changes.

## When to Overwrite

Only overwrite files when:

1. Explicitly instructed to do so
2. The file is known to be a generated file that should be recreated
3. The entire purpose of the file is being changed
