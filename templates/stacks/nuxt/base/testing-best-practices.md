---
description: Testing best practices for Nuxt applications
globs: <root>/tests/**/*.spec.ts,<root>/tests/**/*.spec.js,<root>/tests/**/*.test.ts,<root>/tests/**/*.test.js
alwaysApply: false
---

# Nuxt Testing Best Practices

This guide outlines the recommended approach to testing Nuxt.js applications in {projectPath}.

## Testing Stack

For Nuxt.js applications, we recommend these testing tools:

-   **Vitest**: Primary testing framework for unit and component tests
-   **@nuxt/test-utils**: Nuxt-specific testing utilities
-   **Vue Test Utils**: For component testing
-   **Cypress/Playwright**: For end-to-end testing
-   **MSW (Mock Service Worker)**: For API mocking

## Setting Up Testing Environment

Your testing environment should include proper configuration for Vitest, with the necessary plugins and aliases to support testing Vue components in a Nuxt environment. This includes setting up the test environment, proper path resolution, and global configurations.

## Component Testing

### Testing Vue Components in Nuxt

Component testing in Nuxt applications should focus on:

-   Rendering tests to verify component output
-   Behavior tests to verify component interactions and events
-   Props and slot testing
-   Lifecycle hooks and composition API functionality

### Testing Nuxt-Specific Features

For Nuxt-specific features like pages, layouts, and plugins, use the appropriate utilities from `@nuxt/test-utils` to ensure proper testing with the Nuxt context.

## Testing Composables

When testing composables in Nuxt, consider these aspects:

-   Testing the composable's exposed functions and properties
-   Verifying reactivity
-   Mocking dependencies
-   Testing error cases
-   Ensuring proper cleanup

### Testing Nuxt Composables

Nuxt composables often depend on Nuxt's runtime context. When testing these, you'll need to properly mock the Nuxt context, including:

-   useNuxtApp
-   useState
-   useRoute
-   useRouter
-   useFetch and useAsyncData

## Testing Pinia Stores

For Nuxt applications using Pinia stores, consider these testing aspects:

-   Testing initial state
-   Testing actions and mutations
-   Testing getters
-   Testing store integration with components
-   Handling async operations in stores

## Testing API Routes (Server Routes)

For testing Nuxt server API routes, focus on:

-   Input validation testing
-   Response format testing
-   Error handling testing
-   Authentication and authorization testing
-   Performance and load testing when relevant

## Testing Pages and Layouts

When testing full Nuxt pages with routing context:

-   Test page rendering with various route parameters
-   Test layout applications
-   Test page transitions
-   Test navigation and middleware behavior
-   Test SEO metadata

## End-to-End Testing

Use Cypress or Playwright for E2E testing, focusing on:

-   Critical user journeys
-   Form submissions
-   Authentication flows
-   Navigation between pages
-   API interactions
-   Responsive behavior

## Mocking HTTP Requests

When mocking API calls in component tests, consider:

-   Mocking fetch/axios responses
-   Testing error scenarios
-   Verifying loading states
-   Testing retry mechanisms
-   Using MSW or similar tools for consistent mock behavior

## Testing Universal Components

For components that behave differently in client vs. server environments:

-   Test both client-side and server-side behavior
-   Mock environment variables appropriately
-   Test hydration behavior when relevant
-   Consider SSR-specific edge cases

## Testing Middleware

For testing Nuxt middleware, focus on:

-   Authentication and authorization checks
-   Redirects and navigation control
-   Request/response manipulation
-   Error handling
-   Parameter extraction and validation

## Best Practices for Nuxt Testing

1. **Isolation**: Test components and functionalities in isolation
2. **Mocking**: Use mocks for external dependencies and APIs
3. **E2E for Flows**: Use E2E tests for critical user journeys
4. **CI Integration**: Run tests in CI pipelines before deployment
5. **Coverage Tracking**: Track test coverage to identify untested code

## Testing Coverage Goals

Aim for these coverage targets:

-   **Components**: 80%+ coverage
-   **Composables**: 90%+ coverage
-   **Stores**: 90%+ coverage
-   **Server Routes**: 90%+ coverage
-   **E2E**: Cover all critical user paths
