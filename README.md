# Math Worksheet Generator

瀏覽器數學練習卷產生器 (Traditional Chinese / 正體中文)

A static browser-based math worksheet generator for V1 integer expression worksheets, deployed to GitHub Pages.

## Features

- Generate addition, subtraction, multiplication, and division worksheets
- Configure operator selection, operand ranges, question count, and layout
- Preview worksheets in-browser with iframe print support
- Answer key pages generated through the assembly pipeline
- Deterministic shuffled ordering with configurable seeds
- Traditional Chinese UI (正體中文)
- Zero build step — static HTML/CSS/JS served directly

## Project Governance

Long-running project tasks must follow the root [`AGENTS.md`](AGENTS.md) execution rules.

This public repository shares the same core CI Readback Gate policy as the private development repository, with a public/stable release override:

- `Math CI Readback` is the authoritative task closeout workflow.
- `Deploy GitHub Pages` is the authoritative public release/deployment workflow.
- Do not request local `git pull origin main`, local `npm test`, or local `git status` as the standard closeout path unless the task explicitly involves unpushed local files, GitHub Actions is unavailable, or the operator requests local verification.

## Live Demo

After deployment to GitHub Pages, the site will be available at:

`https://<user>.github.io/math-worksheet-generator/`

## Run Locally

Local execution is available for development and debugging, but it is not the authoritative long-task closeout gate.

```bash
# Install dependencies
npm install

# Run tests
npm test

# Serve the static site
npm run site:serve
# Open http://127.0.0.1:4174/index.html
```

## Deployment

The site is automatically deployed to GitHub Pages on every push to `main` via GitHub Actions.

### Deployment Trigger
- Push to `main` branch
- Manual dispatch from the Actions tab (`workflow_dispatch`)

### Deployment Test Gate
`npm test` must pass before deployment proceeds.

### Deployed Directory
The `site/` directory is uploaded as the GitHub Pages artifact — not the repository root.

### Required Repository Setting
```
Settings → Pages → Build and deployment → Source → GitHub Actions
```

### First Deployment
After the first push to `main`, the deployment workflow will create the GitHub Pages environment. The site URL will be available in:

```
Settings → Pages → Visit site
```

### Manual Deployment
1. Go to the Actions tab
2. Select "Deploy GitHub Pages"
3. Click "Run workflow"

## Project Structure

```
site/                  # Deployed static site
  index.html           # Main browser app (Traditional Chinese)
  404.html             # Custom 404 page
  assets/
    browser/           # Browser-side JS modules
      main.js          # Entry point
      state/           # Config state, presets, query state
      pipeline/        # Build + render pipeline
      ui/              # Config editor UI controllers
    styles/            # App CSS + print CSS
  modules/
    core/              # Core engine (staged from src/)
    renderer/          # HTML renderer (staged from src/)
src/                   # Source modules (authoritative)
  core/
  renderer/
tests/                 # Node test suite
  core/
  renderer/
  site/
tools/                 # Dev tools, preview server
docs/                  # Design specs and task documentation
```

## Architecture

The browser app follows a clean pipeline:

```
UI Controls → Config State → Validate → Allocate → Generate
→ Assemble WorksheetDocument → Render HTML → iframe Preview → Print
```

Key constraints:
- No React/Vue/Svelte — vanilla JS modules
- No bundler/build step
- All public paths relative for subpath-safe GitHub Pages deployment
- Core math modules staged from `src/` to `site/modules/` (sync strategy documented)

## Testing

```bash
npm test
```

For project task closeout, do not use the local command above as the final source of truth. Use GitHub Actions CI readback as defined in `AGENTS.md`.

Test files:
- `tests/core/` — Expression evaluation, generation, validation, planning
- `tests/renderer/` — HTML renderer, preview shell, static preview workflow
- `tests/site/` — Site scaffold, browser bridge, Batch A source smoke QA, iframe preview QA

## Current Stage

S42 — Batch A browser worksheet production path closeout readiness.

CI readback policy is documented in `AGENTS.md`.

Closeout readiness note:

`docs/curriculum/output/S42_BatchA_WebWorksheetProductionPath_Closeout.md`
