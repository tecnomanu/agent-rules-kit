# Release Process for Agent Rules Kit

This document explains the process for releasing new versions of Agent Rules Kit.

## Automated Release

We've created an automated release script that handles most of the release process, including:

1. Version bumping
2. CHANGELOG.md editing
3. Git commit and tag creation
4. Pushing to remote repository
5. Publishing to npm

### Using the Release Script

Run the release script:

```bash
npm run release
# or directly
node scripts/release.js
```

The script will:

1. Show the current version and prompt for the type of release (major, minor, patch) or a specific version
2. Ask for confirmation of the new version
3. Update the version in package.json
4. Offer to open CHANGELOG.md for editing
5. Create a Git commit with the version changes
6. Create a Git tag for the version
7. Offer to push changes to the remote repository
8. Offer to publish the package to npm

### Specifying Version Directly

You can also specify the version directly:

```bash
# Release version 0.3.0
node scripts/release.js 0.3.0
```

## Manual Release Process

If you prefer to do the release manually, follow these steps:

1. Update the version in `package.json`
2. Update `CHANGELOG.md` with the new version and changes
3. Commit the changes:
    ```bash
    git add package.json CHANGELOG.md
    git commit -m "release: version x.y.z"
    ```
4. Create a tag:
    ```bash
    git tag -a vx.y.z -m "Version x.y.z"
    ```
5. Push the changes and tag:
    ```bash
    git push
    git push --tags
    ```
6. Publish to npm:
    ```bash
    npm publish
    ```

## Versioning Guidelines

We follow [Semantic Versioning](https://semver.org/) for version numbers:

-   **MAJOR version** when making incompatible API changes
-   **MINOR version** when adding functionality in a backwards compatible manner
-   **PATCH version** when making backwards compatible bug fixes

## CHANGELOG Guidelines

When updating the CHANGELOG.md, follow these guidelines:

1. Add the version and release date: `## [x.y.z] - YYYY-MM-DD`
2. Group changes under these headings:
    - **Added** - New features
    - **Changed** - Changes in existing functionality
    - **Deprecated** - Soon-to-be removed features
    - **Removed** - Removed features
    - **Fixed** - Bug fixes
    - **Security** - Vulnerabilities

Example:

```markdown
## [0.2.1] - 2023-10-25

### Added

-   Feature 1
-   Feature 2

### Changed

-   Change 1
-   Change 2

### Fixed

-   Bug fix 1
-   Bug fix 2
```
