# Git Commit Guidelines

Adopt **Conventional Commits** with emojis for quick context:

| Type     | Emoji | Example                                 |
| -------- | ----- | --------------------------------------- |
| feat     | ✨    | `feat(api): ✨ add user authentication` |
| fix      | 🐛    | `fix(payment): 🐛 handle timeout error` |
| docs     | 📝    | `docs(readme): 📝 clarify setup`        |
| refactor | ♻️    | `refactor(core): ♻️ extract helper`     |
| test     | ✅    | `test(utils): ✅ edge cases for parser` |
| chore    | 🔧    | `chore(ci): 🔧 bump node version`       |

**Versioning**

-   **MAJOR**: breaking changes (v2.0.0)
-   **MINOR**: new features, backward‑compatible (v1.1.0)
-   **PATCH**: bug fixes, backward‑compatible (v1.0.1)

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
git commit --author="Cursor AI <cursor.ai@assistant.local>" -m "feat(api): ✨ add user validation"
git commit --author="Cursor AI <cursor.ai@assistant.local>" -m "fix(auth): 🐛 handle token expiry"
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
