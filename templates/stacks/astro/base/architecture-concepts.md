---
description: Core architectural concepts for Astro projects
globs: ./**/*
always: true
---

# Astro Architecture Concepts

## Overview

Astro is a modern web framework that optimizes for content-focused websites. It allows you to build faster websites with less client-side JavaScript by leveraging a unique architecture that combines static site generation (SSG), server-side rendering (SSR), and partial hydration.

## Key Architectural Concepts

### 1. Islands Architecture

Astro pioneered the "Islands Architecture" - a pattern where most of your page is static HTML with isolated, interactive components (islands) that hydrate independently:

-   **Static HTML**: The majority of your page is zero-JavaScript HTML
-   **Interactive Islands**: Only components that need JavaScript are hydrated
-   **Partial Hydration**: Components can be selectively hydrated based on different strategies

### 2. Multi-Framework Support

Astro allows you to use components from multiple UI frameworks in the same project:

-   React, Vue, Svelte, Solid, Preact, Alpine, and Lit components
-   Native Astro components (`.astro` files)
-   Markdown and MDX content

### 3. Content Collections

Astro provides a type-safe way to organize and query content:

-   **Type Safety**: TypeScript schema validation for frontmatter
-   **Content Organization**: Structure your content with collections
-   **Content Query API**: Fetch and filter your content with a simple API

### 4. Rendering Modes

Astro supports multiple rendering strategies that can be mixed in a single project:

-   **Static Site Generation (SSG)**: Pre-render pages at build time
-   **Server-Side Rendering (SSR)**: Generate pages on-demand
-   **Hybrid Rendering**: Mix static and dynamic routes

### 5. Project Structure

A typical Astro project follows this structure:

```
├── astro.config.mjs          # Configuration file
├── public/                   # Static assets
├── src/
│   ├── components/          # UI components (.astro, .jsx, .vue, etc.)
│   ├── layouts/             # Layout components
│   ├── pages/               # File-based routing
│   ├── content/             # Content collections
│   └── styles/              # Global styles
└── package.json
```

## Core Design Principles

1. **Ship Less JavaScript**: Prioritize static HTML with minimal JS
2. **Server-first API Design**: Move expensive operations to the build or server
3. **Fast by Default**: Built-in performance optimizations
4. **Easy to Use**: Designed for developer experience
5. **Fully Featured, Flexible**: Includes everything needed, but allows customization
