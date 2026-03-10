# Backend Rules

## Node.js / PHP
- Always validate and sanitize user input
- Use environment variables for secrets, never hardcode
- Return consistent API response format:
  ```json
  { "success": true, "data": {}, "message": "" }
  { "success": false, "error": "message" }
  ```
- Always use try/catch for async operations
- Log errors properly

## Security
- Never expose stack traces to the client
- Rate limit API endpoints
- Validate file uploads (type, size)
