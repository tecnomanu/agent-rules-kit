---
description: Microservices architecture patterns for NestJS applications
globs: <root>/**/*.ts
alwaysApply: false
---

# NestJS Microservices Architecture

This document outlines how to design, implement, and maintain microservices using NestJS.

## Introduction to Microservices

Microservices architecture is an approach to application development where a large application is built as a suite of modular services. Each service:

-   Runs in its own process
-   Communicates via well-defined APIs
-   Is independently deployable
-   Is organized around business capabilities
-   Can be written in different programming languages
-   Can use different data storage technologies

NestJS provides excellent support for implementing microservices with multiple transport layers and communication patterns.

## Project Structure for Microservices

A typical NestJS microservices project uses this structure:

```
project-root/
├── apps/                         # Each microservice is a separate application
│   ├── api-gateway/              # API Gateway
│   │   ├── src/
│   │   │   ├── main.ts           # Main file for API Gateway
│   │   │   ├── app.module.ts     # Main module for API Gateway
│   │   │   └── ...
│   │   ├── test/                 # Tests for API Gateway
│   │   └── tsconfig.json         # TypeScript config for API Gateway
│   ├── users-service/            # Users Microservice
│   │   ├── src/
│   │   │   ├── main.ts           # Main file for Users Service
│   │   │   ├── app.module.ts     # Main module for Users Service
│   │   │   ├── users/            # Users module
│   │   │   └── ...
│   │   ├── test/                 # Tests for Users Service
│   │   └── tsconfig.json         # TypeScript config for Users Service
│   └── products-service/         # Products Microservice
│       ├── src/
│       │   ├── main.ts           # Main file for Products Service
│       │   ├── app.module.ts     # Main module for Products Service
│       │   ├── products/         # Products module
│       │   └── ...
│       ├── test/                 # Tests for Products Service
│       └── tsconfig.json         # TypeScript config for Products Service
├── libs/                         # Shared libraries
│   ├── common/                   # Common code shared between services
│   │   ├── src/
│   │   │   ├── index.ts          # Export all common code
│   │   │   ├── dto/              # Shared DTOs
│   │   │   ├── interfaces/       # Shared interfaces
│   │   │   └── constants/        # Shared constants
│   │   └── tsconfig.json         # TypeScript config for common lib
│   └── database/                 # Database related code
│       ├── src/
│       │   ├── index.ts          # Export all database code
│       │   ├── migrations/       # Database migrations
│       │   └── entities/         # Shared entities
│       └── tsconfig.json         # TypeScript config for database lib
├── nest-cli.json                 # NestJS CLI config
├── package.json                  # Project dependencies
└── tsconfig.json                 # Root TypeScript config
```

## Core Components of NestJS Microservices

### 1. API Gateway

The API Gateway is the entry point for clients:

```typescript
// apps/api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle('API Gateway')
		.setDescription('API Gateway for microservices')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}
bootstrap();
```

The API Gateway module handles communication with microservices:

```typescript
// apps/api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ClientsModule.registerAsync([
			{
				name: 'USERS_SERVICE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.TCP,
					options: {
						host: configService.get('USERS_SERVICE_HOST'),
						port: configService.get('USERS_SERVICE_PORT'),
					},
				}),
				inject: [ConfigService],
			},
			{
				name: 'PRODUCTS_SERVICE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.TCP,
					options: {
						host: configService.get('PRODUCTS_SERVICE_HOST'),
						port: configService.get('PRODUCTS_SERVICE_PORT'),
					},
				}),
				inject: [ConfigService],
			},
		]),
		UsersModule,
		ProductsModule,
	],
})
export class AppModule {}
```

### 2. Microservice Implementation

Each microservice is implemented as a standalone NestJS application:

```typescript
// apps/users-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Set up microservice
	const microservice = app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.TCP,
		options: {
			host: configService.get('HOST'),
			port: configService.get('PORT'),
		},
	});

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	await app.startAllMicroservices();
	await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
```

### 3. Communication Patterns

NestJS supports multiple communication patterns for microservices:

#### Message Patterns (Request-Response)

```typescript
// In the microservice
@Controller()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@MessagePattern({ cmd: 'get_user' })
	getUser(id: string): Promise<User> {
		return this.usersService.findById(id);
	}

	@MessagePattern({ cmd: 'create_user' })
	createUser(createUserDto: CreateUserDto): Promise<User> {
		return this.usersService.create(createUserDto);
	}
}

// In the API Gateway
@Controller('users')
export class UsersController {
	constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

	@Get(':id')
	getUser(@Param('id') id: string): Observable<User> {
		return this.usersClient.send<User>({ cmd: 'get_user' }, id);
	}

	@Post()
	createUser(@Body() createUserDto: CreateUserDto): Observable<User> {
		return this.usersClient.send<User>(
			{ cmd: 'create_user' },
			createUserDto
		);
	}
}
```

#### Event Patterns (Event-Based)

```typescript
// In the microservice
@Controller()
export class UsersController {
	// Handle an event (no response needed)
	@EventPattern('user_created')
	async handleUserCreated(user: User) {
		// Process the event
		await this.notificationService.sendWelcomeEmail(user);
	}
}

// In the API Gateway or another service
@Injectable()
export class UsersService {
	constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

	async createUser(createUserDto: CreateUserDto): Promise<User> {
		// Create the user
		const user = await this.usersRepository.create(createUserDto);

		// Emit an event
		this.usersClient.emit('user_created', user);

		return user;
	}
}
```

## Transport Layer Options

NestJS supports multiple transport layers for microservices:

### TCP Transport

```typescript
// TCP transport configuration
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
	AppModule,
	{
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: 8888,
		},
	}
);
```

### Redis Transport

```typescript
// Redis transport configuration
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
	AppModule,
	{
		transport: Transport.REDIS,
		options: {
			host: 'localhost',
			port: 6379,
		},
	}
);
```

### RabbitMQ Transport

```typescript
// RabbitMQ transport configuration
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
	AppModule,
	{
		transport: Transport.RMQ,
		options: {
			urls: ['amqp://localhost:5672'],
			queue: 'users_queue',
			queueOptions: {
				durable: false,
			},
		},
	}
);
```

### Kafka Transport

```typescript
// Kafka transport configuration
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
	AppModule,
	{
		transport: Transport.KAFKA,
		options: {
			client: {
				brokers: ['localhost:9092'],
			},
			consumer: {
				groupId: 'users-consumer',
			},
		},
	}
);
```

### gRPC Transport

```typescript
// gRPC transport configuration
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
	AppModule,
	{
		transport: Transport.GRPC,
		options: {
			package: 'users',
			protoPath: join(__dirname, 'proto/users.proto'),
		},
	}
);
```

## Hybrid Application

NestJS supports hybrid applications that can act both as HTTP servers and microservices:

```typescript
async function bootstrap() {
	// Create a Nest application
	const app = await NestFactory.create(AppModule);

	// Configure a microservice
	const microservice = app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.TCP,
		options: {
			host: 'localhost',
			port: 8888,
		},
	});

	await app.startAllMicroservices();
	await app.listen(3000);
}
```

## Data Management in Microservices

### Database Per Service Pattern

Each microservice has its own database:

```typescript
// apps/users-service/src/app.module.ts
@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: configService.get('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				entities: [User],
				synchronize: configService.get('NODE_ENV') !== 'production',
			}),
			inject: [ConfigService],
		}),
		UsersModule,
	],
})
export class AppModule {}
```

### Handling Distributed Transactions

For distributed transactions, consider using the Saga pattern:

```typescript
// Example of choreography-based saga
@Injectable()
export class OrderSaga {
	constructor(
		@Inject('PAYMENTS_SERVICE') private paymentsClient: ClientProxy,
		@Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
		private readonly eventEmitter: EventEmitter2
	) {
		// Listen for local events
		this.eventEmitter.on(
			'order.created',
			this.handleOrderCreated.bind(this)
		);

		// Listen for external events
		this.paymentsClient.subscribe(
			'payment.completed',
			this.handlePaymentCompleted.bind(this)
		);
		this.paymentsClient.subscribe(
			'payment.failed',
			this.handlePaymentFailed.bind(this)
		);
		this.inventoryClient.subscribe(
			'inventory.reserved',
			this.handleInventoryReserved.bind(this)
		);
		this.inventoryClient.subscribe(
			'inventory.failed',
			this.handleInventoryFailed.bind(this)
		);
	}

	private handleOrderCreated(order: Order) {
		// Start the saga
		this.paymentsClient.emit('payment.process', {
			orderId: order.id,
			amount: order.total,
			userId: order.userId,
		});
	}

	private handlePaymentCompleted(payload: any) {
		// Continue the saga
		this.inventoryClient.emit('inventory.reserve', {
			orderId: payload.orderId,
			items: payload.items,
		});
	}

	private handlePaymentFailed(payload: any) {
		// Compensating transaction
		this.eventEmitter.emit('order.cancel', payload.orderId);
	}

	private handleInventoryReserved(payload: any) {
		// Complete the saga
		this.eventEmitter.emit('order.confirm', payload.orderId);
	}

	private handleInventoryFailed(payload: any) {
		// Compensating transaction
		this.paymentsClient.emit('payment.refund', {
			orderId: payload.orderId,
		});
		this.eventEmitter.emit('order.cancel', payload.orderId);
	}
}
```

## Service Discovery and Configuration

### Using Nest Config with Environment Variables

```typescript
// apps/users-service/src/app.module.ts
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test')
					.default('development'),
				PORT: Joi.number().default(3001),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().default(5432),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_NAME: Joi.string().required(),
			}),
		}),
		// ...other imports
	],
})
export class AppModule {}
```

### Service Registry Integration (Consul, Eureka)

```typescript
// Service registration with Consul
@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
	private readonly consul: Consul;
	private serviceId: string;

	constructor(private readonly configService: ConfigService) {
		this.consul = new Consul({
			host: this.configService.get('CONSUL_HOST'),
			port: this.configService.get('CONSUL_PORT'),
		});
		this.serviceId = `users-service-${uuid.v4()}`;
	}

	async onModuleInit() {
		await this.registerService();
	}

	async onModuleDestroy() {
		await this.deregisterService();
	}

	private async registerService() {
		const serviceOptions = {
			id: this.serviceId,
			name: 'users-service',
			address: this.configService.get('HOST'),
			port: this.configService.get('PORT'),
			tags: ['users', 'microservice'],
			check: {
				http: `http://${this.configService.get(
					'HOST'
				)}:${this.configService.get('PORT')}/health`,
				interval: '15s',
			},
		};

		return this.consul.agent.service.register(serviceOptions);
	}

	private async deregisterService() {
		return this.consul.agent.service.deregister(this.serviceId);
	}
}
```

## Authentication and Authorization

### JWT Authentication Across Microservices

```typescript
// apps/api-gateway/src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: any) {
		return {
			userId: payload.sub,
			username: payload.username,
			roles: payload.roles,
		};
	}
}

// Protecting routes in API Gateway
@Controller('users')
export class UsersController {
	constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	getProfile(@Request() req) {
		return this.usersClient.send({ cmd: 'get_user' }, req.user.userId);
	}
}

// Forwarding user context to microservices
@Injectable()
export class AuthenticatedGuard implements CanActivate {
	constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			// Verify token with auth service
			const user = await this.authClient
				.send({ cmd: 'verify_token' }, { token })
				.pipe(
					timeout(5000),
					catchError(() => {
						throw new UnauthorizedException();
					})
				)
				.toPromise();

			// Attach user to request
			request.user = user;
			return true;
		} catch {
			throw new UnauthorizedException();
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
```

## Error Handling

### Global Exception Filter

```typescript
// apps/shared/filters/rpc-exception.filter.ts
@Catch()
export class RpcExceptionFilter implements RpcExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();
			message =
				typeof exceptionResponse === 'object' &&
				'message' in exceptionResponse
					? exceptionResponse.message
					: exception.message;
		}

		response.status(status).json({
			statusCode: status,
			message,
			timestamp: new Date().toISOString(),
		});

		return throwError(() => exception);
	}
}

// Using the filter in a controller
@Controller('users')
@UseFilters(new RpcExceptionFilter())
export class UsersController {
	// ...
}
```

### Timeout and Retry Strategies

```typescript
// Timeout and retry for client calls
@Controller('users')
export class UsersController {
	constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

	@Get(':id')
	getUser(@Param('id') id: string): Observable<User> {
		return this.usersClient.send<User>({ cmd: 'get_user' }, id).pipe(
			timeout(5000),
			retry(3),
			catchError((error) => {
				if (error instanceof TimeoutError) {
					throw new ServiceUnavailableException(
						'Users service is not responding'
					);
				}
				throw new InternalServerErrorException(
					'An error occurred while fetching the user'
				);
			})
		);
	}
}
```

## Testing Microservices

### Unit Testing

```typescript
// apps/users-service/src/users/users.controller.spec.ts
describe('UsersController', () => {
	let controller: UsersController;
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: {
						findById: jest.fn(),
						create: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	describe('getUser', () => {
		it('should return a user', async () => {
			const user = { id: '1', name: 'Test User' };
			jest.spyOn(service, 'findById').mockResolvedValue(user);

			expect(await controller.getUser('1')).toBe(user);
			expect(service.findById).toHaveBeenCalledWith('1');
		});
	});
});
```

### Integration Testing

```typescript
// apps/users-service/test/users.e2e-spec.ts
describe('Users Microservice (e2e)', () => {
	let app: INestApplication;
	let client: ClientProxy;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				ClientsModule.register([
					{
						name: 'USERS_SERVICE',
						transport: Transport.TCP,
						options: { host: 'localhost', port: 3001 },
					},
				]),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.connectMicroservice<MicroserviceOptions>({
			transport: Transport.TCP,
			options: { host: 'localhost', port: 3001 },
		});

		await app.startAllMicroservices();
		await app.init();

		client = app.get<ClientProxy>('USERS_SERVICE');
		await client.connect();
	});

	afterEach(async () => {
		await client.close();
		await app.close();
	});

	it('should create a user', async () => {
		const createUserDto = { name: 'Test User', email: 'test@example.com' };

		return client
			.send<any>({ cmd: 'create_user' }, createUserDto)
			.pipe(
				tap((response) => {
					expect(response).toHaveProperty('id');
					expect(response.name).toBe(createUserDto.name);
					expect(response.email).toBe(createUserDto.email);
				})
			)
			.toPromise();
	});
});
```

## Deployment Considerations

### Docker Containerization

```dockerfile
# Example Dockerfile for a microservice
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build users-service

FROM node:18-alpine As production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=development /usr/src/app/dist/apps/users-service ./dist

CMD ["node", "dist/main"]
```

### Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
    api-gateway:
        build:
            context: .
            dockerfile: ./apps/api-gateway/Dockerfile
        ports:
            - '3000:3000'
        env_file:
            - ./apps/api-gateway/.env
        depends_on:
            - users-service
            - products-service

    users-service:
        build:
            context: .
            dockerfile: ./apps/users-service/Dockerfile
        ports:
            - '3001:3001'
        env_file:
            - ./apps/users-service/.env
        depends_on:
            - users-db

    products-service:
        build:
            context: .
            dockerfile: ./apps/products-service/Dockerfile
        ports:
            - '3002:3002'
        env_file:
            - ./apps/products-service/.env
        depends_on:
            - products-db

    users-db:
        image: postgres:14-alpine
        environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: users
        volumes:
            - users_data:/var/lib/postgresql/data

    products-db:
        image: postgres:14-alpine
        environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
            POSTGRES_DB: products
        volumes:
            - products_data:/var/lib/postgresql/data

volumes:
    users_data:
    products_data:
```

### Kubernetes Deployment

```yaml
# users-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: users-service
spec:
    replicas: 3
    selector:
        matchLabels:
            app: users-service
    template:
        metadata:
            labels:
                app: users-service
        spec:
            containers:
                - name: users-service
                  image: your-registry/users-service:latest
                  ports:
                      - containerPort: 3001
                  env:
                      - name: NODE_ENV
                        value: 'production'
                      - name: PORT
                        value: '3001'
                      - name: DB_HOST
                        valueFrom:
                            configMapKeyRef:
                                name: users-service-config
                                key: db_host
                  # Other environment variables...
                  resources:
                      limits:
                          cpu: '500m'
                          memory: '512Mi'
                      requests:
                          cpu: '200m'
                          memory: '256Mi'
                  livenessProbe:
                      httpGet:
                          path: /health
                          port: 3001
                      initialDelaySeconds: 30
                      periodSeconds: 10
                  readinessProbe:
                      httpGet:
                          path: /health/ready
                          port: 3001
                      initialDelaySeconds: 5
                      periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
    name: users-service
spec:
    selector:
        app: users-service
    ports:
        - port: 3001
          targetPort: 3001
    type: ClusterIP
```

## Monitoring and Observability

### Health Checks

```typescript
// apps/users-service/src/health/health.controller.ts
@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: TypeOrmHealthIndicator,
		private memory: MemoryHealthIndicator
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([
			// Database health check
			() => this.db.pingCheck('database'),
			// Memory health check
			() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
		]);
	}

	@Get('ready')
	@HealthCheck()
	checkReadiness() {
		return this.health.check([
			// Additional readiness checks specific to this service
		]);
	}
}
```

### Distributed Tracing

```typescript
// apps/users-service/src/tracing.ts
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function setupTracing() {
	const exporter = new JaegerExporter({
		endpoint:
			process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
	});

	const provider = new NodeTracerProvider({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: 'users-service',
		}),
	});

	provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
	provider.register();

	registerInstrumentations({
		instrumentations: [
			new HttpInstrumentation(),
			new ExpressInstrumentation(),
			new NestInstrumentation(),
		],
	});
}

// In main.ts
import { setupTracing } from './tracing';

async function bootstrap() {
	setupTracing();
	// ...rest of bootstrap function
}
```

## Best Practices

1. **Define Clear Service Boundaries**: Each microservice should have a well-defined domain and responsibility
2. **Use Event-Driven Communication**: Prefer event-driven communication for loose coupling
3. **Design for Failure**: Implement circuit breakers, retries, and timeouts
4. **Maintain API Contracts**: Use DTOs to define clear contracts between services
5. **Implement Proper Logging**: Use structured logging with correlation IDs
6. **Use Health Checks**: Include health checks for monitoring and deployments
7. **Implement Graceful Shutdown**: Handle termination signals properly
8. **Keep Services Stateless**: Avoid storing state in memory
9. **Use CI/CD Pipelines**: Automate testing and deployment
10. **Apply Monitoring and Tracing**: Use tools like Prometheus, Grafana, and Jaeger

## Anti-patterns to Avoid

1. **Shared Databases**: Avoid sharing databases between services
2. **Chatty Communication**: Minimize inter-service communication
3. **Distributed Monolith**: Don't create tightly coupled microservices
4. **Ignoring Network Latency**: Always consider network unreliability
5. **Inadequate Monitoring**: Implement comprehensive monitoring from the start
6. **Direct Client-to-Microservice Communication**: Use API Gateway or BFF pattern
7. **Synchronous Coupling**: Avoid synchronous dependencies between services
8. **Lack of Automated Testing**: Build comprehensive test suites
9. **Complex Deployment Pipelines**: Keep deployment simple
10. **Premature Decomposition**: Don't create microservices without clear boundaries
