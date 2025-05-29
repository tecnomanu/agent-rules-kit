---
globs: ['<root>/**/*.kt', '<root>/build.gradle.kts', '<root>/build.gradle']
alwaysApply: false
---

# MCP Kotlin SDK Implementation Guide

## Kotlin SDK Features

The Kotlin SDK provides modern, concise, and type-safe MCP implementations with coroutines support and excellent null safety.

### Gradle Configuration

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.10"
    kotlin("plugin.serialization") version "1.9.10"
    application
}

dependencies {
    implementation("io.modelcontextprotocol:mcp-kotlin-sdk:1.0.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("io.ktor:ktor-server-core:2.3.4")
    implementation("io.ktor:ktor-server-netty:2.3.4")

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("io.mockk:mockk:1.13.8")
}
```

### Basic Server Implementation

```kotlin
import io.modelcontextprotocol.sdk.server.*
import io.modelcontextprotocol.sdk.types.*
import kotlinx.coroutines.*
import kotlinx.serialization.Serializable

@Serializable
data class EchoArgs(val message: String)

@Serializable
data class QueryArgs(val query: String, val limit: Int = 100)

class KotlinMCPServer : MCPServerHandler {
    private val resourceStorage = mutableMapOf<String, String>()

    init {
        resourceStorage["file://example.txt"] = "Kotlin MCP Server content"
        resourceStorage["file://data.json"] = """{"key": "value"}"""
    }

    override suspend fun listResources(): List<Resource> {
        return resourceStorage.keys.map { uri ->
            Resource(
                uri = uri,
                name = uri.substringAfterLast("/"),
                description = "Sample resource",
                mimeType = when {
                    uri.endsWith(".json") -> "application/json"
                    uri.endsWith(".txt") -> "text/plain"
                    else -> "application/octet-stream"
                }
            )
        }
    }

    override suspend fun readResource(uri: String): ResourceContent {
        val content = resourceStorage[uri]
            ?: throw ResourceNotFoundException("Resource not found: $uri")

        return ResourceContent(
            uri = uri,
            mimeType = determineMimeType(uri),
            text = content
        )
    }

    override suspend fun listTools(): List<Tool> = listOf(
        Tool(
            name = "echo",
            description = "Echo back the input message",
            inputSchema = JsonSchema.obj {
                property("message", JsonSchema.string("Message to echo"))
                required("message")
            }
        ),
        Tool(
            name = "query",
            description = "Execute a database query",
            inputSchema = JsonSchema.obj {
                property("query", JsonSchema.string("SQL query"))
                property("limit", JsonSchema.number("Result limit", default = 100))
                required("query")
            }
        )
    )

    override suspend fun callTool(name: String, arguments: Map<String, Any>): ToolResult {
        return when (name) {
            "echo" -> handleEcho(arguments)
            "query" -> handleQuery(arguments)
            else -> throw ToolNotFoundException("Unknown tool: $name")
        }
    }

    private suspend fun handleEcho(arguments: Map<String, Any>): ToolResult {
        val message = arguments["message"] as? String
            ?: throw IllegalArgumentException("Message parameter required")

        return ToolResult(
            content = listOf(
                TextContent(
                    type = "text",
                    text = "Echo: $message"
                )
            )
        )
    }

    private suspend fun handleQuery(arguments: Map<String, Any>): ToolResult {
        val query = arguments["query"] as? String
            ?: throw IllegalArgumentException("Query parameter required")
        val limit = (arguments["limit"] as? Number)?.toInt() ?: 100

        // Simulate async database operation
        delay(50)

        val result = mapOf(
            "query" to query,
            "limit" to limit,
            "rowCount" to (1..limit).random(),
            "executionTime" to "${(10..100).random()}ms"
        )

        return ToolResult(
            content = listOf(
                TextContent(
                    type = "text",
                    text = "Query result: $result"
                )
            )
        )
    }

    private fun determineMimeType(uri: String): String = when {
        uri.endsWith(".json") -> "application/json"
        uri.endsWith(".txt") -> "text/plain"
        else -> "application/octet-stream"
    }
}

// Server startup
suspend fun main() {
    val server = MCPServer(
        name = "kotlin-mcp-server",
        version = "1.0.0",
        capabilities = ServerCapabilities(
            resources = ResourceCapabilities(
                subscribe = true,
                listChanged = true
            ),
            tools = ToolCapabilities(
                listChanged = true
            )
        ),
        handler = KotlinMCPServer()
    )

    val transport = StdioTransport()
    server.start(transport)

    println("Kotlin MCP Server running...")
}
```

### Client Implementation

```kotlin
class KotlinMCPClient {
    private val client = MCPClient(
        name = "kotlin-mcp-client",
        version = "1.0.0",
        capabilities = ClientCapabilities()
    )

    suspend fun connect(command: String, vararg args: String) {
        val transport = StdioTransport(command, *args)
        client.connect(transport)
    }

    suspend fun listResources(): List<Resource> = client.listResources()

    suspend fun readResource(uri: String): ResourceContent = client.readResource(uri)

    suspend fun listTools(): List<Tool> = client.listTools()

    suspend fun callTool(name: String, arguments: Map<String, Any>): ToolResult =
        client.callTool(name, arguments)

    suspend fun disconnect() = client.disconnect()
}

// Usage example
suspend fun clientExample() {
    val client = KotlinMCPClient()

    try {
        client.connect("kotlin", "-jar", "server.jar")

        // List resources
        val resources = client.listResources()
        println("Resources: ${resources.map { it.name }}")

        // Call tools
        val echoResult = client.callTool("echo", mapOf("message" to "Hello Kotlin!"))
        println("Echo: ${echoResult.content.first().text}")

    } finally {
        client.disconnect()
    }
}
```

### Advanced Features with Coroutines

```kotlin
class AdvancedKotlinMCPServer : MCPServerHandler {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val resourceCache = mutableMapOf<String, Deferred<String>>()

    override suspend fun readResource(uri: String): ResourceContent {
        val content = resourceCache.getOrPut(uri) {
            scope.async {
                // Expensive async operation
                loadResourceAsync(uri)
            }
        }.await()

        return ResourceContent(uri = uri, text = content)
    }

    private suspend fun loadResourceAsync(uri: String): String {
        delay(100) // Simulate network/disk I/O
        return "Loaded content for $uri"
    }

    override suspend fun callTool(name: String, arguments: Map<String, Any>): ToolResult {
        return when (name) {
            "parallel-process" -> handleParallelProcessing(arguments)
            "streaming-data" -> handleStreamingData(arguments)
            else -> super.callTool(name, arguments)
        }
    }

    private suspend fun handleParallelProcessing(arguments: Map<String, Any>): ToolResult {
        val tasks = (arguments["tasks"] as? List<*>)?.filterIsInstance<String>()
            ?: throw IllegalArgumentException("Tasks parameter required")

        val results = withContext(Dispatchers.IO) {
            tasks.map { task ->
                async { processTask(task) }
            }.awaitAll()
        }

        return ToolResult(
            content = listOf(
                TextContent(
                    type = "text",
                    text = "Processed ${results.size} tasks: $results"
                )
            )
        )
    }

    private suspend fun processTask(task: String): String {
        delay(50) // Simulate work
        return "Processed: $task"
    }

    private suspend fun handleStreamingData(arguments: Map<String, Any>): ToolResult {
        val count = (arguments["count"] as? Number)?.toInt() ?: 10

        val results = mutableListOf<String>()

        // Simulate streaming data processing
        repeat(count) { i ->
            delay(10)
            results.add("Data chunk $i")
        }

        return ToolResult(
            content = listOf(
                TextContent(
                    type = "text",
                    text = "Streamed ${results.size} chunks"
                )
            )
        )
    }
}
```

### Testing with Coroutines

```kotlin
import kotlinx.coroutines.test.*
import kotlin.test.*

class KotlinMCPServerTest {

    @Test
    fun `should list resources`() = runTest {
        val server = KotlinMCPServer()
        val resources = server.listResources()

        assertTrue(resources.isNotEmpty())
        assertTrue(resources.any { it.name == "example.txt" })
    }

    @Test
    fun `should handle echo tool`() = runTest {
        val server = KotlinMCPServer()
        val result = server.callTool("echo", mapOf("message" to "test"))

        assertEquals("Echo: test", result.content.first().text)
    }

    @Test
    fun `should handle resource not found`() = runTest {
        val server = KotlinMCPServer()

        assertFailsWith<ResourceNotFoundException> {
            server.readResource("file://nonexistent.txt")
        }
    }
}
```

This Kotlin SDK implementation leverages coroutines, null safety, and concise syntax for building efficient MCP applications.
