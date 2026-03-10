# Skill: Commit & Push

## Steps
1. Run `git status` to see changed files
2. Review changes with `git diff --stat`
3. Stage files: `git add .` or specific files
4. Generate a conventional commit message based on changes
5. Commit: `git commit -m "type: description"`
6. Pull before push: `git pull --rebase`
7. Push: `git push`

## Commit Message Format
```
feat: add user authentication
fix: resolve SQLite3 connection timeout
refactor: simplify database query logic
docs: update API documentation
test: add unit tests for user service
style: format code with prettier
chore: update dependencies
```

## Rules
- Never push directly to main/master
- Always pull before pushing
- One logical change per commit
- Never commit: .env, database.sqlite3, node_modules

## Windows Commands
```powershell
git status
git add .
git commit -m "feat: description"
git pull --rebase
git push
```