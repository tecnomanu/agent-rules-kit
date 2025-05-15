---
description: Implementation guide for NestJS 9.x applications
globs: <root>/**/*.ts
alwaysApply: false
---

# NestJS 9.x Implementation Guide

This document provides specific guidance for developing applications with NestJS 9.x.

## Key Features in NestJS 9.x

NestJS 9.x, released in June 2022, introduced several important features and improvements:

1. **Authentication Enhancements**
2. **Standalone Applications**
3. **Serve Static Enhancement**
4. **Apollo Federation 2.0 Support**
5. **CLI Plugin System**
6. **Logger Update**
7. **Payload Size Limits**

## Setting Up a NestJS 9.x Project

### Installation

```bash
npm i -g @nestjs/cli@9
nest new project-name
```

### Project Configuration

NestJS 9.x projects use the following configuration files:

-   `nest-cli.json` - NestJS CLI configuration
-   `tsconfig.json` - TypeScript configuration
-   `package.json` - Project dependencies

Example `tsconfig.json` for NestJS 9.x:

```json
{
	"compilerOptions": {
		"module": "commonjs",
		"declaration": true,
		"removeComments": true,
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true,
		"allowSyntheticDefaultImports": true,
		"target": "es2017",
		"sourceMap": true,
		"outDir": "./dist",
		"baseUrl": "./",
		"incremental": true,
		"skipLibCheck": true,
		"strictNullChecks": false,
		"noImplicitAny": false,
		"strictBindCallApply": false,
		"forceConsistentCasingInFileNames": false,
		"noFallthroughCasesInSwitch": false
	}
}
```

## Authentication Enhancements

NestJS 9.x introduced improvements to authentication mechanisms:

### JWT Authentication Implementation

```typescript
// auth.module.ts
@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: configService.get<string>(
						'JWT_EXPIRES_IN',
						'1d'
					),
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}

// jwt.strategy.ts
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
		return {
			userId: payload.sub,
			email: payload.email,
			roles: payload.roles,
		};
	}
}

// auth.service.ts
@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: any) {
		const payload = { email: user.email, sub: user.id, roles: user.roles };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
```

## Standalone Application Support

NestJS 9.x improved support for standalone applications, which are useful for serverless environments:

```typescript
// standalone.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Create a standalone application context
async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// Get a service from the container
	const service = app.get(AppService);

	// Use the service
	await service.performTask();

	// Close the application when done
	await app.close();
}
bootstrap();
```

## Apollo Federation 2.0 Support

NestJS 9.x added support for Apollo Federation 2.0:

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
						{ name: 'users', url: 'http://localhost:3001/graphql' },
						{ name: 'posts', url: 'http://localhost:3002/graphql' },
					],
				}),
			},
		}),
	],
})
export class AppModule {}

// users.resolver.ts (in users subgraph)
@Resolver('User')
export class UsersResolver {
	constructor(private usersService: UsersService) {}

	@Query('users')
	async getUsers() {
		return this.usersService.findAll();
	}

	@ResolveReference()
	resolveReference(reference: { __typename: string; id: string }) {
		return this.usersService.findById(reference.id);
	}
}
```

## Logger Update

NestJS 9.x introduced an improved logger with a different timestamp format:

```typescript
// main.ts
async function bootstrap() {
	// Create a custom logger instance
	const logger = new Logger('Bootstrap');

	// Create the application with custom logger
	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'log', 'debug', 'verbose'],
	});

	// Use the logger
	logger.log('Application starting up...');

	await app.listen(3000);
	logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

// custom-logger.service.ts
@Injectable()
export class CustomLoggerService implements LoggerService {
	private context?: string;
	private logger = new Logger();

	constructor(context?: string) {
		this.context = context;
	}

	log(message: any, context?: string) {
		this.logger.log(message, context || this.context);
	}

	error(message: any, trace?: string, context?: string) {
		this.logger.error(message, trace, context || this.context);
	}

	warn(message: any, context?: string) {
		this.logger.warn(message, context || this.context);
	}

	debug(message: any, context?: string) {
		this.logger.debug(message, context || this.context);
	}

	verbose(message: any, context?: string) {
		this.logger.verbose(message, context || this.context);
	}
}
```

## Payload Size Limits

NestJS 9.x improved control over HTTP request size limits:

```typescript
// main.ts
import { json, urlencoded } from 'express';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Configure body parser with size limits
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ limit: '50mb', extended: true }));

	await app.listen(3000);
}
bootstrap();
```

## CLI Plugin System

NestJS 9.x enhanced the CLI plugin system:

```bash
# Create a custom CLI plugin
nest generate resource users
```

Custom CLI plugins can be created:

```typescript
// my-plugin.js
module.exports = {
	name: 'my-plugin',
	description: 'A custom plugin for NestJS CLI',
	exec: async (args, options) => {
		// Plugin logic here
		console.log('Executing my custom plugin!');
		// Generate files, etc.
	},
};
```

## Using Interceptors

NestJS 9.x improved interceptor handling:

```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    console.log(`[${method}] ${url} - ${new Date().toLocaleTimeString()}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`[${method}] ${url} - Completed in ${Date.now() - now}ms`)),
      );
  }
}

// app.module.ts
@Module({
  imports: [...],
  controllers: [...],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

## Enhanced Exception Handling

NestJS 9.x has improved exception handling:

```typescript
// http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const timestamp = new Date().toLocaleTimeString(); // Updated timestamp format

		const exceptionResponse = exception.getResponse();

		const errorResponse = {
			statusCode: status,
			timestamp,
			path: request.url,
			method: request.method,
			message:
				typeof exceptionResponse === 'object' &&
				'message' in exceptionResponse
					? exceptionResponse.message
					: exception.message,
		};

		response.status(status).json(errorResponse);
	}
}
```

## Serving Static Files

NestJS 9.x enhanced the serve-static functionality:

```typescript
// app.module.ts
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
			serveRoot: '/static',
			serveStaticOptions: {
				index: false,
				maxAge: '1d',
				etag: true,
				dotfiles: 'ignore',
			},
		}),
	],
})
export class AppModule {}
```

## Database Integration

NestJS 9.x works well with TypeORM and other database libraries:

```typescript
// app.module.ts
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: configService.get('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_DATABASE'),
				entities: [User, Profile, Post],
				synchronize: configService.get('NODE_ENV') !== 'production',
				logging: configService.get('DB_LOGGING') === 'true',
				ssl:
					configService.get('DB_SSL') === 'true'
						? {
								rejectUnauthorized: false,
						  }
						: undefined,
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}
```

## Swagger Documentation

NestJS 9.x has improved OpenAPI documentation support:

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Swagger setup
	const config = new DocumentBuilder()
		.setTitle('NestJS API')
		.setDescription('The NestJS API description')
		.setVersion('1.0')
		.addTag('nestjs')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}
bootstrap();

// user.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@ApiProperty({
		example: 'john.doe@example.com',
		description: 'The email of the user',
	})
	email: string;

	@ApiProperty({ example: 'John', description: 'The first name of the user' })
	firstName: string;

	@ApiProperty({ example: 'Doe', description: 'The last name of the user' })
	lastName: string;

	@ApiProperty({
		example: 'password123',
		description: 'The password of the user',
	})
	password: string;
}
```

## Testing in NestJS 9.x

NestJS 9.x has improved testing support:

```typescript
// users.service.spec.ts
describe('UsersService', () => {
	let service: UsersService;
	let repository: Repository<User>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useClass: MockRepository,
				},
			],
		}).compile();

		service = moduleRef.get<UsersService>(UsersService);
		repository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
	});

	describe('findAll', () => {
		it('should return an array of users', async () => {
			const users = [{ id: 1, name: 'Test User' }];
			jest.spyOn(repository, 'find').mockResolvedValue(users);

			expect(await service.findAll()).toBe(users);
		});
	});
});

// users.controller.e2e-spec.ts
describe('UsersController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/GET users', () => {
		return request(app.getHttpServer())
			.get('/users')
			.expect(200)
			.expect('Content-Type', /json/);
	});

	afterAll(async () => {
		await app.close();
	});
});
```

## Caching

NestJS 9.x improved the caching mechanism:

```typescript
// app.module.ts
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get('REDIS_HOST'),
				port: configService.get('REDIS_PORT'),
				ttl: 60, // seconds
			}),
			inject: [ConfigService],
		}),
	],
})
export class AppModule {}

// users.controller.ts
@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private cacheManager: Cache
	) {}

	@Get()
	@UseInterceptors(CacheInterceptor)
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		// Try to get from cache first
		const cachedUser = await this.cacheManager.get(`user_${id}`);
		if (cachedUser) {
			return cachedUser;
		}

		// If not in cache, get from service and cache it
		const user = await this.usersService.findOne(id);
		await this.cacheManager.set(`user_${id}`, user, { ttl: 300 });
		return user;
	}
}
```

## Versioning

NestJS 9.x supports API versioning:

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable versioning
	app.enableVersioning({
		type: VersioningType.URI,
		// Options: URI, HEADER, MEDIA_TYPE, CUSTOM
	});

	await app.listen(3000);
}
bootstrap();

// users.controller.ts
@Controller({
	path: 'users',
	version: '1',
})
export class UsersControllerV1 {
	// V1 endpoints
}

@Controller({
	path: 'users',
	version: '2',
})
export class UsersControllerV2 {
	// V2 endpoints with breaking changes
}
```

## Performance Optimization

Tips for optimizing NestJS 9.x applications:

1. **Use Compression**:

    ```typescript
    import * as compression from 'compression';

    async function bootstrap() {
    	const app = await NestFactory.create(AppModule);
    	app.use(compression());
    	await app.listen(3000);
    }
    ```

2. **Enable Response Caching**:

    ```typescript
    @Get()
    @CacheKey('all_users')
    @CacheTTL(30)
    @UseInterceptors(CacheInterceptor)
    findAll() {
      return this.usersService.findAll();
    }
    ```

3. **Use Class Transformer Efficiently**:

    ```typescript
    import { Exclude, Expose, Transform } from 'class-transformer';

    export class UserDto {
    	@Expose()
    	id: number;

    	@Expose()
    	name: string;

    	@Exclude()
    	password: string;

    	@Expose()
    	@Transform(({ value }) => value.toISOString())
    	createdAt: Date;
    }
    ```

## Securing NestJS 9.x Applications

Best practices for securing NestJS 9.x applications:

1. **Set Security Headers**:

    ```typescript
    import * as helmet from 'helmet';

    async function bootstrap() {
    	const app = await NestFactory.create(AppModule);
    	app.use(helmet());
    	await app.listen(3000);
    }
    ```

2. **Enable CORS with Proper Configuration**:

    ```typescript
    async function bootstrap() {
    	const app = await NestFactory.create(AppModule);
    	app.enableCors({
    		origin: ['https://yourdomain.com', 'https://admin.yourdomain.com'],
    		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    		credentials: true,
    	});
    	await app.listen(3000);
    }
    ```

3. **Set Rate Limiting**:

    ```typescript
    import { ThrottlerModule } from '@nestjs/throttler';

    @Module({
    	imports: [
    		ThrottlerModule.forRoot({
    			ttl: 60,
    			limit: 10,
    		}),
    	],
    	providers: [
    		{
    			provide: APP_GUARD,
    			useClass: ThrottlerGuard,
    		},
    	],
    })
    export class AppModule {}
    ```

## Best Practices for NestJS 9.x

1. **Use Module Structure Effectively**:

    - Group related functionality in modules
    - Use feature modules to organize code

2. **Leverage Dependency Injection**:

    - Constructor injection is preferred
    - Use providers properly
    - Understand provider scopes (default, request, transient)

3. **Use DTOs and Validation**:

    - Define clear data transfer objects
    - Use validation pipes
    - Implement serialization/deserialization

4. **Implement Proper Error Handling**:

    - Use exception filters
    - Return consistent error responses
    - Log errors properly

5. **Follow RESTful Conventions**:

    - Use proper HTTP methods
    - Return appropriate status codes
    - Structure API endpoints consistently

6. **Write Testable Code**:
    - Unit test services and controllers
    - Write integration tests
    - Implement e2e tests for critical flows
