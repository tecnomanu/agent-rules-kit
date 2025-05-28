---
description: Implementing the Repository Pattern in NestJS for abstracting data access logic, with examples for TypeORM or Mongoose.
globs: <root>/src/**/*.repository.ts,<root>/src/**/*.entity.ts,<root>/src/**/*.service.ts
alwaysApply: true
---

# Repository Pattern in NestJS

This document defines best practices for implementing the Repository pattern in NestJS applications within {projectPath}.

## Purpose

The Repository pattern acts as an abstraction layer between business logic (services) and data access mechanisms, allowing for:

-   **Decoupling**: Separates the data source (database, external API) from the application's business logic. This means your services are not directly tied to a specific ORM (like TypeORM) or ODM (like Mongoose).
-   **Centralized Data Access Logic**: Consolidates all data query and manipulation logic for a specific entity or aggregate root in one place.
-   **Improved Testability**: Facilitates unit testing of services by allowing easy mocking of repositories.
-   **Persistence Agnosticism (to a degree)**: Makes it easier to switch database technologies or ORMs/ODMs with less impact on the business logic layer, as long as the repository interface remains the same.

## Basic Structure

### 1. Repository Interfaces

Define an interface for your repository. This interface dictates the contract that any concrete repository implementation must adhere to. It should be defined in terms of your domain models/entities, not persistence-specific entities if they differ.

```typescript
// src/modules/users/domain/repositories/user.repository.interface.ts
// (Path might vary based on your chosen project structure, e.g., src/users/user.repository.interface.ts)
import { User } from '../model/user.entity'; // Domain entity
import { CreateUserDto } from '../../presentation/rest/dto/create-user.dto'; // Or an application/domain DTO
import { UpdateUserDto } from '../../presentation/rest/dto/update-user.dto'; // Or an application/domain DTO

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY_TOKEN'); // Unique token for DI

export interface UserRepository {
	findAll(): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(userData: CreateUserDto): Promise<User>;
	update(id: string, userData: UpdateUserDto): Promise<User | null>;
	delete(id: string): Promise<boolean>; // Return boolean indicating success
}
```

### 2. Repository Implementation (Example with TypeORM)

Provide a concrete implementation of the interface, specific to your chosen data persistence technology.

```typescript
// src/modules/users/infrastructure/persistence/typeorm/user.typeorm.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { User as UserEntity } from './user.typeorm.entity'; // TypeORM specific entity
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User as UserDomainEntity } from '../../../domain/model/user.entity'; // Domain model
import { CreateUserDto } from '../../../presentation/rest/dto/create-user.dto';
import { UpdateUserDto } from '../../../presentation/rest/dto/update-user.dto';
// import { UserMapper } from './user.mapper'; // Optional: for complex mapping

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
	constructor(
		@InjectRepository(UserEntity)
		private readonly ormRepository: TypeOrmRepository<UserEntity>,
		// private readonly userMapper: UserMapper, // Optional
	) {}

	// Example simple mapper (in real app, use a dedicated mapper class or library if complex)
	private toDomain(entity: UserEntity): UserDomainEntity {
		return { id: entity.id, email: entity.email, name: entity.name /* map other fields */ };
	}

	private toPersistence(domainUser: Partial<UserDomainEntity> | CreateUserDto | UpdateUserDto): Partial<UserEntity> {
		return { ...domainUser }; // Adjust if domain and persistence models differ significantly
	}

	async findAll(): Promise<UserDomainEntity[]> {
		const entities = await this.ormRepository.find();
		return entities.map(this.toDomain);
	}

	async findById(id: string): Promise<UserDomainEntity | null> {
		const entity = await this.ormRepository.findOne({ where: { id } });
		return entity ? this.toDomain(entity) : null;
	}

	async findByEmail(email: string): Promise<UserDomainEntity | null> {
		const entity = await this.ormRepository.findOne({ where: { email } });
		return entity ? this.toDomain(entity) : null;
	}

	async create(userDataDto: CreateUserDto): Promise<UserDomainEntity> {
		const persistenceData = this.toPersistence(userDataDto);
		const newUserEntity = this.ormRepository.create(persistenceData as UserEntity);
		const savedEntity = await this.ormRepository.save(newUserEntity);
		return this.toDomain(savedEntity);
	}

	async update(id: string, userDataDto: UpdateUserDto): Promise<UserDomainEntity | null> {
		const persistenceData = this.toPersistence(userDataDto);
		// Ensure `id` is not part of `persistenceData` if your ORM handles it separately
		// delete persistenceData.id; // If id should not be in the update payload
		await this.ormRepository.update(id, persistenceData as any); // `as any` might be needed for TypeORM partial updates
		const updatedEntity = await this.ormRepository.findOne({ where: { id } });
		return updatedEntity ? this.toDomain(updatedEntity) : null;
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.ormRepository.delete(id);
		return result.affected ? result.affected > 0 : false;
	}
}
```

## Registering Repositories

Register the repository implementation in the relevant NestJS module using the defined token.

```typescript
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User as UserTypeOrmEntity } from './infrastructure/persistence/typeorm/user.typeorm.entity';
import { UsersController } from './presentation/rest/users.controller';
import { UsersService } from './application/users.service';
import { UserTypeOrmRepository } from './infrastructure/persistence/typeorm/user.typeorm.repository';
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.interface';

@Module({
	imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
	controllers: [UsersController],
	providers: [
		UsersService,
		{
			provide: USER_REPOSITORY_TOKEN, // Use the token for providing the repository
			useClass: UserTypeOrmRepository,  // Provide the concrete implementation
		},
	],
	exports: [UsersService, USER_REPOSITORY_TOKEN], // Export if needed by other modules
})
export class UsersModule {}
```

## Using Repositories in Services

Inject the repository interface into your services using the `@Inject()` decorator with the token.

```typescript
// src/modules/users/application/users.service.ts
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../presentation/rest/dto/create-user.dto';
import { UpdateUserDto } from '../presentation/rest/dto/update-user.dto';
import { User } from '../domain/model/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@Inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	async findAll(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}
		return user;
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const existingUser = await this.userRepository.findByEmail(createUserDto.email);
		if (existingUser) {
			throw new ConflictException(`User with email "${createUserDto.email}" already exists.`);
		}
		// Additional business logic for user creation can go here (e.g., hashing password)
		return this.userRepository.create(createUserDto);
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		await this.findOne(id); // Ensures user exists, throws NotFoundException otherwise
		const updatedUser = await this.userRepository.update(id, updateUserDto);
		if (!updatedUser) { // Should ideally not happen if findOne succeeded, but good for robustness
			throw new NotFoundException(`User with ID "${id}" not found after update attempt.`);
		}
		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id); // Ensures user exists
		const success = await this.userRepository.delete(id);
		if (!success) {
			throw new NotFoundException(`User with ID "${id}" could not be deleted.`);
		}
	}
}
```

## Generic Base Repository (Optional)

To reduce boilerplate for common CRUD operations, a generic base repository can be implemented. (See previous translation for an example of `BaseRepository` interface and `TypeOrmBaseRepository` implementation).

## Testing with Mock Repositories

Mocking repositories is straightforward when using interfaces and DI tokens.

```typescript
// src/modules/users/application/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { USER_REPOSITORY_TOKEN, UserRepository } from '../domain/repositories/user.repository.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '../domain/model/user.entity';
import { CreateUserDto } from '../presentation/rest/dto/create-user.dto';

describe('UsersService', () => {
	let service: UsersService;
	let repositoryMock: UserRepository;

	const mockUserRepositoryFactory = (): UserRepository => ({
		findAll: jest.fn(),
		findById: jest.fn(),
		findByEmail: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: USER_REPOSITORY_TOKEN,
					useFactory: mockUserRepositoryFactory,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repositoryMock = module.get<UserRepository>(USER_REPOSITORY_TOKEN);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findOne', () => {
		it('should return a user when user exists', async () => {
			const user: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
			(repositoryMock.findById as jest.Mock).mockResolvedValue(user);

			const result = await service.findOne('1');
			expect(result).toEqual(user);
			expect(repositoryMock.findById).toHaveBeenCalledWith('1');
		});

		it('should throw NotFoundException when user does not exist', async () => {
			(repositoryMock.findById as jest.Mock).mockResolvedValue(null);
			await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
		});
	});
    
    describe('create', () => {
        it('should create and return a user', async () => {
            const createUserDto: CreateUserDto = { name: 'Jane Doe', email: 'jane@example.com', password: 'password' };
            const expectedUser: User = { id: '2', ...createUserDto };
            (repositoryMock.findByEmail as jest.Mock).mockResolvedValue(null);
            (repositoryMock.create as jest.Mock).mockResolvedValue(expectedUser);

            const result = await service.create(createUserDto);
            expect(result).toEqual(expectedUser);
            expect(repositoryMock.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(repositoryMock.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should throw ConflictException if user email already exists', async () => {
            const createUserDto: CreateUserDto = { name: 'Jane Doe', email: 'jane@example.com', password: 'password' };
            const existingUser: User = { id: '1', name: 'Existing User', email: 'jane@example.com' };
            (repositoryMock.findByEmail as jest.Mock).mockResolvedValue(existingUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });
	// ... more tests for update, remove, findAll etc. ...
});
```

## Best Practices

1.  **Clear Method Names**: Use descriptive names for repository operations (e.g., `findActiveUsers`, `findUserByOrderNumber`).
2.  **Repository per Aggregate Root/Entity**: Typically, one repository per aggregate root (in DDD terms) or per main domain entity.
3.  **Interface-Based**: Always define an interface for each repository. This promotes loose coupling and makes mocking for tests much easier.
4.  **No Business Logic**: Repositories should strictly handle data access logic (CRUD operations, querying). Business rules and complex logic belong in services or domain entities.
5.  **Complex Queries**: Encapsulate complex database queries within specific methods in the repository rather than building them ad-hoc in services.
6.  **Return Domain Models**: Repositories should ideally return domain model objects, not raw database results or persistence-specific entities (if your domain model is separate from your persistence model). Mappers can handle this conversion.
7.  **Dependency Inversion**: Services depend on repository interfaces, not concrete implementations.

## Additional Patterns

### Repository Pattern with Unit of Work (UoW)

For operations that require database transactions spanning multiple repository calls or multiple aggregate updates. The Unit of Work pattern can be implemented to manage the transaction lifecycle. Repositories would operate within the context of that unit of work (e.g., using a shared transaction manager or entity manager instance passed to them).

```typescript
// Conceptual: UoW interface and service usage
// export interface UnitOfWork {
//   transactional<T>(fn: (transactionalRepositoryFactory: (repoToken: symbol) => any) => Promise<T>): Promise<T>;
//   // Or:
//   // startTransaction(): Promise<void>;
//   // commitTransaction(): Promise<void>;
//   // rollbackTransaction(): Promise<void>;
//   // getRepository<T extends BaseRepository<any>>(repoToken: symbol): T;
// }

// @Injectable()
// export class OrderService {
//   constructor(
//     private readonly unitOfWork: UnitOfWork,
//     // Repositories might be obtained via UoW within a transaction
//   ) {}

//   async placeOrder(orderData: CreateOrderDto) {
//     return this.unitOfWork.transactional(async (repoFactory) => {
//       const orderRepository = repoFactory(ORDER_REPOSITORY_TOKEN) as OrderRepository;
//       const productRepository = repoFactory(PRODUCT_REPOSITORY_TOKEN) as ProductRepository;
      
//       // 1. Check product stock (using productRepository)
//       // 2. Create order (using orderRepository)
//       // 3. Update product stock (using productRepository)
//       // All these operations run in a single transaction
//     });
//   }
// }
```
NestJS offers ways to manage transactions, especially with TypeORM (`@Transaction` decorator, `EntityManager`), which can be integrated with your UoW or repository pattern.

> Note: The Repository pattern is particularly beneficial in medium to large applications where separation of concerns, testability, and potential data source changes are important. For very small applications or simple CRUD APIs, it might introduce some boilerplate, but establishing it early can significantly aid in scalability and maintainability.
```
