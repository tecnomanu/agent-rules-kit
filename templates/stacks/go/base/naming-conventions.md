---
description: Naming conventions for Go code
globs: <root>/**/*.go
alwaysApply: false
---

# Go Naming Conventions

Go has strong naming conventions that differ from many other languages. Following these conventions is important for writing idiomatic Go code.

## General Naming Rules

-   **MixedCaps** (aka camelCase or PascalCase) is the standard naming convention
-   Use **PascalCase** (starting with capital letter) for exported names (visible outside the package)
-   Use **camelCase** (starting with lowercase letter) for unexported names (private to the package)
-   Avoid underscores in names except in special cases like test functions

```go
// Exported (public) - starts with capital letter
func ExportedFunction() {
    // Implementation
}

// Unexported (private) - starts with lowercase letter
func unexportedFunction() {
    // Implementation
}
```

## Package Names

-   Use short, concise, lowercase names
-   Prefer single-word names when possible (e.g., `time`, `http`, `io`)
-   Don't use plurals (use `package model` not `package models`)
-   Avoid package names that are commonly used as variable names
-   The package name becomes the prefix for its contents, so avoid redundancy
-   Use a renamed import (`import foo "github.com/foo/bar"`) if needed to avoid conflicts

```go
// Good package names
package http
package database
package auth

// Avoid redundancy in exported names
package user

// Good: The package name provides context
func user.New() *User {}

// Bad: Redundant
func user.NewUser() *User {}
```

## Interface Names

-   Use a name that describes behavior, often ending with "-er" suffix
-   Make interfaces small (often just one method)

```go
// Single-method interface with -er suffix
type Reader interface {
    Read(p []byte) (n int, err error)
}

// Interface that describes behavior
type Authenticator interface {
    Authenticate(username, password string) (bool, error)
}
```

## Struct Names

-   Use a noun or noun phrase
-   Don't include redundancy with the fields

```go
// Good
type User struct {
    ID        int
    Name      string
    Email     string
    CreatedAt time.Time
}

// Bad - redundant field names
type UserData struct {
    UserID        int
    UserName      string
    UserEmail     string
    UserCreatedAt time.Time
}
```

## Function and Method Names

-   Use verbs or verb phrases for functions that perform actions
-   Getters don't need a `Get` prefix
-   Setters may use the `Set` prefix
-   Keep names short and descriptive

```go
// Good - verb for action
func ProcessData(data []byte) []byte {
    // Implementation
}

// Good - getter without "Get" prefix
func (u *User) Name() string {
    return u.name
}

// Good - setter with "Set" prefix
func (u *User) SetName(name string) {
    u.name = name
}
```

## Variable Names

-   Short variable names are preferred, especially for local variables
-   The smaller the scope, the shorter the name can be
-   Common short name conventions:
    -   `i`, `j`, `k` for loop indices
    -   `r`, `w` for readers and writers
    -   `a`, `b` for temporary variables
    -   `n` for counts or lengths
    -   `v` for generic values
    -   `k`, `v` for map key-value pairs
-   Use more descriptive names for variables with larger scopes

```go
// Short variables for small scopes
for i := 0; i < len(items); i++ {
    item := items[i]
    // Do something with item
}

// More descriptive names for larger scopes
userCount := countActiveUsers()
if userCount > maxAllowedUsers {
    // Handle limit exceeded
}
```

## Constant Names

-   Use MixedCaps for constants, same as variables
-   Use all uppercase with underscores only for "true" constants (unchangeable values)

```go
// MixedCaps for most constants
const DefaultTimeout = 30 * time.Second

// ALL_CAPS for unchangeable values (rare in Go)
const MAX_CONNECTIONS = 100
```

## Error Names

-   Error values should start with `Err`
-   Error types should end with `Error`

```go
// Error value
var ErrNotFound = errors.New("not found")

// Error type
type ValidationError struct {
    Field string
    Msg   string
}
```

## File Names

-   Use lowercase with underscores if needed
-   Match the package name when possible
-   Separate words with underscores (`user_repository.go`)
-   Use descriptive names that indicate content
-   Test files should end with `_test.go`

```
auth.go           // Contains authentication logic
user_repository.go // Contains user repository implementation
auth_test.go      // Tests for auth.go
```

## Acronyms

-   Treat acronyms as a single word, not all uppercase
-   For exported names, capitalize only the first letter of the acronym
-   For unexported names, make the whole acronym lowercase

```go
// Good - Acronyms as words
type HTTPClient struct {}  // Exported (public)
type httpClient struct {}  // Unexported (private)

// Bad - Inconsistent with Go conventions
type HTTPClient struct {}  // Exported (public)
type HttpClient struct {}  // Exported, but not following convention
```

## Special Cases

-   Test functions should be named `TestXxx` where `Xxx` describes what's being tested
-   Benchmark functions should be named `BenchmarkXxx`
-   Example functions should be named `ExampleXxx`

```go
// Test function
func TestUserCreation(t *testing.T) {
    // Test implementation
}

// Benchmark function
func BenchmarkDataProcessing(b *testing.B) {
    // Benchmark implementation
}
```

## Common Pitfalls

-   Avoid using variable names that shadow package names
-   Avoid stutter in names (e.g., `package http` with `HTTPHTTPClient`)
-   Don't use generic names like `util`, `common`, or `helper` without specific context
-   Don't mix abbreviations and full words for similar concepts
