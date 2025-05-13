---
description: Guidelines for using Angular Signals in Angular 16-17
globs: <root>/src/**/*.ts
alwaysApply: false
---

# Angular Signals (Angular 16-17)

This project uses Angular Signals, introduced in Angular 16 and enhanced in Angular 17. Follow these guidelines for state management.

## Signal Basics

Signals are a system for reactive state management, allowing Angular to track dependencies and update only what's needed.

### Creating Signals

```typescript
import { signal } from '@angular/core';

// Creating a signal with an initial value
const count = signal(0);

// Reading a signal value
console.log(count()); // 0

// Updating a signal
count.set(1); // Direct set
count.update((current) => current + 1); // Update based on current value

// Creating computed signals
const doubledCount = computed(() => count() * 2);
```

## Component Usage

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
	selector: 'app-counter',
	template: `
		<div>Count: {{ count() }}</div>
		<div>Doubled: {{ doubled() }}</div>
		<button (click)="increment()">Increment</button>
	`,
})
export class CounterComponent {
	count = signal(0);
	doubled = computed(() => this.count() * 2);

	increment() {
		this.count.update((c) => c + 1);
	}
}
```

## Signal Inputs

Angular 17 introduces signal-based inputs:

```typescript
import { Component, input } from '@angular/core';

@Component({
	selector: 'app-user-card',
	template: `
		<div class="card">
			<h3>{{ name() }}</h3>
			<p>Role: {{ role() || 'User' }}</p>
		</div>
	`,
})
export class UserCardComponent {
	// Required input
	name = input.required<string>();

	// Optional input with default value
	role = input<string>('User');
}
```

## Signal Effects

Use effects for side effects when signals change:

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
	selector: 'app-theme-switcher',
	template: ` <button (click)="toggleTheme()">Toggle Theme</button> `,
})
export class ThemeSwitcherComponent implements OnInit {
	theme = signal('light');

	constructor() {
		// Effect runs when signals it depends on change
		effect(() => {
			document.body.className = this.theme();
			localStorage.setItem('theme', this.theme());
		});
	}

	toggleTheme() {
		this.theme.update((current) =>
			current === 'light' ? 'dark' : 'light'
		);
	}

	ngOnInit() {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			this.theme.set(savedTheme);
		}
	}
}
```

## Models

Models can use signals for reactive properties:

```typescript
export class User {
	id = signal<string>('');
	name = signal<string>('');
	email = signal<string>('');

	constructor(data?: Partial<{ id: string; name: string; email: string }>) {
		if (data?.id) this.id.set(data.id);
		if (data?.name) this.name.set(data.name);
		if (data?.email) this.email.set(data.email);
	}

	update(data: Partial<{ name: string; email: string }>) {
		if (data.name) this.name.set(data.name);
		if (data.email) this.email.set(data.email);
	}
}
```

## Services with Signals

Services can expose state as signals:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class TodoService {
	private todos = signal<Todo[]>([]);
	private loading = signal<boolean>(false);
	private error = signal<string | null>(null);

	// Computed values derived from signals
	completedTodos = computed(() =>
		this.todos().filter((todo) => todo.completed)
	);
	incompleteTodos = computed(() =>
		this.todos().filter((todo) => !todo.completed)
	);

	// Public signals for components to consume
	// Allows read-only access to private signals
	todosList = this.todos.asReadonly();
	isLoading = this.loading.asReadonly();
	errorMessage = this.error.asReadonly();

	constructor(private http: HttpClient) {}

	loadTodos() {
		this.loading.set(true);
		this.error.set(null);

		this.http.get<Todo[]>('/api/todos').subscribe({
			next: (data) => {
				this.todos.set(data);
				this.loading.set(false);
			},
			error: (err) => {
				this.error.set(err.message);
				this.loading.set(false);
			},
		});
	}

	addTodo(title: string) {
		const newTodo: Todo = {
			id: Date.now().toString(),
			title,
			completed: false,
		};
		this.todos.update((current) => [...current, newTodo]);

		// API call to persist
		this.http.post<Todo>('/api/todos', newTodo).subscribe({
			error: (err) => {
				// Rollback on error
				this.todos.update((current) =>
					current.filter((t) => t.id !== newTodo.id)
				);
				this.error.set(err.message);
			},
		});
	}

	toggleTodo(id: string) {
		this.todos.update((current) =>
			current.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo
			)
		);

		// Persist change to API
		// ...
	}
}
```

## Working with RxJS and Signals

Integrating RxJS with signals:

```typescript
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';

@Component({
	selector: 'app-user-dashboard',
	template: `
		<div *ngIf="loading()">Loading...</div>
		<div *ngIf="error()">Error: {{ error() }}</div>

		<div *ngIf="activeUsers()">
			<h2>Active Users: {{ activeUsers()?.length }}</h2>
			<ul>
				<li *ngFor="let user of activeUsers()">{{ user.name }}</li>
			</ul>
		</div>
	`,
})
export class UserDashboardComponent implements OnInit {
	private userService = inject(UserService);

	// Convert observable to signal
	private usersSignal = toSignal(
		this.userService
			.getUsers()
			.pipe(map((users) => users.filter((user) => user.active))),
		{ initialValue: [] }
	);

	// Regular signals
	loading = signal(true);
	error = signal<string | null>(null);

	// Expose the signal directly
	activeUsers = this.usersSignal;

	ngOnInit() {
		try {
			this.userService.loadUsers().subscribe({
				next: () => this.loading.set(false),
				error: (err) => {
					this.error.set(err.message);
					this.loading.set(false);
				},
			});
		} catch (err) {
			this.error.set('Failed to load users');
			this.loading.set(false);
		}
	}
}
```

## Best Practices

1. **Signal Granularity**: Use individual signals for independent pieces of state
2. **Computed for Derived State**: Use computed signals for derived state
3. **Signal Collections**: Consider using a single signal for related collections
4. **Read-only Signals**: Expose signals as read-only when providing them to components
5. **Effects for Side Effects**: Use effects for side effects that run when signals change
6. **Signal Inputs**: Use signal-based inputs for component property binding in Angular 17+
7. **Lazy Evaluation**: Take advantage of the lazy evaluation nature of signals and computed values
