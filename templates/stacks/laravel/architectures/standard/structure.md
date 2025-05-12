---
description: Standard architecture conventions for Laravel projects
globs: '<root>/app/**/*.php'
alwaysApply: false
---

# Standard Laravel Architecture

This project follows the standard Laravel MVC architecture with clearly defined responsibilities.

## Directory Structure

```
app/
├── Console/            # Console commands
├── Exceptions/         # Exception handlers
├── Http/
│   ├── Controllers/    # Handle HTTP requests
│   ├── Middleware/     # HTTP middleware
│   └── Requests/       # Form requests for validation
├── Models/             # Eloquent models
├── Providers/          # Service providers
├── Services/           # Business logic services
└── Repositories/       # Data access repositories
```

## Component Responsibilities

### Controllers

-   Handle HTTP requests and responses
-   Validate input data (via Form Requests)
-   Delegate business logic to services
-   Return appropriate views or API responses
-   Should remain thin - no business logic

```php
public function store(StoreUserRequest $request)
{
    $user = $this->userService->createUser($request->validated());
    return redirect()->route('users.show', $user)->with('success', 'User created successfully');
}
```

### Models

-   Define database relationships
-   Define attribute casts, accessors, and mutators
-   Define custom query scopes
-   No business logic, only data representation

```php
class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'settings' => 'array',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

### Services

-   Contain business logic
-   Coordinate between repositories
-   Handle domain-specific operations
-   May use multiple repositories

```php
class UserService
{
    protected $userRepository;
    protected $roleRepository;

    public function __construct(UserRepository $userRepository, RoleRepository $roleRepository)
    {
        $this->userRepository = $userRepository;
        $this->roleRepository = $roleRepository;
    }

    public function createUser(array $data)
    {
        // Business logic here
        $user = $this->userRepository->create($data);
        $defaultRole = $this->roleRepository->findByName('user');
        $user->roles()->attach($defaultRole->id);

        return $user;
    }
}
```

### Repositories

-   Handle data access logic
-   Implement CRUD operations
-   Abstract database queries
-   Can use the Eloquent ORM

```php
class UserRepository
{
    public function find($id)
    {
        return User::findOrFail($id);
    }

    public function create(array $data)
    {
        return User::create($data);
    }
}
```

## Rules

1. Keep controllers thin, only handling HTTP concerns
2. Move business logic to dedicated services
3. Use repositories for data access
4. Use Form Requests for input validation
5. Keep models focused on relationships and attributes
6. Use service providers for binding interfaces to implementations
