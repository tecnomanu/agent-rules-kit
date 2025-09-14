---
description: Styling approaches in Vue.js, including scoped CSS, CSS Modules, pre-processors, and integrating UI frameworks.
globs: <root>/src/**/*.{vue,css,scss,less}
alwaysApply: true
---

# Styling in Vue.js Applications

Vue.js offers several ways to style your components, allowing for flexibility and maintainability whether you prefer scoped styles, CSS Modules, or integrating with UI component libraries. This guide covers common styling approaches in {projectPath}.

## 1. Scoped CSS (`<style scoped>`)

This is the most common and recommended way to style Single File Components (SFCs) in Vue. When the `scoped` attribute is added to a `<style>` tag, Vue will scope the CSS to the current component only. It achieves this by adding a unique data attribute (e.g., `data-v-xxxxxxx`) to elements in the component and transforming CSS selectors.

```vue
<template>
  <div class="example">
    <p class="text">Scoped styles are great!</p>
  </div>
</template>

<style scoped>
/* These styles will only apply to elements within this component */
.example {
  padding: 20px;
  background-color: #f0f0f0;
}

.text {
  color: blue;
}

/* If you need to style a child component's root element from a parent: */
/* .example :deep(.child-component-root-class) { */
/*   border: 1px solid green; */
/* } */
</style>
```

-   **Benefits**: Prevents styles from leaking and affecting other components, making CSS more predictable and easier to manage.
-   **`::v-deep` or `:deep()` (Recommended)**: If you need to style a child component's content from a parent component (use with caution), you can use the `:deep()` pseudo-class or its alias `::v-deep`.
-   **`:slotted()`**: To style content passed into slots from the parent.
-   **`:global()`**: To declare global styles from within a scoped style block (use sparingly).

## 2. CSS Modules (`<style module>`)

Vue SFCs also support CSS Modules. By adding the `module` attribute to a `<style>` tag, the CSS classes are locally scoped and exposed to the component via the `$style` object in the template or `this.$style` (Options API) / `useCssModule()` (Composition API) in the script.

```vue
<template>
  <div :class="$style.container">
    <p :class="[$style.text, $style.highlight]">CSS Modules example</p>
  </div>
</template>

<style module>
/* :module or :module="customName" */
.container {
  background-color: lightgreen;
  padding: 1em;
}
.text {
  font-size: 1.2em;
}
.highlight {
  font-weight: bold;
  color: darkgreen;
}
</style>

<script setup>
// Optional: Access CSS module classes in script (Composition API)
import { useCssModule } from 'vue';
const styles = useCssModule(); // Default $style, or useCssModule('customName')
// console.log(styles.container);
</script>
```

-   **Benefits**: Explicit class binding, truly local scope, avoids global class name conflicts, can be easier to integrate with JavaScript logic.
-   **Custom Inject Name**: `<style module="myStyles">` makes classes available under `myStyles` object.

## 3. Global Styles

For styles that apply to the entire application (e.g., CSS resets, base typography, layout helpers).

-   **Import in `main.js`/`main.ts`**: You can import global CSS files directly in your main application entry point.
    ```javascript
    // src/main.ts
    import { createApp } from 'vue';
    import App from './App.vue';
    import './styles/global.css'; // Import global stylesheet

    createApp(App).mount('#app');
    ```
-   **Plain CSS in `public/`**: Less common for app-wide styles but can be used for static assets linked in `index.html`.
-   **Root Component Styles**: Styles in the root `App.vue` component without the `scoped` attribute will be global.

## 4. CSS Pre-processors (Sass/Less/Stylus)

Vue CLI and Vite (common build tools for Vue) provide out-of-the-box support for CSS pre-processors.

1.  **Installation**:
    ```bash
    # For Sass/SCSS
    npm install -D sass sass-loader
    # For Less
    npm install -D less less-loader
    # For Stylus
    npm install -D stylus stylus-loader
    ```
    (Note: `sass-loader`, `less-loader`, `stylus-loader` might be implicitly handled by Vite or need to be installed based on the Vue project setup).

2.  **Usage**: Add the `lang` attribute to your `<style>` tags.
    ```vue
    <template>
      <nav class="navbar">...</nav>
    </template>

    <style lang="scss" scoped>
    $navbar-background: #333;
    $navbar-text-color: white;

    .navbar {
      background-color: $navbar-background;
      padding: 1rem;
      a {
        color: $navbar-text-color;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    </style>
    ```
-   **Global Pre-processor Variables/Mixins**: You can configure your build tool (Vite or Vue CLI) to automatically import global SCSS variables, mixins, etc., into every component.
    -   For Vite (`vite.config.js`):
        ```javascript
        // vite.config.js
        export default {
          css: {
            preprocessorOptions: {
              scss: {
                additionalData: `@import "@/styles/_variables.scss"; @import "@/styles/_mixins.scss";`
              }
            }
          }
        }
        ```

## 5. `v-bind` in CSS (Dynamic CSS)

Vue allows binding component state directly into `<style>` tags using the `v-bind()` CSS function. This is powerful for creating dynamic styles based on component logic.

```vue
<template>
  <p class="dynamic-text">This text changes color.</p>
  <input type="color" v-model="textColor" />
</template>

<script setup>
import { ref } from 'vue';
const textColor = ref('#000000');
</script>

<style scoped>
.dynamic-text {
  /* Use v-bind to link CSS properties to component state */
  color: v-bind(textColor);
  padding: 10px;
  border: 1px solid v-bind(textColor); /* Can be used for any CSS property */
}
</style>
```
-   Works with both `<script setup>` and Options API.
-   The argument to `v-bind()` can be any valid JavaScript expression that evaluates to a string (e.g., `v-bind('props.themeColor')`, `v-bind('state.fontSize + "px"')`).

## 6. Integrating UI Component Libraries

Vue has a rich ecosystem of UI component libraries like Vuetify, Quasar, Element Plus, Naive UI, PrimeVue, etc.

-   **Installation**: Follow the specific library's installation guide. Most have Vue plugins for easy integration.
    ```javascript
    // Example: main.ts for a library like Element Plus
    import { createApp } from 'vue';
    import ElementPlus from 'element-plus';
    import 'element-plus/dist/index.css'; // Import library's base CSS
    import App from './App.vue';

    const app = createApp(App);
    app.use(ElementPlus);
    app.mount('#app');
    ```
-   **Theming**: Most UI libraries offer robust theming capabilities:
    -   **CSS Variables**: Many modern libraries use CSS variables for theming, allowing you to override them globally or per component.
    -   **Sass/Less Variables**: Some libraries provide Sass/Less variables that you can customize during the build process.
    -   **JavaScript Configuration**: Some might offer theme configuration via JavaScript objects.
    -   Refer to the specific UI library's documentation for detailed theming instructions.
-   **Overriding Styles**: You can override library component styles using global CSS (with higher specificity) or carefully using `:deep()` if necessary, though it's generally better to use the library's theming system.

Choosing the right styling approach for {projectPath} depends on the project's scale, team preferences, and the need for global theming or integration with specific UI libraries. Vue's flexibility accommodates a wide range of strategies.
```
