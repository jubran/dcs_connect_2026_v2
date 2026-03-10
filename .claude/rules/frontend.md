# Frontend Rules

## React / Next.js
- Use functional components with hooks only
- JavaScript only, do NOT use TypeScript or .ts/.tsx files
- Keep components small and focused (single responsibility)
- Use Tailwind CSS for styling, avoid inline styles
- Always handle loading and error states in UI

## Naming
- Components: PascalCase (e.g., UserCard.jsx)
- Hooks: camelCase with "use" prefix (e.g., useUserData.js)
- Files: match the component name
- Extensions: .js and .jsx only

## Performance
- Use React.memo for expensive components
- Lazy load routes and heavy components
- Optimize images with Next.js Image component