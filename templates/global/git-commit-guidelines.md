# Git Commit Guidelines - CRITICAL VERSION CONTROL

## ⚠️ CRITICAL WARNING - BREAKING CHANGES

**NEVER use `BREAKING CHANGE:` in commit messages unless it's a REAL breaking change that requires users to modify their code!**

This project uses semantic-release which automatically triggers version bumps:

| Type               | Emoji | Example                                 | Version Impact | Risk Level       |
| ------------------ | ----- | --------------------------------------- | -------------- | ---------------- |
| `fix:`             | 🐛    | `fix(payment): 🐛 handle timeout error` | PATCH          | ✅ Safe          |
| `feat:`            | ✨    | `feat(api): ✨ add user authentication` | MINOR          | ✅ Safe          |
| `docs:`            | 📝    | `docs(readme): 📝 clarify setup`        | No version     | ✅ Safe          |
| `refactor:`        | ♻️    | `refactor(core): ♻️ extract helper`     | No version     | ✅ Safe          |
| `test:`            | ✅    | `test(utils): ✅ edge cases for parser` | No version     | ✅ Safe          |
| `chore:`           | 🔧    | `chore(ci): 🔧 bump node version`       | No version     | ✅ Safe          |
| `BREAKING CHANGE:` | 🚨    | Any commit with this footer             | MAJOR          | 🚨 **DANGEROUS** |

## ⚠️ Breaking Changes (MAJOR version) - USE WITH EXTREME CAUTION

**WARNING**: Only use `BREAKING CHANGE:` when users MUST modify their code to continue using the project.

### 🚨 Real Breaking Changes (Only when absolutely necessary):

```bash
feat: ✨ redesign authentication system

Complete overhaul of auth flow and API structure

BREAKING CHANGE: Auth token format changed, all clients must update their integration
```

### ❌ WRONG - These are NOT breaking changes:

```bash
# ❌ Adding new features is NOT breaking
feat: ✨ add new dashboard feature

BREAKING CHANGE: Added new dashboard  # WRONG!

# ❌ Improving existing features is NOT breaking
feat: ✨ improve performance

BREAKING CHANGE: Better caching system  # WRONG!

# ❌ Internal refactoring is NOT breaking
refactor: ♻️ reorganize code structure

BREAKING CHANGE: Changed internal structure  # WRONG!
```

### ❌ Dangerous Patterns to AVOID:

```bash
# DON'T use exclamation mark in type
feat!: ✨ breaking change

# DON'T add BREAKING CHANGE for non-breaking changes
feat: 🎉 add cool new feature

BREAKING CHANGE: Users now have more options  # NOT BREAKING!
```

## **Semantic Versioning Impact**

| Version Type       | When to Use                       | Result                    | Example                          |
| ------------------ | --------------------------------- | ------------------------- | -------------------------------- |
| **PATCH** (v1.0.1) | Bug fixes, backward-compatible    | `fix:` type               | `fix: 🐛 handle null values`     |
| **MINOR** (v1.1.0) | New features, backward-compatible | `feat:` type              | `feat: ✨ add user dashboard`    |
| **MAJOR** (v2.0.0) | 🚨 Breaking changes only          | `BREAKING CHANGE:` footer | Only when users must change code |

### 🎯 Safe Approach (Recommended):

-   **Default to `fix:`** when in doubt
-   **Use `feat:`** for new functionality
-   **NEVER use `BREAKING CHANGE:`** unless absolutely certain

## Author Identity Rules

To clearly differentiate the origin of each commit, **ALWAYS** use `--author` according to context:

### Human Developer Commits

Commits made directly by human developers:

```bash
# Use developer's normal identity (without --author)
git commit -m "feat(auth): ✨ implement OAuth login"
```

### AI Assistant Commits

Commits made by AI assistants (Cursor, Claude, ChatGPT, etc.):

```bash
# MANDATORY use --author with AI identification
git commit --author="Claude AI <claude.ai@assistant.local>" -m "feat(api): ✨ add user validation"
git commit --author="Cursor AI <cursor.ai@assistant.local>" -m "fix(auth): 🐛 handle token expiry"
```

### Available AI Author Formats:

-   `Agent AI <agent.ai@assistant.local>` - For general AI assistants
-   `Claude AI <claude.ai@assistant.local>` - For Claude/Sonnet
-   `Cursor AI <cursor.ai@assistant.local>` - For Cursor IDE AI
-   `ChatGPT AI <chatgpt.ai@assistant.local>` - For ChatGPT
-   `Copilot AI <copilot.ai@assistant.local>` - For GitHub Copilot

### 🤖 AI Assistant Commit Guidelines:

**CRITICAL RULES for AI Assistants:**

1. **ALWAYS use `--author="Agent AI <agent.ai@assistant.local>"`**
2. **Prefer `fix:` over `feat:` when uncertain**
3. **NEVER use `BREAKING CHANGE:` without explicit user confirmation**
4. **Keep commit messages concise and descriptive**
5. **When in doubt, ask the user before committing**

```bash
# ✅ CORRECT AI commit examples:
git commit --author="Agent AI <agent.ai@assistant.local>" -m "fix: 🐛 correct validation logic"
git commit --author="Agent AI <agent.ai@assistant.local>" -m "feat: ✨ add new component"
git commit --author="Agent AI <agent.ai@assistant.local>" -m "docs: 📝 update README"

# ❌ NEVER do this without user approval:
git commit --author="Agent AI <agent.ai@assistant.local>" -m "feat: ✨ redesign API

BREAKING CHANGE: Changed endpoint structure"
```

### Automated System Commits

Automatic commits (semantic-release, bots, CI/CD):

```bash
# These systems already configure their own author automatically
# No manual action required
```

### Important Notes

-   **Avatar Display**: Avatar is determined by email. Emails not associated with GitHub accounts will show default avatar
-   **Consistency**: Maintain consistency in AI email format: `<ai-name>.ai@assistant.local`
-   **Transparency**: This practice improves transparency and traceability of collaborative development

## 📚 Project History & Lessons Learned

### ⚠️ Previous Versioning Issues:

This project has experienced accidental major version bumps due to incorrect `BREAKING CHANGE:` usage:

- **v3.0.0**: Accidentally triggered by incorrect `BREAKING CHANGE:` in commit
- **v3.0.1**: Another accidental major bump  
- **Current version**: v3.3.1+ (continuing from accidental major versions)

### 🎯 Lessons Learned:

1. **`BREAKING CHANGE:` is extremely powerful** - it immediately triggers major version
2. **Most changes are NOT breaking** - adding features, improving performance, refactoring
3. **When in doubt, use `fix:` or `feat:`** - these are safer options
4. **Breaking changes require user code modifications** - not just "big changes"

### 🔒 Current Policy:

- **Default to `fix:`** for improvements and corrections
- **Use `feat:`** only for clear new functionality  
- **Avoid `BREAKING CHANGE:`** unless users must modify their code to continue using the project

## BREAKING CHANGE Best Practices (Use Sparingly)

**Only when users MUST change their code:**

1. **Keep title short**: Under 72 characters
2. **Use blank line**: Separate title from BREAKING CHANGE
3. **Be specific**: Explain what changed and impact
4. **Add context**: Include migration notes if needed
5. **Get approval**: Always get explicit user approval before using

### Examples:

```bash
# Good for major feature
feat: 🎉 redesign user interface

New component library and design system

BREAKING CHANGE: Button component props changed, see migration guide

# Good for simple breaking change
feat: ✨ update API endpoints

BREAKING CHANGE: All endpoints now require v2 prefix
```

## Release Guidelines

### When NOT to Create Releases

-   **Default Behavior**: Do NOT create releases unless explicitly requested
-   **Check Existing Automation**: Before attempting any release, verify if automation already exists:
    -   GitHub Actions workflows (`.github/workflows/`)
    -   GitLab CI/CD pipelines (`.gitlab-ci.yml`)
    -   `semantic-release` in `package.json` dependencies
    -   Other automated release tools

### When to Create Releases

Only create releases when:

1. **Explicitly requested** by the user
2. **No existing automation** is found
3. **Manual release process** is confirmed to be needed

### Release Verification Commands

```bash
# Check for existing automation
ls .github/workflows/
cat package.json | grep semantic-release
cat .gitlab-ci.yml 2>/dev/null || echo "No GitLab CI found"
```
