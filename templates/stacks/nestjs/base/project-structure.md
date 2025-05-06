# Estructura de Proyecto NestJS

Este documento define las estructuras de proyecto recomendadas para aplicaciones NestJS.

## Estructura Base

La estructura estándar recomendada para aplicaciones NestJS:

```
proyecto/
├── dist/                 # Código compilado
├── node_modules/         # Dependencias
├── src/                  # Código fuente
│   ├── app.module.ts     # Módulo principal
│   ├── app.controller.ts # Controlador principal
│   ├── app.service.ts    # Servicio principal
│   ├── main.ts           # Punto de entrada
│   ├── common/           # Código compartido
│   │   ├── constants/    # Constantes globales
│   │   ├── decorators/   # Decoradores personalizados
│   │   ├── dto/          # DTOs compartidos
│   │   ├── entities/     # Entidades compartidas
│   │   ├── enums/        # Enums globales
│   │   ├── exceptions/   # Excepciones personalizadas
│   │   ├── filters/      # Filtros globales
│   │   ├── guards/       # Guards globales
│   │   ├── interceptors/ # Interceptores globales
│   │   ├── interfaces/   # Interfaces compartidas
│   │   ├── middleware/   # Middleware personalizado
│   │   ├── pipes/        # Pipes globales
│   │   └── utils/        # Utilidades compartidas
│   ├── config/           # Configuración de la aplicación
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── configuration.ts
│   └── modules/          # Módulos de la aplicación
│       ├── users/        # Módulo de usuarios
│       │   ├── dto/      # DTOs específicos del módulo
│       │   ├── entities/ # Entidades específicas del módulo
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   ├── users.service.ts
│       │   └── users.service.spec.ts
│       └── auth/         # Módulo de autenticación
│           ├── dto/
│           ├── guards/
│           ├── strategies/
│           ├── auth.controller.ts
│           ├── auth.module.ts
│           ├── auth.service.ts
│           └── auth.service.spec.ts
├── test/                 # Tests e2e
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env                  # Variables de entorno
├── .eslintrc.js          # Configuración ESLint
├── .gitignore            # Configuración Git
├── .prettierrc           # Configuración Prettier
├── nest-cli.json         # Configuración NestJS CLI
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
├── tsconfig.build.json   # Config TS para build
└── README.md             # Documentación
```

## Estructura por Dominio (DDD)

Para proyectos que utilizan Domain-Driven Design:

```
src/
├── domain/                 # Lógica de dominio
│   ├── users/              # Dominio de usuarios
│   │   ├── entities/       # Entidades de dominio
│   │   ├── value-objects/  # Value Objects
│   │   ├── interfaces/     # Interfaces del dominio
│   │   └── events/         # Eventos del dominio
│   └── products/           # Otro dominio
│       ├── entities/
│       └── ...
├── application/            # Casos de uso
│   ├── users/              # Casos de uso de usuarios
│   │   ├── commands/       # Comandos (CQRS)
│   │   ├── queries/        # Consultas (CQRS)
│   │   ├── dtos/           # DTOs
│   │   └── interfaces/     # Interfaces de aplicación
│   └── products/           # Casos de uso de productos
│       └── ...
├── infrastructure/         # Implementaciones concretas
│   ├── database/           # Configuración y adapters de BD
│   │   ├── typeorm/        # Implementación TypeORM
│   │   │   ├── entities/   # Entidades TypeORM
│   │   │   ├── migrations/ # Migraciones
│   │   │   └── repositories/ # Repositorios TypeORM
│   ├── auth/               # Implementación de autenticación
│   ├── config/             # Configuración de infraestructura
│   └── logging/            # Implementación de logging
└── interface/              # Interfaces de usuario
    ├── api/                # API REST/GraphQL
    │   ├── controllers/    # Controladores
    │   ├── dtos/           # DTOs específicos de API
    │   ├── middlewares/    # Middlewares
    │   └── presenters/     # Transformadores de respuesta
    ├── events/             # Controladores de eventos
    └── jobs/               # Jobs programados
```

## Estructura Modular Escalable

Para aplicaciones grandes con múltiples módulos relacionados:

```
src/
├── core/                   # Módulos centrales
│   ├── database/           # Configuración BD
│   ├── auth/               # Autenticación
│   ├── logging/            # Logging
│   └── config/             # Configuración
├── shared/                 # Código compartido
│   ├── constants/          # Constantes
│   ├── dto/                # DTOs compartidos
│   ├── exceptions/         # Excepciones
│   └── utils/              # Utilidades
├── modules/                # Módulos de negocio
│   ├── users/              # Módulo de usuarios
│   │   ├── domain/         # Entidades y lógica
│   │   ├── application/    # Servicios y lógica
│   │   └── infrastructure/ # Implementaciones
│   ├── products/
│   └── orders/
└── main.ts                 # Punto de entrada
```

## Principios de Organización

1. **Alta Cohesión**: Los archivos relacionados deben estar juntos.
2. **Bajo Acoplamiento**: Minimizar dependencias entre módulos.
3. **Encapsulación**: Exponer solo lo necesario desde cada módulo.
4. **Modularidad**: Estructurar por funcionalidad, no por tipo de archivo.

## Estructuración de Módulos

Cada módulo debe seguir una estructura coherente:

```
modulo/
├── dto/                  # DTOs
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── entities/             # Entidades
│   └── *.entity.ts
├── interfaces/           # Interfaces
│   └── *.interface.ts
├── modulo.controller.ts  # Controlador del módulo
├── modulo.module.ts      # Definición del módulo
├── modulo.service.ts     # Servicio del módulo
└── modulo.service.spec.ts # Tests del servicio
```

## Estrategias para Proyectos Grandes

### Monorepo con NestJS

Estructura para monorepo usando Nx o Lerna:

```
apps/
├── api/                  # API principal
│   └── src/
├── admin/                # Panel de administración
│   └── src/
└── worker/               # Trabajador de procesos
    └── src/
libs/
├── common/               # Código compartido
│   └── src/
├── feature-a/            # Librería para característica A
│   └── src/
└── feature-b/            # Librería para característica B
    └── src/
```

### Microservicios

Estructura para arquitectura de microservicios:

```
services/
├── users-service/        # Servicio de usuarios
│   ├── src/
│   └── ...
├── auth-service/         # Servicio de autenticación
│   ├── src/
│   └── ...
├── products-service/     # Servicio de productos
│   ├── src/
│   └── ...
└── api-gateway/          # Gateway de API
    ├── src/
    └── ...
```

## Buenas Prácticas de Organización

1. **Rutas Absolutas**: Configurar TypeScript para usar rutas absolutas desde la raíz:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

2. **Índices de Barril**: Usar archivos index.ts para exportaciones:

```typescript
// src/common/index.ts
export * from './constants';
export * from './utils';
export * from './dto';
```

3. **Separación de Responsabilidades**:

-   Controladores: Manejan requests HTTP
-   Servicios: Contienen lógica de negocio
-   Repositorios: Acceso a datos

> Nota: Independientemente de la estructura elegida, mantén la coherencia en todo el proyecto.
