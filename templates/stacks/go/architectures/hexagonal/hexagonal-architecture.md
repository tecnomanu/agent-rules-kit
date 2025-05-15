---
description: Hexagonal (Ports & Adapters) architecture for Go applications
globs: <root>/**/*.go
alwaysApply: false
---

# Hexagonal Architecture in Go

This document explains how to implement the Hexagonal Architecture pattern (also known as Ports and Adapters) in Go applications.

## Core Concepts

Hexagonal Architecture, introduced by Alistair Cockburn, organizes the application into layers:

1. **Domain** (Application Core): Contains the business logic
2. **Ports**: Interfaces that define how the application core interacts with the outside world
3. **Adapters**: Implementations of those interfaces that connect to external systems

The key benefit is that the domain doesn't depend on any external concerns, making it easier to test and maintain.

## Project Structure

A typical Go project using Hexagonal Architecture:

```
myapp/
├── cmd/                         # Application entry points
│   └── api/                     # Web API entry point
│       └── main.go
├── internal/                    # Private application code
│   ├── core/                    # Application core
│   │   ├── domain/              # Domain entities and logic
│   │   │   ├── user.go
│   │   │   └── errors.go
│   │   └── services/            # Business logic
│   │       └── user_service.go
│   ├── ports/                   # Interface definitions
│   │   ├── repositories/        # Data access interfaces (secondary ports)
│   │   │   └── user_repository.go
│   │   └── handlers/            # API interfaces (primary ports)
│   │       └── user_handler.go
│   └── adapters/                # Interface implementations
│       ├── repositories/        # Secondary adapters (outbound)
│       │   ├── postgres/
│       │   │   └── user_repository.go
│       │   └── mongodb/
│       │       └── user_repository.go
│       └── handlers/            # Primary adapters (inbound)
│           ├── rest/
│           │   └── user_handler.go
│           └── grpc/
│               └── user_handler.go
└── pkg/                         # Public libraries
    └── common/                  # Shared utilities
```

## Implementation Example

### Domain Entities

```go
// internal/core/domain/user.go
package domain

import (
    "errors"
    "time"
)

// User represents a user in the system
type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
}

// NewUser creates a new user entity
func NewUser(email, name string) (*User, error) {
    if email == "" {
        return nil, errors.New("email cannot be empty")
    }
    if name == "" {
        return nil, errors.New("name cannot be empty")
    }

    return &User{
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }, nil
}

// Validate validates the user entity
func (u *User) Validate() error {
    if u.Email == "" {
        return errors.New("email cannot be empty")
    }
    if u.Name == "" {
        return errors.New("name cannot be empty")
    }
    return nil
}
```

### Domain Errors

```go
// internal/core/domain/errors.go
package domain

import "errors"

// Domain errors
var (
    ErrUserNotFound     = errors.New("user not found")
    ErrUserAlreadyExists = errors.New("user already exists")
    ErrInvalidInput     = errors.New("invalid input")
)
```

### Ports (Interfaces)

Primary port (inbound):

```go
// internal/ports/handlers/user_handler.go
package handlers

import "context"

// UserHandler defines the interface for handling user-related requests
type UserHandler interface {
    GetUser(ctx context.Context, id string) (interface{}, error)
    CreateUser(ctx context.Context, input interface{}) (interface{}, error)
    UpdateUser(ctx context.Context, id string, input interface{}) (interface{}, error)
    DeleteUser(ctx context.Context, id string) error
    ListUsers(ctx context.Context) (interface{}, error)
}
```

Secondary port (outbound):

```go
// internal/ports/repositories/user_repository.go
package repositories

import (
    "context"
    "myapp/internal/core/domain"
)

// UserRepository defines the interface for user data access
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*domain.User, error)
    GetByEmail(ctx context.Context, email string) (*domain.User, error)
    Save(ctx context.Context, user *domain.User) error
    Delete(ctx context.Context, id string) error
    List(ctx context.Context) ([]*domain.User, error)
}
```

### Domain Services

```go
// internal/core/services/user_service.go
package services

import (
    "context"
    "myapp/internal/core/domain"
    "myapp/internal/ports/repositories"
)

// UserService contains the business logic for user operations
type UserService struct {
    userRepo repositories.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo repositories.UserRepository) *UserService {
    return &UserService{
        userRepo: userRepo,
    }
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(ctx context.Context, id string) (*domain.User, error) {
    return s.userRepo.GetByID(ctx, id)
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, email, name string) (*domain.User, error) {
    // Check if user already exists
    existingUser, err := s.userRepo.GetByEmail(ctx, email)
    if err == nil && existingUser != nil {
        return nil, domain.ErrUserAlreadyExists
    }

    // Create new user entity
    user, err := domain.NewUser(email, name)
    if err != nil {
        return nil, err
    }

    // Save user
    if err := s.userRepo.Save(ctx, user); err != nil {
        return nil, err
    }

    return user, nil
}

// UpdateUser updates a user's information
func (s *UserService) UpdateUser(ctx context.Context, id, email, name string) (*domain.User, error) {
    // Get existing user
    user, err := s.userRepo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }

    // Update fields
    if email != "" {
        user.Email = email
    }
    if name != "" {
        user.Name = name
    }

    // Validate
    if err := user.Validate(); err != nil {
        return nil, err
    }

    // Save
    if err := s.userRepo.Save(ctx, user); err != nil {
        return nil, err
    }

    return user, nil
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(ctx context.Context, id string) error {
    return s.userRepo.Delete(ctx, id)
}

// ListUsers lists all users
func (s *UserService) ListUsers(ctx context.Context) ([]*domain.User, error) {
    return s.userRepo.List(ctx)
}
```

### Adapters

Secondary adapter (repository implementation):

```go
// internal/adapters/repositories/postgres/user_repository.go
package postgres

import (
    "context"
    "database/sql"
    "errors"
    "myapp/internal/core/domain"
    "github.com/google/uuid"
)

// UserRepository implements the user repository interface with PostgreSQL
type UserRepository struct {
    db *sql.DB
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{
        db: db,
    }
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
    query := `SELECT id, email, name, created_at FROM users WHERE id = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.CreatedAt,
    )

    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, domain.ErrUserNotFound
        }
        return nil, err
    }

    return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
    query := `SELECT id, email, name, created_at FROM users WHERE email = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, email).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.CreatedAt,
    )

    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, domain.ErrUserNotFound
        }
        return nil, err
    }

    return &user, nil
}

// Save persists a user to the database
func (r *UserRepository) Save(ctx context.Context, user *domain.User) error {
    // Generate ID for new users
    if user.ID == "" {
        user.ID = uuid.New().String()
    }

    query := `
        INSERT INTO users (id, email, name, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET email = $2, name = $3
    `

    _, err := r.db.ExecContext(
        ctx,
        query,
        user.ID,
        user.Email,
        user.Name,
        user.CreatedAt,
    )

    return err
}

// Delete removes a user
func (r *UserRepository) Delete(ctx context.Context, id string) error {
    query := `DELETE FROM users WHERE id = $1`

    result, err := r.db.ExecContext(ctx, query, id)
    if err != nil {
        return err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }

    if rowsAffected == 0 {
        return domain.ErrUserNotFound
    }

    return nil
}

// List retrieves all users
func (r *UserRepository) List(ctx context.Context) ([]*domain.User, error) {
    query := `SELECT id, email, name, created_at FROM users ORDER BY created_at DESC`

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*domain.User
    for rows.Next() {
        var user domain.User
        if err := rows.Scan(
            &user.ID,
            &user.Email,
            &user.Name,
            &user.CreatedAt,
        ); err != nil {
            return nil, err
        }
        users = append(users, &user)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return users, nil
}
```

Primary adapter (REST API handler):

```go
// internal/adapters/handlers/rest/user_handler.go
package rest

import (
    "encoding/json"
    "net/http"
    "myapp/internal/core/domain"
    "myapp/internal/core/services"
    "github.com/go-chi/chi/v5"
)

// UserRequest represents the incoming user data
type UserRequest struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

// UserResponse represents the outgoing user data
type UserResponse struct {
    ID        string `json:"id"`
    Email     string `json:"email"`
    Name      string `json:"name"`
    CreatedAt string `json:"created_at"`
}

// UserHandler implements the REST API handler for users
type UserHandler struct {
    userService *services.UserService
}

// NewUserHandler creates a new REST API handler for users
func NewUserHandler(userService *services.UserService) *UserHandler {
    return &UserHandler{
        userService: userService,
    }
}

// mapUserToResponse maps a domain user to a response user
func mapUserToResponse(user *domain.User) UserResponse {
    return UserResponse{
        ID:        user.ID,
        Email:     user.Email,
        Name:      user.Name,
        CreatedAt: user.CreatedAt.Format(time.RFC3339),
    }
}

// GetUser handles the get user request
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")

    user, err := h.userService.GetUser(r.Context(), id)
    if err != nil {
        if err == domain.ErrUserNotFound {
            http.Error(w, "User not found", http.StatusNotFound)
            return
        }
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    response := mapUserToResponse(user)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// CreateUser handles the create user request
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req UserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    user, err := h.userService.CreateUser(r.Context(), req.Email, req.Name)
    if err != nil {
        switch err {
        case domain.ErrUserAlreadyExists:
            http.Error(w, "User already exists", http.StatusConflict)
        case domain.ErrInvalidInput:
            http.Error(w, "Invalid input", http.StatusBadRequest)
        default:
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
        return
    }

    response := mapUserToResponse(user)

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(response)
}

// UpdateUser handles the update user request
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")

    var req UserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    user, err := h.userService.UpdateUser(r.Context(), id, req.Email, req.Name)
    if err != nil {
        switch err {
        case domain.ErrUserNotFound:
            http.Error(w, "User not found", http.StatusNotFound)
        case domain.ErrInvalidInput:
            http.Error(w, "Invalid input", http.StatusBadRequest)
        default:
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
        return
    }

    response := mapUserToResponse(user)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// DeleteUser handles the delete user request
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")

    if err := h.userService.DeleteUser(r.Context(), id); err != nil {
        if err == domain.ErrUserNotFound {
            http.Error(w, "User not found", http.StatusNotFound)
            return
        }
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

// ListUsers handles the list users request
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
    users, err := h.userService.ListUsers(r.Context())
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    var response []UserResponse
    for _, user := range users {
        response = append(response, mapUserToResponse(user))
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// RegisterRoutes registers the user handler routes
func (h *UserHandler) RegisterRoutes(r chi.Router) {
    r.Get("/users", h.ListUsers)
    r.Post("/users", h.CreateUser)
    r.Get("/users/{id}", h.GetUser)
    r.Put("/users/{id}", h.UpdateUser)
    r.Delete("/users/{id}", h.DeleteUser)
}
```

### Wiring It All Together

```go
// cmd/api/main.go
package main

import (
    "context"
    "database/sql"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "myapp/internal/adapters/handlers/rest"
    "myapp/internal/adapters/repositories/postgres"
    "myapp/internal/core/services"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    _ "github.com/lib/pq"
)

func main() {
    // Setup database
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer db.Close()

    // Setup repositories
    userRepo := postgres.NewUserRepository(db)

    // Setup services
    userService := services.NewUserService(userRepo)

    // Setup handlers
    userHandler := rest.NewUserHandler(userService)

    // Setup router
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Register routes
    r.Route("/api", func(r chi.Router) {
        userHandler.RegisterRoutes(r)
    })

    // Create server
    server := &http.Server{
        Addr:    ":8080",
        Handler: r,
    }

    // Start server
    go func() {
        log.Println("Starting server on :8080")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Failed to start server: %v", err)
        }
    }()

    // Handle graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server shutdown failed: %v", err)
    }

    log.Println("Server stopped")
}
```

## Testing in Hexagonal Architecture

One of the key benefits of hexagonal architecture is testability. Here's how to test each layer:

### Testing Domain Logic

```go
// internal/core/domain/user_test.go
package domain_test

import (
    "testing"
    "myapp/internal/core/domain"
)

func TestNewUser(t *testing.T) {
    tests := []struct {
        name     string
        email    string
        username string
        wantErr  bool
    }{
        {"valid user", "test@example.com", "testuser", false},
        {"empty email", "", "testuser", true},
        {"empty name", "test@example.com", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            user, err := domain.NewUser(tt.email, tt.username)
            if tt.wantErr {
                if err == nil {
                    t.Errorf("Expected error but got nil")
                }
                return
            }

            if err != nil {
                t.Errorf("Unexpected error: %v", err)
                return
            }

            if user.Email != tt.email {
                t.Errorf("Expected email %s, got %s", tt.email, user.Email)
            }

            if user.Name != tt.username {
                t.Errorf("Expected name %s, got %s", tt.username, user.Name)
            }
        })
    }
}
```

### Testing Services with Mocks

```go
// internal/core/services/user_service_test.go
package services_test

import (
    "context"
    "testing"
    "errors"
    "myapp/internal/core/domain"
    "myapp/internal/core/services"
    "myapp/internal/ports/repositories"
)

// MockUserRepository is a mock implementation of the UserRepository interface
type MockUserRepository struct {
    users map[string]*domain.User
}

func NewMockUserRepository() *MockUserRepository {
    return &MockUserRepository{
        users: make(map[string]*domain.User),
    }
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
    user, exists := m.users[id]
    if !exists {
        return nil, domain.ErrUserNotFound
    }
    return user, nil
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
    for _, user := range m.users {
        if user.Email == email {
            return user, nil
        }
    }
    return nil, domain.ErrUserNotFound
}

func (m *MockUserRepository) Save(ctx context.Context, user *domain.User) error {
    m.users[user.ID] = user
    return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, id string) error {
    if _, exists := m.users[id]; !exists {
        return domain.ErrUserNotFound
    }
    delete(m.users, id)
    return nil
}

func (m *MockUserRepository) List(ctx context.Context) ([]*domain.User, error) {
    users := make([]*domain.User, 0, len(m.users))
    for _, user := range m.users {
        users = append(users, user)
    }
    return users, nil
}

func TestUserService_CreateUser(t *testing.T) {
    mockRepo := NewMockUserRepository()
    service := services.NewUserService(mockRepo)

    // Test successful creation
    user, err := service.CreateUser(context.Background(), "test@example.com", "Test User")
    if err != nil {
        t.Fatalf("Failed to create user: %v", err)
    }

    if user.Email != "test@example.com" {
        t.Errorf("Expected email test@example.com, got %s", user.Email)
    }

    // Test duplicate user
    _, err = service.CreateUser(context.Background(), "test@example.com", "Another User")
    if err != domain.ErrUserAlreadyExists {
        t.Errorf("Expected error %v, got %v", domain.ErrUserAlreadyExists, err)
    }
}
```

## Key Benefits of Hexagonal Architecture

1. **Separation of Concerns**: Clear boundaries between business logic and external systems
2. **Testability**: Easy to test the core domain in isolation
3. **Flexibility**: Swap out adapters without changing the core logic
4. **Independence from Frameworks**: Core business logic isn't tied to any specific framework
5. **Maintainability**: Clear structure makes the codebase easier to maintain

## Best Practices

1. **Keep the Domain Pure**: The domain should have no dependencies on external systems
2. **Design Interfaces First**: Start by defining the ports before implementing the adapters
3. **Use Dependency Injection**: Inject dependencies through constructors
4. **Handle Cross-Cutting Concerns**: Use middleware or decorators for logging, metrics, etc.
5. **Respect Package Boundaries**: Don't import from adapters into the core domain
