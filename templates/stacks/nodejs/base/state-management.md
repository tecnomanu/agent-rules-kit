---
description: State management concepts and approaches in Node.js applications
globs: <root>/**/*.{js,ts}
alwaysApply: true
---

# State Management in Node.js Applications

This document outlines common conceptual approaches to state management in Node.js applications in {projectPath}. Node.js applications have unique state management considerations due to their server-side nature and event-driven architecture.

## Node.js State Management Concepts

### 1. Application State vs Request State

-   **Application State**: Global state that persists across requests (database connections, configuration, caches).
-   **Request State**: State specific to individual HTTP requests (user data, request context, temporary data).
-   **Process State**: State that exists for the lifetime of the Node.js process.
-   **Shared State**: State shared between multiple processes or instances.

### 2. Memory Management

-   **Heap Memory**: JavaScript objects and variables stored in V8 heap.
-   **Memory Leaks**: Prevent memory leaks from accumulating state.
-   **Garbage Collection**: Understand V8 garbage collection impact on state.
-   **Memory Monitoring**: Monitor memory usage in production applications.

## In-Memory State Management

### 1. Global Variables

-   **Concept**: Store state in global JavaScript variables.
-   **Use Cases**: Configuration, application-wide settings, singletons.
-   **Pros**: Simple, fast access, no external dependencies.
-   **Cons**: Not scalable, lost on process restart, memory leaks risk.

```javascript
// Global application state
global.appConfig = {
	version: '1.0.0',
	environment: process.env.NODE_ENV || 'development',
};

// Module-level state
let connectionPool = null;
let userSessions = new Map();

function getConnectionPool() {
	if (!connectionPool) {
		connectionPool = createConnectionPool();
	}
	return connectionPool;
}
```

### 2. Module-Level State

-   **Concept**: State encapsulated within Node.js modules.
-   **Singleton Pattern**: Modules are cached, creating natural singletons.
-   **Encapsulation**: Private state within module scope.
-   **Use Cases**: Service instances, configuration objects, caches.

```javascript
// userService.js
class UserService {
	constructor() {
		this.cache = new Map();
		this.connections = [];
	}

	async getUser(id) {
		if (this.cache.has(id)) {
			return this.cache.get(id);
		}

		const user = await this.fetchUser(id);
		this.cache.set(id, user);
		return user;
	}
}

// Export singleton instance
module.exports = new UserService();
```

### 3. Class-Based State

-   **Concept**: Encapsulate state within class instances.
-   **Object-Oriented**: Use classes for stateful services and components.
-   **Instance Management**: Manage class instances lifecycle.
-   **Dependency Injection**: Inject dependencies for better testability.

## External State Storage

### 1. Database State

-   **Relational Databases**: PostgreSQL, MySQL, SQLite for structured data.
-   **NoSQL Databases**: MongoDB, CouchDB for document-based state.
-   **Key-Value Stores**: DynamoDB, LevelDB for simple key-value state.
-   **Graph Databases**: Neo4j for relationship-heavy state.

```javascript
// Database state management
class UserRepository {
	constructor(database) {
		this.db = database;
	}

	async createUser(userData) {
		const result = await this.db.query(
			'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
			[userData.name, userData.email]
		);
		return result.rows[0];
	}

	async getUserById(id) {
		const result = await this.db.query(
			'SELECT * FROM users WHERE id = $1',
			[id]
		);
		return result.rows[0];
	}
}
```

### 2. Cache-Based State

-   **Redis**: Distributed caching and state storage.
-   **Memcached**: High-performance distributed memory caching.
-   **In-Memory Caches**: Node-cache, memory-cache for local caching.
-   **CDN Caching**: Edge caching for geographically distributed state.

```javascript
// Redis state management
const redis = require('redis');
const client = redis.createClient();

class CacheService {
	async set(key, value, expiration = 3600) {
		await client.setex(key, expiration, JSON.stringify(value));
	}

	async get(key) {
		const value = await client.get(key);
		return value ? JSON.parse(value) : null;
	}

	async del(key) {
		await client.del(key);
	}
}
```

### 3. File System State

-   **JSON Files**: Simple configuration and state files.
-   **Database Files**: SQLite, LevelDB for embedded databases.
-   **Log Files**: Append-only logs for state changes.
-   **Temporary Files**: Temporary state storage.

## Session Management

### 1. HTTP Sessions

-   **Express Sessions**: Use express-session middleware.
-   **Session Stores**: Memory, Redis, MongoDB session storage.
-   **Cookie Management**: Secure cookie configuration.
-   **Session Security**: CSRF protection, secure session handling.

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
		},
	})
);
```

### 2. JWT Token State

-   **Stateless Sessions**: Use JWT tokens for stateless authentication.
-   **Token Storage**: Store tokens in HTTP-only cookies or headers.
-   **Refresh Tokens**: Implement token refresh mechanisms.
-   **Token Validation**: Validate and decode JWT tokens.

### 3. WebSocket Sessions

-   **Persistent Connections**: Maintain state for WebSocket connections.
-   **Connection Management**: Track active connections and user sessions.
-   **Real-time State**: Synchronize state across WebSocket connections.

## Event-Driven State Management

### 1. EventEmitter Pattern

-   **Node.js Events**: Use built-in EventEmitter for state changes.
-   **Decoupled Architecture**: Loose coupling between state producers and consumers.
-   **Async Handling**: Handle asynchronous state changes with events.

```javascript
const EventEmitter = require('events');

class UserStateManager extends EventEmitter {
	constructor() {
		super();
		this.users = new Map();
	}

	addUser(user) {
		this.users.set(user.id, user);
		this.emit('userAdded', user);
	}

	updateUser(id, updates) {
		const user = this.users.get(id);
		if (user) {
			const updatedUser = { ...user, ...updates };
			this.users.set(id, updatedUser);
			this.emit('userUpdated', updatedUser);
		}
	}
}

const userManager = new UserStateManager();

userManager.on('userAdded', (user) => {
	console.log('New user added:', user.name);
});
```

### 2. Message Queues

-   **RabbitMQ**: Message broker for distributed state management.
-   **Apache Kafka**: Event streaming platform for state events.
-   **Redis Pub/Sub**: Simple publish-subscribe messaging.
-   **AWS SQS**: Cloud-based message queuing.

### 3. Event Sourcing

-   **Concept**: Store state changes as a sequence of events.
-   **Event Store**: Database optimized for event storage.
-   **State Reconstruction**: Rebuild current state from events.
-   **Audit Trail**: Complete history of state changes.

## Clustering and Multi-Process State

### 1. Cluster Module

-   **Process Clustering**: Use Node.js cluster module for multi-process apps.
-   **Shared State**: Share state between cluster workers.
-   **IPC Communication**: Inter-process communication for state sync.

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
	// Shared state in master process
	const sharedState = new Map();

	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('message', (worker, message) => {
		if (message.type === 'setState') {
			sharedState.set(message.key, message.value);
		}
	});
} else {
	// Worker processes
	process.send({
		type: 'setState',
		key: 'workerId',
		value: process.pid,
	});
}
```

### 2. External State Stores

-   **Redis Cluster**: Distributed Redis for shared state.
-   **Database Clustering**: Database clusters for scalable state storage.
-   **Distributed Caches**: Shared caches across multiple processes.

### 3. Microservices State

-   **Service Boundaries**: Define clear state boundaries between services.
-   **State Synchronization**: Sync state between microservices.
-   **Eventual Consistency**: Handle eventual consistency in distributed systems.

## Performance Optimization

### 1. State Caching Strategies

-   **LRU Caches**: Least Recently Used cache eviction.
-   **TTL Caches**: Time-to-live based cache expiration.
-   **Write-Through**: Update cache and storage simultaneously.
-   **Write-Behind**: Update cache immediately, storage asynchronously.

### 2. Connection Pooling

-   **Database Pools**: Reuse database connections for better performance.
-   **HTTP Connection Pools**: Reuse HTTP connections for external APIs.
-   **Resource Management**: Properly manage and close connections.

### 3. Memory Optimization

-   **Object Pooling**: Reuse objects to reduce garbage collection.
-   **Lazy Loading**: Load state only when needed.
-   **Memory Monitoring**: Monitor and optimize memory usage.

## Best Practices

### Development Patterns

-   **Separation of Concerns**: Separate state logic from business logic.
-   **Dependency Injection**: Use DI containers for better testability.
-   **Error Handling**: Implement proper error handling for state operations.
-   **Logging**: Log state changes for debugging and monitoring.

### Security Considerations

-   **Input Validation**: Validate all state inputs.
-   **Access Control**: Implement proper access controls for state.
-   **Encryption**: Encrypt sensitive state data.
-   **Audit Logging**: Log access to sensitive state.

### Scalability

-   **Horizontal Scaling**: Design state for horizontal scaling.
-   **State Partitioning**: Partition large state across multiple stores.
-   **Load Balancing**: Balance state access across multiple instances.
-   **Caching Strategies**: Implement effective caching for frequently accessed state.

## Recommendations

### For Small Applications

-   Use **in-memory state** for simple applications
-   Use **SQLite** or **JSON files** for persistent state
-   Keep state management simple and straightforward
-   Use **module-level state** for singletons

### For Medium Applications

-   Use **Redis** for caching and session storage
-   Use **PostgreSQL** or **MongoDB** for persistent state
-   Implement **proper error handling** and logging
-   Use **class-based state** for better organization

### For Large Applications

-   Use **distributed state stores** (Redis Cluster, database clusters)
-   Implement **event-driven architecture** for state changes
-   Use **microservices** with clear state boundaries
-   Implement **comprehensive monitoring** and alerting

### For High-Performance Applications

-   Use **connection pooling** for all external resources
-   Implement **advanced caching strategies**
-   Use **clustering** for better CPU utilization
-   Optimize **memory usage** and garbage collection

Remember that Node.js state management should align with your application's architecture, scalability requirements, and operational constraints while leveraging Node.js's event-driven and asynchronous nature.
