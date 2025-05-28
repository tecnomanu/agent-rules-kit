---
description: Testing strategies and tools for SvelteKit applications.
globs: <root>/src/**/*.test.{js,ts},<root>/tests/**/*.{js,ts,svelte}
alwaysApply: true
---

# Testing SvelteKit Applications

Testing is essential for building reliable SvelteKit applications. SvelteKit projects are typically tested using Vitest for unit and component tests, and Playwright for end-to-end tests.

## Testing Setup

Most SvelteKit project templates include a basic setup for Vitest and Playwright.
- **Vitest Configuration**: Often found in `vite.config.js` or a dedicated `vitest.config.js`. Ensure it's configured to handle Svelte components (e.g., via `vite-plugin-svelte`).
- **Playwright Configuration**: `playwright.config.ts` (or `.js`) defines browser settings, base URL, etc. Playwright tests are usually placed in a top-level `tests` directory.
- **Environment**: Tests often run in a Node.js environment (for Vitest) or a browser environment (for Playwright). Be mindful of where your code expects to run.

## Unit Testing (with Vitest)

Unit tests focus on individual functions, modules, or stores in isolation.
- **Location**: Typically co-located with the source code, using a `.test.js` or `.test.ts` suffix (e.g., `src/lib/utils/math.test.ts`).
- **Example**:
  ```typescript
  // src/lib/utils/stringUtils.ts
  export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // src/lib/utils/stringUtils.test.ts
  import { describe, it, expect } from 'vitest';
  import { capitalize } from './stringUtils';

  describe('capitalize', () => {
    it('should capitalize the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });
    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });
  });
  ```

## Component Testing (with Svelte Testing Library & Vitest)

Component tests verify the behavior of individual Svelte components.
- **Tools**: `@testing-library/svelte` provides utilities to render components and interact with them in a way that mimics user behavior.
- **Location**: Can be co-located with components (e.g., `src/lib/components/Button.test.ts`) or in a dedicated test directory.
- **Example**:
  ```svelte
  <!-- src/lib/components/Counter.svelte -->
  <script lang="ts">
    let count = 0;
    export let initial = 0;
    count = initial;

    function increment() {
      count++;
    }
  </script>

  <button on:click={increment}>Count: {count}</button>
  ```
  ```typescript
  // src/lib/components/Counter.test.ts
  import { render, screen, fireEvent } from '@testing-library/svelte';
  import { describe, it, expect } from 'vitest';
  import Counter from './Counter.svelte';

  describe('Counter Component', () => {
    it('renders with initial count and increments on click', async () => {
      render(Counter, { props: { initial: 5 } });

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Count: 5');

      await fireEvent.click(button);
      expect(button).toHaveTextContent('Count: 6');
    });
  });
  ```

## End-to-End (E2E) Testing (with Playwright)

E2E tests simulate real user flows through your entire application. SvelteKit officially recommends and integrates well with Playwright.
- **Location**: Usually in a top-level `tests` directory (e.g., `tests/auth.spec.ts`).
- **Key Features**:
    -   Interacts with the application as a user would (clicking buttons, filling forms, navigating).
    -   Tests run in real browser contexts (Chromium, Firefox, WebKit).
    -   Can test across multiple pages and verify application state changes.
- **Example**:
  ```typescript
  // tests/navigation.spec.ts
  import { test, expect } from '@playwright/test';

  test('should navigate to the about page', async ({ page }) => {
    // Start from the home page
    await page.goto('/');

    // Find a link with the text "About" and click it.
    await page.click('text=About'); // Assumes you have such a link

    // The new URL should be "/about".
    await expect(page).toHaveURL('/about');

    // The new page should contain an h1 with "About this app".
    await expect(page.locator('h1')).toContainText('About this app'); // Assumes h1 on about page
  });
  ```

## Testing `load` Functions

-   **Unit Testing `load`**: You can unit test `load` functions by mocking their inputs (`event` object: `params`, `url`, `fetch`, `depends`, etc.) and asserting their return values or thrown errors.
    ```typescript
    // src/routes/products/[id]/+page.server.ts
    // export async function load({ params, fetch }) { ... }

    // src/routes/products/[id]/+page.server.test.ts
    import { load } from './+page.server';
    import { describe, it, expect, vi } from 'vitest';

    describe('Product page load function', () => {
      it('fetches and returns a product', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ id: '123', name: 'Test Product' }),
        });

        const event = {
          params: { id: '123' },
          fetch: mockFetch,
          // ... other event properties as needed
        };

        const result = await load(event as any); // Cast as any for simplicity in example
        expect(mockFetch).toHaveBeenCalledWith('/api/products/123'); // Or external API
        expect(result.product.name).toBe('Test Product');
      });

      it('throws a 404 error if product not found', async () => {
        // ... mock fetch to return 404 ...
        // expect(async () => await load(event as any)).rejects.toThrow(...);
      });
    });
    ```
- **E2E Testing of `load`**: Playwright tests implicitly test `load` functions by navigating to pages and verifying the rendered content.

## Testing Form Actions

-   **Unit Testing Actions**: Similar to `load` functions, you can unit test individual actions by mocking the `event` object (`request`, `locals`, `cookies`, `params`).
-   **E2E Testing Actions**: Use Playwright to fill and submit forms, then verify the resulting page state, database changes, or UI feedback.
    ```typescript
    // tests/form-submission.spec.ts
    import { test, expect } from '@playwright/test';

    test('should submit contact form successfully', async ({ page }) => {
      await page.goto('/contact');
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('textarea[name="message"]', 'Hello SvelteKit!');
      await page.click('button[type="submit"]');

      // Expect a success message or navigation
      await expect(page.locator('.success-message')).toBeVisible();
    });
    ```

## Testing API Routes (`+server.js`)

-   **Unit/Integration Testing**: Make HTTP requests to your API endpoints using a library like `node-fetch` or a test utility within your Vitest setup. You might need to run a test instance of your SvelteKit app or mock the server environment.
-   **E2E Testing**: Playwright can directly make requests to your API endpoints (`page.request.get()`, `page.request.post()`) or test them indirectly by interacting with UI that calls these APIs.

## Mocking

-   **`vi.mock` / `jest.mock`**: For mocking modules (e.g., database clients, external services, SvelteKit modules like `$app/navigation` or `$env`).
    ```typescript
    // Example: Mocking $app/navigation
    import { vi } from 'vitest';

    vi.mock('$app/navigation', () => ({
      goto: vi.fn(),
      beforeNavigate: vi.fn(),
      afterNavigate: vi.fn(),
    }));
    ```
-   **Mocking Server Modules**: When testing components that interact with server code (e.g., via `fetch` to API routes), you might mock `fetch` or use tools like Mock Service Worker (MSW) to intercept HTTP requests and return mock responses.
-   **Environment Variables**: Use `vi.stubEnv` / `vi.unstubEnv` (Vitest) or similar for Jest to mock environment variables from `$env/*`.

## General Best Practices

-   **Test Behavior, Not Implementation**: Focus on what the user experiences or what the public API of a function/module does.
-   **Arrange-Act-Assert (AAA)**: Structure tests clearly.
-   **Colocation**: Place test files near the code they test for better discoverability.
-   **CI Integration**: Run tests automatically in your CI/CD pipeline.
-   **Coverage**: Aim for reasonable test coverage, focusing on critical paths and complex logic.

By combining these testing strategies and tools, you can build a comprehensive test suite for your SvelteKit application in {projectPath}, ensuring its quality and reliability.
```
