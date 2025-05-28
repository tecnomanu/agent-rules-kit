---
description: Best practices for Astro projects, covering component organization, content management (Content Collections), asset management (Image component), performance (partial hydration, build optimization), styling, SEO, and accessibility.
globs: <root>/src/**/*.{astro,md,mdx,ts,js},<root>/astro.config.mjs
alwaysApply: true
---

# Astro Best Practices

## General Guidelines

### Component Organization

1. **Create Focused Components**: Each component should have a single responsibility
2. **Use Logical Folder Structure**: Group related components together
3. **Component Naming**:
    - Use PascalCase for component names (e.g., `HeroSection.astro`)
    - Name files based on their functionality
    - Be descriptive and consistent

### Content Management

1. **Use Content Collections** for type-safe content:

    ```typescript
    // src/content/config.ts
    import { defineCollection, z } from 'astro:content';

    const blogCollection = defineCollection({
    	schema: z.object({
    		title: z.string(),
    		date: z.date(),
    		author: z.string(),
    		tags: z.array(z.string()),
    	}),
    });

    export const collections = {
    	blog: blogCollection,
    };
    ```

2. **Organize Content Logically**:
    - Group similar content types into collections
    - Use consistent frontmatter formats

### Asset Management

1. **Optimize Images**:

    - Use the built-in `<Image />` component for automatic optimization
    - Specify width, height, and alt attributes for all images
    - Consider responsive image sizes with the `densities` or `sizes` attributes

2. **Static Assets**:
    - Place static assets in the `public/` directory
    - Organize in subdirectories by type (images, fonts, etc.)

### Performance

1. **Minimize JavaScript**:

    - Only add client-side hydration when necessary
    - Use the appropriate hydration directive (`client:load`, `client:idle`, or `client:visible`)
    - Prefer static components when interactivity isn't needed

2. **Optimize Builds**:
    - Use the appropriate rendering mode (static vs. server)
    - Split large pages into smaller components
    - Leverage proper caching strategies

### Styling

1. **Use Consistent Styling Approach**:

    - Scoped styles in .astro components
    - Global styles in dedicated style files
    - Consider utility-first CSS frameworks like Tailwind CSS

2. **Maintainable CSS**:
    - Use CSS variables for theming
    - Apply responsive design principles
    - Consider component-specific stylesheets for complex components

### SEO and Accessibility

1. **Implement SEO Best Practices**:

    - Use semantic HTML elements
    - Include meta tags for title, description, and social sharing
    - Consider canonical URLs for duplicate content

2. **Ensure Accessibility**:
    - Use proper heading hierarchy
    - Include alt text for images
    - Ensure sufficient color contrast
    - Test with keyboard navigation

## Content Strategy

### Static Content Best Practices

1. **Content Collections**
    - Use TypeScript schemas for content validation
    - Organize content by type (blog, products, docs)
    - Leverage frontmatter for metadata

```typescript
// content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.date(),
		tags: z.array(z.string()),
	}),
});

export const collections = { blog };
```

2. **Asset Optimization**

    - Place static assets in `/public` only when needed
    - Use `src/assets` for images that need optimization
    - Enable image optimization in `astro.config.mjs`

3. **Markdown/MDX Usage**
    - Use regular Markdown for simple content
    - Use MDX when you need component integration
    - Consider creating custom components for repeated patterns

### Dynamic Content Best Practices

1. **Server-Side Rendering**
    - Enable SSR only when needed:
    ```js
    // astro.config.mjs
    ```
