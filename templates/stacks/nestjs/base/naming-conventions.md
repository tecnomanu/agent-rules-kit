---
description: Standard naming conventions for NestJS projects, covering modules, controllers, services, entities, DTOs, and more, following TypeScript and NestJS best practices.
globs: <root>/src/**/*.ts
alwaysApply: true
---

# NestJS Naming Conventions

This document defines standard naming conventions for NestJS projects, following best practices from the community and the TypeScript/NestJS ecosystem.

## General Principles

-   **Consistency**: Maintain the same style throughout the project.
-   **Clarity**: Names should be descriptive and reveal intent.
-   **Conciseness**: Avoid unnecessarily long names when possible.
-   **Standards**: Follow official NestJS and TypeScript conventions.

## Naming Styles

| Style         | Description                                                            | Example          |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| **PascalCase** | First letter of each word capitalized                                  | `UserController` |
| **camelCase**  | First letter lowercase, subsequent words with first letter capitalized | `findUserById`   |
| **kebab-case** | Lowercase words separated by hyphens                                   | `user-service`   |

## Application by Element Type

### Modules

-   **Names**: `PascalCase` with `Module` suffix
-   **Files**: `kebab-case` with `.module.ts` suffix

```typescript
// users.module.ts
@Module({
	imports: [DatabaseModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
```

### Controllers

-   **Names**: `PascalCase` with `Controller` suffix
-   **Files**: `kebab-case` with `.controller.ts` suffix
-   **Routes**: `kebab-case` (for URL paths)

```typescript
// users.controller.ts
@Controller('users') // Path is typically kebab-case or plural noun
export class UsersController {
	@Get(':id')
	findOne(@Param('id') id: string) {
		// return this.usersService.findOne(id); // Assuming usersService is injected
	}
}
```

### Services

-   **Names**: `PascalCase` with `Service` suffix
-   **Files**: `kebab-case` with `.service.ts` suffix

```typescript
// users.service.ts
@Injectable()
export class UsersService {
	findAll() {
		// return this.usersRepository.find(); // Assuming usersRepository is injected
	}
}
```

### Entities (e.g., TypeORM, Prisma)

-   **Names**: `PascalCase` singular (representing the object)
-   **Files**: `kebab-case` with `.entity.ts` suffix (or `.model.ts` for Prisma)
-   **Properties**: `camelCase`

```typescript
// user.entity.ts
// @Entity() // Example for TypeORM
export class User {
	// @PrimaryGeneratedColumn() // Example for TypeORM
	id: number;

	// @Column() // Example for TypeORM
	firstName: string;

	// @Column() // Example for TypeORM
	lastName: string;

	// @Column({ unique: true }) // Example for TypeORM
	email: string;
}
```

### DTOs (Data Transfer Objects)

-   **Names**: `PascalCase` with a descriptive suffix, commonly `Dto`.
-   **Files**: `kebab-case` with a descriptive suffix like `.dto.ts`.

```typescript
// create-user.dto.ts
// import { IsString, MinLength, IsEmail } from 'class-validator'; // Example imports
export class CreateUserDto {
	// @IsString()
	// @MinLength(2)
	firstName: string;

	// @IsString()
	// @MinLength(2)
	lastName: string;

	// @IsEmail()
	email: string;
}

// update-user.dto.ts
// import { PartialType } from '@nestjs/mapped-types'; // Or @nestjs/swagger
// export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Interfaces

-   **Names**: `PascalCase`. Prefixing with `I` (e.g., `IUser`) is a common convention but optional; many prefer to omit it if the context is clear.
-   **Files**: `kebab-case` with `.interface.ts` suffix.

```typescript
// user.interface.ts
export interface User { // Or IUser
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	isActive: boolean;
}
```

### Enums

-   **Names**: `PascalCase` singular (e.g., `UserRole`, `OrderStatus`).
-   **Files**: `kebab-case` with `.enum.ts` suffix.
-   **Members**: `UPPER_SNAKE_CASE` or `PascalCase`. `UPPER_SNAKE_CASE` is common for string enums.

```typescript
// user-role.enum.ts
export enum UserRole {
	ADMIN = 'admin',
	EDITOR = 'editor',
	USER = 'user',
}

// Alternatively, with PascalCase members (less common for string enums in some styles)
// export enum UserRole { Admin = 'admin', Editor = 'editor', User = 'user' }
```

### Guards, Interceptors, Pipes, Filters

-   **Names**: `PascalCase` with a suffix indicating the type (`Guard`, `Interceptor`, `Pipe`, `Filter`).
-   **Files**: `kebab-case` with the corresponding suffix (`.guard.ts`, `.interceptor.ts`, etc.).

```typescript
// auth.guard.ts
// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; // Example imports
// @Injectable()
export class AuthGuard /*implements CanActivate*/ {
	canActivate(context: /*ExecutionContext*/ any): boolean {
		// Logic here
		return true;
	}
}

// transform.interceptor.ts
// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'; // Example imports
// import { Observable } from 'rxjs'; // Example import
// @Injectable()
export class TransformInterceptor /*implements NestInterceptor*/ {
	intercept(context: /*ExecutionContext*/ any, next: /*CallHandler*/ any): /*Observable<any>*/ any {
		// Logic here
		return next.handle();
	}
}
```

### Methods and Functions

-   Use `camelCase`.
-   Verbs that describe the action.
-   For HTTP methods in controllers, follow REST conventions (often implied by decorators like `@Get`, `@Post`).

```typescript
// In controllers
// @Get()
findAll() {}

// @Get(':id')
findOne(/*@Param('id')*/ id: string) {}

// @Post()
create(/*@Body()*/ createUserDto: /*CreateUserDto*/ any) {}

// @Patch(':id')
update(/*@Param('id')*/ id: string, /*@Body()*/ updateUserDto: /*UpdateUserDto*/ any) {}

// @Delete(':id')
remove(/*@Param('id')*/ id: string) {}
```

### Variables and Properties

-   Use `camelCase`.
-   Descriptive names.
-   Private properties in classes are often prefixed with an underscore `_` by convention, though TypeScript's `private` keyword is the formal way to enforce privacy.

```typescript
const userCount = 42;
const isActive = true;

// In classes
// private readonly userRepository: Repository<User>; // TypeORM example
// private readonly _configService: ConfigService; // Underscore for private
```

### Constants

-   For exported, top-level constants or widely used immutable values: `UPPER_SNAKE_CASE`.
-   For local constants within a class or function, `camelCase` (if `readonly`) or `PascalCase` (if `static readonly` and treated like a type-level constant) can be acceptable, but `UPPER_SNAKE_CASE` is also common for any immutable primitive.

```typescript
// Global or exported constants
export const API_VERSION = 'v1';
export const MAX_LOGIN_ATTEMPTS = 5;

// Inside classes
class MyService {
  private static readonly DEFAULT_TIMEOUT_MS = 30000; // PascalCase for static readonly
  private readonly maxRetries = 3; // camelCase for instance readonly
}
```

## Directory Structure (Example for a feature module)

```
src/
├── app.module.ts
├── main.ts
├── users/                     # Feature module directory (kebab-case)
│   ├── dto/                   # DTOs for this feature
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/              # Entities for this feature (if using TypeORM)
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.service.spec.ts  # Unit test for the service
│   └── users.controller.spec.ts # Unit/Integration test for controller
├── auth/                      # Another feature module
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── guards/
│       └── jwt-auth.guard.ts
└── shared/                    # Shared module for common utilities, etc.
    └── shared.module.ts
```

## Test File Conventions

-   **Test Files**: Same name as the file being tested, with `.spec.ts` suffix (for unit/integration tests).
-   **E2E Test Files**: Descriptive name with `.e2e-spec.ts` suffix, typically in a top-level `test/` directory.
-   **Test Descriptions**: Use descriptive strings in `describe()` and `it()` blocks.

```typescript
// users.service.spec.ts
describe('UsersService', () => {
	it('should return all users', () => {
		// ...
	});

	it('should find one user by id', () => {
		// ...
	});
});
```

## Decorators

-   Decorators should be placed on their own line immediately above the decorated code.
-   Follow the order of decorators recommended by NestJS if multiple are used (e.g., `@ApiProperty()` before validation decorators).

```typescript
// @Module({ // Example imports
// 	imports: [DatabaseModule],
// 	controllers: [UsersController],
// })
export class UsersModule {}

// @Controller('users') // Example imports
// @UseGuards(AuthGuard) // Example guard
export class UsersController {
	// @Get(':id')
	// @UseInterceptors(LoggingInterceptor) // Example interceptor
	findOne(/*@Param('id')*/ id: string) {
		// return this.usersService.findOne(id);
	}
}
```

## Linting Tools

Configure ESLint with strict rules to enforce naming conventions and other coding standards.
The NestJS starter project usually comes with a good ESLint setup. You can customize `@typescript-eslint/naming-convention` rules in your `.eslintrc.js` file.

Example `.eslintrc.js` rule snippet (adjust to your team's preference):
```javascript
// .eslintrc.js excerpt
module.exports = {
  // ... other ESLint config ...
  rules: {
    '@typescript-eslint/naming-convention': [
      'warn', // Use 'error' to enforce strictly
      { selector: 'default', format: ['camelCase'] },
      { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'], leadingUnderscore: 'allow' }, // Allow PascalCase for e.g. injected constants
      { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      { selector: 'property', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' }, // Allow UPPER_CASE for e.g. static readonly
      { selector: 'method', format: ['camelCase'] },
      { selector: 'enumMember', format: ['UPPER_SNAKE_CASE'] }, // Or PascalCase
      { selector: 'typeLike', format: ['PascalCase'] }, // Classes, Interfaces, Types, Enums
      // Optionally allow 'I' prefix for interfaces, but don't enforce it if not preferred:
      // { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } }, 
    ],
    // ... other rules ...
  },
};
```

> Note: These conventions are recommendations based on NestJS best practices. Adapt them as needed for {projectPath}'s specific requirements while maintaining consistency throughout the codebase.
```
