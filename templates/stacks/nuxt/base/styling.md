---
description: Styling concepts and approaches in Nuxt applications
globs: <root>/**/*.{vue,css,scss,less,ts,js}
alwaysApply: true
---

# Styling in Nuxt Applications

This document outlines common conceptual approaches to styling Nuxt applications in {projectPath}. Nuxt provides excellent built-in support for various styling methods with automatic optimization and SSR compatibility.

## Nuxt Styling Features

### 1. Built-in CSS Support
- **Global CSS**: Import CSS files in `nuxt.config.js` or use the `assets/` directory.
- **CSS Modules**: Automatic support with `.module.css` extension.
- **PostCSS**: Built-in PostCSS support with automatic vendor prefixing.
- **Critical CSS**: Automatic critical CSS extraction for better performance.

### 2. Sass/SCSS Support
- **Installation**: Install `sass` package for automatic Sass support.
- **Configuration**: Configure Sass options in `nuxt.config.js`.
- **Variables**: Share Sass variables across components using `@nuxtjs/style-resources`.
- **Performance**: Automatic optimization and minification in production.

### 3. CSS Frameworks Integration
- **Nuxt Modules**: Many CSS frameworks have dedicated Nuxt modules.
- **Auto-import**: Automatic component and utility imports where supported.
- **SSR Compatibility**: Frameworks are configured for server-side rendering.

## Common Styling Approaches

### 1. Scoped Styles in Vue Components
- **Concept**: Use `<style scoped>` in Vue single-file components.
- **Pros**: Component isolation, no naming conflicts, automatic optimization.
- **Cons**: Cannot style child components, may increase bundle size.
- **Best Practice**: Use for component-specific styles.

```vue
<template>
  <div class="component">
    <h1 class="title">Title</h1>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
.title {
  color: blue;
}
</style>
```

### 2. CSS Modules
- **Concept**: Locally scoped CSS with generated class names.
- **Usage**: Use `.module.css` extension or `module` attribute in style tags.
- **Pros**: Scoped styles, works with any CSS preprocessor.
- **Cons**: Requires importing class names, more verbose.

### 3. Global Styles
- **CSS Directory**: Place global styles in `assets/css/` directory.
- **Nuxt Config**: Import global styles in `nuxt.config.js`.
- **Use Cases**: Reset styles, typography, utility classes.
- **Best Practice**: Keep global styles minimal and well-organized.

### 4. Tailwind CSS
- **Installation**: Use `@nuxtjs/tailwindcss` module for easy setup.
- **Configuration**: Customize with `tailwind.config.js`.
- **Features**: 
  - JIT compilation for faster builds
  - Automatic purging of unused styles
  - Dark mode support
  - Component integration
- **Use When**: Prefer utility-first approach, need design consistency.

### 5. Vuetify
- **Installation**: Use `@nuxtjs/vuetify` module.
- **Features**: Material Design components, theming system, responsive grid.
- **Customization**: Theme customization through configuration.
- **Use When**: Need complete UI component library, Material Design aesthetic.

### 6. Bootstrap
- **Installation**: Use `bootstrap-vue` or `@nuxtjs/bootstrap-vue`.
- **Features**: Responsive grid, pre-built components, utilities.
- **Customization**: Override Sass variables for customization.
- **Use When**: Familiar with Bootstrap, need rapid prototyping.

### 7. Bulma
- **Installation**: Install Bulma and configure in `nuxt.config.js`.
- **Features**: Modern CSS framework, Flexbox-based, no JavaScript.
- **Customization**: Override Sass variables.
- **Use When**: Want modern CSS framework without JavaScript dependencies.

## CSS-in-JS Solutions

### 1. Styled Components
- **Installation**: Use `nuxt-styled-components` module.
- **Features**: Dynamic styling, theme support, SSR compatibility.
- **Use When**: Prefer CSS-in-JS, need dynamic styling.

### 2. Emotion
- **Installation**: Configure Emotion with Nuxt.
- **Features**: Better performance than styled-components, flexible API.
- **Use When**: Want CSS-in-JS with better performance.

## Advanced Styling Techniques

### 1. CSS Custom Properties (CSS Variables)
- **Theme Switching**: Implement dark/light mode with CSS variables.
- **Dynamic Styling**: Change styles based on user preferences or data.
- **Browser Support**: Good modern browser support.

### 2. CSS Grid and Flexbox
- **Layout Systems**: Use CSS Grid for 2D layouts, Flexbox for 1D layouts.
- **Responsive Design**: Create responsive layouts without media queries.
- **Browser Support**: Excellent modern browser support.

### 3. CSS Animations and Transitions
- **Performance**: Use CSS animations for better performance than JavaScript.
- **Vue Transitions**: Integrate with Vue's transition system.
- **Libraries**: Consider libraries like Animate.css or custom animations.

## Nuxt-Specific Considerations

### 1. Server-Side Rendering (SSR)
- **Critical CSS**: Nuxt automatically extracts critical CSS for faster loading.
- **Hydration**: Ensure styles are consistent between server and client.
- **Performance**: Optimize CSS delivery for better Core Web Vitals.

### 2. Static Site Generation (SSG)
- **Build-time Optimization**: Styles are optimized during build process.
- **Asset Optimization**: Automatic asset optimization and compression.
- **CDN Compatibility**: Generated styles work well with CDNs.

### 3. Universal Mode vs SPA Mode
- **Universal Mode**: Full SSR with automatic CSS optimization.
- **SPA Mode**: Client-side only, similar to traditional Vue.js application.
- **Styling Differences**: Consider mode-specific styling requirements.

## Performance Optimization

### 1. CSS Code Splitting
- **Automatic Splitting**: Nuxt automatically splits CSS by routes and components.
- **Lazy Loading**: CSS is loaded only when needed.
- **Bundle Analysis**: Use bundle analyzer to optimize CSS delivery.

### 2. Critical CSS
- **Automatic Extraction**: Nuxt extracts critical CSS for above-the-fold content.
- **Inline Styles**: Critical styles are inlined for faster rendering.
- **Configuration**: Fine-tune critical CSS extraction if needed.

### 3. Asset Optimization
- **Minification**: Automatic CSS minification in production.
- **Compression**: Enable gzip/brotli compression for CSS files.
- **Caching**: Configure proper caching headers for CSS assets.

## Best Practices

### Development Workflow
- **Hot Reloading**: Styles update instantly during development.
- **Source Maps**: Enable source maps for easier debugging.
- **Linting**: Use Stylelint for CSS code quality.
- **Formatting**: Use Prettier for consistent formatting.

### Architecture Patterns
- **Component-First**: Style components individually, avoid global styles.
- **Design Tokens**: Use design tokens for consistent spacing, colors, typography.
- **Utility Classes**: Create utility classes for common patterns.
- **Responsive Design**: Use mobile-first responsive design approach.

### Maintainability
- **Consistent Naming**: Use consistent naming conventions (BEM, etc.).
- **Documentation**: Document design system and styling patterns.
- **Refactoring**: Regularly refactor and optimize styles.
- **Testing**: Consider visual regression testing for critical components.

## Recommendations

### For Small to Medium Projects
- Use **scoped styles** in Vue components
- Use **Tailwind CSS** for utility classes and rapid development
- Keep **global styles** minimal and well-organized
- Use **CSS custom properties** for theming

### For Large Projects
- Implement a **design system** with consistent tokens
- Use **CSS architecture** patterns (ITCSS, SMACSS)
- Consider **CSS-in-JS** for complex dynamic styling
- Set up **automated testing** for visual regressions

### For Content-Heavy Sites
- Use **global styles** for typography and content formatting
- Optimize for **reading experience** with proper typography
- Consider **CSS frameworks** for consistent styling
- Focus on **performance optimization** for content delivery

### For Component Libraries
- Use **scoped styles** with well-defined APIs
- Provide **theme customization** options
- Ensure **SSR compatibility** for all styles
- Document **styling patterns** and customization options

Remember that Nuxt's automatic optimizations handle many performance concerns, allowing you to focus on creating maintainable and scalable styling solutions.
