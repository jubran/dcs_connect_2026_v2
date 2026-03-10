#!/bin/bash
# Block editing protected files

PROTECTED_FILES=(
  ".env"
  ".env.production"
  "database.sqlite3"
  "package-lock.json"
)

for file in "${PROTECTED_FILES[@]}"; do
  if git diff --cached --name-only | grep -q "$file"; then
    echo "ERROR: Attempting to commit protected file: $file"
    echo "Remove it from staging: git reset HEAD $file"
    exit 1
  fi
done

echo "Protected files check passed."
