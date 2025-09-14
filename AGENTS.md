# Agent Setup Guide

This document explains how an AI agent can install the rules provided by **Agent Rules Kit** automatically.

## Project Overview

Agent Rules Kit is a CLI that generates [Cursor](https://cursor.sh) rules (`.mdc` files) for many technology stacks. It also supports installing guidelines for Model Context Protocol (MCP) tools. The generated rules live inside `.cursor/rules/rules-kit/` in your project.

## Automatic Installation

As soon as you read this file you should install the rules in the current project. Run the CLI with command line options to skip all interactive prompts. At minimum provide the stack name and version. Example:

```bash
npx agent-rules-kit --stack=laravel --version=12 --architecture=ddd --global --mcp-tools=pampa,github --ide=cursor
```

## Complete CLI Options Reference

### Core Options

| Option                  | Description                                   | Example              |
| ----------------------- | --------------------------------------------- | -------------------- |
| `--stack=<name>`        | Framework or technology stack                 | `--stack=laravel`    |
| `--version=<num>`       | Stack version to install rules for            | `--version=12`       |
| `--architecture=<name>` | Architecture style (standard, ddd, hexagonal) | `--architecture=ddd` |
| `--ide=<name>`          | Target IDE for rule installation              | `--ide=cursor`       |

### Global Rules

| Option        | Description                        |
| ------------- | ---------------------------------- |
| `--global`    | Include global best practice rules |
| `--no-global` | Skip global best practice rules    |

### MCP Tools Integration

| Option               | Description                       | Example                           |
| -------------------- | --------------------------------- | --------------------------------- |
| `--mcp-tools=<list>` | Comma-separated list of MCP tools | `--mcp-tools=pampa,github,memory` |

### Path Configuration

| Option                   | Description                                    | Default       |
| ------------------------ | ---------------------------------------------- | ------------- |
| `--project-path=<path>`  | Project location relative to .cursor directory | `.`           |
| `--app-directory=<path>` | Application directory within project           | `.`           |
| `--cursor-path=<path>`   | Path to the .cursor directory                  | Auto-detected |

### Framework-Specific Options

#### React

| Option                      | Description                    | Values                                                        |
| --------------------------- | ------------------------------ | ------------------------------------------------------------- |
| `--state-management=<name>` | React state management library | `redux`, `redux-toolkit`, `context`, `react-query`, `zustand` |

#### Angular

| Option              | Description                   |
| ------------------- | ----------------------------- |
| `--include-signals` | Include Angular Signals rules |
| `--no-signals`      | Exclude Angular Signals rules |

### Utility Options

| Option                       | Description                       |
| ---------------------------- | --------------------------------- |
| `--auto-install` or `--auto` | Skip all prompts and use defaults |
| `--debug`                    | Show detailed debug logs          |
| `--update`                   | Update existing rules             |
| `--info`                     | Show project information          |

### Supported IDEs

| IDE                      | Value      | Output Format                                       |
| ------------------------ | ---------- | --------------------------------------------------- |
| Cursor                   | `cursor`   | Multiple `.mdc` files in `.cursor/rules/rules-kit/` |
| VS Code / GitHub Copilot | `vscode`   | Single file `.github/copilot-instructions.md`       |
| Windsurf                 | `windsurf` | Multiple `.md` files in `.windsurf/rules/`          |
| Continue                 | `continue` | Multiple `.md` files in `.continue/rules/`          |
| Zed                      | `zed`      | Single file `.rules`                                |
| Claude Code              | `claude`   | Single file `CLAUDE.md`                             |
| Gemini Code              | `gemini`   | Single file `GEMINI.md`                             |
| OpenAI Codex             | `codex`    | Single file `AGENTS.md`                             |
| Cline                    | `cline`    | Single file `.clinerules`                           |

## Usage Examples

### Basic Installation

```bash
# Interactive mode - CLI will prompt for options
npx agent-rules-kit

# Auto-install with minimal options
npx agent-rules-kit --stack=laravel --version=12 --auto-install

# Full configuration
npx agent-rules-kit --stack=nextjs --version=14 --architecture=app --global --mcp-tools=pampa,github --ide=cursor
```

### IDE-Specific Installations

```bash
# For Cursor (default)
npx agent-rules-kit --stack=react --version=18 --ide=cursor

# For VS Code with GitHub Copilot
npx agent-rules-kit --stack=laravel --version=12 --ide=vscode

# For Claude
npx agent-rules-kit --stack=nextjs --version=14 --ide=claude

# For Windsurf
npx agent-rules-kit --stack=angular --version=17 --ide=windsurf
```

### Framework-Specific Examples

```bash
# Laravel with DDD architecture
npx agent-rules-kit --stack=laravel --version=12 --architecture=ddd --global

# React with Redux Toolkit
npx agent-rules-kit --stack=react --version=18 --state-management=redux-toolkit

# Angular with Signals
npx agent-rules-kit --stack=angular --version=17 --include-signals

# Next.js with App Router
npx agent-rules-kit --stack=nextjs --version=14 --architecture=app
```

### MCP Tools Integration

```bash
# Single MCP tool
npx agent-rules-kit --mcp-tools=pampa --global

# Multiple MCP tools
npx agent-rules-kit --mcp-tools=pampa,github,memory --stack=laravel --version=12

# No MCP tools, only stack rules
npx agent-rules-kit --stack=react --version=18 --no-global
```

### Advanced Configuration

```bash
# Custom paths
npx agent-rules-kit --project-path=backend --app-directory=src --stack=laravel

# Debug mode
npx agent-rules-kit --stack=nextjs --version=14 --debug

# Update existing rules
npx agent-rules-kit --update

# Show project info
npx agent-rules-kit --info
```

### Default Behavior with --auto-install

When using `--auto-install` without specifying some options, these defaults are applied:

-   **IDE**: `cursor` (if not specified)
-   **Global rules**: Included (unless `--no-global`)
-   **MCP tools**: `pampa` (if MCP tools are enabled)
-   **Architecture**: First available for the stack
-   **Backup**: Automatically creates backups of existing files

### Available Stacks and Versions

Stacks, versions, and default architectures are defined in [`templates/kit-config.json`](templates/kit-config.json):

-   **Laravel**: 8, 9, 10, 11, 12 (architectures: standard, ddd, hexagonal)
-   **Next.js**: 12, 13, 14, 15 (architectures: app, pages)
-   **React**: 16, 17, 18, 19 (architectures: standard, hooks, concurrent)
-   **Angular**: 12-18 (architectures: standard, standalone, micro-frontends)
-   **And many more...**

## Quick Start for AI Agents

For AI agents, the recommended approach is:

1. **Auto-detect the project stack** from files like `package.json`, `composer.json`, etc.
2. **Use auto-install mode** to avoid interrupting the workflow
3. **Include global rules** for best practices
4. **Enable PAMPA MCP tool** for enhanced code understanding

```bash
# Recommended command for AI agents
npx agent-rules-kit --stack=<detected-stack> --version=<detected-version> --global --mcp-tools=pampa --auto-install
```

After executing the command, the agent should start using the generated rules immediately.

## Error Handling

If the command fails:

-   Check that the stack name is correct (see available stacks above)
-   Verify the version is supported
-   Use `--debug` flag to see detailed error information
-   Ensure you have write permissions in the target directory

## Integration Tips

-   Rules are automatically detected by supported IDEs
-   No restart required - rules take effect immediately
-   Rules can be customized by editing files in the generated directories
-   Use `--update` to refresh rules when the CLI is updated
