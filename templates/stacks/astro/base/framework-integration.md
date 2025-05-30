---
title: Astro Framework Integration Guide
description: Best practices for integrating other frameworks with Astro
tags: [Astro, Integration, Frameworks, React, Vue, Svelte]
globs: ./**/*
always: true
---

# Astro Framework Integration Guide

## Overview

Astro allows seamless integration with multiple frameworks while maintaining optimal performance through partial hydration.

## Framework Integration Best Practices

### General Integration Guidelines

1. **Selective Hydration**

    - Only hydrate components that need interactivity
    - Use the most appropriate client directive
    - Keep static components static

2. **Performance Optimization**

    - Load framework components only when needed
    - Use proper client directives to minimize JS payload
    - Consider code splitting for large framework components

3. **State Management**
    - Keep state local when possible
    - Use framework-specific state management judiciously
    - Consider Nano Stores for cross-framework state

### React Integration

1. **Setup**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
	integrations: [react()],
});
```

2. **Best Practices**
    - Keep React components focused and small
    - Use appropriate client directives:

        ```astro
        <!-- Component loads and hydrates immediately -->
        <ReactComponent client:load />

        <!-- Component loads and hydrates when parent component becomes visible -->
        <ReactComponent client:visible />

        <!-- Component loads and hydrates after initial page load -->
        <ReactComponent client:idle />
        ```

    - Leverage React hooks effectively
    - Consider React.lazy for code splitting

### Vue Integration

1. **Setup**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
	integrations: [vue()],
});
```

2. **Best Practices**
    - Use Composition API for better TypeScript support
    - Leverage Vue's reactivity system efficiently
    - Handle component lifecycle appropriately
    - Consider Suspense for async components

### Svelte Integration

1. **Setup**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
	integrations: [svelte()],
});
```

2. **Best Practices**
    - Take advantage of Svelte's reactive statements
    - Use stores for shared state
    - Keep components simple and focused
    - Leverage Svelte's built-in transitions

## Advanced Integration Patterns

### Cross-Framework Communication

1. **Using Nano Stores**

```javascript
// store.js
import { atom } from 'nanostores';

export const sharedState = atom('initial value');
```

2. **Custom Event Bus**
    - Implement for complex cross-framework communication
    - Use vanilla JavaScript events
    - Consider performance implications

### Shared State Management

1. **Best Practices**

    - Keep shared state minimal
    - Use framework-agnostic solutions when possible
    - Document state flow clearly

2. **Implementation Patterns**

```javascript
// shared-store.js
import { map } from 'nanostores';

export const sharedStore = map({
	user: null,
	theme: 'light',
	preferences: {},
});
```

### Performance Optimization

1. **Code Splitting**

    - Split components by route
    - Use dynamic imports
    - Implement proper loading states

2. **Bundle Analysis**
    - Regular monitoring of bundle sizes
    - Optimize dependencies
    - Use appropriate build configuration

### Microfrontend Architecture

1. **Implementation**

    - Define clear boundaries
    - Use Module Federation when appropriate
    - Establish consistent interfaces

2. **Best Practices**
    - Maintain independent deployability
    - Share common dependencies
    - Implement proper error boundaries

## Testing Integration

1. **Component Testing**

    - Test framework components in isolation
    - Use framework-specific testing tools
    - Implement proper mocking strategies

2. **Integration Testing**
    - Test cross-framework interactions
    - Verify state management
    - Ensure proper hydration

## Security Considerations

1. **Cross-Framework Security**

    - Validate data across framework boundaries
    - Implement proper CSP headers
    - Handle sensitive data appropriately

2. **Best Practices**
    - Regular security audits
    - Keep dependencies updated
    - Follow framework-specific security guidelines
