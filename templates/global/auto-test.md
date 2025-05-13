---
description: Guidelines for automated testing
globs: **/*
alwaysApply: true
---

# Automated Testing

Run the test suite after each change and fix issues until all tests pass.

## Testing Workflow

1. **Run Tests Frequently**: Execute tests after implementing each logical component.
2. **Fix Issues Immediately**: Address test failures as soon as they appear.
3. **Regression Testing**: Ensure existing functionality remains intact.
4. **Test Coverage**: Add new tests when implementing new features.

## Common Test Commands

```bash
# Framework-specific test commands
npm test                 # Node.js/JavaScript
php artisan test        # Laravel
ng test                 # Angular
mvn test                # Java/Maven
pytest                  # Python
go test ./...           # Go
```

## Test-Driven Development

Consider adopting TDD principles:

1. Write a failing test first
2. Implement the minimal code to pass the test
3. Refactor while keeping tests passing
