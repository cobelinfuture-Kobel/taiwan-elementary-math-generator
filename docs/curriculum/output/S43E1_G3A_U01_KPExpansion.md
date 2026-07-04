# S43E1 — G3A-U01 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E1_G3A_U01_KPExpansion
TASK_STATUS = PASS_REGISTRY_EXPANSION
WRITE_TYPE = registry_update_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task begins S43E after S43C closeout. It only expands G3A-U01 registry coverage.

In scope:

```text
- Add G3A-U01 KnowledgePointNode rows
- Add G3A-U01 PatternGroup rows
- Add G3A-U01 KP to PatternSpec mapping rows
- Classify supportClass A/C/D
- Keep new G3A-U01 rows hidden or not_selectable until later projection/runtime QA
```

Out of scope:

```text
- Batch B/C/D/E
- G3A-U02 completion
- Other Batch A units
- Browser selector regeneration
- New generator implementation
- New validator implementation
- Same-unit mixed KP mode
- Cross-unit mixed KP mode
- Production release
```

## 2. Roadmap Preconditions

S43E is allowed only after:

```text
S43C_GATE = PASS
S43D single-KP selector gate is at least single-KP safe
```

Prior closeout established:

```text
S43C_STATUS = PASS_G3AU02_PROTOTYPE_CLOSED
S43C_GATE = PASS
FIRST_VISIBLE_KP = kp_g3a_u02_add_multi_carry
VISIBLE_KP_COUNT = 1
SINGLE_KP_HTML_PATH = PASS
SOURCE_UNIT_PATH = PRESERVED
MIXED_MODE_STATUS = DISABLED_NOT_STARTED
S43E_ENTRY_ALLOWED = YES
```

## 3. Inputs Inspected

```text
- docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
- docs/curriculum/output/S43C15_G3AU02PrototypeCloseout.md
- site/modules/curriculum/batch-a/source-units.js
- site/modules/curriculum/batch-a/source-pattern-index.js
- data/curriculum/registry/batch_a_knowledge_points.json
- data/curriculum/registry/batch_a_pattern_groups.json
- data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

Relevant existing runtime source-pattern index:

```text
g3a_u01_3a01 → ps_g3a_u01_4digit_compare
```

## 4. Files Modified

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
docs/curriculum/output/S43E1_G3A_U01_KPExpansion.md
```

No runtime code files were changed.

## 5. KnowledgePointNode Rows Added for G3A-U01

```text
A-class existing runtime-supported row:
- kp_g3a_u01_4digit_compare

C-class implementation-required candidate rows:
- kp_g3a_u01_place_value_decomposition
- kp_g3a_u01_place_value_composition
- kp_g3a_u01_number_reading_writing
- kp_g3a_u01_digit_card_max_min
- kp_g3a_u01_money_representation

D-class out-of-S43E1-scope rows:
- kp_g3a_u01_number_line_reading
- kp_g3a_u01_between_numbers_pattern
```

Count:

```text
G3A_U01_KP_ROWS_ADDED = 8
A = 1
C = 5
D = 2
```

## 6. PatternGroup Rows Added for G3A-U01

```text
A-class existing runtime-supported PatternGroup:
- pg_g3a_u01_4digit_compare → ps_g3a_u01_4digit_compare

C-class candidate PatternGroups:
- pg_g3a_u01_place_value_decomposition → ps_g3a_u01_place_value_decomposition_candidate
- pg_g3a_u01_place_value_composition → ps_g3a_u01_place_value_composition_candidate
- pg_g3a_u01_number_reading_writing → ps_g3a_u01_number_reading_writing_candidate
- pg_g3a_u01_digit_card_max_min → ps_g3a_u01_digit_card_max_min_candidate
- pg_g3a_u01_money_representation → ps_g3a_u01_money_representation_candidate

D-class not-selectable PatternGroups:
- pg_g3a_u01_number_line_reading
- pg_g3a_u01_between_numbers_pattern
```

Count:

```text
G3A_U01_PATTERN_GROUP_ROWS_ADDED = 8
```

## 7. KP to PatternSpec Map Rows Added for G3A-U01

```text
A-class runtime mapping:
- map_g3a_u01_4digit_compare_existing_runtime

C-class candidate mappings:
- map_g3a_u01_place_value_decomposition_candidate
- map_g3a_u01_place_value_composition_candidate
- map_g3a_u01_number_reading_writing_candidate
- map_g3a_u01_digit_card_max_min_candidate
- map_g3a_u01_money_representation_candidate

D-class out-of-scope mappings:
- map_g3a_u01_number_line_reading_out_of_scope
- map_g3a_u01_between_numbers_pattern_out_of_scope
```

Count:

```text
G3A_U01_KP_PATTERN_MAP_ROWS_ADDED = 8
```

## 8. Exposure Policy

```text
G3A_U01_HTML_SELECTOR_EXPOSURE = false
BROWSER_REGISTRY_REGENERATED = false
VISIBLE_KP_COUNT_CHANGE = none
```

Reason:

```text
S43E1 is registry expansion only. It does not regenerate the browser selector projection and does not expose new G3A-U01 KnowledgePoints in HTML.
```

Policy by class:

```text
A-class G3A-U01 row:
  htmlSelectableStatus = hidden
  visibilityStatus = hidden
  holdReason = s43e_registry_only_pending_selector_projection_qa

C-class rows:
  htmlSelectableStatus = hidden
  visibilityStatus = hidden
  holdReason = new_generator_validator_required

D-class rows:
  htmlSelectableStatus = not_selectable
  visibilityStatus = not_selectable
```

## 9. Gate Check

```text
S43E1_GATE = PASS
```

Checks:

```text
PASS — G3A-U01 has KnowledgePointNode list
PASS — G3A-U01 has PatternGroup list
PASS — G3A-U01 has KP to PatternSpec map rows
PASS — supported existing runtime row has PatternGroup / PatternSpec path
PASS — C-class rows have candidate PatternSpec IDs and explicit implementation blockers
PASS — D-class rows have explicit blocked reasons
PASS — D-class rows remain not_selectable
PASS — no browser selector regeneration performed
PASS — no mixed KP mode enabled
PASS — no runtime code changed
```

## 10. Test / Readback Status

```text
GITHUB_FETCH_READBACK = PASS
NPM_TEST = NOT_RUN_THIS_STEP
REASON = connector-only registry/documentation update; no local runtime execution available in this step
```

The latest fetched registry files show the S43E1 task marker and G3A-U01 source scope.

## 11. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3AU02_PROTOTYPE_CLOSED_READY_FOR_BATCH_A_KP_EXPANSION
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_STARTED_WITH_G3A_U01_REGISTRY_COVERAGE
DISTANCE_REDUCED     = started S43E by giving G3A-U01 KnowledgePoint / PatternGroup / KP→PatternSpec registry coverage
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 added; G3A-U02 prototype exists
PatternGroup registry           G3A-U01 added; G3A-U02 prototype exists
KP → PatternSpec map            G3A-U01 added; G3A-U02 prototype exists
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    1 / 13 units started after prototype
S43 overall                     in progress
```

## 12. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3A-U01 candidate C rows require generator and validator implementation before exposure",
  "G3A-U01 D rows remain out of S43E1 printable scope",
  "Browser selector projection was not regenerated for G3A-U01",
  "Only G3A-U02 add-multi-carry remains visible/selectable in HTML",
  "S43E2 G3A-U02 KPExpansionCompletion has not started",
  "S43E3–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 13. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E2_G3A_U02_KPExpansionCompletion
```

Rationale:

```text
S43E1 created G3A-U01 registry coverage without exposing unsupported selector paths.
The roadmap order places G3A-U02 completion next.
S43E2 should complete the U02 KP registry beyond the first visible add-multi-carry prototype while preserving hidden / D-class boundaries.
```

## 14. Closeout

```text
TASK = S43E1_G3A_U01_KPExpansion
STATUS = PASS_REGISTRY_EXPANSION
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 1_OF_13_UNITS_STARTED_AFTER_PROTOTYPE
NEXT = S43E2_G3A_U02_KPExpansionCompletion
```
