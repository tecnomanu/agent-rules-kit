---
description: Best practices for Vue applications
globs: <root>/src/**/*.vue,<root>/src/**/*.js,<root>/src/**/*.ts
alwaysApply: false
---

# Vue Best Practices

This guide outlines the recommended best practices for Vue development in {projectPath}, covering Vue 3 Composition API and Options API patterns.

## Component Structure

### Composition API (Recommended)

Use the Composition API for better TypeScript support and logic reusability:

```vue
<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>
    <div v-else-if="user" class="user-details">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <button @click="updateProfile">Update Profile</button>
    </div>
    <div v-else class="error">
      User not found
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['profile-updated'])

// Composables
const userStore = useUserStore()

// Reactive state
const loading = ref(true)
const user = ref(null)

// Computed properties
const isCurrentUser = computed(() => {
  return user.value?.id === userStore.currentUser?.id
})

// Methods
const fetchUser = async () => {
  try {
    loading.value = true
    user.value = await userStore.fetchUser(props.userId)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  try {
    await userStore.updateUser(user.value.id, user.value)
    emit('profile-updated', user.value)
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
.user-profile {
  padding: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.user-details h2 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}
</style>
```

### Options API (Legacy)

When maintaining existing Options API components:

```vue
<template>
  <div class="product-list">
    <SearchInput 
      v-model="searchQuery" 
      placeholder="Search products..." 
    />
    <ProductCard
      v-for="product in filteredProducts"
      :key="product.id"
      :product="product"
      @click="$emit('product-selected', product)"
    />
  </div>
</template>

<script>
import SearchInput from '@/components/SearchInput.vue'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'ProductList',
  
  components: {
    SearchInput,
    ProductCard
  },
  
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['product-selected'],
  
  data() {
    return {
      searchQuery: ''
    }
  },
  
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products
      
      return this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  
  methods: {
    clearSearch() {
      this.searchQuery = ''
    }
  }
}
</script>
```

## Composables

### Creating Reusable Composables

```javascript
// composables/useApi.js
import { ref, reactive } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const execute = async (apiCall) => {
    try {
      loading.value = true
      error.value = null
      data.value = await apiCall()
    } catch (err) {
      error.value = err.message
      console.error('API call failed:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    execute
  }
}

// composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  const value = ref(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return value
}
```

### Using Composables

```vue
<script setup>
import { useApi } from '@/composables/useApi'
import { useLocalStorage } from '@/composables/useLocalStorage'

// Use composables
const { loading, error, data, execute } = useApi()
const userPreferences = useLocalStorage('user-preferences', {
  theme: 'light',
  language: 'en'
})

// Fetch data
const fetchUsers = () => {
  execute(() => fetch('/api/users').then(res => res.json()))
}

onMounted(fetchUsers)
</script>
```

## State Management with Pinia

### Store Definition

```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!currentUser.value)
  const userCount = computed(() => users.value.length)

  // Actions
  const fetchUsers = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/users')
      users.value = await response.json()
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      currentUser.value = await response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('auth-token')
  }

  return {
    // State
    users,
    currentUser,
    loading,
    // Getters
    isAuthenticated,
    userCount,
    // Actions
    fetchUsers,
    login,
    logout
  }
})
```

### Using Stores in Components

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// Access state and getters
const { users, currentUser, isAuthenticated } = storeToRefs(userStore)

// Access actions directly
const { fetchUsers, login, logout } = userStore

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUsers()
  }
})
</script>
```

## Component Communication

### Props and Emits

```vue
<!-- Parent Component -->
<template>
  <UserForm
    :user="selectedUser"
    :loading="formLoading"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup>
const selectedUser = ref(null)
const formLoading = ref(false)

const handleSave = async (userData) => {
  try {
    formLoading.value = true
    await saveUser(userData)
    // Handle success
  } catch (error) {
    console.error('Save failed:', error)
  } finally {
    formLoading.value = false
  }
}

const handleCancel = () => {
  selectedUser.value = null
}
</script>

<!-- Child Component -->
<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="form.name" 
      type="text" 
      placeholder="Name"
      required 
    />
    <input 
      v-model="form.email" 
      type="email" 
      placeholder="Email"
      required 
    />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Saving...' : 'Save' }}
    </button>
    <button type="button" @click="$emit('cancel')">
      Cancel
    </button>
  </form>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: props.user.name || '',
  email: props.user.email || ''
})

const handleSubmit = () => {
  emit('save', { ...form })
}
</script>
```

### Provide/Inject

```vue
<!-- Parent Component -->
<script setup>
import { provide } from 'vue'

const theme = ref('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Provide to all descendants
provide('theme', {
  theme: readonly(theme),
  toggleTheme
})
</script>

<!-- Child Component (any level deep) -->
<script setup>
import { inject } from 'vue'

const { theme, toggleTheme } = inject('theme')
</script>
```

## Performance Optimization

### Lazy Loading Components

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  }
]
```

### Component Optimization

```vue
<template>
  <div class="product-grid">
    <!-- Use v-memo for expensive list items -->
    <ProductCard
      v-for="product in products"
      :key="product.id"
      v-memo="[product.id, product.price, product.inStock]"
      :product="product"
    />
  </div>
</template>

<script setup>
// Use computed for expensive operations
const expensiveComputation = computed(() => {
  return products.value.reduce((acc, product) => {
    // Expensive calculation
    return acc + calculateComplexValue(product)
  }, 0)
})

// Use watchEffect for side effects
watchEffect(() => {
  if (selectedCategory.value) {
    analytics.track('category_viewed', {
      category: selectedCategory.value
    })
  }
})
</script>
```

## Error Handling

### Global Error Handler

```javascript
// main.js
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  // Send to error reporting service
  errorReporting.captureException(err, {
    context: info,
    component: instance?.$options.name
  })
}
```

### Component Error Handling

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err)
  error.value = err.message
  
  // Return false to prevent the error from propagating
  return false
})

// Handle async errors
const handleAsyncOperation = async () => {
  try {
    await riskyOperation()
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div>
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="error = null">Dismiss</button>
    </div>
    <slot v-else />
  </div>
</template>
```

## Testing

### Component Testing

```javascript
// UserCard.test.js
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('displays user information', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('[data-testid="user-name"]').text()).toBe('John Doe')
    expect(wrapper.find('[data-testid="user-email"]').text()).toBe('john@example.com')
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    await wrapper.find('[data-testid="edit-button"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')[0]).toEqual([mockUser])
  })
})
```

### Composable Testing

```javascript
// useCounter.test.js
import { useCounter } from '@/composables/useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('initializes with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

## Security

### Input Sanitization

```vue
<script setup>
import DOMPurify from 'dompurify'

const props = defineProps({
  htmlContent: String
})

// Sanitize HTML content
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(props.htmlContent)
})

// Validate form inputs
const form = reactive({
  email: '',
  message: ''
})

const errors = reactive({})

const validateForm = () => {
  errors.email = ''
  errors.message = ''

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Message validation
  if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long'
  }

  return !errors.email && !errors.message
}
</script>

<template>
  <div>
    <!-- Safe HTML rendering -->
    <div v-html="sanitizedContent"></div>
    
    <!-- Form with validation -->
    <form @submit.prevent="handleSubmit">
      <input 
        v-model="form.email"
        type="email"
        :class="{ error: errors.email }"
      />
      <span v-if="errors.email" class="error-text">
        {{ errors.email }}
      </span>
      
      <textarea 
        v-model="form.message"
        :class="{ error: errors.message }"
      ></textarea>
      <span v-if="errors.message" class="error-text">
        {{ errors.message }}
      </span>
    </form>
  </div>
</template>
```

## Accessibility

### Accessible Components

```vue
<template>
  <button
    :class="['btn', `btn-${variant}`, { 'btn-disabled': disabled }]"
    :disabled="disabled"
    :aria-label="ariaLabel || label"
    :aria-describedby="describedBy"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span :class="{ 'sr-only': loading }">{{ label }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'danger'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  ariaLabel: String,
  describedBy: String
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

Remember that Vue 3 with the Composition API provides better TypeScript support, improved tree-shaking, and more flexible code organization compared to the Options API.
