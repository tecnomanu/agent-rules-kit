---
description: Testing best practices for Laravel 10-11
globs: <root>/tests/**/*.php
alwaysApply: false
---

# Testing in Laravel 10-11

This file complements the base Laravel testing practices with specific aspects for versions 10 and 11.

## Enhanced Tools

-   **Pest PHP** is now the recommended standard
-   Native support for Parallel Testing without additional dependencies
-   Use of `expect()` for more expressive assertions

## New Features

### Pest PHP Enhancements

```php
// Example file: tests/Feature/UserTest.php
it('can create a user', function () {
    // Arrange
    $userData = User::factory()->make()->toArray();

    // Act
    $response = $this->post('/api/users', $userData);

    // Assert
    $response->assertStatus(201)
             ->assertJsonStructure(['id', 'name', 'email']);

    expect(User::where('email', $userData['email'])->exists())->toBeTrue();
});
```

### Test Parallelization

Run tests in parallel for improved speed:

```bash
php artisan test --parallel
```

In `phpunit.xml`, optimize the configuration:

```xml
<testsuites>
    <testsuite name="Unit">
        <directory>tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
        <directory>tests/Feature</directory>
    </testsuite>
</testsuites>
```

## Enhanced API Testing

-   Using Laravel Sanctum for authentication in tests:

```php
actingAs($user, 'sanctum')->getJson('/api/profile');
```

-   API testing with HTTP transactions:

```php
$this->withSession(['foo' => 'bar'])
     ->withHeaders(['X-API-KEY' => $apiKey])
     ->getJson('/api/resource');
```

## CI Integration

Example GitHub Actions configuration for Laravel 10-11:

```yaml
name: Laravel Tests

on: [push, pull_request]

jobs:
    tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - name: Setup PHP
              uses: shivammathur/setup-php@v2
              with:
                  php-version: '8.1'
                  extensions: mbstring, dom, fileinfo, mysql
                  coverage: xdebug
            - name: Install Dependencies
              run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress
            - name: Execute Tests
              run: php artisan test --parallel
```
