S45B_PixelUnitSelector

CURRENT_MAJOR_TASK = S45_PixelUISharedCoreBridge
CURRENT_SUBTASK = S45B_PixelUnitSelector
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Pixel UI grade / semester / unit selector

## 1. Scope Check

S45B continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse the S45A shared registry bridge
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not modify curriculum-content modules
- Do not continue G4A-U08 content-quality work
```

## 2. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-registry-bridge.js
site/pixel/pixel-ui.js
tests/ui/pixel-registry-bridge.test.js
```

## 3. Implementation Notes

The Pixel sidebar now exposes three linked selectors:

```text
年級
學期
單元
```

The selector path is driven only by shared Batch A source-unit data.

New bridge helpers:

```text
listPixelGrades()
listPixelSemestersForGrade(grade)
listPixelSourceOptionsByFilter({ grade, semester })
```

Selection behavior:

```text
- grade change refreshes available semesters and units;
- semester change refreshes available units;
- unit change refreshes source summary, domain, and visible KnowledgePoint count;
- selected sourceId is recorded in body.dataset.pixelSelectedSourceId for later state/generator integration;
- no worksheet generation is enabled in S45B.
```

## 4. Test Coverage

The UI registry tests now verify:

```text
- grades = [3, 4, 5]
- grade 3 has upper/lower semesters
- grade 5 currently has upper semester only
- grade 3 upper filters to the four authoritative G3A sourceIds
- grade 4 lower filters to g4b_u01_4b01
- grade 5 upper filters to g5a_u08_5a08
- no Pixel-only sourceId is introduced
```

## 5. Acceptance Status

```text
Grade selector implemented = STATIC PASS
Semester selector implemented = STATIC PASS
Unit selector implemented = STATIC PASS
Shared registry bridge reused = STATIC PASS
Classic UI files untouched = STATIC PASS
Generator/validator still not forked = STATIC PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 6. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from registry-readable to user-selectable grade/semester/unit navigation.

2. 推進了哪一個系統節點？
   - WebUI selector state and source-unit selection surface.

3. 是否解除 blocker？
   - Yes. The blocker "Need S45B Pixel unit selector" is removed at implementation level.

4. 是否增加新的 blocker？
   - No functional blocker. CI and Pages deployment readback are required because public-site files changed.

5. 下一個最短有效步驟是什麼？
   - S45B_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_SHARED_REGISTRY_BRIDGE_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_UNIT_SELECTOR_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI can now navigate authoritative Batch A units by grade and semester while preserving the shared registry path.
REMAINING_BLOCKERS = ["Need Math CI Readback for S45B", "Need Deploy GitHub Pages readback for S45B", "Need Pixel KnowledgePoint selector state", "Need Pixel generate-button integration", "Need Pixel print/answer-key path"]
NEXT_SHORTEST_STEP = S45B_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S45B_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S45B commit.
NEXT_RESUME_TASK = S45B_CIReadbackAndPagesDeployReadback
