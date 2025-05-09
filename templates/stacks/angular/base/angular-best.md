# Angular Best Practices

This document outlines Angular best practices that can be applied across different architectural approaches.

## Common Project Structure

Angular projects can be organized in various ways depending on the architectural approach (modular, feature-first, domain-driven, etc.), but typically include:

```
src/
├── app/                # Application code
│   ├── [core]/         # Core functionality (guards, interceptors, essential services)
│   ├── [shared]/       # Shared components, directives, pipes
│   ├── [features|modules|domains]/  # Organized by business domains or features
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/            # Static assets
└── environments/      # Environment configuration
```

> Note: Folder names in [brackets] may vary depending on your architectural approach.

## Component Best Practices

Regardless of architecture, follow these component principles:

1. **Single Responsibility**: Each component should have one clear purpose
2. **Input/Output Contract**: Define clear interfaces for component communication
3. **Change Detection**: Optimize performance with OnPush when appropriate
4. **Encapsulation**: Use appropriate view encapsulation for components
5. **Size**: Keep components reasonably sized and focused

```typescript
@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
	@Input() user: User;
	@Output() userUpdated = new EventEmitter<User>();

	updateUser(changes: Partial<User>): void {
		this.userUpdated.emit({ ...this.user, ...changes });
	}
}
```

## Service Design Principles

Services should follow these principles regardless of architecture:

1. **Interface-Based Design**: Consider defining interfaces for services
2. **Focused Responsibility**: Each service should have a specific purpose
3. **Reusability**: Design services to be reusable across components
4. **Testability**: Structure services to be easily mockable in tests

```typescript
@Injectable({
	providedIn: 'root',
})
export class DataService {
	constructor(private http: HttpClient) {}

	getData<T>(endpoint: string, params?: HttpParams): Observable<T> {
		return this.http.get<T>(endpoint, { params });
	}
}
```

## State Management

Choose an appropriate state management approach based on application complexity:

1. **Services with BehaviorSubject**: For simpler applications
2. **NgRx/NGXS/Akita**: For complex state with many components and actions
3. **Component State**: For isolated component functionality
4. **Context API**: For intermediate state sharing needs

## Reactive Programming Principles

1. **Complete Subscriptions**: Always unsubscribe or use async pipe
2. **Error Handling**: Handle errors in observables appropriately
3. **Transformation Pipeline**: Keep observable chains readable and maintainable

```typescript
// Example of proper subscription handling
export class DataComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	ngOnInit() {
		this.dataService
			.getData()
			.pipe(
				map((data) => this.transformData(data)),
				catchError((err) => this.handleError(err)),
				takeUntil(this.destroy$)
			)
			.subscribe((result) => this.processResult(result));
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
```

## Module Organization

Organize modules based on your chosen architecture, but always:

1. **Feature Isolation**: Keep features properly encapsulated
2. **Explicit Public API**: Export only what's needed from modules
3. **Lazy Loading**: Implement lazy loading where appropriate
4. **Shared Module Management**: Carefully control what goes into shared modules

## Performance Best Practices

1. **OnPush Change Detection**: Use for most components
2. **TrackBy Function**: Use with ngFor for optimal rendering
3. **Pure Pipes**: Prefer pure pipes over methods in templates
4. **Lazy Loading**: Implement for routes and components where helpful
5. **Bundle Optimization**: Configure proper tree-shaking and bundling

## Testing Strategy

1. **Unit Testing**: Test components, services, and pipes in isolation
2. **Integration Testing**: Test component interactions
3. **Mock Dependencies**: Use TestBed and dependency injection for proper mocking

```typescript
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

	it('should retrieve users', () => {
		// Test implementation
	});
});
```

## Architectural Adaptability

These practices can be applied across different architectural approaches:

1. **Modular Architecture**: Organizing by feature modules
2. **Domain-Driven Design**: Organizing by business domains
3. **Clean Architecture**: Separating core logic from framework
4. **MVVM Pattern**: Using services as ViewModels

> Note: See specific architecture documentation for architecture-specific practices.
