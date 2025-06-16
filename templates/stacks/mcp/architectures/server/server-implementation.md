---
globs: <root>/**/*.py,<root>/**/*.ts,<root>/**/*.js,<root>/**/*.java,<root>/**/*.kt,<root>/**/*.cs,<root>/**/*.swift
alwaysApply: false
---

# MCP Server Implementation Guide

## Server Architecture Design

### Core Server Structure

MCP servers should follow a modular architecture with clear separation of concerns:

```
Server Core
├── Protocol Handler      # MCP protocol communication
├── Resource Manager     # Resource discovery and serving
├── Tool Registry       # Tool registration and execution
├── Prompt Manager      # Prompt template management
└── Transport Layer     # Communication transport (stdio, HTTP, WebSocket)
```

### Server Lifecycle Management

#### Initialization Sequence

1. **Configuration Loading**: Load server configuration and validate settings
2. **Resource Discovery**: Scan and register available resources
3. **Tool Registration**: Register available tools and their schemas
4. **Transport Setup**: Initialize communication transport
5. **Capability Announcement**: Declare server capabilities to clients

#### Shutdown Sequence

1. **Graceful Connection Closure**: Complete ongoing requests
2. **Resource Cleanup**: Clean up open resources and connections
3. **State Persistence**: Save any necessary state
4. **Transport Shutdown**: Close transport layer
5. **Final Cleanup**: Release system resources

### Resource Management

#### Resource Discovery

```python
# Example: Dynamic resource discovery
class ResourceManager:
    def __init__(self):
        self.resources = {}
        self.resource_handlers = {}

    def discover_resources(self, base_path: str):
        """Discover available resources in the system."""
        for handler in self.resource_handlers.values():
            discovered = handler.discover(base_path)
            self.resources.update(discovered)

    def register_handler(self, scheme: str, handler: ResourceHandler):
        """Register a resource handler for a URI scheme."""
        self.resource_handlers[scheme] = handler
```

#### Resource Caching Strategy

-   **Time-based Expiration**: Cache resources with TTL
-   **Event-based Invalidation**: Invalidate cache on resource changes
-   **Memory Management**: Implement LRU eviction for large caches
-   **Streaming Support**: Stream large resources instead of caching

### Tool Implementation

#### Tool Registry Design

```typescript
interface Tool {
	name: string;
	description: string;
	inputSchema: JSONSchema;
	outputSchema: JSONSchema;
	execute(params: any): Promise<any>;
}

class ToolRegistry {
	private tools: Map<string, Tool> = new Map();

	register(tool: Tool): void {
		this.validateTool(tool);
		this.tools.set(tool.name, tool);
	}

	async execute(name: string, params: any): Promise<any> {
		const tool = this.tools.get(name);
		if (!tool) throw new Error(`Tool not found: ${name}`);

		this.validateInput(tool.inputSchema, params);
		return await tool.execute(params);
	}
}
```

#### Tool Security Patterns

```java
public class SecureTool implements Tool {
    private final AccessController accessController;
    private final InputValidator validator;

    @Override
    public CompletableFuture<Object> execute(Map<String, Object> params, User user) {
        // Security checks
        if (!accessController.canExecute(getName(), user)) {
            throw new UnauthorizedException("Access denied");
        }

        // Input validation
        validator.validate(getInputSchema(), params);

        // Execution with monitoring
        return CompletableFuture.supplyAsync(() -> {
            try {
                return executeInternal(params);
            } catch (Exception e) {
                auditLogger.logError(getName(), user, e);
                throw e;
            }
        });
    }
}
```

### Protocol Communication

#### Message Processing Pipeline

1. **Message Reception**: Receive raw message from transport
2. **Protocol Parsing**: Parse MCP protocol message
3. **Request Validation**: Validate request format and parameters
4. **Handler Dispatch**: Route to appropriate handler
5. **Response Generation**: Generate protocol-compliant response
6. **Message Transmission**: Send response via transport

#### Error Handling Strategy

```csharp
public class ProtocolHandler
{
    public async Task<Response> HandleRequest(Request request)
    {
        try
        {
            var result = await ProcessRequest(request);
            return new SuccessResponse(result);
        }
        catch (ValidationException ex)
        {
            return new ErrorResponse(ErrorCodes.InvalidParams, ex.Message);
        }
        catch (ResourceNotFoundException ex)
        {
            return new ErrorResponse(ErrorCodes.ResourceNotFound, ex.Message);
        }
        catch (UnauthorizedException ex)
        {
            return new ErrorResponse(ErrorCodes.Unauthorized, "Access denied");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error processing request");
            return new ErrorResponse(ErrorCodes.InternalError, "Internal server error");
        }
    }
}
```

### Transport Layer Implementation

#### Stdio Transport

```swift
class StdioTransport: Transport {
    private let input: FileHandle
    private let output: FileHandle

    func startListening() async {
        while true {
            do {
                let message = try await readMessage()
                Task {
                    let response = await self.messageHandler?.handle(message)
                    try await self.sendMessage(response)
                }
            } catch {
                handleTransportError(error)
            }
        }
    }

    private func readMessage() async throws -> MCPMessage {
        let data = input.availableData
        return try JSONDecoder().decode(MCPMessage.self, from: data)
    }
}
```

#### HTTP Transport

```kotlin
class HttpTransport(private val port: Int) : Transport {
    private lateinit var server: HttpServer

    override suspend fun start() {
        server = embeddedServer(Netty, port = port) {
            routing {
                post("/mcp") {
                    val request = call.receive<MCPRequest>()
                    val response = messageHandler.handle(request)
                    call.respond(response)
                }

                get("/health") {
                    call.respond(mapOf("status" to "healthy"))
                }
            }
        }
        server.start(wait = false)
    }
}
```

### Capability Management

#### Dynamic Capability Declaration

```python
class CapabilityManager:
    def __init__(self):
        self.capabilities = {
            "resources": {"listChanged": True},
            "tools": {"listChanged": True},
            "prompts": {"listChanged": False}
        }

    def add_capability(self, name: str, features: dict):
        """Add a new capability to the server."""
        self.capabilities[name] = features

    def get_capabilities(self) -> dict:
        """Get current server capabilities."""
        return self.capabilities.copy()

    def supports_capability(self, name: str, feature: str = None) -> bool:
        """Check if server supports a specific capability."""
        if name not in self.capabilities:
            return False

        if feature is None:
            return True

        return self.capabilities[name].get(feature, False)
```

### Performance Optimization

#### Async Processing

-   **Concurrent Request Handling**: Process multiple requests simultaneously
-   **Non-blocking I/O**: Use async I/O for file and network operations
-   **Connection Pooling**: Pool database and external service connections
-   **Request Batching**: Support batched requests when possible

#### Memory Management

```typescript
class ResourceCache {
	private cache = new Map<string, CacheEntry>();
	private maxSize = 1000;
	private maxMemory = 100 * 1024 * 1024; // 100MB

	set(key: string, value: any, ttl: number = 300000): void {
		this.evictIfNeeded();

		const entry = {
			value,
			timestamp: Date.now(),
			ttl,
			size: this.calculateSize(value),
		};

		this.cache.set(key, entry);
	}

	private evictIfNeeded(): void {
		const currentMemory = Array.from(this.cache.values()).reduce(
			(sum, entry) => sum + entry.size,
			0
		);

		if (currentMemory > this.maxMemory || this.cache.size >= this.maxSize) {
			this.evictLRU();
		}
	}
}
```

### Monitoring and Observability

#### Metrics Collection

```java
@Component
public class MCPMetrics {
    private final MeterRegistry meterRegistry;
    private final Counter requestCounter;
    private final Timer requestTimer;

    public MCPMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.requestCounter = Counter.builder("mcp.requests.total")
            .description("Total MCP requests")
            .register(meterRegistry);
        this.requestTimer = Timer.builder("mcp.request.duration")
            .description("MCP request duration")
            .register(meterRegistry);
    }

    public void recordRequest(String method, String status) {
        requestCounter.increment(
            Tags.of(
                Tag.of("method", method),
                Tag.of("status", status)
            )
        );
    }
}
```

#### Health Checks

```csharp
public class HealthCheckService
{
    private readonly IResourceManager _resourceManager;
    private readonly IToolRegistry _toolRegistry;

    public async Task<HealthStatus> CheckHealthAsync()
    {
        var checks = new List<Task<HealthCheck>>
        {
            CheckResourceManagerAsync(),
            CheckToolRegistryAsync(),
            CheckExternalDependenciesAsync()
        };

        var results = await Task.WhenAll(checks);

        return new HealthStatus
        {
            IsHealthy = results.All(r => r.IsHealthy),
            Checks = results.ToList(),
            Timestamp = DateTime.UtcNow
        };
    }
}
```

### Testing Strategy

#### Unit Testing

-   **Handler Testing**: Test individual request handlers
-   **Resource Testing**: Test resource discovery and serving
-   **Tool Testing**: Test tool execution and validation
-   **Protocol Testing**: Test protocol message handling

#### Integration Testing

-   **Transport Testing**: Test with different transport layers
-   **Client Integration**: Test with actual MCP clients
-   **Performance Testing**: Load and stress testing
-   **Security Testing**: Penetration testing and vulnerability assessment

This implementation guide provides a comprehensive foundation for building robust, scalable, and secure MCP servers across all supported SDKs.
