# React Testing Guide

This guide outlines the recommended approach to testing React applications in {projectPath}.

## Testing Pyramid

Follow the testing pyramid approach with:

1. **Unit tests**: Most numerous, testing individual components in isolation
2. **Integration tests**: Testing how components work together
3. **End-to-end tests**: Fewest in number, testing entire user flows

## Required Tools

These tools are essential for effective React testing:

-   **Jest**: Test runner and assertion library
-   **React Testing Library**: Component testing utilities focusing on user behaviors
-   **Mock Service Worker (MSW)**: API mocking
-   **Cypress/Playwright**: End-to-end testing

## Component Testing Best Practices

When writing component tests:

```jsx
// ✅ Do: Test behavior, not implementation
test('submits the form with user data when button is clicked', async () => {
	const handleSubmit = jest.fn();
	render(<Form onSubmit={handleSubmit} />);

	await userEvent.type(screen.getByLabelText('Username'), 'testuser');
	await userEvent.click(screen.getByRole('button', { name: /submit/i }));

	expect(handleSubmit).toHaveBeenCalledWith({ username: 'testuser' });
});

// ❌ Don't: Test implementation details
test('calls setState when input changes', () => {
	const setState = jest.spyOn(React, 'useState')[1];
	render(<MyComponent />);
	fireEvent.change(screen.getByRole('textbox'));
	expect(setState).toHaveBeenCalled();
});
```

## Component Test Structure

Organize your tests with arrange-act-assert pattern:

```jsx
describe('Component', () => {
	// Setup common test data/mocks
	beforeEach(() => {
		// Common setup
	});

	test('renders correctly', () => {
		// Arrange - setup specific to this test
		render(<Component />);

		// Act - user interactions
		userEvent.click(screen.getByRole('button'));

		// Assert - check the results
		expect(screen.getByText('Success')).toBeInTheDocument();
	});
});
```

## Mocking

Use these techniques for effective mocking:

```jsx
// Mock API calls with MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
	rest.get('/api/users', (req, res, ctx) => {
		return res(ctx.json({ users: [{ id: 1, name: 'Test User' }] }));
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock custom hooks
jest.mock('../hooks/useAuth', () => ({
	useAuth: () => ({
		user: { id: 1, name: 'Test User' },
		isAuthenticated: true,
	}),
}));
```

## Integration Testing

For integration testing, focus on component interactions:

```jsx
test('full login flow works', async () => {
	// Mock API response
	server.use(
		rest.post('/api/login', (req, res, ctx) => {
			return res(ctx.json({ token: 'fake-token' }));
		})
	);

	render(<LoginPage />);

	// Complete the login form
	await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
	await userEvent.type(screen.getByLabelText('Password'), 'password123');
	await userEvent.click(screen.getByRole('button', { name: /login/i }));

	// Verify we reached the success state
	expect(await screen.findByText('Welcome back')).toBeInTheDocument();
});
```

## End-to-End Testing

For end-to-end tests with Cypress:

```js
// cypress/e2e/authentication.cy.js
describe('Authentication', () => {
	it('allows a user to log in', () => {
		// Visit the login page
		cy.visit('/login');

		// Fill in login form
		cy.findByLabelText('Email').type('user@example.com');
		cy.findByLabelText('Password').type('password123');
		cy.findByRole('button', { name: /login/i }).click();

		// Verify successful login
		cy.url().should('include', '/dashboard');
		cy.findByText('Welcome back').should('be.visible');
	});
});
```

## Testing Custom Hooks

Test custom hooks with the `renderHook` utility:

```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from './useCounter';

test('should increment counter', () => {
	const { result } = renderHook(() => useCounter());

	act(() => {
		result.current.increment();
	});

	expect(result.current.count).toBe(1);
});
```

## Testing Redux

For Redux, focus on testing:

1. Reducers (pure functions)
2. Action creators
3. Selectors
4. Connected components (through their behavior, not Redux connections)

## File Organization

Organize test files in one of these ways:

1. **Co-located**: Test files alongside the components they test (`Button.js` and `Button.test.js`)
2. **Mirror structure**: Tests in a parallel directory structure (`src/components/Button.js` and `src/__tests__/components/Button.test.js`)

## Coverage Goals

Aim for these test coverage targets:

-   **Unit tests**: 80%+ coverage
-   **Integration tests**: Cover all main user flows
-   **E2E tests**: Cover critical paths like authentication, main features
