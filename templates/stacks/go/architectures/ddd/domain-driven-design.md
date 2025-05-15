---
description: Domain-Driven Design architecture for Go applications
globs: <root>/**/*.go
alwaysApply: false
---

# Domain-Driven Design (DDD) in Go

This document outlines how to implement Domain-Driven Design principles in Go applications.

## Core DDD Concepts

Domain-Driven Design is an approach that emphasizes focusing on the core domain and domain logic, with a collaboration between technical and domain experts to create a rich, expressive model. In Go, we can implement these concepts with the language's strengths.

### Key DDD Building Blocks

1. **Entities**: Objects with a unique identity
2. **Value Objects**: Immutable objects without identity
3. **Aggregates**: Clusters of entities and value objects
4. **Repositories**: Handle persistence for aggregates
5. **Domain Services**: Business operations that don't belong to a specific entity
6. **Domain Events**: Record significant occurrences within the domain
7. **Bounded Contexts**: Explicit boundaries within which a model applies

## Project Structure for DDD in Go

A typical Go project following DDD principles:

```
myapp/
├── cmd/                       # Application entry points
│   └── api/                   # Web API entry point
│       └── main.go
├── internal/                  # Private application code
│   ├── domain/                # Domain model
│   │   ├── user/              # User bounded context
│   │   │   ├── entity.go      # User entity
│   │   │   ├── value.go       # Value objects
│   │   │   ├── repository.go  # Repository interface
│   │   │   ├── service.go     # Domain service
│   │   │   └── event.go       # Domain events
│   │   └── order/             # Order bounded context
│   │       ├── entity.go
│   │       ├── value.go
│   │       └── ...
│   ├── application/           # Application services
│   │   ├── user/
│   │   │   └── service.go     # Application service
│   │   └── order/
│   │       └── service.go
│   └── infrastructure/        # Technical implementations
│       ├── persistence/       # Database implementations
│       │   ├── mongo/
│       │   └── postgres/
│       └── api/               # API layer
│           └── handlers/
└── pkg/                       # Public libraries
    └── common/                # Shared utilities
```

## DDD Implementation in Go

### Entities

Entities have a unique identity and are mutable:

```go
// internal/domain/user/entity.go
package user

import (
    "time"
    "github.com/google/uuid"
)

// User is a domain entity
type User struct {
    ID        string
    Email     Email      // Value object
    Name      string
    CreatedAt time.Time
    UpdatedAt time.Time
}

// NewUser creates a new user entity
func NewUser(email Email, name string) (*User, error) {
    if name == "" {
        return nil, ErrEmptyName
    }

    now := time.Now()
    return &User{
        ID:        uuid.New().String(),
        Email:     email,
        Name:      name,
        CreatedAt: now,
        UpdatedAt: now,
    }, nil
}

// ChangeName updates the user's name
func (u *User) ChangeName(name string) error {
    if name == "" {
        return ErrEmptyName
    }

    u.Name = name
    u.UpdatedAt = time.Now()
    return nil
}
```

### Value Objects

Value objects are immutable and don't have identity:

```go
// internal/domain/user/value.go
package user

import (
    "errors"
    "regexp"
    "strings"
)

var (
    ErrInvalidEmail = errors.New("invalid email address")
    ErrEmptyName    = errors.New("name cannot be empty")
)

// Email is a value object
type Email string

// NewEmail creates a validated email value object
func NewEmail(email string) (Email, error) {
    email = strings.TrimSpace(email)
    if !isValidEmail(email) {
        return "", ErrInvalidEmail
    }
    return Email(email), nil
}

// String returns the string representation
func (e Email) String() string {
    return string(e)
}

// isValidEmail validates an email using regex
func isValidEmail(email string) bool {
    pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
    return regexp.MustCompile(pattern).MatchString(email)
}
```

### Aggregates

Aggregates group entities and value objects:

```go
// internal/domain/order/entity.go
package order

import (
    "errors"
    "time"
    "github.com/google/uuid"
)

var (
    ErrEmptyOrderID   = errors.New("order ID cannot be empty")
    ErrInvalidProduct = errors.New("invalid product")
    ErrInvalidQuantity = errors.New("quantity must be positive")
)

// Order is an aggregate root
type Order struct {
    ID         string
    CustomerID string
    Status     OrderStatus
    Items      []OrderItem
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

// OrderItem is an entity within the Order aggregate
type OrderItem struct {
    ID        string
    ProductID string
    Quantity  int
    Price     Money
}

// Money is a value object
type Money struct {
    Amount   float64
    Currency string
}

// OrderStatus is a value object
type OrderStatus string

const (
    StatusPending   OrderStatus = "pending"
    StatusConfirmed OrderStatus = "confirmed"
    StatusShipped   OrderStatus = "shipped"
    StatusDelivered OrderStatus = "delivered"
    StatusCancelled OrderStatus = "cancelled"
)

// NewOrder creates a new order
func NewOrder(customerID string) *Order {
    return &Order{
        ID:         uuid.New().String(),
        CustomerID: customerID,
        Status:     StatusPending,
        Items:      []OrderItem{},
        CreatedAt:  time.Now(),
        UpdatedAt:  time.Now(),
    }
}

// AddItem adds a product to the order
func (o *Order) AddItem(productID string, quantity int, price float64, currency string) error {
    if productID == "" {
        return ErrInvalidProduct
    }

    if quantity <= 0 {
        return ErrInvalidQuantity
    }

    item := OrderItem{
        ID:        uuid.New().String(),
        ProductID: productID,
        Quantity:  quantity,
        Price: Money{
            Amount:   price,
            Currency: currency,
        },
    }

    o.Items = append(o.Items, item)
    o.UpdatedAt = time.Now()
    return nil
}

// ConfirmOrder changes order status to confirmed
func (o *Order) ConfirmOrder() {
    if o.Status == StatusPending {
        o.Status = StatusConfirmed
        o.UpdatedAt = time.Now()
    }
}
```

### Repositories

Repositories provide data access abstraction:

```go
// internal/domain/user/repository.go
package user

import "context"

// Repository defines operations for user persistence
type Repository interface {
    GetByID(ctx context.Context, id string) (*User, error)
    GetByEmail(ctx context.Context, email Email) (*User, error)
    Save(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
}
```

### Implementation of Repositories

```go
// internal/infrastructure/persistence/postgres/user_repository.go
package postgres

import (
    "context"
    "database/sql"
    "errors"
    "myapp/internal/domain/user"
)

// UserRepository implements user.Repository with PostgreSQL
type UserRepository struct {
    db *sql.DB
}

// NewUserRepository creates a new PostgreSQL repository
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

// GetByID fetches a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
    query := `SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`

    var u user.User
    var email string
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &u.ID,
        &email,
        &u.Name,
        &u.CreatedAt,
        &u.UpdatedAt,
    )

    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, errors.New("user not found")
        }
        return nil, err
    }

    u.Email, _ = user.NewEmail(email) // We assume it's valid since it was in the DB
    return &u, nil
}

// Save persists a user to the database
func (r *UserRepository) Save(ctx context.Context, u *user.User) error {
    query := `
        INSERT INTO users (id, email, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET email = $2, name = $3, updated_at = $5
    `

    _, err := r.db.ExecContext(
        ctx,
        query,
        u.ID,
        u.Email.String(),
        u.Name,
        u.CreatedAt,
        u.UpdatedAt,
    )
    return err
}

// Implement other repository methods...
```

### Domain Services

Domain services handle operations that don't belong to a single entity:

```go
// internal/domain/user/service.go
package user

import "context"

// Service contains domain logic for users
type Service struct {
    repo Repository
}

// NewService creates a new domain service
func NewService(repo Repository) *Service {
    return &Service{repo: repo}
}

// AuthenticateUser validates credentials and returns a user
func (s *Service) AuthenticateUser(ctx context.Context, email Email, password string) (*User, error) {
    // In a real app, you'd have a password field and proper hashing
    user, err := s.repo.GetByEmail(ctx, email)
    if err != nil {
        return nil, err
    }

    // Authentication logic here...

    return user, nil
}
```

### Application Services

Application services coordinate the domain operations:

```go
// internal/application/user/service.go
package user

import (
    "context"
    "myapp/internal/domain/user"
)

// Service coordinates domain operations
type Service struct {
    userDomainService *user.Service
    userRepo          user.Repository
}

// NewService creates a new application service
func NewService(domainService *user.Service, repo user.Repository) *Service {
    return &Service{
        userDomainService: domainService,
        userRepo:          repo,
    }
}

// RegisterUser handles user registration
func (s *Service) RegisterUser(ctx context.Context, emailStr, name string) (*user.User, error) {
    // Create and validate value objects
    email, err := user.NewEmail(emailStr)
    if err != nil {
        return nil, err
    }

    // Check if user already exists
    existingUser, err := s.userRepo.GetByEmail(ctx, email)
    if existingUser != nil {
        return nil, user.ErrUserAlreadyExists
    }

    // Create domain entity
    newUser, err := user.NewUser(email, name)
    if err != nil {
        return nil, err
    }

    // Persist the user
    if err := s.userRepo.Save(ctx, newUser); err != nil {
        return nil, err
    }

    return newUser, nil
}
```

### Domain Events

Domain events represent significant occurrences in the domain:

```go
// internal/domain/user/event.go
package user

import "time"

// Event represents a domain event
type Event interface {
    EventName() string
    OccurredAt() time.Time
}

// UserCreatedEvent is fired when a user is created
type UserCreatedEvent struct {
    ID        string
    Email     string
    Name      string
    Timestamp time.Time
}

// EventName returns the event name
func (e UserCreatedEvent) EventName() string {
    return "user.created"
}

// OccurredAt returns when the event occurred
func (e UserCreatedEvent) OccurredAt() time.Time {
    return e.Timestamp
}

// NewUserCreatedEvent creates a new user created event
func NewUserCreatedEvent(user *User) UserCreatedEvent {
    return UserCreatedEvent{
        ID:        user.ID,
        Email:     user.Email.String(),
        Name:      user.Name,
        Timestamp: time.Now(),
    }
}
```

## Implementing Bounded Contexts

Bounded contexts are explicit boundaries where a domain model applies. In Go, we can separate them using packages:

```go
internal/
├── domain/
│   ├── user/       # User bounded context
│   │   └── ...
│   ├── order/      # Order bounded context
│   │   └── ...
│   ├── catalog/    # Product catalog bounded context
│   │   └── ...
│   └── shipping/   # Shipping bounded context
│       └── ...
```

Each bounded context has its own domain model, potentially with different representations of shared concepts.

## Context Mapping with Anti-Corruption Layer

When bounded contexts need to interact, implement an anti-corruption layer to translate between models:

```go
// internal/infrastructure/acl/user_order_translator.go
package acl

import (
    "myapp/internal/domain/order"
    "myapp/internal/domain/user"
)

// UserOrderTranslator translates between User and Order contexts
type UserOrderTranslator struct {
    userRepo user.Repository
}

// NewUserOrderTranslator creates a new translator
func NewUserOrderTranslator(userRepo user.Repository) *UserOrderTranslator {
    return &UserOrderTranslator{userRepo: userRepo}
}

// TranslateUserToCustomer converts a user to a customer in the order context
func (t *UserOrderTranslator) TranslateUserToCustomer(u *user.User) *order.Customer {
    return &order.Customer{
        ID:    u.ID,
        Name:  u.Name,
        Email: u.Email.String(),
    }
}
```

## Wiring It All Together

Wire everything together in the main function:

```go
// cmd/api/main.go
package main

import (
    "database/sql"
    "log"
    "net/http"

    "myapp/internal/application/user"
    userDomain "myapp/internal/domain/user"
    "myapp/internal/infrastructure/persistence/postgres"
    "myapp/internal/infrastructure/api/handlers"

    _ "github.com/lib/pq"
)

func main() {
    // Setup database
    db, err := sql.Open("postgres", "postgres://user:password@localhost/myapp?sslmode=disable")
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer db.Close()

    // Create repositories
    userRepo := postgres.NewUserRepository(db)

    // Create domain services
    userDomainService := userDomain.NewService(userRepo)

    // Create application services
    userAppService := user.NewService(userDomainService, userRepo)

    // Create API handlers
    userHandler := handlers.NewUserHandler(userAppService)

    // Setup router
    mux := http.NewServeMux()
    mux.HandleFunc("/api/users", userHandler.HandleUsers)
    mux.HandleFunc("/api/users/", userHandler.HandleUser)

    // Start server
    log.Println("Starting server on :8080")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
```

## DDD Best Practices in Go

1. **Use Go's type system** to enforce domain rules and invariants
2. **Leverage immutability** for value objects using unexported fields
3. **Use interfaces** to define repositories and services
4. **Apply composition** over inheritance
5. **Use domain events** to decouple bounded contexts
6. **Start with a rich domain model** and evolve it based on your understanding of the domain
7. **Collaborate with domain experts** to discover the ubiquitous language
8. **Document the ubiquitous language** in your code through clear naming and comments
