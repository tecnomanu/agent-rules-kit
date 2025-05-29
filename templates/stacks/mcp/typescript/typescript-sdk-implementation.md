---
globs:
    [
        '<root>/**/*.ts',
        '<root>/**/*.js',
        '<root>/package.json',
        '<root>/tsconfig.json',
    ]
alwaysApply: false
---

# MCP TypeScript SDK Implementation Guide

## TypeScript SDK Features

The TypeScript SDK provides full type safety and modern JavaScript patterns for building MCP servers and clients with excellent developer experience.

### Installation and Setup

```json
// package.json
{
	"name": "my-mcp-server",
	"version": "1.0.0",
	"type": "module",
	"main": "dist/index.js",
	"scripts": {
		"build": "tsc",
		"start": "node dist/index.js",
		"dev": "tsx watch src/index.ts",
		"test": "vitest"
	},
	"dependencies": {
		"@modelcontextprotocol/sdk": "^1.0.0"
	},
	"devDependencies": {
		"@types/node": "^20.0.0",
		"typescript": "^5.0.0",
		"tsx": "^4.0.0",
		"vitest": "^1.0.0"
	}
}
```

```json
// tsconfig.json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"outDir": "./dist",
		"rootDir": "./src",
		"declaration": true,
		"declarationMap": true,
		"sourceMap": true
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"]
}
```

### Basic Server Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Define types for better type safety
interface EchoToolArgs {
	message: string;
}

interface QueryToolArgs {
	query: string;
	limit?: number;
}

// Create server instance
const server = new Server(
	{
		name: 'my-mcp-server',
		version: '1.0.0',
	},
	{
		capabilities: {
			resources: { subscribe: true, listChanged: true },
			tools: { listChanged: true },
		},
	}
);

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: [
			{
				uri: 'file://example.txt',
				name: 'Example File',
				description: 'An example text file',
				mimeType: 'text/plain',
			},
		],
	};
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	const { uri } = request.params;

	if (uri === 'file://example.txt') {
		return {
			contents: [
				{
					uri,
					mimeType: 'text/plain',
					text: 'This is example content from TypeScript MCP server',
				},
			],
		};
	}

	throw new Error(`Resource not found: ${uri}`);
});

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'echo',
				description: 'Echo back the input message',
				inputSchema: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							description: 'Message to echo back',
						},
					},
					required: ['message'],
				},
			},
			{
				name: 'query',
				description: 'Execute a database query',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'SQL query to execute',
						},
						limit: {
							type: 'number',
							description: 'Maximum number of results',
							default: 100,
						},
					},
					required: ['query'],
				},
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	switch (name) {
		case 'echo': {
			const { message } = args as EchoToolArgs;
			return {
				content: [
					{
						type: 'text',
						text: `Echo: ${message}`,
					},
				],
			};
		}

		case 'query': {
			const { query, limit = 100 } = args as QueryToolArgs;

			// Simulate database query
			const results = await simulateDbQuery(query, limit);

			return {
				content: [
					{
						type: 'text',
						text: `Query executed: ${query}\nResults: ${JSON.stringify(
							results,
							null,
							2
						)}`,
					},
				],
			};
		}

		default:
			throw new Error(`Unknown tool: ${name}`);
	}
});

// Utility functions
async function simulateDbQuery(query: string, limit: number) {
	// Simulate async database operation
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		query,
		rowCount: Math.floor(Math.random() * limit),
		executionTime: Math.random() * 100,
	};
}

// Main function
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('MCP server running on stdio');
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('Server error:', error);
		process.exit(1);
	});
}
```

### Advanced Server Features

#### Type-Safe Resource Management

```typescript
// Define resource types
interface FileResource {
	type: 'file';
	path: string;
	content?: string;
}

interface DatabaseResource {
	type: 'database';
	table: string;
	schema?: object;
}

type ResourceData = FileResource | DatabaseResource;

class TypedResourceManager {
	private resources = new Map<string, ResourceData>();

	registerResource(uri: string, data: ResourceData): void {
		this.resources.set(uri, data);
	}

	async getResource(uri: string): Promise<ResourceData | undefined> {
		return this.resources.get(uri);
	}

	async readFileResource(resource: FileResource): Promise<string> {
		if (resource.content) {
			return resource.content;
		}

		// Read from filesystem
		const fs = await import('fs/promises');
		return await fs.readFile(resource.path, 'utf-8');
	}

	async queryDatabaseResource(
		resource: DatabaseResource,
		query: string
	): Promise<any[]> {
		// Execute database query
		return [];
	}
}

const resourceManager = new TypedResourceManager();

// Register resources
resourceManager.registerResource('file://config.json', {
	type: 'file',
	path: './config.json',
});

resourceManager.registerResource('db://users', {
	type: 'database',
	table: 'users',
});
```

#### Middleware Pattern

```typescript
type MiddlewareFunction = (
	request: any,
	next: () => Promise<any>
) => Promise<any>;

class MiddlewareManager {
	private middlewares: MiddlewareFunction[] = [];

	use(middleware: MiddlewareFunction): void {
		this.middlewares.push(middleware);
	}

	async execute(request: any, handler: () => Promise<any>): Promise<any> {
		let index = 0;

		const next = async (): Promise<any> => {
			if (index >= this.middlewares.length) {
				return await handler();
			}

			const middleware = this.middlewares[index++];
			return await middleware(request, next);
		};

		return await next();
	}
}

// Create middleware
const authMiddleware: MiddlewareFunction = async (request, next) => {
	// Check authentication
	const authHeader = request.headers?.authorization;
	if (!authHeader) {
		throw new Error('Authentication required');
	}

	return await next();
};

const loggingMiddleware: MiddlewareFunction = async (request, next) => {
	const start = Date.now();
	console.log(
		`[${new Date().toISOString()}] ${request.method} request started`
	);

	try {
		const result = await next();
		const duration = Date.now() - start;
		console.log(
			`[${new Date().toISOString()}] ${
				request.method
			} completed in ${duration}ms`
		);
		return result;
	} catch (error) {
		const duration = Date.now() - start;
		console.error(
			`[${new Date().toISOString()}] ${
				request.method
			} failed in ${duration}ms:`,
			error
		);
		throw error;
	}
};

// Use middleware
const middlewareManager = new MiddlewareManager();
middlewareManager.use(loggingMiddleware);
middlewareManager.use(authMiddleware);
```

### Client Implementation

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPClient {
	private client: Client;
	private transport: StdioClientTransport;

	constructor() {
		this.transport = new StdioClientTransport({
			command: 'node',
			args: ['dist/server.js'],
		});

		this.client = new Client(
			{
				name: 'mcp-client',
				version: '1.0.0',
			},
			{
				capabilities: {},
			}
		);
	}

	async connect(): Promise<void> {
		await this.client.connect(this.transport);
	}

	async disconnect(): Promise<void> {
		await this.client.close();
	}

	async listResources() {
		const response = await this.client.request(
			{ method: 'resources/list' },
			ListResourcesRequestSchema
		);
		return response.resources;
	}

	async readResource(uri: string) {
		const response = await this.client.request(
			{ method: 'resources/read', params: { uri } },
			ReadResourceRequestSchema
		);
		return response.contents;
	}

	async callTool<T = any>(name: string, arguments_: object): Promise<T> {
		const response = await this.client.request(
			{
				method: 'tools/call',
				params: { name, arguments: arguments_ },
			},
			CallToolRequestSchema
		);
		return response.content;
	}
}

// Usage example
async function clientExample() {
	const client = new MCPClient();

	try {
		await client.connect();

		// List and read resources
		const resources = await client.listResources();
		console.log('Available resources:', resources);

		for (const resource of resources) {
			const content = await client.readResource(resource.uri);
			console.log(`Resource ${resource.name}:`, content);
		}

		// Call tools
		const echoResult = await client.callTool('echo', {
			message: 'Hello from TypeScript!',
		});
		console.log('Echo result:', echoResult);

		const queryResult = await client.callTool('query', {
			query: 'SELECT * FROM users',
			limit: 10,
		});
		console.log('Query result:', queryResult);
	} finally {
		await client.disconnect();
	}
}
```

### Error Handling

```typescript
class MCPError extends Error {
	constructor(public code: string, message: string, public data?: any) {
		super(message);
		this.name = 'MCPError';
	}
}

class ResourceNotFoundError extends MCPError {
	constructor(uri: string) {
		super('RESOURCE_NOT_FOUND', `Resource not found: ${uri}`);
	}
}

class ToolNotFoundError extends MCPError {
	constructor(name: string) {
		super('TOOL_NOT_FOUND', `Tool not found: ${name}`);
	}
}

// Error handling wrapper
function withErrorHandling<T extends (...args: any[]) => any>(handler: T): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await handler(...args);
		} catch (error) {
			if (error instanceof MCPError) {
				throw error;
			}

			console.error('Unexpected error:', error);
			throw new MCPError('INTERNAL_ERROR', 'An internal error occurred', {
				originalError: error.message,
			});
		}
	}) as T;
}

// Usage
const safeReadResource = withErrorHandling(async (uri: string) => {
	if (!uri.startsWith('file://')) {
		throw new ResourceNotFoundError(uri);
	}

	// Read resource implementation
	return 'resource content';
});
```

### Testing with Vitest

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

describe('MCP Server', () => {
	let server: Server;

	beforeEach(() => {
		server = new Server(
			{ name: 'test-server', version: '1.0.0' },
			{ capabilities: { tools: {} } }
		);
	});

	afterEach(async () => {
		if (server) {
			await server.close();
		}
	});

	it('should list resources', async () => {
		server.setRequestHandler(ListResourcesRequestSchema, async () => ({
			resources: [
				{
					uri: 'test://resource',
					name: 'Test Resource',
					mimeType: 'text/plain',
				},
			],
		}));

		// Test implementation would depend on testing framework
		// This is a conceptual example
	});

	it('should handle tool calls', async () => {
		server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const { name, arguments: args } = request.params;

			if (name === 'test_tool') {
				return {
					content: [{ type: 'text', text: 'success' }],
				};
			}

			throw new Error(`Unknown tool: ${name}`);
		});

		// Test tool execution
		// Implementation would depend on testing setup
	});
});
```

### Performance Optimization

#### Connection Pooling

```typescript
class ConnectionPool<T> {
	private connections: T[] = [];
	private activeConnections = new Set<T>();
	private readonly maxSize: number;
	private readonly createConnection: () => Promise<T>;
	private readonly destroyConnection: (conn: T) => Promise<void>;

	constructor(
		maxSize: number,
		createConnection: () => Promise<T>,
		destroyConnection: (conn: T) => Promise<void>
	) {
		this.maxSize = maxSize;
		this.createConnection = createConnection;
		this.destroyConnection = destroyConnection;
	}

	async acquire(): Promise<T> {
		// Return existing connection if available
		if (this.connections.length > 0) {
			const connection = this.connections.pop()!;
			this.activeConnections.add(connection);
			return connection;
		}

		// Create new connection if under limit
		if (this.activeConnections.size < this.maxSize) {
			const connection = await this.createConnection();
			this.activeConnections.add(connection);
			return connection;
		}

		// Wait for connection to become available
		return new Promise((resolve) => {
			const checkForConnection = () => {
				if (this.connections.length > 0) {
					const connection = this.connections.pop()!;
					this.activeConnections.add(connection);
					resolve(connection);
				} else {
					setTimeout(checkForConnection, 10);
				}
			};
			checkForConnection();
		});
	}

	async release(connection: T): Promise<void> {
		this.activeConnections.delete(connection);
		this.connections.push(connection);
	}

	async destroy(): Promise<void> {
		await Promise.all([
			...this.connections.map((conn) => this.destroyConnection(conn)),
			...Array.from(this.activeConnections).map((conn) =>
				this.destroyConnection(conn)
			),
		]);

		this.connections.length = 0;
		this.activeConnections.clear();
	}
}
```

#### Caching Layer

```typescript
interface CacheEntry<T> {
	value: T;
	timestamp: number;
	ttl: number;
}

class LRUCache<K, V> {
	private cache = new Map<K, CacheEntry<V>>();
	private accessOrder = new Map<K, number>();
	private accessCounter = 0;

	constructor(
		private maxSize: number,
		private defaultTtl: number = 300000 // 5 minutes
	) {}

	get(key: K): V | undefined {
		const entry = this.cache.get(key);

		if (!entry) return undefined;

		// Check TTL
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			this.accessOrder.delete(key);
			return undefined;
		}

		// Update access order
		this.accessOrder.set(key, ++this.accessCounter);
		return entry.value;
	}

	set(key: K, value: V, ttl: number = this.defaultTtl): void {
		// Evict if at capacity
		if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
			this.evictLRU();
		}

		this.cache.set(key, {
			value,
			timestamp: Date.now(),
			ttl,
		});

		this.accessOrder.set(key, ++this.accessCounter);
	}

	private evictLRU(): void {
		let oldestKey: K | undefined;
		let oldestAccess = Infinity;

		for (const [key, access] of this.accessOrder) {
			if (access < oldestAccess) {
				oldestAccess = access;
				oldestKey = key;
			}
		}

		if (oldestKey !== undefined) {
			this.cache.delete(oldestKey);
			this.accessOrder.delete(oldestKey);
		}
	}
}
```

This TypeScript SDK implementation guide provides comprehensive patterns for building type-safe, performant MCP servers and clients with modern JavaScript/TypeScript development practices.
