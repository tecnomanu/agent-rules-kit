---
globs: ['<root>/**/*']
alwaysApply: false
---

# GitHub MCP Usage Rules

You have access to GitHub MCP for repository management, file operations, and GitHub API integration.

## Basic Instructions

1. **ALWAYS at the start:**

    - Set `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable
    - Run `github_get_repository` to verify access to target repository
    - Use `github_list_repositories` to see available repositories

2. **BEFORE making changes:**

    - Create a feature branch with `github_create_branch`
    - Read existing files with `github_read_file` to understand current state
    - Check for existing issues or PRs related to your changes

3. **WHEN modifying files:**

    - Always get file SHA with `github_read_file` before updates
    - Use descriptive commit messages following conventional commits
    - Work in feature branches, never directly on main

4. **AFTER completing changes:**
    - Create a pull request with `github_create_pull_request`
    - Include clear description of changes and reasoning

## Available Tools

-   `github_read_file(owner, repo, path, ref)` - Read file contents
-   `github_write_file(owner, repo, path, content, message, branch)` - Create/update files
-   `github_delete_file(owner, repo, path, message, sha)` - Delete files
-   `github_create_branch(owner, repo, branch, from_branch)` - Create new branch
-   `github_list_branches(owner, repo)` - List repository branches
-   `github_create_repository(name, description, private)` - Create new repository
-   `github_get_repository(owner, repo)` - Get repository information
-   `github_list_repositories(type, per_page)` - List user repositories
-   `github_create_issue(owner, repo, title, body, labels)` - Create issue
-   `github_create_pull_request(owner, repo, title, body, head, base)` - Create PR

## Strategy

Always work in branches. Read before writing. Use descriptive messages. Create PRs for review.

## Workflow Examples

### File Updates:

1. `github_create_branch` → Create feature branch
2. `github_read_file` → Get current content and SHA
3. `github_write_file` → Update with new content
4. `github_create_pull_request` → Submit for review

### New Features:

1. `github_create_issue` → Document the feature request
2. `github_create_branch` → Create feature branch
3. `github_write_file` → Add new files
4. `github_create_pull_request` → Link to issue

### Repository Setup:

1. `github_create_repository` → Create new repo
2. `github_write_file` → Add README, .gitignore, etc.
3. `github_create_branch` → Set up development branch

## Commit Message Format

Use conventional commits:

-   `feat: add user authentication`
-   `fix: resolve login timeout issue`
-   `docs: update API documentation`
-   `chore: update dependencies`
