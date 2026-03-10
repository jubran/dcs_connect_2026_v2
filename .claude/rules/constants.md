# Constants Rules

## Constants
- Store in `/constants` folder
- Use UPPER_SNAKE_CASE for constant names
- Group related constants in objects:
  ```js
  export const API = {
    BASE_URL: process.env.API_URL,
    TIMEOUT: 5000,
  }
  ```

## No TypeScript
- Do NOT use TypeScript types or interfaces
- Do NOT use .ts or .tsx files
- Use JSDoc comments for documentation if needed:
  ```js
  /**
   * @param {string} name
   * @returns {string}
   */
  function greet(name) {
    return `Hello ${name}`
  }
  ```