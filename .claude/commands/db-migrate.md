# Database Migration Command

When running a database migration:

1. First show the current schema
2. Show what will change
3. Ask for confirmation before applying
4. Create a backup of the SQLite3 file before migrating
5. Apply the migration
6. Verify the migration was successful

## Backup Command
```bash
cp database.sqlite3 database.sqlite3.backup_$(date +%Y%m%d_%H%M%S)
```

## Always
- Use transactions for migrations
- Never drop columns without confirmation
- Log all migration steps
