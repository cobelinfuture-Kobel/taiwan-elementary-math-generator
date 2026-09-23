S45C_PixelKnowledgePointSelector

CURRENT_MAJOR_TASK = S45_PixelUISharedCoreBridge
CURRENT_SUBTASK = S45C_PixelKnowledgePointSelector
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Pixel UI KnowledgePoint selection surface and deterministic selector state

## 1. Scope Check

S45C continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse authoritative Batch A source / KnowledgePoint / PatternGroup data
- Reuse shared BATCH_A_SELECTION_MODES constants
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not modify curriculum-content modules
- Do not enable worksheet generation yet
```

## 2. Files Created

```text
site/pixel/pixel-selector-state.js
site/pixel/pixel-selector.css
tests/ui/pixel-selector-state.test.js
```

## 3. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-ui.js
site/pixel/pixel-registry-bridge.js
```

## 4. Implementation Notes

The Pixel sidebar now exposes the shared Batch A selection modes that are currently supported:

```text
sourceUnit = 單元出題
singleKnowledgePoint = 單一知識點加強
mixedKnowledgePointsSameUnit = 同單元知識點混合
```

Cross-unit mixing remains unavailable in this milestone.

The UI now renders only visible KnowledgePoints returned by the existing shared selector registry. Each visible item shows:

```text
- displayName
- unitCode
- qaStatusLabel
- PatternSpec count
- selected / not selected state
```

Selector behavior:

```text
- sourceUnit clears KnowledgePoint and PatternGroup selections;
- singleKnowledgePoint selects exactly one visible KnowledgePoint;
- mixedKnowledgePointsSameUnit requires at least two selected KnowledgePoints;
- switching source units sanitizes stale KnowledgePoint IDs;
- unknown / hidden / cross-unit IDs are dropped from Pixel selector state;
- selected PatternGroup IDs are derived from the shared visible KnowledgePoint entries;
- selected source / mode / KnowledgePoint IDs / PatternGroup IDs are exposed through body.dataset for S45D/S46 integration.
```

## 5. Shared-Core Integrity

`site/pixel/pixel-selector-state.js` imports `BATCH_A_SELECTION_MODES` from the existing shared config-state module and reads KnowledgePoints only through `pixel-registry-bridge.js`, which itself reads the authoritative Batch A selector registry.

No Pixel-only curriculum registry, generator, validator, renderer, PatternSpec, KnowledgePoint, or PatternGroup definition was created.

## 6. Test Coverage

New tests verify:

```text
- shared mode availability follows visible KnowledgePoint count;
- single-KP mode selects one visible KnowledgePoint and one PatternGroup;
- same-unit mixed mode selects multiple visible KnowledgePoints;
- same-unit mixed mode cannot be reduced below two selections;
- unknown KnowledgePoint IDs are dropped;
- source-unit mode clears KnowledgePoint and PatternGroup selections.
```

## 7. Acceptance Status

```text
Selection-mode control implemented = STATIC PASS
Visible KnowledgePoint panel implemented = STATIC PASS
Single-KP state implemented = STATIC PASS
Same-unit mixed-KP state implemented = STATIC PASS
Unknown/hidden ID sanitization implemented = STATIC PASS
PatternGroup derivation implemented = STATIC PASS
Classic UI files untouched = STATIC PASS
Generator/validator still not forked = STATIC PASS
Worksheet generation remains disabled = PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 8. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from unit-selectable to KnowledgePoint-selectable using the shared registry and selection-mode contract.

2. 推進了哪一個系統節點？
   - WebUI KnowledgePoint selector state / PatternGroup selection bridge.

3. 是否解除 blocker？
   - Yes. The blocker "Need Pixel KnowledgePoint selector state" is removed at implementation level.

4. 是否增加新的 blocker？
   - No new functional blocker. CI and Pages deployment readback are required because public-site files changed.

5. 下一個最短有效步驟是什麼？
   - S45C_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_UNIT_SELECTOR_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_KNOWLEDGE_POINT_SELECTOR_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI can now select authoritative visible KnowledgePoints and derive PatternGroup IDs for source-unit, single-KP, and same-unit mixed-KP modes.
REMAINING_BLOCKERS = ["Need Math CI Readback for S45C", "Need Deploy GitHub Pages readback for S45C", "Need Pixel worksheet-setting state", "Need Pixel generate-button integration", "Need Pixel print/answer-key path"]
NEXT_SHORTEST_STEP = S45C_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S45C_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S45C commit.
NEXT_RESUME_TASK = S45C_CIReadbackAndPagesDeployReadback
