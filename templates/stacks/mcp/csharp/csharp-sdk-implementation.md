---
globs: ['<root>/**/*.cs', '<root>/*.csproj', '<root>/*.sln']
alwaysApply: false
---

# MCP C# SDK Implementation Guide

## C# SDK Features

The C# SDK provides robust, enterprise-grade MCP implementations with strong typing, async/await patterns, and excellent .NET ecosystem integration.

### Project Configuration

```xml
<!-- MyMCPServer.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <OutputType>Exe</OutputType>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="ModelContextProtocol.SDK" Version="1.0.0" />
    <PackageReference Include="Microsoft.Extensions.Hosting" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />
    <PackageReference Include="System.Text.Json" Version="8.0.0" />

    <!-- Testing -->
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.4.2" />
    <PackageReference Include="Moq" Version="4.20.69" />
  </ItemGroup>
</Project>
```

### Basic Server Implementation

```csharp
using ModelContextProtocol.SDK.Server;
using ModelContextProtocol.SDK.Types;
using System.Text.Json;

public class CSharpMCPServer : IMCPServerHandler
{
    private readonly Dictionary<string, string> _resourceStorage = new();
    private readonly ILogger<CSharpMCPServer> _logger;

    public CSharpMCPServer(ILogger<CSharpMCPServer> logger)
    {
        _logger = logger;
        InitializeResources();
    }

    private void InitializeResources()
    {
        _resourceStorage["file://example.txt"] = "C# MCP Server content";
        _resourceStorage["file://config.json"] = JsonSerializer.Serialize(new { Setting = "Value" });
    }

    public async Task<IEnumerable<Resource>> ListResourcesAsync()
    {
        _logger.LogInformation("Listing {Count} resources", _resourceStorage.Count);

        return _resourceStorage.Keys.Select(uri => new Resource
        {
            Uri = uri,
            Name = Path.GetFileName(uri),
            Description = "Sample resource from C# server",
            MimeType = DetermineMimeType(uri)
        });
    }

    public async Task<ResourceContent> ReadResourceAsync(string uri)
    {
        if (!_resourceStorage.TryGetValue(uri, out var content))
        {
            throw new ResourceNotFoundException($"Resource not found: {uri}");
        }

        _logger.LogInformation("Reading resource: {Uri}", uri);

        return new ResourceContent
        {
            Uri = uri,
            MimeType = DetermineMimeType(uri),
            Text = content
        };
    }

    public async Task<IEnumerable<Tool>> ListToolsAsync()
    {
        return new[]
        {
            new Tool
            {
                Name = "echo",
                Description = "Echo back the input message",
                InputSchema = new JsonSchema
                {
                    Type = "object",
                    Properties = new Dictionary<string, JsonSchema>
                    {
                        ["message"] = new JsonSchema { Type = "string", Description = "Message to echo" }
                    },
                    Required = new[] { "message" }
                }
            },
            new Tool
            {
                Name = "calculate",
                Description = "Perform mathematical calculations",
                InputSchema = new JsonSchema
                {
                    Type = "object",
                    Properties = new Dictionary<string, JsonSchema>
                    {
                        ["expression"] = new JsonSchema { Type = "string", Description = "Math expression" },
                        ["precision"] = new JsonSchema { Type = "number", Description = "Decimal precision", Default = 2 }
                    },
                    Required = new[] { "expression" }
                }
            }
        };
    }

    public async Task<ToolResult> CallToolAsync(string name, Dictionary<string, object> arguments)
    {
        _logger.LogInformation("Calling tool: {ToolName} with {ArgCount} arguments", name, arguments.Count);

        return name switch
        {
            "echo" => await HandleEchoAsync(arguments),
            "calculate" => await HandleCalculateAsync(arguments),
            _ => throw new ToolNotFoundException($"Unknown tool: {name}")
        };
    }

    private async Task<ToolResult> HandleEchoAsync(Dictionary<string, object> arguments)
    {
        if (!arguments.TryGetValue("message", out var messageObj) || messageObj is not string message)
        {
            throw new ArgumentException("Message parameter is required");
        }

        return new ToolResult
        {
            Content = new[]
            {
                new TextContent
                {
                    Type = "text",
                    Text = $"Echo: {message}"
                }
            }
        };
    }

    private async Task<ToolResult> HandleCalculateAsync(Dictionary<string, object> arguments)
    {
        try
        {
            if (!arguments.TryGetValue("expression", out var exprObj) || exprObj is not string expression)
            {
                throw new ArgumentException("Expression parameter is required");
            }

            var precision = arguments.TryGetValue("precision", out var precObj) && precObj is JsonElement precElement
                ? precElement.GetInt32() : 2;

            // Simple expression evaluation (use a proper library in production)
            var result = EvaluateExpression(expression);
            var formattedResult = Math.Round(result, precision);

            return new ToolResult
            {
                Content = new[]
                {
                    new TextContent
                    {
                        Type = "text",
                        Text = $"Result: {formattedResult}"
                    }
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating expression");

            return new ToolResult
            {
                Content = new[]
                {
                    new TextContent
                    {
                        Type = "text",
                        Text = $"Error: {ex.Message}"
                    }
                },
                IsError = true
            };
        }
    }

    private static string DetermineMimeType(string uri) => uri switch
    {
        var u when u.EndsWith(".json") => "application/json",
        var u when u.EndsWith(".txt") => "text/plain",
        var u when u.EndsWith(".xml") => "application/xml",
        _ => "application/octet-stream"
    };

    private static double EvaluateExpression(string expression)
    {
        // Simplified expression evaluator - use a proper library like NCalc in production
        return double.Parse(expression);
    }
}

// Program.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ModelContextProtocol.SDK.Server;
using ModelContextProtocol.SDK.Transport;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddLogging();
builder.Services.AddSingleton<CSharpMCPServer>();
builder.Services.AddSingleton<IMCPServer>(provider =>
{
    var handler = provider.GetRequiredService<CSharpMCPServer>();
    var logger = provider.GetRequiredService<ILogger<MCPServer>>();

    return new MCPServer(
        name: "csharp-mcp-server",
        version: "1.0.0",
        capabilities: new ServerCapabilities
        {
            Resources = new ResourceCapabilities { Subscribe = true, ListChanged = true },
            Tools = new ToolCapabilities { ListChanged = true }
        },
        handler: handler,
        logger: logger
    );
});

var host = builder.Build();

var server = host.Services.GetRequiredService<IMCPServer>();
var transport = new StdioTransport();

await server.StartAsync(transport);

Console.WriteLine("C# MCP Server started");
await host.WaitForShutdownAsync();
```

### Client Implementation

```csharp
using ModelContextProtocol.SDK.Client;
using ModelContextProtocol.SDK.Types;
using ModelContextProtocol.SDK.Transport;

public class CSharpMCPClient : IDisposable
{
    private readonly MCPClient _client;
    private StdioTransport? _transport;

    public CSharpMCPClient()
    {
        _client = new MCPClient(
            name: "csharp-mcp-client",
            version: "1.0.0",
            capabilities: new ClientCapabilities()
        );
    }

    public async Task ConnectAsync(string serverCommand, params string[] args)
    {
        _transport = new StdioTransport(serverCommand, args);
        await _client.ConnectAsync(_transport);
    }

    public async Task<IEnumerable<Resource>> ListResourcesAsync()
        => await _client.ListResourcesAsync();

    public async Task<ResourceContent> ReadResourceAsync(string uri)
        => await _client.ReadResourceAsync(uri);

    public async Task<IEnumerable<Tool>> ListToolsAsync()
        => await _client.ListToolsAsync();

    public async Task<ToolResult> CallToolAsync(string name, Dictionary<string, object> arguments)
        => await _client.CallToolAsync(name, arguments);

    public async Task DisconnectAsync()
    {
        if (_client != null)
            await _client.DisconnectAsync();
    }

    public void Dispose()
    {
        _transport?.Dispose();
        _client?.Dispose();
    }
}

// Usage example
public static async Task Main(string[] args)
{
    using var client = new CSharpMCPClient();

    try
    {
        await client.ConnectAsync("dotnet", "run", "--project", "Server");

        // List resources
        var resources = await client.ListResourcesAsync();
        Console.WriteLine($"Resources: {string.Join(", ", resources.Select(r => r.Name))}");

        // Call tools
        var echoResult = await client.CallToolAsync("echo",
            new Dictionary<string, object> { ["message"] = "Hello from C#!" });

        Console.WriteLine($"Echo result: {echoResult.Content.First().Text}");

    }
    finally
    {
        await client.DisconnectAsync();
    }
}
```

### ASP.NET Core Integration

```csharp
using Microsoft.AspNetCore.Mvc;
using ModelContextProtocol.SDK.Server;
using ModelContextProtocol.SDK.Transport;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<CSharpMCPServer>();
builder.Services.AddSingleton<IMCPServer>(provider =>
{
    var handler = provider.GetRequiredService<CSharpMCPServer>();
    return new MCPServer("aspnet-mcp-server", "1.0.0", new ServerCapabilities(), handler);
});

var app = builder.Build();

app.MapControllers();

// Start MCP server on HTTP transport
var mcpServer = app.Services.GetRequiredService<IMCPServer>();
var httpTransport = new HttpTransport(port: 8080, path: "/mcp");
_ = Task.Run(() => mcpServer.StartAsync(httpTransport));

app.Run();

[ApiController]
[Route("api/[controller]")]
public class MCPController : ControllerBase
{
    private readonly IMCPServer _mcpServer;

    public MCPController(IMCPServer mcpServer)
    {
        _mcpServer = mcpServer;
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        return Ok(new { Status = "Running", Server = _mcpServer.Name });
    }
}
```

### Testing with xUnit

```csharp
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class CSharpMCPServerTests
{
    private readonly CSharpMCPServer _server;
    private readonly Mock<ILogger<CSharpMCPServer>> _loggerMock;

    public CSharpMCPServerTests()
    {
        _loggerMock = new Mock<ILogger<CSharpMCPServer>>();
        _server = new CSharpMCPServer(_loggerMock.Object);
    }

    [Fact]
    public async Task ListResourcesAsync_ShouldReturnResources()
    {
        // Act
        var resources = await _server.ListResourcesAsync();

        // Assert
        Assert.NotEmpty(resources);
        Assert.Contains(resources, r => r.Name == "example.txt");
    }

    [Fact]
    public async Task CallToolAsync_Echo_ShouldReturnEchoedMessage()
    {
        // Arrange
        var arguments = new Dictionary<string, object> { ["message"] = "test message" };

        // Act
        var result = await _server.CallToolAsync("echo", arguments);

        // Assert
        Assert.False(result.IsError);
        Assert.Equal("Echo: test message", result.Content.First().Text);
    }

    [Fact]
    public async Task ReadResourceAsync_NonExistentResource_ShouldThrowException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ResourceNotFoundException>(
            () => _server.ReadResourceAsync("file://nonexistent.txt"));
    }
}
```

### Performance Optimization

```csharp
using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;

public class OptimizedCSharpMCPServer : IMCPServerHandler
{
    private readonly IMemoryCache _cache;
    private readonly SemaphoreSlim _semaphore;
    private readonly ConcurrentDictionary<string, Task<string>> _loadingTasks;

    public OptimizedCSharpMCPServer(IMemoryCache cache)
    {
        _cache = cache;
        _semaphore = new SemaphoreSlim(10, 10); // Limit concurrent operations
        _loadingTasks = new ConcurrentDictionary<string, Task<string>>();
    }

    public async Task<ResourceContent> ReadResourceAsync(string uri)
    {
        // Check cache first
        if (_cache.TryGetValue(uri, out string? cachedContent))
        {
            return new ResourceContent { Uri = uri, Text = cachedContent };
        }

        // Prevent duplicate loading
        var loadingTask = _loadingTasks.GetOrAdd(uri, async key =>
        {
            await _semaphore.WaitAsync();
            try
            {
                var content = await LoadResourceFromStorageAsync(key);

                // Cache with expiration
                _cache.Set(key, content, TimeSpan.FromMinutes(5));

                return content;
            }
            finally
            {
                _semaphore.Release();
                _loadingTasks.TryRemove(key, out _);
            }
        });

        var result = await loadingTask;

        return new ResourceContent
        {
            Uri = uri,
            Text = result,
            MimeType = DetermineMimeType(uri)
        };
    }

    private async Task<string> LoadResourceFromStorageAsync(string uri)
    {
        // Simulate expensive I/O operation
        await Task.Delay(100);
        return $"Loaded content for {uri}";
    }
}
```

This C# SDK implementation provides enterprise-grade patterns with strong typing, dependency injection, and comprehensive error handling for building robust MCP applications in the .NET ecosystem.
