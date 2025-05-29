---
description: Styling concepts, approaches, and best practices in Angular applications.
globs: <root>/src/**/*.scss,<root>/src/**/*.css,<root>/src/**/*.html,<root>/angular.json
alwaysApply: true
---

# Styling in Angular Applications

Angular provides a flexible and powerful system for styling applications, from global styles to encapsulated component styles. Understanding these concepts is key to building maintainable and visually appealing UIs in {projectPath}.

## Global Styles

Global styles are applied to the entire application. They are suitable for defining base styles, CSS resets, typography, and application-wide themes.

-   **Configuration in `angular.json`**:
    The Angular CLI manages global styles through the `styles` array in the `build` options of your `angular.json` file.
    ```json
    // angular.json (excerpt)
    "projects": {
      "my-app": {
        "architect": {
          "build": {
            "options": {
              "styles": [
                "src/styles.scss", // Main global stylesheet
                "node_modules/bootstrap/dist/css/bootstrap.min.css" // Example third-party library
              ],
              // ...
            }
          }
        }
      }
    }
    ```
-   **`src/styles.scss` (or `.css`)**: This is the default file for your global styles. You can import other CSS/SCSS files into it.

    ```scss
    /* src/styles.scss */
    @import 'themes/default-theme'; // Example import
    @import 'variables';

    body {
    	font-family: var(--font-family-base, 'Roboto', sans-serif);
    	margin: 0;
    	padding: 0;
    	background-color: var(--background-color, #fff);
    	color: var(--text-color, #333);
    }

    h1,
    h2,
    h3 {
    	font-weight: normal;
    }
    ```

## Component Styles

Angular components can define their own styles that are scoped to the component itself, preventing styles from leaking out and affecting other parts of the application.

-   **Metadata `styleUrls` or `styles`**:

    -   `styleUrls`: An array of paths to external CSS/SCSS files.

        ```typescript
        // my-component.component.ts
        import { Component } from '@angular/core';

        @Component({
        	selector: 'app-my-component',
        	templateUrl: './my-component.component.html',
        	styleUrls: ['./my-component.component.scss'], // Link to external style file
        })
        export class MyComponent {}
        ```

    -   `styles`: An array of inline style strings. Useful for small, component-specific styles.

        ```typescript
        // my-other-component.component.ts
        import { Component } from '@angular/core';

        @Component({
        	selector: 'app-my-other-component',
        	template: '<p class="highlight">Inline styled text.</p>',
        	styles: [
        		`
        			.highlight {
        				color: blue;
        				font-weight: bold;
        			}
        		`,
        	],
        })
        export class MyOtherComponent {}
        ```

-   **ViewEncapsulation**: Angular controls how component styles are encapsulated using the `encapsulation` property in the `@Component` decorator.

    -   **`ViewEncapsulation.Emulated` (Default)**:
        -   Styles are scoped to the component by adding unique attributes to elements (e.g., `_ngcontent-c1`) and transforming CSS selectors.
        -   This mimics Shadow DOM behavior without actually using it, providing good isolation with broader browser support.
    -   **`ViewEncapsulation.ShadowDom`**:
        -   Uses the browser's native Shadow DOM API. Styles are completely isolated within the component's shadow root.
        -   Global styles do not penetrate the Shadow DOM unless specifically designed to (e.g., using CSS Custom Properties).
    -   **`ViewEncapsulation.None`**:

        -   Styles defined in the component are not scoped and behave like global styles. Use with caution as it can lead to style conflicts.

        ```typescript
        import { Component, ViewEncapsulation } from '@angular/core';

        @Component({
        	selector: 'app-shadow-dom-component',
        	template: '<p>This component uses Shadow DOM encapsulation.</p>',
        	styles: ['p { color: green; }'],
        	encapsulation: ViewEncapsulation.ShadowDom,
        })
        export class ShadowDomComponent {}
        ```

-   **Special Selectors**:
    -   `:host`: Selects the component's host element.
        ```scss
        :host {
        	display: block;
        	border: 1px solid #ccc;
        }
        :host(.active) {
        	// Style based on class applied to host element
        	border-color: blue;
        }
        ```
    -   `:host-context()`: Selects the host element only if it or one of its ancestors matches the provided selector. Useful for theming based on parent context.
        ```scss
        :host-context(.theme-dark) p {
        	color: white;
        }
        ```
    -   `::ng-deep` (Deprecated, use with caution): Pierces component style encapsulation, applying styles to child components. If absolutely necessary, try to limit its scope. Prefer other methods like CSS Custom Properties or passing CSS classes if possible.

## CSS Preprocessors (Sass/SCSS, Less)

Angular CLI has built-in support for common CSS preprocessors.

1.  **Installation**:
    ```bash
    npm install sass --save-dev  # For SCSS/Sass
    # or
    npm install less --save-dev # For Less
    ```
2.  **Configuration**:
    -   For SCSS, simply rename `src/styles.css` to `src/styles.scss` and update the path in `angular.json`.
    -   Component style files can also use `.scss` or `.less` extensions (e.g., `my-component.component.scss`).
3.  **Usage**: Write styles using preprocessor syntax. You can import partials, use variables, mixins, nesting, etc.

    ```scss
    // src/app/components/my-card/my-card.component.scss
    @import 'variables'; // Assuming _variables.scss is in an include path or relative

    .card {
    	padding: $card-padding;
    	border: 1px solid $primary-color;
    	h2 {
    		color: $secondary-color;
    	}
    }
    ```

    The Angular CLI compiles these down to standard CSS during the build process.

## Using Angular Material and Theming

Angular Material is a UI component library that provides pre-built, high-quality components. It has a robust theming system.

-   **Setup**: Follow the official Angular Material "getting started" guide (`ng add @angular/material`).
-   **Theming Concepts**:

    -   Themes are defined using Sass. You can use pre-built themes or create custom themes by defining primary, accent, and warn color palettes.
    -   Apply themes globally in your `styles.scss`.

    ```scss
    // src/styles.scss
    @use '@angular/material' as mat;

    @include mat.core(); // Core Material styles

    // Define a custom theme
    $my-app-primary: mat.define-palette(mat.$indigo-palette);
    $my-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
    $my-app-warn: mat.define-palette(mat.$red-palette);

    $my-app-theme: mat.define-light-theme(
    	(
    		color: (
    			primary: $my-app-primary,
    			accent: $my-app-accent,
    			warn: $my-app-warn,
    		),
    	)
    );

    @include mat.all-component-themes(
    	$my-app-theme
    ); // Apply the theme to all Material components
    ```

    -   You can also apply themes to specific components or define multiple themes.

## Utility CSS Frameworks (e.g., Tailwind CSS)

Utility-first CSS frameworks can be integrated into Angular projects.

-   **Setup**: Requires installing the framework and configuring PostCSS (which Angular CLI uses under the hood).
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init
    ```
    Configure `tailwind.config.js` (especially the `content` array to include your HTML and TS files) and ensure Tailwind's directives are in your global stylesheet.
-   **Usage**: Apply utility classes directly in your component templates.
    ```html
    <!-- my-component.component.html -->
    <div
    	class="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-700">
    	Styled with Tailwind!
    </div>
    ```
-   **Considerations**: Can sometimes conflict with component encapsulation if not managed carefully. Ensure Tailwind's base styles and utilities are loaded globally.

Choosing the right styling approach in {projectPath} depends on project size, team familiarity, and design requirements. Angular's flexibility allows for a mix of these techniques.

```

```
