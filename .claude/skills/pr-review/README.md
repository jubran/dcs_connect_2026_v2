# Skill: PR Review

## Steps
1. Read the PR description and understand the goal
2. Run: `git diff main...HEAD --stat` to see changed files
3. Review each changed file one by one
4. Check for issues (see checklist below)
5. Summarize findings with severity levels
6. Approve or request changes

## Review Checklist
- [ ] Code is readable and well-commented
- [ ] No hardcoded secrets or API keys
- [ ] No hardcoded URLs (should use API_ROUTES.js)
- [ ] SQLite3 queries are parameterized
- [ ] Error handling is in place (try/catch)
- [ ] No unnecessary console.log statements
- [ ] Components accept props (not hardcoded data)
- [ ] No unused imports or variables
- [ ] File extensions are .js or .jsx (no TypeScript)
- [ ] Tests included for new features

## Severity Levels
- 🔴 Critical: Security issues, broken functionality
- 🟡 Warning: Performance issues, missing error handling
- 🟢 Suggestion: Code style, readability improvements

## Windows Commands
```powershell
git log --oneline -10
git diff main...HEAD --stat
git diff main...HEAD -- path/to/file.js
```