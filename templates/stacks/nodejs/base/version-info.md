---
description: Version information for Node.js applications
globs: <root>/package.json
alwaysApply: true
---

# Node.js Version Information

This project is using Node.js **{detectedVersion}**. This guide covers version-specific features and best practices for Node.js development in {projectPath}.

## Supported Node.js Versions

### Current LTS Versions

-   **Node.js 18.x** (LTS until April 2025)

    -   ES2022 support
    -   Fetch API built-in
    -   Web Streams API
    -   Test runner (experimental)

-   **Node.js 20.x** (LTS until April 2026)

    -   ES2023 support
    -   Stable Test runner
    -   Permission Model
    -   Single Executable Applications

-   **Node.js 22.x** (Current, LTS from October 2024)
    -   ES2024 support
    -   V8 12.x engine
    -   Enhanced performance
    -   Improved diagnostics

## Version Detection

Use these commands to check your Node.js version:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check available versions
nvm list available  # Windows
nvm ls-remote       # macOS/Linux
```

## Version-Specific Features

### Node.js 18+ Features

```javascript
// Built-in Fetch API (no need for node-fetch)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Web Streams API
import { ReadableStream } from 'node:stream/web';

// Built-in test runner
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Math operations', () => {
	test('addition', () => {
		assert.strictEqual(2 + 2, 4);
	});
});
```

### Node.js 20+ Features

```javascript
// Stable test runner with coverage
import { test, mock } from 'node:test';

// Permission Model
process.permission.has('fs.read', '/path/to/file');

// Single Executable Applications
// Build with: node --experimental-sea-config sea-config.json
```

## Package.json Configuration

### Engine Specification

```json
{
	"engines": {
		"node": ">=18.0.0",
		"npm": ">=8.0.0"
	}
}
```

### Version-Specific Scripts

```json
{
	"scripts": {
		"test": "node --test",
		"test:watch": "node --test --watch",
		"test:coverage": "node --test --experimental-test-coverage",
		"start": "node --env-file=.env server.js",
		"dev": "node --watch server.js"
	}
}
```

## Environment Management

### Using .nvmrc

```bash
# .nvmrc
20.10.0
```

```bash
# Use the version specified in .nvmrc
nvm use

# Install and use
nvm install
```

### Docker Configuration

```dockerfile
# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

## Version Migration Guide

### Upgrading from Node.js 16 to 18+

1. **Update package.json engines**
2. **Replace node-fetch with built-in fetch**
3. **Update test scripts to use built-in test runner**
4. **Review deprecated APIs**

### Upgrading from Node.js 18 to 20+

1. **Enable stable test runner**
2. **Review permission model if needed**
3. **Update CI/CD to Node.js 20**
4. **Test performance improvements**

## Performance Considerations

### Node.js 20+ Optimizations

-   **V8 Engine**: Improved JavaScript execution
-   **Memory Usage**: Better garbage collection
-   **Startup Time**: Faster application initialization
-   **HTTP Performance**: Enhanced HTTP/2 and HTTP/3 support

## Security Updates

Always use the latest LTS version for security patches:

```bash
# Check for security vulnerabilities
npm audit

# Update to latest LTS
nvm install --lts
nvm use --lts
```

## Compatibility Matrix

| Feature           | Node 18 | Node 20 | Node 22 |
| ----------------- | ------- | ------- | ------- |
| Fetch API         | ✅      | ✅      | ✅      |
| Test Runner       | 🧪      | ✅      | ✅      |
| Web Streams       | ✅      | ✅      | ✅      |
| Permission Model  | ❌      | ✅      | ✅      |
| Single Executable | ❌      | 🧪      | ✅      |

Use `node --version` to verify your runtime version and refer to the [Node.js release schedule](https://nodejs.org/en/about/releases) for maintenance dates.
