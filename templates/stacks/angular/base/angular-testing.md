# Prácticas de Testing en Angular

## Principios Generales

-   **Tests Automatizados**: Cada componente, servicio y pipe debe tener tests automatizados.
-   **Cobertura**: Aspirar a una cobertura de código del 80% o superior.
-   **TDD/BDD**: Considerar escribir tests antes que el código cuando sea posible.
-   **Aislamiento**: Los tests unitarios deben aislar el código probado de sus dependencias.
-   **Determinismo**: Los tests deben producir el mismo resultado en cada ejecución.

## Tipos de Tests en Angular

### Tests Unitarios

-   **Propósito**: Probar componentes, servicios, pipes y directivas de forma aislada
-   **Herramientas**: Jasmine, Karma
-   **Ubicación**: Archivos `.spec.ts` junto a los componentes que prueban

```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import {
	HttpClientTestingModule,
	HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [UserService],
		});
		service = TestBed.inject(UserService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should retrieve users from the API', () => {
		// Arrange
		const mockUsers = [
			{ id: 1, name: 'John' },
			{ id: 2, name: 'Jane' },
		];

		// Act
		service.getUsers().subscribe((users) => {
			// Assert
			expect(users).toEqual(mockUsers);
		});

		// Expect and respond to the HTTP request
		const req = httpMock.expectOne('api/users');
		expect(req.request.method).toBe('GET');
		req.flush(mockUsers);
	});
});
```

### Tests de Componentes

```typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from '../services/user.service';

describe('UserListComponent', () => {
	let component: UserListComponent;
	let fixture: ComponentFixture<UserListComponent>;
	let mockUserService;

	beforeEach(async () => {
		mockUserService = jasmine.createSpyObj(['getUsers']);

		await TestBed.configureTestingModule({
			declarations: [UserListComponent],
			providers: [{ provide: UserService, useValue: mockUserService }],
		}).compileComponents();

		fixture = TestBed.createComponent(UserListComponent);
		component = fixture.componentInstance;

		mockUserService.getUsers.and.returnValue(
			of([
				{ id: 1, name: 'John' },
				{ id: 2, name: 'Jane' },
			])
		);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display user list when loaded', () => {
		// Arrange & Act
		fixture.detectChanges(); // Trigger ngOnInit

		// Assert
		const userElements = fixture.debugElement.queryAll(
			By.css('.user-item')
		);
		expect(userElements.length).toBe(2);
		expect(userElements[0].nativeElement.textContent).toContain('John');
		expect(userElements[1].nativeElement.textContent).toContain('Jane');
	});
});
```

### Tests de Integración

Probar múltiples componentes trabajando juntos:

```typescript
// user-module.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserService } from './services/user.service';
import { UsersModule } from './users.module';

describe('UsersModule Integration', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				UsersModule,
				HttpClientTestingModule,
				RouterTestingModule,
			],
		}).compileComponents();
	});

	it('should create UserListComponent', () => {
		const fixture = TestBed.createComponent(UserListComponent);
		const component = fixture.componentInstance;
		expect(component).toBeTruthy();
	});

	it('should create UserDetailComponent', () => {
		const fixture = TestBed.createComponent(UserDetailComponent);
		const component = fixture.componentInstance;
		expect(component).toBeTruthy();
	});
});
```

### Tests E2E (End-to-End)

-   **Propósito**: Probar la aplicación completa simulando interacciones de usuario
-   **Herramientas**: Cypress, Protractor (legacy)
-   **Ubicación**: Carpeta `cypress/` o `e2e/` en la raíz del proyecto

```typescript
// cypress/e2e/user-management.cy.ts
describe('User Management', () => {
	beforeEach(() => {
		cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as(
			'getUsers'
		);
		cy.visit('/users');
		cy.wait('@getUsers');
	});

	it('should display user list', () => {
		cy.get('.user-item').should('have.length', 3);
		cy.get('.user-item').first().should('contain', 'John Doe');
	});

	it('should navigate to user details when clicking on a user', () => {
		cy.get('.user-item').first().click();
		cy.url().should('include', '/users/1');
		cy.get('.user-details-name').should('contain', 'John Doe');
	});
});
```

## Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests unitarios en modo watch
ng test --watch

# Ejecutar tests con coverage
ng test --code-coverage

# Ejecutar tests e2e (con Cypress)
ng e2e
# o
npx cypress open
```

### Con cada cambio

-   Durante desarrollo: Ejecutar en modo watch `ng test --watch`
-   Antes de commit/push: Ejecutar tests completos `ng test`
-   En CI/CD: Ejecutar tests con coverage `ng test --code-coverage`

## Buenas Prácticas

### Organización de Tests

1. **Estructura AAA**: Arrange (preparar), Act (actuar), Assert (verificar)
2. **Descripciones claras**: Usar textos descriptivos en bloques `describe` e `it`
3. **Tests independientes**: Evitar dependencias entre tests

### Mock de Dependencias

```typescript
// Mock de Servicios
const mockUserService = jasmine.createSpyObj([
	'getUsers',
	'getUserById',
	'createUser',
]);
mockUserService.getUsers.and.returnValue(of([{ id: 1, name: 'John' }]));

TestBed.configureTestingModule({
	declarations: [UserListComponent],
	providers: [{ provide: UserService, useValue: mockUserService }],
});
```

### Testing de Forms

```typescript
// user-form.component.spec.ts
it('should validate form correctly', () => {
	// Form inválido inicialmente
	expect(component.form.valid).toBeFalsy();

	// Completar campos del form
	component.form.controls['name'].setValue('John Doe');
	component.form.controls['email'].setValue('invalid-email');

	// Validar que sigue inválido por el email
	expect(component.form.valid).toBeFalsy();
	expect(component.form.controls['email'].valid).toBeFalsy();

	// Corregir email
	component.form.controls['email'].setValue('john@example.com');

	// Form ahora válido
	expect(component.form.valid).toBeTruthy();
});
```

### Testing de Observables

```typescript
import { of, throwError } from 'rxjs';

it('should handle error when API fails', () => {
	// Mock del servicio para retornar error
	mockUserService.getUsers.and.returnValue(
		throwError(() => new Error('API error'))
	);

	// Spy para verificar manejo de error
	spyOn(console, 'error');

	// Inicializar componente
	fixture.detectChanges();

	// Verificar que el error fue manejado
	expect(console.error).toHaveBeenCalled();
	expect(component.error).toBeTruthy();
	expect(component.users.length).toBe(0);
});
```

## CI/CD con GitHub Actions

```yaml
name: Angular Tests

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
            - name: Lint
              run: npm run lint
            - name: Test
              run: npm run test -- --no-watch --no-progress --browsers=ChromeHeadless --code-coverage
            - name: Build
              run: npm run build -- --configuration production
            # Opcional - agregar análisis de cobertura
            - name: Upload coverage to Codecov
              uses: codecov/codecov-action@v3
              with:
                  token: ${{ secrets.CODECOV_TOKEN }}
```

## Mantenimiento de Tests

1. **Revisiones periódicas**: Actualizar tests al cambiar implementaciones
2. **Refactorización**: Mantener tests limpios y legibles
3. **Integración en CI/CD**: Ejecutar tests automáticamente con cada commit/PR

## Herramientas Recomendadas

-   **Jasmine**: Framework principal de testing para Angular
-   **Karma**: Test runner para ejecutar tests unitarios
-   **Cypress**: Framework moderno para tests e2e
-   **jest-marbles**: Para probar RxJS de forma declarativa
-   **jasmine-marbles**: Alternativa para testing de observables
-   **ng-mocks**: Facilita la creación de mocks para módulos Angular

> Nota: Estas son las prácticas base para testing en Angular. Adapta estas reglas según las necesidades específicas de tu proyecto.
