---
description: Best practices for Go development, including error handling, code style, and concurrency.
globs: <root>/**/*.go
alwaysApply: true
---

# Go Best Practices

This document outlines best practices for developing applications in Go. Following these guidelines will help you write idiomatic, maintainable, and efficient Go code in {projectPath}.

## Code Style

### Formatting

-   Use `gofmt` or `go fmt` to automatically format your code before committing. This ensures consistency across the project.
-   Embrace the standard Go formatting: tabs for indentation, no trailing semicolons.
-   Utilize tools like `go vet` and static analysis linters (e.g., `golangci-lint`) to catch style issues, potential bugs, and anti-patterns early.

```go
// Good - properly formatted Go code
func processItems(items []Item) []Result {
	var results []Result
	for _, item := range items {
		result := process(item) // Assuming process is defined elsewhere
		results = append(results, result)
	}
	return results
}
```

### Naming Conventions

-   Use **`PascalCase`** for exported names (functions, types, variables, constants that start with an uppercase letter are exported).
-   Use **`camelCase`** for non-exported names (internal to the package).
-   Choose clear, descriptive names. Clarity is often more important than extreme brevity.
-   Use short, conventional names for local variables (e.g., `i` for index, `buf` for buffer, `ctx` for context).
-   For acronyms and initialisms in names, maintain consistent casing (e.g., `userID`, `ServeHTTP`, `APIClient`). Avoid mixed case like `UrlEncoder` (prefer `URLEncoder` or `urlEncoder`).

```go
// Exported function - starts with uppercase
func ProcessHTTPRequest(req *http.Request) (*Response, error) { // Assuming Response is a defined type
	// Non-exported variable - starts with lowercase
	localData, err := extractData(req) // Assuming extractData is defined
	if err != nil {
		return nil, fmt.Errorf("extracting data: %w", err)
	}
	return buildResponse(localData) // Assuming buildResponse is defined
}
```

## Package Structure

-   Keep packages focused on a single responsibility or domain.
-   Avoid package cycles (circular dependencies). `go vet` can help detect these.
-   Use `internal/` packages for code that should not be imported by other projects. This is enforced by the Go toolchain.
-   For applications, the `main` package is typically located in `cmd/<application-name>/main.go`.
-   Refer to "Go Architecture Concepts" for more on standard project layout.

## Error Handling Patterns

Go treats errors as first-class values. Robust error handling is a cornerstone of idiomatic Go.

-   **Check Errors Immediately**: Check for errors immediately after a function call that can return one. Do not ignore errors.
    ```go
    val, err := someFunction()
    if err != nil {
        // Handle error (return, log, etc.)
        return fmt.Errorf("operation failed: %w", err)
    }
    // Use val
    ```

-   **`fmt.Errorf` with `%w` for Wrapping**: When returning an error that was caused by another error, wrap the original error to preserve its context. This allows callers to inspect the error chain.
    ```go
    func dataOperation() error {
        err := lowLevelOp()
        if err != nil {
            return fmt.Errorf("dataOperation failed: %w", err) // %w wraps err
        }
        return nil
    }
    ```

-   **`errors.Is()` for Checking Specific Errors**: Use `errors.Is()` to check if an error in the chain matches a specific sentinel error or an error type that implements `Is()`.
    ```go
    var ErrPermissionDenied = errors.New("permission denied")

    // ... later in code ...
    err := operation()
    if errors.Is(err, ErrPermissionDenied) {
        // Handle permission denied specifically
    }
    ```

-   **`errors.As()` for Converting to a Specific Error Type**: Use `errors.As()` to check if an error in the chain matches a specific custom error type and to retrieve an instance of that type.
    ```go
    type MyCustomError struct {
        Msg string
        Code int
    }

    func (e *MyCustomError) Error() string { return fmt.Sprintf("%s (code %d)", e.Msg, e.Code) }

    // ... later in code ...
    err := operation()
    var customErr *MyCustomError
    if errors.As(err, &customErr) {
        // Now you can access fields of customErr, e.g., customErr.Code
        log.Printf("Custom error occurred: %s, Code: %d", customErr.Msg, customErr.Code)
    }
    ```

-   **Defining Custom Error Types**: Define custom error types (structs implementing the `error` interface) when you need to convey more information than just an error message.
    ```go
    type NetworkError struct {
        URL     string
        Message string
        Err     error // Underlying error
    }

    func (e *NetworkError) Error() string {
        return fmt.Sprintf("network error accessing %s: %s (cause: %v)", e.URL, e.Message, e.Err)
    }

    // Implement Unwrap for errors.Is and errors.As
    func (e *NetworkError) Unwrap() error { return e.Err }
    ```

-   **Sentinel Errors**: Use `var ErrNotFound = errors.New("resource not found")` for simple, fixed error conditions that callers might need to check specifically. These are typically defined at the package level.

-   **Panic vs. Error**:
    -   **Errors** are expected failures that should be handled gracefully (e.g., file not found, network timeout, invalid input).
    -   **Panic** should be reserved for truly exceptional, unrecoverable situations that indicate a bug in the program itself (e.g., nil pointer dereference where it shouldn't be possible, index out of bounds). In library code, panics should generally be avoided or recovered within the library to return an error to the caller. Server applications often recover from panics in HTTP handlers to log the error and return a 500 response without crashing.

-   **Error Logging Strategies**:
    -   Log errors with sufficient context (e.g., relevant request IDs, user IDs, operation name).
    -   Avoid logging an error multiple times at different levels of the call stack unless adding significant new context. Generally, log an error when it's first handled (e.g., at the top of a request handler or the main execution loop).
    -   Use structured logging (e.g., JSON logs) to make errors easier to parse and query in log management systems. Libraries like `zerolog`, `zap`, or `slog` (Go 1.21+) are excellent for this.
    -   Don't log and return an error unless it's a point where the error is being handled and not just propagated.

## Concurrency

-   Use goroutines for concurrent operations, but be mindful of their lifecycle and potential for leaks.
-   Always use synchronization primitives (`sync.Mutex`, `sync.RWMutex`, `sync.WaitGroup`, channels) when goroutines share data or need coordination.
-   Prefer channels for communication between goroutines if it fits the model.
-   Use `context.Context` for cancellation, deadlines, and passing request-scoped values across API boundaries and between goroutines.
-   Be careful with closures in goroutines, especially with loop variables. Pass loop variables as arguments to the goroutine's function.
    (Refer to `concurrency.md` for more details).

```go
func processBatch(items []Item) []Result {
	var wg sync.WaitGroup
	results := make([]Result, len(items))
	errChan := make(chan error, 1) // Buffered channel to catch first error

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	for i, item := range items {
		wg.Add(1)
		go func(idx int, itm Item) { // Pass loop variables as arguments
			defer wg.Done()
			select {
			case <-ctx.Done(): // Check for context cancellation
				log.Printf("Processing for item %d cancelled", idx)
				return
			default:
				// Simulate work
				res, err := processItem(itm) // Assuming processItem is defined
				if err != nil {
					select {
					case errChan <- fmt.Errorf("processing item %d: %w", idx, err):
					default: // Avoid blocking if error channel is full
					}
					return
				}
				results[idx] = res
			}
		}(i, item)
	}

	wg.Wait()
	close(errChan) // Close after all goroutines are done

	if err := <-errChan; err != nil { // Check if any error occurred
		log.Printf("Error during batch processing: %v", err)
		// Handle error, potentially returning partial results or an error state
	}
	return results
}
```

## Interfaces

-   Keep interfaces small (Interface Segregation Principle). Single-method interfaces are common and powerful in Go (e.g., `io.Reader`, `io.Writer`).
-   Define interfaces at the point of use (in the consuming package), not necessarily with the implementation. This promotes decoupling.
-   "Accept interfaces, return structs (concrete types)" is a common Go idiom. This allows consumers to provide various implementations while producers provide concrete, efficient types.

```go
// Consumer package defines what it needs
package userservice

type UserFetcher interface {
	FetchUser(id string) (*User, error)
}

// Implementation in another package returns a concrete type
package userstore

type DBUserStore struct{ /* ... */ }
func (s *DBUserStore) FetchUser(id string) (*User, error) { /* ... */ }
func NewDBUserStore() *DBUserStore { return &DBUserStore{} }
```

## Testing

-   Write tests that focus on behavior, not implementation details.
-   Use table-driven tests for testing multiple input/output combinations efficiently.
-   Place test files in the same package as the code they test, using the `_test.go` suffix.
-   Use subtests (`t.Run()`) to organize related test cases and improve output readability.
-   Leverage test helper functions (marked with `t.Helper()`) for common setup, teardown, or assertion logic.
    (Refer to `testing.md` for more details).

## Performance

-   Profile before optimizing. Use Go's built-in `pprof` tool to identify bottlenecks.
-   Be mindful of memory allocations. Pre-allocate slices and maps with `make` if the size is known.
-   Reduce allocations by reusing objects where appropriate (e.g., using `sync.Pool` or resetting struct fields).
-   For string concatenation in loops or performance-critical paths, use `strings.Builder`.
-   Avoid unnecessary reflection as it can be slower.

## Dependency Management

-   Use Go Modules (`go.mod`, `go.sum`) for managing project dependencies.
-   Keep your `go.mod` tidy. Run `go mod tidy` regularly.
-   Regularly update dependencies (`go get -u ./...`) and check for security vulnerabilities.

## Documentation

-   Document all exported names (functions, types, variables, constants) with `godoc` comments.
-   Write doc comments as complete sentences, starting with the name of the thing being documented.
-   Provide examples in documentation where appropriate (see `testing/example_test.go`).

```go
// CalculateSquare returns the square of the input integer x.
// It handles both positive and negative inputs correctly.
func CalculateSquare(x int) int {
	return x * x
}
```

## Resource Management

-   Use `defer` for cleaning up resources (e.g., closing files, unlocking mutexes, closing database connections). `defer` ensures the statement runs when the surrounding function exits.
-   Structure code for clear resource acquisition and release paths.

```go
func processFile(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("opening file %s: %w", filename, err)
	}
	defer file.Close() // Ensures file is closed when processFile returns

	// Process the file content
	return analyzeContents(file) // Assuming analyzeContents is defined
}
```

By adhering to these best practices, you can write Go code that is not only functional but also clean, efficient, and easy for others (and your future self) to understand and maintain in {projectPath}.
```
