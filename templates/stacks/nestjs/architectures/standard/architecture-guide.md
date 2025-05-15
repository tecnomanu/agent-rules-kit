---
description: Standard architecture patterns for NestJS applications
globs: <root>/**/*.ts
alwaysApply: false
---

# NestJS Standard Architecture Guide

This document outlines the recommended architecture for standard NestJS applications, following best practices and established patterns.

## Project Structure

A well-organized NestJS project follows this structure:

```
src/
├── main.ts                         # Application entry point
├── app.module.ts                   # Root application module
├── common/                         # Shared resources
│   ├── constants/                  # Application constants
│   ├── decorators/                 # Custom decorators
│   ├── filters/                    # Exception filters
│   ├── guards/                     # Guards
│   ├── interceptors/               # Interceptors
│   ├── interfaces/                 # TypeScript interfaces
│   ├── middleware/                 # Middleware
│   ├── pipes/                      # Transformation and validation pipes
│   └── utils/                      # Utility functions
├── config/                         # Configuration
│   ├── config.module.ts            # Configuration module
│   ├── configuration.ts            # Configuration factory
│   └── validation.ts               # Environment validation
├── modules/                        # Feature modules
│   ├── users/                      # Users module
│   │   ├── controllers/            # Controllers
│   │   │   └── users.controller.ts
│   │   ├── services/               # Services
│   │   │   └── users.service.ts
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/               # Entities/Models
│   │   │   └── user.entity.ts
│   │   ├── repositories/           # Repositories
│   │   │   └── users.repository.ts
│   │   └── users.module.ts         # Feature module definition
│   ├── auth/                       # Authentication module
│   └── products/                   # Products module
└── test/                           # End-to-end tests
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

## Layers of Abstraction

The standard NestJS architecture follows a layered approach:

1. **Presentation Layer** (Controllers)

    - Handles HTTP requests
    - Validates input data
    - Calls appropriate services
    - Formats the response

2. **Business Logic Layer** (Services)

    - Contains domain logic
    - Coordinates between multiple data sources
    - Performs business operations
    - Is injectable and reusable

3. **Data Access Layer** (Repositories)

    - Encapsulates database operations
    - Provides an abstraction over data storage
    - Handles query building and execution

4. **Domain Layer** (Entities/Models)
    - Represents the domain objects
    - Defines the structure of business data
    - Contains domain-specific validation

## Implementation Example

### Controller Implementation

Controllers should be focused on HTTP concerns:

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtAuthGuard)
	async create(
		@Body() createUserDto: CreateUserDto
	): Promise<UserResponseDto> {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(
		@Query() paginationQuery: PaginationQueryDto
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		return this.usersService.findAll(paginationQuery);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	async findOne(@Param('id') id: string): Promise<UserResponseDto> {
		const user = await this.usersService.findOne(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	async update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto
	): Promise<UserResponseDto> {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param('id') id: string): Promise<void> {
		await this.usersService.remove(id);
	}
}
```

### Service Implementation

Services implement business logic:

```typescript
// users.service.ts
@Injectable()
export class UsersService {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly configService: ConfigService,
		private readonly eventEmitter: EventEmitter2
	) {}

	async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
		// Check if user already exists
		const existingUser = await this.usersRepository.findByEmail(
			createUserDto.email
		);
		if (existingUser) {
			throw new ConflictException('User with this email already exists');
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(
			createUserDto.password,
			this.configService.get<number>('BCRYPT_SALT_ROUNDS')
		);

		// Create and save the user
		const user = await this.usersRepository.create({
			...createUserDto,
			password: hashedPassword,
		});

		// Emit event
		this.eventEmitter.emit('user.created', user);

		// Return response DTO (exclude password)
		return this.mapToResponseDto(user);
	}

	async findAll(
		paginationQuery: PaginationQueryDto
	): Promise<PaginatedResponseDto<UserResponseDto>> {
		const [users, totalCount] = await this.usersRepository.findAll(
			paginationQuery.page,
			paginationQuery.limit
		);

		return {
			data: users.map((user) => this.mapToResponseDto(user)),
			meta: {
				totalCount,
				page: paginationQuery.page,
				limit: paginationQuery.limit,
				totalPages: Math.ceil(totalCount / paginationQuery.limit),
			},
		};
	}

	async findOne(id: string): Promise<UserResponseDto | null> {
		const user = await this.usersRepository.findById(id);
		if (!user) return null;
		return this.mapToResponseDto(user);
	}

	async update(
		id: string,
		updateUserDto: UpdateUserDto
	): Promise<UserResponseDto> {
		// Check if user exists
		const existingUser = await this.usersRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// If updating email, check for duplicates
		if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
			const userWithEmail = await this.usersRepository.findByEmail(
				updateUserDto.email
			);
			if (userWithEmail) {
				throw new ConflictException(
					'User with this email already exists'
				);
			}
		}

		// Handle password updates
		if (updateUserDto.password) {
			updateUserDto.password = await bcrypt.hash(
				updateUserDto.password,
				this.configService.get<number>('BCRYPT_SALT_ROUNDS')
			);
		}

		// Update user
		const updatedUser = await this.usersRepository.update(
			id,
			updateUserDto
		);

		// Emit event
		this.eventEmitter.emit('user.updated', updatedUser);

		return this.mapToResponseDto(updatedUser);
	}

	async remove(id: string): Promise<void> {
		// Check if user exists
		const existingUser = await this.usersRepository.findById(id);
		if (!existingUser) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		// Delete user
		await this.usersRepository.delete(id);

		// Emit event
		this.eventEmitter.emit('user.deleted', { id });
	}

	private mapToResponseDto(user: User): UserResponseDto {
		const { password, ...userWithoutPassword } = user;
		return userWithoutPassword as UserResponseDto;
	}
}
```

### Repository Implementation

For TypeORM:

```typescript
// users.repository.ts
@Injectable()
export class UsersRepository {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async create(userData: Partial<User>): Promise<User> {
		const user = this.userRepository.create(userData);
		return this.userRepository.save(user);
	}

	async findAll(page = 1, limit = 10): Promise<[User[], number]> {
		return this.userRepository.findAndCount({
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: 'DESC' },
		});
	}

	async findById(id: string): Promise<User | null> {
		return this.userRepository.findOneBy({ id });
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOneBy({ email });
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

For Mongoose:

```typescript
// users.repository.ts
@Injectable()
export class UsersRepository {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>
	) {}

	async create(userData: Partial<User>): Promise<User> {
		const newUser = new this.userModel(userData);
		return newUser.save();
	}

	async findAll(page = 1, limit = 10): Promise<[User[], number]> {
		const skip = (page - 1) * limit;
		const [users, count] = await Promise.all([
			this.userModel
				.find()
				.skip(skip)
				.limit(limit)
				.sort({ createdAt: -1 })
				.exec(),
			this.userModel.countDocuments().exec(),
		]);
		return [users, count];
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).exec();
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userModel.findOne({ email }).exec();
	}

	async update(id: string, userData: Partial<User>): Promise<User> {
		return this.userModel
			.findByIdAndUpdate(id, userData, { new: true })
			.exec();
	}

	async delete(id: string): Promise<void> {
		await this.userModel.findByIdAndDelete(id).exec();
	}
}
```

### Entity/Model Implementation

TypeORM entity:

```typescript
// user.entity.ts
@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	password: string;

	@Column({ default: false })
	isActive: boolean;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
	role: UserRole;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// Virtual field (not stored in database)
	get fullName(): string {
		return `${this.firstName} ${this.lastName}`;
	}
}
```

Mongoose schema:

```typescript
// user.schema.ts
@Schema({
	timestamps: true,
	toJSON: {
		transform: (doc, ret) => {
			delete ret.password;
			return ret;
		},
	},
})
export class User {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	firstName: string;

	@Prop({ required: true })
	lastName: string;

	@Prop({ required: true })
	password: string;

	@Prop({ default: false })
	isActive: boolean;

	@Prop({
		type: String,
		enum: Object.values(UserRole),
		default: UserRole.USER,
	})
	role: UserRole;

	// Virtual property (not stored in the database)
	get fullName(): string {
		return `${this.firstName} ${this.lastName}`;
	}
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual field to schema
UserSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});
```

### DTO Implementations

DTOs for data validation:

```typescript
// create-user.dto.ts
export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	firstName: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(50)
	lastName: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'Password is too weak',
	})
	password: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}

// update-user.dto.ts
export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	firstName?: string;

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	lastName?: string;

	@IsOptional()
	@IsString()
	@MinLength(8)
	@MaxLength(32)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'Password is too weak',
	})
	password?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}

// pagination-query.dto.ts
export class PaginationQueryDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	limit?: number = 10;
}
```

### Module Implementation

```typescript
// users.module.ts
@Module({
	imports: [
		TypeOrmModule.forFeature([User]), // For TypeORM
		// Or MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // For Mongoose
		ConfigModule,
		EventEmitterModule,
	],
	controllers: [UsersController],
	providers: [UsersService, UsersRepository],
	exports: [UsersService], // Export for use in other modules
})
export class UsersModule {}
```

## Cross-Cutting Concerns

### Global Exception Filter

Create custom exception handling:

```typescript
// http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: Logger) {}

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		const errorResponse = {
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			message:
				typeof exceptionResponse === 'object' &&
				'message' in exceptionResponse
					? exceptionResponse.message
					: exception.message,
		};

		this.logger.error(
			`${request.method} ${request.url} ${status}`,
			JSON.stringify(errorResponse),
			'HttpExceptionFilter'
		);

		response.status(status).json(errorResponse);
	}
}
```

### Authentication Guard

Implement JWT authentication:

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException('Missing authentication token');
		}

		try {
			const payload = this.jwtService.verify(token);
			request.user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Invalid authentication token');
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
```

### Configuration

Use environment-based configuration:

```typescript
// configuration.ts
export default () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		name: process.env.DATABASE_NAME,
	},
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: process.env.JWT_EXPIRES_IN || '1d',
	},
	bcrypt: {
		saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
	},
});

// validation.ts
export class EnvironmentVariablesValidator {
	validateEnvironmentVariables() {
		const errors: string[] = [];

		// Validate database config
		if (!process.env.DATABASE_HOST)
			errors.push('DATABASE_HOST is not defined');
		if (!process.env.DATABASE_USERNAME)
			errors.push('DATABASE_USERNAME is not defined');
		if (!process.env.DATABASE_PASSWORD)
			errors.push('DATABASE_PASSWORD is not defined');
		if (!process.env.DATABASE_NAME)
			errors.push('DATABASE_NAME is not defined');

		// Validate JWT config
		if (!process.env.JWT_SECRET) errors.push('JWT_SECRET is not defined');

		if (errors.length > 0) {
			throw new Error(
				`Environment validation failed:\n${errors.join('\n')}`
			);
		}
	}
}

// config.module.ts
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test')
					.default('development'),
				PORT: Joi.number().default(3000),
				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().default(5432),
				DATABASE_USERNAME: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
				DATABASE_NAME: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_EXPIRES_IN: Joi.string().default('1d'),
				BCRYPT_SALT_ROUNDS: Joi.number().default(10),
			}),
		}),
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppConfigModule {}
```

## Application Setup

Main application setup:

```typescript
// main.ts
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const logger = new Logger('Bootstrap');

	// Validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	);

	// Exception handling
	app.useGlobalFilters(new HttpExceptionFilter(new Logger('HttpException')));

	// CORS
	app.enableCors();

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle('NestJS API')
		.setDescription('API documentation')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	// Start the application
	const port = configService.get<number>('port');
	await app.listen(port);
	logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

## Best Practices

1. **Dependency Injection**: Use constructor injection to create loosely coupled components
2. **Single Responsibility**: Each class should have a single responsibility
3. **Use DTOs**: Validate input and output data with Data Transfer Objects
4. **Repository Pattern**: Abstract database operations behind repositories
5. **Environment Configuration**: Use ConfigService for all environment-dependent values
6. **Exception Handling**: Create custom exception filters for clear error messages
7. **Validation**: Use ValidationPipe globally to validate incoming data
8. **Documentation**: Use Swagger to document your API
9. **Testing**: Write unit and integration tests for all components
10. **Logging**: Implement consistent logging throughout the application

## Anti-patterns to Avoid

1. **Fat Controllers**: Controllers should handle HTTP concerns only, not business logic
2. **Skipping Validation**: Always validate incoming data
3. **Hardcoded Configuration**: Use ConfigService instead of hardcoding values
4. **Direct Database Access**: Use repositories instead of accessing the database directly
5. **Callback Hell**: Use async/await for asynchronous operations
6. **Missing Error Handling**: Always handle potential errors
7. **Mixing Responsibilities**: Keep controllers, services, and repositories focused on their responsibility
8. **Tight Coupling**: Use dependency injection to allow for easier testing and modularity
