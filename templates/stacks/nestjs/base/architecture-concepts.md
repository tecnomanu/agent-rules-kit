---
description: Core architectural concepts for NestJS applications
globs: <root>/**/*.ts
alwaysApply: false
---

# NestJS Architecture Concepts

NestJS is a progressive Node.js framework for building efficient, scalable, and enterprise-grade server-side applications. This document outlines the core architectural concepts of NestJS.

## Fundamental Principles

NestJS is built on the following core principles:

1. **Modularity** - Applications are divided into modules that encapsulate related functionality
2. **Dependency Injection** - Automatic management of dependencies between application components
3. **Decorators** - TypeScript decorators are used to define application metadata
4. **AOP (Aspect-Oriented Programming)** - Cross-cutting concerns handled through interceptors, guards, and middleware
5. **TypeScript First** - Leveraging the full power of TypeScript's static typing system
6. **OOP (Object-Oriented Programming)** - Using classes, interfaces, and inheritance for clean code organization

## Core Building Blocks

### Modules

Modules are the primary organizational unit in NestJS applications:

```typescript
// cats.module.ts
@Module({
	controllers: [CatsController],
	providers: [CatsService],
	exports: [CatsService],
})
export class CatsModule {}

// app.module.ts
@Module({
	imports: [CatsModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
```

Each module:

-   Encapsulates related functionality (controllers, services, etc.)
-   Can import other modules to use their exported providers
-   Can export providers for use by other modules

### Controllers

Controllers handle incoming HTTP requests and return responses:

```typescript
@Controller('cats')
export class CatsController {
	constructor(private catsService: CatsService) {}

	@Get()
	findAll(): Cat[] {
		return this.catsService.findAll();
	}

	@Post()
	@UseGuards(AuthGuard)
	create(@Body() createCatDto: CreateCatDto): Cat {
		return this.catsService.create(createCatDto);
	}
}
```

Key controller concepts:

-   Route path prefix defined at controller level
-   HTTP method decorators map to specific endpoints
-   Parameter decorators extract data from requests
-   Guards, interceptors, and pipes applied at controller or method level

### Providers

Providers are classes annotated with the `@Injectable()` decorator:

```typescript
@Injectable()
export class CatsService {
	private readonly cats: Cat[] = [];

	create(cat: Cat): Cat {
		this.cats.push(cat);
		return cat;
	}

	findAll(): Cat[] {
		return this.cats;
	}
}
```

Providers:

-   Are injected through class constructors
-   Can depend on other providers
-   Are managed by NestJS's IoC (Inversion of Control) container
-   Include services, repositories, factories, and helpers

### Middleware

Middleware functions execute before route handlers:

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		console.log(`Request: ${req.method} ${req.url}`);
		next();
	}
}

@Module({
	imports: [CatsModule],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('cats');
	}
}
```

Middleware functions:

-   Have access to request and response objects
-   Can modify request/response objects
-   Can end the request-response cycle
-   Can call the next middleware function in the stack

### Interceptors

Interceptors provide a way to:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const method = request.method;
		const url = request.url;

		console.log(`[${method}] ${url} - Processing...`);

		const now = Date.now();
		return next
			.handle()
			.pipe(
				tap(() =>
					console.log(
						`[${method}] ${url} - Completed in ${
							Date.now() - now
						}ms`
					)
				)
			);
	}
}
```

Interceptors can:

-   Bind extra logic before/after method execution
-   Transform the result returned from a function
-   Transform exceptions thrown from a function
-   Extend basic function behavior

### Guards

Guards determine whether a request should be handled by the route handler:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.split(' ')[1];

		if (!token) {
			return false;
		}

		try {
			const payload = this.jwtService.verify(token);
			request.user = payload;
			return true;
		} catch (e) {
			return false;
		}
	}
}
```

Guards:

-   Execute before middleware, pipes, interceptors, and route handlers
-   Are ideal for authorization logic
-   Return boolean values indicating whether the request is allowed
-   Can throw exceptions to reject the request with specific error messages

### Pipes

Pipes transform input data or validate it before reaching the route handler:

```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		// Validate the value
		if (!this.isValid(value)) {
			throw new BadRequestException('Validation failed');
		}
		return value;
	}

	private isValid(value: any): boolean {
		// Custom validation logic
		return true;
	}
}
```

Pipes:

-   Transform input data to desired format
-   Validate input data and throw exceptions if validation fails
-   Can be applied globally, controller-wide, or to specific route handlers

### Exception Filters

Exception filters handle exceptions thrown by application code:

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: exception.message,
		});
	}
}
```

Exception filters:

-   Catch exceptions thrown in controllers, services, and other components
-   Transform exceptions into custom response formats
-   Handle specific error types differently

## Architectural Layers

A typical NestJS application has the following layers:

1. **Presentation Layer** (Controllers)

    - Handles HTTP requests and responses
    - Applies data transformation and validation
    - Routes requests to appropriate services

2. **Business Logic Layer** (Services)

    - Implements core business logic
    - Coordinates between multiple repositories if needed
    - Maintains service boundaries and encapsulation

3. **Data Access Layer** (Repositories)

    - Handles database operations
    - Abstracts away data storage details
    - Provides domain entity mapping

4. **Domain Layer** (Entities, DTOs, Interfaces)
    - Defines the core domain models
    - Contains Data Transfer Objects (DTOs) for API contracts
    - Defines domain interfaces and types

## Communication Patterns

NestJS supports several communication patterns:

### Request-Response Pattern

The standard HTTP request-response pattern is implemented using controllers and decorators:

```typescript
@Controller('items')
export class ItemsController {
	@Get(':id')
	findOne(@Param('id') id: string): Promise<Item> {
		// Implementation
	}
}
```

### Event-Driven Architecture

Using the `@nestjs/event-emitter` package:

```typescript
// Emitting events
@Injectable()
export class ItemsService {
	constructor(private eventEmitter: EventEmitter2) {}

	createItem(item: Item): Item {
		// Create item
		this.eventEmitter.emit('item.created', item);
		return item;
	}
}

// Listening to events
@Injectable()
export class ItemEventsListener {
	@OnEvent('item.created')
	handleItemCreatedEvent(item: Item) {
		// Handle event
	}
}
```

### Microservices

NestJS supports multiple microservice transport mechanisms:

```typescript
// Microservice (TCP)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.TCP,
  options: {
    host: '127.0.0.1',
    port: 8888,
  },
});

// HTTP client requesting microservice
@Injectable()
export class ItemsService {
  constructor(@Inject('ITEMS_SERVICE') private client: ClientProxy) {}

  getItems(): Observable<Item[]> {
    return this.client.send<Item[]>({ cmd: 'get_items' }, {});
  }
}

// Microservice handler
@MessagePattern({ cmd: 'get_items' })
getItems(): Item[] {
  return this.itemsService.findAll();
}
```

## CQRS (Command Query Responsibility Segregation)

NestJS provides a `@nestjs/cqrs` module:

```typescript
// Command
export class CreateItemCommand {
	constructor(public readonly item: Item) {}
}

// Command Handler
@CommandHandler(CreateItemCommand)
export class CreateItemHandler implements ICommandHandler<CreateItemCommand> {
	constructor(private repository: ItemRepository) {}

	async execute(command: CreateItemCommand): Promise<void> {
		const { item } = command;
		await this.repository.save(item);
	}
}

// Query
export class GetItemsQuery {}

// Query Handler
@QueryHandler(GetItemsQuery)
export class GetItemsHandler implements IQueryHandler<GetItemsQuery> {
	constructor(private repository: ItemRepository) {}

	async execute(query: GetItemsQuery): Promise<Item[]> {
		return this.repository.findAll();
	}
}
```

CQRS benefits:

-   Separation of read and write operations
-   Better scalability for different workloads
-   Clearer domain boundaries and responsibility separation

## Summary

NestJS provides a robust architectural foundation for building scalable applications:

-   **Modular design** enables code organization and reusability
-   **Dependency injection** encourages loose coupling between components
-   **Decorators and middleware** provide powerful hooks for cross-cutting concerns
-   **Support for multiple architectural patterns** (MVC, CQRS, Event-Driven, Microservices)
-   **TypeScript integration** enables strong typing and better developer experience

These architectural concepts form the foundation for building maintainable, testable, and scalable NestJS applications.
