# Git Commit Guidelines

Adopt **Conventional Commits** with emojis for quick context:

| Type     | Emoji | Example                                 | Version Impact |
| -------- | ----- | --------------------------------------- | -------------- |
| feat     | ✨    | `feat(api): ✨ add user authentication` | MINOR          |
| fix      | 🐛    | `fix(payment): 🐛 handle timeout error` | PATCH          |
| docs     | 📝    | `docs(readme): 📝 clarify setup`        | No version     |
| refactor | ♻️    | `refactor(core): ♻️ extract helper`     | No version     |
| test     | ✅    | `test(utils): ✅ edge cases for parser` | No version     |
| chore    | 🔧    | `chore(ci): 🔧 bump node version`       | No version     |

## Breaking Changes (MAJOR version)

For **major version bumps** (v1.0.0 → v2.0.0), use a **normal type** with **BREAKING CHANGE** in the footer:

### ✅ Correct Format:

```bash
feat: ✨ add new authentication system

Complete redesign of auth flow with OAuth2

BREAKING CHANGE: Auth token format changed, clients need updates
```

### ✅ Simple Format:

```bash
feat: 🎉 release v2.0 with new features

BREAKING CHANGE: API endpoints restructured
```

### ❌ Wrong Format:

```bash
# DON'T use exclamation mark in type
feat!: ✨ breaking change

# DON'T make super long single-line messages
feat: 🎉 very long message with lots of details and breaking change info all in one line BREAKING CHANGE: xyz
```

## **Versioning**

-   **MAJOR**: breaking changes (v2.0.0) - Use `BREAKING CHANGE:` footer
-   **MINOR**: new features, backward‑compatible (v1.1.0) - Use `feat:` type
-   **PATCH**: bug fixes, backward‑compatible (v1.0.1) - Use `fix:` type

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

-   `Claude AI <claude.ai@assistant.local>` - For Claude/Sonnet
-   `Cursor AI <cursor.ai@assistant.local>` - For Cursor IDE AI
-   `ChatGPT AI <chatgpt.ai@assistant.local>` - For ChatGPT
-   `Copilot AI <copilot.ai@assistant.local>` - For GitHub Copilot

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

## BREAKING CHANGE Best Practices

1. **Keep title short**: Under 72 characters
2. **Use blank line**: Separate title from BREAKING CHANGE
3. **Be specific**: Explain what changed and impact
4. **Add context**: Include migration notes if needed

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
