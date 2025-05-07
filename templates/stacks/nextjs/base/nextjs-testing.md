# Next.js Testing Guide

This guide outlines the recommended approach to testing Next.js applications in {projectPath}.

## Testing Stack

The recommended testing tools for Next.js applications:

-   **Jest**: Core testing framework
-   **React Testing Library**: Component testing
-   **@testing-library/jest-dom**: DOM assertions
-   **Mock Service Worker (MSW)**: API mocking
-   **Cypress/Playwright**: End-to-end testing
-   **@next/jest**: Next.js-specific Jest configuration

## Setting Up Testing Environment

Configure Jest with Next.js:

```js
// jest.config.js
const nextJest = require('@next/jest');

const createJestConfig = nextJest({
	// Path to Next.js app - set to where the next.config.js is
	dir: './',
});

const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleNameMapper: {
		// Handle module aliases (if you use them in tsconfig or jsconfig)
		'^@/components/(.*)$': '<rootDir>/components/$1',
		'^@/pages/(.*)$': '<rootDir>/pages/$1',
	},
	testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

Setup file:

```js
// jest.setup.js
import '@testing-library/jest-dom';
// Any global setup goes here
```

## Testing Pages

### Testing Client-Side Rendered Pages

```jsx
// pages/index.js
import { useState } from 'react';

export default function Home() {
	const [count, setCount] = useState(0);
	return (
		<div>
			<h1>Welcome to Next.js</h1>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

// __tests__/pages/index.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/pages/index';

describe('Home page', () => {
	it('renders the heading', () => {
		render(<Home />);
		expect(
			screen.getByRole('heading', { name: /welcome to next.js/i })
		).toBeInTheDocument();
	});

	it('increments counter on button click', () => {
		render(<Home />);
		const button = screen.getByRole('button', { name: /increment/i });

		expect(screen.getByText(/count: 0/i)).toBeInTheDocument();

		fireEvent.click(button);

		expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
	});
});
```

### Testing Pages with getServerSideProps

```jsx
// pages/users.js
export default function Users({ users }) {
	return (
		<div>
			<h1>Users</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>{user.name}</li>
				))}
			</ul>
		</div>
	);
}

export async function getServerSideProps() {
	const res = await fetch('https://jsonplaceholder.typicode.com/users');
	const users = await res.json();
	return { props: { users } };
}

// __tests__/pages/users.test.js
import { render, screen } from '@testing-library/react';
import Users from '@/pages/users';

describe('Users page', () => {
	it('renders users from props', () => {
		const mockUsers = [
			{ id: 1, name: 'John Doe' },
			{ id: 2, name: 'Jane Smith' },
		];

		render(<Users users={mockUsers} />);

		expect(
			screen.getByRole('heading', { name: /users/i })
		).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
	});
});
```

### Testing Pages with getStaticProps

Testing pages with getStaticProps is similar to testing with getServerSideProps, as you're testing the component with the props it would receive:

```jsx
// __tests__/pages/static-page.test.js
import { render, screen } from '@testing-library/react';
import StaticPage from '@/pages/static-page';

describe('Static page', () => {
	it('renders content from props', () => {
		const mockProps = {
			title: 'Static Page Title',
			content: 'This is static content',
		};

		render(<StaticPage {...mockProps} />);

		expect(
			screen.getByRole('heading', { name: mockProps.title })
		).toBeInTheDocument();
		expect(screen.getByText(mockProps.content)).toBeInTheDocument();
	});
});
```

## Testing API Routes

Create API mocks and test the handler directly:

```jsx
// pages/api/hello.js
export default function handler(req, res) {
	res.status(200).json({ message: 'Hello World' });
}

// __tests__/api/hello.test.js
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/hello';

describe('/api/hello', () => {
	it('returns a message', async () => {
		const { req, res } = createMocks({
			method: 'GET',
		});

		await handler(req, res);

		expect(res._getStatusCode()).toBe(200);
		expect(JSON.parse(res._getData())).toEqual({ message: 'Hello World' });
	});
});
```

## Testing App Router Components

For the App Router, test server and client components differently:

### Testing Server Components

Server components need to be tested with a special setup:

```jsx
// __tests__/app/ServerComponent.test.jsx
import { render } from '@testing-library/react';
import ServerComponent from '@/app/ServerComponent';

// Mock fetch for server components that make requests
global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({ data: 'mocked data' }),
	})
);

describe('ServerComponent', () => {
	it('renders server-fetched data', async () => {
		// Render the component (which would normally be server-rendered)
		const { container } = render(await ServerComponent());

		// Check the rendered output
		expect(container.textContent).toContain('mocked data');
	});
});
```

### Testing Client Components

Client components in the App Router can be tested like regular React components:

```jsx
// app/Counter.jsx (client component)
'use client';

import { useState } from 'react';

export default function Counter() {
	const [count, setCount] = useState(0);
	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

// __tests__/app/Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '@/app/Counter';

describe('Counter', () => {
	it('increments the count when clicked', () => {
		render(<Counter />);

		const button = screen.getByRole('button', { name: /increment/i });

		expect(screen.getByText(/count: 0/i)).toBeInTheDocument();

		fireEvent.click(button);

		expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
	});
});
```

## Testing Next.js Context Providers

Many Next.js apps use context providers. Here's how to test components that use them:

```jsx
// __tests__/contexts.test.jsx
import { render, screen } from '@testing-library/react';
import { MyContext } from '@/contexts/MyContext';
import MyComponent from '@/components/MyComponent';

describe('Component with context', () => {
	it('renders with context value', () => {
		const contextValue = { theme: 'dark', toggleTheme: jest.fn() };

		render(
			<MyContext.Provider value={contextValue}>
				<MyComponent />
			</MyContext.Provider>
		);

		expect(screen.getByText(/dark theme/i)).toBeInTheDocument();
	});
});
```

## Testing with Next.js Router

Test components that use the Next.js router:

```jsx
// For Pages Router
import { RouterContext } from 'next/dist/shared/lib/router-context';

const mockRouter = {
	pathname: '/',
	route: '/',
	query: {},
	asPath: '/',
	push: jest.fn(),
	replace: jest.fn(),
	back: jest.fn(),
};

// In your test
render(
	<RouterContext.Provider value={mockRouter}>
		<MyComponent />
	</RouterContext.Provider>
);

// For App Router
import { useRouter } from 'next/navigation';

// Mock the hook
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}));

// Setup the mock implementation for each test
useRouter.mockImplementation(() => ({
	push: jest.fn(),
	replace: jest.fn(),
	back: jest.fn(),
}));
```

## End-to-End Testing

Use Cypress or Playwright for E2E testing:

```js
// cypress/e2e/homepage.cy.js
describe('Homepage', () => {
	it('navigates to about page when clicking the link', () => {
		cy.visit('/');
		cy.findByText('About').click();
		cy.url().should('include', '/about');
		cy.findByRole('heading', { name: /about us/i }).should('be.visible');
	});
});
```

## Testing Best Practices

1. **Test behavior, not implementation**: Focus on what the user experiences.
2. **Mock API requests**: Use MSW to intercept network requests.
3. **Test common user flows**: Prioritize testing common user journeys.
4. **Separate unit and integration tests**: Maintain a distinction between unit tests for individual components and integration tests for features.
5. **Organize tests by feature**: Structure tests to mirror your app's organization.

## Code Coverage

Aim for high test coverage, especially for critical paths:

```json
// package.json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

Coverage thresholds can be set in jest.config.js:

```js
const customJestConfig = {
	// ...other config
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
};
```
