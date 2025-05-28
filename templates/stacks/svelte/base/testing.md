---
description: Testing strategies and tools for Svelte applications.
globs: <root>/src/**/*.spec.{js,ts},<root>/src/**/*.test.{js,ts},<root>/tests/**/*.{js,ts}
alwaysApply: true
---

# Testing Svelte Applications

Testing is a crucial part of building reliable and maintainable Svelte applications in {projectPath}. A good testing strategy typically involves a mix of unit, component, and end-to-end (E2E) tests.

## The Testing Pyramid

A common approach to balancing your testing efforts:

1.  **Unit Tests (Most Numerous)**:
    -   **Focus**: Test individual JavaScript/TypeScript functions, modules, or stores in isolation.
    -   **Speed**: Very fast.
    -   **Tools**: Vitest or Jest.

2.  **Component Tests (Moderate Number)**:
    -   **Focus**: Test individual Svelte components – their rendering, interactions, props, events, and slots.
    -   **Speed**: Slower than unit tests, faster than E2E.
    -   **Tools**: Svelte Testing Library (STL) running on top of Vitest or Jest.

3.  **End-to-End (E2E) Tests (Fewest)**:
    -   **Focus**: Test complete user flows through the application, simulating real user scenarios in a browser.
    -   **Speed**: Slowest.
    -   **Tools**: Playwright, Cypress.

## Tools and Libraries

### 1. Vitest
-   **Role**: A fast and modern test runner developed by the Vite team. It's often preferred in Vite-based Svelte projects (including SvelteKit) for its speed and ESM-first approach.
-   **Features**: Jest-compatible API, smart & instant watch mode, out-of-the-box TypeScript and JSX support.
-   **Setup**: Typically configured in `vite.config.js` or `vitest.config.js`.

### 2. Jest
-   **Role**: A popular and comprehensive JavaScript testing framework.
-   **Features**: Test execution, assertion library, mocking, code coverage.
-   **Setup**: Requires more configuration for Svelte projects, often involving Babel or `svelte-jester`.

### 3. Svelte Testing Library (STL)
-   **Role**: Provides utilities to test Svelte components in a way that encourages good testing practices and resembles how users interact with them. Built on top of DOM Testing Library.
-   **Philosophy**: Test behavior, not implementation details. Query components by accessible roles, text, labels, etc.
-   **Key Functions**:
    -   `render(Component, { props })`: Renders a Svelte component.
    -   `screen`: Object with query methods (e.g., `getByText`, `findByRole`, `queryByTestId`).
    -   `fireEvent`: Simulates DOM events (e.g., `fireEvent.click`, `fireEvent.input`).
    -   `@testing-library/user-event`: A companion library for more realistic user interaction simulation.

## Writing Tests

### Unit Testing (Example with Vitest/Jest)

```javascript
// utils/math.js
export function add(a, b) {
  return a + b;
}

// utils/math.test.js
import { describe, it, expect } from 'vitest'; // or from '@jest/globals'
import { add } from './math';

describe('add function', () => {
  it('should return the sum of two numbers', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
  });
});
```

### Component Testing (Example with Svelte Testing Library + Vitest/Jest)

```svelte
<!-- MyCounter.svelte -->
<script lang="ts">
  export let initialCount = 0;
  let count = initialCount;

  function increment() {
    count += 1;
    dispatch('incremented', { newCount: count });
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<button on:click={increment}>
  Count: {count}
</button>
```

```javascript
// MyCounter.test.js
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest'; // vi for Vitest mocks
import MyCounter from './MyCounter.svelte';

describe('MyCounter component', () => {
  it('renders with initial count and increments on click', async () => {
    const { component } = render(MyCounter, { props: { initialCount: 5 } });

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Count: 5');

    await fireEvent.click(button);
    expect(button).toHaveTextContent('Count: 6');
  });

  it('emits an "incremented" event with the new count', async () => {
    const { component } = render(MyCounter, { props: { initialCount: 0 } });
    const mockEventHandler = vi.fn(); // Vitest mock function

    // Listen to the custom event
    component.$on('incremented', mockEventHandler);

    const button = screen.getByRole('button');
    await fireEvent.click(button);

    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { newCount: 1 } })
    );
  });

  // Test slots:
  // Use `getByText` or other queries to find content passed into slots.
  // Example: If <MyCounter><p>Slot Content</p></MyCounter>
  // render(MyCounter, {}, { slots: { default: '<p>Slot Content</p>' }});
  // expect(screen.getByText('Slot Content')).toBeInTheDocument();
});
```

### Testing Reactivity and Stores

-   **Reactivity**: Test component behavior that relies on Svelte's reactivity by interacting with the component (e.g., `fireEvent`) and asserting the expected DOM updates.
-   **Stores**:
    -   Unit test store logic directly by importing store functions (`set`, `update`) and asserting their effects on the store's value (by subscribing manually or using `get` from `svelte/store`).
    -   For component tests, pass mock stores as props or use context if stores are provided via context. Svelte Testing Library will interact with components that use stores naturally.

### Mocking

-   **Modules**: Vitest and Jest provide `vi.mock('modulePath', ...)` or `jest.mock('modulePath', ...)` to mock entire modules.
    ```javascript
    // Example: Mocking a fetch call
    // __mocks__/axios.js or using vi.mock
    // global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({data: 'mocked'}) }));
    ```
-   **APIs**: For API calls, use libraries like `msw` (Mock Service Worker) or mock `fetch` directly.

## End-to-End (E2E) Testing

-   **Playwright**: A modern E2E testing framework by Microsoft. Supports multiple browsers, auto-waits, and has good SvelteKit integration.
-   **Cypress**: Another popular E2E testing framework.
-   **Focus**: Test critical user journeys, such as authentication, form submissions, and core application workflows.
-   **SvelteKit Note**: SvelteKit has built-in support for Playwright tests, making setup easier.

By implementing a balanced testing strategy using these tools and techniques, you can ensure the quality and stability of your Svelte applications developed in {projectPath}.
```
