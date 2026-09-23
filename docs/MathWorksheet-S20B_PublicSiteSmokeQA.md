# MathWorksheet-S20B Public Site Smoke QA

## Summary

`S20B BLOCKED`

The public-site smoke test could not pass because the required preflight gate failed and the deployed public site does not match the expected S20A/S20B feature surface.

## Public Site URL Tested

- `https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/`

## Browser / Access Method

- live-site HTML and JS fetched directly over HTTP
- repository Actions page fetched directly over HTTP
- local repo state checked with `git -c safe.directory=... status --short --branch`

## Preflight Result

Required clean-state gate failed.

Observed local status:

```text
## main...origin/main
 M site/404.html
 M site/assets/browser/main.js
 M site/assets/browser/state/config-state.js
 M site/assets/browser/ui/config-editor.js
 M site/assets/styles/app.css
 M site/index.html
 M site/modules/core/generate-expression.js
 M src/core/generate-expression.js
```

Per the S20B brief, public smoke QA should not proceed when the working tree is not clean.

## GitHub Actions Deployment Status

Observed on the repository Actions page:

- successful `Node Test` runs were visible
- a successful run titled `Publish browser worksheet generator to GitHub Pages docs` was visible in the page content
- a distinct `Deploy GitHub Pages` workflow status was not confirmed from the fetched Actions page content

Result:

- deployment status is not fully verified to the level required by the brief

## Live Public Site Findings

### 1. Page load

The public site root HTML loads successfully over HTTP.

Confirmed:

- page responds successfully
- stylesheet link is relative: `./assets/styles/app.css`
- module entry path is relative: `./assets/browser/main.js`
- Traditional Chinese text is present in the deployed HTML

### 2. 404 page

The deployed `404.html` loads successfully.

Confirmed:

- `lang="zh-Hant"`
- relative stylesheet path
- relative module path
- Traditional Chinese content is present

### 3. Operator symbol display

Observed in deployed HTML:

- `加法 +`
- `減法 -`
- `乘法 ?`
- `除法 繩`

No obvious HTML-level corruption was found in the deployed source for these labels.

### 4. Deployment mismatch: `answerMax` control missing

This is the main blocker.

The deployed public `index.html` does **not** contain the S20A `answerMax` control block.

Evidence from deployed HTML:

- no `id="answer-max-input"`
- no answer-maximum control section

Evidence from deployed `assets/browser/main.js`:

- no `answerMax`
- no `answer-max-input`

This means the live public site does not expose the feature surface required by the S20B smoke checklist for:

- addition with answer max
- subtraction with answer max
- multiplication with answer max
- division with answer max
- mixed operators with global range plus answer max

## Smoke Checklist Result

### Addition large range

- not fully executed interactively
- blocked by deployment mismatch and lack of clean-state preflight

### `answerMax` result

- `BLOCKER`
- live public site does not expose the `answerMax` control
- required S20A/S20B scenarios cannot be validated on the deployed site

### Multiplication / division symbol result

- HTML-level source check passed
- deployed labels show `?` and `繩`

### Preview / answer-key synchronization

- not fully validated in a real interactive browser session
- blocked by preflight failure and deployment mismatch

### Validation messaging

- not fully validated on the public deployed site
- blocked because the smoke run should not continue after dirty working tree

### Console error result

- not verified in a live browser DevTools session
- HTTP asset fetches succeeded, but this is not a substitute for a browser console check

## Relative Path / Static Deployment Check

The deployed public site still appears GitHub Pages compatible at the file-path level:

- relative stylesheet path
- relative module path
- no absolute local filesystem paths detected in the fetched root HTML

However, compatibility is secondary to the blocker that the deployed artifact is behind the expected feature set.

## Remaining Issues

Blockers:

- working tree is not clean, so the S20B preflight gate fails
- live deployed site is missing the `answerMax` UI/control surface required by S20A/S20B
- GitHub Actions deployment verification is incomplete because `Deploy GitHub Pages` was not clearly confirmed from the fetched Actions page

Non-blocking:

- none recorded separately, because blocker-level issues already prevent pass

## Final Decision

`S20B BLOCKED`

Reason:

- required preflight was not satisfied
- live public site does not include the required `answerMax` functionality
- full public smoke scenarios cannot be completed against the currently deployed artifact

## Recommended Next Task

`S20C_PublicSiteRegressionFix`
