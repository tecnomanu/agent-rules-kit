---
description: Domain-Driven Design architecture conventions for Laravel
globs: <root>/app/Domain/**/*.php,<root>/app/Application/**/*.php,<root>/app/Infrastructure/**/*.php
alwaysApply: false
---

# Domain-Driven Design (DDD) Architecture for Laravel

This project follows the Domain-Driven Design principles, organizing code around the business domain and its rules.

## Directory Structure

```
app/
├── Application/         # Application layer
│   ├── Commands/        # Command handlers
│   ├── Queries/         # Query handlers
│   ├── DTOs/            # Data Transfer Objects
│   └── Services/        # Application services
│
├── Domain/              # Domain layer
│   ├── Models/          # Domain models
│   ├── Events/          # Domain events
│   ├── ValueObjects/    # Value objects
│   ├── Exceptions/      # Domain exceptions
│   └── Repositories/    # Repository interfaces
│
├── Infrastructure/      # Infrastructure layer
│   ├── Eloquent/        # Eloquent implementations
│   │   ├── Models/      # Eloquent model classes
│   │   └── Repositories/# Repository implementations
│   ├── Services/        # External service integrations
│   └── Providers/       # Service providers
│
└── Interfaces/          # Interface layer
    ├── Http/            # HTTP interfaces
    │   ├── Controllers/ # HTTP controllers
    │   ├── Middleware/  # HTTP middleware
    │   ├── Requests/    # Form requests for validation
    │   └── Resources/   # API resources
    └── Console/         # CLI interfaces
        └── Commands/    # Artisan commands
```

## Layer Responsibilities

### Domain Layer

This is the core layer containing the business logic, domain models, and business rules.

-   **Domain Models**: Business entities with behaviors and rules
-   **Value Objects**: Immutable objects representing concepts in the domain
-   **Repository Interfaces**: Define how domain objects are accessed
-   **Domain Events**: Events that occur in the domain
-   **Domain Services**: Complex domain operations that don't belong to a single entity

```php
// Domain/Models/User.php
namespace App\Domain\Models;

class User
{
    private $id;
    private $email;
    private $name;
    private $roles = [];

    // Constructor, getters, setters...

    public function hasRole(string $roleName): bool
    {
        return in_array($roleName, $this->roles);
    }

    public function addRole(string $roleName): void
    {
        if (!$this->hasRole($roleName)) {
            $this->roles[] = $roleName;
        }
    }
}
```

### Application Layer

This layer coordinates the application tasks, orchestrating domain objects to perform business use cases.

-   **Commands/Handlers**: Execute operations that change state
-   **Queries/Handlers**: Execute operations that retrieve data
-   **Application Services**: Orchestrate domain objects to fulfill use cases
-   **DTOs**: Transfer data between layers

```php
// Application/Commands/CreateUserHandler.php
namespace App\Application\Commands;

use App\Domain\Models\User;
use App\Domain\Repositories\UserRepositoryInterface;

class CreateUserHandler
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function handle(CreateUserCommand $command): void
    {
        $user = new User(
            $command->getName(),
            $command->getEmail()
        );

        $user->addRole('user');

        $this->userRepository->save($user);

        // Dispatch domain events...
    }
}
```

### Infrastructure Layer

This layer provides implementations for interfaces defined in the domain layer, such as repositories, services, etc.

-   **Repository Implementations**: Implement domain repository interfaces
-   **Eloquent Models**: Database ORM models
-   **External Services**: Integration with external APIs and services

```php
// Infrastructure/Eloquent/Repositories/EloquentUserRepository.php
namespace App\Infrastructure\Eloquent\Repositories;

use App\Domain\Models\User as DomainUser;
use App\Domain\Repositories\UserRepositoryInterface;
use App\Infrastructure\Eloquent\Models\User as EloquentUser;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function find($id): ?DomainUser
    {
        $user = EloquentUser::find($id);

        if (!$user) {
            return null;
        }

        return $this->toDomainModel($user);
    }

    public function save(DomainUser $user): void
    {
        // Convert domain model to Eloquent and save
        EloquentUser::updateOrCreate(
            ['id' => $user->getId()],
            [
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                // ...
            ]
        );
    }

    private function toDomainModel(EloquentUser $eloquentUser): DomainUser
    {
        // Map Eloquent model to domain model
        $user = new DomainUser(
            $eloquentUser->name,
            $eloquentUser->email
        );

        // Set other properties...

        return $user;
    }
}
```

### Interface Layer

This layer handles communication with the outside world (UI, API, CLI).

-   **Controllers**: Handle HTTP requests
-   **CLI Commands**: Handle console commands
-   **API Resources**: Format data for API responses

```php
// Interfaces/Http/Controllers/UserController.php
namespace App\Interfaces\Http\Controllers;

use App\Application\Commands\CreateUserCommand;
use App\Application\Queries\GetUserQuery;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private $commandBus;
    private $queryBus;

    // Constructor...

    public function store(Request $request)
    {
        $command = new CreateUserCommand(
            $request->input('name'),
            $request->input('email'),
            $request->input('password')
        );

        $this->commandBus->dispatch($command);

        return response()->json(['message' => 'User created successfully'], 201);
    }
}
```

## Rules

1. Domain layer should not depend on any other layer
2. Domain entities should encapsulate business rules and behaviors
3. Application layer coordinates domain objects to fulfill use cases
4. Infrastructure provides implementations of domain interfaces
5. Interface layer should be thin, focused on translating external requests to application commands/queries
6. Use DTOs to transfer data between layers
7. External services should be accessed through interfaces defined in the domain layer
