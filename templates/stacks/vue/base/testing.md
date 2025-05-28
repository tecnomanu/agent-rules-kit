---
description: Testing guidelines and best practices for Vue.js applications using Vue Test Utils, Vitest/Jest, and E2E tools.
globs: <root>/src/**/*.spec.{js,ts},<root>/src/**/*.test.{js,ts},<root>/tests/unit/**/*.spec.{js,ts},<root>/tests/e2e/**/*.spec.{js,ts}
alwaysApply: true
---

# Testing Vue.js Applications

Testing is a critical part of building robust and maintainable Vue.js applications in {projectPath}. A comprehensive testing strategy usually includes unit tests, component tests, and end-to-end (E2E) tests.

## The Testing Pyramid

A common approach to structure your testing efforts:

1.  **Unit Tests (Most Numerous)**:
    -   **Focus**: Test individual functions, composables, or small, isolated pieces of logic (e.g., utility functions, specific methods within a store).
    -   **Speed**: Very fast.
    -   **Tools**: Vitest or Jest.

2.  **Component Tests (Moderate Number)**:
    -   **Focus**: Test individual Vue components – their rendering output, props, emitted events, slots, internal state, and user interactions.
    -   **Speed**: Slower than unit tests, faster than E2E tests.
    -   **Tools**: Vue Test Utils (VTU) running on top of a test runner like Vitest or Jest.

3.  **End-to-End (E2E) Tests (Fewest)**:
    -   **Focus**: Test complete user flows through the application, simulating real user scenarios in a browser.
    -   **Speed**: Slowest, as they involve building and running the app.
    -   **Tools**: Cypress, Playwright, or Nightwatch.js (often used with Vue CLI's E2E testing plugins).

## Tools and Libraries

### 1. Test Runners (Vitest / Jest)

-   **Vitest**: A modern, fast test runner built on top of Vite. Often preferred for Vite-based Vue 3 projects due to its speed and ESM-first approach. It has a Jest-compatible API.
-   **Jest**: A popular and comprehensive JavaScript testing framework. Widely used, especially with Vue CLI projects or if Vitest is not an option.
-   Both provide features like test execution, assertion libraries (`expect`), mocking (`vi.mock` for Vitest, `jest.mock` for Jest), and code coverage.

### 2. Vue Test Utils (VTU)

-   **Role**: The official low-level component testing library for Vue.js. It provides utilities to mount components, interact with them, and make assertions about their output and behavior.
-   **Key Features**:
    -   `mount()`: Renders a component in isolation.
    -   `shallowMount()`: Renders a component with its children stubbed (less common now, `mount` is often preferred with targeted mocking).
    -   `find()`, `findAll()`: Query for elements within the component.
    -   `trigger()`: Simulate user events.
    -   Access to component instance, props, emitted events.
-   Works with both Options API and Composition API components.

## Writing Tests

### Unit Testing Composables (Example with Vitest)

```typescript
// src/composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const doubleCount = computed(() => count.value * 2);
  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, doubleCount, increment, decrement };
}

// src/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter composable', () => {
  it('initializes with default value', () => {
    const { count, doubleCount } = useCounter();
    expect(count.value).toBe(0);
    expect(doubleCount.value).toBe(0);
  });

  it('initializes with provided value', () => {
    const { count } = useCounter(5);
    expect(count.value).toBe(5);
  });

  it('increments the count', () => {
    const { count, increment } = useCounter();
    increment();
    expect(count.value).toBe(1);
  });

  it('decrements the count', () => {
    const { count, decrement } = useCounter();
    decrement();
    expect(count.value).toBe(-1);
  });

  it('updates doubleCount when count changes', () => {
    const { count, doubleCount, increment } = useCounter();
    increment(); // count is 1
    expect(doubleCount.value).toBe(2);
    increment(); // count is 2
    expect(doubleCount.value).toBe(4);
  });
});
```

### Component Testing (Example with VTU and Vitest)

```vue
<!-- src/components/GreetingMessage.vue -->
<template>
  <div>
    <p>{{ greeting }}</p>
    <button @click="changeGreeting">Change Greeting</button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';

interface Props {
  name?: string;
}
const props = withDefaults(defineProps<Props>(), {
  name: 'World'
});

const emit = defineEmits(['greetingChanged']);

const greeting = computed(() => `Hello, ${props.name}!`);

function changeGreeting() {
  emit('greetingChanged', `Goodbye, ${props.name}!`);
}
</script>
```

```typescript
// src/components/GreetingMessage.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GreetingMessage from './GreetingMessage.vue';

describe('GreetingMessage.vue', () => {
  it('renders default greeting', () => {
    const wrapper = mount(GreetingMessage);
    expect(wrapper.find('p').text()).toBe('Hello, World!');
  });

  it('renders greeting with provided name prop', () => {
    const wrapper = mount(GreetingMessage, {
      props: { name: 'Vue' }
    });
    expect(wrapper.find('p').text()).toBe('Hello, Vue!');
  });

  it('emits "greetingChanged" event when button is clicked', async () => {
    const wrapper = mount(GreetingMessage, { props: { name: 'Tester' } });
    const button = wrapper.find('button');

    await button.trigger('click');

    // Check if event was emitted
    expect(wrapper.emitted()).toHaveProperty('greetingChanged');
    // Check emitted event payload
    expect(wrapper.emitted('greetingChanged')[0]).toEqual(['Goodbye, Tester!']);
  });

  it('matches snapshot', () => {
    const wrapper = mount(GreetingMessage, { props: { name: 'Snapshot' } });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

### Testing Pinia Stores (Example with Vitest)

```typescript
// src/stores/counterStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() { count.value++; }
  return { count, doubleCount, increment };
});

// src/stores/counterStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCounterStore } from './counterStore';

describe('Counter Store', () => {
  beforeEach(() => {
    // Creates a fresh Pinia instance and makes it active so it's automatically picked
    // up by any useStore() call without needing to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia());
  });

  it('initializes with count 0', () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);
    expect(store.doubleCount).toBe(0);
  });

  it('increments the count', () => {
    const store = useCounterStore();
    store.increment();
    expect(store.count).toBe(1);
    expect(store.doubleCount).toBe(2);
  });

  it('can be reset by directly modifying state (for testing purposes)', () => {
    const store = useCounterStore();
    store.count = 5;
    expect(store.count).toBe(5);
  });
});
```

## Mocking Dependencies

-   **Composables/Modules**: Use `vi.mock` (Vitest) or `jest.mock` (Jest).
    ```typescript
    // In your test file
    import { vi } from 'vitest';

    vi.mock('@/composables/useAuth', () => ({
      useAuth: () => ({
        isAuthenticated: ref(true),
        user: ref({ id: '1', name: 'Mock User' })
      })
    }));
    ```
-   **Global Objects/APIs**: Spy on or mock global objects like `fetch`, `localStorage`.
    ```typescript
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success!' })
    });
    vi.stubGlobal('fetch', mockFetch);
    ```
-   **Child Components (Shallow Rendering / Stubbing with VTU)**:
    Vue Test Utils allows you to stub child components to isolate the component under test.
    ```typescript
    const wrapper = mount(ParentComponent, {
      global: {
        stubs: {
          ChildComponentToStub: true, // Stubs with a simple <child-component-to-stub-stub>
          AnotherChild: { template: '<div class="mock-child">Mocked</div>' } // Stub with custom template
        }
      }
    });
    ```

## End-to-End (E2E) Testing

-   **Cypress**: A popular E2E testing framework. Integrates well with Vue projects.
    -   `npm install -D cypress @cypress/vue` (for component testing with Cypress if desired)
-   **Playwright**: Another excellent E2E testing framework by Microsoft, known for its speed and cross-browser capabilities.
-   **Focus**: Test critical user journeys, authentication flows, form submissions, and interactions that span multiple components or pages.

## Best Practices for Testing Vue

-   **Test Behavior, Not Implementation**: Focus on what the component does from a user's perspective, not its internal structure.
-   **Arrange-Act-Assert (AAA)**: Structure your tests clearly.
-   **Readable Tests**: Write clear and descriptive test names (`describe` and `it` blocks).
-   **Snapshot Testing**: Use snapshot tests sparingly, primarily for components with complex but stable markup. Be sure to review snapshots on changes.
-   **Coverage**: Aim for meaningful test coverage. Don't just chase numbers; ensure critical paths and logic are tested.
-   **CI Integration**: Run your tests automatically in your Continuous Integration (CI) pipeline.

By implementing a solid testing strategy with these tools and practices, you can build more reliable and maintainable Vue.js applications in {projectPath}.
```
