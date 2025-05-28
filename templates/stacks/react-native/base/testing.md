---
description: Testing strategies and tools for React Native applications.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# Testing React Native Applications

Testing is a critical part of developing robust and reliable React Native applications for {projectPath}. A comprehensive testing strategy should cover different levels of testing to ensure code quality and prevent regressions.

## The Testing Pyramid

The testing pyramid is a common model for visualizing a balanced testing strategy:

1.  **Unit Tests (Most Numerous)**:
    -   **Focus**: Test individual functions, classes, or small pieces of logic in isolation.
    -   **Speed**: Very fast.
    -   **Scope**: Smallest unit of code (e.g., a helper function, a reducer in a state management library).
    -   **Tools**: Jest is the primary tool.

2.  **Component/Integration Tests (Moderate Number)**:
    -   **Focus**: Test React Native components, their interactions, and integration with parts of the React Native framework or other components. This is where most of your UI testing will happen.
    -   **Speed**: Slower than unit tests, faster than E2E tests.
    -   **Scope**: Rendering components, user interactions (presses, inputs), state changes within components, interaction between a few components.
    -   **Tools**: Jest as the runner, with React Native Testing Library (RNTL) for rendering and interacting with components.

3.  **End-to-End (E2E) Tests (Fewest)**:
    -   **Focus**: Test complete user flows through the application, simulating real user scenarios on a device or simulator.
    -   **Speed**: Slowest, as they involve building and running the app.
    -   **Scope**: Entire application flows (e.g., login process, completing an order).
    -   **Tools**: Detox, Appium.

## Tools and Libraries

### 1. Jest
-   **Role**: JavaScript testing framework. It's the standard test runner for React Native projects.
-   **Features**: Test execution, assertion library (`expect`), mocking capabilities (`jest.fn()`, `jest.mock()`), code coverage reports.
-   **Usage**: Used for both unit tests and as the environment for component tests with RNTL.

### 2. React Native Testing Library (RNTL)
-   **Role**: Provides utilities to test React Native components in a way that resembles how users interact with them.
-   **Philosophy**: "The more your tests resemble the way your software is used, the more confidence they can give you." Focuses on querying the UI by accessibility roles, text content, etc., rather than implementation details.
-   **Key Functions**:
    -   `render()`: Renders a component.
    -   `screen`: Object providing query methods (e.g., `getByText`, `findByRole`, `queryByTestId`).
    -   `fireEvent`: Simulates user events (e.g., `fireEvent.press`, `fireEvent.changeText`).
    -   `userEvent` (from `@testing-library/user-event` often used with RNTL setup for more realistic event simulation).
-   **Example (Component Test with RNTL and Jest)**:
    ```javascript
    import React from 'react';
    import { render, screen, fireEvent } from '@testing-library/react-native';
    import MyComponent from './MyComponent'; // Assuming MyComponent has a Button and Text

    describe('MyComponent', () => {
      it('renders initial text and changes text on button press', () => {
        render(<MyComponent />);

        // Check for initial text
        expect(screen.getByText('Initial Text')).toBeTruthy();

        // Find the button and press it
        const button = screen.getByRole('button', { name: /press me/i });
        fireEvent.press(button);

        // Check for updated text
        expect(screen.getByText('Button Pressed!')).toBeTruthy();
        expect(screen.queryByText('Initial Text')).toBeNull(); // Old text is gone
      });
    });
    ```

### 3. Mocking
-   **Native Modules**: Jest's mocking capabilities are essential for mocking native modules that your JavaScript code might interact with, as these modules are not available in the Jest (Node.js) environment.
    -   Create mocks in a `__mocks__` directory adjacent to `node_modules` or directly in your test setup file.
    -   Example: `jest.mock('react-native-gesture-handler', () => { /* mock implementation */ });`
-   **External Services (APIs)**: Use libraries like `jest-fetch-mock` or `msw` (Mock Service Worker) to mock API responses, ensuring your tests are deterministic and don't rely on live network calls.
-   **Functions/Modules**: `jest.spyOn()` can be used to track calls to functions or mock their implementation for specific tests.

### 4. End-to-End Testing Tools
-   **Detox (Recommended for React Native)**:
    -   Gray box testing framework for mobile apps.
    -   Interacts with the app through its native interface, providing more reliable tests than some WebDriver-based solutions.
    -   Requires careful setup and configuration.
    -   Tests are written in JavaScript.
-   **Appium**:
    -   Open-source tool for automating mobile apps on different platforms.
    -   Uses WebDriver protocol.
    -   Can be more versatile for testing across different types of mobile apps (native, hybrid, web), but might be less integrated with React Native specifics compared to Detox.

## Best Practices for Testing

-   **Test Behavior, Not Implementation**: Focus on what the user experiences or what the public API of a function/module does, not its internal workings. This makes tests less brittle.
-   **Arrange, Act, Assert (AAA Pattern)**: Structure your tests clearly:
    1.  **Arrange**: Set up the test conditions (render component, mock data).
    2.  **Act**: Perform the action being tested (press button, call function).
    3.  **Assert**: Check the outcome (verify UI change, check function return value).
-   **Aim for Good Coverage, But Prioritize Critical Paths**: While 100% coverage is ideal, it's not always practical. Focus on testing critical user flows, complex logic, and areas prone to bugs.
-   **Write Clear and Descriptive Test Names**: Test names should clearly state what they are testing.
-   **Run Tests Regularly**: Integrate tests into your CI/CD pipeline to catch regressions early.
-   **Test on Actual Devices**: While simulators/emulators are useful, E2E tests (and occasional manual testing) on real devices are crucial to catch device-specific issues, especially related to performance or native integrations.

A solid testing suite is an investment that pays off by reducing bugs, improving code quality, and enabling confident refactoring and development in {projectPath}.
```
