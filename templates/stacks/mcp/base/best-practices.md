---
globs: ['<root>/**/*.{py,ts,js,java,kt,cs,swift}']
alwaysApply: false
---

# Model Context Protocol (MCP) Best Practices

## Server Development Best Practices

### Resource Management

#### Resource Lifecycle

```
1. Initialize resources lazily when first requested
2. Cache frequently accessed resources
3. Implement proper cleanup in server shutdown
4. Handle resource timeouts gracefully
```

#### Resource Security

-   **Validate All Inputs**: Never trust client input without validation
-   **Implement Rate Limiting**: Prevent resource exhaustion attacks
-   **Use Sandboxing**: Isolate resource access when possible
-   **Audit Resource Access**: Log all resource access for security monitoring

#### Resource Performance

-   **Streaming Large Resources**: Use streaming for large files or datasets
-   **Implement Pagination**: Break large datasets into manageable chunks
-   **Cache Strategy**: Implement appropriate caching based on resource volatility
-   **Compression**: Use compression for large text resources

### Tool Implementation

#### Tool Design Principles

1. **Idempotency**: Tools should be safe to retry
2. **Atomic Operations**: Tools should complete fully or not at all
3. **Clear Interfaces**: Use descriptive parameters and return values
4. **Error Handling**: Provide meaningful error messages

#### Tool Security

```python
# Example: Input validation for tools
def validate_tool_input(parameters: dict) -> bool:
    required_fields = ['action', 'target']
    for field in required_fields:
        if field not in parameters:
            raise ValueError(f"Missing required field: {field}")

    # Validate data types and ranges
    if not isinstance(parameters['action'], str):
        raise TypeError("Action must be a string")

    return True
```

#### Tool Performance

-   **Async Operations**: Use async/await for I/O operations
-   **Timeout Handling**: Implement timeouts for long-running operations
-   **Progress Reporting**: Provide progress updates for long operations
-   **Resource Cleanup**: Always clean up resources after tool execution

### Protocol Communication

#### Message Handling

-   **Version Compatibility**: Handle different protocol versions gracefully
-   **Error Propagation**: Preserve error context across protocol boundaries
-   **Request Validation**: Validate all incoming requests
-   **Response Formatting**: Ensure consistent response formats

#### Transport Optimization

```typescript
// Example: Efficient message batching
interface BatchRequest {
	requests: Array<{ id: string; method: string; params: any }>;
}

async function handleBatch(batch: BatchRequest): Promise<BatchResponse> {
	const responses = await Promise.allSettled(
		batch.requests.map((req) => processRequest(req))
	);
	return { responses };
}
```

## Client Development Best Practices

### Server Discovery and Connection

#### Connection Management

-   **Connection Pooling**: Reuse connections when possible
-   **Graceful Degradation**: Handle server unavailability
-   **Retry Logic**: Implement exponential backoff for retries
-   **Health Checks**: Monitor server health continuously

#### Server Selection

```java
public class ServerSelector {
    public MCP_Server selectBestServer(List<MCP_Server> servers, String capability) {
        return servers.stream()
            .filter(server -> server.hasCapability(capability))
            .min(Comparator.comparing(MCP_Server::getLatency))
            .orElseThrow(() -> new NoAvailableServerException(capability));
    }
}
```

### Data Handling

#### Resource Consumption

-   **Lazy Loading**: Load resources only when needed
-   **Memory Management**: Monitor memory usage for large resources
-   **Stream Processing**: Process large datasets incrementally
-   **Error Recovery**: Handle partial data gracefully

#### Caching Strategy

```csharp
public class ResourceCache
{
    private readonly Dictionary<string, CachedResource> _cache = new();
    private readonly TimeSpan _defaultTtl = TimeSpan.FromMinutes(5);

    public async Task<Resource> GetResourceAsync(string uri)
    {
        if (_cache.TryGetValue(uri, out var cached) && !cached.IsExpired)
        {
            return cached.Resource;
        }

        var resource = await _mcpClient.ReadResourceAsync(uri);
        _cache[uri] = new CachedResource(resource, DateTime.UtcNow.Add(_defaultTtl));
        return resource;
    }
}
```

## Security Best Practices

### Authentication and Authorization

#### Server Authentication

-   **Mutual TLS**: Use mTLS for secure communication
-   **API Keys**: Implement secure API key management
-   **OAuth Integration**: Support OAuth 2.0 for user authentication
-   **Token Rotation**: Implement token refresh mechanisms

#### Access Control

```swift
protocol AccessController {
    func canAccess(resource: String, user: User) -> Bool
    func canExecute(tool: String, user: User) -> Bool
    func auditAccess(resource: String, user: User, action: String)
}

class RoleBasedAccessController: AccessController {
    func canAccess(resource: String, user: User) -> Bool {
        let requiredRole = getRequiredRole(for: resource)
        return user.roles.contains(requiredRole)
    }
}
```

### Data Protection

#### Encryption

-   **Data at Rest**: Encrypt sensitive data in storage
-   **Data in Transit**: Use TLS for all communications
-   **Key Management**: Implement secure key rotation
-   **Sensitive Data Masking**: Mask sensitive data in logs

#### Privacy Compliance

-   **Data Minimization**: Only collect necessary data
-   **Retention Policies**: Implement data retention policies
-   **User Consent**: Obtain proper consent for data usage
-   **Right to Deletion**: Support data deletion requests

## Testing Best Practices

### Unit Testing

#### Test Structure

```kotlin
class MCP_ServerTest {
    @Test
    fun `should handle resource request correctly`() {
        // Arrange
        val server = MCP_Server()
        val request = ResourceRequest("test://resource")

        // Act
        val response = server.handleResourceRequest(request)

        // Assert
        assertEquals(Status.SUCCESS, response.status)
        assertNotNull(response.content)
    }

    @Test
    fun `should handle invalid resource gracefully`() {
        val server = MCP_Server()
        val request = ResourceRequest("invalid://resource")

        val response = server.handleResourceRequest(request)

        assertEquals(Status.NOT_FOUND, response.status)
        assertTrue(response.error.isNotEmpty())
    }
}
```

### Integration Testing

#### End-to-End Testing

-   **Server Lifecycle**: Test complete server startup/shutdown cycles
-   **Multi-Client Scenarios**: Test concurrent client connections
-   **Network Failures**: Test behavior under network conditions
-   **Resource Limits**: Test behavior under resource constraints

### Performance Testing

#### Benchmarking

-   **Throughput Testing**: Measure requests per second
-   **Latency Testing**: Measure response times
-   **Memory Usage**: Monitor memory consumption patterns
-   **Concurrent Load**: Test under concurrent client loads

## Monitoring and Observability

### Logging

#### Structured Logging

```python
import logging
import json

class MCP_Logger:
    def __init__(self):
        self.logger = logging.getLogger('mcp_server')

    def log_request(self, method: str, params: dict, user_id: str = None):
        log_data = {
            'event': 'request',
            'method': method,
            'params': params,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(log_data))
```

#### Performance Metrics

-   **Request Duration**: Track request processing times
-   **Error Rates**: Monitor error frequencies
-   **Resource Usage**: Track CPU, memory, and network usage
-   **Client Metrics**: Monitor client connection patterns

### Health Monitoring

#### Health Endpoints

```typescript
app.get('/health', (req, res) => {
	const health = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		dependencies: {
			database: checkDatabaseHealth(),
			external_api: checkExternalApiHealth(),
		},
	};

	const overallHealthy = Object.values(health.dependencies).every(
		(status) => status === 'healthy'
	);

	res.status(overallHealthy ? 200 : 503).json(health);
});
```

## Deployment Best Practices

### Configuration Management

-   **Environment Variables**: Use environment variables for configuration
-   **Config Validation**: Validate configuration at startup
-   **Secret Management**: Use secure secret management systems
-   **Feature Flags**: Implement feature flags for gradual rollouts

### Scalability

-   **Horizontal Scaling**: Design for horizontal scaling
-   **Load Balancing**: Implement proper load balancing
-   **Circuit Breakers**: Implement circuit breaker patterns
-   **Graceful Shutdown**: Handle shutdown signals properly

### Monitoring in Production

-   **Application Metrics**: Monitor application-specific metrics
-   **Infrastructure Metrics**: Monitor underlying infrastructure
-   **Alerting**: Set up proper alerting for critical issues
-   **Log Aggregation**: Centralize logs for analysis

These best practices ensure robust, secure, and maintainable MCP implementations across all supported SDKs.
