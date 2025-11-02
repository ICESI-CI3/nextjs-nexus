# Git Hooks

This directory contains Git hooks managed by Husky.

## Available Hooks

### pre-commit

- Runs ESLint and Prettier on staged files
- Performs TypeScript type checking
- Ensures code quality before committing

### pre-push

- Runs TypeScript type checking on all files
- (Future) Will run tests
- (Future) Will check build

### commit-msg

- Validates commit message format
- Enforces Conventional Commits standard
- Example: `feat: add user authentication`

## Bypass Hooks (Not Recommended)

If you need to bypass hooks temporarily:

```bash
# Skip pre-commit and commit-msg hooks
git commit --no-verify -m "your message"

# Skip pre-push hook
git push --no-verify
```

**⚠️ Warning:** Only bypass hooks when absolutely necessary. Your code quality depends on these checks!
