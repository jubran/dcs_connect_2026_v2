# Organize Project Command

## Goal
Read `src/myApp` and reorganize it into `src/myApp_v2` with dynamic, clean structure.

## Rules
- Do NOT modify any file in `src/myApp` (read only)
- Do NOT change `src/myApp/utils/API_ROUTES.js` in any way
- Work on `src/myApp_v2` only
- One folder at a time, wait for approval before moving to next
- Never create more than 3 files per step

## Steps

### Step 1: Analyze
- Read ALL files in `src/myApp` recursively
- Map relationships between files (who imports who)
- List all: Components, Hooks, Utils, API calls, Constants
- Show the map to the user before doing anything

### Step 2: Plan
- Propose the new folder structure for `src/myApp_v2`
- Show what will move where
- Wait for user approval

### Step 3: Create Structure (one folder at a time)
Proposed structure:
```
src/myApp_v2/
├── components/        # React components (dynamic, reusable)
├── hooks/             # Custom hooks (data fetching, state)
├── utils/
│   ├── API_ROUTES.js  # COPY ONLY, do not modify
│   └── helpers.js     # Dynamic helper functions
├── services/          # API call functions (dynamic, use API_ROUTES)
├── constants/         # All constants and configs
├── context/           # React context providers
└── index.js           # Main entry point
```

### Step 4: Make Everything Dynamic
- Components: accept props instead of hardcoded values
- API calls: use API_ROUTES.js as single source of truth
- Hooks: generic and reusable (e.g., useFetch, useForm)
- Constants: centralized in one place
- No hardcoded URLs, strings, or numbers anywhere

## What "Dynamic" Means
- Components receive data via props, not hardcoded
- API functions built from API_ROUTES.js automatically
- Hooks work for any endpoint, not just one
- Config values come from constants file
- Repeated logic extracted into reusable functions

## Important
- After each step show a summary of what was done
- Ask for approval before next step
- If something is unclear, ask before acting