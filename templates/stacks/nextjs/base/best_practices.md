---
description: Core best practices for Next.js applications
globs: '<root>/app/**/*.{ts,tsx},<root>/components/**/*.{ts,tsx},<root>/pages/**/*.{ts,tsx}'
alwaysApply: false
---

# Next.js Best Practices

This document outlines the core best practices and conventions for Next.js applications.

## Core Principles

-   **Component Structure**: Use functional components with hooks
-   **Type Safety**: Utilize TypeScript for all components and functions
-   **Performance Optimization**: Implement proper code splitting and optimize images
-   **SEO-Friendly**: Structure for optimal search engine indexing
-   **Accessibility**: Follow web accessibility standards (WCAG)

## Project Structure

-   Organize components by feature or page
-   Use the App Router architecture when possible
-   Separate UI components from logic with custom hooks
-   Maintain clear separation between client and server code

## Testing

-   Use Vitest for unit and integration tests in the `__tests__/` directory
-   Implement Playwright for end-to-end testing
-   Test components in isolation with React Testing Library
-   Implement snapshot testing for UI components

## State Management

-   Use React Context for simpler global state
-   Consider libraries like Zustand or Jotai for complex state
-   Implement server state management with React Query or SWR
-   Keep state as close to its usage as possible

## Performance

-   Implement proper image optimization with Next.js Image component
-   Use dynamic imports for code splitting
-   Leverage Next.js Server Components where appropriate
-   Implement proper caching strategies

## Styling

-   Use CSS Modules or CSS-in-JS solutions
-   Implement a design system or component library
-   Ensure responsive design across all components
-   Consider utility-first CSS frameworks like Tailwind
