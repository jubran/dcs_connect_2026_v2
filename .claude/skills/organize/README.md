# Skill: Organize Project

## Goal
Copy `src/myApp` into `src/myApp_v2` and make everything dynamic.

## Rules
- NEVER modify files in `src/myApp`
- NEVER modify `src/myApp/utils/API_ROUTES.js`
- Work ONLY in `src/myApp_v2`
- One folder at a time, wait for approval
- Use PowerShell commands only (Windows)
- Never create more than 3 files per step

## Windows Copy Commands
```powershell
# Create folder
powershell.exe -Command "New-Item -ItemType Directory -Force -Path 'D:\web\dcs_2026_v2\src\myApp_v2\FOLDER_NAME'"

# Copy folder contents
powershell.exe -Command "Copy-Item -Path 'D:\web\dcs_2026_v2\src\myApp\FOLDER_NAME\*' -Destination 'D:\web\dcs_2026_v2\src\myApp_v2\FOLDER_NAME\' -Recurse -Force"

# Copy entire myApp at once
powershell.exe -Command "Copy-Item -Path 'D:\web\dcs_2026_v2\src\myApp' -Destination 'D:\web\dcs_2026_v2\src\myApp_v2' -Recurse -Force"
```

## Steps

### Step 1: Copy entire folder
```powershell
powershell.exe -Command "Copy-Item -Path 'D:\web\dcs_2026_v2\src\myApp' -Destination 'D:\web\dcs_2026_v2\src\myApp_v2' -Recurse -Force"
```

### Step 2: Analyze relationships
- Map who imports who
- Find repeated logic
- Find hardcoded values

### Step 3: Make dynamic (one folder at a time)
Order: utils → hooks → services → components → pages

## What "Dynamic" Means
- No hardcoded URLs → use API_ROUTES.js
- No hardcoded strings → use constants
- Components receive data via props
- Hooks work for any endpoint (generic)
- Repeated logic extracted to shared utils