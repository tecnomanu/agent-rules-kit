---
description: Implementation guide for NestJS 9.x, highlighting key features like authentication enhancements, standalone applications, Apollo Federation 2.0 support, and logger updates.
globs: <root>/src/**/*.ts
alwaysApply: true # Applies if v9 is detected
---

# NestJS 9.x Implementation Guide

This document provides specific guidance for developing applications with NestJS 9.x.

## Key Features in NestJS 9.x

NestJS 9.x, released in June 2022, introduced several important features and improvements:

1. **Authentication Enhancements**: Improvements to the authentication module and Passport strategies.
2. **Standalone Applications**: Better support for creating applications without a full HTTP server, useful for CRON jobs, CLI tools, or queue workers.
3. **Serve Static Enhancement**: More options and better performance for serving static assets.
4. **Apollo Federation 2.0 Support**: Updated integration for building federated GraphQL services.
5. **CLI Plugin System**: A more extensible CLI architecture for custom schematics and plugins.
6. **Logger Update**: The built-in logger received updates, including changes to timestamp formatting.
7. **Payload Size Limits**: Easier configuration for HTTP request payload size limits.
8. **REPL (Read-Eval-Print Loop)**: A new REPL for interacting with your application context.

## Setting Up a NestJS 9.x Project

### Installation

If starting a new project and aiming for version 9 specifically (though latest is usually recommended):
```bash
npm i -g @nestjs/cli
nest new project-name # This will likely install the latest NestJS version.
# To ensure v9, you might need to adjust package.json versions and reinstall.
# Example versions for v9 (check specific minor/patch for stability):
# "@nestjs/common": "^9.0.0",
# "@nestjs/core": "^9.0.0",
# "@nestjs/platform-express": "^9.0.0",
# "reflect-metadata": "^0.1.13",
# "rxjs": "^7.2.0"
# "@types/express": "^4.17.13",
# "@types/node": "^16.0.0",
# "typescript": "^4.7.4" (NestJS 9 often used with TS 4.x)
```

### Project Configuration

-   `nest-cli.json`: NestJS CLI configuration.
-   `tsconfig.json`: TypeScript configuration. NestJS 9 typically targets ES2017 or newer and uses CommonJS modules.
    ```json
    // tsconfig.json (example excerpt for v9)
    {
      "compilerOptions": {
        "module": "commonjs",
        "target": "es2017", // Or ES2018, ES2019
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        "sourceMap": true,
        "outDir": "./dist",
        "baseUrl": "./",
        "incremental": true,
        "skipLibCheck": true,
        "strictNullChecks": false, // Or true for stricter checking
        "noImplicitAny": false,    // Or true
        // ... other options
      }
    }
    ```

## Authentication Enhancements

NestJS 9 continued to refine authentication, often used with `@nestjs/passport` and `@nestjs/jwt`.

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { UsersModule } from '../users/users.module'; // Assuming a UsersModule

@Module({
  imports: [
    // UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '60m') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // `payload` is the decoded JWT.
    // This method should return the user object or necessary user info.
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}
```

## Standalone Applications

Create applications that don't listen for HTTP requests, e.g., for CRON jobs or CLI tools.

```typescript
// src/run-task.ts (Example standalone script)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TasksService } from './modules/tasks/tasks.service'; // Example service

async function bootstrap() {
  const applicationContext = await NestFactory.createApplicationContext(AppModule);
  const tasksService = applicationContext.get(TasksService);

  try {
    await tasksService.runDailyCleanup();
    console.log('Daily cleanup task completed successfully.');
  } catch (error) {
    console.error('Error during daily cleanup task:', error);
  } finally {
    await applicationContext.close();
  }
}
bootstrap();
```

## Apollo Federation 2.0 Support

For building distributed GraphQL applications.

```typescript
// src/graphql.module.ts (Example for a subgraph)
// import { Module } from '@nestjs/common';
// import { GraphQLModule } from '@nestjs/graphql';
// import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
// import { UsersResolver } from './users/users.resolver'; // Example resolver

// @Module({
//   imports: [
//     GraphQLModule.forRoot<ApolloFederationDriverConfig>({
//       driver: ApolloFederationDriver,
//       autoSchemaFile: { path: 'src/schema.gql', federation: 2 }, // Generates schema with Federation v2 directives
//       // typePaths: ['./**/*.graphql'], // Alternative: if using schema-first
//     }),
//     // ... other modules like UsersModule
//   ],
//   // providers: [UsersResolver], // Resolvers are typically in feature modules
// })
// export class GraphQLApiModule {}

// In a resolver for an entity that can be referenced by other subgraphs:
// src/users/users.resolver.ts
// @Resolver(() => User) // Assuming User is your GraphQL User type
// export class UsersResolver {
//   constructor(private readonly usersService: UsersService) {}

//   @ResolveReference()
//   resolveReference(reference: { __typename: string; id: string }): Promise<User> {
//     return this.usersService.findByIdForFederation(reference.id);
//   }
// }
```

## Logger Update (Timestamp Format)

The default timestamp format in the built-in `Logger` changed in v9. If you have custom loggers or parsing tools that rely on the old ISO format, you might need to adjust them or customize the logger.

```typescript
// To customize the default logger with specific options:
// import { Logger, Module } from '@nestjs/common';

// @Module({
//   providers: [
//     {
//       provide: Logger,
//       useValue: new Logger('MyApplicationContext', { timestamp: true }), // Example customization
//     },
//   ],
// })
// export class CustomLoggerModule {}
```

## Payload Size Limits

Configure HTTP request body size limits in `main.ts`:

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // Or from 'fastify' if using FastifyAdapter

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' })); // For JSON payloads
  app.use(urlencoded({ extended: true, limit: '50mb' })); // For URL-encoded payloads

  await app.listen(3000);
}
bootstrap();
```

## Other Notable Points for v9

-   **CLI Plugin System**: Became more mature, allowing developers to extend the NestJS CLI with custom schematics and builders.
-   **REPL**: A Read-Eval-Print Loop was introduced for interacting with your application's modules and providers directly from the command line.
    ```bash
    node dist/main.js repl # (Or however your REPL script is configured)
    # > await app.get(UsersService).findAll()
    ```
-   **ServeStaticModule**: Enhancements for serving static assets, providing more configuration options.
-   **Compatibility**: Node.js v12 was still supported by early v9 releases, but later v9 minors might have shifted minimums. Always check release notes. TypeScript 4.x was common.

## Migration from NestJS 8.x to 9.x

1.  **Update Dependencies**:
    ```bash
    npm install @nestjs/common@^9.0.0 @nestjs/core@^9.0.0 @nestjs/platform-express@^9.0.0 # and other @nestjs/* packages
    npm install rxjs@^7.0.0 reflect-metadata@^0.1.13 # Ensure compatible peer dependencies
    ```
2.  **Logger**: If you have custom logic relying on the exact timestamp format of the default logger, review and adjust.
3.  **Interceptors/Guards/Pipes**: Review any complex implementations for behavior changes, although most standard usage remained compatible.
4.  **TypeORM/Mongoose/GraphQL**: If using these, check their specific compatibility notes with NestJS 9 and update related packages accordingly. For example, `TypeORM` versions and `@nestjs/typeorm` need to align.
5.  **Read Official Migration Guide**: Always consult the official NestJS migration guide for the specific version jump for detailed breaking changes and steps.

NestJS 9.x solidified many aspects of the framework and laid groundwork for future enhancements, focusing on developer experience, performance, and broader ecosystem compatibility.
```
