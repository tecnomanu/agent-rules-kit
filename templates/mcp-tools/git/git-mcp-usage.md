---
globs: ['<root>/**/*']
alwaysApply: false
---

# Git MCP Usage Rules

You have access to Git MCP for repository operations, commit history analysis, and version control.

## Basic Instructions

1. **ALWAYS start with status:**

    - Run `git_status` to check repository state
    - Use `git_log` to understand recent changes
    - Check current branch with `git_branch_list`

2. **BEFORE making changes:**

    - Create feature branch with `git_create_branch`
    - Check for uncommitted changes with `git_status`
    - Pull latest changes with `git_pull`

3. **WHEN committing:**

    - Stage specific files with `git_add`
    - Use descriptive commit messages with `git_commit`
    - Follow conventional commit format

4. **AFTER changes:**
    - Push to remote with `git_push`
    - Consider creating pull/merge request
    - Clean up feature branches when done

## Available Tools

-   `git_status()` - Check repository status
-   `git_log(limit, branch)` - View commit history
-   `git_add(files)` - Stage files for commit
-   `git_commit(message)` - Commit staged changes
-   `git_push(remote, branch)` - Push to remote
-   `git_pull(remote, branch)` - Pull from remote
-   `git_branch_list()` - List all branches
-   `git_create_branch(name, from_branch)` - Create new branch
-   `git_switch_branch(name)` - Switch to branch
-   `git_merge(branch)` - Merge branch
-   `git_diff(file, commit1, commit2)` - Show differences
-   `git_search_commits(query)` - Search commit history

## Strategy

Check status first. Work in branches. Commit frequently with clear messages. Keep history clean.

## Workflow Examples

### Feature Development:

1. `git_status` → Check clean state
2. `git_create_branch` → Create feature branch
3. `git_switch_branch` → Switch to feature branch
4. Make changes...
5. `git_add` → Stage changes
6. `git_commit` → Commit with good message
7. `git_push` → Push to remote

### Bug Investigation:

1. `git_log` → Recent commits
2. `git_search_commits` → Find related changes
3. `git_diff` → Compare versions
4. Identify problematic commit

### Code Review Prep:

1. `git_status` → Ensure clean state
2. `git_log` → Review your commits
3. `git_diff` → Check changes
4. Clean up commit messages if needed

### Hotfix Workflow:

1. `git_switch_branch` → Switch to main
2. `git_pull` → Get latest
3. `git_create_branch` → Create hotfix branch
4. Make minimal fix
5. `git_commit` → Commit fix
6. `git_push` → Push for immediate merge

## Commit Message Format

Use conventional commits:

-   `feat: add user authentication`
-   `fix: resolve memory leak in auth service`
-   `docs: update API documentation`
-   `refactor: simplify user validation logic`
-   `test: add unit tests for payment module`
-   `chore: update dependencies`

## Best Practices

-   Commit early and often
-   Keep commits atomic (one change per commit)
-   Write clear, descriptive commit messages
-   Always work in feature branches
-   Pull before pushing
-   Review changes before committing
