# Security: Secrets Cleanup - October 26, 2025

## Issue
GitHub security scanner (GitGuardian) detected 5 sensitive files in repository history:

1. `.ssh/id_rsa` - Private SSH key
2. `.netrc` - GitHub credentials
3. `server/docs/openapi.yaml` - High entropy secret
4. `scripts/generate-boris-image.mjs` - API key
5. Historical passwords in `auto_varsling.py` (different repo)

## Actions Taken

### 1. Removed from Git Tracking
```bash
git rm --cached .netrc
git commit -m "security: Remove .netrc from git tracking"
git push origin master
```

### 2. Already in .gitignore
All sensitive files were already listed in `.gitignore`:
- `.netrc`
- `.ssh/`
- `server/docs/openapi.yaml`
- `scripts/*-image.mjs`
- `.env` and variants

### 3. Files Still in History
**Important**: Simply removing files from current tree doesn't remove them from Git history. They remain accessible in old commits.

To completely remove from history, would need:
```bash
# Using git filter-repo (recommended)
git filter-repo --path .netrc --invert-paths
git filter-repo --path .ssh/id_rsa --invert-paths
git filter-repo --path server/docs/openapi.yaml --invert-paths
git filter-repo --path scripts/generate-boris-image.mjs --invert-paths

# Then force push
git push origin --force --all
```

**NOTE**: Force pushing rewrites history and can break collaborators' repos.

## Security Best Practices

### ✅ What's Protected
- `.env` files (never committed)
- API keys stored in environment variables
- SSH keys in `.ssh/` directory
- Database credentials in `.env`

### ⚠️ What Needs Attention
1. **Rotate Exposed Secrets**:
   - GitHub token in `.netrc` → Create new Personal Access Token
   - Any API keys in `generate-boris-image.mjs` → Rotate Runware key
   - OpenAPI secrets → Review and rotate if needed

2. **Verify .env Files**:
   ```bash
   # These should NEVER be in Git
   ls -la .env*
   # Output should show: .env, .env.local, etc. (all gitignored)
   ```

3. **Check for Hardcoded Secrets**:
   ```bash
   # Search for potential secrets in codebase
   grep -r "api_key\|apiKey\|secret\|password" --include="*.js" --include="*.ts" --include="*.mjs" src/ scripts/
   ```

## Current State
- ✅ `.netrc` removed from current tree (commit 43d39bc)
- ✅ All sensitive patterns in `.gitignore`
- ⚠️ Files still accessible in Git history
- ⚠️ Exposed secrets should be rotated

## Recommendations

### Immediate
1. Rotate GitHub Personal Access Token (from `.netrc`)
2. Check if Runware API key was in `generate-boris-image.mjs`
3. Review `server/docs/openapi.yaml` for any secrets

### Long-term
1. Use `git-secrets` or `gitleaks` as pre-commit hook
2. Never commit files with `.env`, `.key`, `.pem` extensions
3. Store all secrets in `.env` files only
4. Use environment variables for all API keys

## File Protection Status

| File/Pattern | In .gitignore | Removed from Tree | Needs Rotation |
|-------------|---------------|-------------------|----------------|
| `.netrc` | ✅ | ✅ | Yes - GitHub token |
| `.ssh/id_rsa` | ✅ | ✅ | Yes - SSH key |
| `server/docs/openapi.yaml` | ✅ | ✅ | Review needed |
| `scripts/*-image.mjs` | ✅ | No (needs API keys) | Review needed |

## Notes
- GitGuardian will continue to flag historical commits until history is rewritten
- Rewriting history requires force push and coordination with team
- Alternative: Accept that secrets are in history, rotate them all, and move forward with better practices
- New secrets properly managed via `.env` files and environment variables

---
**Status**: Partial fix - secrets removed from current tree, rotation pending
**Last updated**: October 26, 2025
