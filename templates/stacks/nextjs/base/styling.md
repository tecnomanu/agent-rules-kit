---
description: Styling approaches and best practices in Next.js applications.
globs: <root>/{app,src,pages,components}/**/*.{ts,tsx,js,jsx,css,scss},<root>/tailwind.config.{js,ts},<root>/postcss.config.js
alwaysApply: true
---

# Styling in Next.js Applications

Next.js offers a flexible environment for styling your application, with built-in support for various methods and easy integration with popular libraries. Choosing the right styling strategy for {projectPath} depends on project requirements, team familiarity, and desired developer experience.

## 1. Global CSS

-   **Concept**: Traditional CSS stylesheets that apply globally to your application.
-   **Usage**:
    -   Create a CSS file (e.g., `styles/globals.css` or `src/app/globals.css`).
    -   Import it into your root layout (for App Router: `app/layout.tsx` or `src/app/layout.tsx`) or custom App component (for Pages Router: `pages/_app.tsx` or `src/pages/_app.tsx`).
    ```javascript
    // For App Router (e.g., app/layout.tsx)
    import '../styles/globals.css'; // Adjust path as needed

    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body>{children}</body>
        </html>
      );
    }

    // For Pages Router (e.g., pages/_app.tsx)
    // import '../styles/globals.css'; // Adjust path as needed
    // function MyApp({ Component, pageProps }) {
    //   return <Component {...pageProps} />;
    // }
    // export default MyApp;
    ```
-   **Pros**: Simple for defining global styles, resets, and base typography.
-   **Cons**: Can lead to specificity issues and naming conflicts in larger projects if not managed carefully.

## 2. CSS Modules

-   **Concept**: CSS files where class names and animations are scoped locally by default to the component that imports them. Next.js has built-in support for CSS Modules.
-   **Usage**:
    -   Name your style files with the `.module.css` extension (e.g., `components/Button/Button.module.css`).
    -   Import the styles object from the CSS Module file and use its properties to apply classes.
    ```jsx
    // components/Button/Button.module.css
    // .button {
    //   background-color: blue;
    //   color: white;
    //   padding: 10px 20px;
    // }
    // .error {
    //   background-color: red;
    // }

    // components/Button/Button.tsx
    import styles from './Button.module.css';

    export function Button({ children, isError }) {
      const buttonClassName = isError ? `${styles.button} ${styles.error}` : styles.button;
      return <button type="button" className={buttonClassName}>{children}</button>;
    }
    ```
-   **Pros**: Local scope by default (prevents naming collisions), co-location of styles with components, explicit dependencies.
-   **Cons**: Managing dynamic class names can sometimes be verbose.

## 3. Sass/SCSS

-   **Concept**: Use Sass, a popular CSS preprocessor, to add features like variables, nesting, mixins, and functions. Next.js has built-in support for Sass.
-   **Setup**:
    1.  Install Sass: `npm install sass` or `yarn add sass`.
-   **Usage**:
    -   Name files with `.scss` or `.sass` extensions.
    -   Can be used for global styles or with CSS Modules (`.module.scss` or `.module.sass`).
    ```scss
    // styles/variables.scss
    // $primary-color: blue;

    // components/Card/Card.module.scss
    // @import '../../styles/variables.scss';
    // .card {
    //   background-color: white;
    //   border: 1px solid #eee;
    //   &:hover {
    //     border-color: $primary-color;
    //   }
    // }
    ```
-   **Pros**: Enhanced CSS capabilities, better organization for complex stylesheets.

## 4. CSS-in-JS Libraries

-   **Concept**: Write CSS directly within your JavaScript or TypeScript files using libraries that generate actual CSS.
-   **Popular Libraries**:
    -   **Styled Components**: Uses tagged template literals.
    -   **Emotion**: Offers various APIs including tagged template literals and a `css` prop.
-   **Server-Side Rendering (SSR) Considerations**:
    -   Next.js pre-renders pages on the server. CSS-in-JS libraries need specific setup to inject styles correctly during SSR, preventing a flash of unstyled content (FOUC).
    -   This usually involves:
        -   A Babel plugin (e.g., `babel-plugin-styled-components`).
        -   Customizing `_document.tsx` (Pages Router) or using a Server Components-compatible setup (App Router) to collect and render styles on the server.
-   **Setup Example (Styled Components with App Router - conceptual, check library docs for latest)**:
    -   Install: `npm install styled-components`
    -   Create a component (e.g., `lib/StyledComponentsRegistry.tsx`) to handle style extraction on the server for Server Components.
    ```tsx
    // lib/StyledComponentsRegistry.tsx - Simplified example
    'use client';
    import React, { useState } from 'react';
    import { useServerInsertedHTML } from 'next/navigation';
    import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

    export default function StyledComponentsRegistry({ children }) {
      const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

      useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
      });

      if (typeof window !== 'undefined') return <>{children}</>;

      return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
          {children}
        </StyleSheetManager>
      );
    }

    // app/layout.tsx
    // import StyledComponentsRegistry from './lib/StyledComponentsRegistry';
    // export default function RootLayout({ children }) {
    //   return (
    //     <html>
    //       <body>
    //         <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
    //       </body>
    //     </html>
    //   );
    // }
    ```
-   **Pros**: Dynamic styling based on props/state, theming, co-location of styles and logic.
-   **Cons**: Potential runtime overhead, learning curve, setup for SSR can be complex.

## 5. Tailwind CSS

-   **Concept**: A utility-first CSS framework that provides low-level utility classes to build designs directly in your markup.
-   **Setup**:
    1.  Install Tailwind and its peer dependencies: `npm install -D tailwindcss postcss autoprefixer`.
    2.  Generate config files: `npx tailwindcss init -p`. This creates `tailwind.config.js` and `postcss.config.js`.
    3.  Configure `tailwind.config.js` (especially the `content` array to include paths to your components and pages/app router files).
    4.  Import Tailwind directives into your global CSS file (e.g., `styles/globals.css`).
    ```css
    /* styles/globals.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
-   **Usage**:
    ```jsx
    export function MyButton({ children }) {
      return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {children}
        </button>
      );
    }
    ```
-   **Pros**: Rapid UI development, highly customizable, small CSS output with purging, consistent styling.
-   **Cons**: Can make JSX verbose ("class soup"), learning curve for utility classes.

## Comparison of Approaches

| Feature         | Global CSS | CSS Modules | Sass/SCSS    | CSS-in-JS       | Tailwind CSS   |
|-----------------|------------|-------------|--------------|-----------------|----------------|
| Scoping         | Global     | Local       | Global/Local | Local (usually) | Utility-based  |
| Dynamic Styles  | Limited    | Limited     | Limited      | Excellent       | Good (via JS)  |
| SSR Setup       | Simple     | Simple      | Simple       | Complex         | Simple         |
| Bundle Size     | Varies     | Good        | Varies       | Can be larger   | Excellent (purged) |
| Dev Experience  | Basic      | Good        | Good         | Varies          | Excellent      |
| Colocation      | No         | Yes         | Yes          | Yes             | In markup      |

For {projectPath}, consider these factors:
-   **Team Familiarity**: Choose technologies your team is comfortable with.
-   **Project Size/Complexity**: CSS Modules or Tailwind CSS are great for scalability. CSS-in-JS can be powerful but adds complexity.
-   **Performance Needs**: Be mindful of runtime overhead with CSS-in-JS. Tailwind CSS and CSS Modules generally offer good performance.
-   **Design System Requirements**: Tailwind CSS or a well-structured CSS-in-JS setup can be beneficial for building design systems.

A combination of approaches is also common, e.g., global styles for base settings, and CSS Modules or Tailwind CSS for component-specific styling.
```
