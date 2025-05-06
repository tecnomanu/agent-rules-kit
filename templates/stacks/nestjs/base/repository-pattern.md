# Patrón Repositorio en NestJS

Este documento define las mejores prácticas para implementar el patrón Repositorio en aplicaciones NestJS.

## Propósito

El patrón Repositorio actúa como una capa de abstracción entre la lógica de negocio y el acceso a datos, permitiendo:

-   **Desacoplar** el origen de datos de la lógica de la aplicación
-   **Centralizar** la lógica de consulta a la base de datos
-   **Facilitar** la escritura de tests unitarios mediante mocks
-   **Abstraer** la tecnología de persistencia utilizada (TypeORM, Mongoose, etc.)

## Estructura Básica

### Interfaces de Repositorio

```typescript
// src/users/interfaces/user-repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
	findAll(): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(userData: Partial<User>): Promise<User>;
	update(id: string, userData: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
}
```

### Implementación con TypeORM

```typescript
// src/users/repositories/typeorm-user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	async findById(id: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { id } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { email } });
	}

	async create(userData: Partial<User>): Promise<User> {
		const newUser = this.userRepository.create(userData);
		return this.userRepository.save(newUser);
	}

	async update(id: string, userData: Partial<User>): Promise<User> {
		await this.userRepository.update(id, userData);
		return this.findById(id);
	}

	async delete(id: string): Promise<void> {
		await this.userRepository.delete(id);
	}
}
```

## Registro de Repositorios

### Provider en Módulo

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [UsersController],
	providers: [
		UsersService,
		{
			provide: 'IUserRepository',
			useClass: TypeOrmUserRepository,
		},
	],
	exports: [UsersService, 'IUserRepository'],
})
export class UsersModule {}
```

### Uso en Servicios

```typescript
// src/users/users.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from './interfaces/user-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@Inject('IUserRepository')
		private readonly userRepository: IUserRepository
	) {}

	async findAll(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		return this.userRepository.create(createUserDto);
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const user = await this.findOne(id);
		return this.userRepository.update(id, updateUserDto);
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id);
		await this.userRepository.delete(id);
	}
}
```

## Repositorio Base Genérico (Opcional)

Para evitar la duplicación de código, puedes crear un repositorio base genérico:

```typescript
// src/common/repositories/base.repository.interface.ts
export interface IBaseRepository<T> {
	findAll(): Promise<T[]>;
	findById(id: string): Promise<T | null>;
	create(data: Partial<T>): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T>;
	delete(id: string): Promise<void>;
}
```

```typescript
// src/common/repositories/typeorm-base.repository.ts
import { Repository, FindOptionsWhere } from 'typeorm';
import { IBaseRepository } from './base.repository.interface';

export abstract class TypeOrmBaseRepository<T> implements IBaseRepository<T> {
	constructor(
		protected readonly repository: Repository<T>,
		private readonly idField: keyof T = 'id' as keyof T
	) {}

	async findAll(): Promise<T[]> {
		return this.repository.find();
	}

	async findById(id: string): Promise<T | null> {
		const where = {
			[this.idField]: id,
		} as unknown as FindOptionsWhere<T>;

		return this.repository.findOne({ where });
	}

	async create(data: Partial<T>): Promise<T> {
		const entity = this.repository.create(data);
		return this.repository.save(entity as any);
	}

	async update(id: string, data: Partial<T>): Promise<T> {
		const where = {
			[this.idField]: id,
		} as unknown as FindOptionsWhere<T>;

		await this.repository.update(id, data as any);
		return this.findById(id);
	}

	async delete(id: string): Promise<void> {
		await this.repository.delete(id);
	}
}
```

### Uso del Repositorio Base

```typescript
// src/users/repositories/typeorm-user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { TypeOrmBaseRepository } from '../../common/repositories/typeorm-base.repository';

@Injectable()
export class TypeOrmUserRepository
	extends TypeOrmBaseRepository<User>
	implements IUserRepository
{
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>
	) {
		super(userRepo);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepo.findOne({ where: { email } });
	}
}
```

## Testing

### Mock de Repositorios

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { IUserRepository } from './interfaces/user-repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
	let service: UsersService;
	let repository: IUserRepository;

	const mockUserRepository = {
		findAll: jest.fn(),
		findById: jest.fn(),
		findByEmail: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: 'IUserRepository',
					useValue: mockUserRepository,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		repository = module.get<IUserRepository>('IUserRepository');
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findOne', () => {
		it('should return a user when user exists', async () => {
			const user = { id: '1', name: 'John', email: 'john@example.com' };
			jest.spyOn(repository, 'findById').mockResolvedValue(user);

			const result = await service.findOne('1');

			expect(result).toEqual(user);
			expect(repository.findById).toHaveBeenCalledWith('1');
		});

		it('should throw NotFoundException when user does not exist', async () => {
			jest.spyOn(repository, 'findById').mockResolvedValue(null);

			await expect(service.findOne('1')).rejects.toThrow(
				NotFoundException
			);
		});
	});

	// Más tests...
});
```

## Mejores Prácticas

1. **Nombrar métodos claramente**: Usa nombres descriptivos para las operaciones.
2. **Mantener repositorios específicos**: Un repositorio por entidad/modelo.
3. **Usar interfaces**: Siempre definir una interfaz para cada repositorio.
4. **Evitar lógica de negocio**: Los repositorios solo acceden a datos, no implementan reglas de negocio.
5. **Consultas complejas**: Encapsular consultas complejas en métodos específicos del repositorio.

## Patrones Adicionales

### Patrón Repositorio con Unit of Work

Para operaciones que requieren transacciones:

```typescript
import { EntityManager } from 'typeorm';

export class UnitOfWork {
	constructor(private readonly entityManager: EntityManager) {}

	async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
		return this.entityManager.transaction(async (manager) => {
			// Reemplazar entity manager durante la transacción
			return work();
		});
	}
}
```

> Nota: El patrón Repositorio es especialmente útil en aplicaciones medianas y grandes. Para aplicaciones pequeñas puede añadir complejidad innecesaria.
