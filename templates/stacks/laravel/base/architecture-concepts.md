---
description: Core architectural principles for Laravel applications
globs: '<root>/app/**/*.php,<root>/bootstrap/**/*.php,<root>/routes/**/*.php,<root>/database/migrations/**/*.php,<root>/config/**/*.php,<root>/tests/**/*.php'
alwaysApply: false
---

# Laravel Architecture Concepts

This document outlines the fundamental architecture concepts that apply to Laravel applications. Specific implementation details for each architecture pattern are available in the respective architecture directories.

## Core Architecture Principles

Regardless of the specific architecture chosen, all Laravel applications should follow these principles:

### 1. Separation of Concerns

Different parts of your application should handle distinct responsibilities:

-   **Presentation Logic**: Controllers, Views, API Resources
-   **Business Logic**: Services, Policies, Domain Models
-   **Data Access Logic**: Repositories, Eloquent Models

### 2. Single Responsibility

Each class should have only one reason to change. Avoid creating "god" classes that handle multiple responsibilities.

### 3. Dependency Injection

Favor constructor injection to make dependencies explicit and improve testability.

```php
class UserService
{
    private $repository;

    public function __construct(UserRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }
}
```

### 4. Encapsulation

Hide implementation details and expose only what's necessary through well-defined interfaces.

### 5. Testability

Design your architecture to be easily testable, with clear boundaries and dependencies that can be mocked.

## Common Architecture Components

These components are common across different architecture patterns but may be organized differently:

### Controllers

Handle HTTP requests and delegate to the appropriate services or use cases. Controllers should be thin and focused on HTTP concerns.

### Services

Contain business logic and orchestrate the flow of data between repositories and other services.

### Repositories

Abstract the data access layer, providing a collection-like interface for domain objects.

### Models

Represent the entities of your application. In standard Laravel, these are Eloquent models. In DDD, they might be domain models with behavior.

### Policies

Encapsulate authorization logic, determining if users can perform specific actions.

### DTOs (Data Transfer Objects)

Simple objects that carry data between processes, often used to transfer data between layers.

### Value Objects

Small, immutable objects that represent concepts in your domain (e.g., Email, Money).

## Architecture Evolution

Architecture isn't fixed and should evolve with your application:

1. **Start Simple**: Begin with standard Laravel architecture for most projects
2. **Refactor Gradually**: Introduce architectural patterns as complexity grows
3. **Be Pragmatic**: Choose the right tools for your specific problems
