# Testing Guide for Agent Rules Kit

This document explains how to use the testing utilities provided in Agent Rules Kit to test rule generation for different stacks, architectures, and versions.

## The `test-cli.js` Utility

The `test-cli.js` script provides a simple way to test the generation of rules without having to go through the interactive CLI. This is particularly useful for:

-   Testing rule generation for different stacks
-   Verifying that changes to templates or configuration work as expected
-   Debugging issues with rule generation
-   Validating new template files

### Basic Usage

To run the test CLI, use:

```bash
node cli/test-cli.js [options]
```

### Command Line Options

The test CLI supports the following options:

| Option                  | Description                                                | Default              |
| ----------------------- | ---------------------------------------------------------- | -------------------- |
| `--stack=<stack>`       | Stack to generate rules for (e.g., laravel, nextjs, astro) | `laravel`            |
| `--architecture=<arch>` | Architecture to use (e.g., standard, ddd, hybrid)          | `standard`           |
| `--version=<version>`   | Version of the stack (e.g., 3, 14, 12)                     | `12`                 |
| `--project-path=<path>` | Path to the project                                        | `./`                 |
| `--root=<path>`         | Path where rules will be generated                         | `testing`            |
| `--cursor-path=<path>`  | Path to cursor                                             | `.`                  |
| `--no-global`           | Skip global rules                                          | Include global rules |
| `--debug`               | Enable debug output                                        | Disabled             |
| `--help`                | Show help message                                          | -                    |

### Examples

#### Testing Astro Rules

Generate rules for Astro version 3 with debug output:

```bash
node cli/test-cli.js --stack=astro --version=3 --debug
```

#### Testing Laravel with DDD Architecture

Generate rules for Laravel using Domain-Driven Design architecture:

```bash
node cli/test-cli.js --stack=laravel --architecture=ddd --version=11
```

#### Testing with Specific Project Path

Generate rules for Next.js with a specific project path:

```bash
node cli/test-cli.js --stack=nextjs --version=14 --project-path=/path/to/nextjs/project
```

#### Skipping Global Rules

Test with only stack-specific rules, skipping the global ones:

```bash
node cli/test-cli.js --stack=vue --version=3 --no-global
```

### Output Files

By default, test output files are generated in the `testing/.cursor/rules/rules-kit` directory. This includes:

-   Global rules in the `global` subdirectory
-   Stack-specific rules in a subdirectory named after the stack (e.g., `astro`)

You can change the output directory with the `--root` option.

## Testing Workflow

A recommended workflow for testing changes:

1. Make changes to template files or configuration
2. Run the test CLI with appropriate options
3. Check the generated output in the `testing/.cursor/rules/rules-kit` directory
4. Run the test again with different options if needed
5. If everything looks good, commit your changes

## Automated Testing

In addition to manual testing with `test-cli.js`, the project includes automated tests that can be run with:

```bash
pnpm test
```

These automated tests verify the core functionality of the Agent Rules Kit, including:

-   File operations
-   Configuration handling
-   Stack-specific helpers
-   Template processing

When making significant changes, always run the automated tests to ensure you haven't broken existing functionality.

## Debugging

For detailed debugging information, add the `--debug` flag to your test command. This will output additional information about:

-   Templates being processed
-   Variables being replaced
-   File operations
-   Configuration loading
-   Error messages

## Common Issues

### Wrong Template Directory

If you see an error indicating that templates cannot be found, ensure you're running the script from the root directory of the project:

```bash
cd /path/to/agent-rules-kit
node cli/test-cli.js --stack=astro
```

### Missing Dependencies

If you encounter errors about missing dependencies, make sure you've installed all dependencies:

```bash
pnpm install
```

### Template Variables Not Replaced

If template variables (like `{stack}` or `{detectedVersion}`) are not being replaced, ensure your template files are formatted correctly and that you're providing the necessary options to the test CLI.
