---
globs: ['<root>/**/*.swift', '<root>/Package.swift', '<root>/*.xcodeproj']
alwaysApply: false
---

# MCP Swift SDK Implementation Guide

## Swift SDK Features

The Swift SDK provides modern, type-safe MCP implementations with async/await, strong memory management, and excellent Apple ecosystem integration.

### Package Configuration

```swift
// Package.swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MCPSwiftServer",
    platforms: [
        .macOS(.v13),
        .iOS(.v16),
    ],
    products: [
        .executable(name: "MCPSwiftServer", targets: ["MCPSwiftServer"]),
        .library(name: "MCPSwiftSDK", targets: ["MCPSwiftSDK"]),
    ],
    dependencies: [
        .package(url: "https://github.com/modelcontextprotocol/swift-sdk", from: "1.0.0"),
        .package(url: "https://github.com/apple/swift-log", from: "1.5.0"),
        .package(url: "https://github.com/vapor/vapor", from: "4.89.0"),
    ],
    targets: [
        .executableTarget(
            name: "MCPSwiftServer",
            dependencies: [
                "MCPSwiftSDK",
                .product(name: "Logging", package: "swift-log"),
            ]
        ),
        .target(
            name: "MCPSwiftSDK",
            dependencies: [
                .product(name: "ModelContextProtocol", package: "swift-sdk"),
                .product(name: "Logging", package: "swift-log"),
            ]
        ),
        .testTarget(
            name: "MCPSwiftSDKTests",
            dependencies: ["MCPSwiftSDK"]
        ),
    ]
)
```

### Basic Server Implementation

```swift
import ModelContextProtocol
import Foundation
import Logging

struct EchoArguments: Codable {
    let message: String
}

struct CalculateArguments: Codable {
    let expression: String
    let precision: Int?
}

final class SwiftMCPServer: MCPServerHandler {
    private let logger: Logger
    private var resourceStorage: [String: String] = [:]
    private let queue = DispatchQueue(label: "mcp.server.queue", qos: .userInitiated)

    init(logger: Logger = Logger(label: "mcp.swift.server")) {
        self.logger = logger
        initializeResources()
    }

    private func initializeResources() {
        resourceStorage["file://example.txt"] = "Swift MCP Server content"
        resourceStorage["file://config.json"] = #"{"platform": "Swift", "version": "1.0.0"}"#
        resourceStorage["file://data.plist"] = """
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>sample</key>
            <string>data</string>
        </dict>
        </plist>
        """
    }

    // MARK: - Resource Management

    func listResources() async throws -> [Resource] {
        logger.info("Listing \(resourceStorage.count) resources")

        return resourceStorage.keys.map { uri in
            Resource(
                uri: uri,
                name: URL(string: uri)?.lastPathComponent ?? uri,
                description: "Sample resource from Swift server",
                mimeType: determineMimeType(for: uri)
            )
        }
    }

    func readResource(uri: String) async throws -> ResourceContent {
        guard let content = resourceStorage[uri] else {
            throw MCPError.resourceNotFound("Resource not found: \(uri)")
        }

        logger.info("Reading resource: \(uri)")

        return ResourceContent(
            uri: uri,
            mimeType: determineMimeType(for: uri),
            text: content
        )
    }

    // MARK: - Tool Management

    func listTools() async throws -> [Tool] {
        return [
            Tool(
                name: "echo",
                description: "Echo back the input message",
                inputSchema: JSONSchema(
                    type: .object,
                    properties: [
                        "message": JSONSchema(
                            type: .string,
                            description: "Message to echo back"
                        )
                    ],
                    required: ["message"]
                )
            ),
            Tool(
                name: "calculate",
                description: "Perform mathematical calculations",
                inputSchema: JSONSchema(
                    type: .object,
                    properties: [
                        "expression": JSONSchema(
                            type: .string,
                            description: "Mathematical expression to evaluate"
                        ),
                        "precision": JSONSchema(
                            type: .number,
                            description: "Decimal precision for the result",
                            defaultValue: 2
                        )
                    ],
                    required: ["expression"]
                )
            ),
            Tool(
                name: "system-info",
                description: "Get system information",
                inputSchema: JSONSchema(
                    type: .object,
                    properties: [:],
                    required: []
                )
            )
        ]
    }

    func callTool(name: String, arguments: [String: Any]) async throws -> ToolResult {
        logger.info("Calling tool: \(name) with \(arguments.count) arguments")

        switch name {
        case "echo":
            return try await handleEcho(arguments: arguments)
        case "calculate":
            return try await handleCalculate(arguments: arguments)
        case "system-info":
            return try await handleSystemInfo()
        default:
            throw MCPError.toolNotFound("Unknown tool: \(name)")
        }
    }

    // MARK: - Tool Handlers

    private func handleEcho(arguments: [String: Any]) async throws -> ToolResult {
        guard let message = arguments["message"] as? String else {
            throw MCPError.invalidRequest("Message parameter is required")
        }

        return ToolResult(
            content: [
                TextContent(
                    type: "text",
                    text: "Echo: \(message)"
                )
            ]
        )
    }

    private func handleCalculate(arguments: [String: Any]) async throws -> ToolResult {
        guard let expression = arguments["expression"] as? String else {
            throw MCPError.invalidRequest("Expression parameter is required")
        }

        let precision = arguments["precision"] as? Int ?? 2

        do {
            // Simple expression evaluation using NSExpression
            let nsExpression = NSExpression(format: expression)
            guard let result = nsExpression.expressionValue(with: nil, context: nil) as? NSNumber else {
                throw MCPError.internalError("Failed to evaluate expression")
            }

            let formattedResult = String(format: "%.\(precision)f", result.doubleValue)

            return ToolResult(
                content: [
                    TextContent(
                        type: "text",
                        text: "Result: \(formattedResult)"
                    )
                ]
            )
        } catch {
            logger.error("Error calculating expression: \(error)")

            return ToolResult(
                content: [
                    TextContent(
                        type: "text",
                        text: "Error: \(error.localizedDescription)"
                    )
                ],
                isError: true
            )
        }
    }

    private func handleSystemInfo() async throws -> ToolResult {
        let processInfo = ProcessInfo.processInfo

        let systemInfo = """
        System Information:
        - OS: \(processInfo.operatingSystemVersionString)
        - Host: \(processInfo.hostName)
        - Process: \(processInfo.processName) (PID: \(processInfo.processIdentifier))
        - Memory: \(ByteCountFormatter.string(fromByteCount: Int64(processInfo.physicalMemory), countStyle: .memory))
        - Processors: \(processInfo.processorCount)
        - Uptime: \(String(format: "%.2f", processInfo.systemUptime)) seconds
        """

        return ToolResult(
            content: [
                TextContent(
                    type: "text",
                    text: systemInfo
                )
            ]
        )
    }

    // MARK: - Utilities

    private func determineMimeType(for uri: String) -> String {
        let url = URL(string: uri)
        let pathExtension = url?.pathExtension.lowercased() ?? ""

        switch pathExtension {
        case "json":
            return "application/json"
        case "txt", "md":
            return "text/plain"
        case "plist":
            return "application/x-plist"
        case "xml":
            return "application/xml"
        case "swift":
            return "text/x-swift"
        default:
            return "application/octet-stream"
        }
    }
}

// MARK: - Server Startup

@main
struct MCPServerApp {
    static func main() async {
        let logger = Logger(label: "mcp.swift.server.main")

        do {
            let serverHandler = SwiftMCPServer(logger: logger)

            let server = MCPServer(
                name: "swift-mcp-server",
                version: "1.0.0",
                capabilities: ServerCapabilities(
                    resources: ResourceCapabilities(
                        subscribe: true,
                        listChanged: true
                    ),
                    tools: ToolCapabilities(
                        listChanged: true
                    )
                ),
                handler: serverHandler
            )

            let transport = StdioTransport()

            logger.info("Starting Swift MCP Server...")
            try await server.start(transport: transport)

        } catch {
            logger.error("Server error: \(error)")
            exit(1)
        }
    }
}
```

### Client Implementation

```swift
import ModelContextProtocol
import Foundation
import Logging

final class SwiftMCPClient {
    private let client: MCPClient
    private let logger: Logger
    private var transport: StdioTransport?

    init(logger: Logger = Logger(label: "mcp.swift.client")) {
        self.logger = logger
        self.client = MCPClient(
            name: "swift-mcp-client",
            version: "1.0.0",
            capabilities: ClientCapabilities()
        )
    }

    func connect(serverCommand: String, arguments: [String] = []) async throws {
        transport = StdioTransport(command: serverCommand, arguments: arguments)
        try await client.connect(transport: transport!)
        logger.info("Connected to MCP server")
    }

    func listResources() async throws -> [Resource] {
        return try await client.listResources()
    }

    func readResource(uri: String) async throws -> ResourceContent {
        return try await client.readResource(uri: uri)
    }

    func listTools() async throws -> [Tool] {
        return try await client.listTools()
    }

    func callTool(name: String, arguments: [String: Any]) async throws -> ToolResult {
        return try await client.callTool(name: name, arguments: arguments)
    }

    func disconnect() async throws {
        try await client.disconnect()
        logger.info("Disconnected from MCP server")
    }
}

// Usage example
func clientExample() async throws {
    let client = SwiftMCPClient()

    do {
        try await client.connect(
            serverCommand: "swift",
            arguments: ["run", "MCPSwiftServer"]
        )

        // List resources
        let resources = try await client.listResources()
        print("Resources: \(resources.map(\.name).joined(separator: ", "))")

        // Read a resource
        if let firstResource = resources.first {
            let content = try await client.readResource(uri: firstResource.uri)
            print("Resource content: \(content.text?.prefix(100) ?? "No content")")
        }

        // List and call tools
        let tools = try await client.listTools()
        print("Available tools: \(tools.map(\.name).joined(separator: ", "))")

        // Call echo tool
        let echoResult = try await client.callTool(
            name: "echo",
            arguments: ["message": "Hello from Swift client!"]
        )
        print("Echo result: \(echoResult.content.first?.text ?? "No response")")

        // Call system info tool
        let systemResult = try await client.callTool(
            name: "system-info",
            arguments: [:]
        )
        print("System info: \(systemResult.content.first?.text ?? "No info")")

    } catch {
        print("Client error: \(error)")
    } finally {
        try? await client.disconnect()
    }
}
```

### Advanced Features with Actors

```swift
import Foundation

actor ResourceCache {
    private var cache: [String: CachedResource] = [:]
    private let maxSize: Int
    private let ttl: TimeInterval

    struct CachedResource {
        let content: String
        let timestamp: Date
        let accessCount: Int
    }

    init(maxSize: Int = 100, ttl: TimeInterval = 300) {
        self.maxSize = maxSize
        self.ttl = ttl
    }

    func get(_ key: String) -> String? {
        guard let cached = cache[key] else { return nil }

        // Check if expired
        if Date().timeIntervalSince(cached.timestamp) > ttl {
            cache.removeValue(forKey: key)
            return nil
        }

        // Update access count
        cache[key] = CachedResource(
            content: cached.content,
            timestamp: cached.timestamp,
            accessCount: cached.accessCount + 1
        )

        return cached.content
    }

    func set(_ key: String, value: String) {
        // Evict if at capacity
        if cache.count >= maxSize {
            evictLRU()
        }

        cache[key] = CachedResource(
            content: value,
            timestamp: Date(),
            accessCount: 1
        )
    }

    private func evictLRU() {
        guard let lruKey = cache.min(by: { $0.value.accessCount < $1.value.accessCount })?.key else {
            return
        }
        cache.removeValue(forKey: lruKey)
    }
}

// Enhanced server with caching
final class CachedSwiftMCPServer: MCPServerHandler {
    private let cache = ResourceCache()
    private let logger: Logger

    init(logger: Logger = Logger(label: "mcp.swift.cached")) {
        self.logger = logger
    }

    func readResource(uri: String) async throws -> ResourceContent {
        // Check cache first
        if let cachedContent = await cache.get(uri) {
            logger.info("Cache hit for resource: \(uri)")
            return ResourceContent(
                uri: uri,
                mimeType: determineMimeType(for: uri),
                text: cachedContent
            )
        }

        // Load from storage
        let content = try await loadResourceFromStorage(uri: uri)

        // Cache the result
        await cache.set(uri, value: content)

        return ResourceContent(
            uri: uri,
            mimeType: determineMimeType(for: uri),
            text: content
        )
    }

    private func loadResourceFromStorage(uri: String) async throws -> String {
        // Simulate async loading
        try await Task.sleep(nanoseconds: 100_000_000) // 100ms
        return "Loaded content for \(uri)"
    }
}
```

### Testing with Swift Testing

```swift
import Testing
import Foundation
@testable import MCPSwiftSDK

@Test("Server should list resources")
func testListResources() async throws {
    let server = SwiftMCPServer()
    let resources = try await server.listResources()

    #expect(!resources.isEmpty)
    #expect(resources.contains { $0.name == "example.txt" })
}

@Test("Echo tool should return echoed message")
func testEchoTool() async throws {
    let server = SwiftMCPServer()
    let result = try await server.callTool(
        name: "echo",
        arguments: ["message": "test message"]
    )

    #expect(result.isError == false)
    #expect(result.content.first?.text == "Echo: test message")
}

@Test("Calculate tool should perform arithmetic")
func testCalculateTool() async throws {
    let server = SwiftMCPServer()
    let result = try await server.callTool(
        name: "calculate",
        arguments: ["expression": "2 + 2", "precision": 0]
    )

    #expect(result.isError == false)
    #expect(result.content.first?.text?.contains("4") == true)
}

@Test("Resource not found should throw error")
func testResourceNotFound() async throws {
    let server = SwiftMCPServer()

    await #expect(throws: MCPError.self) {
        try await server.readResource(uri: "file://nonexistent.txt")
    }
}
```

### Vapor Integration

```swift
import Vapor
import ModelContextProtocol

func configure(_ app: Application) throws {
    let mcpHandler = SwiftMCPServer()

    let mcpServer = MCPServer(
        name: "vapor-mcp-server",
        version: "1.0.0",
        capabilities: ServerCapabilities(
            resources: ResourceCapabilities(subscribe: true),
            tools: ToolCapabilities(listChanged: true)
        ),
        handler: mcpHandler
    )

    // Start MCP server on WebSocket transport
    let wsTransport = WebSocketTransport(host: "localhost", port: 8080, path: "/mcp")

    Task {
        try await mcpServer.start(transport: wsTransport)
    }

    // Regular HTTP routes
    app.get("health") { req in
        return ["status": "running", "server": "vapor-mcp-server"]
    }
}

@main
enum Entrypoint {
    static func main() async throws {
        var env = try Environment.detect()
        try LoggingSystem.bootstrap(from: &env)

        let app = Application(env)
        defer { app.shutdown() }

        try configure(app)
        try await app.execute()
    }
}
```

This Swift SDK implementation provides modern, type-safe MCP applications with excellent performance, memory safety, and seamless Apple ecosystem integration.
