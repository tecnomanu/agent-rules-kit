---
globs: <root>/**/*.py,<root>/pyproject.toml,<root>/requirements.txt
alwaysApply: false
---

# MCP Python SDK Implementation Guide

## Python SDK Features

The Python SDK provides comprehensive support for building MCP servers and clients with Python's async/await patterns and rich ecosystem.

### Installation and Setup

```python
# pyproject.toml
[project]
name = "my-mcp-server"
version = "0.1.0"
dependencies = [
    "mcp>=1.9.0",
    "pydantic>=2.0.0",
    "asyncio",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "mypy>=1.0.0",
]
```

### Basic Server Implementation

```python
import asyncio
from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

# Create server instance
server = Server("my-mcp-server")

@server.list_resources()
async def handle_list_resources() -> list[types.Resource]:
    """List available resources."""
    return [
        types.Resource(
            uri="file://example.txt",
            name="Example File",
            description="An example text file",
            mimeType="text/plain"
        )
    ]

@server.read_resource()
async def handle_read_resource(uri: str) -> str:
    """Read a specific resource."""
    if uri == "file://example.txt":
        return "This is example content"
    else:
        raise ValueError(f"Unknown resource: {uri}")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available tools."""
    return [
        types.Tool(
            name="echo",
            description="Echo back the input",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                },
                "required": ["message"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """Execute a tool."""
    if name == "echo":
        message = arguments.get("message", "")
        return [types.TextContent(type="text", text=f"Echo: {message}")]
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    """Main server entry point."""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="my-mcp-server",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=mcp.server.NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### Advanced Server Features

#### Server Lifecycle Management

```python
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from mcp.server import Server

@asynccontextmanager
async def server_lifespan(server: Server) -> AsyncIterator[dict]:
    """Manage server startup and shutdown lifecycle."""
    # Initialize resources on startup
    db = await Database.connect()
    cache = RedisCache()
    await cache.connect()

    try:
        yield {"db": db, "cache": cache}
    finally:
        # Clean up on shutdown
        await db.disconnect()
        await cache.disconnect()

# Pass lifespan to server
server = Server("example-server", lifespan=server_lifespan)

@server.call_tool()
async def query_db(name: str, arguments: dict) -> list[types.TextContent]:
    ctx = server.request_context
    db = ctx.lifespan_context["db"]

    result = await db.query(arguments["query"])
    return [types.TextContent(type="text", text=str(result))]
```

#### Type Safety with Pydantic

```python
from pydantic import BaseModel, ValidationError
from typing import Optional

class DatabaseQuery(BaseModel):
    table: str
    where: Optional[dict] = None
    limit: Optional[int] = 100

class QueryResult(BaseModel):
    rows: list[dict]
    count: int
    execution_time: float

@server.call_tool()
async def structured_query(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        query = DatabaseQuery(**arguments)

        # Execute query with validated parameters
        result = await execute_query(query)

        return [types.TextContent(
            type="text",
            text=f"Found {result.count} rows in {result.execution_time}s"
        )]
    except ValidationError as e:
        raise ValueError(f"Invalid query parameters: {e}")
```

### Client Implementation

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio

async def main():
    """Example MCP client implementation."""
    server_params = StdioServerParameters(
        command="python",
        args=["my_server.py"],
        env=None,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()

            # List and use resources
            resources = await session.list_resources()
            for resource in resources:
                content, mime_type = await session.read_resource(resource.uri)
                print(f"Resource {resource.name}: {content[:100]}...")

            # List and call tools
            tools = await session.list_tools()
            for tool in tools:
                if tool.name == "echo":
                    result = await session.call_tool("echo", {"message": "Hello!"})
                    print(f"Tool result: {result}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Error Handling Patterns

```python
import logging
from mcp.types import McpError, ErrorCode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPErrorHandler:
    @staticmethod
    def handle_resource_error(uri: str, error: Exception) -> McpError:
        if isinstance(error, FileNotFoundError):
            return McpError(
                code=ErrorCode.METHOD_NOT_FOUND,
                message=f"Resource not found: {uri}"
            )
        elif isinstance(error, PermissionError):
            return McpError(
                code=ErrorCode.INVALID_REQUEST,
                message=f"Access denied: {uri}"
            )
        else:
            logger.error(f"Unexpected error accessing {uri}: {error}")
            return McpError(
                code=ErrorCode.INTERNAL_ERROR,
                message="Internal server error"
            )

@server.read_resource()
async def safe_read_resource(uri: str) -> str:
    try:
        return await read_resource_impl(uri)
    except Exception as e:
        error = MCPErrorHandler.handle_resource_error(uri, e)
        raise error
```

### Testing with pytest

```python
import pytest
import asyncio
from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.types as types

@pytest.fixture
async def server():
    """Create a test server instance."""
    server = Server("test-server")

    @server.list_resources()
    async def handle_list_resources():
        return [types.Resource(
            uri="test://resource",
            name="Test Resource"
        )]

    return server

@pytest.mark.asyncio
async def test_list_resources(server):
    """Test resource listing."""
    resources = await server.list_resources()
    assert len(resources) == 1
    assert resources[0].uri == "test://resource"

@pytest.mark.asyncio
async def test_tool_execution(server):
    """Test tool execution."""
    @server.call_tool()
    async def handle_call_tool(name: str, arguments: dict):
        if name == "test_tool":
            return [types.TextContent(type="text", text="success")]
        raise ValueError(f"Unknown tool: {name}")

    result = await server.call_tool("test_tool", {})
    assert result[0].text == "success"
```

### Performance Optimization

#### Async Context Managers

```python
import asyncio
import aiofiles
from contextlib import asynccontextmanager

class ResourceManager:
    def __init__(self):
        self.connections = {}
        self.locks = {}

    @asynccontextmanager
    async def get_connection(self, uri: str):
        """Get a connection with proper resource management."""
        if uri not in self.locks:
            self.locks[uri] = asyncio.Lock()

        async with self.locks[uri]:
            if uri not in self.connections:
                self.connections[uri] = await self.create_connection(uri)

            try:
                yield self.connections[uri]
            finally:
                # Connection cleanup handled by pool
                pass

    async def create_connection(self, uri: str):
        """Create a new connection."""
        # Implementation depends on resource type
        pass
```

#### Caching with TTL

```python
import time
from typing import Any, Optional
import asyncio

class TTLCache:
    def __init__(self, default_ttl: int = 300):
        self.cache = {}
        self.timestamps = {}
        self.default_ttl = default_ttl
        self.lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self.lock:
            if key in self.cache:
                if time.time() - self.timestamps[key] < self.default_ttl:
                    return self.cache[key]
                else:
                    del self.cache[key]
                    del self.timestamps[key]
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        async with self.lock:
            self.cache[key] = value
            self.timestamps[key] = time.time()

# Usage in server
cache = TTLCache()

@server.read_resource()
async def cached_read_resource(uri: str) -> str:
    cached = await cache.get(uri)
    if cached:
        return cached

    content = await expensive_resource_read(uri)
    await cache.set(uri, content)
    return content
```

### Production Deployment

#### Environment Configuration

```python
import os
from pydantic import BaseSettings

class ServerConfig(BaseSettings):
    server_name: str = "mcp-server"
    server_version: str = "1.0.0"
    log_level: str = "INFO"
    max_connections: int = 100
    resource_cache_ttl: int = 300

    class Config:
        env_prefix = "MCP_"
        env_file = ".env"

config = ServerConfig()

# Use in server setup
server = Server(config.server_name)
```

#### Monitoring and Logging

```python
import structlog
from prometheus_client import Counter, Histogram, start_http_server

# Structured logging
logger = structlog.get_logger()

# Metrics
REQUEST_COUNT = Counter('mcp_requests_total', 'Total requests', ['method', 'status'])
REQUEST_DURATION = Histogram('mcp_request_duration_seconds', 'Request duration')

@server.call_tool()
async def monitored_tool(name: str, arguments: dict):
    start_time = time.time()
    try:
        result = await tool_implementation(name, arguments)
        REQUEST_COUNT.labels(method=name, status='success').inc()
        return result
    except Exception as e:
        REQUEST_COUNT.labels(method=name, status='error').inc()
        logger.error("Tool execution failed", tool=name, error=str(e))
        raise
    finally:
        REQUEST_DURATION.observe(time.time() - start_time)

# Start metrics server
start_http_server(8000)
```

This Python SDK implementation guide provides comprehensive patterns for building production-ready MCP servers and clients with Python's powerful async ecosystem.
