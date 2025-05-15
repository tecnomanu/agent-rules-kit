---
description: Best practices for Go development
globs: <root>/**/*.go
alwaysApply: false
---

# Go Best Practices

This document outlines best practices for developing applications in Go. Following these guidelines will help you write idiomatic, maintainable, and efficient Go code.

## Code Style

### Formatting

-   Use `gofmt` or `go fmt` to automatically format your code
-   Embrace the standard Go formatting (tabs for indentation, no semicolons)
-   Use `golint` and `go vet` to catch style issues and potential bugs

```go
// Good - properly formatted Go code
func processItems(items []Item) []Result {
	var results []Result
	for _, item := range items {
		result := process(item)
		results = append(results, result)
	}
	return results
}
```

### Naming Conventions

-   Use **CamelCase** for exported names and **camelCase** for non-exported names
-   Choose clear, descriptive names - clarity over brevity
-   Use short names for local variables and longer, more descriptive names for exported functions
-   Use acronyms consistently (either all caps like `HTTP` or all lowercase like `http`)

```go
// Exported function - starts with uppercase
func ProcessHTTPRequest(req *http.Request) Response {
	// Non-exported variable - starts with lowercase
	localData := extractData(req)
	return buildResponse(localData)
}
```

## Package Structure

-   Keep packages focused on a single responsibility
-   Avoid package cycles (mutual imports between packages)
-   Use internal packages (`internal/`) for code that shouldn't be imported by other projects
-   Place main package in `cmd/<application-name>/main.go` for multiple applications

```
myapp/
├── cmd/
│   └── server/
│       └── main.go        # Entry point for the server application
├── internal/              # Private application code
│   ├── auth/              # Authentication package
│   └── database/          # Database package
└── pkg/                   # Public API packages
    └── models/            # Shared data models
```

## Error Handling

-   Check errors immediately after the function call that returns them
-   Return errors rather than using panic (except in truly exceptional cases)
-   Wrap errors with context using `fmt.Errorf("doing something: %w", err)` or a package like `github.com/pkg/errors`
-   Use sentinel errors (`var ErrNotFound = errors.New("not found")`) for errors that need to be checked by type

```go
func fetchUserData(id string) (*UserData, error) {
	data, err := database.Query(id)
	if err != nil {
		// Add context to the error
		return nil, fmt.Errorf("fetching user data: %w", err)
	}

	if len(data) == 0 {
		// Return a sentinel error
		return nil, ErrUserNotFound
	}

	return parseUserData(data)
}

// Using the function
data, err := fetchUserData(userID)
if err != nil {
	if errors.Is(err, ErrUserNotFound) {
		// Handle not found case
	} else {
		// Handle other errors
	}
}
```

## Concurrency

-   Use goroutines for concurrent operations, but be conscious of their creation
-   Always use synchronization primitives (`sync.Mutex`, `sync.WaitGroup`, etc.) when sharing data
-   Consider channels for communication between goroutines
-   Use `context` for cancellation and request-scoped values
-   Be careful with closures in goroutines - use function parameters for loop variables

```go
func processItems(items []Item) []Result {
	var wg sync.WaitGroup
	results := make([]Result, len(items))

	for i, item := range items {
		wg.Add(1)
		// Passing loop variables as parameters to avoid closure issues
		go func(i int, item Item) {
			defer wg.Done()
			results[i] = process(item)
		}(i, item)
	}

	wg.Wait()
	return results
}
```

## Interfaces

-   Keep interfaces small, often just one or two methods
-   Define interfaces at the point of use, not with the implementation
-   Accept interfaces, return concrete types
-   Use embedding to compose interfaces

```go
// A focused interface with a single method
type Processor interface {
	Process(data []byte) ([]byte, error)
}

// Implementation
type JSONProcessor struct {
	// fields
}

func (p *JSONProcessor) Process(data []byte) ([]byte, error) {
	// Implementation
}

// Function that accepts an interface
func HandleData(p Processor, data []byte) []byte {
	result, err := p.Process(data)
	if err != nil {
		log.Printf("processing error: %v", err)
		return nil
	}
	return result
}
```

## Testing

-   Write tests that focus on behavior, not implementation details
-   Use table-driven tests to test multiple cases
-   Put test files in the same package with a `_test.go` suffix
-   Use subtests (`t.Run()`) to organize related tests
-   Leverage test helpers for common setup/teardown

```go
func TestCalculate(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected int
	}{
		{"zero input", 0, 0},
		{"positive input", 5, 25},
		{"negative input", -5, 25},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result := Calculate(tc.input)
			if result != tc.expected {
				t.Errorf("Calculate(%d) = %d; want %d", tc.input, result, tc.expected)
			}
		})
	}
}
```

## Performance

-   Profile before optimizing (`pprof`)
-   Consider memory allocations - use slices with pre-allocated capacity
-   Reduce allocations by reusing objects where appropriate
-   Be aware of string concatenation performance (use `strings.Builder`)
-   Avoid unnecessary reflection

```go
// Pre-allocate slice capacity
data := make([]int, 0, expectedSize)

// Use strings.Builder for string concatenation
var b strings.Builder
b.Grow(expectedSize)
for _, s := range strings {
	b.WriteString(s)
}
result := b.String()
```

## Dependency Management

-   Use Go modules for dependency management
-   Pin versions of dependencies in your `go.mod` file
-   Consider vendoring dependencies for deployment consistency
-   Regularly update dependencies and check for security issues

## Documentation

-   Document all exported names (functions, types, etc.)
-   Write doc comments as complete sentences
-   Use examples in documentation where appropriate
-   Document the function, not the implementation

```go
// Calculate returns the square of the input value.
// It handles both positive and negative inputs.
func Calculate(x int) int {
	return x * x
}
```

## Resource Management

-   Use `defer` to clean up resources (close files, etc.)
-   Structure code for clear resource acquisition and release
-   Consider using the `io.Closer` interface for resources

```go
func processFile(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close() // Will be called when function exits

	// Process the file
	return analyze(file)
}
```
