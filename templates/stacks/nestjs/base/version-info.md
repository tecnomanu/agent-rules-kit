---
description: NestJS version information, key features by version, migration guidelines, and compatibility notes.
globs: <root>/package.json # For version detection
alwaysApply: true
---

# NestJS Version Information

This document provides information about different NestJS versions and migration guidelines.

## Version Overview

| Version     | Node.js Compatibility | TypeScript Compatibility | Release Date | LTS Status  |
| ----------- | --------------------- | ------------------------ | ------------ | ----------- |
| NestJS 10.x | ≥ 16.13.0             | ≥ 4.7.x                  | May 2023     | Active      |
| NestJS 9.x  | ≥ 12.0.0              | ≥ 4.3.x                  | June 2022    | Maintenance |
| NestJS 8.x  | ≥ 10.13.0             | ≥ 4.3.x                  | June 2021    | End of Life |
| NestJS 7.x  | ≥ 10.13.0             | ≥ 3.7.x                  | June 2020    | End of Life |

## Key Features by Version

### NestJS 10.x

**Released:** May 2023

Key features and improvements:

-   **ESM Support**: Better support for ECMAScript modules
-   **Node.js 20 Support**: Compatible with Node.js 20
-   **TypeScript 5 Support**: Compatible with TypeScript 5
-   **Custom Decorators Enhancement**: Improved parameter decorators
-   **Response Handling**: Enhanced response handling with Streaming API
-   **Circular Dependencies Detection**: Better error reporting for circular dependencies
-   **WebSocket Gateway Enhancement**: Improved WebSocket gateway implementation
-   **Performance Improvements**: Various performance optimizations
-   **CLI Enhancements**: Improved CLI features

Breaking changes:

-   Removed support for Node.js 12.x
-   Updated minimum TypeScript version requirement to 4.7.x
-   Revised custom decorator parameter behavior

### NestJS 9.x

**Released:** June 2022

Key features and improvements:

-   **Authentication Enhancements**: Improved authentication mechanisms
-   **Standalone Applications**: Better support for serverless environments
-   **Serve Static Enhancement**: Enhanced serve-static middleware implementation
-   **Version-Neutral Code**: Improved compatibility across different versions
-   **Apollo Federation 2.0 Support**: Enhanced GraphQL federation support
-   **CLI Plugin System**: More extensible CLI architecture
-   **Logger Update**: Improved built-in logger
-   **Payload Size Limits**: Better control over HTTP request size limits

Breaking changes:

-   Renamed several internal interfaces
-   Changed behavior of certain interceptors
-   Adjusted the logger timestamp format

### NestJS 8.x

**Released:** June 2021

Key features and improvements:

-   **Stricter Type Checking**: Enhanced type-safety throughout the framework
-   **Webpack 5 Support**: Updated to support Webpack 5
-   **Faster Development Builds**: Improved development server performance
-   **File Upload Improvements**: Enhanced file upload capabilities
-   **Better Error Messages**: More descriptive error messages
-   **CacheModule Enhancement**: Improved caching mechanism
-   **SwaggerModule Updates**: Enhanced OpenAPI documentation

Breaking changes:

-   Stricter typing across multiple modules
-   Changed cache manager implementation
-   Updated several dependencies with breaking changes

## Migration Guides

### Migrating from NestJS 9.x to 10.x

1. **Update Node.js Version**:
   Ensure you're using Node.js 16.13.0 or later.

2. **Update TypeScript Version**:
   Update to TypeScript 4.7.x or later.

    ```bash
    npm install typescript@latest --save-dev
    ```

3. **Update NestJS Packages**:

    ```bash
    npm install @nestjs/common@10 @nestjs/core@10 @nestjs/platform-express@10 --save
    # Update other @nestjs/* packages as needed
    ```

4. **Update Custom Parameter Decorators**:
   Review and update any custom parameter decorators to match the new behavior.

    ```typescript
    // Before (NestJS 9)
    // export const User = createParamDecorator(
    // 	(data: string, ctx: ExecutionContext) => {
    // 		const request = ctx.switchToHttp().getRequest();
    // 		const user = request.user;
    // 		return data ? user?.[data] : user;
    // 	}
    // );

    // After (NestJS 10)
    // export const User = createParamDecorator(
    // 	(data: string, ctx: ExecutionContext) => {
    // 		const request = ctx.switchToHttp().getRequest();
    // 		const user = request.user;
    // 		return data ? user?.[data] : user;
    // 	}
    // );
    // No change in syntax for typical usage, but internal validation or behavior might be stricter.
    ```

5. **ESM Configuration**:
   If using ESM, update your `package.json`:

    ```json
    {
    	"type": "module",
    	"imports": {
    		"#src/*": "./dist/*"
    	}
    }
    ```

    And update your `tsconfig.json`:

    ```json
    {
    	"compilerOptions": {
    		"module": "ESNext", // Or "NodeNext"
    		"moduleResolution": "NodeNext", // Or "Bundler" if using Vite/ESBuild
    		"target": "ES2021", // Or newer
    		"outDir": "./dist",
    		"esModuleInterop": true
    	}
    }
    ```

6. **Review Circular Dependencies**:
   Check for and resolve any circular dependencies, as NestJS 10.x improved detection may expose previously hidden issues.

### Migrating from NestJS 8.x to 9.x

1. **Update Dependencies**:

    ```bash
    npm install @nestjs/common@9 @nestjs/core@9 @nestjs/platform-express@9 --save
    # Update other @nestjs/* packages as needed
    ```

2. **Logger Format Changes**:
   Update custom logger implementations to match the new timestamp format or configure the logger to use the old format if necessary.

    ```typescript
    // Default timestamp format changed in v9.
    // If you have custom loggers parsing timestamps, they might need adjustment.
    ```

3. **Review and Update Interceptors**:
   Check interceptors for compatibility with the new behavior, especially those handling responses or exceptions.

4. **Request Size Limits**:
   Configure payload size limits if needed using `bodyParser` middleware options:

    ```typescript
    // main.ts
    // import { json, urlencoded } from 'express'; // For Express
    // app.use(json({ limit: '50mb' }));
    // app.use(urlencoded({ extended: true, limit: '50mb' }));
    ```

5. **Apollo Federation Changes**:
   If using Apollo Federation, update to Federation 2.0 compatible configuration in your GraphQL module setup.

## Best Practices for Version Management

1. **Regularly Update Dependencies**:
   Keep all NestJS packages (`@nestjs/*`) at the same major version to avoid compatibility issues.

    ```bash
    # Check outdated packages
    npm outdated

    # Update all @nestjs packages to latest within the current major version
    npx npm-check-updates -u "/^@nestjs\/.*$/" && npm install
    # For major version upgrades, do it carefully, package by package or using NestJS migration guides.
    ```

2. **Use Peer Dependencies**:
   When creating NestJS libraries, correctly define `@nestjs/common`, `@nestjs/core`, etc., as peer dependencies in your library's `package.json`.

    ```json
    {
    	"peerDependencies": {
    		"@nestjs/common": "^9.0.0 || ^10.0.0", // Example range
    		"@nestjs/core": "^9.0.0 || ^10.0.0"
    	}
    }
    ```

3. **Version Control Package Lock**:
   Always commit your `package-lock.json` (for npm), `yarn.lock` (for Yarn), or `pnpm-lock.yaml` (for PNPM) to ensure consistent installations across environments.

4. **Use Tagged Releases**:
   For production, use specific versions rather than ranges if maximum stability is required, though SemVer with `^` is generally safe for minor and patch updates.

    ```json
    // package.json example
    {
    	"dependencies": {
    		"@nestjs/common": "^10.0.0", // Allows patch and minor updates
    		"@nestjs/core": "^10.0.0"
    	}
    }
    ```

5. **Test Before Upgrading**:
   Always test your application thoroughly (unit, integration, E2E tests) before and after upgrading to a new major or minor version.

    ```bash
    # Example: If testing a release candidate
    # npm install @nestjs/common@10.0.0-rc.0 @nestjs/core@10.0.0-rc.0 --save

    # Run your test suite
    npm run test
    npm run test:e2e
    ```

## Version-Specific Features Deep Dive

### NestJS 10.x Features

#### Enhanced ESM Support
NestJS 10 offers improved compatibility with ECMAScript Modules. This requires specific configurations in `package.json` (`"type": "module"`) and `tsconfig.json` (`"module": "NodeNext"` or `"ESNext"`). Imports within your project might need to include file extensions (e.g., `import { MyService } from './my.service.js';`).

#### Improved Streaming API with `StreamableFile`
The `StreamableFile` class simplifies sending file streams as responses, handling headers like `Content-Type` and `Content-Disposition` automatically.
```typescript
import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

@Controller('file')
export class FileController {
  @Get('stream')
  getFile(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }
}
```

### NestJS 9.x Features

#### Standalone Applications
The `NestFactory.createApplicationContext()` method allows creating a NestJS application instance without an HTTP listener, useful for CRON jobs, CLI tools, or queue workers.
```typescript
// In a script or CRON job entry point
async function runScript() {
  const appCtx = await NestFactory.createApplicationContext(AppModule);
  const myService = appCtx.get(MyService);
  await myService.performTask();
  await appCtx.close();
}
runScript();
```

#### Enhanced GraphQL Federation (Apollo Federation 2.0)
NestJS 9 improved support for Apollo Federation v2, allowing for more complex federated GraphQL architectures. This involves using `@apollo/gateway` with `GraphQLModule.forRoot` configured for federation.

## Deprecated Features and Alternatives

| Version | Deprecated Feature                        | Alternative                               |
| ------- | ----------------------------------------- | ----------------------------------------- |
| 10.x    | Some internal `HttpException` constructor signatures | Use static factory methods or updated constructor. |
| 9.x     | `FastifyAdapter` default arguments        | Explicitly provide options to `FastifyAdapter`. |
| 8.x     | `forwardRef()` without factory function   | Always use a factory function: `forwardRef(() => MyModule)`. |
| 7.x     | `@Inject()` without a token (for custom providers) | Always provide an explicit token for custom providers. |

## Compatibility with Popular Libraries

(This table is illustrative; always check current compatibility with specific versions)
| Library  | NestJS 10.x | NestJS 9.x | Notes (General Trends)             |
| -------- | ----------- | ---------- | ---------------------------------- |
| TypeORM  | ✅ 0.3.x+   | ✅ 0.3.x+  | Ensure NestJS TypeORM wrapper is compatible. |
| Mongoose | ✅ 7.x+     | ✅ 6.x+    | Mongoose v7+ often requires newer Node.js. |
| Passport | ✅ 0.6.x+   | ✅ 0.5.x+  | Generally stable API.              |
| GraphQL  | ✅ (Mercurius/Apollo) | ✅ (Mercurius/Apollo) | Apollo Server v4+ has changes. |
| Swagger  | ✅ 7.x+     | ✅ 6.x+    | `@nestjs/swagger` versions align with NestJS. |

## Experimental Features

NestJS sometimes introduces experimental features. Use these with caution in production as their APIs might change.
-   Always check the official documentation for the current status of experimental features.
-   Examples might include new decorators, module loading strategies, or integrations.

## Community Resources

-   [Official NestJS Documentation](https://docs.nestjs.com/)
-   [NestJS GitHub Repository](https://github.com/nestjs/nest)
-   [NestJS Discord Community](https://discord.gg/nestjs)
-   [Awesome NestJS](https://github.com/juliandavidmr/awesome-nestjs) - A curated list of NestJS resources.

{projectPath} should aim to follow the guidelines pertinent to its detected NestJS version: **{detectedVersion}**.
```
