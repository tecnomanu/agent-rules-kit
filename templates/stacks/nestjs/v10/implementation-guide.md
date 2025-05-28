---
description: Implementation guide for NestJS 10.x, focusing on ESM support, Node.js 20 & TypeScript 5 compatibility, enhanced parameter decorators, and improved streaming.
globs: <root>/src/**/*.ts
alwaysApply: true # Applies if v10 is detected
---

# NestJS 10.x Implementation Guide

This document provides specific guidance for developing applications with NestJS 10.x, released in May 2023.

## Key Features in NestJS 10.x

NestJS 10.x includes several significant enhancements and new features:

1.  **ESM Support**: Better support for ECMAScript modules.
2.  **Node.js 20 Support**: Compatible with the latest Node.js version.
3.  **TypeScript 5 Support**: Leverages latest TypeScript features, including stable decorators.
4.  **Custom Decorators Enhancement**: Improved parameter decorators and their capabilities.
5.  **Response Handling**: Enhanced streaming API with `StreamableFile`.
6.  **WebSocket Gateway Enhancement**: Improved WebSocket implementation and options.
7.  **Performance Improvements**: Various optimizations in the core framework.
8.  **SWC Compiler Support (Experimental)**: Option to use SWC for faster builds.

## Setting Up a NestJS 10.x Project

### Installation

```bash
npm i -g @nestjs/cli # Ensure CLI is up to date (v10 or compatible)
nest new project-name # Will typically scaffold a NestJS 10 project
```
Ensure your `package.json` reflects NestJS 10.x versions for core packages (e.g., `@nestjs/common`, `@nestjs/core` should be `^10.0.0`).

### ESM Configuration (If using ES Modules)

NestJS 10.x has improved ESM support. To use ESM:

1.  Update `package.json`:
    ```json
    {
      "name": "my-nestjs-esm-project",
      "version": "1.0.0",
      "type": "module",
      "imports": {
        "#src/*": "./dist/*" 
      },
      "scripts": {
        "build": "nest build",
        "start": "nest start",
        "start:dev": "nest start --watch",
        "start:debug": "nest start --debug --watch",
        "start:prod": "node dist/main.js" // Note .js extension
      }
      // ... other package.json content
    }
    ```

2.  Update `tsconfig.json`:
    ```json
    {
      "compilerOptions": {
        "module": "NodeNext", // Or ESNext, ES2022
        "moduleResolution": "NodeNext", // Or Bundler, Classic
        "target": "ES2022", // Or ESNext
        "outDir": "./dist",
        "baseUrl": "./",
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        "sourceMap": true,
        "incremental": true,
        "skipLibCheck": true,
        "strictNullChecks": false, // Consider setting to true for new projects
        "noImplicitAny": false,    // Consider setting to true
        "esModuleInterop": true,  // Often useful
        "resolveJsonModule": true // If importing JSON files
      }
    }
    ```

3.  Update imports in your code to use `.js` extension for local files:
    ```typescript
    // Example: using explicit .js extension in ESM imports
    import { AppService } from './app.service.js'; // If app.service.ts is in the same dir
    import { MyModule } from '#src/my-module/my-module.js'; // Using path alias
    ```

## TypeScript 5 Features

NestJS 10.x is compatible with TypeScript 5, allowing usage of its features:

-   **Stable Decorators**: TypeScript 5 standardized decorators, aligning more closely with the TC39 proposal. NestJS leverages this.
-   **`const` Type Parameters**: For more precise type inference.
    ```typescript
    function getProperty<const T extends object, const K extends keyof T>(obj: T, key: K): T[K] {
      return obj[key];
    }
    ```
-   Other TypeScript 5 improvements enhance type checking and developer experience.

## Enhanced Parameter Decorators

Custom parameter decorators are robust in NestJS 10.

```typescript
// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => { // Assuming UserEntity type
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserEntity; // Assuming user is populated by an AuthGuard

    if (!user) {
      // This check might be redundant if AuthGuard already ensures user presence
      throw new UnauthorizedException('User not found in request context.');
    }
    return data ? user?.[data] : user;
  },
);

// Usage in a controller:
// import { CurrentUser } from '../common/decorators/user.decorator';
// @Get('profile')
// @UseGuards(JwtAuthGuard) // An AuthGuard that populates request.user
// getProfile(@CurrentUser() user: UserEntity) {
//   return user;
// }

// @Get('profile/email')
// @UseGuards(JwtAuthGuard)
// getEmail(@CurrentUser('email') userEmail: string) {
//   return { email: userEmail };
// }
```

## Improved Response Handling (Streaming with `StreamableFile`)

NestJS 10.x offers `StreamableFile` for efficiently streaming file responses.

```typescript
// src/files/files.controller.ts
import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express'; // Or from 'fastify'
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('files')
export class FilesController {
  @Get('download-package')
  downloadPackageJson(@Res({ passthrough: true }) res: Response): StreamableFile {
    const filePath = join(process.cwd(), 'package.json');
    const fileStream = createReadStream(filePath);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(fileStream);
  }
}
```

## WebSocket Enhancements

WebSocket Gateways continue to be a core feature, with ongoing refinements.

```typescript
// src/events/events.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io'; // Or from 'ws' if using ws adapter

@WebSocketGateway({
  cors: { origin: '*' }, // Configure CORS as needed
  // namespace: 'chat', // Optional namespace
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', 'Successfully connected to server');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { message: string }, @ConnectedSocket() client: Socket): void {
    this.logger.log(`Message from ${client.id}: ${data.message}`);
    // Broadcast to all clients, or specific rooms etc.
    this.server.emit('receiveMessage', { user: client.id, text: data.message });
  }
}
```

## Circular Dependencies Detection

NestJS 10 continues to provide mechanisms for handling circular dependencies using `forwardRef()` when modules depend on each other. The detection and error reporting for unhandled circular dependencies are generally robust.

```typescript
// src/moduleA/moduleA.service.ts
// @Injectable()
// export class ServiceA {
//   constructor(@Inject(forwardRef(() => ServiceB)) private readonly serviceB: ServiceB) {}
// }

// src/moduleB/moduleB.service.ts
// @Injectable()
// export class ServiceB {
//   constructor(@Inject(forwardRef(() => ServiceA)) private readonly serviceA: ServiceA) {}
// }
```

## SWC Compiler (Experimental Option)

NestJS 10 allows using SWC (Speedy Web Compiler) as an alternative to TypeScript's `tsc` for faster builds, particularly useful during development.
-   Configure in `nest-cli.json`:
    ```json
    {
      "collection": "@nestjs/schematics",
      "sourceRoot": "src",
      "compilerOptions": {
        "builder": "swc", // Use "tsc" for TypeScript's compiler
        "typeCheck": true // Recommended to keep type checking with SWC
      }
    }
    ```
-   Requires installing `@swc/core` and `@swc/cli`.

## Working with Environment Variables (`@nestjs/config`)

The `@nestjs/config` module remains the standard for configuration management.

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'; // For validation schema

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available application-wide
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validationSchema: Joi.object({ // Example validation
        NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
      // load: [configuration], // For custom configuration loading functions
    }),
    // ... other modules
  ],
})
export class AppModule {}

// Usage in a service:
// import { ConfigService } from '@nestjs/config';
// constructor(private configService: ConfigService) {
//   const dbUrl = this.configService.get<string>('DATABASE_URL');
// }
```

## Advanced TypeORM / Mongoose Integration

NestJS 10 maintains strong integration with TypeORM (typically version 0.3.x) and Mongoose. Ensure you are using compatible versions of these libraries and their respective NestJS wrapper modules (`@nestjs/typeorm`, `@nestjs/mongoose`).

## GraphQL Integration (Apollo / Mercurius)

Support for GraphQL via Apollo Server (using `@nestjs/apollo`) or Mercurius (using `@nestjs/mercurius`) is robust. Configure your GraphQL module according to the chosen driver and federation needs.

## Testing in NestJS 10.x

Testing practices remain consistent with previous versions, utilizing `@nestjs/testing` for creating testing modules and mocking dependencies. (See `testing.md` for general practices).

## Security Considerations

Security best practices (Helmet, CORS, CSRF protection, rate limiting, input validation) continue to be crucial.
-   **Helmet**: `app.use(helmet());`
-   **CORS**: `app.enableCors({ origin: 'your-frontend-domain.com' });`
-   **CSRF**: If using cookies for sessions, implement CSRF protection (e.g., `csurf` middleware for Express).
-   **Rate Limiting**: Use `@nestjs/throttler`.

## Migration from NestJS 9.x to 10.x

1.  **Update Node.js**: Ensure your Node.js version is compatible (NestJS 10 recommends Node.js v16 or newer).
2.  **Update TypeScript**: Upgrade to TypeScript v4.7 or newer (v5.x is supported).
3.  **Update NestJS Packages**:
    ```bash
    npm install @nestjs/common@^10 @nestjs/core@^10 @nestjs/platform-express@^10 # and other @nestjs/* packages
    ```
4.  **ESM**: If migrating to ESM, follow the ESM configuration steps mentioned earlier. This is a significant change and requires careful updates to imports/exports and potentially build scripts.
5.  **Custom Decorators**: Review any custom parameter decorators for compatibility, though most should work.
6.  **Dependencies**: Check for breaking changes in major dependencies like TypeORM, Mongoose, Passport, RxJS, etc., and update them if necessary.
7.  **Read Official Release Notes**: Always consult the official NestJS release notes for v10 for detailed breaking changes and migration steps.

NestJS 10 focuses on modernizing the framework with better ESM support, leveraging the latest TypeScript features, and providing performance and developer experience enhancements.
```
