---
description: Styling concepts and approaches in Next.js applications
globs: <root>/src/**/*.{ts,tsx,js,jsx,css,scss,less}, <root>/app/**/*.{ts,tsx,js,jsx,css,scss,less}, <root>/pages/**/*.{ts,tsx,js,jsx,css,scss,less}
alwaysApply: true
---

# Styling in Next.js Applications

This document outlines common conceptual approaches to styling Next.js applications in {projectPath}. Next.js provides built-in support for various styling methods that can significantly impact maintainability, scalability, and performance.

## Next.js Specific Styling Features

### 1. Built-in CSS Support

-   **Concept**: Next.js has built-in support for CSS and CSS Modules without any configuration.
-   **Global CSS**: Can be imported only in `pages/_app.js` or `app/layout.js` (App Router).
-   **CSS Modules**: Supported out of the box with `.module.css` extension.
-   **Use When**: You want zero-configuration CSS support with automatic optimization.

### 2. Sass Support

-   **Concept**: Next.js supports Sass/SCSS out of the box after installing the `sass` package.
-   **Features**: Supports both `.scss` and `.sass` syntax, CSS Modules with Sass.
-   **Configuration**: Can customize Sass options in `next.config.js`.
-   **Use When**: You need Sass features like variables, mixins, and nesting.

### 3. CSS-in-JS Support

-   **Concept**: Next.js works well with popular CSS-in-JS libraries like styled-components, emotion, etc.
-   **Server-Side Rendering**: Requires proper setup for SSR compatibility.
-   **Styled JSX**: Built-in CSS-in-JS solution that comes with Next.js.
-   **Use When**: You prefer component-scoped styles with JavaScript capabilities.

## Common Styling Approaches

### 1. CSS Modules

-   **Concept**: CSS files where class names are scoped locally by default.
-   **Next.js Integration**: Built-in support, automatic code splitting.
-   **File Naming**: `Component.module.css` or `Component.module.scss`.
-   **Pros**: Scoped styles, no naming conflicts, good performance.
-   **Cons**: Requires importing class names, can be verbose.

### 2. Tailwind CSS

-   **Concept**: Utility-first CSS framework with pre-built classes.
-   **Next.js Integration**: Excellent support with PostCSS integration.
-   **Setup**: Easy setup with `tailwindcss` package and configuration.
-   **Pros**: Rapid development, consistent design system, small bundle size.
-   **Cons**: Learning curve, can lead to long class names.

### 3. Styled Components

-   **Concept**: CSS-in-JS library for styling React components.
-   **Next.js Integration**: Requires babel plugin for SSR support.
-   **Features**: Dynamic styling, theme support, automatic vendor prefixing.
-   **Pros**: Component-scoped styles, dynamic styling capabilities.
-   **Cons**: Runtime overhead, requires proper SSR setup.

### 4. Emotion

-   **Concept**: Another popular CSS-in-JS library with great performance.
-   **Next.js Integration**: Works well with proper configuration.
-   **Features**: Similar to styled-components but with better performance.
-   **Use When**: You want CSS-in-JS with better performance than styled-components.

## Best Practices

### Performance Considerations

-   **Critical CSS**: Next.js automatically inlines critical CSS for better performance.
-   **Code Splitting**: CSS Modules are automatically code-split by Next.js.
-   **Font Optimization**: Use `next/font` for optimized font loading.
-   **Image Optimization**: Use `next/image` component for optimized images.

### App Router vs Pages Router

-   **App Router**: Global styles in `app/globals.css`, layout-specific styles in layout files.
-   **Pages Router**: Global styles only in `pages/_app.js`.
-   **Component Styles**: Both routers support CSS Modules and CSS-in-JS equally.

### Development Workflow

-   **Hot Reloading**: All styling methods support hot reloading in development.
-   **Build Optimization**: Next.js automatically optimizes CSS during build.
-   **Source Maps**: Available in development for easier debugging.

## Recommendations

### For Small to Medium Projects

-   Use **CSS Modules** for component-specific styles
-   Use **global CSS** for reset styles and typography
-   Consider **Tailwind CSS** for rapid prototyping

### For Large Projects

-   Use **CSS Modules** with a design system
-   Consider **styled-components** or **emotion** for complex dynamic styling
-   Implement a consistent naming convention and folder structure

### For Performance-Critical Applications

-   Prefer **CSS Modules** over CSS-in-JS for better performance
-   Use **Tailwind CSS** with purging enabled
-   Minimize the use of dynamic styles

Remember that the choice of styling method should align with your team's expertise, project requirements, and performance goals.
