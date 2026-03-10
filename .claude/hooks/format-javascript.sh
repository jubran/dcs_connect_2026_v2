#!/bin/bash
# Format TypeScript/JavaScript files before commit

echo "Formatting files..."
npx prettier --write "**/*.{js,jsx,css,ts,tsx}" 2>/dev/null
echo "Done formatting."
