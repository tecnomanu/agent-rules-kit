---
description: Architecture concepts for Node.js applications
globs: <root>/src/**/*.{js,ts},<root>/**/*.js,<root>/**/*.ts
alwaysApply: false
---

# Node.js Architecture Concepts

Node.js is built on the V8 JavaScript engine and relies on an event-driven, non-blocking I/O model. The runtime executes JavaScript in a single process while using the **libuv** library to delegate operations such as file and network access to the system. This design allows highly concurrent applications without managing multiple threads.

## Typical Project Structure

A common folder layout separates concerns by layers:

```text
src/
├── controllers/   # HTTP or RPC handlers
├── services/      # Business logic
├── repositories/  # Database access
├── lib/           # Reusable modules
└── index.js       # Application entry point
```

Environment-specific configuration is usually loaded from `.env` files using `process.env`. Prefer dependency injection for testability and use environment variables to switch between development and production settings.

## Modules

Node.js supports both **CommonJS** (`require`) and **ECMAScript modules** (`import`). Choose one style consistently across the project. ECMAScript modules are recommended for new code as they align with modern JavaScript standards.

## Concurrency and Scaling

Each Node.js process handles work via the event loop. For CPU-bound tasks or higher throughput, spawn multiple processes using the **cluster** module or an external process manager such as PM2. Horizontal scaling is typically achieved by running multiple instances behind a load balancer.

For more details, see the official [Node.js documentation](https://nodejs.org/en/docs/).
