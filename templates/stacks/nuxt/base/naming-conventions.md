---
description: Naming conventions for Nuxt applications
globs: <root>/app.vue,<root>/components/**/*.vue,<root>/components/**/*.ts,<root>/components/**/*.js
alwaysApply: false
---

# Nuxt Naming Conventions

This document outlines the naming conventions for Nuxt.js applications in {projectPath}.

## Files and Directories

### Vue Components

-   **Component Files**: Use PascalCase

    ```
    components/
    ├── AppHeader.vue
    ├── BaseButton.vue
    ├── TheFooter.vue
    └── UserProfile.vue
    ```

-   **Single-instance components**: Prefix with `The`

    ```
    TheHeader.vue
    TheFooter.vue
    TheSidebar.vue
    ```

-   **Base/UI components**: Prefix with `Base` or `App`

    ```
    BaseButton.vue
    BaseCard.vue
    AppInput.vue
    AppCheckbox.vue
    ```

-   **Feature components**: Use domain prefix
    ```
    UserProfile.vue
    ProductCard.vue
    CartSummary.vue
    ```

### Pages

-   **Page files**: Use kebab-case for better URL mapping
    ```
    pages/
    ├── index.vue
    ├── about.vue
    ├── contact-us.vue
    └── user/
        ├── index.vue
        ├── [id].vue           # Dynamic parameter
        └── profile.vue
    ```

### Layouts

-   **Layout files**: Use kebab-case
    ```
    layouts/
    ├── default.vue
    ├── admin.vue
    └── auth.vue
    ```

### Composables

-   **Composable files**: Use camelCase with `use` prefix
    ```
    composables/
    ├── useAuth.js
    ├── useCounter.js
    ├── useFetch.js
    └── useLocalStorage.js
    ```

### Stores (Pinia)

-   **Store files**: Use camelCase with module name

    ```
    stores/
    ├── user.js
    ├── cart.js
    ├── products.js
    └── settings.js
    ```

-   **Store functions**: Use `use` prefix followed by store name and `Store` suffix
    ```js
    export const useUserStore = defineStore('user', {
    	/* ... */
    });
    export const useCartStore = defineStore('cart', {
    	/* ... */
    });
    ```

### Server Routes

-   **API route files**: Use kebab-case for the file and HTTP method suffix
    ```
    server/api/
    ├── users/
    │   ├── index.get.js       # GET /api/users
    │   ├── index.post.js      # POST /api/users
    │   └── [id].get.js        # GET /api/users/:id
    ├── products.get.js        # GET /api/products
    └── auth/
        ├── login.post.js      # POST /api/auth/login
        └── logout.post.js     # POST /api/auth/logout
    ```

### Middleware

-   **Middleware files**: Use kebab-case

    ```
    middleware/
    ├── auth.js
    ├── admin-only.js
    └── redirect-legacy.js
    ```

-   **Global middleware**: Add `.global` suffix
    ```
    middleware/
    ├── auth.global.js         # Applied to all routes
    └── analytics.global.js    # Applied to all routes
    ```

### Plugins

-   **Plugin files**: Use kebab-case
    ```
    plugins/
    ├── api-client.js
    ├── error-handler.js
    └── vue-components.js
    ```

## Code Conventions

### Component Names

-   **Component registration**: Use PascalCase in JavaScript/TypeScript

    ```js
    import BaseButton from '~/components/BaseButton.vue';
    import UserProfile from '~/components/UserProfile.vue';
    ```

-   **Component usage in templates**: Use kebab-case
    ```vue
    <template>
    	<div>
    		<base-button>Click me</base-button>
    		<user-profile :user="user" />
    	</div>
    </template>
    ```

### Props

-   **Prop names**: Use camelCase in JavaScript, kebab-case in templates

    ```js
    // In component definition
    const props = defineProps({
    	itemCount: Number,
    	userName: String,
    	isActive: Boolean,
    });
    ```

    ```vue
    <!-- In template usage -->
    <user-info :item-count="5" :user-name="userName" :is-active="true" />
    ```

### Events

-   **Event names**: Use kebab-case for emitted events

    ```js
    // In component definition
    const emit = defineEmits(['update', 'item-selected', 'form-submit']);

    // Emitting events
    emit('update', newValue);
    emit('item-selected', selectedItem);
    ```

    ```vue
    <!-- In template usage -->
    <custom-select @update="handleUpdate" @item-selected="handleSelection" />
    ```

### Methods and Functions

-   **Method/Function names**: Use camelCase

    ```js
    function calculateTotal() {
    	/* ... */
    }

    const fetchUserData = async () => {
    	/* ... */
    };

    const methods = {
    	handleSubmit() {
    		/* ... */
    	},
    	validateForm() {
    		/* ... */
    	},
    };
    ```

### CSS Classes

-   **CSS class names**: Use kebab-case

    ```vue
    <template>
    	<div class="user-card">
    		<div class="user-card__header">
    			<h2 class="user-card__title">User Profile</h2>
    		</div>
    		<div class="user-card__body">
    			<p class="user-card__description">Description</p>
    		</div>
    	</div>
    </template>

    <style>
    .user-card {
    	/* ... */
    }

    .user-card__header {
    	/* ... */
    }

    .user-card__title {
    	/* ... */
    }
    </style>
    ```

### TypeScript Interfaces and Types

-   **Interface names**: Use PascalCase

    ```ts
    interface User {
    	id: string;
    	firstName: string;
    	lastName: string;
    	email: string;
    }

    interface ApiResponse<T> {
    	data: T;
    	status: number;
    	message?: string;
    }
    ```

-   **Type aliases**: Use PascalCase

    ```ts
    type UserRole = 'admin' | 'editor' | 'viewer';

    type FormStatus = 'idle' | 'loading' | 'success' | 'error';
    ```

### Constants

-   **Constants**: Use SCREAMING_SNAKE_CASE for true constants
    ```js
    const API_BASE_URL = 'https://api.example.com';
    const MAX_RETRIES = 3;
    const DEFAULT_LOCALE = 'en';
    ```

### Module Imports

-   **Module imports**: Group and order imports logically

    ```js
    // Vue and Nuxt core
    import { ref, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    // Third-party libraries
    import axios from 'axios';
    import { format } from 'date-fns';

    // Local modules
    import { useUserStore } from '~/stores/user';
    import BaseButton from '~/components/BaseButton.vue';
    import { formatCurrency } from '~/utils/formatters';
    ```

## Nuxt-Specific Conventions

### Auto-imports

-   Prefer using Nuxt's auto-imports instead of explicit imports for Vue and Nuxt features

    ```js
    // Correct - using auto-imports
    const count = ref(0);
    const route = useRoute();

    // Avoid - explicitly importing what's already auto-imported
    import { ref } from 'vue';
    import { useRoute } from 'vue-router';
    const count = ref(0);
    const route = useRoute();
    ```

### Component Registration

-   **Dynamic components**: Use the native `<component>` with `:is`

    ```vue
    <component :is="dynamicComponent" />
    ```

-   **Lazy-loaded components**: Prefix with `Lazy`
    ```vue
    <LazyCommentSection v-if="showComments" />
    ```

### Folder Structure for Large Applications

For larger applications, consider organizing by feature/domain:

```
src/
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── UiButton.vue
│   │   └── UiCard.vue
│   └── features/          # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.vue
│       │   └── UserMenu.vue
│       └── products/
│           └── ProductCard.vue
├── composables/
│   ├── common/            # Shared composables
│   │   └── useWindowSize.js
│   └── features/          # Feature-specific composables
│       └── useAuth.js
├── stores/
│   ├── user.js
│   └── products.js
└── utils/
    ├── formatters.js
    └── validators.js
```
