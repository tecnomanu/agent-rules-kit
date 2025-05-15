# Go Web Service Architecture

This document provides guidelines for structuring a standard Go web service following idiomatic patterns and best practices.

## Project Structure

A well-organized Go web service typically follows this structure:

```
myservice/
├── cmd/                      # Command line applications
│   ├── api/                  # Main API server
│   │   └── main.go           # Entry point for API server
│   └── worker/               # Background worker (if applicable)
│       └── main.go           # Entry point for worker
├── internal/                 # Private application code
│   ├── api/                  # API layer
│   │   ├── handlers/         # HTTP handlers
│   │   ├── middleware/       # HTTP middleware
│   │   ├── router/           # Route definitions
│   │   └── server.go         # Server setup
│   ├── domain/               # Domain model and business logic
│   │   ├── user/             # User domain (organized by feature)
│   │   ├── product/          # Product domain
│   │   └── errors/           # Domain-specific errors
│   ├── config/               # Configuration handling
│   ├── database/             # Database access layer
│   │   ├── migrations/       # Database migrations
│   │   └── repository/       # Repository implementations
│   ├── auth/                 # Authentication and authorization
│   ├── services/             # Business logic services
│   └── utils/                # Utility functions
├── pkg/                      # Public libraries that can be imported
│   ├── logger/               # Logging library
│   ├── validator/            # Validation helpers
│   └── httputil/             # HTTP utilities
├── api/                      # API specifications
│   └── openapi/              # OpenAPI/Swagger spec
├── configs/                  # Configuration files
├── scripts/                  # Build and deployment scripts
├── deployments/              # Deployment configurations (Docker, K8s)
│   ├── docker/
│   └── kubernetes/
├── test/                     # Integration and e2e tests
├── go.mod                    # Go module definition
├── go.sum                    # Go module checksums
└── README.md                 # Project documentation
```

## Layered Architecture

A standard Go web service often follows a layered architecture:

1. **Handler/Controller Layer**: Handles HTTP requests and responses
2. **Service Layer**: Implements business logic
3. **Repository Layer**: Manages data access

### Handler Layer

Handlers are responsible for:

-   Parsing HTTP requests
-   Input validation
-   Calling appropriate services
-   Formatting responses

```go
// internal/api/handlers/user/user.go
package user

import (
	"encoding/json"
	"net/http"
	"myapp/internal/services"
	"myapp/pkg/httputil"
)

type Handler struct {
	service services.UserService
}

func New(service services.UserService) *Handler {
	return &Handler{service}
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := httputil.GetPathParam(r, "id")

	user, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSONResponse(w, http.StatusOK, user)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httputil.ErrorResponse(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		httputil.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.service.Create(r.Context(), services.CreateUserParams{
		Name:  req.Name,
		Email: req.Email,
	})
	if err != nil {
		httputil.HandleError(w, err)
		return
	}

	httputil.JSONResponse(w, http.StatusCreated, user)
}
```

### Service Layer

Services encapsulate business logic:

```go
// internal/services/user.go
package services

import (
	"context"
	"myapp/internal/domain/user"
	"myapp/internal/database/repository"
)

type UserService interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
	Create(ctx context.Context, params CreateUserParams) (*user.User, error)
}

type CreateUserParams struct {
	Name  string
	Email string
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo}
}

func (s *userService) GetByID(ctx context.Context, id string) (*user.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *userService) Create(ctx context.Context, params CreateUserParams) (*user.User, error) {
	// Business logic validation
	if err := validateEmail(params.Email); err != nil {
		return nil, err
	}

	newUser := user.New(params.Name, params.Email)

	// Additional business logic

	// Persist the user
	if err := s.repo.Save(ctx, newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}
```

### Repository Layer

Repositories handle data persistence:

```go
// internal/database/repository/user.go
package repository

import (
	"context"
	"database/sql"
	"myapp/internal/domain/user"
)

type UserRepository interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
	Save(ctx context.Context, user *user.User) error
}

type sqlUserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &sqlUserRepository{db}
}

func (r *sqlUserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
	query := `SELECT id, name, email, created_at FROM users WHERE id = $1`

	var u user.User
	err := r.db.QueryRowContext(ctx, query, id).Scan(&u.ID, &u.Name, &u.Email, &u.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, user.ErrNotFound
		}
		return nil, err
	}

	return &u, nil
}

func (r *sqlUserRepository) Save(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO users (id, name, email, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE
		SET name = $2, email = $3
	`

	_, err := r.db.ExecContext(ctx, query, u.ID, u.Name, u.Email, u.CreatedAt)
	return err
}
```

## Domain Models

Domain models represent the core business entities:

```go
// internal/domain/user/user.go
package user

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// Error definitions
var (
	ErrNotFound = errors.New("user not found")
	ErrInvalidInput = errors.New("invalid user input")
)

// User represents a user in the system
type User struct {
	ID        string
	Name      string
	Email     string
	CreatedAt time.Time
}

// New creates a new user
func New(name, email string) *User {
	return &User{
		ID:        uuid.New().String(),
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
	}
}

// Validate validates user data
func (u *User) Validate() error {
	if u.Name == "" {
		return errors.New("name is required")
	}
	if u.Email == "" {
		return errors.New("email is required")
	}
	// Additional validation
	return nil
}
```

## Router/HTTP Setup

Configure HTTP routes:

```go
// internal/api/router/router.go
package router

import (
	"myapp/internal/api/handlers/user"
	"myapp/internal/api/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func New(
	userHandler *user.Handler,
	authMiddleware middleware.Authenticate,
) *chi.Mux {
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// Public routes
	r.Group(func(r chi.Router) {
		r.Post("/api/login", authHandler.Login)
		r.Post("/api/register", authHandler.Register)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)

		r.Route("/api/users", func(r chi.Router) {
			r.Get("/", userHandler.List)
			r.Post("/", userHandler.Create)
			r.Get("/{id}", userHandler.GetByID)
			r.Put("/{id}", userHandler.Update)
			r.Delete("/{id}", userHandler.Delete)
		})
	})

	return r
}
```

## Server Setup

Set up the HTTP server:

```go
// internal/api/server.go
package api

import (
	"context"
	"log"
	"net/http"
	"time"

	"myapp/internal/api/router"
	"myapp/internal/config"
)

type Server struct {
	server *http.Server
	cfg    *config.Config
}

func NewServer(cfg *config.Config, router http.Handler) *Server {
	return &Server{
		server: &http.Server{
			Addr:         cfg.Server.Address,
			Handler:      router,
			ReadTimeout:  time.Duration(cfg.Server.ReadTimeoutSecs) * time.Second,
			WriteTimeout: time.Duration(cfg.Server.WriteTimeoutSecs) * time.Second,
			IdleTimeout:  time.Duration(cfg.Server.IdleTimeoutSecs) * time.Second,
		},
		cfg: cfg,
	}
}

func (s *Server) Start() error {
	log.Printf("Starting server on %s", s.server.Addr)
	return s.server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("Shutting down server...")
	return s.server.Shutdown(ctx)
}
```

## Main Entry Point

Wire everything together in the main function:

```go
// cmd/api/main.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"myapp/internal/api"
	"myapp/internal/api/handlers/user"
	"myapp/internal/api/middleware"
	"myapp/internal/api/router"
	"myapp/internal/config"
	"myapp/internal/database/repository"
	"myapp/internal/services"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Setup database connection
	db, err := setupDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to setup database: %v", err)
	}
	defer db.Close()

	// Create repositories
	userRepo := repository.NewUserRepository(db)

	// Create services
	userService := services.NewUserService(userRepo)

	// Create handlers
	userHandler := user.New(userService)

	// Create middleware
	authMiddleware := middleware.NewAuthenticate(cfg.Auth.Secret)

	// Setup router
	r := router.New(userHandler, authMiddleware)

	// Create server
	server := api.NewServer(cfg, r)

	// Start server in a goroutine
	go func() {
		if err := server.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server exited properly")
}
```

## Configuration Management

Use a structured approach to configuration:

```go
// internal/config/config.go
package config

import (
	"os"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server ServerConfig
	Database DatabaseConfig
	Auth AuthConfig
	Logger LoggerConfig
}

type ServerConfig struct {
	Address          string
	ReadTimeoutSecs  int
	WriteTimeoutSecs int
	IdleTimeoutSecs  int
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type AuthConfig struct {
	Secret     string
	ExpirySecs int
}

type LoggerConfig struct {
	Level string
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")

	viper.AutomaticEnv()

	// Default values
	viper.SetDefault("server.address", ":8080")
	viper.SetDefault("server.readTimeoutSecs", 5)
	viper.SetDefault("server.writeTimeoutSecs", 10)
	viper.SetDefault("server.idleTimeoutSecs", 120)

	if err := viper.ReadInConfig(); err != nil {
		// Config file not found, using env vars and defaults
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
```

## Middleware

Implement common middleware functions:

```go
// internal/api/middleware/auth.go
package middleware

import (
	"context"
	"net/http"
	"strings"

	"myapp/internal/domain/user"
	"myapp/pkg/httputil"
	"myapp/pkg/auth"
)

type Authenticate struct {
	secretKey string
}

func NewAuthenticate(secretKey string) *Authenticate {
	return &Authenticate{secretKey}
}

func (a *Authenticate) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			httputil.ErrorResponse(w, http.StatusUnauthorized, "No authorization header provided")
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		claims, err := auth.ValidateToken(tokenString, a.secretKey)
		if err != nil {
			httputil.ErrorResponse(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), user.ContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
```

## Error Handling

Implement consistent error handling:

```go
// pkg/httputil/response.go
package httputil

import (
	"encoding/json"
	"log"
	"net/http"

	"myapp/internal/domain/user"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Status  int    `json:"status"`
}

func JSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Error encoding response: %v", err)
		}
	}
}

func ErrorResponse(w http.ResponseWriter, status int, message string) {
	resp := ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
		Status:  status,
	}

	JSONResponse(w, status, resp)
}

func HandleError(w http.ResponseWriter, err error) {
	switch {
	case err == user.ErrNotFound:
		ErrorResponse(w, http.StatusNotFound, "Resource not found")
	case err == user.ErrInvalidInput:
		ErrorResponse(w, http.StatusBadRequest, err.Error())
	default:
		log.Printf("Internal error: %v", err)
		ErrorResponse(w, http.StatusInternalServerError, "Internal server error")
	}
}
```

## Background Workers

For long-running tasks, implement a worker pattern:

```go
// cmd/worker/main.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"myapp/internal/config"
	"myapp/internal/worker"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Setup database
	db, err := setupDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to setup database: %v", err)
	}
	defer db.Close()

	// Create worker
	w := worker.New(cfg, db)

	// Start worker
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go w.Start(ctx)

	// Wait for termination signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down worker...")
	cancel()

	log.Println("Worker exited properly")
}
```

## Dependency Injection

Consider using a dependency injection framework like [wire](https://github.com/google/wire) for larger applications:

```go
//+build wireinject

package main

import (
	"github.com/google/wire"

	"myapp/internal/api"
	"myapp/internal/api/handlers/user"
	"myapp/internal/api/middleware"
	"myapp/internal/api/router"
	"myapp/internal/config"
	"myapp/internal/database"
	"myapp/internal/database/repository"
	"myapp/internal/services"
)

func InitializeServer(cfg *config.Config) (*api.Server, error) {
	wire.Build(
		database.NewDB,
		repository.NewUserRepository,
		services.NewUserService,
		user.New,
		middleware.NewAuthenticate,
		router.New,
		api.NewServer,
	)
	return nil, nil
}
```

## Best Practices

1. **Separation of Concerns**: Keep layers separate and focused on their responsibilities
2. **Dependency Injection**: Pass dependencies explicitly rather than using global variables
3. **Interface Design**: Define interfaces at the point of use, not implementation
4. **Error Handling**: Use domain-specific errors and consistent error handling patterns
5. **Configuration**: Use environment variables and configuration files with sensible defaults
6. **Testing**: Test each layer in isolation with appropriate mocking
7. **Logging**: Use structured logging for better observability
8. **Metrics**: Instrument your service with metrics for monitoring
9. **Containerization**: Use Docker for consistent deployment environments
