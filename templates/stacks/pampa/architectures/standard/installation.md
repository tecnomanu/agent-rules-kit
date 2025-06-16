---
globs: <root>/**/*
alwaysApply: false
---

# Pampa Standard Installation

## Quick Installation

Pampa is designed to be simple - no complex setup, no version questions, just install and use.

### Step 1: Install Pampa

```bash
# Global installation (recommended)
npm install -g pampa
```

### Step 2: Index Your Project

```bash
# Navigate to your project root and index
cd your-project
pampa index
```

That's it! Pampa is now ready to use.

## Basic Usage

### Search Your Code

```bash
# Basic semantic search
pampa search "authentication function"

# Search with results limit
pampa search "database connection" --limit 5
```

### MCP Server Mode

```bash
# Start Pampa as MCP server
pampa mcp-server
```

## Project Structure

After installation, Pampa creates:

```
your-project/
├── .pampa/              # Pampa index (auto-created)
│   ├── chunks/          # Code chunks database
│   ├── embeddings.db    # Semantic embeddings
│   └── metadata.json    # Project metadata
├── pampa.yml           # Optional configuration
└── .pampaignore        # Optional ignore file
```

## Configuration (Optional)

Pampa works without configuration, but you can customize it:

```yaml
# pampa.yml (optional)
provider: auto # auto, openai, transformers, ollama, cohere
exclude:
    - node_modules/
    - .git/
    - dist/
    - build/
    - '*.log'
```

## Ignore Files (Optional)

Create `.pampaignore` to exclude specific files:

```
# .pampaignore
node_modules/
*.log
*.tmp
.env*
dist/
build/
coverage/
```

## Verification

Verify installation works:

```bash
# Check Pampa version
pampa --version

# Check project stats
pampa stats

# Test search
pampa search "main function"
```

## No Version Management

Pampa is designed to work with any codebase without version-specific configurations:

-   ✅ Works with any programming language
-   ✅ Automatically detects file types
-   ✅ No framework-specific setup required
-   ✅ Universal semantic understanding

## Integration with AI Agents

Once installed, AI agents can use Pampa through MCP:

```javascript
// AI agents can immediately use these tools:
// - pampa_search_code
// - pampa_get_code_chunk
// - pampa_get_project_stats
// - pampa_index_project
// - pampa_update_project
```

## Maintenance

### Update Index

```bash
# Update when code changes
pampa update
```

### Re-index Completely

```bash
# If you need to rebuild the index
rm -rf .pampa/
pampa index
```

### Performance Monitoring

```bash
# Check index statistics
pampa stats

# Output example:
# Files indexed: 1,234
# Code chunks: 5,678
# Index size: 15.2 MB
# Last updated: 2024-01-15 10:30:00
```

This simple setup ensures Pampa works immediately without complex configuration or version-specific questions.
