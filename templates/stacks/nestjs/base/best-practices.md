---
description: Best practices for developing robust, secure, and performant NestJS applications, covering error handling, security, performance, configuration, and database interactions.
globs: <root>/src/**/*.ts
alwaysApply: true
---

# NestJS Best Practices

This document outlines best practices for developing robust, secure, performant, and maintainable NestJS applications in {projectPath}.

## Code Style and Organization

-   **Modularity**: Structure your application into cohesive feature modules. Each module should encapsulate a specific domain or functionality.
-   **Separation of Concerns**: Clearly separate concerns by adhering to patterns like Controller-Service-Repository.
    -   **Controllers**: Handle HTTP requests, delegate business logic to services, and return responses. Keep them lean.
    -   **Services**: Implement business logic. Should be agnostic of the transport layer (e.g., HTTP).
    -   **Repositories/Data Access Layer**: Abstract data persistence logic. (See `repository-pattern.md`).
-   **Consistent File Structure**: Maintain a standard directory and file naming scheme as outlined in `naming-conventions.md` and `project-structure.md`.
-   **Dependency Injection (DI)**: Leverage NestJS's built-in DI container. Prefer constructor injection. Define clear interfaces for dependencies to improve testability and flexibility.
-   **Async/Await**: Use `async/await` for managing asynchronous operations to improve code readability and maintainability over raw Promises or callbacks.
    ```typescript
    // users.service.ts
    async findOne(id: string): Promise<User | undefined> {
      try {
        const user = await this.userRepository.findById(id); // Assuming findById returns a Promise
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      } catch (error) {
        // Log error or re-throw as a specific NestJS HttpException
        throw new InternalServerErrorException('Error finding user');
      }
    }
    ```
-   **RxJS Observables**: While `async/await` is common for many operations, RxJS Observables are powerful for handling streams of data, complex event-based scenarios (like WebSockets), or when integrating with other NestJS features that use them (e.g., some interceptors, microservice communication). Use them where their strengths are beneficial.

## Error Handling Patterns

Robust error handling is crucial for application stability and user experience.

-   **Built-in HTTP Exceptions**: Use NestJS's built-in `HttpException` classes (e.g., `BadRequestException`, `NotFoundException`, `ForbiddenException`, `UnauthorizedException`, `InternalServerErrorException`).
    ```typescript
    import { Injectable, NotFoundException } from '@nestjs/common';

    @Injectable()
    export class ProductsService {
      async findOne(id: string) {
        const product = await this.productRepository.findOne(id);
        if (!product) {
          throw new NotFoundException(`Product with ID ${id} not found.`);
        }
        return product;
      }
    }
    ```
-   **Custom Exceptions**: Create custom exception classes by extending `HttpException` for domain-specific errors. This allows for more granular error handling in exception filters.
    ```typescript
    // src/common/exceptions/insufficient-stock.exception.ts
    import { HttpException, HttpStatus } from '@nestjs/common';

    export class InsufficientStockException extends HttpException {
      constructor(itemId: string, availableStock: number) {
        super(`Insufficient stock for item ${itemId}. Available: ${availableStock}`, HttpStatus.CONFLICT);
      }
    }
    ```
-   **Exception Filters (`@Catch()`)**: Implement custom exception filters to control the exact JSON response sent to clients when an exception occurs. This is useful for standardizing error responses, logging, or handling specific error types.
    ```typescript
    // src/common/filters/http-exception.filter.ts
    import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
    import { Request, Response } from 'express';

    @Catch() // Catch all exceptions if no specific type provided
    export class AllExceptionsFilter implements ExceptionFilter {
      catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
          exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';
        
        // Add logging here
        console.error(`Status: ${status} Error: ${JSON.stringify(message)} Path: ${request.url}`);

        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: message,
        });
      }
    }
    // Apply globally in main.ts: app.useGlobalFilters(new AllExceptionsFilter());
    ```
-   **ValidationPipes with DTOs**: Use `ValidationPipe` (globally or per-handler) with Data Transfer Objects (DTOs) decorated with `class-validator` decorators to automatically validate incoming request payloads. This pipe throws `BadRequestException` if validation fails.

## Security Best Practices

-   **Input Validation**:
    -   Always validate incoming data using DTOs and `class-validator` decorators. Apply `ValidationPipe` globally or per route.
    -   Sanitize inputs to prevent injection attacks (e.g., XSS, SQL injection), though ORMs/ODMs often help with SQLi.
-   **Authentication**:
    -   Implement robust authentication mechanisms (e.g., JWT, OAuth2, Passport.js strategies via `@nestjs/passport`).
    -   Store passwords securely using strong hashing algorithms (e.g., bcrypt, Argon2).
-   **Authorization (`Guards`)**:
    -   Use Guards (`CanActivate` interface) to implement authorization logic (e.g., role-based access control - RBAC).
    -   Apply guards at controller or handler level.
-   **Helmet**: Use the `helmet` middleware for setting various HTTP headers to secure your application from common web vulnerabilities (XSS protection, clickjacking, etc.).
    ```typescript
    // main.ts
    import helmet from 'helmet';
    // ...
    app.use(helmet());
    ```
-   **CORS (Cross-Origin Resource Sharing)**: Configure CORS appropriately if your API is accessed from different domains. NestJS provides `enableCors()` method on the application instance.
    ```typescript
    // main.ts
    app.enableCors({
      origin: 'https://your-frontend-domain.com', // Or true for all, or a function for dynamic origin
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    ```
-   **Rate Limiting**: Implement rate limiting to protect against brute-force attacks using libraries like `nestjs-rate-limiter` or `express-rate-limit`.
-   **Sensitive Data Exposure**: Avoid logging sensitive information. Be careful what data is returned in API responses. Use DTOs or `class-transformer` to exclude sensitive fields.
-   **Dependency Security**: Regularly update dependencies and use tools like `npm audit` or Snyk to check for vulnerabilities.

## Performance Considerations

-   **Caching**:
    -   Implement caching strategies for frequently accessed data that doesn't change often. NestJS provides a `CacheModule` (using `cache-manager`).
    -   Use caching for database query results, computed data, or responses from external services.
-   **Asynchronous Operations**: Leverage `async/await` and non-blocking I/O operations to prevent blocking the Node.js event loop.
-   **Database Optimization**:
    -   Write efficient database queries.
    -   Use indexing appropriately.
    -   Optimize data models and relationships.
    -   Consider connection pooling. (See `repository-pattern.md` for more on data access).
-   **Response Compression**: Use `compression` middleware to gzip/deflate responses.
    ```typescript
    // main.ts
    import * as compression from 'compression';
    // ...
    app.use(compression());
    ```
-   **Use Fastify (Optional)**: For performance-critical applications, consider using Fastify as the underlying HTTP adapter instead of Express (default).
    ```typescript
    // main.ts
    // import { NestFactory } from '@nestjs/core';
    // import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
    // const app = await NestFactory.create<NestFastifyApplication>(
    //   AppModule,
    //   new FastifyAdapter(),
    // );
    ```
-   **Lazy Loading Modules**: While NestJS modules are generally loaded eagerly, for very large applications, structure your modules so that not everything needs to be instantiated at startup if possible (though true lazy loading of modules on request is not a standard feature without custom implementations).
-   **Logging**: Be mindful of logging levels in production. Excessive logging can impact performance.

## Configuration Management

-   **`ConfigModule` (`@nestjs/config`)**: Use the official `ConfigModule` for managing environment variables and configuration files.
    -   Load `.env` files (using `dotenv` under the hood).
    -   Provide type-safe access to configuration properties.
    -   Allow for custom configuration files (e.g., YAML, JSON).
    ```typescript
    // app.module.ts
    import { ConfigModule } from '@nestjs/config';

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true, // Make ConfigService available globally
          // envFilePath: '.development.env', // Specify custom env file
          // validationSchema: Joi.object({ ... }), // For validation
        }),
        // ...
      ],
    })
    export class AppModule {}

    // my.service.ts
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class MyService {
      constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('API_KEY');
        const dbPort = this.configService.get<number>('DATABASE_PORT', 5432); // with default
      }
    }
    ```

## Database Interaction Patterns

-   **TypeORM/Mongoose Integration**: NestJS integrates well with ORMs like TypeORM and ODMs like Mongoose.
    -   Define entities/schemas clearly.
    -   Use repositories (custom or built-in from TypeORM) to abstract data access.
    -   Manage database connections within modules (e.g., `TypeOrmModule.forRootAsync()`).
-   **Transactions**: For operations that require multiple database writes to be atomic, use database transactions.
    -   TypeORM: Use `@Transaction()` decorator or `EntityManager.transaction()`.
    -   Mongoose: Use sessions for transactions.
-   **Query Builders vs. ORM/ODM Methods**:
    -   Use ORM/ODM methods for common CRUD operations for simplicity and maintainability.
    -   Use query builders for complex queries that are hard to express with standard ORM/ODM methods.
-   **Connection Management**: Ensure database connections are managed efficiently (e.g., pooling is typically handled by the ORM/ODM driver and configured through NestJS modules).

## Testing

-   Write comprehensive tests: unit, integration, and E2E. (See `testing.md` for details).
-   Use NestJS's testing utilities (`Test.createTestingModule()`).
-   Mock dependencies effectively.

## General TypeScript Best Practices

-   **Strong Typing**: Leverage TypeScript's type system. Avoid `any` where possible.
-   **Interfaces and DTOs**: Use interfaces for defining shapes of objects and DTOs for data transfer, especially for API contracts.
-   **Readonly Properties**: Use `readonly` for properties that should not be modified after initialization.
-   **Async/Await**: Prefer `async/await` over direct Promise chaining for cleaner asynchronous code.

By adhering to these best practices, you can build NestJS applications in {projectPath} that are robust, secure, performant, and easier to maintain and scale.
```
