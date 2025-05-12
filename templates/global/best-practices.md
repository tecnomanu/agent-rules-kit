---
description: Global best practices for any development project
globs: '**/*'
alwaysApply: true
---

# Global Best Practices

This document defines best practices applicable to any development project, regardless of the technology stack used.

## General Principles

-   **Code Quality**: Maintain high quality standards throughout all code.
-   **Documentation**: Update documentation when functionality changes.
-   **Testing**: Implement tests for all new or modified code.
-   **Single Responsibility**: Each component should have a single responsibility.
-   **DRY (Don't Repeat Yourself)**: Avoid duplication of code and logic.

## Code Development and Modification

When creating or modifying any component of the system, follow these guidelines:

### Development Process

1. **Context Understanding**: Fully understand the problem before writing code.
2. **Prior Design**: Design the solution before implementing it.
3. **Incremental Development**: Implement in small, verifiable increments.
4. **Code Review**: Review code before considering it complete.
5. **Refactoring**: Improve existing code without changing its behavior.

### Testing

1. **Test First**: Consider writing tests before implementing code (TDD when possible).
2. **Coverage**: Ensure new features have adequate tests.
3. **Automation**: Run tests automatically before committing changes.
4. **Verification**: Ensure all tests pass before finalizing.

### Quality and Maintenance

1. **Error Handling**: Implement appropriate error and exception handling.
2. **Logging**: Add appropriate logs to facilitate debugging and monitoring.
3. **Security**: Consider security implications in every change.
4. **Performance**: Evaluate the performance impact of changes made.

## Source Code Management

1. **Version Control**: Properly use the version control system.
2. **Small Commits**: Make small, focused commits with specific purposes.
3. **Descriptive Messages**: Write clear and descriptive commit messages.
4. **Working Branches**: Use branches for features, fixes, or tasks.
5. **Pull Requests**: Request code review through pull requests.

## Problem Solving

1. **Root Cause Analysis**: Identify the fundamental cause of problems.
2. **Durable Solutions**: Implement solutions that address the root problem.
3. **Solution Documentation**: Document complex problems and their solutions.
4. **Continuous Learning**: Learn from mistakes and continuously improve.

## Teamwork

1. **Clear Communication**: Communicate changes and design decisions to the team.
2. **Collaboration**: Collaborate with other team members on complex problems.
3. **Knowledge Sharing**: Document and share knowledge with the team.
4. **Code Reviews**: Participate in code reviews constructively.
