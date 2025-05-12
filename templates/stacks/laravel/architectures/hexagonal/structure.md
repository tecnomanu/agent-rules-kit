---
description: Hexagonal (Ports & Adapters) architecture conventions for Laravel
globs: '<root>/app/Core/**/*.php,<root>/app/Adapters/**/*.php,<root>/app/Ports/**/*.php'
alwaysApply: false
---

# Hexagonal Architecture (Ports and Adapters) for Laravel

This project follows the Hexagonal Architecture pattern, which isolates the core application from external concerns.

## Directory Structure

```
app/
├── Core/                    # The application core (domain + application)
│   ├── Domain/              # Domain layer
│   │   ├── Models/          # Domain entities
│   │   ├── ValueObjects/    # Value objects
│   │   ├── Events/          # Domain events
│   │   ├── Exceptions/      # Domain exceptions
│   │   └── Services/        # Domain services
│   │
│   ├── Application/         # Application services
│   │   ├── Services/        # Use case implementations
│   │   ├── Ports/           # Ports (interfaces)
│   │   │   ├── Input/       # Input ports (use cases)
│   │   │   └── Output/      # Output ports (repositories, etc.)
│   │   └── DTOs/            # Data Transfer Objects
│   │
│   └── Shared/              # Shared kernel
│       ├── Exceptions/      # Shared exceptions
│       └── Traits/          # Shared traits
│
├── Adapters/                # Adapters for the outside world
│   ├── Primary/             # Primary adapters (driving the application)
│   │   ├── Http/            # HTTP controllers and middleware
│   │   │   ├── Controllers/ # HTTP controllers
│   │   │   ├── Middleware/  # HTTP middleware
│   │   │   └── Requests/    # Form requests for validation
│   │   ├── Console/         # Console commands
│   │   └── Events/          # Event listeners
│   │
│   └── Secondary/           # Secondary adapters (driven by the application)
│       ├── Persistence/     # Database persistence adapters
│       │   ├── Eloquent/    # Eloquent models and repositories
│       │   └── Cache/       # Cache adapters
│       ├── Services/        # External service adapters
│       └── Queue/           # Queue adapters
│
└── Infrastructure/          # Framework-specific code
    ├── Providers/           # Service providers
    └── Bootstrap/           # Bootstrap code
```

## Component Responsibilities

### Core (Domain + Application)

The core contains the business logic and use cases, independent of external concerns:

#### Domain Layer

-   **Models**: Business entities with business rules
-   **Value Objects**: Immutable objects representing domain concepts
-   **Domain Services**: Operations that don't belong to a specific entity
-   **Events**: Domain events emitted by domain objects

```php
// Core/Domain/Models/User.php
namespace App\Core\Domain\Models;

class User
{
    private $id;
    private $email;
    private $name;
    private $password;

    // Constructor, getters, setters...

    public function verifyPassword(string $password): bool
    {
        // Domain logic for password verification
        return password_verify($password, $this->password);
    }
}
```

#### Application Layer

-   **Ports**: Interfaces defining the core's boundaries
    -   **Input Ports**: Use cases the application offers
    -   **Output Ports**: Services the application requires
-   **Services**: Implementation of use cases (input ports)
-   **DTOs**: Objects to transfer data across boundaries

```php
// Core/Application/Ports/Input/CreateUserUseCase.php
namespace App\Core\Application\Ports\Input;

use App\Core\Application\DTOs\UserDTO;

interface CreateUserUseCase
{
    public function execute(UserDTO $userDTO): void;
}

// Core/Application/Ports/Output/UserRepositoryPort.php
namespace App\Core\Application\Ports\Output;

use App\Core\Domain\Models\User;

interface UserRepositoryPort
{
    public function save(User $user): void;
    public function findById(string $id): ?User;
}

// Core/Application/Services/CreateUserService.php
namespace App\Core\Application\Services;

use App\Core\Application\DTOs\UserDTO;
use App\Core\Application\Ports\Input\CreateUserUseCase;
use App\Core\Application\Ports\Output\UserRepositoryPort;
use App\Core\Domain\Models\User;

class CreateUserService implements CreateUserUseCase
{
    private $userRepository;

    public function __construct(UserRepositoryPort $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function execute(UserDTO $userDTO): void
    {
        $user = new User(
            $userDTO->getName(),
            $userDTO->getEmail(),
            $userDTO->getPassword()
        );

        $this->userRepository->save($user);
    }
}
```

### Adapters

Adapters connect the core to the outside world:

#### Primary Adapters (Driving)

These drive the application by calling its use cases:

-   **HTTP Controllers**: Handle HTTP requests
-   **Console Commands**: Handle CLI commands
-   **Event Listeners**: React to external events

```php
// Adapters/Primary/Http/Controllers/UserController.php
namespace App\Adapters\Primary\Http\Controllers;

use App\Core\Application\DTOs\UserDTO;
use App\Core\Application\Ports\Input\CreateUserUseCase;
use App\Adapters\Primary\Http\Requests\CreateUserRequest;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private $createUserUseCase;

    public function __construct(CreateUserUseCase $createUserUseCase)
    {
        $this->createUserUseCase = $createUserUseCase;
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $dto = new UserDTO(
            $request->input('name'),
            $request->input('email'),
            $request->input('password')
        );

        $this->createUserUseCase->execute($dto);

        return response()->json(['message' => 'User created'], 201);
    }
}
```

#### Secondary Adapters (Driven)

These are driven by the application to interface with external systems:

-   **Repositories**: Implement output ports for persistence
-   **External Services**: Implement output ports for external services
-   **Cache Adapters**: Implement output ports for caching

```php
// Adapters/Secondary/Persistence/Eloquent/UserRepository.php
namespace App\Adapters\Secondary\Persistence\Eloquent;

use App\Core\Application\Ports\Output\UserRepositoryPort;
use App\Core\Domain\Models\User as DomainUser;
use App\Adapters\Secondary\Persistence\Eloquent\Models\User as EloquentUser;

class UserRepository implements UserRepositoryPort
{
    public function save(DomainUser $user): void
    {
        $eloquentUser = new EloquentUser();
        $eloquentUser->name = $user->getName();
        $eloquentUser->email = $user->getEmail();
        $eloquentUser->password = $user->getPassword();
        $eloquentUser->save();
    }

    public function findById(string $id): ?DomainUser
    {
        $eloquentUser = EloquentUser::find($id);

        if (!$eloquentUser) {
            return null;
        }

        return new DomainUser(
            $eloquentUser->name,
            $eloquentUser->email,
            $eloquentUser->password
        );
    }
}
```

## Rules

1. The core (domain and application) must not depend on adapters or infrastructure
2. All external dependencies must be abstracted behind ports (interfaces)
3. Adapters implement the ports defined by the core
4. Communication across boundaries should use DTOs, not domain objects
5. Service providers wire up ports to their adapter implementations
6. Domain logic should be encapsulated in domain objects
7. Use case implementations coordinate domain objects to fulfill business requirements
