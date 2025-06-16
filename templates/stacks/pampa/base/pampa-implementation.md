---
globs: <root>/**/*
alwaysApply: false
---

# Pampa Implementation Guide

## Installation & Setup

### Quick Start

Pampa is designed to be simple - just install and start using it immediately.

```bash
# Install Pampa globally
npm install -g pampa

# Or use directly with npx
npx pampa index
```

### Project Setup

Initialize Pampa in your project:

```bash
# Navigate to your project root
cd your-project

# Index your codebase (this creates .pampa/ directory)
pampa index

# Start searching
pampa search "authentication function"
```

### Configuration (Optional)

Pampa works out of the box, but you can customize it with a `pampa.yml` file:

```yaml
# pampa.yml (optional)
provider: auto # auto, openai, transformers, ollama, cohere
exclude:
    - node_modules/
    - .git/
    - dist/
    - build/
include:
    - '**/*.py'
    - '**/*.ts'
    - '**/*.js'
    - '**/*.java'
    - '**/*.go'
    - '**/*.php'
    - '**/*.rb'
    - '**/*.cpp'
    - '**/*.c'
    - '**/*.h'
```

## Core Commands

### Indexing

```bash
# Index the entire project
pampa index

# Index with specific provider
pampa index --provider openai

# Update existing index
pampa update

# Check index statistics
pampa stats
```

### Searching

```bash
# Basic semantic search
pampa search "user authentication"

# Search with limit
pampa search "database connection" --limit 5

# Search in specific language
pampa search "error handling" --language python
```

### MCP Integration

Pampa provides built-in MCP server functionality:

```bash
# Start MCP server
pampa mcp-server

# Start with custom port
pampa mcp-server --port 8080

# Start with specific provider
pampa mcp-server --provider openai
```

## AI Agent Usage Patterns

### Finding Code Examples

```bash
# Find authentication implementations
pampa search "user login authentication"

# Find database queries
pampa search "SELECT query with JOIN"

# Find error handling patterns
pampa search "try catch exception handling"
```

### Understanding Code Structure

```bash
# Find main entry points
pampa search "main function application start"

# Find configuration files
pampa search "config settings environment"

# Find API endpoints
pampa search "REST API routes endpoints"
```

### Pattern Discovery

```bash
# Find design patterns
pampa search "factory pattern implementation"

# Find architectural patterns
pampa search "MVC controller pattern"

# Find testing patterns
pampa search "unit test mock examples"
```

## API Usage (For MCP Integration)

### Search Code

```javascript
// Using Pampa MCP client
const results = await client.callTool('pampa_search_code', {
	query: 'authentication function',
	limit: 10,
});
```

### Get Code Chunk

```javascript
// Get specific code chunk by SHA
const chunk = await client.callTool('pampa_get_code_chunk', {
	sha: 'abc123...',
});
```

### Project Statistics

```javascript
// Get project indexing stats
const stats = await client.callTool('pampa_get_project_stats', {
	path: '.',
});
```

## Best Practices for AI Agents

### Effective Query Strategies

1. **Be Specific**: Use concrete terms about functionality

    - Good: "JWT token validation function"
    - Avoid: "auth stuff"

2. **Include Context**: Mention the technology or pattern

    - Good: "React useState hook examples"
    - Avoid: "state management"

3. **Use Intent-Based Queries**: Describe what you want to accomplish
    - Good: "validate email address format"
    - Avoid: "email function"

### Search Refinement

```bash
# Start broad, then narrow down
pampa search "database"                    # Too broad
pampa search "database connection"         # Better
pampa search "PostgreSQL connection pool"  # Most specific
```

### Code Understanding Workflow

1. **Overview**: Search for main concepts first
2. **Details**: Drill down into specific implementations
3. **Context**: Find related code and dependencies
4. **Examples**: Look for usage patterns and tests

## Integration with Development Tools

### IDE Integration

Pampa works well with:

-   VS Code (via MCP)
-   Cursor (native support)
-   Any editor with MCP support

### CI/CD Integration

```yaml
# .github/workflows/pampa-index.yml
name: Update Pampa Index
on:
    push:
        branches: [main]
jobs:
    index:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Install Pampa
              run: npm install -g pampa
            - name: Update Index
              run: pampa update
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18
RUN npm install -g pampa
COPY . /app
WORKDIR /app
RUN pampa index
```

## Troubleshooting

### Common Issues

1. **Slow Indexing**: Large codebases may take time on first index

    - Solution: Use `.pampaignore` to exclude unnecessary files

2. **Memory Usage**: High memory usage with large projects

    - Solution: Index incrementally or use smaller chunks

3. **No Results**: Search returns empty results
    - Solution: Ensure project is indexed, try broader queries

### Performance Optimization

```bash
# Check index size and status
pampa stats

# Re-index if corruption suspected
rm -rf .pampa/
pampa index

# Update index incrementally
pampa update
```

## Advanced Usage

### Custom Providers

Configure different embedding providers:

```yaml
# pampa.yml
provider: openai
openai:
    api_key: your-api-key
    model: text-embedding-3-small
```

### Batch Operations

```bash
# Search multiple queries
pampa search "auth" "database" "validation" --batch

# Export search results
pampa search "API endpoints" --output results.json
```

This implementation guide provides everything needed to effectively use Pampa for semantic code search and AI agent integration.
