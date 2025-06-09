# Agent Setup Guide

This document explains how an AI agent can install the rules provided by **Agent Rules Kit** automatically.

## Project Overview

Agent Rules Kit is a CLI that generates [Cursor](https://cursor.sh) rules (`.mdc` files) for many technology stacks. It also supports installing guidelines for Model Context Protocol (MCP) tools. The generated rules live inside `.cursor/rules/rules-kit/` in your project.

## Automatic Installation

As soon as you read this file you should install the rules in the current project. Run the CLI with command line options to skip all interactive prompts. At minimum provide the stack name and version. Example:

```bash
npx agent-rules-kit --stack=laravel --version=12 --architecture=ddd --global --mcp-tools=pampa,github
```

Options:

- `--stack=<name>`: framework or technology stack.
- `--version=<num>`: stack version to install rules for.
- `--architecture=<name>`: optional architecture (standard, ddd, etc.).
- `--global` or `--no-global`: include or skip global best practice rules.
- `--mcp-tools=<list>`: comma separated list of MCP tools (e.g. `pampa,github`).
- `--project-path=<path>`: project location if not the repository root.
- `--app-directory=<path>`: application directory if different from the project root.
- `--cursor-path=<path>`: path to the `.cursor` directory.
- `--state-management=<name>`: react state management option.
- `--include-signals`/`--no-signals`: include Angular signals rules.
- `--debug`: show debug logs.

After executing the command, the agent should start using the generated rules immediately.

