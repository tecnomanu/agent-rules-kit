---
description: Key features and implementation details specific to Astro version 3, including View Transitions, enhanced Image Optimization, and i18n routing.
globs: <root>/src/**/*.{astro,md,mdx},<root>/astro.config.mjs
alwaysApply: true # Applies if v3 is detected
---

# Astro v3 Specific Features

## Overview

Astro 3.0 introduces several major features and improvements that build on the foundation of Astro 2.0, enhancing both developer experience and end-user performance.

## View Transitions API

Astro 3.0 makes the View Transitions API official (no longer experimental), providing smooth page transitions for a more app-like experience:

```astro
---
// src/layouts/BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <!-- Add ViewTransitions to enable smooth page transitions -->
    <ViewTransitions />
  </head>
  <body>
    <main transition:animate="slide"> {/* Example default animation */}
      <slot />
    </main>
  </body>
</html>
```

### Element-Specific Transitions

You can specify transitions for individual elements:

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
---

<BaseLayout title="Home">
  <h1 transition:animate="fade">Welcome to My Site</h1>

  <!-- Elements that should persist between pages -->
  <header transition:persist>
    <p>My Site Header</p>
  </header>

  <!-- Custom transition for specific elements -->
  <div class="hero" transition:animate={{ name: 'slide', duration: '0.5s' }}>
    <h2>Featured Content</h2>
    <!-- Content -->
  </div>
</BaseLayout>
```

### Custom Transition Directives

You can define custom transitions:

```javascript
// src/transitions.js
// This is a conceptual example. Actual custom transition API might differ or evolve.
// Refer to official Astro docs for precise custom transition definition.
export function myCustomFade(node, params) {
  const duration = params?.duration || 300;
  return {
    duration,
    css: (t) => `opacity: ${t}`
  };
}
```

```astro
---
// Using custom transitions (conceptual, ensure API matches Astro docs)
// import { myCustomFade } from '../transitions.js';
---
<div transition:animate={myCustomFade}> {/* Pass options if your custom transition accepts them */}
	Fades with custom logic
</div>
```

## Image Optimization Improvements

Astro 3.0 greatly enhances the built-in image optimization features (`astro:assets`).

### Image Component (`<Image />`)

```astro
---
// src/pages/gallery.astro
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg'; // Assuming local asset
import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
---

<BaseLayout title="Gallery">
  <h1>Image Gallery</h1>

  <!-- Local images with automatic width/height based on import -->
  <Image
    src={heroImage}
    alt="Hero image"
    format="avif"     décisions
    quality={90}      
  />

  <!-- Responsive images with explicit widths -->
  <Image
    src={heroImage}
    alt="Responsive hero"
    widths={[300, 600, 900]} /* Define widths for srcset */
    sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px" /* Define sizes attribute */
  />

  <!-- Remote image requires width and height -->
  <Image
    src="https://placehold.co/400x300/webp"
    alt="Remote image placeholder"
    width={400}
    height={300}
    format="webp" /* Can specify output format */
  />
</BaseLayout>
```

### Picture Component (`<Picture />`)

For more control over different image formats and art direction.

```astro
---
// src/pages/responsive.astro
import { Picture } from 'astro:assets';
import heroImage from '../assets/hero.jpg'; // Assuming local asset
import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
---

<BaseLayout title="Responsive Images">
  <h1>Responsive Images</h1>

  <Picture
    src={heroImage}
    alt="Responsive hero image, art directed"
    widths={[400, 800, 1200]}
    sizes="(max-width: 767px) 400px, (max-width: 1199px) 800px, 1200px"
    formats={['avif', 'webp', 'jpeg']} /* Specify desired output formats */
  />
</BaseLayout>
```

### Improved Optimization Configuration

Configuration in `astro.config.mjs` for the image service (e.g., Sharp or Squoosh).

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	image: {
		// For local processing with Sharp (default) or Squoosh
		service: { entrypoint: 'astro/assets/services/sharp' }, // or 'astro/assets/services/squoosh'
		// Example: configure domains for remote images if using a specific service that requires it.
		// domains: ['trusted-image-domain.com'],
		// remotePatterns: [{ protocol: 'https', hostname: 'example.com' }], // More granular control
	},
});
```

## React Server Components (Experimental in Astro 3, more focus later)

Astro 3.0 continued experimental support for React Server Components (RSC), allowing server-only React components.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
	integrations: [
		react({
			experimentalReactServerComponents: true, // Flag name might vary slightly by minor version
		}),
	],
});
```

Using RSC in Astro:
```tsx
// src/components/ServerDataFetcher.jsx (Note: .jsx or .tsx for React components)
// This component is intended to run on the server.
// Actual RSCs are more nuanced and depend on React's specific RSC implementation.
// Astro's integration aims to make this possible within the Astro model.

async function fetchData() {
  // Simulate fetching data
  await new Promise(resolve => setTimeout(resolve, 100));
  return [{ id: 1, name: "Server Data Item 1" }, { id: 2, name: "Server Data Item 2" }];
}

export default async function ServerDataFetcher() {
  const data = await fetchData();

  return (
    <div>
      <h2>Server-Fetched Data (RSC Example)</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

```astro
---
// src/pages/with-rsc.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import ServerDataFetcher from '../components/ServerDataFetcher.jsx';
---

<BaseLayout title="React Server Components with Astro">
  <h1>Using React Server Components</h1>
  <ServerDataFetcher client:only="jsx" /> {/* Hydration strategy still applies for client interactivity if any */}
</BaseLayout>
```
*Note: RSC support in Astro was experimental and evolved. The exact syntax and capabilities should be checked against specific Astro 3.x minor version docs.*

## i18n Routing (Internationalization)

Astro 3.0 introduced more built-in support for internationalization routing strategies.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'fr'],
		routing: {
			prefixDefaultLocale: false, // e.g., /about vs /en/about
			// strategy: 'pathname' // or 'domain' - check Astro docs for specific v3 options
		},
		// fallback: { // Define fallbacks if content for a locale is missing
		//  'es': 'en'
		// }
	},
});
```

Using i18n in your code (conceptual, relies on how you structure content and use `Astro.currentLocale`):
```astro
---
// src/pages/index.astro
// This is a simplified example. Actual i18n content fetching would use Content Collections.
import BaseLayout from '../layouts/BaseLayout.astro';
// import { getCollection } from 'astro:content';

// const localizedContent = await getCollection('pages', ({id}) => id.startsWith(Astro.currentLocale));
// const homeContent = localizedContent.find(p => p.slug.endsWith('home')); // Example
const homeContent = { title: "Welcome", greeting: "Hello World" }; // Placeholder
---

<BaseLayout title={homeContent.title}>
  <h1>{homeContent.greeting} ({Astro.currentLocale})</h1>
  <nav>
    <a href="/en/">English</a> | <a href="/es/">Español</a> | <a href="/fr/">Français</a>
  </nav>
</BaseLayout>
```

## Content Collections Enhancements

Astro 3.0 continued to refine Content Collections:
-   **Data Collections**: Support for JSON/YAML files in `src/content/` alongside Markdown/MDX.
-   **References**: Improved ability to link between collections (e.g., an author collection referenced by blog posts).

```typescript
// src/content/config.ts
import { defineCollection, reference, z } from 'astro:content';

const authorsCollection = defineCollection({
	type: 'data', // For JSON/YAML files
	schema: z.object({
		name: z.string(),
		bio: z.string().optional(),
	}),
});

const blogCollection = defineCollection({
	type: 'content', // For Markdown/MDX
	schema: z.object({
		title: z.string(),
		pubDate: z.date(),
		author: reference('authors'), // Reference to an entry in the 'authors' collection
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = {
	blog: blogCollection,
	authors: authorsCollection,
};
```

Using referenced collections:
```astro
---
// src/pages/blog/[...slug].astro
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro'; // Adjust path

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const author = await getEntry(post.data.author); // Resolves the reference
const { Content } = await post.render();
---
<BaseLayout title={post.data.title}>
  <h1>{post.data.title}</h1>
  <p>By {author.data.name}</p>
  <Content />
</BaseLayout>
```

## Performance Optimizations

Astro 3.0 included further performance improvements for faster builds and runtime, including optimizations in how CSS is handled and JavaScript is bundled.
- **Vite 4**: Astro 3 upgraded to Vite 4, bringing its own set of performance benefits.
- **Faster HMR**: Hot Module Replacement in development became faster.

## Migration from Astro v2

When upgrading from Astro 2.x to 3.0:
1.  Review the official Astro blog for the v3 release announcement and migration guide.
2.  Update dependencies: `npm install astro@latest @astrojs/react@latest ...` (and other integrations).
3.  **View Transitions**: If you were using the experimental API, adapt to the stable `astro:transitions` API.
4.  **Image Optimization**: Ensure your image configurations in `astro.config.mjs` are up-to-date if you use advanced features.
5.  Test your build and deployments thoroughly.

Astro 3.0 solidified many features introduced in v2 and set the stage for future enhancements, particularly around app-like experiences and developer tooling.
```
