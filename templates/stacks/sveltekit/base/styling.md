---
description: Styling concepts and approaches in SvelteKit applications
globs: <root>/src/**/*.{svelte,css,scss,less,ts,js}
alwaysApply: true
---

# Styling in SvelteKit Applications

This document outlines common conceptual approaches to styling SvelteKit applications in {projectPath}. SvelteKit provides excellent built-in support for various styling methods with automatic optimization and SSR compatibility.

## SvelteKit Styling Features

### 1. Component Styles
- **Scoped by Default**: Styles in `<style>` tags are automatically scoped to the component.
- **CSS Processing**: Built-in support for CSS preprocessing and optimization.
- **SSR Compatible**: Styles work seamlessly with server-side rendering.
- **Hot Reloading**: Instant style updates during development.

### 2. Global Styles
- **app.css**: Global styles can be imported in `app.html` or `+layout.svelte`.
- **CSS Files**: Import CSS files directly in Svelte components.
- **Style Cascade**: Global styles cascade normally while component styles remain scoped.

### 3. CSS Preprocessing
- **Sass/SCSS**: Built-in support after installing `sass`.
- **Less**: Support through additional configuration.
- **PostCSS**: Built-in PostCSS support with autoprefixer.
- **Configuration**: Customize preprocessing in `vite.config.js`.

## Common Styling Approaches

### 1. Scoped Component Styles
- **Concept**: Default styling approach in Svelte components.
- **Automatic Scoping**: Styles are automatically scoped to the component.
- **No Naming Conflicts**: Class names are automatically made unique.
- **Performance**: Unused styles are automatically removed.

```svelte
<script>
  let count = 0;
</script>

<button class="primary" on:click={() => count++}>
  Count: {count}
</button>

<style>
  .primary {
    background: blue;
    color: white;
    padding: 1rem;
  }
</style>
```

### 2. Global Styles with :global()
- **Concept**: Apply global styles from within component style blocks.
- **Syntax**: Use `:global()` modifier to make styles global.
- **Use Cases**: Styling child components, third-party components.
- **Best Practice**: Use sparingly to maintain encapsulation.

```svelte
<style>
  :global(body) {
    font-family: Arial, sans-serif;
  }
  
  .container :global(.child) {
    margin: 1rem;
  }
</style>
```

### 3. CSS Custom Properties (CSS Variables)
- **Theme Support**: Use CSS variables for theming and dynamic styling.
- **Component Props**: Pass values from JavaScript to CSS.
- **Performance**: Better performance than inline styles.
- **Browser Support**: Excellent modern browser support.

```svelte
<script>
  export let primaryColor = '#007acc';
</script>

<div class="themed" style="--primary: {primaryColor}">
  <button class="btn">Themed Button</button>
</div>

<style>
  .themed {
    --primary: #007acc;
  }
  
  .btn {
    background: var(--primary);
    color: white;
  }
</style>
```

### 4. CSS Frameworks Integration

#### Tailwind CSS
- **Installation**: Install `@tailwindcss/vite` and configure.
- **Configuration**: Set up `tailwind.config.js` for customization.
- **JIT Mode**: Just-in-time compilation for optimal bundle size.
- **Component Integration**: Works seamlessly with Svelte components.

#### Bootstrap
- **Installation**: Install Bootstrap and import in global styles.
- **Customization**: Override Sass variables for customization.
- **Components**: Use Bootstrap classes in Svelte components.

#### Bulma
- **Installation**: Install Bulma and configure Sass.
- **Modular**: Import only needed Bulma modules.
- **Customization**: Override Sass variables.

### 5. CSS-in-JS Alternatives

#### Styled Components (svelte-styled-components)
- **Installation**: Use `svelte-styled-components` package.
- **Dynamic Styling**: Create styled components with props.
- **Theme Support**: Built-in theming capabilities.

#### Emotion
- **Installation**: Configure Emotion with SvelteKit.
- **Performance**: Good performance with SvelteKit's compilation.
- **Features**: Similar to React's Emotion library.

## Advanced Styling Techniques

### 1. Dynamic Classes
- **Class Directive**: Use `class:` directive for conditional classes.
- **Reactive Classes**: Classes that change based on component state.
- **Multiple Conditions**: Handle complex conditional styling.

```svelte
<script>
  let active = false;
  let type = 'primary';
</script>

<button 
  class="btn"
  class:active
  class:btn-primary={type === 'primary'}
  class:btn-secondary={type === 'secondary'}
>
  Dynamic Button
</button>
```

### 2. Style Directives
- **Inline Styles**: Use `style:` directive for dynamic inline styles.
- **CSS Variables**: Set CSS custom properties dynamically.
- **Conditional Styles**: Apply styles based on conditions.

```svelte
<script>
  let width = 100;
  let color = 'blue';
</script>

<div 
  style:width="{width}px"
  style:background-color={color}
  style:display={width > 50 ? 'block' : 'none'}
>
  Dynamic Styling
</div>
```

### 3. Animation and Transitions
- **Built-in Transitions**: Svelte's built-in transition system.
- **Custom Transitions**: Create custom transition functions.
- **CSS Animations**: Use CSS animations with Svelte's lifecycle.
- **Motion Libraries**: Integration with motion libraries.

```svelte
<script>
  import { fade, slide } from 'svelte/transition';
  let visible = true;
</script>

{#if visible}
  <div transition:fade="{{ duration: 300 }}">
    Fading content
  </div>
{/if}

{#if visible}
  <div transition:slide="{{ duration: 300 }}">
    Sliding content
  </div>
{/if}
```

## SvelteKit-Specific Considerations

### 1. Server-Side Rendering (SSR)
- **Style Extraction**: Styles are automatically extracted for SSR.
- **Critical CSS**: Critical styles are inlined for better performance.
- **Hydration**: Styles are consistent between server and client.

### 2. Static Site Generation (SSG)
- **Build-time Optimization**: Styles are optimized during build.
- **Asset Generation**: CSS files are generated and optimized.
- **CDN Compatibility**: Generated styles work well with CDNs.

### 3. Route-based Styling
- **Layout Styles**: Apply styles in layout components.
- **Page Styles**: Page-specific styles in route components.
- **Nested Layouts**: Handle styling in nested layout structures.

## Performance Optimization

### 1. CSS Code Splitting
- **Automatic Splitting**: SvelteKit automatically splits CSS by routes.
- **Component-based**: CSS is loaded only for used components.
- **Bundle Analysis**: Analyze CSS bundle sizes and optimize.

### 2. Unused CSS Elimination
- **Automatic Removal**: Svelte removes unused styles automatically.
- **Tree Shaking**: CSS tree shaking for better performance.
- **Production Optimization**: Aggressive optimization in production builds.

### 3. Asset Optimization
- **Minification**: Automatic CSS minification in production.
- **Compression**: Enable compression for CSS files.
- **Caching**: Proper cache headers for CSS assets.

## Best Practices

### Development Workflow
- **Component Organization**: Keep styles close to their components.
- **Naming Conventions**: Use consistent naming (BEM, etc.).
- **Linting**: Use Stylelint for CSS quality.
- **Formatting**: Use Prettier for consistent formatting.

### Architecture Patterns
- **Design System**: Create a consistent design system.
- **Utility Classes**: Create utility classes for common patterns.
- **Component Variants**: Use props to create component variants.
- **Theme Management**: Implement consistent theming strategy.

### Performance
- **Critical CSS**: Optimize critical rendering path.
- **Lazy Loading**: Load non-critical styles lazily.
- **Bundle Size**: Monitor and optimize CSS bundle sizes.
- **Runtime Performance**: Minimize style recalculations.

### Maintainability
- **Documentation**: Document styling patterns and conventions.
- **Refactoring**: Regularly refactor and optimize styles.
- **Testing**: Consider visual regression testing.
- **Version Control**: Use meaningful commit messages for style changes.

## Recommendations

### For Small Projects
- Use **scoped component styles** as primary approach
- Use **CSS custom properties** for theming
- Keep **global styles** minimal
- Use **style directives** for dynamic styling

### For Medium Projects
- Implement **design system** with consistent tokens
- Use **Tailwind CSS** for utility-first approach
- Create **reusable styled components**
- Set up **linting and formatting** tools

### For Large Projects
- Use **CSS architecture** patterns (ITCSS, SMACSS)
- Implement **comprehensive theming** system
- Use **component libraries** for consistency
- Set up **automated testing** for styles

### For Performance-Critical Applications
- Optimize **critical CSS** delivery
- Use **CSS-in-JS** only when necessary
- Implement **lazy loading** for non-critical styles
- Monitor **runtime performance** of styles

### For Design System Projects
- Create **well-documented components**
- Use **CSS custom properties** for customization
- Implement **consistent spacing and typography**
- Provide **multiple themes** and variants

Remember that SvelteKit's automatic optimizations handle many performance concerns, allowing you to focus on creating maintainable and scalable styling solutions while leveraging Svelte's unique features like scoped styles and reactive styling.
