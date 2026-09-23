S45A_SharedRegistryLoaderBridge

CURRENT_MAJOR_TASK = S45_PixelUISharedCoreBridge
CURRENT_SUBTASK = S45A_SharedRegistryLoaderBridge
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Pixel UI shared registry loader bridge

## 1. Scope Check

S45A continues the Pixel UI path after S44C:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse existing Batch A source-unit registry
- Reuse existing Batch A visible KnowledgePoint registry
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not modify curriculum-content modules
- Do not continue G4A-U08 content-quality work
```

## 2. Files Created

```text
site/pixel/pixel-registry-bridge.js
tests/ui/pixel-registry-bridge.test.js
```

## 3. Files Modified

```text
site/pixel/pixel-ui.js
```

## 4. Files Not Modified

```text
site/index.html
site/404.html
site/assets/browser/main.js
site/assets/browser/pipeline/**
site/assets/browser/state/**
site/modules/curriculum/**
tests/curriculum/**
```

## 5. Implementation Notes

`site/pixel/pixel-registry-bridge.js` centralizes Pixel UI access to shared curriculum registries:

```text
listPixelSourceOptions()
getPixelSourceOption(sourceId)
listPixelKnowledgePointsForSource(sourceId)
getPixelSourceSummary(sourceId)
getPixelRegistrySnapshot()
```

The bridge imports from existing shared modules:

```text
site/modules/curriculum/batch-a/source-units.js
site/modules/curriculum/registry/batch-a-selector-extension.js
```

`site/pixel/pixel-ui.js` now consumes this bridge instead of reading registry modules directly. This keeps Pixel UI registry loading separate from DOM rendering and prevents future UI tasks from creating duplicate registry data.

## 6. Test Coverage

New tests verify:

```text
- Pixel registry bridge exposes the same 13 Batch A source units as the shared source-unit registry.
- Pixel source summaries match shared visible KnowledgePoint counts.
- Pixel registry snapshot visibleKnowledgePointCount matches BATCH_A_SELECTOR_AVAILABILITY.visibleCount.
- G4A-U08 visible KnowledgePoints are present through the shared registry bridge without a Pixel-only registry fork.
```

## 7. Acceptance Status

```text
Shared registry bridge created = STATIC PASS
Pixel UI uses bridge = STATIC PASS
No generator fork = STATIC PASS
No validator fork = STATIC PASS
No registry data fork = STATIC PASS
Tests added = STATIC PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 8. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moves Pixel UI from visual shell to shared registry bridge, enabling later selectors and generation state to use common Batch A data.

2. 推進了哪一個系統節點？
   - WebUI shared-data bridge / registry loader layer.

3. 是否解除 blocker？
   - Yes. It removes the blocker "Need S45A shared registry loader bridge" at implementation level.

4. 是否增加新的 blocker？
   - No functional blocker. CI and Pages deployment readback are required because site-visible JS changed.

5. 下一個最短有效步驟是什麼？
   - S45A_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_VISUAL_SHELL_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_SHARED_REGISTRY_BRIDGE_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI now has a shared registry bridge that reads the authoritative Batch A source and KnowledgePoint registries without data duplication.
REMAINING_BLOCKERS = ["Need Math CI Readback for S45A", "Need Deploy GitHub Pages readback for S45A", "Need Pixel KnowledgePoint selector state", "Need Pixel generate-button integration", "Need Pixel print/answer-key path"]
NEXT_SHORTEST_STEP = S45A_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S45A_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S45A commit.
NEXT_RESUME_TASK = S45A_CIReadbackAndPagesDeployReadback
