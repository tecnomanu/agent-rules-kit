---
description: Styling concepts and approaches in Laravel applications
globs: <root>/resources/**/*.{css,scss,less,blade.php}, <root>/public/**/*.css
alwaysApply: true
---

# Styling in Laravel Applications

This document outlines common conceptual approaches to styling Laravel applications in {projectPath}. Laravel provides various tools and integrations for managing frontend assets and styling.

## Laravel Asset Management

### 1. Laravel Mix (Legacy)
- **Concept**: Laravel's wrapper around Webpack for asset compilation.
- **Features**: Sass/Less compilation, JavaScript bundling, asset versioning.
- **Configuration**: Uses `webpack.mix.js` file for configuration.
- **Status**: Being phased out in favor of Vite.
- **Use When**: Maintaining legacy Laravel projects.

### 2. Vite Integration (Modern)
- **Concept**: Modern build tool with fast development server and optimized builds.
- **Laravel Integration**: Built-in support since Laravel 9.
- **Features**: Hot module replacement, fast builds, modern JavaScript support.
- **Configuration**: Uses `vite.config.js` file.
- **Use When**: New Laravel projects, need fast development experience.

### 3. Asset Bundling
- **Blade Directives**: Use `@vite()` directive to include compiled assets.
- **Asset Versioning**: Automatic cache busting for production builds.
- **Code Splitting**: Split assets by page or feature for better performance.

## Styling Approaches

### 1. Traditional CSS
- **Location**: Store CSS files in `resources/css/` directory.
- **Compilation**: Compile through Vite or Laravel Mix.
- **Organization**: Separate files for different sections (app.css, admin.css).
- **Pros**: Simple, familiar, no learning curve.
- **Cons**: No scoping, potential naming conflicts.

### 2. Sass/SCSS
- **Location**: Store Sass files in `resources/sass/` directory.
- **Features**: Variables, mixins, nesting, partials.
- **Organization**: Use partials for modular styles.
- **Pros**: More powerful than CSS, good organization features.
- **Cons**: Compilation step required, learning curve.

### 3. CSS Frameworks

#### Bootstrap
- **Integration**: Install via npm, import in main Sass file.
- **Customization**: Override variables before importing Bootstrap.
- **Laravel Integration**: Works well with Laravel UI package.
- **Use When**: Need rapid prototyping, familiar with Bootstrap.

#### Tailwind CSS
- **Integration**: Install via npm, configure with `tailwind.config.js`.
- **Laravel Integration**: Excellent support with Laravel Breeze/Jetstream.
- **Customization**: Highly customizable through configuration.
- **Use When**: Prefer utility-first approach, need design consistency.

#### Bulma
- **Integration**: Install via npm, import in main Sass file.
- **Features**: Modern CSS framework based on Flexbox.
- **Use When**: Want modern CSS framework without JavaScript dependencies.

### 4. Component-Based Styling

#### Vue.js Integration
- **Single File Components**: Scoped styles within `.vue` files.
- **CSS Modules**: Use CSS Modules with Vue components.
- **Styled Components**: Use vue-styled-components for CSS-in-JS.

#### React Integration
- **CSS Modules**: Scoped styles for React components.
- **Styled Components**: CSS-in-JS solution for React.
- **Emotion**: Alternative CSS-in-JS library.

#### Alpine.js Integration
- **Traditional CSS**: Use regular CSS classes with Alpine.js.
- **CSS Frameworks**: Combine with Tailwind or Bootstrap.
- **Scoped Styles**: Use BEM methodology for component-like organization.

## Blade Template Styling

### 1. Layout Organization
- **Master Layout**: Define common styles in master layout file.
- **Section Styles**: Include page-specific styles in sections.
- **Component Styles**: Style Blade components consistently.

### 2. CSS Class Management
- **BEM Methodology**: Use Block Element Modifier naming convention.
- **Utility Classes**: Use utility classes for common patterns.
- **Component Classes**: Create reusable component classes.

### 3. Dynamic Styling
- **Conditional Classes**: Use Blade conditionals for dynamic classes.
- **Data-Driven Styles**: Generate styles based on model data.
- **Theme Support**: Implement theme switching with CSS variables.

## Best Practices

### Development Workflow
- **Hot Reloading**: Use Vite's hot reload for faster development.
- **Source Maps**: Enable source maps for easier debugging.
- **Linting**: Use Stylelint for CSS code quality.
- **Formatting**: Use Prettier for consistent formatting.

### Performance Optimization
- **Asset Minification**: Minify CSS for production builds.
- **Critical CSS**: Inline critical CSS for above-the-fold content.
- **Asset Versioning**: Use versioning for cache busting.
- **CDN Integration**: Use CDN for static assets in production.

### Organization Patterns
- **ITCSS**: Inverted Triangle CSS for scalable architecture.
- **SMACSS**: Scalable and Modular Architecture for CSS.
- **Atomic Design**: Component-based design system approach.
- **7-1 Pattern**: Seven folders and one main file for Sass organization.

### Responsive Design
- **Mobile First**: Start with mobile styles, enhance for larger screens.
- **Breakpoint Management**: Use consistent breakpoints across the application.
- **Flexible Grids**: Use CSS Grid or Flexbox for layout.
- **Fluid Typography**: Use relative units for scalable text.

## Laravel-Specific Considerations

### 1. Blade Components
- **Component Styling**: Style Blade components with isolated CSS.
- **Slot Styling**: Consider styling for component slots.
- **Anonymous Components**: Style anonymous components consistently.

### 2. Form Styling
- **Laravel Collective**: Style forms generated by Laravel Collective.
- **Validation Styling**: Style validation error states.
- **CSRF Styling**: Handle CSRF token styling if needed.

### 3. Pagination Styling
- **Laravel Pagination**: Style Laravel's built-in pagination views.
- **Custom Pagination**: Create custom pagination styles.

### 4. Authentication UI
- **Laravel Breeze**: Comes with Tailwind CSS styling.
- **Laravel Jetstream**: Includes styled authentication components.
- **Laravel UI**: Provides Bootstrap-based authentication views.

## Recommendations

### For Traditional Laravel Applications
- Use **Vite** for asset compilation
- Use **Sass/SCSS** for enhanced CSS features
- Consider **Bootstrap** for rapid development
- Organize styles with **7-1 pattern**

### For Modern Laravel Applications
- Use **Vite** with **Tailwind CSS**
- Implement **component-based styling**
- Use **Alpine.js** for interactive components
- Consider **design system** approach

### For Laravel + SPA Applications
- Use **Vue.js** or **React** with scoped styling
- Implement **CSS Modules** or **CSS-in-JS**
- Use **component libraries** for consistency
- Consider **micro-frontend** architecture

### For Large Applications
- Implement **design system** with style guide
- Use **CSS architecture** patterns (ITCSS, SMACSS)
- Set up **automated testing** for styles
- Use **performance monitoring** for CSS optimization

Remember that styling choices should align with your team's expertise, project requirements, and long-term maintenance goals.
