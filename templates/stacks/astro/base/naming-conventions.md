---
title: Astro Naming Conventions
description: Standardized naming patterns for Astro projects
tags: [Astro, Naming Conventions, Standards]
---

# Astro Naming Conventions

## File and Directory Naming

### Components

1. **Component Files**:

    - Use PascalCase for all component files: `HeaderNav.astro`, `BlogPost.astro`
    - Be descriptive and clear about the component's purpose
    - Avoid generic names like `Component.astro` or `Item.astro`

2. **Component Directories**:
    - Use lowercase with hyphens for multi-word directories: `header-components/`
    - Group related components in dedicated directories
    - Consider feature-based grouping for complex UIs

### Layouts

1. **Layout Files**:
    - Use PascalCase with "Layout" suffix: `BaseLayout.astro`, `BlogPostLayout.astro`
    - Name layouts based on their purpose or the content they wrap
    - Be consistent with naming patterns across the project

### Pages

1. **Page Files**:
    - Use kebab-case for page files: `about-us.astro`, `blog-post.astro`
    - Use `index.astro` for index/home pages
    - For dynamic routes, use square brackets: `[slug].astro`, `blog/[...slug].astro`

### Content Collections

1. **Collection Names**:

    - Use lowercase, singular form for collection directories: `blog/`, `product/`, `author/`
    - Be consistent and descriptive

2. **Content Files**:
    - Use kebab-case for content files: `getting-started.md`, `company-history.mdx`
    - Include relevant metadata in the frontmatter
    - Consider including date in filename for time-sensitive content: `2023-04-15-release-notes.md`

### Utilities and Helpers

1. **Utility Files**:
    - Use camelCase for utility files: `formatDate.ts`, `imageUtils.ts`
    - Use descriptive names that indicate functionality
    - Group related utilities in directories

### API Routes

1. **API Routes**:
    - Use kebab-case for endpoint files: `contact-form.js`, `newsletter-signup.js`
    - For dynamic API routes, use square brackets: `[id].js`
    - Consider organizing by resource or feature

## Code Naming Conventions

### TypeScript Interfaces and Types

1. **Interfaces and Types**:
    - Use PascalCase: `interface BlogPost`, `type NavigationItem`
    - Consider prefixing interfaces with 'I': `IContentConfig`

### Variables and Functions

1. **Variables**:

    - Use camelCase: `const postData`, `let isVisible`
    - Use descriptive names that indicate purpose
    - Avoid abbreviations unless very common

2. **Functions**:
    - Use camelCase: `function fetchData()`, `const processImage = () => {}`
    - Use verb-first naming for functions that perform actions: `getData()`, `formatDate()`
    - Be explicit about function purpose

### Constants

1. **Constants**:
    - Use UPPER_SNAKE_CASE for true constants: `const MAX_ITEMS = 10`
    - Use camelCase for constant references that might change: `const siteConfig = {...}`

### Component Props

1. **Props**:
    - Use camelCase for prop names: `title`, `authorName`
    - Be descriptive and specific
    - Document prop types with JSDoc or TypeScript

## CSS and Styling

1. **CSS Classes**:

    - Use kebab-case for class names: `.hero-section`, `.nav-link`
    - Consider BEM (Block Element Modifier) for complex components
    - Use descriptive names that indicate purpose

2. **CSS Custom Properties**:
    - Use kebab-case with descriptive prefixes: `--color-primary`, `--spacing-large`
    - Group related variables using namespaces: `--header-height`, `--header-background`

## Configuration

1. **Configuration Files**:
    - Use kebab-case for config files: `astro.config.mjs`, `tailwind.config.cjs`
    - Follow ecosystem conventions for specific tools
