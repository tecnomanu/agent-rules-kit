---
description: Core architectural concepts of NestJS, including modules, controllers, providers (services, repositories), dependency injection, pipes, guards, interceptors, and middleware.
globs: <root>/src/**/*.ts,<root>/src/main.ts
alwaysApply: true
---

# NestJS Architecture Concepts

NestJS is a progressive Node.js framework for building efficient, scalable, and enterprise-grade server-side applications. It leverages modern JavaScript, is built with TypeScript, and combines elements of Object-Oriented Programming (OOP), Functional Programming (FP), and Functional Reactive Programming (FRP). This document outlines the core architectural concepts of NestJS for {projectPath}.

## Fundamental Principles

NestJS is built on several core principles, heavily inspired by Angular:

1.  **Modularity**: Applications are organized into modules that encapsulate related functionality.
2.  **Dependency Injection (DI)**: A powerful system for managing dependencies between application components, promoting loose coupling and testability.
3.  **Decorators**: TypeScript decorators are used extensively to define metadata for classes, methods, and properties, configuring how they integrate into the NestJS ecosystem.
4.  **Platform Agnostic**: While commonly used for building REST APIs and GraphQL applications with Express.js or Fastify, NestJS is platform-agnostic and can be used for microservices, WebSockets, CLI applications, etc.
5.  **TypeScript First**: Fully embraces TypeScript, providing strong typing and enabling better tooling and developer experience.

## Core Building Blocks

### 1. Modules (`@Module()`)

Modules are the fundamental organizational unit in NestJS. They are TypeScript classes adorned with the `@Module()` decorator. A module encapsulates a closely related set of capabilities (components, services, controllers, etc.).

-   **`imports`**: An array of other modules that this module needs. Exported providers from imported modules become available.
-   **`controllers`**: An array of controllers that must be instantiated within this module.
-   **`providers`**: An array of providers (services, repositories, factories, helpers) that will be instantiated by the NestJS injector and may be shared at least across this module.
-   **`exports`**: A subset of providers from this module that should be available in other modules that import this module.

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { TypeOrmModule } from '@nestjs/typeorm'; // Example if using TypeORM
// import { User } from './entities/user.entity'; // Example entity

@Module({
  // imports: [TypeOrmModule.forFeature([User])], // Example: importing TypeORM features for User entity
  controllers: [UsersController],
  providers: [UsersService], // UserService is now available for injection within UsersModule
  exports: [UsersService]   // UserService can be imported by other modules
})
export class UsersModule {}

// src/app.module.ts (Root Module)
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
// ... other imports

@Module({
  imports: [UsersModule, /* other modules */],
  // ... controllers and providers for AppModule
})
export class AppModule {}
```
The root module (`AppModule`) is the entry point of the application structure.

### 2. Controllers (`@Controller()`)

Controllers are responsible for handling incoming requests and returning responses to the client. They are classes decorated with `@Controller()` and define various routes.

-   **Route Path**: The `@Controller('users')` decorator specifies a route path prefix for all routes defined within this controller.
-   **HTTP Method Decorators**: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, `@Head()`, `@All()` map HTTP requests to specific handler methods.
-   **Parameter Decorators**: Extract data from the request (e.g., `@Param()`, `@Query()`, `@Body()`, `@Headers()`, `@Req()`, `@Res()`).

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { AuthGuard } from '../auth/auth.guard'; // Example guard

@Controller('users') // Route prefix for all methods in this controller
// @UseGuards(AuthGuard) // Example: Apply a guard to all routes in this controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
```

### 3. Providers (`@Injectable()`)

Providers are a fundamental concept in NestJS. Many NestJS classes may be treated as a provider – services, repositories, factories, helpers, etc. The main idea of a provider is that it can be **injected** as a dependency.

-   **Services**: Typically encapsulate business logic.
-   **Repositories**: Abstract data access (e.g., interacting with a database).
-   **Factories**: Create instances of other classes.
-   Providers are plain JavaScript classes that are decorated with `@Injectable()`.
-   They are managed by NestJS's Inversion of Control (IoC) container.

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity'; // Assuming an entity definition
import { CreateUserDto } from './dto/create-user.dto';
// import { UserRepository } from './user.repository'; // Example custom repository

@Injectable()
export class UsersService {
  // Example with an in-memory array, typically you'd inject a repository
  private readonly users: User[] = []; 
  // constructor(private readonly userRepository: UserRepository) {} // Example with repository

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = { id: Date.now().toString(), ...createUserDto };
    this.users.push(newUser);
    return newUser;
    // return this.userRepository.create(createUserDto); // Using repository
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      // throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
    // return this.userRepository.findById(id); // Using repository
  }
}
```

### 4. Dependency Injection (DI)

NestJS has a powerful DI system. Dependencies are resolved by type and injected into class constructors.
```typescript
// constructor(private readonly usersService: UsersService) {}
```
Providers must be registered within a module (in the `providers` array or imported from other modules) to be injectable.

### 5. Pipes (`PipeTransform`, `@UsePipes()`)

Pipes are classes decorated with `@Injectable()` that implement the `PipeTransform` interface. They operate on the arguments being processed by a route handler.
-   **Transformation**: Transform input data to the desired format (e.g., string to integer).
-   **Validation**: Validate input data and throw an exception if validation fails. NestJS often uses `class-validator` and `class-transformer` with a `ValidationPipe`.

```typescript
// src/common/pipes/parse-int.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`Validation failed: "${value}" is not an integer.`);
    }
    return val;
  }
}

// Usage in a controller:
// @Get(':id')
// findOne(@Param('id', ParseIntPipe) id: number) { /* ... */ }
// Or globally: app.useGlobalPipes(new ValidationPipe());
```

### 6. Guards (`CanActivate`, `@UseGuards()`)

Guards are classes decorated with `@Injectable()` that implement the `CanActivate` interface. They determine whether a given request will be handled by the route handler or not, typically based on authentication/authorization.
-   Return `true` to allow access, `false` or throw an exception (e.g., `ForbiddenException`) to deny.

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // No roles specified, access granted
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}

// Usage:
// @SetMetadata('roles', ['admin'])
// @UseGuards(RolesGuard)
// @Get('admin-route')
// getAdminData() { /* ... */ }
```

### 7. Interceptors (`NestInterceptor`, `@UseInterceptors()`)

Interceptors are classes decorated with `@Injectable()` that implement the `NestInterceptor` interface. They provide aspect-oriented programming (AOP) capabilities:
-   Bind extra logic before/after method execution.
-   Transform the result returned from a function.
-   Transform exceptions thrown from a function.
-   Extend basic function behavior.
-   Override a function completely.
They have access to `ExecutionContext` (like Guards) and `CallHandler` (which allows access to the response stream via RxJS `Observable`).

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    return next
      .handle()
      .pipe(
        tap(() => console.log(`${method} ${url} ${Date.now() - now}ms`)),
      );
  }
}

// Usage: @UseInterceptors(LoggingInterceptor)
```

### 8. Middleware (`NestMiddleware`)

Middleware functions are executed sequentially before a route handler is called. They are typically used for request logging, CORS, security headers, etc.
-   Middleware can be a function or a class implementing `NestMiddleware`.
-   They have access to the request and response objects (`req`, `res`), and the `next` function in the request-response cycle.
-   Configured in a module's `configure` method (by implementing `NestModule`).

```typescript
// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; // Or from 'fastify'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
  }
}

// In a module:
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(LoggerMiddleware)
//       .forRoutes('*'); // Apply to all routes or specific ones
//   }
// }
```

## Request Lifecycle

A typical request in a NestJS application flows through these components in roughly this order:

1.  **Client sends HTTP Request**.
2.  **Middleware**: Global middleware, then module-specific middleware.
3.  **Guards**: Global guards, then controller guards, then route guards. If any guard returns `false` or throws, the request is denied.
4.  **Interceptors (pre-controller)**: Global interceptors, then controller interceptors, then route interceptors (the `intercept` method's part before `next.handle()`).
5.  **Pipes**: Global pipes, then controller pipes, then route pipes, then route parameter pipes (transform/validate request data).
6.  **Controller Handler**: The method in the controller decorated with the HTTP method (e.g., `@Get()`) is executed.
7.  **Service(s)**: Controller typically calls one or more services to handle business logic.
8.  **Interceptors (post-request / response)**: The part of the interceptor after `next.handle()` (e.g., `tap()`, `map()` operators on the Observable) processes the response.
9.  **Exception Filters**: If any unhandled exception occurs during the process (from controller, service, pipe, guard), global filters, then controller filters, then route filters are executed to format the error response.
10. **Server sends HTTP Response** to the client.

This architecture, with its clear separation of concerns and robust DI system, forms the foundation for building maintainable, testable, and scalable server-side applications with NestJS in {projectPath}.
```
