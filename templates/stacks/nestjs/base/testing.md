---
description: Testing guidelines for NestJS applications
globs: <root>/**/*.spec.ts
alwaysApply: false
---

# Testing in NestJS

This document covers the core testing concepts and best practices for NestJS applications.

## Types of Tests

NestJS supports three main categories of tests:

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test how components work together
3. **End-to-End (E2E) Tests** - Test the entire application flow

## Testing Setup

NestJS comes with Jest as the default testing framework. The testing configuration is automatically set up in new projects with:

-   `jest.config.js` - Main Jest configuration
-   `.spec.ts` files for unit/integration tests
-   `.e2e-spec.ts` files for end-to-end tests

## Unit Testing

Unit tests focus on testing individual components (services, pipes, etc.) in isolation.

### Testing Services

```typescript
// cats.service.ts
@Injectable()
export class CatsService {
	private cats: Cat[] = [];

	create(cat: Cat) {
		this.cats.push(cat);
		return cat;
	}

	findAll() {
		return this.cats;
	}
}

// cats.service.spec.ts
describe('CatsService', () => {
	let service: CatsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CatsService],
		}).compile();

		service = module.get<CatsService>(CatsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create a cat', () => {
		const cat = { name: 'Test Cat', age: 3, breed: 'Test Breed' };
		expect(service.create(cat)).toEqual(cat);
		expect(service.findAll()).toContain(cat);
	});
});
```

### Testing with Mocks

Using the `@nestjs/testing` module's `Test.createTestingModule()` with mocks:

```typescript
describe('CatsService', () => {
	let service: CatsService;
	let repositoryMock: MockType<Repository<Cat>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CatsService,
				{
					provide: getRepositoryToken(Cat),
					useFactory: repositoryMockFactory,
				},
			],
		}).compile();

		service = module.get<CatsService>(CatsService);
		repositoryMock = module.get(getRepositoryToken(Cat));
	});

	it('should find all cats', async () => {
		const cats = [{ name: 'Test Cat' }];
		repositoryMock.find.mockReturnValue(cats);

		expect(await service.findAll()).toEqual(cats);
		expect(repositoryMock.find).toHaveBeenCalled();
	});
});

// Mock factory
export type MockType<T> = {
	[P in keyof T]: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
	() => ({
		find: jest.fn(),
		findOne: jest.fn(),
		save: jest.fn(),
		// ...other methods
	})
);
```

### Testing Controllers

```typescript
describe('CatsController', () => {
	let controller: CatsController;
	let service: CatsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CatsController],
			providers: [
				{
					provide: CatsService,
					useValue: {
						findAll: jest.fn().mockReturnValue([]),
						create: jest
							.fn()
							.mockImplementation((cat) =>
								Promise.resolve({ id: 1, ...cat })
							),
					},
				},
			],
		}).compile();

		controller = module.get<CatsController>(CatsController);
		service = module.get<CatsService>(CatsService);
	});

	it('should get all cats', async () => {
		const result = [{ name: 'Test Cat' }];
		jest.spyOn(service, 'findAll').mockImplementation(() => result);

		expect(await controller.findAll()).toBe(result);
	});
});
```

### Testing Pipes

```typescript
describe('ValidationPipe', () => {
	let pipe: ValidationPipe;

	beforeEach(() => {
		pipe = new ValidationPipe();
	});

	it('should be defined', () => {
		expect(pipe).toBeDefined();
	});

	it('should validate and pass valid data', () => {
		const validData = { name: 'Test Cat', age: 5 };
		const metadata: ArgumentMetadata = {
			type: 'body',
			metatype: CreateCatDto,
			data: '',
		};

		expect(pipe.transform(validData, metadata)).resolves.toEqual(validData);
	});

	it('should throw an exception for invalid data', () => {
		const invalidData = { age: 'not a number' };
		const metadata: ArgumentMetadata = {
			type: 'body',
			metatype: CreateCatDto,
			data: '',
		};

		expect(pipe.transform(invalidData, metadata)).rejects.toThrow(
			BadRequestException
		);
	});
});
```

### Testing Guards

```typescript
describe('AuthGuard', () => {
	let guard: AuthGuard;
	let jwtService: JwtService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthGuard,
				{
					provide: JwtService,
					useValue: {
						verify: jest.fn(),
					},
				},
			],
		}).compile();

		guard = module.get<AuthGuard>(AuthGuard);
		jwtService = module.get<JwtService>(JwtService);
	});

	it('should be defined', () => {
		expect(guard).toBeDefined();
	});

	it('should return true for valid token', () => {
		const context = createMock<ExecutionContext>();
		const request = {
			headers: {
				authorization: 'Bearer valid-token',
			},
		};

		context.switchToHttp().getRequest.mockReturnValue(request);
		jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: 1 });

		expect(guard.canActivate(context)).toBe(true);
		expect(request).toHaveProperty('user');
	});
});
```

## Integration Testing

Integration tests verify how components work together.

```typescript
describe('Cats Integration', () => {
	let app: INestApplication;
	let catsService: CatsService;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [CatsModule, DatabaseModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe());
		await app.init();

		catsService = moduleFixture.get<CatsService>(CatsService);
	});

	afterEach(async () => {
		await app.close();
	});

	it('should create a cat', async () => {
		const createSpy = jest.spyOn(catsService, 'create');
		const cat = { name: 'Integration Test Cat', age: 3, breed: 'Test' };

		await request(app.getHttpServer()).post('/cats').send(cat).expect(201);

		expect(createSpy).toHaveBeenCalledWith(expect.objectContaining(cat));
	});
});
```

## End-to-End (E2E) Testing

E2E tests verify the application from end to end, including HTTP requests, database operations, etc.

```typescript
// test/app.e2e-spec.ts
describe('Cats E2E', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe());
		await app.init();

		// Set up test database
		const connection = app.get(Connection);
		await connection.synchronize(true); // Reset database for tests
	});

	afterEach(async () => {
		await app.close();
	});

	it('/GET cats', () => {
		return request(app.getHttpServer())
			.get('/cats')
			.expect(200)
			.expect('Content-Type', /json/);
	});

	it('/POST cats - creates a new cat', () => {
		return request(app.getHttpServer())
			.post('/cats')
			.send({ name: 'E2E Test Cat', age: 5, breed: 'E2E Test' })
			.expect(201)
			.expect((res) => {
				expect(res.body).toHaveProperty('id');
				expect(res.body.name).toEqual('E2E Test Cat');
			});
	});

	it('/POST cats - validation fails with invalid input', () => {
		return request(app.getHttpServer())
			.post('/cats')
			.send({ age: 'not a number' })
			.expect(400);
	});
});
```

## Testing Asynchronous Code

NestJS applications often involve asynchronous operations. Jest provides multiple ways to test asynchronous code:

### Using Async/Await

```typescript
it('should find a cat by id', async () => {
	const result = { id: 1, name: 'Test Cat' };
	jest.spyOn(repository, 'findOne').mockResolvedValue(result);

	expect(await service.findOne(1)).toEqual(result);
});
```

### Using Promises

```typescript
it('should find a cat by id', () => {
	const result = { id: 1, name: 'Test Cat' };
	jest.spyOn(repository, 'findOne').mockResolvedValue(result);

	return service.findOne(1).then((cat) => {
		expect(cat).toEqual(result);
	});
});
```

## Test Coverage

NestJS's Jest configuration includes coverage reports. Run:

```bash
npm test -- --coverage
```

This generates a coverage report in the `coverage` directory.

## Test Organization

A well-organized test suite improves maintainability:

```typescript
describe('CatsService', () => {
	let service: CatsService;
	let repository: Repository<Cat>;

	beforeAll(async () => {
		// One-time setup (database connection, etc.)
	});

	beforeEach(async () => {
		// Setup for each test
	});

	afterEach(() => {
		// Cleanup after each test
		jest.clearAllMocks();
	});

	afterAll(async () => {
		// One-time cleanup
	});

	// Group related tests
	describe('create', () => {
		it('should create a cat', async () => {
			// Test implementation
		});

		it('should throw an error if cat exists', async () => {
			// Test implementation
		});
	});

	describe('findAll', () => {
		it('should return all cats', async () => {
			// Test implementation
		});

		it('should return an empty array if no cats', async () => {
			// Test implementation
		});
	});
});
```

## Testing with Databases

For tests involving databases:

1. **Use In-Memory Databases**: For faster tests
2. **Separate Test Database**: Don't use your development database
3. **Reset Between Tests**: Clear data between tests for isolation

```typescript
// typeorm-testing.module.ts
@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'sqlite',
			database: ':memory:',
			entities: [Cat],
			synchronize: true,
		}),
		TypeOrmModule.forFeature([Cat]),
	],
	exports: [TypeOrmModule],
})
export class TypeOrmTestingModule {}

// Use in tests
beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TypeOrmTestingModule],
		providers: [CatsService],
	}).compile();

	// ...
});
```

## Test Doubles

Different types of test doubles for different scenarios:

1. **Spy**: Watches function calls without changing behavior
2. **Stub**: Provides pre-defined responses
3. **Mock**: Pre-programmed with expectations
4. **Fake**: Simplified implementation of a component

```typescript
// Spy example
const findAllSpy = jest.spyOn(service, 'findAll');
await service.findAll();
expect(findAllSpy).toHaveBeenCalled();

// Stub example
jest.spyOn(repository, 'find').mockReturnValue([{ name: 'Test Cat' }]);

// Mock example
const mockRepository = {
	find: jest.fn().mockReturnValue([{ name: 'Test Cat' }]),
	findOne: jest.fn().mockReturnValue({ name: 'Test Cat' }),
	save: jest
		.fn()
		.mockImplementation((cat) => Promise.resolve({ id: 1, ...cat })),
};

// Fake example
class FakeAuthService {
	async validateUser(username: string, password: string) {
		if (username === 'test' && password === 'test') {
			return { id: 1, username: 'test' };
		}
		return null;
	}
}
```

## Best Practices

1. **Test in Isolation**: Avoid dependencies between tests
2. **Mock External Services**: Don't rely on external APIs in tests
3. **Keep Tests Fast**: Slow tests slow down development
4. **Test Behavior, Not Implementation**: Focus on what, not how
5. **Clear Setup/Teardown**: Each test should start with a clean environment
6. **Avoid Test-Private Methods**: Only test public interfaces
7. **Descriptive Test Names**: Tests should document functionality
