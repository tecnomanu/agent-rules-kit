---
description: NestJS version information and migration guidelines
globs: <root>/**/*.ts
alwaysApply: false
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
    export const User = createParamDecorator(
    	(data: string, ctx: ExecutionContext) => {
    		const request = ctx.switchToHttp().getRequest();
    		const user = request.user;
    		return data ? user?.[data] : user;
    	}
    );

    // After (NestJS 10)
    export const User = createParamDecorator(
    	(data: string, ctx: ExecutionContext) => {
    		const request = ctx.switchToHttp().getRequest();
    		const user = request.user;
    		return data ? user?.[data] : user;
    	}
    );
    // No change in syntax, but validation is more strict
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
    		"module": "ESNext",
    		"moduleResolution": "NodeNext",
    		"target": "ES2021",
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
   Update custom logger implementations to match the new timestamp format.

    ```typescript
    // Before (NestJS 8)
    // Timestamp was ISO format: 2022-01-01T12:00:00.000Z

    // After (NestJS 9)
    // Timestamp defaults to: 12:00:00 PM
    ```

3. **Review and Update Interceptors**:
   Check interceptors for compatibility with the new behavior, especially those handling responses.

4. **Request Size Limits**:
   Configure payload size limits if needed:

    ```typescript
    // main.ts
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
    ```

5. **Apollo Federation Changes**:
   If using Apollo Federation, update to Federation 2.0 compatible configuration.

## Best Practices for Version Management

1. **Regularly Update Dependencies**:
   Keep all NestJS packages at the same version to avoid compatibility issues.

    ```bash
    # Check outdated packages
    npm outdated

    # Update all @nestjs packages at once
    npx npm-check-updates -u "/^@nestjs\/.*$/" && npm install
    ```

2. **Use Peer Dependencies**:
   When creating NestJS libraries, use peer dependencies for NestJS packages.

    ```json
    {
    	"peerDependencies": {
    		"@nestjs/common": "^10.0.0",
    		"@nestjs/core": "^10.0.0"
    	}
    }
    ```

3. **Version Control Package Lock**:
   Always commit your `package-lock.json` or `yarn.lock` to ensure consistent installations.

4. **Use Tagged Releases**:
   For production, use specific versions rather than ranges.

    ```json
    {
    	"dependencies": {
    		"@nestjs/common": "10.0.0",
    		"@nestjs/core": "10.0.0"
    	}
    }
    ```

5. **Test Before Upgrading**:
   Always test your application thoroughly before upgrading to a new major version.

    ```bash
    # Install specific version for testing
    npm install @nestjs/common@10.0.0-rc.0 @nestjs/core@10.0.0-rc.0 --save

    # Run your test suite
    npm run test
    npm run test:e2e
    ```

## Version-Specific Features

### NestJS 10.x Features Deep Dive

#### Enhanced ESM Support

```typescript
// package.json
{
  "type": "module",
  "imports": {
    "#src/*": "./dist/*"
  }
}

// Using imports in code
import { AppService } from '#src/app.service.js';

// Note the `.js` extension is required in ESM
```

#### Improved Streaming API

```typescript
@Controller('stream')
export class StreamController {
	@Get()
	streamFile(@Res() res: Response) {
		const file = createReadStream(join(process.cwd(), 'large-file.txt'));
		file.pipe(res);
	}

	@Get('buffer')
	buffer(@Res() res: Response) {
		const buffer = Buffer.from('Hello World');
		res.set({
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment; filename="data.bin"',
		});
		res.send(buffer);
	}
}
```

### NestJS 9.x Features Deep Dive

#### Standalone Applications

```typescript
// Create a standalone app
const app = await NestFactory.createApplicationContext(AppModule);

// Use it without HTTP server
const service = app.get(AppService);
await service.performTask();
await app.close();
```

#### Enhanced GraphQL Federation

```typescript
// app.module.ts
@Module({
	imports: [
		GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
			driver: ApolloGatewayDriver,
			server: {
				cors: true,
			},
			gateway: {
				supergraphSdl: new IntrospectAndCompose({
					subgraphs: [
						{ name: 'users', url: 'http://user-service/graphql' },
						{ name: 'posts', url: 'http://post-service/graphql' },
					],
				}),
			},
		}),
	],
})
export class AppModule {}
```

## Deprecated Features and Alternatives

| Version | Deprecated Feature                        | Alternative                               |
| ------- | ----------------------------------------- | ----------------------------------------- |
| 10.x    | `HttpException.getResponse()` return type | Use type assertion or specific exceptions |
| 9.x     | `FastifyAdapter` default arguments        | Explicitly provide options                |
| 8.x     | `forwardRef()` without factory            | Use factory for lazy evaluation           |
| 7.x     | `@Inject()` without token                 | Always provide a token                    |

## Compatibility with Popular Libraries

| Library  | NestJS 10.x | NestJS 9.x | Notes                      |
| -------- | ----------- | ---------- | -------------------------- |
| TypeORM  | ✅ 0.3.x+   | ✅ 0.3.x+  | Issues with older versions |
| Mongoose | ✅ 7.x+     | ✅ 6.x+    | Schema changes in v7       |
| Passport | ✅ 0.6.x+   | ✅ 0.5.x+  | Strategy interface changes |
| GraphQL  | ✅ 16.x+    | ✅ 15.x+   | Breaking changes in v16    |
| Swagger  | ✅ 6.x+     | ✅ 5.x+    | API changes in v6          |

## Experimental Features

NestJS regularly introduces experimental features that may change in future releases:

-   **NestJS 10.x**: Enhanced modular reloading
-   **NestJS 9.x**: Resource tokens
-   **NestJS 8.x**: Hybrid application support

Use experimental features with caution in production applications.

## Community Resources

-   [Official NestJS Documentation](https://docs.nestjs.com/)
-   [NestJS GitHub Repository](https://github.com/nestjs/nest)
-   [NestJS Discord Community](https://discord.gg/nestjs)
-   [NestJS Blog](https://trilon.io/blog/)
