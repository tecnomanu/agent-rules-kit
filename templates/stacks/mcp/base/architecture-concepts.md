---
globs: ['<root>/**/*.{py,ts,js,java,kt,cs,swift}']
alwaysApply: false
---

# Model Context Protocol (MCP) Architecture Concepts

## Overview

The Model Context Protocol (MCP) is an open standard that enables AI applications to securely connect to data sources. It provides a standardized way for AI systems to access and interact with various data sources while maintaining security and control.

## Core Architecture

### MCP Client-Server Model

MCP uses a client-server architecture where:

-   **MCP Client**: AI applications (like Claude Desktop, IDEs) that need access to data
-   **MCP Server**: Applications that expose data and capabilities through the MCP protocol
-   **Transport Layer**: Communication mechanism (stdio, HTTP, WebSocket)

### Key Components

#### 1. Resources

Resources represent data that MCP servers can provide to clients:

-   File contents
-   Database records
-   API responses
-   Live data feeds
-   Any structured information

#### 2. Tools

Tools are functions that MCP servers expose to clients for taking actions:

-   API calls
-   Database operations
-   File system operations
-   External service integrations

#### 3. Prompts

Prompts are reusable templates that clients can retrieve and use:

-   Interactive templates
-   Context-aware prompts
-   Parameterized instructions

## Protocol Communication

### Message Types

1. **Requests**: Client-initiated messages requesting action
2. **Responses**: Server replies to client requests
3. **Notifications**: One-way messages (no response expected)

### Transport Methods

1. **Stdio Transport**: Communication through standard input/output
2. **HTTP Transport**: RESTful communication over HTTP
3. **WebSocket Transport**: Real-time bidirectional communication

## Security Model

### Capability Declaration

Servers declare their capabilities during initialization:

-   Resource access
-   Tool availability
-   Prompt templates

### Permission Management

-   Servers control what resources they expose
-   Clients control which servers they trust
-   Transport layer provides security boundaries

## Best Practices

### Server Design

1. **Single Responsibility**: Each server should focus on one domain
2. **Resource Efficiency**: Implement proper resource management
3. **Error Handling**: Provide clear error messages and recovery
4. **Documentation**: Comprehensive capability documentation

### Client Integration

1. **Server Discovery**: Implement robust server discovery mechanisms
2. **Capability Negotiation**: Handle server capabilities gracefully
3. **Error Recovery**: Implement retry and fallback strategies
4. **User Experience**: Provide clear feedback on MCP operations

### Data Management

1. **Schema Definition**: Use consistent data schemas
2. **Version Compatibility**: Handle protocol version differences
3. **Caching Strategy**: Implement appropriate caching for resources
4. **Data Validation**: Validate all incoming and outgoing data

## Architecture Patterns

### Microservices Pattern

-   Multiple specialized MCP servers
-   Each handling specific domains
-   Composed by MCP clients

### Gateway Pattern

-   Single MCP server aggregating multiple data sources
-   Unified interface for diverse backends
-   Centralized authentication and authorization

### Plugin Pattern

-   MCP servers as plugins to existing applications
-   Dynamic loading and unloading
-   Isolated execution environments

## SDK Selection Guidelines

Choose the appropriate SDK based on:

1. **Existing Infrastructure**: Match your current technology stack
2. **Performance Requirements**: Consider language-specific performance characteristics
3. **Team Expertise**: Leverage existing team knowledge
4. **Integration Needs**: Consider existing service integrations
5. **Ecosystem**: Evaluate available libraries and tools

## Project Structure

### Standard MCP Project Layout

```
{projectPath}/
├── src/
│   ├── server/          # MCP server implementation
│   ├── client/          # MCP client implementation (if needed)
│   ├── resources/       # Resource handlers
│   ├── tools/          # Tool implementations
│   └── prompts/        # Prompt templates
├── config/             # Configuration files
├── tests/              # Test files
└── docs/               # Documentation
```

## Integration Patterns

### AI Application Integration

-   Desktop applications (Claude Desktop)
-   Web applications
-   IDE extensions
-   Command-line tools

### Data Source Integration

-   Databases
-   File systems
-   APIs
-   Cloud services
-   Real-time data streams

This architecture provides a flexible foundation for building MCP-enabled applications that can securely and efficiently connect AI systems with data sources.
