# Contributing to Agent Rules Kit

Thank you for considering contributing to our project! This document outlines the process for contributing and the standards we follow.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our project.

## How to Contribute

1. **Fork the repository**
2. **Clone your fork**
    ```bash
    git clone https://github.com/your-username/agent-rules-kit.git
    cd agent-rules-kit
    ```
3. **Create a new branch**
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Make your changes**
5. **Test your changes**
    ```bash
    pnpm run test
    ```
6. **Commit your changes**
   Follow our commit conventions as documented in our [README.md](README.md#commit-conventions)
    ```bash
    git commit -m "✨ feat: add new feature"
    ```
7. **Push to your fork**
    ```bash
    git push origin feature/your-feature-name
    ```
8. **Submit a pull request**

## Development Standards

### Code Style

-   Use ESLint and Prettier for JavaScript/TypeScript code
-   Follow the style guidelines established in the codebase
-   Run `pnpm run lint` before committing

### Testing

-   All new features should include tests
-   All tests should pass before submitting a PR
-   Run `pnpm run test` to execute the test suite

### Documentation

-   Update documentation for any changed functionality
-   Add JSDoc comments for new functions and classes
-   Keep the README and other docs up to date
-   **Follow the [Documentation Guide](docs/documentation-guide.md)** for creating or updating rule documentation

### Language Policy

-   All code, comments, documentation, and files must be written in English, even if communicating with the agent in another language
-   Variable names, function names, and identifiers should be in English
-   Documentation must follow English naming conventions and grammar

## Architecture and Development Guides

Before making changes, please familiarize yourself with our architecture and development guides:

1. **[Services Architecture](docs/services-architecture.md)**: Understand the service-oriented architecture of the project
2. **[Extending Services](docs/extending-services.md)**: Guide for adding new stacks or features
3. **[Rule Organization](docs/rule_organization.md)**: How rules are organized and structured
4. **[Performance Guide](docs/performance-guide.md)**: Performance optimization recommendations
5. **[CLI Documentation](docs/cli.md)**: Details about the CLI implementation
6. **[MCP Tools Integration Guide](docs/mcp-tools-guide.md)**: Comprehensive guide for MCP tools development and usage

## Service Development

When developing new services or features:

1. **Follow the existing patterns** in similar services
2. **Use asynchronous operations** for file handling and other I/O
3. **Implement batch processing** for better memory management
4. **Create appropriate tests** for all new functionality
5. **Document service methods** with JSDoc comments

## Rule Development

When creating new rules:

1. Follow the structure outlined in the [Documentation Guide](docs/documentation-guide.md)
2. Place rules in the appropriate directories based on their scope and application
3. Update `kit-config.json` to register new rules
4. Test the rules with the CLI to ensure proper generation

## MCP Tools Development

Agent Rules Kit v2.0+ includes comprehensive support for Model Context Protocol (MCP) tools. When contributing MCP tools:

### Adding New MCP Tools

1. **Create template directory structure**:

    ```
    templates/mcp-tools/your-tool/
    ├── tool-usage.md          # Usage rules and guidelines
    ├── best-practices.md      # Best practices specific to the tool
    └── examples.md            # Common usage examples
    ```

2. **Register the tool in kit-config.json**:

    ```json
    "mcp_tools": {
      "your-tool": {
        "name": "Your Tool - Description",
        "description": "Detailed description of what the tool does"
      }
    }
    ```

3. **Follow MCP documentation standards**:
    - Include available tool functions
    - Provide usage examples
    - Document security considerations
    - Add common workflow patterns

### MCP Tool Documentation Guidelines

Each MCP tool should include:

-   **Basic Instructions**: How to initialize and use the tool
-   **Available Functions**: Complete list of tool functions with parameters
-   **Security Guidelines**: Access controls and safety considerations
-   **Common Patterns**: Typical workflows and usage examples
-   **Error Handling**: How to handle common error scenarios

### Testing MCP Tools

Test your MCP tool rules using the CLI:

```bash
# Test MCP tools generation
pnpm run start
# Select "Yes" for MCP tools
# Choose your tool from the list
# Verify generated rules in .cursor/rules/rules-kit/mcp-tools/
```

### MCP Service Development

When extending the McpService class:

1. **Add new methods** following the existing patterns
2. **Implement proper error handling** with meaningful messages
3. **Use batch processing** for better performance
4. **Add comprehensive tests** in `tests/cli/services/mcp-service.test.js`

## Pull Request Process

1. Ensure your code adheres to the styling guidelines
2. Update documentation as necessary
3. Include tests for your changes
4. Make sure all tests pass
5. The PR will be reviewed by maintainers
6. Once approved, a maintainer will merge your PR

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.

Thank you for contributing!
