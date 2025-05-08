# Contributing to Our Project

Thank you for considering contributing to our project! This document outlines the process for contributing and the standards we follow.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our project.

## How to Contribute

1. **Fork the repository**
2. **Clone your fork**
    ```bash
    git clone https://github.com/your-username/project-name.git
    cd project-name
    ```
3. **Create a new branch**
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Make your changes**
5. **Test your changes**
    ```bash
    npm run test
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
-   PHP code must pass PHP-Stan level 8 and Pint auto-format
-   Follow the style guidelines established in the codebase

### Testing

-   All new features should include tests
-   All tests should pass before submitting a PR
-   Run `npm run test` to execute the test suite

### Documentation

-   Update documentation for any changed functionality
-   Add JSDoc/PHPDoc comments for new functions and classes
-   Keep the README and other docs up to date

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
