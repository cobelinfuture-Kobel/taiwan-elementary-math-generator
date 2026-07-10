S46A_PixelWorksheetGenerationBridge

CURRENT_MAJOR_TASK = S46_PixelUIGenerationIntegration
CURRENT_SUBTASK = S46A_PixelWorksheetGenerationBridge
TASK_STATUS = IMPLEMENTED_CI_PENDING
OUTPUT = Pixel UI bridge from shared worksheet state to shared generator / validator / worksheet-document pipeline

## 1. Scope Check

S46A continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse S45D shared config state and worksheet plan
- Call the existing buildWorksheetDocumentFromState() pipeline
- Reuse the existing Batch A generator, validator, answer-key model, pagination, and worksheetDocument contract
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not enable the public generate button yet; button integration belongs to S46B
```

## 2. Files Created

```text
site/pixel/pixel-generation-bridge.js
tests/ui/pixel-generation-bridge.test.js
```

## 3. Files Not Modified

```text
site/pixel/index.html
site/pixel/pixel-ui.js
site/index.html
site/404.html
site/assets/browser/pipeline/**
site/assets/browser/state/**
site/modules/curriculum/**
tests/curriculum/**
```

## 4. Implementation Notes

`site/pixel/pixel-generation-bridge.js` exposes:

```text
resolvePixelWorksheetGenerationRequest(state)
buildPixelWorksheetDocument(state)
```

The bridge reads the authoritative shared plan through `getPixelWorksheetPlan(state)` and executes the existing shared pipeline through `buildWorksheetDocumentFromState(state)`.

Preflight checks cover:

```text
- sourceId is present
- questionCount is an integer from 1 to 200
- single-KP mode has exactly one KnowledgePoint and at least one PatternGroup
- same-unit mixed-KP mode has at least two KnowledgePoints and PatternGroups
```

The bridge does not generate or validate questions itself. It only delegates to the existing shared pipeline and returns the shared `worksheetDocument`, validation, errors, and warnings with a Pixel integration stage marker.

## 5. Test Coverage

New tests verify:

```text
- source-unit Pixel state produces a shared worksheetDocument
- requested question count is preserved
- answer-key items are produced when enabled
- shared pipeline stores lastWorksheetDocument on state
- single-KP Pixel selection is preserved in worksheetDocument.batchA
- answer-key output is omitted when disabled
- malformed single-KP requests fail at Pixel preflight before generation
```

## 6. Acceptance Status

```text
Shared generation bridge created = STATIC PASS
Shared buildWorksheetDocumentFromState reused = STATIC PASS
Source-unit generation bridge covered = STATIC PASS
Single-KP generation bridge covered = STATIC PASS
Preflight error contract covered = STATIC PASS
No generator / validator / renderer fork = STATIC PASS
Public generate button remains disabled = PASS
Math CI Readback = PENDING
Deploy GitHub Pages = NOT REQUIRED FOR BEHAVIOR YET; module is not imported by public Pixel UI in S46A
```

## 7. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It connects the deployed Pixel worksheet-plan state to the authoritative generator / validator / worksheet-document pipeline behind a tested bridge.

2. 推進了哪一個系統節點？
   - WebUI-to-Generator bridge / Validator-backed worksheetDocument construction.

3. 是否解除 blocker？
   - Yes. The blocker "Need S46A worksheet generation bridge" is removed at implementation level.

4. 是否增加新的 blocker？
   - No new functional blocker. Math CI is required before S46B may import the bridge into the public UI.

5. 下一個最短有效步驟是什麼？
   - S46A_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_WORKSHEET_SETTING_STATE_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_GENERATION_BRIDGE_WRITTEN_CI_PENDING
DISTANCE_REDUCED = Pixel UI state can now be resolved and executed through the shared generator, validator, answer-key, pagination, and worksheetDocument pipeline without duplicating core logic.
REMAINING_BLOCKERS = ["Need Math CI Readback for S46A", "Need S46B public generate-button integration", "Need live worksheet preview", "Need Pixel print/answer-key execution path"]
NEXT_SHORTEST_STEP = S46A_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S46A_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback for the latest S46A commit.
NEXT_RESUME_TASK = S46A_CIReadback
