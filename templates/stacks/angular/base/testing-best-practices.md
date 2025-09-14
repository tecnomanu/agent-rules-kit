---
description: Testing best practices for Angular applications
globs: <root>/src/**/*.spec.ts
alwaysApply: false
---

# Angular Testing Best Practices

This guide outlines the recommended testing practices for Angular applications in {projectPath}, covering unit testing, integration testing, and end-to-end testing patterns.

## Testing Framework Setup

### Jasmine and Karma (Default)

Angular comes with Jasmine and Karma pre-configured:

```typescript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['Chrome'],
    singleRun: false
  });
};
```

## Component Testing

### Basic Component Testing

```typescript
// user-profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name when user is provided', () => {
    // Arrange
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Act
    component.user = mockUser;
    fixture.detectChanges();

    // Assert
    const nameElement = fixture.debugElement.query(By.css('[data-testid="user-name"]'));
    expect(nameElement.nativeElement.textContent).toContain('John Doe');
  });

  it('should emit edit event when edit button is clicked', () => {
    // Arrange
    spyOn(component.edit, 'emit');
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    component.user = mockUser;
    fixture.detectChanges();

    // Act
    const editButton = fixture.debugElement.query(By.css('[data-testid="edit-button"]'));
    editButton.nativeElement.click();

    // Assert
    expect(component.edit.emit).toHaveBeenCalledWith(mockUser);
  });
});
```

### Testing Components with Dependencies

```typescript
// product-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../services/product.service';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts']);

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should load products on init', () => {
    // Arrange
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 }
    ];
    productService.getProducts.and.returnValue(of(mockProducts));

    // Act
    component.ngOnInit();

    // Assert
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });

  it('should handle error when loading products fails', () => {
    // Arrange
    const errorMessage = 'Failed to load products';
    productService.getProducts.and.returnValue(throwError(errorMessage));
    spyOn(console, 'error');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.products).toEqual([]);
    expect(component.error).toBe(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error loading products:', errorMessage);
  });
});
```

## Service Testing

### HTTP Service Testing

```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users', () => {
    // Arrange
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    // Act
    service.getUsers().subscribe(users => {
      // Assert
      expect(users).toEqual(mockUsers);
    });

    // Assert HTTP request
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create user', () => {
    // Arrange
    const newUser = { name: 'New User', email: 'new@example.com' };
    const createdUser = { id: '3', ...newUser };

    // Act
    service.createUser(newUser).subscribe(user => {
      // Assert
      expect(user).toEqual(createdUser);
    });

    // Assert HTTP request
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(createdUser);
  });
});
```

## Form Testing

```typescript
// user-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate required fields', () => {
    // Act
    component.userForm.get('name')?.setValue('');
    component.userForm.get('email')?.setValue('');

    // Assert
    expect(component.userForm.get('name')?.hasError('required')).toBeTruthy();
    expect(component.userForm.get('email')?.hasError('required')).toBeTruthy();
    expect(component.userForm.invalid).toBeTruthy();
  });

  it('should validate email format', () => {
    // Act
    component.userForm.get('email')?.setValue('invalid-email');

    // Assert
    expect(component.userForm.get('email')?.hasError('email')).toBeTruthy();
  });

  it('should emit form data on valid submission', () => {
    // Arrange
    spyOn(component.formSubmit, 'emit');
    component.userForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com'
    });

    // Act
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);

    // Assert
    expect(component.formSubmit.emit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});
```

## Testing Utilities

```typescript
// testing/test-utils.ts
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

export class TestingUtils {
  static getByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  static clickElement<T>(fixture: ComponentFixture<T>, testId: string): void {
    const element = this.getByTestId(fixture, testId);
    element.nativeElement.click();
    fixture.detectChanges();
  }

  static setInputValue<T>(fixture: ComponentFixture<T>, testId: string, value: string): void {
    const input = this.getByTestId(fixture, testId);
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}
```

## Best Practices Summary

1. **Use TestBed.configureTestingModule()** for component and service testing
2. **Mock all dependencies** using jasmine.createSpyObj()
3. **Use data-testid attributes** for reliable element selection
4. **Test behavior, not implementation** details
5. **Keep tests isolated** - each test should be independent
6. **Use descriptive test names** that explain what is being tested
7. **Follow AAA pattern** (Arrange, Act, Assert)
8. **Test both happy path and error scenarios**
9. **Maintain good test coverage** (aim for 80%+ code coverage)
