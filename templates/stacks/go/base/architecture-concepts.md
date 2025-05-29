---
description: Core architectural concepts, patterns, and standard project layout for Go applications.
globs: <root>/**/*.go
alwaysApply: true
---

# Go Architecture Concepts

Go promotes a clean, modular, and pragmatic approach to software design. This document outlines the core architectural concepts for Go applications, including a detailed look at the standard project layout.

## Fundamental Principles

Go's design philosophy emphasizes:

1.  **Simplicity**: Aim for straightforward code that is easy to read, understand, and maintain.
2.  **Pragmatism**: Prefer practical solutions that work effectively over theoretical purity.
3.  **Composition over Inheritance**: Build complex types by combining smaller, focused types (struct embedding).
4.  **Explicit over Implicit**: Make behavior clear and obvious, avoiding hidden "magic."
5.  **Concurrency as a First-Class Citizen**: Leverage built-in goroutines and channels for concurrent programming.
6.  **Strong Standard Library**: Utilize the comprehensive standard library whenever possible before reaching for third-party packages.

## Standard Project Layout

While Go doesn't enforce a strict project layout, a community-accepted standard has emerged, often referred to as the "Standard Go Project Layout." Adopting this structure can make your projects more understandable and maintainable, especially for larger applications or when working in teams.

```
{projectPath}/
├── cmd/                  # Application entry points
│   ├── myapp/            # Entry point for 'myapp'
│   │   └── main.go
│   └── mytool/           # Entry point for 'mytool'
│       └── main.go
├── internal/             # Private application and library code
│   ├── auth/             # Authentication logic, internal to your project
│   ├── platform/         # Platform-specific utilities or SDKs internal to your project
│   └── app/              # Internal application-specific packages if your app is small
│       └── myapp/
│           ├── handler/
│           └── model/
├── pkg/                  # Public library code, okay to import by others
│   ├── cache/            # A cache library usable by external projects
│   └── stringutil/       # String utility functions
├── api/                  # API definition files
│   ├── openapi/          # OpenAPI/Swagger specs, JSON schema files, protocol definition files.
│   │   └── myapp.yaml
│   └── protobuf/         # Protocol buffer definitions for gRPC services
│       └── v1/
│           └── myapp.proto
├── web/                  # Web application specific assets
│   ├── static/           # Static assets (images, CSS, JavaScript)
│   ├── templates/        # HTML templates
├── configs/              # Configuration files and templates
│   ├── app.example.yaml
├── docs/                 # Design and user documents (additional to godoc generated documentation)
├── examples/             # Examples for your public libraries in pkg/
├── test/                 # Additional external tests and test data
│   └── e2e/              # End-to-end tests
│   └── data/             # Test data fixtures
├── scripts/              # Scripts to perform various build, install, analysis, etc. operations
│   ├── ci-build.sh
│   └── setup-env.sh
├── third_party/          # External helper tools, forked code, and other 3rd party utilities
├── tools/                # Supporting tools for this project (e.g., code generators)
├── vendor/               # Application dependencies (if you choose to vendor)
├── go.mod                # Go module definition file
├── go.sum                # Go module checksum file
└── README.md             # Project overview and instructions
```

### Key Directory Explanations:

-   **`cmd/`**: Contains the `main` packages for your executables. The directory name under `cmd/` usually matches the executable you want to build (e.g., `cmd/myapp/main.go` for `myapp` executable). Keep code in `main.go` minimal; it should primarily parse flags, set up configuration, and call into code in `internal/` or `pkg/`.
-   **`internal/`**: Private application and library code. This is code that you don't want others to import into their applications or libraries. It's enforced by Go's build tools. Your actual application code (business logic, handlers, services, repositories) often resides here, structured into sub-packages.
    -   You can mirror the structure of `pkg/` if you have shared internal libraries.
    -   For a single application, you might have `internal/app/` or directly `internal/http`, `internal/user`, etc.
-   **`pkg/`**: Library code that's okay to be used by external applications (i.e., public libraries). Other projects can import these packages. Think carefully before putting something here; once it's public, you have a responsibility to maintain its API stability.
-   **`api/`**: API definition files, such as OpenAPI/Swagger specifications, JSON schema files, or Protocol Buffer (`.proto`) files.
-   **`web/`**: Web application specific assets like static files (CSS, JS, images) and HTML templates.
-   **`configs/`**: Configuration file templates or default configs. `config.example.yaml` is a common pattern.
-   **`docs/`**: Additional design and user documents, beyond what `godoc` generates.
-   **`examples/`**: Examples for your public libraries in `pkg/`.
-   **`scripts/`**: Scripts to automate tasks like building, installing, analyzing, etc.
-   **`test/`**: Additional tests, especially end-to-end (E2E) tests or external test suites. Test data fixtures can also live here.
-   **`tools/`**: Supporting tools for this project, like code generators or scripts that depend on this project's code.
-   **`vendor/`**: If you are vendoring dependencies (less common with Go modules unless specific needs arise), they would reside here. `go mod vendor` creates this.
-   **`go.mod` & `go.sum`**: Define the module and its dependencies.

This layout is a guideline. Adapt it to the specific needs and scale of {projectPath}. For smaller projects, a flatter structure might be sufficient.

## Common Architectural Patterns

While Go is flexible, certain patterns are prevalent due to its features and standard library.

### 1. Standard MVC-like Structure (Common for Web Apps)

A common separation of concerns for web applications:

```
internal/
├── appname/ // or directly under internal/ if only one app
│   ├── handler/    // HTTP request handlers (Controllers)
│   ├── model/      // Data structures, business logic (Models)
│   ├── view/       // HTML templates or view rendering logic (Views)
│   ├── service/    // Business logic services (optional layer)
│   └── store/      // Data access layer (Repositories)
└── main.go       // (in cmd/appname/) Application entry point
```

### 2. Clean Architecture / Hexagonal (Ports & Adapters)

These emphasize decoupling business logic from infrastructure concerns.

-   **Domain/Entities**: Core business logic and data structures.
-   **Use Cases/Application Services**: Orchestrate domain logic.
-   **Interfaces/Ports**: Define contracts for external interactions (e.g., database, web API).
-   **Adapters/Infrastructure**: Implementations of ports (e.g., PostgreSQL repository, Gin HTTP handlers).

```
internal/
├── domain/
├── usecase/
├── interfaces/
│   ├── http/      // HTTP handlers
│   └── repository/ // Database interaction adapters
├── infrastructure/
│   └── postgres/
```

## Interface-Driven Design

Go's interfaces are implicit (no `implements` keyword) and encourage decoupling.

-   **Define interfaces where they are consumed**: A consumer package defines an interface for its dependencies.
-   **Keep interfaces small**: Prefer single-method interfaces (the "Go way") or interfaces with a few closely related methods. This follows the Interface Segregation Principle.

```go
// in userservice package
package userservice

type UserGetter interface {
    GetByID(ctx context.Context, id string) (*User, error)
}

type UserService struct {
    userStore UserGetter
}

func New(ug UserGetter) *UserService {
    return &UserService{userStore: ug}
}
// ... UserService methods use ug.GetByID ...
```

## Dependency Injection

Explicit dependency injection is the standard in Go. Dependencies are typically passed as arguments to constructors.

```go
// main.go or setup code
import (
    "database/sql"
    "log"
    "net/http"

    "myproject/internal/user/postgres" // Postgres implementation of UserStore
    "myproject/internal/user/service"  // UserService
    "myproject/internal/user/handler"  // HTTP handlers
)

func main() {
    db, err := sql.Open("postgres", "your-connection-string")
    if err != nil {
        log.Fatalf("failed to connect to database: %v", err)
    }
    defer db.Close()

    userStore := postgres.NewUserStore(db)         // Create concrete store
    userService := service.New(userStore)          // Inject store into service
    userHandler := handler.NewUserHandler(userService) // Inject service into handler

    http.HandleFunc("/users", userHandler.GetUsers)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Concurrency Patterns

Go's built-in support for goroutines and channels makes concurrent programming more accessible. Common patterns include worker pools, fan-out/fan-in, and pipeline processing. (These are covered in more detail in `concurrency.md`).

## Error Handling

Go treats errors as values. Functions that can fail typically return an `error` as their last value. Robust error handling is a cornerstone of Go development. (Covered in `best_practices.md`).

By understanding and applying these architectural concepts and the standard project layout, you can build scalable, maintainable, and idiomatic Go applications in {projectPath}.

```

```
