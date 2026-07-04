# S43C15 — G3A-U02 Prototype Closeout

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C15_G3AU02PrototypeCloseout
TASK_STATUS = PASS
WRITE_TYPE = closeout_documentation_only
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This closeout only evaluates and records the S43C G3A-U02 prototype gate.

In scope:

```text
- Confirm first G3A-U02 visible KnowledgePoint path
- Confirm browser-visible selector projection state
- Confirm hidden / D-class rows remain unavailable
- Confirm source-unit worksheet path remains preserved
- Confirm S43C can close and S43E may start
```

Out of scope:

```text
- Batch B/C/D/E
- Additional G3A-U02 KnowledgePoint promotion
- Same-unit multi-KP enablement
- Cross-unit multi-KP enablement
- New generator variants
- New validator variants
- Production release
```

## 2. Inputs Inspected

```text
- docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
- data/curriculum/registry/batch_a_knowledge_points.json
- data/curriculum/registry/batch_a_pattern_groups.json
- data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
- site/modules/curriculum/registry/batch-a-selector-candidates.js
- site/index.html
- site/assets/browser/main.js
- site/assets/browser/state/config-state.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- prior S43C14R2R1 public-main readback summary
```

## 3. S43C Gate Readback

### Gate 1 — first G3A-U02 KP is legitimately visible/selectable

```text
PASS
```

Evidence:

```text
knowledgePointId = kp_g3a_u02_add_multi_carry
sourceId = g3a_u02_3a02
htmlSelectableStatus = selectable
supportClass = A
```

The corresponding PatternGroup is visible and mapped to:

```text
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
```

### Gate 2 — visibleCount = 1 after registry regeneration

```text
PASS
```

Browser selector projection records:

```text
visibleCount = 1
hiddenPendingCount = 1
notSelectableCount = 2
```

Visible KP list contains only:

```text
kp_g3a_u02_add_multi_carry
```

### Gate 3 — hidden and D rows remain hidden / not_selectable

```text
PASS
```

Rows preserved as non-visible:

```text
kp_g3a_u02_sub_multi_borrow
  htmlSelectableStatus = hidden
  holdReason = qa_pending

kp_g3a_u02_estimate_nearest_thousand
  htmlSelectableStatus = not_selectable
  holdReason = planned_only

kp_g3a_u02_word_problem_estimation_add_sub
  htmlSelectableStatus = not_selectable
  holdReason = word_problem_template_required
```

### Gate 4 — resolver positive fixture passes

```text
PASS
```

The promoted mapping records:

```text
mappingId = map_g3a_u02_add_multi_carry_seed
mappingStatus = qa_verified_mapped
constraintStatus = carry_policy_verified
qaStatus = qa_verified
```

The browser projection exposes the same PatternGroup through `getVisiblePatternGroupsForKnowledgePoint` and resolves the PatternSpec through `resolveVisiblePatternSpecIdsForKnowledgePoint`.

### Gate 5 — query survival for visible KP passes

```text
PASS
```

Selector normalization preserves only visible KnowledgePoint IDs and visible PatternGroup IDs. Invalid, hidden, or unavailable IDs are dropped through selector warning handling.

Relevant warning codes remain:

```text
selector_id_dropped
selector_mode_fallback
no_visible_knowledge_points
```

### Gate 6 — HTML can select the single visible KP

```text
PASS
```

HTML exposes `singleKnowledgePoint` mode while keeping both mixed modes disabled:

```text
sourceUnit = enabled
singleKnowledgePoint = enabled when visibleCount > 0
mixedKnowledgePointsSameUnit = disabled
mixedKnowledgePointsCrossUnit = disabled
```

The UI reads the first visible KP for the current source and resolves its first visible PatternGroup before generation.

### Gate 7 — sourceUnit worksheet path remains unaffected

```text
PASS
```

The browser state still falls back to `sourceUnit` when no valid visible KP selection exists. The worksheet builder continues to support both:

```text
batchASourceId
batchAKnowledgePoint
```

The worksheet provenance records selected KnowledgePoint and PatternGroup IDs only when KnowledgePoint mode is active.

### Gate 8 — npm test or CI PASS observed

```text
PASS_FROM_PRIOR_READBACK
```

Prior readback state:

```text
S43C14R2R1 = PASS
public-main npm test = 312 pass / 0 fail
worktree = clean
```

This S43C15 closeout did not introduce runtime code changes; it only records the prototype closeout.

## 4. S43C Status

```text
S43C_STATUS = PASS_G3AU02_PROTOTYPE_CLOSED
S43C_GATE = PASS
FIRST_VISIBLE_KP = kp_g3a_u02_add_multi_carry
VISIBLE_KP_COUNT = 1
SINGLE_KP_HTML_PATH = PASS
SOURCE_UNIT_PATH = PRESERVED
MIXED_MODE_STATUS = DISABLED_NOT_STARTED
```

## 5. Artifact Summary

Created:

```text
docs/curriculum/output/S43C15_G3AU02PrototypeCloseout.md
```

Modified:

```text
none besides this closeout document
```

Deleted:

```text
none
```

Runtime implementation changed:

```text
false
```

## 6. Anti-Scope-Creep Check

```text
PASS
```

Verified:

```text
- No Batch B/C/D/E changes
- No new UI feature beyond existing single-KP path
- No same-unit mixed KP mode enabled
- No cross-unit mixed KP mode enabled
- No new generator variant added
- No new validator variant added
- No hidden / D-class row exposure
- No production release claim
```

## 7. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_READY_FOR_G3AU02_PROTOTYPE_CLOSEOUT
GOAL_DISTANCE_AFTER  = D1_G3AU02_PROTOTYPE_CLOSED_READY_FOR_BATCH_A_KP_EXPANSION
DISTANCE_REDUCED     = closed the first visible KnowledgePoint prototype gate and removed the S43C closeout blocker
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         prototype-pass for G3A-U02 only
PatternGroup registry           prototype-pass for G3A-U02 only
KP → PatternSpec map            prototype-pass for G3A-U02 only
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         pass for first visible G3A-U02 KP
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    0% / not started
S43 overall                     in progress
```

## 8. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "Batch A 13-unit KnowledgePoint expansion has not started",
  "Only one G3A-U02 KnowledgePoint is currently visible/selectable",
  "G3A-U02 hidden borrow seed remains qa_pending",
  "D-class estimation and word-problem rows remain out of S43 printable scope",
  "Same-unit multi-KP mode remains disabled",
  "Cross-unit multi-KP mode remains disabled",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started",
  "S43H final closeout has not started"
]
```

## 9. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E1_G3A_U01_KPExpansion
```

Rationale:

```text
S43C prototype gate is closed.
S43D single-KP selector path is safe enough for one visible KP.
The next effective reduction is to begin Batch A 13-unit KnowledgePoint expansion, starting with G3A-U01 per roadmap order.
```

## 10. Closeout

```text
TASK = S43C15_G3AU02PrototypeCloseout
STATUS = PASS
GOAL_DISTANCE_UPDATED = YES
S43C_GATE = PASS
S43E_ENTRY_ALLOWED = YES
NEXT = S43E1_G3A_U01_KPExpansion
```
