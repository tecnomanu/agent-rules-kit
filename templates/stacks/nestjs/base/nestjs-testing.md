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
import { UserRepository } from './user.repository';

describe('UserService', () => {
	let service: UserService;
	let repository: UserRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository,
					useValue: {
						findById: jest.fn(),
						create: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		repository = module.get<UserRepository>(UserRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findUser', () => {
		it('should return a user by id', async () => {
			const userId = '1';
			const expectedUser = { id: userId, name: 'Test User' };
			jest.spyOn(repository, 'findById').mockResolvedValue(expectedUser);

			const result = await service.findById(userId);

			expect(result).toEqual(expectedUser);
			expect(repository.findById).toHaveBeenCalledWith(userId);
		});
	});
});
```

### Tests de Integración

-   Ubicación: archivo `*.spec.ts` junto a los archivos que prueban
-   Probar la interacción entre múltiples componentes
-   Usar el `Test.createTestingModule()` de NestJS

```typescript
// users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
						create: jest.fn(),
						findAll: jest.fn(),
						findOne: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	describe('create', () => {
		it('should create a new user', async () => {
			const createUserDto: CreateUserDto = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'password',
			};

			const expectedResult = { id: '1', ...createUserDto };
			jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

			const result = await controller.create(createUserDto);

			expect(result).toEqual(expectedResult);
			expect(service.create).toHaveBeenCalledWith(createUserDto);
		});
	});
});
```

### Tests E2E (End-to-End)

-   Ubicación: directorio `test/` en la raíz del proyecto
-   Archivos: `*.e2e-spec.ts`
-   Prueban la aplicación completa, simulando peticiones HTTP reales

```typescript
// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('/users (POST)', () => {
		return request(app.getHttpServer())
			.post('/users')
			.send({
				name: 'Test User',
				email: 'test@example.com',
				password: 'password',
			})
			.expect(201)
			.expect((res) => {
				expect(res.body).toHaveProperty('id');
				expect(res.body.name).toEqual('Test User');
				expect(res.body.email).toEqual('test@example.com');
				expect(res.body).not.toHaveProperty('password');
			});
	});
});
```

## Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests con watch mode
npm run test:watch

# Ejecutar tests de cobertura
npm run test:cov

# Ejecutar tests e2e
npm run test:e2e
```

### Con cada cambio

-   Ejecutar tests afectados por el cambio: `npm run test -- users.service`
-   Antes de commit/push, ejecutar la suite completa: `npm run test`
-   Para mayor velocidad: `npm run test:watch`

## Buenas Prácticas

### Organización de Tests

1. **Estructura AAA**: Arrange (preparar), Act (actuar), Assert (verificar)
2. **Descripción clara**: Usar descripciones claras en bloques `describe` e `it`
3. **Tests independientes**: Evitar dependencias entre tests

### Mock de Dependencias

```typescript
// Mockear un servicio
const mockUserService = {
	findAll: jest.fn(),
	findOne: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	remove: jest.fn(),
};

// Mockear dependencia TypeORM
const mockRepository = {
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	delete: jest.fn(),
};
```

### Testing de Excepciones

```typescript
it('should throw NotFoundException when user not found', async () => {
	jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

	await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
});
```

## CI/CD con GitHub Actions

```yaml
name: NestJS Tests

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    test:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v3
            - name: Use Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '18'
                  cache: 'npm'
            - name: Install dependencies
              run: npm ci
            - name: Run tests
              run: npm run test
            - name: Run e2e tests
              run: npm run test:e2e
            - name: Check coverage
              run: npm run test:cov
```

## Testing con Bases de Datos

### Uso de Base de Datos en Memoria

```typescript
// app.module.ts (configuración para tests)
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    // ...otros imports
  ],
})
```

### Mock de Repositorios TypeORM

```typescript
const module: TestingModule = await Test.createTestingModule({
	providers: [
		UserService,
		{
			provide: getRepositoryToken(User),
			useValue: {
				findOne: jest.fn(),
				save: jest.fn(),
				// ...otros métodos
			},
		},
	],
}).compile();
```

## Mantenimiento y Mejora Continua

1. Revisar la cobertura de código regularmente
2. Refactorizar tests cuando sea necesario
3. Educar al equipo sobre buenas prácticas de testing
4. Integrar tests en el flujo de trabajo diario

> Nota: Estas son las prácticas base para testing en NestJS. Adapta estas reglas según las necesidades específicas de tu proyecto.
