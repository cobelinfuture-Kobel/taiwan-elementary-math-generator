S45D_PixelWorksheetSettingState

CURRENT_MAJOR_TASK = S45_PixelUISharedCoreBridge
CURRENT_SUBTASK = S45D_PixelWorksheetSettingState
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Pixel UI worksheet-setting controls backed by shared config state

## 1. Scope Check

S45D continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse shared Batch A config-state setters and worksheet-plan contract
- Reuse S45C selector state
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not enable worksheet generation yet
```

## 2. Files Created

```text
site/pixel/pixel-worksheet-state.js
tests/ui/pixel-worksheet-state.test.js
```

## 3. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-ui.js
site/pixel/pixel-selector.css
```

## 4. Implementation Notes

The Pixel worksheet settings now use the existing shared config-state module:

```text
createConfigState()
setBatchASourceId()
setBatchAQuestionCount()
setBatchAOrdering()
setBatchAIncludeAnswerKey()
setBatchAGenerationSeed()
setBatchAPrintLayout()
setBatchASelectorSelection()
getBatchAWorksheetPlan()
```

The following controls are now enabled:

```text
- question count: 1..200
- ordering: groupedByPattern / shuffleAcrossPatterns
- generation seed
- include answer key
- columns: 1..6
- rows per page: 1..20
```

The Pixel UI now renders a live worksheet-plan summary containing sourceId, selection mode, question count, ordering, selected KnowledgePoint count, answer-key setting, and print layout.

The generate button remains disabled because generator execution belongs to S46.

## 5. Shared-Core Integrity

`site/pixel/pixel-worksheet-state.js` is a UI bridge only. It imports and calls the existing shared config-state implementation and returns the existing `getBatchAWorksheetPlan()` contract.

No Pixel-only generator, validator, renderer, PatternSpec, KnowledgePoint, PatternGroup, or curriculum registry was created.

## 6. Test Coverage

New tests verify:

```text
- shared Batch A worksheet-plan defaults
- question-count, ordering, answer-key, seed, and print-layout updates
- shared bounds for question count and print layout
- S45C selector state maps to selectionMode / KnowledgePoint IDs / PatternGroup IDs in the shared worksheet plan
```

## 7. Acceptance Status

```text
Question-count control enabled = STATIC PASS
Ordering control enabled = STATIC PASS
Generation-seed control enabled = STATIC PASS
Answer-key control enabled = STATIC PASS
Print-layout controls enabled = STATIC PASS
Shared config state reused = STATIC PASS
Live worksheet-plan summary = STATIC PASS
Generate button remains disabled = PASS
Classic UI files untouched = STATIC PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 8. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from KnowledgePoint-selectable to a complete shared worksheet-plan input state.

2. 推進了哪一個系統節點？
   - WebUI worksheet configuration state / shared worksheet-plan contract.

3. 是否解除 blocker？
   - Yes. The blocker "Need Pixel worksheet-setting state" is removed at implementation level.

4. 是否增加新的 blocker？
   - No new functional blocker. CI and Pages deployment readback remain required because public-site files changed.

5. 下一個最短有效步驟是什麼？
   - S45D_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_KNOWLEDGE_POINT_SELECTOR_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_WORKSHEET_SETTING_STATE_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI now builds the authoritative shared worksheet-plan state from unit, KnowledgePoint, question, ordering, seed, answer-key, and print-layout controls.
REMAINING_BLOCKERS = ["Need Math CI Readback for S45D", "Need Deploy GitHub Pages readback for S45D", "Need S46A worksheet-plan resolver/generation bridge", "Need Pixel generate-button integration", "Need Pixel print/answer-key execution path"]
NEXT_SHORTEST_STEP = S45D_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S45D_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S45D commit.
NEXT_RESUME_TASK = S45D_CIReadbackAndPagesDeployReadback
