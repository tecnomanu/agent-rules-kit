---
description: Testing best practices and strategies for Go applications.
globs: <root>/**/*_test.go
alwaysApply: true
---

# Go Testing Best Practices

Go provides robust testing capabilities through its standard library `testing` package. This document outlines best practices for writing effective, maintainable tests in Go.

## Basic Test Structure

Go test files should:

-   Be in the same package as the code being tested
-   Have a filename ending with `_test.go`
-   Contain functions with the signature `func TestXxx(t *testing.T)`

```go
// user_service.go
package user

func IsValidEmail(email string) bool {
	// Implementation
}

// user_service_test.go
package user

import "testing"

func TestIsValidEmail(t *testing.T) {
	if !IsValidEmail("user@example.com") {
		t.Error("Expected valid email to be accepted")
	}

	if IsValidEmail("invalid-email") {
		t.Error("Expected invalid email to be rejected")
	}
}
```

## Table-Driven Tests

Table-driven tests allow testing multiple cases with a consistent structure:

```go
func TestIsValidEmail(t *testing.T) {
	testCases := []struct {
		name     string
		email    string
		expected bool
	}{
		{"valid email", "user@example.com", true},
		{"missing @ symbol", "userexample.com", false},
		{"missing domain", "user@", false},
		{"with subdomain", "user@sub.example.com", true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := IsValidEmail(tc.email)
			if result != tc.expected {
				t.Errorf("IsValidEmail(%q) = %v; want %v", tc.email, result, tc.expected)
			}
		})
	}
}
```

## Subtests

Use subtests with `t.Run()` to organize related test cases:

```go
func TestUserOperations(t *testing.T) {
	t.Run("creation", func(t *testing.T) {
		// Test user creation
	})

	t.Run("validation", func(t *testing.T) {
		// Test user validation
	})

	t.Run("authentication", func(t *testing.T) {
		// Test user authentication
	})
}
```

Benefits of subtests:

-   Better organization and readability
-   Individual subtests can be run in isolation
-   Setup and teardown can be shared across subtests

## Test Helper Functions

Use helper functions for common test operations:

```go
// Helper for setting up test database
func setupTestDB(t *testing.T) (*sql.DB, func()) {
	t.Helper() // Marks this as a helper function

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Run migrations
	err = migrateDB(db)
	if err != nil {
		db.Close()
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	// Return the database and a cleanup function
	return db, func() {
		db.Close()
	}
}

func TestUserRepository(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Use db for tests
}
```

## Testing Errors

Test error conditions properly:

```go
func TestReadFile(t *testing.T) {
	// Test successful case
	content, err := ReadFile("testdata/existing.txt")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if content != "expected content" {
		t.Errorf("Got %q, want %q", content, "expected content")
	}

	// Test error case
	_, err = ReadFile("testdata/nonexistent.txt")
	if err == nil {
		t.Error("Expected error for nonexistent file, got nil")
	}

	// Test specific error types
	if !errors.Is(err, os.ErrNotExist) {
		t.Errorf("Expected os.ErrNotExist, got %v", err)
	}
}
```

## Mocking and Stubbing

Go typically uses interfaces for dependency injection and testing:

```go
// Interface that can be mocked
type UserRepository interface {
	GetByID(id string) (*User, error)
	Save(user *User) error
}

// Mock implementation
type MockUserRepository struct {
	users map[string]*User
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users: make(map[string]*User),
	}
}

func (r *MockUserRepository) GetByID(id string) (*User, error) {
	user, ok := r.users[id]
	if !ok {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (r *MockUserRepository) Save(user *User) error {
	r.users[user.ID] = user
	return nil
}

// Testing with the mock
func TestUserService(t *testing.T) {
	mockRepo := NewMockUserRepository()
	service := NewUserService(mockRepo)

	// Test the service using the mock repository
}
```

For third-party services, consider using popular mocking libraries like:

-   [gomock](https://github.com/golang/mock)
-   [testify/mock](https://github.com/stretchr/testify)

## Test Fixtures

Organize test fixtures properly:

```
mypackage/
├── service.go
├── service_test.go
└── testdata/      # Directory for test fixtures
    ├── sample1.json
    ├── sample2.json
    └── expected_output.txt
```

Loading test fixtures:

```go
func loadTestData(t *testing.T, filename string) []byte {
	t.Helper()

	path := filepath.Join("testdata", filename)
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("Failed to load test data: %v", err)
	}

	return data
}

func TestProcessJSON(t *testing.T) {
	input := loadTestData(t, "sample1.json")
	expectedOutput := loadTestData(t, "expected_output.txt")

	result := ProcessJSON(input)

	if !bytes.Equal(result, expectedOutput) {
		t.Errorf("ProcessJSON result mismatch")
	}
}
```

## HTTP Testing

Use the `httptest` package for HTTP handler testing:

```go
func TestHandleGetUser(t *testing.T) {
	// Create a request
	req, err := http.NewRequest("GET", "/users/123", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a response recorder
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(HandleGetUser)

	// Serve the request
	handler.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check response body
	expected := `{"id":"123","name":"Test User"}`
	if rr.Body.String() != expected {
		t.Errorf("Handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}
```

## Parallel Testing

Run independent tests in parallel:

```go
func TestFeatureA(t *testing.T) {
	t.Parallel() // Mark this test as parallel
	// Test implementation
}

func TestFeatureB(t *testing.T) {
	t.Parallel() // Mark this test as parallel
	// Test implementation
}
```

Note: Only use `t.Parallel()` for truly independent tests that don't share mutable state.

## Golden Files

Use golden files for complex expected outputs:

```go
func TestGenerateReport(t *testing.T) {
	report := GenerateReport(testData)

	// Golden file path
	golden := filepath.Join("testdata", "expected_report.golden")

	// Update golden file with -update flag
	if *update {
		err := os.WriteFile(golden, []byte(report), 0644)
		if err != nil {
			t.Fatalf("Failed to update golden file: %v", err)
		}
	}

	// Compare with golden file
	expected, err := os.ReadFile(golden)
	if err != nil {
		t.Fatalf("Failed to read golden file: %v", err)
	}

	if string(expected) != report {
		t.Errorf("Report doesn't match golden file")
	}
}
```

To update golden files:

```bash
go test -run TestGenerateReport -update
```

## Coverage

Use Go's built-in coverage tools:

```bash
# Run tests with coverage
go test -cover ./...

# Generate coverage profile
go test -coverprofile=coverage.out ./...

# View coverage in browser
go tool cover -html=coverage.out
```

## Benchmarks

Write benchmarks to test performance:

```go
func BenchmarkProcessLargeData(b *testing.B) {
	// Setup test data
	data := generateTestData(1000)

	// Reset timer before the actual benchmark loop
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		ProcessData(data)
	}
}
```

Run benchmarks:

```bash
go test -bench=. -benchmem
```

## Integration Testing

For integration tests (e.g., testing against a real database):

1. Use build tags to separate unit and integration tests:

```go
// +build integration

package user

import "testing"

func TestUserRepositoryWithDB(t *testing.T) {
	// Test with real database
}
```

2. Run unit tests by default, integration tests explicitly:

```bash
# Run unit tests
go test ./...

# Run integration tests
go test -tags=integration ./...
```

## Test Containers

For database integration tests, consider using [testcontainers-go](https://github.com/testcontainers/testcontainers-go) to spin up temporary database containers:

```go
func setupPostgres(t *testing.T) (*sql.DB, func()) {
	req := testcontainers.ContainerRequest{
		Image:        "postgres:13",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_PASSWORD": "password",
			"POSTGRES_USER":     "user",
			"POSTGRES_DB":       "testdb",
		},
		WaitingFor: wait.ForLog("database system is ready to accept connections"),
	}

	container, err := testcontainers.GenericContainer(
		context.Background(),
		testcontainers.GenericContainerRequest{
			ContainerRequest: req,
			Started:          true,
		},
	)
	if err != nil {
		t.Fatalf("Failed to start container: %v", err)
	}

	// Get the mapped port
	port, err := container.MappedPort(context.Background(), "5432")
	if err != nil {
		t.Fatalf("Failed to get mapped port: %v", err)
	}

	// Connect to the database
	dsn := fmt.Sprintf("host=localhost port=%s user=user password=password dbname=testdb sslmode=disable", port.Port())
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Return cleanup function
	cleanup := func() {
		db.Close()
		container.Terminate(context.Background())
	}

	return db, cleanup
}
```
