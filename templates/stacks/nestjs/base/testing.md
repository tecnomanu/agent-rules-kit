---
description: Comprehensive testing strategies, types (Unit, Integration, E2E), tools (Jest, Supertest), and best practices for NestJS applications.
globs: <root>/src/**/*.spec.ts,<root>/test/**/*.e2e-spec.ts
alwaysApply: true
---

# Prácticas de Testing en NestJS

## Principios Generales

-   **Test Driven Development (TDD)**: Desarrollar tests antes que el código cuando sea posible.
-   **Tests Automatizados**: Cada funcionalidad debe estar cubierta por tests automatizados.
-   **Cobertura**: Aspirar a una cobertura de código del 80% o superior.
-   **Aislamiento**: Los tests deben poder ejecutarse de manera independiente.
-   **Determinismo**: Los tests deben producir resultados consistentes en cada ejecución.

## Tipos de Tests en NestJS

### Tests Unitarios

-   Ubicación: archivos `*.spec.ts` junto a los archivos que prueban
-   Probar funciones y métodos de forma aislada
-   Usar `jest.mock()` para dependencias
-   No deben acceder a recursos externos (DB, API, etc.)

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository'; // Assuming this is a custom repository interface/class

describe('UserService', () => {
	let service: UserService;
	let repository: UserRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository, // Or getRepositoryToken(UserEntity) if using TypeORM
					useValue: { // Provide mock methods
						findById: jest.fn(),
						create: jest.fn(),
						// Add other methods used by UserService here
					},
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		repository = module.get<UserRepository>(UserRepository); // Or getRepositoryToken(UserEntity)
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findById', () => { // Corrected method name to match example
		it('should return a user by id', async () => {
			const userId = '1';
			const expectedUser = { id: userId, name: 'Test User', email: 'test@example.com' }; // Example user
			// Ensure the spy is on the correct method name as defined in your repository
			jest.spyOn(repository, 'findById').mockResolvedValue(expectedUser as any); 

			const result = await service.findById(userId);

			expect(result).toEqual(expectedUser);
			expect(repository.findById).toHaveBeenCalledWith(userId);
		});

		// Add test for user not found
		it('should throw an error if user not found', async () => {
			const userId = 'nonexistent';
			jest.spyOn(repository, 'findById').mockResolvedValue(null);
			// Or mockRejectedValue(new NotFoundException()) if your service handles it that way

			await expect(service.findById(userId)).rejects.toThrow(); // Or specific NestJS NotFoundException
		});
	});

	// Add more describe blocks for other service methods like 'create', 'update', etc.
});
```

### Tests de Integración

-   Ubicación: archivo `*.spec.ts` junto a los archivos que prueban (controllers, modules)
-   Probar la interacción entre múltiples componentes (e.g., Controller -> Service -> Repository)
-   Usar el `Test.createTestingModule()` de NestJS para instanciar un subconjunto de la aplicación.
-   Mocks pueden ser usados para capas externas (e.g. base de datos, APIs externas) o para servicios no directamente bajo prueba.

```typescript
// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity'; // Assuming an entity

describe('UsersController', () => {
	let controller: UsersController;
	let service: UsersService;

	const mockUser: User = {
		id: '1',
		name: 'Test User',
		email: 'test@example.com',
		password: 'hashedPassword', // Usually password is not returned
		// Add other properties as in your User entity
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: { // Mock implementation of UsersService
						create: jest.fn().mockResolvedValue(mockUser),
						findAll: jest.fn().mockResolvedValue([mockUser]),
						findOne: jest.fn().mockResolvedValue(mockUser),
						// Add other methods used by UsersController
					},
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('create', () => {
		it('should create a new user', async () => {
			const createUserDto: CreateUserDto = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password',
			};
			
			// Service's create method is already mocked to return mockUser
			const result = await controller.create(createUserDto);

			expect(result).toEqual(mockUser);
			expect(service.create).toHaveBeenCalledWith(createUserDto);
		});
	});

	describe('findOne', () => {
		it('should return a single user', async () => {
			const userId = '1';
			// Service's findOne method is already mocked
			const result = await controller.findOne(userId);

			expect(result).toEqual(mockUser);
			expect(service.findOne).toHaveBeenCalledWith(userId);
		});
	});
	
	// Add tests for other controller methods (findAll, update, remove)
});
```

### Tests E2E (End-to-End)

-   Ubicación: directorio `test/` en la raíz del proyecto.
-   Archivos: `*.e2e-spec.ts`.
-   Prueban la aplicación completa, simulando peticiones HTTP reales.
-   Se usa `supertest` para realizar las peticiones HTTP.

```typescript
// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Main application module

describe('UsersController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => { // Use beforeAll for app setup if it's costly
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule], // Import your main app module
		}).compile();

		app = moduleFixture.createNestApplication();
		// Apply global pipes, interceptors, etc., as in your main.ts
		app.useGlobalPipes(new ValidationPipe()); 
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/users (POST) - should create a user', () => {
		return request(app.getHttpServer())
			.post('/users')
			.send({
				name: 'Test User E2E',
				email: 'teste2e@example.com',
				password: 'password123',
			})
			.expect(201) // Check HTTP status code
			.then(response => { // Use .then() for more detailed assertions on the response
				expect(response.body).toHaveProperty('id');
				expect(response.body.name).toEqual('Test User E2E');
				expect(response.body.email).toEqual('teste2e@example.com');
				expect(response.body).not.toHaveProperty('password'); // Ensure password is not returned
			});
	});

	it('/users (GET) - should get all users', async () => {
		// Assuming a user was created by the POST test or in a setup step
		const response = await request(app.getHttpServer())
			.get('/users')
			.expect(200);
		
		expect(Array.isArray(response.body)).toBe(true);
		// Add more assertions if needed, e.g., checking for the previously created user
	});
	
	// Add more E2E tests for other endpoints (GET /users/:id, PATCH /users/:id, DELETE /users/:id)
	// Ensure proper database seeding/cleanup strategies if tests interact with a DB
});
```

## Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests (unitarios e integración por defecto)
npm run test

# Ejecutar tests en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Ejecutar tests y generar reporte de cobertura
npm run test:cov

# Ejecutar tests e2e
npm run test:e2e
```

### Con cada cambio

-   Ejecutar tests específicos por archivo o descripción: `npm run test -- user.service` o `npm run test -t "should return a user"`.
-   Antes de commit/push, ejecutar la suite completa: `npm run test && npm run test:e2e`.
-   Para mayor velocidad durante el desarrollo: `npm run test:watch`.

## Buenas Prácticas

### Organización de Tests

1.  **Estructura AAA**: Arrange (Preparar los datos y mocks), Act (Ejecutar la función/método), Assert (Verificar los resultados).
2.  **Descripción clara**: Usar descripciones claras y concisas en bloques `describe` (para agrupar tests) e `it` (para tests individuales).
3.  **Tests independientes**: Evitar dependencias entre tests. Cada test debe poder ejecutarse de forma aislada y en cualquier orden. Usar `beforeEach` para reseteo.

### Mock de Dependencias

-   **Servicios y Repositorios**:
    ```typescript
    // Mockear un servicio completo
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Mockear un repositorio TypeORM (common pattern)
    // const mockUserRepository = {
    //   find: jest.fn(),
    //   findOne: jest.fn(),
    //   save: jest.fn(),
    //   create: jest.fn(), // TypeORM's create is for entity instance, not DB op
    //   delete: jest.fn(),
    // };
    // En el provider: { provide: getRepositoryToken(User), useValue: mockUserRepository }
    ```
-   **Módulos Externos**: Usar `jest.mock('module-name')` para mockear módulos completos.

### Testing de Excepciones

NestJS usa su sistema de excepciones (`HttpException` y derivadas).
```typescript
it('should throw NotFoundException when user not found', async () => {
  jest.spyOn(repository, 'findById').mockResolvedValue(null); // Assuming findById returns null if not found

  // Test that the service method throws the expected NestJS exception
  await expect(service.findById('nonExistentId')).rejects.toThrow(NotFoundException);
});
```

## CI/CD con GitHub Actions (Ejemplo)

```yaml
name: NestJS CI/CD Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x] # Test on relevant Node versions

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run unit and integration tests
        run: npm run test
      - name: Run E2E tests
        run: npm run test:e2e # Ensure your E2E environment (DB, etc.) is available or mocked
      # Optional: Run coverage check if you have thresholds
      # - name: Check coverage
      #   run: npm run test:cov 
```

## Testing con Bases de Datos

### Uso de Base de Datos en Memoria (SQLite para TypeORM)

Para tests de integración que necesitan una base de datos, SQLite en memoria es una opción rápida.
```typescript
// En un archivo de configuración de TypeORM para tests, e.g., ormconfig.test.ts
// O directamente en el createTestingModule
// TypeOrmModule.forRoot({
//   type: 'sqlite',
//   database: ':memory:',
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Adjust path
//   synchronize: true, // Auto-creates schema, ONLY for testing
//   dropSchema: true, // Drops schema before each test run if needed (via beforeEach)
// }),
```

### Mock de Repositorios TypeORM (getRepositoryToken)

Es la forma más común de testear servicios que dependen de repositorios TypeORM sin golpear una base de datos real.
```typescript
// user.service.spec.ts
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Your TypeORM entity

// ...
const module: TestingModule = await Test.createTestingModule({
  providers: [
    UserService,
    {
      provide: getRepositoryToken(User), // Use this to get the token for User repository
      useValue: { // Provide mock methods for your repository
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        // ...otros métodos que tu servicio utilice
      },
    },
  ],
}).compile();

// repository = module.get<Repository<User>>(getRepositoryToken(User)); // Para obtener la instancia mockeada
```

## Mantenimiento y Mejora Continua

1.  Revisar la cobertura de código regularmente y enfocarse en áreas críticas o complejas.
2.  Refactorizar tests cuando el código fuente cambia para mantenerlos relevantes y legibles.
3.  Educar al equipo sobre buenas prácticas de testing y herramientas disponibles.
4.  Integrar tests en el flujo de trabajo diario y en pipelines de CI/CD.

> Nota: Estas son las prácticas base para testing en NestJS. Adapta estas reglas según las necesidades específicas de tu proyecto en {projectPath}.
```
