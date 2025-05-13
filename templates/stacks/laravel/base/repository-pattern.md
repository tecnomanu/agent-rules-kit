---
description: Repository pattern implementation for Laravel applications
globs: <root>/app/**/*.php,<root>/bootstrap/**/*.php,<root>/routes/**/*.php,<root>/database/migrations/**/*.php,<root>/config/**/*.php,<root>/tests/**/*.php
alwaysApply: false
---

# Repository Pattern in Laravel

This document defines best practices for implementing the Repository Pattern in Laravel applications.

## Purpose

The Repository Pattern provides an abstraction layer between business logic and data access, allowing:

-   **Decoupling** data sources from application logic
-   **Centralizing** database queries
-   **Facilitating** unit testing through mocks
-   **Standardizing** CRUD operations across the application

## Basic Structure

### Interfaces

```php
// {Namespace}\Repositories\Contracts\UserRepositoryInterface.php
namespace {Namespace}\Repositories\Contracts;

interface UserRepositoryInterface
{
    public function all();
    public function find(int $id);
    public function findByEmail(string $email);
    public function create(array $attributes);
    public function update(int $id, array $attributes);
    public function delete(int $id);
}
```

### Implementations

```php
// {Namespace}\Repositories\Eloquent\UserRepository.php
namespace {Namespace}\Repositories\Eloquent;

use {Namespace}\Models\User;
use {Namespace}\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    protected $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function find(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function findByEmail(string $email)
    {
        return $this->model->where('email', $email)->first();
    }

    public function create(array $attributes)
    {
        return $this->model->create($attributes);
    }

    public function update(int $id, array $attributes)
    {
        $model = $this->find($id);
        $model->update($attributes);
        return $model;
    }

    public function delete(int $id)
    {
        return $this->find($id)->delete();
    }
}
```

## Registering Repositories

Create a Service Provider for your repositories:

```php
// {Namespace}\Providers\RepositoryServiceProvider.php
namespace {Namespace}\Providers;

use Illuminate\Support\ServiceProvider;
use {Namespace}\Repositories\Contracts\UserRepositoryInterface;
use {Namespace}\Repositories\Eloquent\UserRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        // Register other repositories here
    }
}
```

Add to the providers array in `config/app.php`:

```php
'providers' => [
    // Other providers
    {Namespace}\Providers\RepositoryServiceProvider::class,
],
```

## Usage in Services/Controllers

```php
// {Namespace}\Services\UserService.php
namespace {Namespace}\Services;

use {Namespace}\Repositories\Contracts\UserRepositoryInterface;

class UserService
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllUsers()
    {
        return $this->userRepository->all();
    }

    // Other service methods...
}
```

## Base Repository (Optional)

For reusing common code:

```php
// {Namespace}\Repositories\Eloquent\BaseRepository.php
namespace {Namespace}\Repositories\Eloquent;

use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository
{
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function find(int $id)
    {
        return $this->model->findOrFail($id);
    }

    // Additional common methods...
}
```

## Testing

```php
// tests/Unit/Repositories/UserRepositoryTest.php
namespace Tests\Unit\Repositories;

use Tests\TestCase;
use {Namespace}\Models\User;
use {Namespace}\Repositories\Eloquent\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new UserRepository(new User());
    }

    public function test_can_create_user()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ];

        $user = $this->repository->create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
    }

    // Other tests...
}
```

## Best Practices

1. **Clear Method Naming**: Use descriptive names for operations.
2. **Specific Repositories**: One repository per entity/model.
3. **Use Interfaces**: Always define an interface for each repository.
4. **Avoid Business Logic**: Repositories should only access data, not implement business rules.
5. **Cache Results**: For frequent queries, consider implementing caching.

## Repository Pattern by Architecture

### Standard Architecture

In the standard Laravel architecture, repositories typically use:

```
App\Repositories\Contracts\UserRepositoryInterface
App\Repositories\Eloquent\UserRepository
```

### Domain-Driven Design

In DDD architecture, repositories might use:

```
App\Domain\User\Repositories\UserRepositoryInterface
App\Infrastructure\Persistence\Eloquent\UserRepository
```

### Hexagonal Architecture

In Hexagonal architecture, repositories typically use:

```
App\Core\Application\Ports\Output\UserRepositoryPort
App\Adapters\Secondary\Persistence\Eloquent\UserRepository
```
