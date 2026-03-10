# Database Rules (SQLite3)

## Queries
- Always use parameterized queries:
  ```js
  db.get("SELECT * FROM users WHERE id = ?", [id])
  ```
- Never concatenate user input into SQL strings
- Use transactions for multiple related operations

## Schema
- Always add `created_at` and `updated_at` timestamps
- Use INTEGER PRIMARY KEY AUTOINCREMENT for IDs
- Add indexes for frequently queried columns

## Migrations
- Never edit existing migrations, create new ones
- Test migrations on a copy before applying to production
- Always backup before migrating:
  ```bash
  cp database.sqlite3 database.sqlite3.bak
  ```
