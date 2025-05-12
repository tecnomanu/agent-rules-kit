---
description: Quality control practices for all projects
globs: '**/*'
alwaysApply: true
---

# Project Quality Assurance

This document unifies quality control practices applicable to any project, regardless of the technology stack used.

## Quality Principles

1. **Continuous Verification**: Constantly verify code quality throughout development.
2. **Error Prevention**: Preventing errors is better than correcting them later.
3. **Continuous Improvement**: Continually seek ways to improve processes and code.
4. **Documentation**: Maintain accurate documentation of processes and decisions.

## Automated Testing

-   **Regular Execution**: Run automated test suites after each significant change.
-   **Problem Resolution**: Don't consider a change complete until all tests pass.
-   **Coverage**: Add new tests for new or modified code.
-   **Regression**: Ensure changes don't break existing functionality.

```bash
# Run tests and verify all pass
npm run test

# Framework-specific test commands
php artisan test        # Laravel
ng test                 # Angular
pytest                  # Python
go test ./...           # Go
```

## Process Logging

For complex or long-running tasks, maintain a process log:

1. **Checklist Creation**: Create a log file in `docs/logs-process/`.
2. **Naming Convention**: Use the format `YYYY-MM-DD_task-description.md`.
3. **Content Structure**:
    - Objectives and scope of the task
    - List of subtasks with checkboxes
    - Problems encountered and solutions applied
    - Decisions made and their justification

Example:

```markdown
# Authentication Implementation - 2024-08-15

## Objectives

-   Implement email/password login
-   Add OAuth authentication
-   Implement password recovery

## Tasks

-   [x] Create user models and migrations
-   [x] Implement authentication controller
-   [ ] Configure OAuth providers
-   [ ] Implement password recovery emails

## Problems and Solutions

-   Problem: Conflict with session storage
    Solution: Use database-based storage
```

## File Management

When creating or modifying files in the project:

1. **Existence Verification**: Check if the file already exists before creating it.
2. **Content Preservation**:
    - If it exists and there's no explicit instruction to overwrite, merge changes.
    - Preserve important aspects of the existing file (comments, structure).
3. **Duplication Prevention**: Avoid creating duplicate files or files with similar functionality.
4. **Appropriate Location**: Ensure files are created in the correct location according to the project structure.

## Code Review

1. **Self-Review**: Review your own code before considering it complete.
2. **Verification Checklist**:
    - Does the code follow project conventions?
    - Is it adequately tested?
    - Is documentation updated?
    - Have edge cases been considered?
    - Is performance acceptable?

## Task Completion

Consider a task complete only when:

1. All automated tests pass.
2. It is properly documented.
3. The process log is updated (if applicable).
4. A code review has been performed.
5. Changes are ready to be deployed to production.
