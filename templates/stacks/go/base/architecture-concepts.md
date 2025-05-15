---
description: Core architectural concepts for Go applications
globs: <root>/**/*.go
alwaysApply: false
---

# Go Architecture Concepts

Go promotes a clean, modular, and pragmatic approach to software design. This document outlines the core architectural concepts for Go applications.

## Fundamental Principles

Go's design philosophy emphasizes:

1. **Simplicity** - Straightforward code that's easy to read and maintain
2. **Pragmatism** - Practical solutions over theoretical purity
3. **Composition over inheritance** - Building by combining small, focused components
4. **Explicit over implicit** - Clear, obvious behavior over hidden magic
5. **Concurrency as a first-class citizen** - Built-in patterns for concurrent programming

## Standard Project Layout

Most Go projects follow a standard layout:

```
project-root/
├── cmd/                  # Main applications for this project
│   ├── app1/             # Application 1 entry point
│   └── app2/             # Application 2 entry point
├── internal/             # Private code that can't be imported
│   ├── pkg1/             # Private package 1
│   └── pkg2/             # Private package 2
├── pkg/                  # Public code that can be imported
│   ├── pkg1/             # Public package 1
│   └── pkg2/             # Public package 2
├── api/                  # API definitions (Protocol buffers, OpenAPI/Swagger)
├── configs/              # Configuration files
├── docs/                 # Documentation files
├── examples/             # Examples for public packages
├── test/                 # Additional tests and test data
├── scripts/              # Scripts for build, CI, etc.
├── third_party/          # Third-party utilities
├── vendor/               # Application dependencies (if vendoring)
├── go.mod                # Go module definition
├── go.sum                # Go module checksums
└── README.md             # Project documentation
```

## Common Architectural Patterns

### 1. Standard MVC-like Structure

While Go doesn't enforce MVC, a similar separation is common:

```
app/
├── handlers/     # Request handlers (Controller)
├── models/       # Data models and business logic (Model)
├── views/        # Templates or view logic (View)
├── services/     # Business services
├── repositories/ # Data access layer
└── main.go       # Application entry point
```

### 2. Clean Architecture

```
app/
├── domain/       # Business entities and interfaces
├── usecases/     # Business logic
├── interfaces/   # Interface adapters (controllers, gateways)
├── infrastructure/ # Implementation details (database, frameworks)
└── main.go       # Application entry point
```

### 3. Domain-Driven Design (DDD)

```
app/
├── domain/
│   ├── aggregate1/   # Domain aggregates
│   ├── aggregate2/
│   ├── entities/     # Domain entities
│   └── valueobjects/ # Value objects
├── application/      # Application services
├── infrastructure/   # Technical details
└── interfaces/       # User interfaces
```

### 4. Hexagonal (Ports & Adapters)

```
app/
├── core/          # Application core
│   └── domain/    # Domain entities and logic
├── ports/         # Interface definitions
│   ├── input/     # Primary ports (APIs)
│   └── output/    # Secondary ports (repositories)
└── adapters/      # Implementation of ports
    ├── primary/   # Input adapters (REST, gRPC)
    └── secondary/ # Output adapters (databases)
```

## Interface-Driven Design

Go favors small, composable interfaces. Define interfaces at the point of use:

```go
// Definer of the interface
type UserRepository interface {
    GetByID(id string) (*User, error)
    Save(user *User) error
}

// Implementation
type PostgresUserRepository struct {
    db *sql.DB
}

func (r *PostgresUserRepository) GetByID(id string) (*User, error) {
    // ...
}
```

## Dependency Injection

Explicit dependency injection is common in Go:

```go
// Service depends on the repository
type UserService struct {
    repo UserRepository
}

// Constructor with dependency injection
func NewUserService(repo UserRepository) *UserService {
    return &UserService{
        repo: repo,
    }
}
```

## Concurrent Pattern Examples

### 1. Worker Pool

```go
func worker(jobs <-chan Job, results chan<- Result) {
    for job := range jobs {
        results <- process(job)
    }
}

func main() {
    jobs := make(chan Job, 100)
    results := make(chan Result, 100)

    // Start workers
    for w := 1; w <= 3; w++ {
        go worker(jobs, results)
    }

    // Send jobs
    for _, job := range allJobs {
        jobs <- job
    }
    close(jobs)

    // Collect results
    for a := 1; a <= len(allJobs); a++ {
        <-results
    }
}
```

### 2. Fan-out, Fan-in

```go
func fanOut(input <-chan int, n int) []<-chan int {
    channels := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        channels[i] = worker(input)
    }
    return channels
}

func fanIn(channels []<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    for _, c := range channels {
        wg.Add(1)
        go func(ch <-chan int) {
            for v := range ch {
                out <- v
            }
            wg.Done()
        }(c)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

## Data Flow Patterns

### 1. Repository Pattern

```go
type Repository interface {
    Get(id string) (Entity, error)
    Save(entity Entity) error
}

type PostgresRepository struct {
    db *sql.DB
}

func (r *PostgresRepository) Get(id string) (Entity, error) {
    // Implementation
}
```

### 2. Service Layer

```go
type Service struct {
    repo Repository
}

func (s *Service) ProcessEntity(id string) error {
    entity, err := s.repo.Get(id)
    if err != nil {
        return err
    }

    // Process entity
    entity.Process()

    return s.repo.Save(entity)
}
```

## Best Practices

1. **Keep interfaces small** - Single-method interfaces are often best
2. **Accept interfaces, return structs** - Allows for maximum flexibility
3. **Use composition over inheritance** - Embed structs to reuse code
4. **Follow the "accept interfaces, return structs" principle**
5. **Organize by feature**, not by layer
6. **Use context for cancellation, deadlines, and request-scoped values**
7. **Design for testing** - Dependency injection makes unit testing easier
8. **Prefer standard library solutions** when they're sufficient
