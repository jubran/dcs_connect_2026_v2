# Test Command

When running tests:

1. Run unit tests first
2. Run integration tests
3. Show a summary of passed/failed tests
4. For failed tests, show the error clearly
5. Suggest fixes for common failures

## Commands
```bash
# Run all tests
npm test

# Run specific file
npm test -- --testPathPattern=filename

# Run with coverage
npm test -- --coverage
```
