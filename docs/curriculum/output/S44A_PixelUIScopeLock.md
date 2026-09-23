S44A_PixelUIScopeLock

CURRENT_MAJOR_TASK = S44_PixelUIParallelVersion
CURRENT_SUBTASK = S44A_PixelUIScopeLock
TASK_STATUS = SCOPE_LOCKED_CI_PENDING
OUTPUT = Pixel UI parallel-version scope lock document

## 1. Purpose

Lock the next UI line for the Taiwan Elementary Math Generator as a parallel Pixel UI version without replacing or destabilizing the existing Classic UI.

The user intent for this line is:

```text
Classic UI remains usable at /
Pixel UI is introduced as a separate beta entry at /pixel/
Both versions share the same generator / validator / renderer / registry path
The Pixel UI line advances toward GitHub Pages usable public UI
```

## 2. Preconditions Read

- Public repository AGENTS policy requires long tasks to reduce distance to the production-safe worksheet generation / Web UI / public release goal.
- Public repository AGENTS policy forbids scope expansion unless the task explicitly requires it.
- Existing Classic UI is currently served by `site/index.html` and uses `site/assets/browser/main.js`.
- Existing 404 fallback is currently served by `site/404.html` and also uses the Classic UI browser path.
- Existing browser path already supports Batch A source selection, KnowledgePoint selector, question-count input, ordering, answer-key toggle, preview iframe, print button, and shared worksheet document pipeline.

## 3. Scope Decision

S44 is a UI shell and public-site path task, not a curriculum-content task.

### In scope for S44A

```text
- Define Pixel UI as a parallel route, not a replacement.
- Preserve Classic UI at /.
- Preserve existing 404 fallback behavior unless a later milestone explicitly changes routing.
- Require Pixel UI to reuse shared generator / validator / worksheet renderer / registry modules.
- Define file boundaries for S44B scaffold.
- Define forbidden changes for the Pixel UI line.
- Define acceptance gates for the first Pixel UI milestones.
```

### Out of scope for S44A

```text
- No implementation of site/pixel/ files yet.
- No CSS theme implementation yet.
- No generator changes.
- No validator changes.
- No PatternSpec changes.
- No KnowledgePoint registry expansion.
- No G4A-U08 content-quality work.
- No PDF regeneration or semantic output smoke.
- No production promotion.
```

## 4. Parallel Version Rule

S44 must preserve two usable versions:

```text
Classic UI:
- route = /
- files = site/index.html, site/assets/browser/main.js, existing app.css / print-styles.css
- role = current stable public UI

Pixel UI:
- route = /pixel/
- files = site/pixel/index.html, site/pixel/pixel-theme.css, site/pixel/pixel-ui.js, site/pixel/assets/...
- role = beta visual shell first, then shared-function UI
```

The two UI versions may have different layouts and CSS, but must not fork the worksheet-generation core.

## 5. Shared Core Rule

Pixel UI must import or bridge to the same existing layers used by Classic UI:

```text
Shared data:
- Batch A source-unit registry
- Batch A KnowledgePoint selector registry
- PatternGroup / PatternSpec resolution

Shared execution:
- config state model
- buildWorksheetDocumentFromState
- renderPreviewFrame / printPreviewFrame or an equivalent shared renderer bridge
- batch-a browser generator router
- batch-a browser validator path

Shared output:
- worksheetDocument model
- generatedQuestions
- answerKeyItems
- print stylesheet path, unless a later print milestone explicitly adds a Pixel-specific print wrapper
```

Forbidden fork examples:

```text
- site/pixel/pixel-generator.js duplicating generator logic
- site/pixel/pixel-validator.js duplicating validator logic
- site/pixel/pixel-registry.json duplicating registry data
- separate Pixel-only PatternSpec definitions
```

## 6. File Boundary for S44B

S44B_PixelUIFileScaffold may create only the first scaffold files:

```text
site/pixel/index.html
site/pixel/pixel-theme.css
site/pixel/pixel-ui.js
site/pixel/assets/.gitkeep or equivalent placeholder if needed
```

S44B must not edit:

```text
site/modules/curriculum/**
site/assets/browser/pipeline/**
site/assets/browser/state/**
tests/curriculum/**
docs/curriculum/output/S56*/** or any G4A-U08 content line
```

S44B may read existing Classic UI files to keep element IDs, import paths, and shared behavior compatible.

## 7. Acceptance Gates

### S44A gate

```text
- Scope lock document exists.
- Classic UI remains declared as preserved.
- Pixel UI route is declared as /pixel/.
- Shared-core rule is explicit.
- G4A-U08 / generator / validator / curriculum-content work is explicitly blocked for this UI line.
```

### S44B gate

```text
- /pixel/ scaffold files exist.
- / remains Classic UI.
- No generator / validator / registry fork is introduced.
- No curriculum source or PatternSpec file is modified.
- Math CI Readback passes.
```

### S44C gate

```text
- Pixel visual shell renders header, left controls panel, center worksheet settings, right preview/status panel.
- Pixel CSS is scoped to /pixel/.
- No Classic UI visual regression is introduced.
- No print CSS regression is introduced.
```

## 8. Anti-Scope-Creep Gate

Before every next S44/S45/S46 task, verify:

```text
1. Does this directly advance the public Web UI path?
2. Does this preserve Classic UI?
3. Does this reuse the shared worksheet generation core?
4. Does this avoid curriculum-content expansion?
5. Is it the shortest next UI step?
```

If any answer is no, the task must stop and return to the Pixel UI shortest path.

## 9. Closeout

1. 本任務縮短了哪一段距離？
   - It moves WebUI from an unbounded visual idea to a locked parallel-version scope for implementation.

2. 推進了哪一個系統節點？
   - WebUI / PublicRelease planning boundary.

3. 是否解除 blocker？
   - Yes. It removes the ambiguity that caused the previous task to drift into G4A-U08 content work.

4. 是否增加新的 blocker？
   - No new functional blocker. CI readback is still required after commit.

5. 下一個最短有效步驟是什麼？
   - S44B_PixelUIFileScaffold.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_IDEA_UNSCOPED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_SCOPE_LOCKED_CI_PENDING
DISTANCE_REDUCED = Pixel UI changed from a discussion-level idea into a repo-recorded, bounded implementation line that preserves Classic UI and forbids curriculum/generator drift.
REMAINING_BLOCKERS = ["Need Math CI Readback for S44A docs commit", "Need S44B scaffold files", "Need S44C visual shell", "Need later shared registry bridge"]
NEXT_SHORTEST_STEP = S44A_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S44A_SCOPE_LOCK_WRITTEN
REQUIRED_OPERATOR_ACTION = Run or provide Math CI Readback for the S44A commit.
NEXT_RESUME_TASK = S44A_CIReadback
