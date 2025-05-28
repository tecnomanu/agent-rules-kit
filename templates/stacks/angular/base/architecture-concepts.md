---
description: Core architectural concepts of Angular applications, including modules, components, services, and project structure.
globs: <root>/src/app/**/*.ts,<root>/angular.json
alwaysApply: true
---

# Angular Architectural Concepts

Angular is a comprehensive platform and framework for building client-side applications in HTML, and TypeScript. It has a component-based architecture that promotes modularity, reusability, and testability. Understanding these core concepts is essential for developing applications in {projectPath}.

## 1. Modules (`@NgModule`)

Angular applications are organized into **NgModules**. An NgModule is a class decorated with `@NgModule` that collects related code into a functional unit. Every Angular app has at least one root module, conventionally named `AppModule`.

Key metadata properties of `@NgModule`:

-   **`declarations`**: Components, directives, and pipes that belong to this NgModule. These are private to the module unless exported.
-   **`imports`**: Other NgModules whose exported declarations are needed by components in this NgModule.
-   **`providers`**: Services that this NgModule contributes to the collection of global services; they become accessible in all parts of the app. Can also be scoped to specific components/modules.
-   **`exports`**: A subset of `declarations` that should be visible and usable in the component templates of other NgModules that import this NgModule.
-   **`bootstrap`**: The main application view, called the root component, which hosts all other app views. Only the root NgModule should set this `bootstrap` property.

```typescript
// src/app/app.module.ts (Root Module Example)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // For routing

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UserService } from './services/user.service';
// ... other imports

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
    // ... other components, directives, pipes
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]) // Example: setting up app-level routes
    // ... other modules (e.g., HttpClientModule, FormsModule, FeatureModules)
  ],
  providers: [
    UserService // Service available application-wide
  ],
  bootstrap: [AppComponent] // Root component to bootstrap
})
export class AppModule { }
```
Feature modules are NgModules created to organize code for a specific application feature or domain.

## 2. Components (`@Component`)

Components are the main building blocks of Angular UIs. A component controls a patch of screen called a view. It consists of:
-   A TypeScript class decorated with `@Component`.
-   An HTML template that declares what renders on the page.
-   Optionally, CSS styles for the template.

Key metadata properties of `@Component`:
-   **`selector`**: A CSS selector that identifies how the component is used in a template (e.g., `<app-user-profile>`).
-   **`templateUrl`**: Path to an external HTML file for the component's view.
-   **`template`**: Inline HTML template.
-   **`styleUrls`**: Array of paths to external CSS/SCSS files.
-   **`styles`**: Array of inline CSS strings.
-   **`providers`**: Array of providers for services that are scoped to this component and its children.
-   **`changeDetection`**: Strategy for change detection (e.g., `ChangeDetectionStrategy.OnPush`).

```typescript
// src/app/user-profile/user-profile.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../models/user.model'; // Assuming a User model

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  @Input() user: User | null = null; // Input property

  constructor() { }

  ngOnInit(): void {
    // Lifecycle hook: component initialization logic
  }
}
```

### Component Lifecycle Hooks
Components have a lifecycle managed by Angular. Key hooks include:
-   `constructor()`: Called when Angular creates the component/directive.
-   `ngOnChanges()`: Called before `ngOnInit()` and when data-bound input properties change.
-   `ngOnInit()`: Called once, after the first `ngOnChanges()`. Initialize the component/directive.
-   `ngDoCheck()`: Called during every change detection run. For custom change detection.
-   `ngAfterContentInit()`: Called once after content (projected content via `<ng-content>`) has been initialized.
-   `ngAfterContentChecked()`: Called after every check of projected content.
-   `ngAfterViewInit()`: Called once after the component's view (and child views) has been initialized.
-   `ngAfterViewChecked()`: Called after every check of the component's view (and child views).
-   `ngOnDestroy()`: Called just before Angular destroys the component/directive. Unsubscribe Observables and detach event handlers to avoid memory leaks.

## 3. Directives (`@Directive`)

Directives are classes decorated with `@Directive` that can add new behavior to elements in the template or transform their appearance.
-   **Structural Directives**: Shape or reshape the DOM's structure, typically by adding, removing, or manipulating elements. Examples: `*ngIf`, `*ngFor`, `*ngSwitch`.
-   **Attribute Directives**: Change the appearance or behavior of an element, component, or another directive. Examples: `ngClass`, `ngStyle`.

```typescript
// src/app/directives/highlight.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = 'yellow'; // Allow custom color via input

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor || 'yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(''); // Remove highlight
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

## 4. Services (`@Injectable`) and Dependency Injection (DI)

Services are typically classes decorated with `@Injectable` that encapsulate business logic, data access, or other reusable functionality. Angular's Dependency Injection (DI) system provides services to components, directives, or other services that need them.

-   **`@Injectable()`**: Marks a class as available to be provided and injected as a dependency.
    -   `providedIn: 'root'`: Registers the service with the root injector, making it a singleton available application-wide.
-   **DI Mechanism**: Components declare their dependencies by listing them as constructor parameters. Angular's injector handles creating and providing instances.

```typescript
// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // For API calls
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Singleton service
})
export class DataService {
  constructor(private http: HttpClient) { } // HttpClient injected

  getItems(): Observable<any[]> {
    return this.http.get<any[]>('/api/items');
  }
}

// src/app/my-feature/my-feature.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({ /* ... */ })
export class MyFeatureComponent implements OnInit {
  items: any[] = [];
  constructor(private dataService: DataService) {} // DataService injected

  ngOnInit() {
    this.dataService.getItems().subscribe(data => this.items = data);
  }
}
```

## 5. Routing (`RouterModule`)

Angular's `RouterModule` enables navigation from one view to the next as users perform application tasks.
-   **`Routes`**: An array of route configuration objects. Each object defines a path, the component to display, and optional data, guards, or resolvers.
-   **`RouterModule.forRoot(routes)`**: Called in the root module (`AppModule`) to provide the router service and initial routes.
-   **`RouterModule.forChild(routes)`**: Used in feature modules to provide additional routes.
-   **`<router-outlet>`**: A directive that acts as a placeholder in a component's template where routed views are displayed.
-   **`routerLink`**: A directive for declarative navigation using links in templates (e.g., `<a routerLink="/users">Users</a>`).
-   **Route Guards**: Control access to routes (e.g., `CanActivate`, `CanDeactivate`).
-   **Route Resolvers**: Fetch data before a route is activated.

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserListComponent } from './users/user-list/user-list.component'; // Example

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  // { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) }, // Lazy loading
  { path: '**', redirectTo: '' } // Wildcard route for a 404 page or redirect
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// And import AppRoutingModule into AppModule's imports array.
```

## Standard Project Structure (Angular CLI)

The Angular CLI generates a standard project structure:
-   **`src/`**: Contains most of the application code.
    -   **`app/`**: The root component (`app.component.ts`), root module (`app.module.ts`), and routing module (`app-routing.module.ts`) live here. Feature modules and components are typically created in subdirectories.
    -   **`assets/`**: Static assets like images, fonts, etc.
    -   **`environments/`**: Configuration files for different environments (e.g., `environment.ts`, `environment.prod.ts`).
    -   **`styles.scss` (or `.css`)**: Global stylesheet.
    -   **`main.ts`**: The main entry point that bootstraps the `AppModule`.
    -   **`index.html`**: The main HTML page.
-   **`angular.json`**: CLI configuration file, including build, serve, and test options, project structure, and asset management.
-   **`tsconfig.json` (and variants)**: TypeScript compiler configuration.
-   **`package.json`**: Project dependencies and scripts.

This architecture provides a solid foundation for building scalable and maintainable applications with Angular in {projectPath}.
```
