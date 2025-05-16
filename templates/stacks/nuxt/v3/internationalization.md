---
title: Nuxt 3 Internationalization Guide
description: Best practices for implementing internationalization (i18n) in Nuxt 3 applications
tags: [Nuxt, i18n, Internationalization, Localization]
globs: ./**/*
always: true
---

# Nuxt 3 Internationalization Guide

## Basic Setup

### 1. Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        file: 'es.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})

// locales/en.json
{
  "welcome": "Welcome to {site}",
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "errors": {
    "required": "{field} is required",
    "email": "Please enter a valid email address"
  }
}

// locales/es.json
{
  "welcome": "Bienvenido a {site}",
  "nav": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto"
  },
  "errors": {
    "required": "{field} es obligatorio",
    "email": "Por favor ingrese un correo electrónico válido"
  }
}
```

### 2. Basic Usage

```typescript
// components/LocalizedNavigation.vue
<template>
  <nav>
    <ul>
      <li>
        <NuxtLink :to="localePath('/')">
          {{ $t('nav.home') }}
        </NuxtLink>
      </li>
      <li>
        <NuxtLink :to="localePath('/about')">
          {{ $t('nav.about') }}
        </NuxtLink>
      </li>
      <li>
        <NuxtLink :to="localePath('/contact')">
          {{ $t('nav.contact') }}
        </NuxtLink>
      </li>
    </ul>

    <LanguageSwitcher />
  </nav>
</template>

// components/LanguageSwitcher.vue
<template>
  <div class="language-switcher">
    <select v-model="$i18n.locale">
      <option
        v-for="locale in $i18n.locales"
        :key="locale.code"
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
watch(
  () => $i18n.locale,
  (newLocale) => {
    navigateTo(switchLocalePath(newLocale))
  }
)
</script>
```

## Advanced Features

### 1. Dynamic Translation Loading

```typescript
// composables/useLocalizedContent.ts
export const useLocalizedContent = () => {
	const { locale } = useI18n();
	const loadedNamespaces = ref(new Set<string>());

	async function loadNamespace(namespace: string) {
		if (loadedNamespaces.value.has(namespace)) return;

		const messages = await import(
			`~/locales/${locale.value}/${namespace}.json`
		);

		extendMessages(locale.value, namespace, messages.default);
		loadedNamespaces.value.add(namespace);
	}

	async function preloadNamespaces(namespaces: string[]) {
		await Promise.all(
			namespaces.map((namespace) => loadNamespace(namespace))
		);
	}

	return {
		loadNamespace,
		preloadNamespaces,
	};
};

// Usage in a component
const { loadNamespace } = useLocalizedContent();

// Load product-specific translations
onBeforeMount(async () => {
	await loadNamespace('products');
});
```

### 2. Date and Number Formatting

```typescript
// plugins/i18n-formats.ts
export default defineNuxtPlugin(() => {
  const i18n = useI18n()

  const dateTimeFormats = {
    'en': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    },
    'es': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    }
  }

  const numberFormats = {
    'en': {
      currency: {
        style: 'currency',
        currency: 'USD'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2
      }
    },
    'es': {
      currency: {
        style: 'currency',
        currency: 'EUR'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2
      }
    }
  }

  i18n.setDateTimeFormat('en', dateTimeFormats.en)
  i18n.setDateTimeFormat('es', dateTimeFormats.es)
  i18n.setNumberFormat('en', numberFormats.en)
  i18n.setNumberFormat('es', numberFormats.es)
})

// Usage in components
<template>
  <div>
    <p>{{ $d(date, 'long') }}</p>
    <p>{{ $n(price, 'currency') }}</p>
  </div>
</template>
```

## SEO and Meta Tags

### 1. Localized Meta Tags

```typescript
// composables/useLocalizedMeta.ts
export const useLocalizedMeta = (options: {
	title: LocaleMessages;
	description: LocaleMessages;
	image?: string;
	type?: string;
}) => {
	const { locale, t } = useI18n();
	const route = useRoute();

	useHead({
		title: computed(() => t(options.title)),
		meta: [
			{
				name: 'description',
				content: computed(() => t(options.description)),
			},
			// hreflang tags for each locale
			...useI18n().locales.value.map((loc) => ({
				property: 'og:locale:alternate',
				content: loc.iso,
				hid: `og:locale:alternate:${loc.code}`,
			})),
		],
		link: [
			// Add alternate links for each locale
			...useI18n().locales.value.map((loc) => ({
				rel: 'alternate',
				hreflang: loc.iso,
				href: `${useRuntimeConfig().public.siteUrl}${
					loc.code === useI18n().defaultLocale.value
						? ''
						: '/' + loc.code
				}${route.path}`,
			})),
		],
	});
};

// Usage in a page
useLocalizedMeta({
	title: 'pages.home.title',
	description: 'pages.home.description',
});
```

### 2. Localized Routes

```typescript
// composables/useLocalizedRoutes.ts
export const useLocalizedRoutes = () => {
	const { locale, locales } = useI18n();
	const route = useRoute();

	const localizedRoutes = computed(() =>
		locales.value.map((loc) => ({
			locale: loc,
			path: switchLocalePath(loc.code),
			current: loc.code === locale.value,
		}))
	);

	const canonicalRoute = computed(
		() => localizedRoutes.value.find((r) => r.current)?.path || route.path
	);

	return {
		localizedRoutes,
		canonicalRoute,
	};
};

// Usage in layout
const { localizedRoutes, canonicalRoute } = useLocalizedRoutes();

useHead({
	link: [
		{
			rel: 'canonical',
			href: `${useRuntimeConfig().public.siteUrl}${canonicalRoute.value}`,
		},
	],
});
```

## Content Management

### 1. Markdown Content

```typescript
// content/en/blog/hello.md
---
title: Hello World
description: My first blog post
---

# Hello World

This is my first blog post in English.

// content/es/blog/hello.md
---
title: Hola Mundo
description: Mi primer post del blog
---

# Hola Mundo

Este es mi primer post del blog en español.

// pages/blog/[...slug].vue
<template>
  <article>
    <ContentDoc v-slot="{ doc }">
      <h1>{{ doc.title }}</h1>
      <ContentRenderer :value="doc" />
    </ContentDoc>
  </article>
</template>

<script setup lang="ts">
const { locale } = useI18n()

// Load localized content based on current locale
const { data } = await useAsyncData(
  `content-${route.params.slug}`,
  () => queryContent(locale.value, 'blog', route.params.slug)
    .findOne()
)
</script>
```

### 2. Dynamic Content

```typescript
// composables/useLocalizedContent.ts
export const useLocalizedContent = () => {
	const { locale } = useI18n();
	const content = ref<any>(null);
	const loading = ref(false);

	async function fetchContent(path: string) {
		loading.value = true;
		try {
			content.value = await $fetch(`/api/content/${locale.value}${path}`);
		} catch (error) {
			console.error('Failed to fetch content:', error);
		} finally {
			loading.value = false;
		}
	}

	watch(locale, () => {
		if (content.value) {
			fetchContent(route.path);
		}
	});

	return {
		content: readonly(content),
		loading: readonly(loading),
		fetchContent,
	};
};

// server/api/content/[locale]/[...path].ts
export default defineEventHandler(async (event) => {
	const { locale, path } = event.context.params;

	// Fetch content from CMS or database
	const content = await getLocalizedContent(locale, path);

	if (!content) {
		throw createError({
			statusCode: 404,
			message: `Content not found for ${locale}/${path}`,
		});
	}

	return content;
});
```

## Validation and Forms

### 1. Localized Form Validation

```typescript
// composables/useLocalizedValidation.ts
export const useLocalizedValidation = () => {
  const { t } = useI18n()

  const rules = {
    required: (field: string) =>
      (value: any) => !!value || t('errors.required', { field: t(field) }),

    email: () =>
      (value: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !value || pattern.test(value) || t('errors.email')
      },

    minLength: (field: string, min: number) =>
      (value: string) =>
        !value || value.length >= min ||
        t('errors.minLength', { field: t(field), min })
  }

  return {
    rules
  }
}

// components/LocalizedForm.vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>{{ $t('form.email') }}</label>
      <input
        v-model="form.email"
        type="email"
        :placeholder="$t('form.emailPlaceholder')"
        @blur="validateField('email')"
      />
      <span class="error" v-if="errors.email">
        {{ errors.email }}
      </span>
    </div>

    <div class="form-group">
      <label>{{ $t('form.password') }}</label>
      <input
        v-model="form.password"
        type="password"
        :placeholder="$t('form.passwordPlaceholder')"
        @blur="validateField('password')"
      />
      <span class="error" v-if="errors.password">
        {{ errors.password }}
      </span>
    </div>

    <button type="submit" :disabled="!isValid">
      {{ $t('form.submit') }}
    </button>
  </form>
</template>

<script setup lang="ts">
const { rules } = useLocalizedValidation()
const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

function validateField(field: keyof typeof form) {
  const value = form[field]

  switch (field) {
    case 'email':
      errors.email = rules.required('form.email')(value) ||
                    rules.email()(value)
      break
    case 'password':
      errors.password = rules.required('form.password')(value) ||
                       rules.minLength('form.password', 8)(value)
      break
  }
}
</script>
```

## Performance Optimization

### 1. Translation Loading Strategy

```typescript
// plugins/i18n-loader.ts
export default defineNuxtPlugin(async (nuxtApp) => {
	const { locale, defaultLocale } = useI18n();

	// Load only critical translations for initial render
	const loadCriticalTranslations = async (loc: string) => {
		const critical = await import(`~/locales/${loc}/critical.json`);
		extendMessages(loc, 'critical', critical.default);
	};

	// Preload translations for default locale
	await loadCriticalTranslations(defaultLocale.value);

	// Load other translations in background
	if (locale.value !== defaultLocale.value) {
		loadCriticalTranslations(locale.value);
	}

	// Prefetch translations for likely locales
	const prefetchLikelyLocales = () => {
		const browserLocale = navigator.language.split('-')[0];
		const likelyLocales = [browserLocale];

		likelyLocales.forEach((loc) => {
			if (loc !== locale.value && loc !== defaultLocale.value) {
				import(`~/locales/${loc}/critical.json`);
			}
		});
	};

	if (process.client) {
		window.requestIdleCallback(prefetchLikelyLocales);
	}
});
```

### 2. Cached Translations

```typescript
// composables/useCachedTranslations.ts
export const useCachedTranslations = () => {
	const cache = new Map<string, any>();

	async function getTranslations(locale: string, namespace: string) {
		const key = `${locale}:${namespace}`;

		if (cache.has(key)) {
			return cache.get(key);
		}

		const translations = await import(
			`~/locales/${locale}/${namespace}.json`
		);

		cache.set(key, translations.default);
		return translations.default;
	}

	function clearCache() {
		cache.clear();
	}

	return {
		getTranslations,
		clearCache,
	};
};

// Usage in component
const { getTranslations } = useCachedTranslations();

onMounted(async () => {
	const productTranslations = await getTranslations(locale.value, 'products');
	// Use translations...
});
```
