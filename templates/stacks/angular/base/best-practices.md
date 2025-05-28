---
description: Best practices for developing robust and maintainable Angular applications.
globs: <root>/src/app/**/*.ts,<root>/src/app/**/*.html
alwaysApply: true
---

# Angular Best Practices

Adhering to best practices is crucial for building scalable, maintainable, and performant Angular applications in {projectPath}. This guide covers key areas from component communication to performance optimization.

## Component Communication Patterns

Effective communication between components is key to a well-structured application.

-   **`@Input()` and `@Output()` with `EventEmitter`**:
    -   **`@Input()`**: Use to pass data from a parent component to a child component. Keep `@Input()` properties immutable if possible or handle changes in `ngOnChanges`.
        ```typescript
        // child.component.ts
        @Input() product: Product;
        ```
    -   **`@Output()`**: Use with `EventEmitter` to allow child components to emit events to their parent. This is the standard way for children to communicate data or actions upwards.
        ```typescript
        // child.component.ts
        @Output() itemAddedToCart = new EventEmitter<CartItem>();
        addToCart(item: CartItem) {
          this.itemAddedToCart.emit(item);
        }
        ```
-   **`@ViewChild()`, `@ViewChildren()`, `@ContentChild()`, `@ContentChildren()`**:
    -   Use to access child components, directives, or DOM elements directly from a parent component.
    -   `@ViewChild`/`@ViewChildren`: Access elements within the component's own template.
    -   `@ContentChild`/`@ContentChildren`: Access elements projected into the component via `<ng-content>`.
    -   Use these sparingly, as they create tighter coupling than `@Input`/`@Output`. Prefer them for interactions that are inherently view-related.

-   **Service-Based Communication**:
    -   For communication between components that are not directly related (e.g., siblings, or components in different parts of the application), use a shared service.
    -   The service can use RxJS Subjects (`BehaviorSubject`, `Subject`) to facilitate communication. (See "State Management" guide for more).

## Effective RxJS Usage

RxJS is integral to Angular for handling asynchronous operations and state.

-   **Use Pipeable Operators**: Chain multiple operators using the `pipe()` method for cleaner and more readable code.
    ```typescript
    this.dataService.getItems().pipe(
      filter(items => items.length > 0),
      map(items => items.map(item => ({ ...item, processed: true }))),
      catchError(err => {
        console.error(err);
        return of([]); // Return a safe value or re-throw
      })
    ).subscribe(processedItems => this.items = processedItems);
    ```
-   **Error Handling**: Always handle errors in your Observables using operators like `catchError`, `retry`, or `retryWhen`.
-   **Unsubscribing**: Prevent memory leaks by unsubscribing from Observables when a component is destroyed.
    -   **`async` pipe**: The easiest and often preferred way. Angular manages the subscription automatically.
        ```html
        <!-- my-component.component.html -->
        <div *ngIf="items$ | async as items">
          <ul><li *ngFor="let item of items">{{ item.name }}</li></ul>
        </div>
        ```
    -   **`takeUntil()`**: Use a Subject that emits in `ngOnDestroy` to complete Observables.
        ```typescript
        // my-component.component.ts
        private destroy$ = new Subject<void>();
        ngOnInit() {
          this.dataService.getData().pipe(
            takeUntil(this.destroy$)
          ).subscribe(...);
        }
        ngOnDestroy() {
          this.destroy$.next();
          this.destroy$.complete();
        }
        ```
    -   **Manual `unsubscribe()`**: Call `subscription.unsubscribe()` in `ngOnDestroy`. Less common now due to `async` pipe and `takeUntil`.

## Change Detection Strategies

Angular's change detection mechanism updates the view when data changes.
-   **`ChangeDetectionStrategy.OnPush`**:
    -   Use this strategy for components whose inputs are immutable or only change when new references are passed.
    -   This can significantly improve performance by reducing the number of components Angular needs to check during each change detection cycle.
    -   When `OnPush` is used, Angular will only run change detection on the component if:
        1.  One of its `@Input()` properties changes by reference.
        2.  An event originating from the component (or one of its children) is triggered.
        3.  `ChangeDetectorRef.detectChanges()` or `ChangeDetectorRef.markForCheck()` is explicitly called.
        4.  An Observable linked to the template via the `async` pipe emits a new value.
    ```typescript
    import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

    @Component({
      selector: 'app-product-item',
      template: `<div>{{ product.name }}</div>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class ProductItemComponent {
      @Input() product: Product;
    }
    ```

## Lazy Loading Feature Modules

Improve initial load time by lazy loading feature modules. Angular's router loads these modules on demand when the user navigates to their routes.
-   **Configuration in `AppRoutingModule`**:
    ```typescript
    // app-routing.module.ts
    const routes: Routes = [
      // ... other routes
      {
        path: 'customers',
        loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
      }
    ];
    ```
    This creates separate JavaScript bundles for each lazy-loaded module.

## Performance Tips

-   **`trackBy` in `*ngFor`**:
    -   When rendering lists with `*ngFor`, provide a `trackBy` function if the list items have a unique identifier.
    -   This helps Angular optimize DOM manipulations by identifying items that have been added, removed, or reordered, rather than re-rendering the entire list.
    ```html
    <!-- my-list.component.html -->
    <ul>
      <li *ngFor="let item of items; trackBy: trackById">
        {{ item.name }}
      </li>
    </ul>
    ```
    ```typescript
    // my-list.component.ts
    trackById(index: number, item: Item): string {
      return item.id; // Assuming 'id' is a unique property
    }
    ```
-   **Pure Pipes**:
    -   Pipes transform data in templates. By default, pipes are "pure," meaning Angular re-evaluates them only if their input value(s) change by reference.
    -   Avoid making pipes impure (`pure: false`) unless absolutely necessary, as impure pipes run on every change detection cycle.
-   **Ahead-of-Time (AOT) Compilation**:
    -   AOT is the default for production builds in Angular. It compiles Angular HTML and TypeScript into efficient JavaScript code during the build phase.
    -   This results in faster rendering, smaller bundle sizes, and earlier detection of template errors.
-   **Optimize Bundle Size**:
    -   Analyze your bundle using tools like `webpack-bundle-analyzer` (via `ng build --stats-json` and then `webpack-bundle-analyzer path/to/stats.json`).
    -   Remove unused code and dependencies.
    -   Consider smaller alternatives for large libraries if possible.

## Smart vs. Presentational Components (Container/Presentational Pattern)

This pattern helps separate concerns and improve reusability.
-   **Presentational (Dumb) Components**:
    -   Focus on how things look.
    -   Receive data via `@Input()` and emit events via `@Output()`.
    -   Have no dependencies on services or application state beyond their inputs.
    -   Often use `ChangeDetectionStrategy.OnPush`.
    -   Highly reusable.
-   **Smart (Container) Components**:
    -   Focus on how things work.
    -   Provide data to presentational components.
    -   Interact with services, manage state, and handle application logic.
    -   Are often route-level components or components that orchestrate several presentational components.

## Angular Signals (Angular 16+)

Angular Signals introduce a new fine-grained reactivity system.
-   **State Management**: Signals can be used for managing component state reactively.
    ```typescript
    import { Component, signal, computed } from '@angular/core';

    @Component({ /* ... */ })
    export class CounterComponent {
      count = signal(0); // Writable signal
      isEven = computed(() => this.count() % 2 === 0); // Computed signal

      increment() {
        this.count.update(c => c + 1);
      }
    }
    ```
-   **Change Detection**: Components using signals can potentially benefit from more granular change detection in the future (Zone.js might become optional for signal-based components).
-   **Integration with RxJS**: `rxjs-interop` package allows conversion between Observables and Signals.
-   **Adoption**: Gradually incorporate signals into new components or refactor existing ones where fine-grained reactivity offers benefits. They are a modern approach that simplifies many reactive scenarios.

By incorporating these best practices, developers working on {projectPath} can create Angular applications that are more efficient, easier to maintain, and provide a better user experience.
```
