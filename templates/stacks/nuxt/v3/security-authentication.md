---
title: Nuxt 3 Security and Authentication Guide
description: Best practices for implementing security and authentication in Nuxt 3 applications
tags: [Nuxt, Security, Authentication, Authorization]
globs: ./**/*
always: true
---

# Nuxt 3 Security and Authentication Guide

## Authentication Setup

### 1. Authentication Store

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
	// State
	const token = ref<string | null>(null);
	const user = ref<User | null>(null);
	const loading = ref(false);

	// Getters
	const isAuthenticated = computed(() => !!token.value);
	const isAdmin = computed(() => user.value?.role === 'admin');

	// Actions
	async function login(credentials: LoginCredentials) {
		loading.value = true;

		try {
			const { token: authToken, user: userData } = await $fetch(
				'/api/auth/login',
				{
					method: 'POST',
					body: credentials,
				}
			);

			setSession(authToken, userData);
		} finally {
			loading.value = false;
		}
	}

	async function register(data: RegisterData) {
		loading.value = true;

		try {
			const { token: authToken, user: userData } = await $fetch(
				'/api/auth/register',
				{
					method: 'POST',
					body: data,
				}
			);

			setSession(authToken, userData);
		} finally {
			loading.value = false;
		}
	}

	function setSession(authToken: string, userData: User) {
		token.value = authToken;
		user.value = userData;

		// Store in persistent storage
		localStorage.setItem('auth:token', authToken);
		localStorage.setItem('auth:user', JSON.stringify(userData));
	}

	function clearSession() {
		token.value = null;
		user.value = null;

		localStorage.removeItem('auth:token');
		localStorage.removeItem('auth:user');
	}

	async function restoreSession() {
		const storedToken = localStorage.getItem('auth:token');
		const storedUser = localStorage.getItem('auth:user');

		if (storedToken && storedUser) {
			try {
				// Validate token
				const userData = await $fetch('/api/auth/validate', {
					headers: {
						Authorization: `Bearer ${storedToken}`,
					},
				});

				setSession(storedToken, userData);
			} catch {
				clearSession();
			}
		}
	}

	// Initialize
	restoreSession();

	return {
		token: readonly(token),
		user: readonly(user),
		loading: readonly(loading),
		isAuthenticated,
		isAdmin,
		login,
		register,
		clearSession,
	};
});
```

### 2. Route Middleware

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
	const auth = useAuthStore();

	// Check if route requires authentication
	if (to.meta.requiresAuth && !auth.isAuthenticated) {
		return navigateTo({
			path: '/login',
			query: {
				redirect: to.fullPath,
			},
		});
	}

	// Check if route requires specific role
	if (
		to.meta.requiredRole &&
		(!auth.user || auth.user.role !== to.meta.requiredRole)
	) {
		return navigateTo('/unauthorized');
	}

	// Check if route is guest-only (like login page)
	if (to.meta.guestOnly && auth.isAuthenticated) {
		return navigateTo('/');
	}
});

// app.vue
export default defineNuxtConfig({
	router: {
		middleware: ['auth'],
	},
});

// pages/admin/index.vue
definePageMeta({
	requiresAuth: true,
	requiredRole: 'admin',
});
```

## Security Best Practices

### 1. XSS Protection

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	// Enable built-in XSS protection
	security: {
		headers: {
			crossOriginEmbedderPolicy: 'require-corp',
			crossOriginOpenerPolicy: 'same-origin',
			crossOriginResourcePolicy: 'same-origin',
			contentSecurityPolicy: {
				'base-uri': ["'self'"],
				'font-src': ["'self'", 'https:', 'data:'],
				'form-action': ["'self'"],
				'frame-ancestors': ["'self'"],
				'img-src': ["'self'", 'data:', 'https:'],
				'object-src': ["'none'"],
				'script-src-attr': ["'none'"],
				'style-src': ["'self'", 'https:', "'unsafe-inline'"],
				'upgrade-insecure-requests': true,
			},
		},
	},
});

// plugins/security.ts
export default defineNuxtPlugin(() => {
	// Sanitize user input
	const sanitizeHTML = (html: string): string => {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		return doc.body.textContent || '';
	};

	// Encode output
	const encodeHTML = (str: string): string => {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	};

	return {
		provide: {
			sanitize: sanitizeHTML,
			encode: encodeHTML,
		},
	};
});
```

### 2. CSRF Protection

```typescript
// server/middleware/csrf.ts
import { H3Event } from 'h3';
import { generateToken, validateToken } from '~/utils/csrf';

export default defineEventHandler((event: H3Event) => {
	// Skip CSRF check for non-mutation methods
	if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.method)) {
		return;
	}

	const token = getCookie(event, 'csrf-token');
	const headerToken = event.headers.get('x-csrf-token');

	if (!token || !headerToken || token !== headerToken) {
		throw createError({
			statusCode: 403,
			message: 'Invalid CSRF token',
		});
	}
});

// plugins/csrf.ts
export default defineNuxtPlugin(() => {
	const token = useCookie('csrf-token');

	// Generate new token if not exists
	if (!token.value) {
		token.value = generateToken();
	}

	// Add token to all mutation requests
	const {
		public: { apiBaseUrl },
	} = useRuntimeConfig();

	$fetch.create({
		baseURL: apiBaseUrl,
		headers: {
			'x-csrf-token': token.value,
		},
	});
});
```

### 3. Rate Limiting

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis({
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
});

export default defineEventHandler((event) => {
	const limiter = rateLimit({
		store: new RedisStore({
			client: redis,
			prefix: 'rate-limit:',
		}),
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per windowMs
		message: {
			error: 'Too many requests, please try again later.',
		},
	});

	return new Promise((resolve, reject) => {
		limiter(event.node.req, event.node.res, (err: any) => {
			if (err) reject(err);
			resolve(undefined);
		});
	});
});
```

## Authorization

### 1. Role-Based Access Control (RBAC)

```typescript
// utils/rbac.ts
export interface Role {
  name: string
  permissions: string[]
}

export const roles: Record<string, Role> = {
  admin: {
    name: 'Administrator',
    permissions: ['*'] // Wildcard for all permissions
  },
  manager: {
    name: 'Manager',
    permissions: [
      'users:read',
      'users:write',
      'products:read',
      'products:write'
    ]
  },
  user: {
    name: 'User',
    permissions: [
      'products:read',
      'orders:read',
      'orders:write'
    ]
  }
}

// composables/useAuthorization.ts
export function useAuthorization() {
  const auth = useAuthStore()

  function hasPermission(permission: string): boolean {
    if (!auth.user) return false

    const userRole = roles[auth.user.role]
    if (!userRole) return false

    return (
      userRole.permissions.includes('*') ||
      userRole.permissions.includes(permission)
    )
  }

  function requirePermission(permission: string) {
    if (!hasPermission(permission)) {
      throw createError({
        statusCode: 403,
        message: 'Unauthorized'
      })
    }
  }

  return {
    hasPermission,
    requirePermission
  }
}

// components/PermissionGuard.vue
const PermissionGuard = defineComponent({
  props: {
    permission: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    const { hasPermission } = useAuthorization()

    return () =>
      hasPermission(props.permission)
        ? slots.default?.()
        : slots.fallback?.()
  }
})

// Usage in components
<template>
  <PermissionGuard permission="products:write">
    <button @click="createProduct">
      Create Product
    </button>

    <template #fallback>
      <p>You don't have permission to create products</p>
    </template>
  </PermissionGuard>
</template>
```

### 2. API Authorization

```typescript
// server/middleware/authorize.ts
export default defineEventHandler((event) => {
	const auth = event.context.auth;
	const route = event.path;
	const method = event.method;

	// Map routes to required permissions
	const permissionMap: Record<string, string> = {
		'GET /api/products': 'products:read',
		'POST /api/products': 'products:write',
		'GET /api/users': 'users:read',
		'POST /api/users': 'users:write',
	};

	const requiredPermission = permissionMap[`${method} ${route}`];
	if (requiredPermission) {
		const userRole = roles[auth.user.role];

		if (
			!userRole ||
			(!userRole.permissions.includes('*') &&
				!userRole.permissions.includes(requiredPermission))
		) {
			throw createError({
				statusCode: 403,
				message: 'Unauthorized',
			});
		}
	}
});
```

## Security Features

### 1. Password Reset Flow

```typescript
// server/api/auth/reset-password.post.ts
export default defineEventHandler(async (event) => {
	const { email } = await readBody(event);

	// Generate unique token
	const token = generateResetToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

	// Store token in database
	await prisma.passwordReset.create({
		data: {
			email,
			token,
			expiresAt,
		},
	});

	// Send email with reset link
	await sendEmail({
		to: email,
		subject: 'Password Reset',
		template: 'password-reset',
		context: {
			resetLink: `${config.appUrl}/reset-password?token=${token}`,
		},
	});

	return {
		message: 'Password reset instructions sent',
	};
});

// server/api/auth/reset-password/[token].post.ts
export default defineEventHandler(async (event) => {
	const { password } = await readBody(event);
	const { token } = event.context.params;

	// Verify token
	const reset = await prisma.passwordReset.findUnique({
		where: { token },
	});

	if (!reset || reset.expiresAt < new Date()) {
		throw createError({
			statusCode: 400,
			message: 'Invalid or expired reset token',
		});
	}

	// Update password
	const hashedPassword = await hash(password);
	await prisma.user.update({
		where: { email: reset.email },
		data: { password: hashedPassword },
	});

	// Delete used token
	await prisma.passwordReset.delete({
		where: { token },
	});

	return {
		message: 'Password updated successfully',
	};
});
```

### 2. Two-Factor Authentication

```typescript
// composables/use2FA.ts
export function use2FA() {
	const auth = useAuthStore();

	async function setup2FA() {
		// Generate secret
		const { secret, qrCode } = await $fetch('/api/auth/2fa/setup');

		return {
			secret,
			qrCode,
		};
	}

	async function verify2FA(token: string) {
		const { verified } = await $fetch('/api/auth/2fa/verify', {
			method: 'POST',
			body: { token },
		});

		return verified;
	}

	async function disable2FA(token: string) {
		await $fetch('/api/auth/2fa/disable', {
			method: 'POST',
			body: { token },
		});
	}

	return {
		setup2FA,
		verify2FA,
		disable2FA,
	};
}

// server/api/auth/2fa/setup.ts
import { generateSecret, generateQRCode } from '~/utils/2fa';

export default defineEventHandler(async (event) => {
	const auth = event.context.auth;

	// Generate new secret
	const secret = generateSecret();

	// Generate QR code
	const qrCode = await generateQRCode({
		secret,
		account: auth.user.email,
		issuer: 'Your App',
	});

	// Store secret (encrypted)
	await prisma.user.update({
		where: { id: auth.user.id },
		data: {
			twoFactorSecret: encrypt(secret),
			twoFactorEnabled: false,
		},
	});

	return {
		secret,
		qrCode,
	};
});

// server/api/auth/2fa/verify.post.ts
import { verifyToken } from '~/utils/2fa';

export default defineEventHandler(async (event) => {
	const { token } = await readBody(event);
	const auth = event.context.auth;

	const user = await prisma.user.findUnique({
		where: { id: auth.user.id },
	});

	const secret = decrypt(user.twoFactorSecret);
	const verified = verifyToken(secret, token);

	if (verified) {
		await prisma.user.update({
			where: { id: auth.user.id },
			data: { twoFactorEnabled: true },
		});
	}

	return { verified };
});
```

### 3. Session Management

```typescript
// composables/useSession.ts
export function useSession() {
	const auth = useAuthStore();

	async function listSessions() {
		return await $fetch('/api/auth/sessions');
	}

	async function revokeSession(sessionId: string) {
		await $fetch(`/api/auth/sessions/${sessionId}`, {
			method: 'DELETE',
		});
	}

	async function revokeAllOtherSessions() {
		await $fetch('/api/auth/sessions/revoke-all', {
			method: 'POST',
		});
	}

	return {
		listSessions,
		revokeSession,
		revokeAllOtherSessions,
	};
}

// server/api/auth/sessions/index.get.ts
export default defineEventHandler(async (event) => {
	const auth = event.context.auth;

	const sessions = await prisma.session.findMany({
		where: { userId: auth.user.id },
		select: {
			id: true,
			userAgent: true,
			ipAddress: true,
			lastActivity: true,
			createdAt: true,
		},
	});

	return sessions;
});

// server/api/auth/sessions/revoke-all.post.ts
export default defineEventHandler(async (event) => {
	const auth = event.context.auth;

	await prisma.session.deleteMany({
		where: {
			userId: auth.user.id,
			id: { not: auth.sessionId },
		},
	});

	return {
		message: 'All other sessions revoked',
	};
});
```
