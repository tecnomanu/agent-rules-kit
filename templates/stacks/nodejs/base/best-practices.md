---
description: Best practices for Node.js projects
globs: <root>/src/**/*.{js,ts},<root>/**/*.js,<root>/**/*.ts
alwaysApply: true
---

# Node.js Best Practices

The following recommendations help keep Node.js applications secure and maintainable.

## Dependency Management

- Use **pnpm** or **npm** to install packages and lock dependencies with `package-lock.json` or `pnpm-lock.yaml`.
- Keep dependencies up to date and prefer Long Term Support (LTS) versions of Node.js.

## Asynchronous Programming

- Leverage `async`/`await` for readable asynchronous code.
- Avoid callback hell by returning Promises whenever possible.

## Configuration Handling

- Load environment variables from `.env` files using packages such as `dotenv`.
- Store secrets outside of the repository and access them through `process.env`.

## Error Handling

- Catch and log errors in asynchronous flows using try/catch blocks.
- Send meaningful HTTP status codes and messages when building APIs.

## Security Guidelines

- Sanitize user input to prevent injection attacks (see [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)).
- Regularly audit dependencies with `npm audit` or `pnpm audit`.

For more details, consult the [official Node.js guides](https://nodejs.org/en/docs/guides/).
