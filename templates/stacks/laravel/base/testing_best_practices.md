---
description: Testing best practices for Laravel applications
globs: '<root>/app/**/*.php,<root>/bootstrap/**/*.php,<root>/routes/**/*.php,<root>/database/migrations/**/*.php,<root>/config/**/*.php,<root>/tests/**/*.php'
alwaysApply: false
---

# Testing Practices in Laravel

## General Principles

-   **Test Driven Development (TDD)**: Write tests before code when possible.
-   **Automated Tests**: Every change should be covered by automated tests.
-   **Coverage**: Aim for 80% code coverage or higher.
-   **Isolation**: Tests should be independent and executable in any order.
-   **Determinism**: Tests should produce the same result in every execution.

## Types of Tests

### Unit Tests

-   Location: `tests/Unit/`
-   Test classes and methods in isolation (Services, Repositories, etc.)
-   Use mocks for external dependencies
-   Fast and without database access

### Integration Tests

-   Location: `tests/Feature/`
-   Test interaction between components
-   May access the database
-   Cover complete application flows

### API Tests

-   Location: `tests/Feature/Api/`
-   Test API endpoints from an external perspective
-   Verify status codes, response structure, and error cases

## Test Execution

### With Each Change

-   Run tests affected by the change: `php artisan test --filter=TestName`
-   Before commit/push, run the complete suite: `php artisan test`
-   For improved speed: `php artisan test --parallel`

### In CI/CD

-   All tests must pass before integrating code
-   Configure GitHub Actions or similar to run tests automatically

## Best Practices

-   Use **factories** to create test data
-   Implement **DatabaseTransactions** or **RefreshDatabase** to clean the DB
-   Prefer specific assertions (assertEquals) over generic ones (assertTrue)
-   Name tests descriptively: `test_user_can_reset_password()`
-   A test should verify a single functionality or behavior

## Recommended Tools

-   **Pest PHP** (preferred since Laravel 8)
-   **PHPUnit** (traditional alternative)
-   **Laravel Dusk** for browser tests
-   **Mockery** for object mocks

## Measurement and Improvement

-   Run coverage analysis: `php artisan test --coverage`
-   Regularly review test metrics
-   Update tests when refactoring code
