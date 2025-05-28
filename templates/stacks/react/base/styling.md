---
description: Styling concepts and approaches in React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx,css,scss,less}
alwaysApply: true
---

# Styling in React Applications

This document outlines common conceptual approaches to styling React components in {projectPath}. The choice of styling method can significantly impact maintainability, scalability, and developer experience.

## Common Styling Approaches

### 1. Global CSS
- **Concept**: Using traditional CSS files linked in the main HTML file or imported globally into the application (e.g., `index.css`).
- **Pros**: Simple for small projects, familiar.
- **Cons**: Risk of naming conflicts, difficult to manage scope, hard to maintain in large applications.
- **Use When**: Small projects, global style definitions (resets, typography).

### 2. CSS Modules
- **Concept**: CSS files where class names and animations are scoped locally by default. Each file `Component.module.css` exports an object mapping local names to globally unique generated names.
- **Pros**: Local scoping (no naming conflicts), explicit dependencies, co-location with components.
- **Example**:
  ```jsx
  // styles.module.css
  // .title { color: blue; }

  // MyComponent.jsx
  import styles from './styles.module.css';
  const MyComponent = () => <h1 className={styles.title}>Hello</h1>;
  ```
- **Use When**: Most common component styling needs, preventing style conflicts.

### 3. CSS-in-JS Libraries
- **Concept**: Writing CSS directly in JavaScript using libraries like Styled Components, Emotion. Styles are often tightly coupled with components.
- **Pros**: Dynamic styling based on props/state, theming, critical CSS extraction, better tooling integration.
- **Cons**: Potential runtime overhead, learning curve, can increase bundle size if not managed.
- **Examples**:
  - **Styled Components**:
    ```jsx
    import styled from 'styled-components';
    const Title = styled.h1`color: ${props => props.primary ? 'blue' : 'black'};`;
    // <Title primary>Hello</Title>
    ```
  - **Emotion**:
    ```jsx
    /** @jsxImportSource @emotion/react */
    import { css } from '@emotion/react';
    const titleStyle = css`color: blue;`;
    // <h1 css={titleStyle}>Hello</h1>
    ```
- **Use When**: Applications needing dynamic theming, complex prop-based styling, or when a full JS-based styling solution is preferred.

### 4. Utility-First CSS (e.g., Tailwind CSS)
- **Concept**: Using pre-defined utility classes directly in HTML/JSX to build complex designs without writing custom CSS.
- **Pros**: Rapid development, consistency, small CSS output (with purging), highly configurable.
- **Cons**: Can make JSX verbose, learning curve for utility classes, might feel like "inline styles" initially.
- **Example**:
  ```jsx
  // <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">Hello</div>
  ```
- **Use When**: Projects aiming for rapid UI development, design systems built on utility classes, or when minimizing custom CSS is a goal.

### 5. Preprocessors (Sass, Less)
- **Concept**: Using CSS preprocessors to add features like variables, nesting, mixins, and functions to CSS. Can be used with global CSS or CSS Modules.
- **Pros**: Enhanced CSS capabilities, better organization.
- **Cons**: Requires a build step.
- **Use When**: Large projects needing more structured and maintainable CSS.

## General Styling Best Practices

- **Consistency**: Choose a primary styling method and stick to it.
- **Co-location**: Keep component-specific styles close to the component (e.g., in the same folder).
- **Theming**: If your application needs themes, plan for it early. CSS variables or CSS-in-JS solutions are good for this.
- **Performance**: Be mindful of the performance implications of your chosen styling approach (e.g., runtime cost of some CSS-in-JS).
- **Maintainability**: Structure your styles in a way that is easy to understand, modify, and scale.

Consider the specific needs of {projectPath} when deciding on the most appropriate styling strategies.
```
