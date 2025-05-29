---
description: Overview of state management strategies in Angular applications.
globs: <root>/src/app/**/*.ts
alwaysApply: true
---

# State Management in Angular Applications

Effective state management is crucial for building scalable and maintainable Angular applications in {projectPath}. Angular offers several approaches, from simple component-level state to sophisticated global state solutions.

## 1. Component State

This is the most basic form of state management, suitable for data that is local to a component or shared directly between a parent and child.

-   **Local Properties**: Simple class properties within a component.

    ```typescript
    // my-component.component.ts
    import { Component } from '@angular/core';

    @Component({
    	selector: 'app-my-component',
    	template: `
    		<p>Counter: {{ count }}</p>
    		<button (click)="increment()">Increment</button>
    	`,
    })
    export class MyComponent {
    	count: number = 0;

    	increment() {
    		this.count++;
    	}
    }
    ```

-   **`@Input()` and `@Output()` for Parent-Child Communication**:
    -   `@Input()`: Allows a parent component to pass data down to a child component.
    -   `@Output()` (with `EventEmitter`): Allows a child component to emit events up to its parent.
        (Covered in more detail in `best-practices.md`).

## 2. Services with RxJS for Shared State

For state that needs to be shared across different components that are not directly related (e.g., siblings, or components in different parts of the component tree), Angular services combined with RxJS are a common and powerful pattern.

-   **`BehaviorSubject`**:

    -   A type of RxJS Subject that requires an initial value and emits its current value to new subscribers.
    -   Ideal for representing state that always has a current value.

    ```typescript
    // src/app/services/user.service.ts
    import { Injectable } from '@angular/core';
    import { BehaviorSubject, Observable } from 'rxjs';

    export interface User {
    	id: string;
    	name: string;
    }

    @Injectable({
    	providedIn: 'root',
    })
    export class UserService {
    	private currentUserSubject = new BehaviorSubject<User | null>(null);
    	public currentUser$: Observable<User | null> =
    		this.currentUserSubject.asObservable();

    	setCurrentUser(user: User | null) {
    		this.currentUserSubject.next(user);
    	}

    	clearUser() {
    		this.currentUserSubject.next(null);
    	}
    }
    ```

    Components can then inject `UserService` and subscribe to `currentUser$` or use the `async` pipe in templates.

-   **`Subject`**:

    -   A basic RxJS Subject that multicasts values to its Observers. It does not have an initial value and does not emit its current value to new subscribers.
    -   Useful for event buses or actions where only subsequent emissions are relevant.

-   **Stateful Services**: Services can hold state directly and provide methods to update and access it, often exposing Observables for reactive updates.

## 3. Global State Management Libraries

For larger applications with complex state interactions, dedicated global state management libraries provide more structure, tooling, and predictability.

### a. NgRx (Store, Actions, Reducers, Effects, Selectors)

NgRx is a powerful framework for building reactive applications in Angular, inspired by Redux. It implements the CQRS (Command Query Responsibility Segregation) pattern.

-   **Store**: A single, immutable data store for the entire application state.
-   **Actions**: Plain objects that describe unique events that have happened (e.g., `[User API] Load Users Success`).
-   **Reducers**: Pure functions that take the current state and an action, and return a new state. `(currentState, action) => newState`.
-   **Effects**: Handle side effects of actions, such as asynchronous operations (e.g., API calls). Effects listen for actions, perform tasks, and dispatch new actions.
-   **Selectors**: Pure functions that derive slices of state from the store for components to consume. Selectors can be memoized for performance.

**Conceptual Flow**:
Component dispatches Action -> Effect (optional, for side effects) -> Reducer updates State in Store -> Component subscribes to State via Selector.

While powerful, NgRx has a steeper learning curve and involves more boilerplate. It's typically recommended for applications where state predictability, testability, and dev tooling (like Redux DevTools) are critical.

### b. NGXS

NGXS is another state management library for Angular, aiming for less boilerplate than NgRx while still providing a robust solution.

-   **Store**: Similar to NgRx, holds the application state.
-   **Actions**: Define actions as classes.
-   **State Classes (`@State`)**: Define slices of state along with methods (`@Action`) to handle actions and update that state slice.
-   **Selectors (`@Selector`)**: Define functions to get slices of state.

NGXS often feels more object-oriented and can reduce boilerplate by co-locating state, actions, and reducers within state classes.

### c. Akita (by Datorama, now part of NetApp)

Akita is a state management pattern, built on top of RxJS, that uses a store-based approach with an object-oriented design. It focuses on simplicity and developer experience.

### d. Elf (by Netanel Basal)

Elf is a reactive immutable state management solution built on top of RxJS. It's designed to be simple, flexible, and performant, drawing inspiration from stores like Pinia (Vue) and Zustand (React).

## 4. Angular Signals (Angular 16+)

Angular Signals are a new reactive primitive introduced in Angular 16, providing a fine-grained reactivity system. While not a full state management library on their own for global state, they are a fundamental building block for managing local and shared state reactively.

-   **`signal(initialValue)`**: Creates a new signal that holds a value.
-   **`computed(() => ...)`**: Creates a signal whose value is derived from other signals.
-   **`effect(() => ...)`**: Registers a side effect that re-runs when any of its dependent signals change.

```typescript
// user-profile.component.ts
import { Component, signal, computed, effect } from '@angular/core';

@Component({
	/* ... */
})
export class UserProfileComponent {
	firstName = signal('Jane');
	lastName = signal('Doe');
	isEditing = signal(false);

	fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

	constructor() {
		effect(() => {
			console.log(`User full name: ${this.fullName()}`);
			// This effect runs whenever firstName or lastName changes.
		});
	}

	updateName(newFirst: string) {
		this.firstName.set(newFirst);
	}
}
```

Signals can be combined with services to create simple, reactive state stores without the overhead of larger libraries for certain use cases. They are expected to become a more integral part of Angular's state management story, potentially simplifying or influencing how libraries like NgRx work in the future.

## Choosing the Right Approach

-   **Local Component State**: For simple, isolated UI state.
-   **Services with RxJS**: Excellent for many scenarios involving shared state between a few components or features. Offers good balance of power and simplicity.
-   **Angular Signals**: For fine-grained reactivity within components and potentially for simpler shared state services. A modern approach that is becoming more prevalent.
-   **NgRx / NGXS / Other Libraries**: Consider for:
    -   Large applications with complex, interdependent state.
    -   When a single source of truth and predictable state mutations are paramount.
    -   When advanced dev tools (like time-travel debugging) are highly beneficial.
    -   When team consistency and a structured pattern are required for a large number of developers.

Often, a combination of these approaches is used within a single Angular application in {projectPath}. For example, global application settings might be in NgRx, while feature-specific shared state uses an RxJS service, and individual components manage their own UI state with local properties or signals.

```

```
