---
globs: <root>/**/*.java,<root>/pom.xml,<root>/build.gradle
alwaysApply: false
---

# MCP Java SDK Implementation Guide

## Java SDK Features

The Java SDK provides enterprise-grade MCP server and client implementations with strong typing, comprehensive error handling, and excellent performance characteristics.

### Maven Configuration

```xml
<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>mcp-server</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.modelcontextprotocol</groupId>
            <artifactId>mcp-java-sdk</artifactId>
            <version>1.0.0</version>
        </dependency>

        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>
        </dependency>

        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.7</version>
        </dependency>

        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.8</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.9.2</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>5.3.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### Basic Server Implementation

```java
package com.example.mcp.server;

import io.modelcontextprotocol.sdk.server.MCPServer;
import io.modelcontextprotocol.sdk.server.ServerCapabilities;
import io.modelcontextprotocol.sdk.server.annotations.*;
import io.modelcontextprotocol.sdk.types.*;
import io.modelcontextprotocol.sdk.transport.StdioTransport;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

public class ExampleMCPServer {
    private final Map<String, String> resourceStorage = new ConcurrentHashMap<>();

    public ExampleMCPServer() {
        // Initialize with sample data
        resourceStorage.put("file://example.txt", "Sample content from Java MCP server");
        resourceStorage.put("file://config.json", "{\"setting\": \"value\"}");
    }

    @ResourceProvider
    public CompletableFuture<List<Resource>> listResources() {
        List<Resource> resources = resourceStorage.keySet().stream()
            .map(uri -> Resource.builder()
                .uri(uri)
                .name(extractNameFromUri(uri))
                .description("A sample resource")
                .mimeType(determineMimeType(uri))
                .build())
            .toList();

        return CompletableFuture.completedFuture(resources);
    }

    @ResourceReader
    public CompletableFuture<ResourceContent> readResource(@ResourceUri String uri) {
        String content = resourceStorage.get(uri);

        if (content == null) {
            return CompletableFuture.failedFuture(
                new ResourceNotFoundException("Resource not found: " + uri)
            );
        }

        ResourceContent resourceContent = ResourceContent.builder()
            .uri(uri)
            .mimeType(determineMimeType(uri))
            .text(content)
            .build();

        return CompletableFuture.completedFuture(resourceContent);
    }

    @ToolProvider
    public CompletableFuture<List<Tool>> listTools() {
        List<Tool> tools = List.of(
            Tool.builder()
                .name("echo")
                .description("Echo back the input message")
                .inputSchema(createEchoSchema())
                .build(),

            Tool.builder()
                .name("calculate")
                .description("Perform mathematical calculations")
                .inputSchema(createCalculateSchema())
                .build()
        );

        return CompletableFuture.completedFuture(tools);
    }

    @ToolExecutor("echo")
    public CompletableFuture<ToolResult> executeEcho(@ToolArguments Map<String, Object> arguments) {
        String message = (String) arguments.get("message");

        if (message == null) {
            return CompletableFuture.failedFuture(
                new IllegalArgumentException("Message parameter is required")
            );
        }

        TextContent content = TextContent.builder()
            .type("text")
            .text("Echo: " + message)
            .build();

        ToolResult result = ToolResult.builder()
            .content(List.of(content))
            .isError(false)
            .build();

        return CompletableFuture.completedFuture(result);
    }

    @ToolExecutor("calculate")
    public CompletableFuture<ToolResult> executeCalculate(@ToolArguments Map<String, Object> arguments) {
        try {
            String expression = (String) arguments.get("expression");
            if (expression == null) {
                throw new IllegalArgumentException("Expression parameter is required");
            }

            double result = evaluateExpression(expression);

            TextContent content = TextContent.builder()
                .type("text")
                .text("Result: " + result)
                .build();

            ToolResult toolResult = ToolResult.builder()
                .content(List.of(content))
                .isError(false)
                .build();

            return CompletableFuture.completedFuture(toolResult);

        } catch (Exception e) {
            TextContent errorContent = TextContent.builder()
                .type("text")
                .text("Error: " + e.getMessage())
                .build();

            ToolResult errorResult = ToolResult.builder()
                .content(List.of(errorContent))
                .isError(true)
                .build();

            return CompletableFuture.completedFuture(errorResult);
        }
    }

    // Utility methods
    private String extractNameFromUri(String uri) {
        return uri.substring(uri.lastIndexOf("/") + 1);
    }

    private String determineMimeType(String uri) {
        if (uri.endsWith(".json")) return "application/json";
        if (uri.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    private JsonSchema createEchoSchema() {
        return JsonSchema.builder()
            .type("object")
            .property("message", JsonSchema.builder()
                .type("string")
                .description("Message to echo back")
                .build())
            .required(List.of("message"))
            .build();
    }

    private JsonSchema createCalculateSchema() {
        return JsonSchema.builder()
            .type("object")
            .property("expression", JsonSchema.builder()
                .type("string")
                .description("Mathematical expression to evaluate")
                .build())
            .required(List.of("expression"))
            .build();
    }

    private double evaluateExpression(String expression) {
        // Simple expression evaluator - in production, use a proper library
        // This is just for demonstration
        return Double.parseDouble(expression);
    }

    public static void main(String[] args) {
        ExampleMCPServer serverInstance = new ExampleMCPServer();

        ServerCapabilities capabilities = ServerCapabilities.builder()
            .resources(ResourceCapabilities.builder()
                .subscribe(true)
                .listChanged(true)
                .build())
            .tools(ToolCapabilities.builder()
                .listChanged(true)
                .build())
            .build();

        MCPServer server = MCPServer.builder()
            .name("java-mcp-server")
            .version("1.0.0")
            .capabilities(capabilities)
            .instance(serverInstance)
            .build();

        StdioTransport transport = new StdioTransport();

        try {
            server.start(transport);
            System.err.println("Java MCP Server started on stdio");

            // Keep the server running
            Thread.currentThread().join();

        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            System.exit(1);
        }
    }
}
```

### Client Implementation

```java
package com.example.mcp.client;

import io.modelcontextprotocol.sdk.client.MCPClient;
import io.modelcontextprotocol.sdk.client.ClientCapabilities;
import io.modelcontextprotocol.sdk.types.*;
import io.modelcontextprotocol.sdk.transport.StdioTransport;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class ExampleMCPClient {
    private MCPClient client;

    public ExampleMCPClient() {
        ClientCapabilities capabilities = ClientCapabilities.builder()
            .experimental(Map.of())
            .build();

        this.client = MCPClient.builder()
            .name("java-mcp-client")
            .version("1.0.0")
            .capabilities(capabilities)
            .build();
    }

    public CompletableFuture<Void> connect(String serverCommand, String... args) {
        StdioTransport transport = StdioTransport.builder()
            .command(serverCommand)
            .args(List.of(args))
            .build();

        return client.connect(transport);
    }

    public CompletableFuture<List<Resource>> listResources() {
        return client.listResources();
    }

    public CompletableFuture<ResourceContent> readResource(String uri) {
        return client.readResource(uri);
    }

    public CompletableFuture<List<Tool>> listTools() {
        return client.listTools();
    }

    public CompletableFuture<ToolResult> callTool(String name, Map<String, Object> arguments) {
        return client.callTool(name, arguments);
    }

    public CompletableFuture<Void> disconnect() {
        return client.disconnect();
    }

    public static void main(String[] args) {
        ExampleMCPClient client = new ExampleMCPClient();

        client.connect("java", "-jar", "mcp-server.jar")
            .thenCompose(v -> client.listResources())
            .thenAccept(resources -> {
                System.out.println("Available resources:");
                resources.forEach(resource ->
                    System.out.println("  " + resource.getName() + " (" + resource.getUri() + ")")
                );
            })
            .thenCompose(v -> client.listTools())
            .thenAccept(tools -> {
                System.out.println("Available tools:");
                tools.forEach(tool ->
                    System.out.println("  " + tool.getName() + ": " + tool.getDescription())
                );
            })
            .thenCompose(v -> client.callTool("echo", Map.of("message", "Hello from Java client!")))
            .thenAccept(result -> {
                System.out.println("Tool result:");
                result.getContent().forEach(content ->
                    System.out.println("  " + content.getText())
                );
            })
            .thenCompose(v -> client.disconnect())
            .whenComplete((result, throwable) -> {
                if (throwable != null) {
                    System.err.println("Client error: " + throwable.getMessage());
                    throwable.printStackTrace();
                }
                System.exit(throwable != null ? 1 : 0);
            });
    }
}
```

### Spring Boot Integration

```java
package com.example.mcp.spring;

import io.modelcontextprotocol.sdk.server.MCPServer;
import io.modelcontextprotocol.sdk.server.ServerCapabilities;
import io.modelcontextprotocol.sdk.transport.HttpTransport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class MCPSpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(MCPSpringBootApplication.class, args);
    }
}

@Configuration
public class MCPConfiguration {

    @Bean
    public MCPServer mcpServer(MCPServerService serverService) {
        ServerCapabilities capabilities = ServerCapabilities.builder()
            .resources(ResourceCapabilities.builder()
                .subscribe(true)
                .listChanged(true)
                .build())
            .tools(ToolCapabilities.builder()
                .listChanged(true)
                .build())
            .build();

        return MCPServer.builder()
            .name("spring-mcp-server")
            .version("1.0.0")
            .capabilities(capabilities)
            .instance(serverService)
            .build();
    }
}

@Service
public class MCPServerService {

    @ResourceProvider
    public CompletableFuture<List<Resource>> listResources() {
        // Implementation using Spring services
        return CompletableFuture.completedFuture(List.of());
    }

    @ToolExecutor("spring-tool")
    public CompletableFuture<ToolResult> executeSpringTool(@ToolArguments Map<String, Object> arguments) {
        // Implementation using Spring services
        return CompletableFuture.completedFuture(ToolResult.builder().build());
    }
}

@RestController
public class MCPController {

    private final MCPServer mcpServer;

    public MCPController(MCPServer mcpServer) {
        this.mcpServer = mcpServer;

        // Start MCP server on HTTP transport
        HttpTransport transport = HttpTransport.builder()
            .port(8080)
            .path("/mcp")
            .build();

        mcpServer.start(transport);
    }
}
```

### Testing with JUnit 5

```java
package com.example.mcp.server;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExampleMCPServerTest {

    private ExampleMCPServer server;

    @BeforeEach
    void setUp() {
        server = new ExampleMCPServer();
    }

    @Test
    void testListResources() {
        CompletableFuture<List<Resource>> future = server.listResources();

        assertDoesNotThrow(() -> {
            List<Resource> resources = future.get();
            assertNotNull(resources);
            assertFalse(resources.isEmpty());
        });
    }

    @Test
    void testEchoTool() {
        Map<String, Object> arguments = Map.of("message", "test message");

        CompletableFuture<ToolResult> future = server.executeEcho(arguments);

        assertDoesNotThrow(() -> {
            ToolResult result = future.get();
            assertNotNull(result);
            assertFalse(result.isError());
            assertEquals("Echo: test message",
                result.getContent().get(0).getText());
        });
    }

    @Test
    void testEchoToolWithMissingMessage() {
        Map<String, Object> arguments = Map.of();

        CompletableFuture<ToolResult> future = server.executeEcho(arguments);

        assertThrows(Exception.class, () -> future.get());
    }
}
```

### Performance Optimization

```java
package com.example.mcp.performance;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class PerformanceOptimizedServer {

    private final ExecutorService executorService;
    private final Cache<String, Object> resourceCache;
    private final AtomicLong requestCounter;

    public PerformanceOptimizedServer() {
        this.executorService = ForkJoinPool.commonPool();
        this.resourceCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(5))
            .recordStats()
            .build();
        this.requestCounter = new AtomicLong(0);
    }

    @ResourceReader
    public CompletableFuture<ResourceContent> readResourceCached(@ResourceUri String uri) {
        return CompletableFuture.supplyAsync(() -> {
            requestCounter.incrementAndGet();

            return resourceCache.get(uri, key -> {
                // Expensive resource loading operation
                return loadResourceFromStorage(key);
            });

        }, executorService).thenApply(content -> {
            return ResourceContent.builder()
                .uri(uri)
                .text(content.toString())
                .build();
        });
    }

    private Object loadResourceFromStorage(String uri) {
        // Simulate expensive operation
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Loaded content for " + uri;
    }

    public CacheStats getCacheStats() {
        return resourceCache.stats();
    }

    public long getRequestCount() {
        return requestCounter.get();
    }
}
```

This Java SDK implementation guide provides enterprise-ready patterns for building robust, scalable MCP servers and clients with Java's strong typing and performance characteristics.
