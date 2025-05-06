# Testing in Laravel 12

This file complements the base Laravel testing practices with specific aspects for version 12.

## Testing Innovations in Laravel 12

### Integrated Test Runner

Laravel 12 includes a new native test runner that enhances the testing experience:

```bash
# Run all tests
php artisan test

# Run with advanced options
php artisan test --parallel --coverage
```

### Pest PHP as the Standard

Pest PHP becomes the de facto standard for testing in Laravel 12:

```php
// tests/Feature/UserTest.php
<?php

use App\Models\User;

it('can view the dashboard when authenticated', function () {
    // Arrange
    $user = User::factory()->create();

    // Act & Assert
    $this->actingAs($user)
         ->get('/dashboard')
         ->assertOk()
         ->assertViewIs('dashboard');
});

it('redirects to login when not authenticated', function () {
    // Act & Assert
    $this->get('/dashboard')
         ->assertRedirect('/login');
});
```

### API Testing with Laravel Prompts

```php
test('can create a user via API', function () {
    // Arrange
    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ];

    // Act
    $response = $this->postJson('/api/users', $userData);

    // Assert
    $response->assertCreated()
             ->assertJsonPath('data.name', $userData['name'])
             ->assertJsonPath('data.email', $userData['email']);

    $this->assertDatabaseHas('users', [
        'email' => $userData['email'],
    ]);
});
```

### Testing with Broadcasting

Laravel 12 makes it easier to test broadcast events:

```php
test('notification is broadcast to user', function () {
    // Arrange
    Event::fake([NotificationSent::class]);
    $user = User::factory()->create();

    // Act
    $this->actingAs($user)
         ->post('/notifications/test');

    // Assert
    Event::assertDispatched(function (NotificationSent $event) use ($user) {
        return $event->notifiable->id === $user->id &&
               $event->channel === 'database';
    });
});
```

## CI/CD with GitHub Actions for Laravel 12

Example of optimized GitHub Actions configuration:

```yaml
name: Laravel Tests

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    laravel-tests:
        runs-on: ubuntu-latest

        services:
            mysql:
                image: mysql:8.0
                env:
                    MYSQL_ROOT_PASSWORD: password
                    MYSQL_DATABASE: laravel_test
                ports:
                    - 3306:3306
                options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

        steps:
            - uses: shivammathur/setup-php@v2
              with:
                  php-version: '8.2'
                  extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, mysql, pdo_mysql
                  coverage: xdebug

            - uses: actions/checkout@v3

            - name: Copy .env
              run: cp .env.example .env

            - name: Install Composer Dependencies
              run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress

            - name: Generate Key
              run: php artisan key:generate

            - name: Directory Permissions
              run: chmod -R 777 storage bootstrap/cache

            - name: Execute Tests
              env:
                  DB_CONNECTION: mysql
                  DB_HOST: 127.0.0.1
                  DB_PORT: 3306
                  DB_DATABASE: laravel_test
                  DB_USERNAME: root
                  DB_PASSWORD: password
              run: php artisan test --parallel
```

## New Assertions in Laravel 12

Laravel 12 includes new assertions that simplify testing:

```php
// HTTP response testing
$response->assertSuccessful();
$response->assertCreated();
$response->assertNoContent();

// JSON testing
$response->assertJsonPath('data.attributes.title', 'My Title');
$response->assertJsonCount(3, 'data');

// Email testing
Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->subject === 'Welcome to our platform';
});
```

## Parallelization and Performance

Laravel 12 significantly improves test performance:

```bash
# Run tests with parallelization and specific group
php artisan test --parallel --group api
```

Configuration to improve performance in `phpunit.xml`:

```xml
<phpunit
    colors="true"
    processIsolation="false"
    stopOnFailure="false"
    cacheResult="true"
    cacheResultFile=".phpunit.result.cache"
>
    <!-- ... -->
</phpunit>
```

> Note: These practices are specific to Laravel 12. Make sure to update your tests when migrating from previous versions.
