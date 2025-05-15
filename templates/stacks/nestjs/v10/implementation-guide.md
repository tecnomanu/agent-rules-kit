---
description: Implementation guide for NestJS 10.x applications
globs: <root>/**/*.ts
alwaysApply: false
---

# NestJS 10.x Implementation Guide

This document provides specific guidance for developing applications with NestJS 10.x, released in May 2023.

## Key Features in NestJS 10.x

NestJS 10.x includes several significant enhancements and new features:

1. **ESM Support**: Better support for ECMAScript modules
2. **Node.js 20 Support**: Compatible with the latest Node.js version
3. **TypeScript 5 Support**: Leverages latest TypeScript features
4. **Custom Decorators Enhancement**: Improved parameter decorators
5. **Response Handling**: Enhanced streaming API
6. **WebSocket Gateway Enhancement**: Improved WebSocket implementation
7. **Performance Improvements**: Various optimizations

## Setting Up a NestJS 10.x Project

### Installation

```bash
npm i -g @nestjs/cli@10
nest new project-name
```

### ESM Configuration

NestJS 10.x has improved ESM support. To use ESM:

1. Update `package.json`:

```json
{
	"name": "my-project",
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
		"start:prod": "node dist/main"
	}
}
```

2. Update `tsconfig.json`:

```json
{
	"compilerOptions": {
		"module": "ESNext",
		"moduleResolution": "NodeNext",
		"target": "ES2022",
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
		"strictNullChecks": false,
		"noImplicitAny": false,
		"strictBindCallApply": false,
		"forceConsistentCasingInFileNames": false,
		"noFallthroughCasesInSwitch": false
	}
}
```

3. Update imports in your code:

```typescript
// Using explicit .js extension in ESM imports
import { AppService } from './app.service.js';
```

## TypeScript 5 Features

NestJS 10.x supports TypeScript 5 features:

### Decorators

```typescript
// Using decorators with TypeScript 5
@Controller('users')
export class UsersController {
	// Using enhanced parameter decorators
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		// Implementation
	}
}
```

### Using const Type Parameters

```typescript
// Using const type parameters (TS 5.0)
function getProperty<const T extends object, const K extends keyof T>(
	obj: T,
	key: K
): T[K] {
	return obj[key];
}

const user = { id: 1, name: 'John Doe' };
const name = getProperty(user, 'name'); // Type is 'John Doe'
```

### Using Stable Decorator Metadata API

```typescript
// New TypeScript 5 decorator metadata
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findAll() {
		return this.userService.findAll();
	}
}
```

## Enhanced Parameter Decorators

NestJS 10.x includes improvements to parameter decorators:

```typescript
// Creating a custom parameter decorator
export const User = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;

		// With validation
		if (!user) {
			throw new UnauthorizedException('User not found in request');
		}

		// Return specific data if requested
		return data ? user?.[data] : user;
	}
);

// Using the custom parameter decorator
@Controller('profile')
export class ProfileController {
	@Get()
	@UseGuards(JwtAuthGuard)
	getProfile(@User() user: UserEntity) {
		return user;
	}

	@Get('email')
	@UseGuards(JwtAuthGuard)
	getEmail(@User('email') email: string) {
		return { email };
	}
}
```

## Improved Response Handling

NestJS 10.x has enhanced response handling with improved streaming:

```typescript
// Streaming API example
@Controller('files')
export class FilesController {
	@Get('stream')
	streamFile(@Res() res: Response) {
		const file = createReadStream(join(process.cwd(), 'large-file.txt'));

		// Set proper headers
		res.set({
			'Content-Type': 'text/plain',
			'Content-Disposition': 'attachment; filename="download.txt"',
		});

		// Stream the file
		file.pipe(res);
	}

	@Get('buffer')
	streamBuffer(@Res() res: Response) {
		const buffer = Buffer.from('Hello World'.repeat(1000));

		res.set({
			'Content-Type': 'application/octet-stream',
			'Content-Disposition': 'attachment; filename="buffer.bin"',
			'Content-Length': buffer.length.toString(),
		});

		res.end(buffer);
	}
}
```

## WebSocket Enhancements

NestJS 10.x introduces improvements to WebSocket gateways:

```typescript
// WebSocket gateway implementation
@WebSocketGateway({
	cors: {
		origin: '*',
	},
	namespace: 'chat',
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	private logger = new Logger('ChatGateway');

	@SubscribeMessage('message')
	handleMessage(client: Socket, payload: any): void {
		this.server.emit('message', payload);
	}

	afterInit(server: Server) {
		this.logger.log('WebSocket Gateway initialized');
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
```

## Circular Dependencies Detection

NestJS 10.x has improved circular dependency detection:

```typescript
// Proper circular dependency resolution
// user.service.ts
@Injectable()
export class UserService {
	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService
	) {}

	// Methods
}

// auth.service.ts
@Injectable()
export class AuthService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private userService: UserService
	) {}

	// Methods
}
```

## Performance Optimizations

NestJS 10.x includes several performance improvements:

### Custom Providers for Performance

```typescript
// app.module.ts
@Module({
	imports: [UsersModule, AuthModule],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: 'CACHE_MANAGER',
			useFactory: () => {
				return {
					get: (key: string) => {
						// Optimized get implementation
					},
					set: (key: string, value: any) => {
						// Optimized set implementation
					},
				};
			},
		},
	],
})
export class AppModule {}
```

### Lazy-Loaded Modules

```typescript
// app.module.ts
import { RouterModule } from '@nestjs/core';

@Module({
	imports: [
		RouterModule.register([
			{
				path: 'admin',
				module: AdminModule,
			},
			{
				path: 'users',
				module: UsersModule,
			},
		]),
		AdminModule,
		UsersModule,
	],
})
export class AppModule {}
```

## Working with Environment Variables

NestJS 10.x has enhanced configuration management:

```typescript
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test')
					.default('development'),
				PORT: Joi.number().default(3000),
				DATABASE_URL: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_EXPIRES_IN: Joi.string().default('1d'),
				AWS_REGION: Joi.string().when('NODE_ENV', {
					is: 'production',
					then: Joi.required(),
				}),
			}),
			load: [
				() => ({
					database: {
						url: process.env.DATABASE_URL,
					},
					jwt: {
						secret: process.env.JWT_SECRET,
						expiresIn: process.env.JWT_EXPIRES_IN,
					},
				}),
			],
		}),
		// Other imports
	],
})
export class AppModule {}

// users.service.ts
@Injectable()
export class UsersService {
	constructor(private configService: ConfigService) {
		// Get configuration
		const jwtSecret = this.configService.get<string>('jwt.secret');
		const dbUrl = this.configService.get<string>('database.url');
	}
}
```

## Advanced TypeORM Integration

NestJS 10.x works seamlessly with TypeORM 0.3.x:

```typescript
// app.module.ts
@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				url: configService.get('DATABASE_URL'),
				entities: [User, Profile, Post],
				synchronize: configService.get('NODE_ENV') !== 'production',
				migrations: ['dist/migrations/*.js'],
				migrationsRun:
					configService.get('DB_MIGRATIONS_RUN') === 'true',
				ssl:
					configService.get('NODE_ENV') === 'production'
						? {
								rejectUnauthorized: false,
						  }
						: undefined,
				logging: configService.get('DB_LOGGING') === 'true',
				maxQueryExecutionTime: 1000, // Log queries taking more than 1 second
			}),
		}),
		// Feature modules
	],
})
export class AppModule {}

// entities using TypeORM 0.3.x
@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	@Exclude({ toPlainOnly: true })
	password: string;

	@Column()
	name: string;

	@OneToMany(() => Post, (post) => post.author)
	posts: Post[];

	@OneToOne(() => Profile, (profile) => profile.user)
	profile: Profile;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
```

## GraphQL Integration

NestJS 10.x has improved GraphQL support:

```typescript
// app.module.ts
@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			sortSchema: true,
			playground: process.env.NODE_ENV !== 'production',
			introspection: process.env.NODE_ENV !== 'production',
			context: ({ req }) => ({ req }),
		}),
		// Feature modules
	],
})
export class AppModule {}

// users.resolver.ts
@Resolver(() => User)
export class UsersResolver {
	constructor(private usersService: UsersService) {}

	@Query(() => [User])
	async users(): Promise<User[]> {
		return this.usersService.findAll();
	}

	@Query(() => User)
	async user(@Args('id') id: string): Promise<User> {
		const user = await this.usersService.findById(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	@Mutation(() => User)
	@UseGuards(GqlAuthGuard)
	async createUser(
		@Args('input') createUserInput: CreateUserInput
	): Promise<User> {
		return this.usersService.create(createUserInput);
	}

	@ResolveField(() => [Post])
	async posts(@Parent() user: User): Promise<Post[]> {
		return this.postsService.findByAuthorId(user.id);
	}
}
```

## Dependency Injection Improvements

NestJS 10.x enhances dependency injection with transient and request-scoped providers:

```typescript
// Transient provider (new instance for each consumer)
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
	private context: string;

	setContext(context: string) {
		this.context = context;
	}

	log(message: string) {
		console.log(`[${this.context}] ${message}`);
	}
}

// Request-scoped provider (new instance for each request)
@Injectable({ scope: Scope.REQUEST })
export class RequestService {
	constructor(@Inject(REQUEST) private readonly request: Request) {}

	getUser() {
		return this.request.user;
	}

	getHeaders() {
		return this.request.headers;
	}
}

// Using scoped providers
@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private loggerService: LoggerService,
		private requestService: RequestService
	) {
		this.loggerService.setContext('UsersController');
	}

	@Get()
	findAll() {
		this.loggerService.log('Finding all users');
		// Current user from request-scoped provider
		const currentUser = this.requestService.getUser();
		return this.usersService.findAll();
	}
}
```

## Caching Strategies

NestJS 10.x has improved caching mechanisms:

```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: await redisStore({
					socket: {
						host: configService.get('REDIS_HOST'),
						port: configService.get('REDIS_PORT'),
					},
					ttl: configService.get('CACHE_TTL', 60),
				}),
			}),
			inject: [ConfigService],
		}),
		// Other modules
	],
})
export class AppModule {}

// users.controller.ts
@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	@Get()
	@UseInterceptors(CacheInterceptor)
	@CacheTTL(30) // Override global TTL
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const cacheKey = `user_${id}`;

		// Try to get from cache
		const cachedUser = await this.cacheManager.get(cacheKey);
		if (cachedUser) {
			return cachedUser;
		}

		// Not in cache, fetch from service
		const user = await this.usersService.findOne(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// Store in cache
		await this.cacheManager.set(cacheKey, user, 60 * 5); // 5 minutes

		return user;
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		await this.cacheManager.del(`user_${id}`);
		return this.usersService.remove(id);
	}
}
```

## File Uploads

NestJS 10.x enhances file upload handling:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Configure body parsers with larger limits
	app.use(bodyParser.json({ limit: '50mb' }));
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		})
	);

	await app.listen(3000);
}
bootstrap();

// files.controller.ts
@Controller('files')
export class FilesController {
	constructor(private filesService: FilesService) {}

	@Post('upload')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix =
						Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(
						null,
						`${file.fieldname}-${uniqueSuffix}${extname(
							file.originalname
						)}`
					);
				},
			}),
			fileFilter: (req, file, cb) => {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
					return cb(
						new BadRequestException(
							'Only image files are allowed!'
						),
						false
					);
				}
				cb(null, true);
			},
			limits: {
				fileSize: 5 * 1024 * 1024, // 5MB
			},
		})
	)
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		return this.filesService.saveFile(file);
	}

	@Post('uploads')
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix =
						Date.now() + '-' + Math.round(Math.random() * 1e9);
					cb(
						null,
						`${file.fieldname}-${uniqueSuffix}${extname(
							file.originalname
						)}`
					);
				},
			}),
		})
	)
	uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
		return this.filesService.saveFiles(files);
	}
}
```

## Testing in NestJS 10.x

NestJS 10.x has enhanced testing capabilities:

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

// Mock repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
	find: jest.fn(),
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
});

describe('UsersService', () => {
	let service: UsersService;
	let repository: MockRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: createMockRepository(),
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repository = module.get<MockRepository>(getRepositoryToken(User));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('should return an array of users', async () => {
			const expectedUsers = [
				{ id: '1', name: 'John' },
				{ id: '2', name: 'Jane' },
			];
			repository.find.mockReturnValue(expectedUsers);

			const users = await service.findAll();
			expect(users).toEqual(expectedUsers);
			expect(repository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('create', () => {
		it('should create a new user', async () => {
			const createUserDto = { name: 'John', email: 'john@example.com' };
			const expectedUser = { id: '1', ...createUserDto };

			repository.findOne.mockReturnValue(null);
			repository.create.mockReturnValue(expectedUser);
			repository.save.mockReturnValue(expectedUser);

			const result = await service.create(createUserDto);
			expect(result).toEqual(expectedUser);
			expect(repository.findOne).toHaveBeenCalledWith({
				where: { email: createUserDto.email },
			});
			expect(repository.create).toHaveBeenCalledWith(createUserDto);
			expect(repository.save).toHaveBeenCalledWith(expectedUser);
		});
	});
});

// End-to-end testing
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		// Important: apply the same pipes, filters, etc. as in the main.ts
		app.useGlobalPipes(
			new ValidationPipe({ transform: true, whitelist: true })
		);
		await app.init();
	});

	it('/GET users', () => {
		return request(app.getHttpServer())
			.get('/users')
			.expect(200)
			.expect('Content-Type', /json/)
			.then((response) => {
				expect(Array.isArray(response.body)).toBeTruthy();
			});
	});

	afterAll(async () => {
		await app.close();
	});
});
```

## Securing NestJS 10.x Applications

NestJS 10.x includes enhanced security features:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Security middlewares
	app.use(helmet());
	app.enableCors({
		origin: ['https://yourdomain.com'],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});
	app.use(cookieParser());

	// CSRF protection for production
	if (process.env.NODE_ENV === 'production') {
		app.use(csurf({ cookie: true }));
	}

	// Validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	// Swagger documentation with security
	const config = new DocumentBuilder()
		.setTitle('API Documentation')
		.setDescription('API documentation')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}
bootstrap();

// Rate limiting
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
	imports: [
		ThrottlerModule.forRoot({
			ttl: 60, // seconds
			limit: 10, // 10 requests per minute
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

## Deployment Strategies

Optimizing NestJS 10.x for production deployment:

### Docker Configuration

```dockerfile
# Dockerfile for NestJS 10.x
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# Create a user with restricted permissions
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

# Use the more efficient production settings
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

## Best Practices for NestJS 10.x

1. **Use ESM**: Leverage ESM for better tree-shaking and modern JavaScript features
2. **TypeScript 5 Features**: Utilize the latest TypeScript features
3. **Avoid Circular Dependencies**: Design your modules to avoid circular dependencies
4. **Apply Proper Validation**: Always validate incoming data with class-validator
5. **Implement Proper Error Handling**: Use exception filters and global error handling
6. **Utilize Guards and Interceptors**: Apply guards for authorization and interceptors for cross-cutting concerns
7. **Optimize Database Queries**: Use proper indexing and query optimization
8. **Implement Rate Limiting**: Protect your API from abuse with rate limiting
9. **Use Environment Variables**: Configure your application with environment variables
10. **Write Comprehensive Tests**: Cover your code with unit, integration, and e2e tests
