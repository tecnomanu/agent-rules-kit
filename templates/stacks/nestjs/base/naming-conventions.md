# Convenciones de Nomenclatura en NestJS

Este documento define las convenciones de nomenclatura estándar para proyectos NestJS, siguiendo las prácticas recomendadas por la comunidad y el ecosistema TypeScript/NestJS.

## Principios Generales

-   **Consistencia**: Mantén el mismo estilo en todo el proyecto.
-   **Claridad**: Los nombres deben ser descriptivos y revelar la intención.
-   **Concisión**: Evita nombres innecesariamente largos cuando sea posible.
-   **Estándares**: Seguir convenciones oficiales de NestJS y TypeScript.

## Estilos de Nomenclatura

| Estilo         | Descripción                                                            | Ejemplo          |
| -------------- | ---------------------------------------------------------------------- | ---------------- |
| **PascalCase** | Primera letra de cada palabra en mayúscula                             | `UserController` |
| **camelCase**  | Primera letra minúscula, resto de palabras con primera letra mayúscula | `findUserById`   |
| **kebab-case** | Palabras en minúscula separadas por guiones                            | `user-service`   |

## Aplicación por Tipo de Elemento

### Módulos

-   **Nombres**: `PascalCase` con sufijo `Module`
-   **Archivos**: `kebab-case` con sufijo `.module.ts`

```typescript
// users.module.ts
@Module({
	imports: [DatabaseModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
```

### Controladores

-   **Nombres**: `PascalCase` con sufijo `Controller`
-   **Archivos**: `kebab-case` con sufijo `.controller.ts`
-   **Rutas**: `kebab-case`

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}
}
```

### Servicios

-   **Nombres**: `PascalCase` con sufijo `Service`
-   **Archivos**: `kebab-case` con sufijo `.service.ts`

```typescript
// users.service.ts
@Injectable()
export class UsersService {
	findAll() {
		return this.usersRepository.find();
	}
}
```

### Entidades

-   **Nombres**: `PascalCase` singular
-   **Archivos**: `kebab-case` con sufijo `.entity.ts`
-   **Propiedades**: `camelCase`

```typescript
// user.entity.ts
@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ unique: true })
	email: string;
}
```

### DTOs (Data Transfer Objects)

-   **Nombres**: `PascalCase` con sufijo descriptivo (`Dto`)
-   **Archivos**: `kebab-case` con sufijo descriptivo (`.dto.ts`)

```typescript
// create-user.dto.ts
export class CreateUserDto {
	@IsString()
	@MinLength(2)
	firstName: string;

	@IsString()
	@MinLength(2)
	lastName: string;

	@IsEmail()
	email: string;
}

// update-user.dto.ts
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Interfaces

-   **Nombres**: `PascalCase`, puede llevar prefijo `I` (opcional)
-   **Archivos**: `kebab-case` con sufijo `.interface.ts`

```typescript
// user.interface.ts
export interface IUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	isActive: boolean;
}
```

### Enums

-   **Nombres**: `PascalCase`
-   **Archivos**: `kebab-case` con sufijo `.enum.ts`

```typescript
// user-role.enum.ts
export enum UserRole {
	ADMIN = 'admin',
	EDITOR = 'editor',
	USER = 'user',
}
```

### Guards, Interceptors, Pipes, Filters

-   **Nombres**: `PascalCase` con sufijo según el tipo (`Guard`, `Interceptor`, etc.)
-   **Archivos**: `kebab-case` con sufijo según el tipo (`.guard.ts`, `.interceptor.ts`, etc.)

```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		// Lógica aquí
		return true;
	}
}

// transform.interceptor.ts
@Injectable()
export class TransformInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		// Lógica aquí
		return next.handle();
	}
}
```

### Métodos y Funciones

-   Usar `camelCase`
-   Verbos que describan la acción
-   Para métodos HTTP, seguir convenciones REST:

```typescript
// En controladores
@Get()
findAll() {}

@Get(':id')
findOne(@Param('id') id: string) {}

@Post()
create(@Body() createUserDto: CreateUserDto) {}

@Patch(':id')
update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {}

@Delete(':id')
remove(@Param('id') id: string) {}
```

### Variables y Propiedades

-   Usar `camelCase`
-   Nombres descriptivos

```typescript
const userCount = 42;
const isActive = true;

// En clases
private readonly usersRepository: Repository<User>;
private readonly configService: ConfigService;
```

### Constantes

-   Para constantes globales: `UPPER_SNAKE_CASE`
-   Para constantes en clases: `camelCase`

```typescript
// Constantes globales
const API_VERSION = 'v1';
const MAX_LOGIN_ATTEMPTS = 5;

// En clases
private readonly maxRetries = 3;
```

## Estructura de Directorios

```
src/
├── app.module.ts
├── main.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   │   └── user.entity.ts
│   │   └── users.controller.ts
│   │   └── users.module.ts
│   │   └── users.service.ts
│   │   └── users.service.spec.ts
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.module.ts
│       ├── auth.service.ts
│       └── guards/
│           └── jwt-auth.guard.ts
└── users/
```

## Convenciones de Tests

-   **Archivos de Test**: Mismo nombre que el archivo probado, con sufijo `.spec.ts`
-   **E2E Tests**: sufijo `.e2e-spec.ts` en directorio `test/`
-   **Nombres de Tests**: Descriptivos sobre lo que está probando

```typescript
// users.service.spec.ts
describe('UsersService', () => {
	it('should return all users', () => {
		// ...
	});

	it('should find one user by id', () => {
		// ...
	});
});
```

## Decoradores

-   Los decoradores deben estar solos en una línea
-   Seguir orden de decoradores recomendado por NestJS

```typescript
@Module({
	imports: [DatabaseModule],
	controllers: [UsersController],
})
export class UsersModule {}

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
	@Get(':id')
	@UseInterceptors(LoggingInterceptor)
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}
}
```

## Herramientas de Linting

Configurar ESLint con reglas estrictas:

```javascript
// .eslintrc.js
module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	rules: {
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'default',
				format: ['camelCase'],
			},
			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE'],
			},
			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
		],
	},
};
```

> Nota: Estas convenciones son recomendaciones basadas en las mejores prácticas de NestJS. Adapta según las necesidades específicas de tu proyecto mantiendo consistencia en todo el código.
