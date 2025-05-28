---
description: Recommended project structure for NestJS applications, detailing organization of modules, common code, configuration, and testing.
globs: <root>/**/*.ts # General glob, as structure is broad
alwaysApply: true
---

# NestJS Project Structure

This document defines recommended project structures for NestJS applications developed in {projectPath}.

## Base Structure

The standard recommended structure for NestJS applications:

```
{projectPath}/
├── dist/                 # Compiled code
├── node_modules/         # Dependencies
├── src/                  # Source code
│   ├── app.module.ts     # Main module
│   ├── app.controller.ts # Main controller (optional, can be removed if not needed)
│   ├── app.service.ts    # Main service (optional)
│   ├── main.ts           # Application entry point (bootstraps the app)
│   ├── common/           # Shared code accessible across modules
│   │   ├── constants/    # Global constants (e.g., roles, permissions)
│   │   ├── decorators/   # Custom decorators
│   │   ├── dto/          # Shared Data Transfer Objects
│   │   ├── entities/     # Shared Entities (if applicable, less common for base structure)
│   │   ├── enums/        # Global enums
│   │   ├── exceptions/   # Custom global exceptions
│   │   ├── filters/      # Global exception filters
│   │   ├── guards/       # Global guards (e.g., authentication guard)
│   │   ├── interceptors/ # Global interceptors (e.g., logging, response transformation)
│   │   ├── interfaces/   # Shared TypeScript interfaces
│   │   ├── middleware/   # Custom middleware functions/classes
│   │   ├── pipes/        # Global pipes (e.g., custom validation pipe)
│   │   └── utils/        # Shared utility functions
│   ├── config/           # Application configuration (often using @nestjs/config)
│   │   ├── config.module.ts    # Optional: if you create a dedicated ConfigModule
│   │   ├── config.service.ts   # Optional: if you create a dedicated ConfigService
│   │   └── configuration.ts    # Function to load and validate configuration
│   └── modules/          # Feature modules (preferred over top-level feature directories for better structure)
│       ├── users/        # Example: Users feature module
│       │   ├── dto/      # DTOs specific to the users module
│       │   │   └── create-user.dto.ts
│       │   ├── entities/ # Entities specific to the users module (e.g., TypeORM User entity)
│       │   │   └── user.entity.ts
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   ├── users.service.ts
│       │   └── users.service.spec.ts # Unit tests for the service
│       └── auth/         # Example: Authentication feature module
│           ├── dto/
│           ├── guards/
│           ├── strategies/ # e.g., JWT strategy for Passport
│           ├── auth.controller.ts
│           ├── auth.module.ts
│           ├── auth.service.ts
│           └── auth.service.spec.ts
├── test/                 # End-to-end (E2E) tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json     # Jest configuration for E2E tests
├── .env                  # Environment variables (e.g., .env, .env.development)
├── .eslintrc.js          # ESLint configuration
├── .gitignore            # Git ignore configuration
├── .prettierrc           # Prettier configuration
├── nest-cli.json         # NestJS CLI configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript compiler configuration
├── tsconfig.build.json   # TypeScript configuration for the build process
└── README.md             # Project documentation
```

## Domain-Driven Design (DDD) Structure

For projects applying Domain-Driven Design principles:

```
{projectPath}/src/
├── domain/                 # Core domain logic, entities, value objects, domain services, repository interfaces
│   ├── users/              # Users bounded context / aggregate
│   │   ├── model/          # Entities, Value Objects
│   │   │   └── user.entity.ts
│   │   │   └── email.value-object.ts
│   │   ├── services/       # Domain services (if any)
│   │   ├── repositories/   # Repository interfaces
│   │   │   └── user.repository.interface.ts
│   │   └── events/         # Domain events
│   └── products/           # Another bounded context
│       └── ...
├── application/            # Application services / use cases, DTOs for application layer
│   ├── users/
│   │   ├── use-cases/      # e.g., create-user.use-case.ts
│   │   ├── dto/
│   │   └── services/       # Application services orchestrating domain logic
│   │       └── user.application.service.ts
│   └── products/
│       └── ...
├── infrastructure/         # Implementations of interfaces defined in domain/application (e.g., database, external services)
│   ├── database/
│   │   ├── typeorm/        # Example: TypeORM specific implementation
│   │   │   ├── entities/   # TypeORM entities (can map to domain entities)
│   │   │   ├── migrations/
│   │   │   └── repositories/ # Concrete repository implementations
│   │   │       └── user.typeorm.repository.ts
│   ├── auth/               # Auth infrastructure (e.g., JWT services)
│   └── external-services/  # Clients for external APIs
└── presentation/           # Entry points to the application (e.g., Controllers, GraphQL Resolvers, CLI commands)
    ├── rest/               # REST API
    │   ├── users/
    │   │   ├── users.controller.ts
    │   │   └── dto/        # DTOs specific to REST API presentation
    │   └── auth/
    │       └── auth.controller.ts
    ├── graphql/            # GraphQL Resolvers
    └── cli/                # CLI commands
```
*(This DDD structure is one interpretation; variations exist based on complexity and specific DDD patterns adopted.)*

## Scalable Modular Structure (Feature-based)

For large applications, organizing by feature is highly recommended. Each feature becomes a module.

```
{projectPath}/src/
├── app.module.ts           # Root module, imports feature modules
├── main.ts
├── core/                   # Core cross-cutting modules (often imported by AppModule)
│   ├── database/
│   ├── config/
│   ├── logger/
│   └── auth/               # Core auth module (can also be a top-level feature)
├── shared/                 # Shared utilities, DTOs, interfaces (not NestJS modules)
│   ├── utils/
│   ├── constants/
│   └── exceptions/
└── modules/                # Top-level directory for all feature modules
    ├── users/              # Users feature module
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── users.module.ts
    │   ├── entities/user.entity.ts
    │   └── dto/create-user.dto.ts
    ├── products/           # Products feature module
    │   └── ...
    └── orders/             # Orders feature module
        └── ...
```

## Principles of Organization

1.  **High Cohesion**: Group related files and logic together (typically within a feature module).
2.  **Low Coupling**: Minimize dependencies between modules. Modules should expose well-defined public APIs (via `exports` in `@Module()`).
3.  **Encapsulation**: Hide internal implementation details within modules.
4.  **Modularity by Feature**: Organize code based on application features or domains rather than by technical layers (e.g., avoid having a global `controllers` folder; instead, each feature module has its own controllers).

## Module Structure (Within a Feature Module)

A typical NestJS feature module should have a consistent internal structure:

```
users/  (Example: users module directory)
├── dto/                  # Data Transfer Objects for request/response validation and shaping
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user.response.dto.ts
├── entities/             # Database entities (e.g., TypeORM, Prisma models)
│   └── user.entity.ts
├── guards/               # Guards specific to this module
│   └── roles.guard.ts
├── interceptors/         # Interceptors specific to this module
├── users.controller.ts   # Handles HTTP requests for users
├── users.module.ts       # Defines the NestJS module for users
├── users.service.ts      # Contains business logic for users
├── users.repository.ts   # Optional: custom repository class
└── users.service.spec.ts # Unit tests for the users service
```

## Strategies for Large Projects

### Monorepo with NestJS

Using a monorepo (e.g., with Nx, Lerna, or Yarn/PNPM workspaces) is effective for managing multiple related NestJS applications or libraries.

```
monorepo-root/
├── apps/
│   ├── api-gateway/      # Main API Gateway (NestJS app)
│   │   └── src/
│   ├── users-microservice/ # Users microservice (NestJS app)
│   │   └── src/
│   └── ...
├── libs/
│   ├── common-utils/     # Shared library (plain TypeScript)
│   │   └── src/
│   ├── database-models/  # Shared database entities/models (NestJS library module)
│   │   └── src/
│   └── ...
├── package.json
├── nx.json (if using Nx)
└── ...
```

## Good Organizational Practices

1.  **Absolute Paths (`paths` in `tsconfig.json`)**: Configure TypeScript for absolute paths for cleaner imports.
    ```json
    // tsconfig.json
    {
      "compilerOptions": {
        "baseUrl": "./",
        "paths": {
          "@app/*": ["src/*"],
          "@modules/*": ["src/modules/*"], // If using a top-level modules/ directory
          "@common/*": ["src/common/*"],
          "@config/*": ["src/config/*"]
        }
      }
    }
    ```

2.  **Barrel Files (`index.ts`)**: Use `index.ts` files to re-export entities, DTOs, etc., from directories for simpler import statements from other modules.
    ```typescript
    // src/modules/users/dto/index.ts
    export * from './create-user.dto';
    export * from './update-user.dto';

    // Importing elsewhere:
    // import { CreateUserDto, UpdateUserDto } from '@modules/users/dto';
    ```
    Use judiciously, as they can sometimes impact build times or create circular dependencies if not managed carefully.

> Note: Regardless of the chosen structure, maintain consistency throughout {projectPath}. Choose a structure that best fits the scale, complexity, and team working on the application.
```
