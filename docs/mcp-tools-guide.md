# MCP Tools Integration Guide

This document explains how the Model Context Protocol (MCP) tools integration works in Agent Rules Kit v2.0+.

## Overview

Agent Rules Kit provides comprehensive support for MCP tools, allowing users to generate specialized rules for various MCP-enabled tools that enhance AI agent capabilities.

## What are MCP Tools?

Model Context Protocol (MCP) tools are standardized interfaces that allow AI assistants to securely connect to external data sources and services. These tools enable AI agents to:

-   Access file systems securely
-   Query databases and APIs
-   Manage version control systems
-   Interact with cloud services
-   Maintain persistent memory across sessions

## Available MCP Tools

Agent Rules Kit currently supports rules generation for these MCP tools:

### Core Tools

| Tool         | Name                               | Description                                                                  |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| `pampa`      | **PAMPA - Semantic Code Search**   | AI-powered semantic code search and project memory system                    |
| `github`     | **GitHub - Repository Management** | Secure access to GitHub repositories for file operations and API integration |
| `memory`     | **Memory - Persistent Knowledge**  | Persistent knowledge storage and retrieval across sessions                   |
| `filesystem` | **Filesystem - File Operations**   | Secure file operations with configurable access controls                     |
| `git`        | **Git - Version Control**          | Repository operations, commit history analysis, and version control          |

## How MCP Tools Work in Agent Rules Kit

### 1. Selection Process

During CLI execution, users can choose to install MCP tools rules:

```bash
npx agent-rules-kit
# ... stack selection ...
? Do you want to install MCP (Model Context Protocol) tools rules? (y/N)
```

### 2. Multi-Select Interface

Users can select multiple MCP tools simultaneously:

```
? Select MCP tools to install rules for: (Use space to select, enter to confirm)
❯◉ PAMPA - Semantic Code Search - AI-powered semantic code search and project memory system
 ◯ GitHub - Repository Management - Secure access to GitHub repositories for file operations
 ◯ Memory - Persistent Knowledge - Persistent knowledge storage and retrieval across sessions
 ◯ Filesystem - File Operations - Secure file operations with configurable access controls
 ◯ Git - Version Control - Repository operations, commit history analysis, and version control
```

### 3. Rule Generation

Selected tools generate rules in the following structure:

```
.cursor/rules/rules-kit/
└── mcp-tools/
    ├── pampa/
    │   ├── pampa-mcp-usage.mdc
    │   └── pampa-best-practices.mdc
    ├── github/
    │   ├── github-mcp-usage.mdc
    │   └── github-workflow.mdc
    └── memory/
        ├── memory-mcp-usage.mdc
        └── memory-patterns.mdc
```

## Technical Implementation

### McpService Architecture

The MCP tools functionality is implemented through the `McpService` class:

```javascript
// Key methods
getAvailableMcpTools(); // Retrieves available tools from configuration
copyMcpToolsRules(); // Copies selected tool rules with batching
countMcpToolsRules(); // Counts files to be generated
validateMcpTools(); // Validates selected tools
```

### Configuration Structure

MCP tools are defined in `templates/kit-config.json`:

```json
{
	"mcp_tools": {
		"pampa": {
			"name": "PAMPA - Semantic Code Search",
			"description": "AI-powered semantic code search and project memory system"
		},
		"github": {
			"name": "GitHub - Repository Management",
			"description": "Secure access to GitHub repositories for file operations"
		}
	}
}
```

### Template Organization

MCP tool templates are organized as:

```
templates/mcp-tools/
├── pampa/
│   ├── pampa-mcp-usage.md
│   └── pampa-best-practices.md
├── github/
│   ├── github-mcp-usage.md
│   └── github-workflow.md
└── memory/
    ├── memory-mcp-usage.md
    └── memory-patterns.md
```

## Adding New MCP Tools

### 1. Create Template Directory

```bash
mkdir -p templates/mcp-tools/your-tool
```

### 2. Add Tool Rules

Create markdown files with MCP tool guidance:

```markdown
---
globs: ['<root>/**/*']
alwaysApply: false
---

# Your Tool MCP Usage Rules

## Basic Instructions

1. **ALWAYS at the start:**

    - Initialize the tool properly
    - Check permissions and access

2. **DURING usage:**
    - Follow security best practices
    - Use appropriate error handling

## Available Functions

-   `your_tool_function()` - Description
-   `your_tool_action()` - Description

## Common Patterns

Provide typical usage workflows...
```

### 3. Register in Configuration

Add to `templates/kit-config.json`:

```json
{
	"mcp_tools": {
		"your-tool": {
			"name": "Your Tool - Short Description",
			"description": "Detailed description of functionality"
		}
	}
}
```

### 4. Test Integration

```bash
pnpm run test
pnpm run start
# Select your new tool and verify rule generation
```

## Best Practices for MCP Tool Rules

### Rule Content Guidelines

1. **Clear Instructions**: Provide step-by-step guidance
2. **Security Focus**: Emphasize secure usage patterns
3. **Error Handling**: Include common error scenarios
4. **Examples**: Provide practical usage examples
5. **Workflow Patterns**: Document common task flows

### Template Structure

Each MCP tool should include:

-   **Usage rules**: Primary tool interaction guidelines
-   **Best practices**: Security and performance recommendations
-   **Workflow examples**: Common usage patterns
-   **Error handling**: Troubleshooting guidance

### Documentation Standards

-   Use clear, actionable language
-   Include code examples where appropriate
-   Focus on practical AI agent usage
-   Emphasize security and best practices
-   Provide context for tool selection

## Performance Considerations

### Batch Processing

The McpService implements batch processing for efficiency:

```javascript
// Process files in batches of 10
const batchSize = 10;
for (let i = 0; i < mdFiles.length; i += batchSize) {
	const batch = mdFiles.slice(i, i + batchSize);
	await Promise.all(
		batch.map(async (file) => {
			// Process file...
		})
	);
}
```

### Memory Management

-   Files are processed asynchronously
-   Batch processing prevents memory overload
-   Progress tracking provides user feedback

## Troubleshooting

### Common Issues

1. **Tool not appearing**: Check `kit-config.json` registration
2. **Rules not generated**: Verify template directory structure
3. **Validation errors**: Ensure tool keys match configuration

### Debug Mode

Enable debug output for troubleshooting:

```bash
npx agent-rules-kit --debug
```

## Integration with Stack Rules

MCP tools rules are generated independently of stack rules, allowing for:

-   **Flexible combinations**: Any stack + any MCP tools
-   **Modular architecture**: Independent rule sets
-   **Clean separation**: Stack rules vs. tool rules

## Future Enhancements

Planned improvements for MCP tools integration:

1. **Dynamic tool discovery**: Auto-detect available MCP tools
2. **Custom tool configuration**: User-defined tool parameters
3. **Tool validation**: Verify tool availability and access
4. **Advanced workflows**: Multi-tool coordination patterns
5. **Integration guides**: Stack-specific MCP tool recommendations

## Contributing

See the [Contributing Guide](../CONTRIBUTING.md#mcp-tools-development) for details on:

-   Adding new MCP tools
-   Improving existing tool rules
-   Testing MCP tool integration
-   Documentation standards
