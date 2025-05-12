# NestJS Best Practices

This document outlines the core best practices and conventions for NestJS applications.

## Core Principles

-   **Modularity**: Organize code into cohesive modules
-   **Dependency Injection**: Use NestJS's built-in DI container
-   **Clear Separation of Concerns**: Follow the Controller-Service-Repository pattern
-   **Consistent File Structure**: Maintain a consistent directory and file naming scheme
-   **Testing First**: Write tests for all components

## Project Structure

-   Respect the separation between Modules, Providers, and Controllers
-   Group related functionality into feature modules
-   Store common utilities in shared modules

## Testing

-   Use Jest for all tests
-   Store unit tests alongside the files they test (`.spec.ts`)
-   Store e2e tests in the dedicated `test/` directory
-   Aim for high test coverage

## Error Handling

-   Use NestJS's built-in exception filters
-   Create custom exceptions for domain-specific errors
-   Implement proper validation using DTOs and Pipes

## Performance

-   Use proper caching strategies
-   Implement database query optimization
-   Consider using Fastify as an alternative to Express for higher performance

## Security

-   Validate all input using DTOs and class-validator
-   Use proper authentication and authorization guards
-   Follow the principle of least privilege
