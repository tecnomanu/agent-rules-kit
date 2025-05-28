---
description: Implementation guide, key features, and best practices for Go 1.20 and newer versions.
globs: <root>/**/*.go
alwaysApply: true
---

# Go 1.20+ Implementation Guide

This guide covers implementation details specific to Go 1.20 and newer versions. Go 1.20+ includes several important improvements and features that can enhance your application development.

## Key Features in Go 1.20+

### 1. Language Improvements

-   **Enhanced Type Inference**: Better type inference for generic functions
-   **Error Handling Enhancements**: Improved error handling with wrapping and unwrapping
-   **Memory Optimizations**: Reduced memory overhead for certain operations

### 2. Performance Enhancements

Go 1.20+ includes significant performance improvements:

```go
// Example of improved slice operations
func processLargeSlice(data []int) []int {
    // Go 1.20+ optimizes these operations
    result := make([]int, 0, len(data))
    for _, v := range data {
        if v > threshold { // Assuming threshold is defined
            result = append(result, v*2)
        }
    }
    return result
}
```

### 3. Standard Library Additions

Several standard library packages have been enhanced:

-   `net/http`: Improved HTTP/2 support and connection handling
-   `crypto`: Additional cipher support and performance improvements
-   `time`: Enhanced time parsing and formatting capabilities
-   `context`: Improved context handling and cancellation

### 4. Module System Improvements

Go 1.20+ includes enhanced module handling:

```go
// go.mod example with workspace features
module example.com/myproject

go 1.20

require (
    github.com/example/package v1.2.3
    golang.org/x/text v0.4.0 // Example version
)

// Use replace directive for local development
replace github.com/example/package => ../localpackage
```

## Implementation Best Practices for Go 1.20+

### 1. Context Usage

Properly use contexts for cancellation and request scoping:

```go
import (
	"context"
	"errors"
	"fmt"
	"time"
)

// Assuming Request and Response types are defined elsewhere
type Request struct {
	Data string
}
type Response struct {
	Data string
}

// Assuming callDownstreamService is defined elsewhere
func callDownstreamService(ctx context.Context, data string) (string, error) {
	// Simulate a call that respects context cancellation
	select {
	case <-time.After(1 * time.Second): // Simulate work
		return "processed " + data, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}


func ProcessRequest(ctx context.Context, req Request) (Response, error) {
    // Create a child context with timeout
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    // Use the context for downstream calls
    result, err := callDownstreamService(ctx, req.Data)
    if err != nil {
        if errors.Is(err, context.DeadlineExceeded) {
            return Response{}, fmt.Errorf("processing timed out: %w", err)
        }
        return Response{}, fmt.Errorf("processing failed: %w", err)
    }

    return Response{Data: result}, nil
}
```

### 2. Error Handling

Use the improved error handling features:

```go
import (
	"errors"
	"fmt"
	// Assuming repository.Find and repository.ErrNotFound are defined
	// "myproject/repository"
	// "myproject/model" // For Resource type
)

// Define sentinel errors
var (
    ErrNotFound = errors.New("resource not found")
    ErrForbidden = errors.New("access forbidden")
)

// Assuming Resource type and repository package are defined
type Resource struct {
	ID string
	Name string
	// other fields
}
var repository = struct { // Mock repository
	ErrNotFound error
	Find func(id string) (*Resource, error)
}{
	ErrNotFound: errors.New("repo: not found"),
	Find: func(id string) (*Resource, error) {
		if id == "123" { return &Resource{ID: "123", Name: "Test"}, nil }
		return nil, errors.New("repo: not found") // Simulate not found
	},
}
func isAuthorized(r *Resource) bool { return true } // Mock authorization

func FetchResource(id string) (*Resource, error) {
    // Use fmt.Errorf with %w to wrap errors
    resource, err := repository.Find(id)
    if err != nil {
        // Example of checking a specific error from a lower layer
        // before wrapping with a more generic sentinel error.
        if errors.Is(err, repository.ErrNotFound) { // Assuming repository might return its own ErrNotFound
            return nil, fmt.Errorf("finding resource %s: %w", id, ErrNotFound)
        }
        return nil, fmt.Errorf("database error: %w", err)
    }

    // Check permissions
    if !isAuthorized(resource) {
        return nil, ErrForbidden
    }

    return resource, nil
}

// Using the function
// resource, err := FetchResource("123")
// if err != nil {
//     switch {
//     case errors.Is(err, ErrNotFound):
//         // Handle not found case
//     case errors.Is(err, ErrForbidden):
//         // Handle forbidden case
//     default:
//         // Handle other errors
//     }
// }
```

### 3. Generics Usage

Leverage generics for flexible, type-safe code:

```go
// Generic function for data processing
func Map[T, U any](items []T, fn func(T) U) []U {
    result := make([]U, len(items))
    for i, item := range items {
        result[i] = fn(item)
    }
    return result
}

// Using the generic function
// numbers := []int{1, 2, 3, 4, 5}
// doubled := Map(numbers, func(n int) int {
//     return n * 2
// })
// doubled = [2, 4, 6, 8, 10]

// Another example with different types
type User struct {
    ID   string
    Name string
}

// users := []User{
//     {ID: "1", Name: "Alice"},
//     {ID: "2", Name: "Bob"},
// }

// Extract just the names
// names := Map(users, func(u User) string {
//     return u.Name
// })
// names = ["Alice", "Bob"]
```

### 4. Improved HTTP Client Usage

Use the improved HTTP client features:

```go
import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"
)

func FetchData(ctx context.Context, url string) ([]byte, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, fmt.Errorf("creating request: %w", err)
    }

    client := &http.Client{
        Timeout: 10 * time.Second,
        Transport: &http.Transport{ // Sensible defaults, customize as needed
            MaxIdleConns:        100,
            MaxConnsPerHost:     100, // Consider if making many requests to the same host
            MaxIdleConnsPerHost: 10,  // Typically less than MaxIdleConns
            IdleConnTimeout:     90 * time.Second,
            TLSHandshakeTimeout: 10 * time.Second,
        },
    }

    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("sending request: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        // Consider reading part of the body for more context on error
        return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
    }

    data, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("reading response body: %w", err)
    }

    return data, nil
}
```

## Testing in Go 1.20+

Leverage the improved testing features:

```go
import (
	"errors"
	// "myproject/model" // For Resource type
	// "myproject/service" // For NewResourceService
	// "myproject/repository/mock" // For mockRepo
	"testing"
)

// Assuming Resource, NewResourceService, mockRepo, ErrNotFound are defined
// type Resource struct { ID string; Name string }
// var ErrNotFound = errors.New("not found")
// var mockRepo = ... // Some mock repository implementation
// func NewResourceService(repo interface{}) *ResourceService { ... }
// type ResourceService struct { ... }
// func (s *ResourceService) FindByID(id string) (*Resource, error) { ... }


func TestResourceService(t *testing.T) {
    // Use subtests for organization
    t.Run("FindByID", func(t *testing.T) {
        // Table-driven tests
        tests := []struct {
            name     string
            id       string
            wantErr  bool
            errType  error // For errors.Is check
            expected *Resource
        }{
            // {
            //     name:     "existing resource",
            //     id:       "123",
            //     wantErr:  false,
            //     expected: &Resource{ID: "123", Name: "Test"},
            // },
            // {
            //     name:    "not found",
            //     id:      "456",
            //     wantErr: true,
            //     errType: ErrNotFound,
            // },
        }

        for _, tc := range tests {
            t.Run(tc.name, func(t *testing.T) {
                // Setup service with mock repository
                // service := NewResourceService(mockRepo) // Assuming NewResourceService takes a repo

                // Call the method
                // resource, err := service.FindByID(tc.id)

                // Check error
                // if tc.wantErr {
                //     if err == nil {
                //         t.Fatalf("expected error but got nil")
                //     }
                //     if tc.errType != nil && !errors.Is(err, tc.errType) {
                //         t.Fatalf("expected error type %v but got %v", tc.errType, err)
                //     }
                //     return
                // }

                // Check no error
                // if err != nil {
                //     t.Fatalf("unexpected error: %v", err)
                // }

                // Check result
                // if tc.expected.ID != resource.ID || tc.expected.Name != resource.Name {
                //     t.Fatalf("expected %v but got %v", tc.expected, resource)
                // }
            })
        }
    })
}
```

## Deployment Considerations for Go 1.20+

### 1. Docker Optimization

Optimize Docker builds for Go 1.20+:

```dockerfile
# Multi-stage build
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum files first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy source code
COPY . .

# Build the application
# Use -ldflags="-s -w" to strip debug information and reduce binary size for production
# CGO_ENABLED=0 is important for static linking and minimal base images
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -a -installsuffix cgo -o app ./cmd/api # Adjust path to main package

# Create minimal runtime image
FROM alpine:latest # Using latest alpine, consider specific version like 3.18

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /home/appuser

# Copy the binary from the builder stage
COPY --from=builder /app/app .
# Copy configs if they are packaged with the app
# COPY --from=builder /app/configs ./configs

# Set user
USER appuser

# Expose application port
EXPOSE 8080

# Run the application
CMD ["./app"]
```

### 2. Resource Utilization

Go 1.20+ includes improved runtime that can be tuned:

```go
import (
	"runtime"
	"runtime/debug"
	// "myproject/app" // Assuming startApp is here
)

func main() {
    // Set GOMAXPROCS to match available CPU cores, often done automatically by Go runtime now,
    // but can be set explicitly if needed for specific tuning or older Go versions.
    // runtime.GOMAXPROCS(runtime.NumCPU()) // Go 1.5+ sets this automatically

    // Set garbage collection target percentage.
    // A lower percentage makes GC run more often, potentially reducing pause times but increasing CPU.
    // Default is 100. Adjust based on application profiling.
    debug.SetGCPercent(100)

    // Start the application
    // startApp()
}
```

## Migration from Older Versions

When migrating from Go 1.18 or 1.19 to 1.20+:

1. Update your `go.mod` file to specify `go 1.20` (or newer, e.g., `go 1.21`).
2. Run `go mod tidy` to ensure dependencies are consistent.
3. Review uses of `errors.Is()` and `errors.As()` and error wrapping (`fmt.Errorf` with `%w`) to leverage any improvements or ensure correctness.
4. Test thoroughly using `go test ./...` to catch any behavior changes or regressions.
5. Update your CI/CD pipeline to use the target Go version (e.g., Go 1.20.x or 1.21.x).
6. Consider updated standard library functions or patterns for potential optimizations or cleaner code.
7. If using generics, review type inference behavior, as it might be more robust.

Always consult the official Go release notes for detailed changes between versions.
```
