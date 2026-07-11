# S59I-R1 — G4B-U01 Query-State and Public Error Mapping FullFix

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59I_R1_G4B_U01_QueryStateAndPublicErrorMapping_FullFix
TASK_STATUS = FULLFIX_IMPLEMENTED_CI_PENDING
```

## Trigger

The first S59I pull request revision added a QA contract and tests but did not include the implementation changes described by the task. CI exposed three contract mismatches:

1. `g4b_u01_4b01` was absent from the latest visible query-state lifecycle allowlist.
2. same-unit query parsing did not reject visible cross-unit KnowledgePoint IDs.
3. the S59I test file referenced APIs and Pixel controller paths that do not exist in the authoritative browser architecture.
4. G4B-U01 canonical, production and arithmetic validator codes did not have explicit Traditional Chinese public mappings.

This task is a FullFix. It does not weaken tests or bypass the public selector, resolver, validator, worksheet or renderer contracts.

## FullFix scope

### Query state

- add `g4b_u01_4b01` to the lifecycle-gated latest selector source set;
- preserve canonical `sourceId`, `selectionMode`, repeated `kp` and repeated `pg` query fields;
- require `singleKnowledgePoint` and `mixedKnowledgePointsSameUnit` selections to belong to the selected source;
- drop stale, hidden and cross-unit IDs;
- fall back to `sourceUnit` when a same-unit selection no longer satisfies its minimum KnowledgePoint count;
- preserve the existing explicit cross-unit mode contract without silently broadening it.

### Public messages

- add explicit Traditional Chinese mappings for the complete 24-code S59E arithmetic blocking registry;
- add canonical-route, production-eligibility and S59H production-lifecycle mappings;
- preserve internal KP/group/spec/template/context ID and source-ID redaction;
- retain the existing generic fallback for unknown raw codes.

### QA architecture alignment

- use `BATCH_A_SELECTION_MODES`, `setBatchASelectorSelection` and the existing config-state contract;
- use `createPixelKnowledgePointSelectorState`, `createPixelWorksheetState` and `runPixelWorksheetGeneration`;
- use the canonical query parameter names already written by `writeQueryStateFromState`;
- verify Classic, 404 fallback and Pixel surfaces using their actual paths and DOM identifiers;
- verify stale-print invalidation through the established Classic and Pixel print-surface controllers;
- verify all 24 arithmetic mappings exactly rather than accepting an unmapped generic fallback.

## Non-scope

```text
PatternSpec changes = none
generator changes = none
arithmetic validator changes = none
resolver allocation changes = none
worksheet contract changes = none
renderer profile changes = none
application mode = forbidden
vertical mode = forbidden
representation toggle = forbidden
S59J stress and HTML/PDF promotion = not started
```

## Acceptance

```text
PR CI = required
main merge = required
main CI readback = required
S59I PASS marker = only after both CI gates pass
```

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_S59I_IMPLEMENTATION_TEST_MISMATCH
GOAL_DISTANCE_AFTER  = D1_G4B_U01_S59I_FULLFIX_IMPLEMENTED_CI_PENDING
DISTANCE_REDUCED     = aligned query-state lifecycle, source isolation, public error localization and S59I QA with the authoritative Classic and Pixel browser architecture
REMAINING_BLOCKERS   = ["PR CI pending", "merge pending", "main CI readback pending", "S59J final promotion pending"]
NEXT_SHORTEST_STEP   = run PR CI and merge S59I only if all checks pass
AUTO_CONTINUE_DECISION = CONTINUE_AFTER_GREEN_CI
STOP_REASON = NONE
```
