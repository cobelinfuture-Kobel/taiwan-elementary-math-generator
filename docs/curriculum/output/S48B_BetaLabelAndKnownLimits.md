S48B_BetaLabelAndKnownLimits

CURRENT_MAJOR_TASK = S48_PixelUIVersionAndReleaseSurface
CURRENT_SUBTASK = S48B_BetaLabelAndKnownLimits
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Public Pixel beta scope and known-limits surface

## 1. Scope Check

```text
- Preserve Classic UI at /
- Preserve Pixel UI at /pixel/
- Clarify what the Pixel beta currently supports
- Clarify limits without changing generator / validator / renderer behavior
- Keep known limits grounded in current public registry and UI state
- Do not continue unrelated curriculum-content tasks
```

## 2. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-selector.css
```

## 3. Files Created

```text
tests/ui/pixel-beta-known-limits.test.js
```

## 4. Public Beta Surface

The Pixel page now exposes a dedicated section:

```text
目前可用功能與已知限制
```

Current capability statements:

```text
- Public Batch A units and QA-passed KnowledgePoints
- Source-unit generation
- Single-KnowledgePoint generation
- Same-unit KnowledgePoint mixing
- Question count / ordering / answer-key / print-layout settings
- HTML preview and print
```

Known-limit statements:

```text
- Cross-unit KnowledgePoint mixing is not open.
- Hidden, unpublished, or not-yet-QA-passed KnowledgePoints do not appear.
- Refreshing the page does not preserve settings, generated worksheets, or student response history.
- Units and patterns outside the currently public registry cannot be selected from Pixel UI.
```

The notice also links the user back to Classic as the stable alternative.

## 5. Presentation Rules

```text
- Capability and limitation cards are visually distinct.
- The notice collapses to one column on narrower screens.
- The notice is excluded from worksheet printing.
- No JavaScript is required to read the limitations.
```

## 6. Test Coverage

New tests verify:

```text
- Pixel beta data attribute and labels exist.
- Dedicated known-limits region exists.
- All four current limitations are present.
- Classic-return wording remains present.
- Responsive card styling exists.
- Print CSS hides the beta notice.
```

## 7. Shared-Core Integrity

No generator, validator, renderer, registry, selector-state, worksheet-state, or PatternSpec file was modified.

## 8. Acceptance Status

```text
Beta label surface = STATIC PASS
Known-limits surface = STATIC PASS
Responsive styling = STATIC PASS
Print exclusion = STATIC PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 9. Closeout

1. 本任務縮短了哪一段距離？
   - It moves Pixel UI from a functional beta with implicit constraints to a public beta with explicit supported scope and limits.
2. 推進了哪一個系統節點？
   - WebUI release communication / PublicRelease safety surface.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need Pixel beta/known-limits surface".
4. 是否增加新的 blocker？
   - No functional blocker. CI and Pages readback are required because public site files changed.
5. 下一個最短有效步驟是什麼？
   - S48B_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_DUAL_VERSION_SWITCH_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_BETA_LIMITS_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel users can now see what is supported, what remains unavailable, and when to return to Classic before generating or printing a worksheet.
REMAINING_BLOCKERS = ["Need Math CI Readback for S48B", "Need Deploy GitHub Pages readback for S48B", "Need broader Pixel functional QA", "Need final production gate"]
NEXT_SHORTEST_STEP = S48B_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S48B_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success for the latest S48B commit.
NEXT_RESUME_TASK = S48B_CIReadbackAndPagesDeployReadback
