---
description: Testing strategies, tools, and best practices for Angular applications.
globs: <root>/src/**/*.spec.ts
alwaysApply: true
---

# Testing Angular Applications

Testing is a fundamental part of developing high-quality Angular applications in {projectPath}. Angular is designed with testability in mind and provides a robust testing framework and utilities.

## The Testing Pyramid

A balanced testing strategy typically follows the testing pyramid:

1.  **Unit Tests (Most Numerous)**:
    -   **Focus**: Test individual classes, methods, pipes, or functions in isolation.
    -   **Speed**: Very fast.
    -   **Tools**: Jasmine (framework), Karma (test runner for browser environment), Angular TestBed (for some isolated class tests without DOM).

2.  **Component Tests (Integration/Shallow Integration Tests - Moderate Number)**:
    -   **Focus**: Test Angular components: their templates, class logic, interaction with dependencies (often mocked), and user interactions.
    -   **Speed**: Slower than unit tests, faster than E2E.
    -   **Tools**: Angular TestBed, Jasmine.

3.  **End-to-End (E2E) Tests (Fewest)**:
    -   **Focus**: Test complete user flows through the application, simulating real user scenarios in a browser.
    -   **Speed**: Slowest.
    -   **Tools**: Traditionally Protractor (now deprecated by Angular team). Current recommendations include WebdriverIO, Cypress, or Playwright. Angular CLI can generate E2E setups for these.

## Key Testing Tools & Concepts

-   **Jasmine**: The default testing framework for Angular projects. It provides functions like `describe()`, `it()`, `expect()`, `beforeEach()`, `afterEach()`, spies (`spyOn()`), etc.
-   **Karma**: The default test runner. It executes tests in a browser environment, allowing you to test code that interacts with the DOM.
-   **Angular TestBed**:
    -   Angular's primary utility for writing component tests. It creates an Angular module environment for the component under test.
    -   Allows you to configure a testing module, declare components, provide mock services, and interact with the component.
    -   Key methods: `TestBed.configureTestingModule()`, `TestBed.createComponent()`.
-   **`ComponentFixture<T>`**:
    -   A handle on an instance of the tested component and its associated DOM element.
    -   Provides access to the component instance (`fixture.componentInstance`), its `DebugElement` (`fixture.debugElement`), and methods to trigger change detection (`fixture.detectChanges()`).
-   **`DebugElement`**: An Angular abstraction that provides a way to inspect component and DOM element properties. `debugElement.nativeElement` gives access to the actual DOM element.
-   **Spies, Stubs, and Mocks**:
    -   **Spies (`jasmine.createSpy()` or `spyOn(object, 'methodName')`)**: Track calls to functions, their arguments, and can optionally fake their implementation.
    -   **Stubs**: Replace functions with pre-programmed behavior, often returning specific values.
    -   **Mocks**: Objects that simulate the behavior of real dependencies. In Angular, you often provide mock implementations of services in `TestBed`.

## Writing Component Tests

Component tests are crucial for ensuring your UI behaves as expected.

```typescript
// my-greeter.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-my-greeter',
  template: `
    <h1>Hello, {{ name }}!</h1>
    <button (click)="greet.emit('Hi from ' + name)">Greet Parent</button>
  `
})
export class MyGreeterComponent {
  @Input() name: string = 'World';
  @Output() greet = new EventEmitter<string>();
}

// my-greeter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser'; // For querying DOM elements
import { MyGreeterComponent } from './my-greeter.component';

describe('MyGreeterComponent', () => {
  let component: MyGreeterComponent;
  let fixture: ComponentFixture<MyGreeterComponent>;
  let h1: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyGreeterComponent] // Declare the component being tested
    }).compileComponents(); // Compile template and css

    fixture = TestBed.createComponent(MyGreeterComponent);
    component = fixture.componentInstance; // Get component instance
    h1 = fixture.debugElement.query(By.css('h1')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default name if no input provided', () => {
    fixture.detectChanges(); // Trigger change detection
    expect(h1.textContent).toContain('Hello, World!');
  });

  it('should display provided name via @Input', () => {
    component.name = 'Angular';
    fixture.detectChanges();
    expect(h1.textContent).toContain('Hello, Angular!');
  });

  it('should emit greet event when button is clicked', () => {
    spyOn(component.greet, 'emit'); // Spy on the EventEmitter

    component.name = 'Tester';
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click(); // Simulate button click

    expect(component.greet.emit).toHaveBeenCalledWith('Hi from Tester');
  });
});
```

## Testing Services

Services often contain business logic or data access that needs to be tested.

```typescript
// data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('/api/data');
  }

  postData(item: any) {
    if (!item) {
      return throwError(() => new Error('Item cannot be null'));
    }
    return this.http.post('/api/data', item);
  }
}

// data.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Mock HttpClient
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve data successfully', () => {
    const mockData = [{ id: 1, name: 'Test' }];
    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData); // Provide mock response
  });

  it('should return an error if item is null for postData', (done) => {
    service.postData(null).subscribe({
      error: (err) => {
        expect(err.message).toBe('Item cannot be null');
        done();
      }
    });
  });
});
```

## Testing Pipes

```typescript
// initial.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initial' })
export class InitialPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.charAt(0).toUpperCase() + '.' : '';
  }
}

// initial.pipe.spec.ts
import { InitialPipe } from './initial.pipe';

describe('InitialPipe', () => {
  let pipe: InitialPipe;

  beforeEach(() => {
    pipe = new InitialPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the first letter capitalized with a dot', () => {
    expect(pipe.transform('john')).toBe('J.');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });
});
```

## Code Coverage

Angular CLI integrates with Karma to produce code coverage reports (often using Istanbul).
-   Run tests with coverage: `ng test --no-watch --code-coverage`
-   Reports are typically generated in a `coverage/` directory.
-   Aim for meaningful coverage, not just high percentages. Ensure critical logic paths are tested.

## Community Libraries for Testing

-   **Spectator (by Netanel Basal)**: Provides a higher-level API for testing Angular components, directives, and services, reducing boilerplate.
-   **ng-mocks (by Isaac Dat Dresner)**: A library for mocking dependencies in Angular tests with a focus on type safety and ease of use.

## End-to-End (E2E) Testing Considerations

-   **Selector Strategy**: Use robust selectors (e.g., `data-testid` attributes) that are less prone to break with UI changes.
-   **Page Object Model (POM)**: A design pattern to create an object repository for UI elements, making tests more readable and maintainable.
-   **Wait Strategies**: Use explicit waits for elements to appear or become interactive to avoid flaky tests.

By implementing a comprehensive testing strategy using these tools and practices, you can ensure the reliability and quality of your Angular application in {projectPath}.
```
