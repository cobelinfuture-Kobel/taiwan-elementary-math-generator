S44B_PixelUIFileScaffold

CURRENT_MAJOR_TASK = S44_PixelUIParallelVersion
CURRENT_SUBTASK = S44B_PixelUIFileScaffold
TASK_STATUS = SCAFFOLD_WRITTEN_CI_AND_DEPLOY_PENDING
OUTPUT = /pixel/ parallel UI scaffold files

## 1. Scope Check

S44B follows the S44A scope lock:

```text
Classic UI remains at /
Pixel UI is introduced at /pixel/
Shared generator / validator / renderer / registry must not be forked
No curriculum-content or G4A-U08 content work is allowed
```

## 2. Files Created

```text
site/pixel/index.html
site/pixel/pixel-theme.css
site/pixel/pixel-ui.js
site/pixel/assets/.gitkeep
```

## 3. Files Not Modified

```text
site/index.html
site/404.html
site/assets/browser/main.js
site/assets/browser/pipeline/**
site/assets/browser/state/**
site/modules/curriculum/**
tests/curriculum/**
```

## 4. Implementation Notes

- `/pixel/` now has a standalone HTML entry point.
- Pixel CSS is scoped through `body.pixel-page` and `.pixel-*` selectors.
- `pixel-ui.js` reads existing Batch A source units and visible KnowledgePoints through shared registry modules.
- The generate button remains disabled because S44B is only the scaffold milestone.
- No Pixel-specific generator, validator, registry, or PatternSpec file was created.

## 5. Acceptance Status

S44B local/static file-scope checks:

```text
/pixel/ scaffold files exist = PASS
Classic / files untouched = PASS
No generator fork = PASS
No validator fork = PASS
No registry fork = PASS
No curriculum source or PatternSpec modification = PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 6. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from a scope-locked route definition to actual `/pixel/` scaffold files.

2. 推進了哪一個系統節點？
   - WebUI route scaffold and public-site file surface.

3. 是否解除 blocker？
   - Yes. It removes the blocker "Need S44B scaffold files".

4. 是否增加新的 blocker？
   - No functional blocker, but CI and Pages deployment readback are required because this changes production-visible site files.

5. 下一個最短有效步驟是什麼？
   - S44B_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_SCOPE_LOCKED_CI_PASS
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_SCAFFOLD_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI now has a repo-backed /pixel/ route scaffold that preserves Classic UI and imports shared registry data without forking generator/validator logic.
REMAINING_BLOCKERS = ["Need Math CI Readback for S44B commits", "Need Deploy GitHub Pages readback because site/pixel changes public site surface", "Need S44C visual shell", "Need later shared registry/generator bridge"]
NEXT_SHORTEST_STEP = S44B_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S44B_SCAFFOLD_WRITTEN
REQUIRED_OPERATOR_ACTION = Run/provide Math CI Readback and Deploy GitHub Pages results for the latest S44B commit.
NEXT_RESUME_TASK = S44B_CIReadbackAndPagesDeployReadback
