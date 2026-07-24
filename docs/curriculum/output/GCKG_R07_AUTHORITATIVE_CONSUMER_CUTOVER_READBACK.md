# GCKG R07 Authoritative Consumer Cutover Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R07_AuthoritativeConsumerCutover
STATUS = PASS_PENDING_CI_R07_GLOBAL_AUTHORITY_PRIMARY_CUTOVER
MAINLINE_INTEGRATION_STATUS = PRODUCTION_AUTHORITY_CUTOVER
```

## Result

```text
public product units                    = 15
legacy source nodes                     = 16
protected canonical KnowledgePoints     = 156
Global-model reconciliation cases       = 9
production authority                    = GLOBAL_PRIMARY
legacy authority role                   = COMPATIBILITY_ALIAS_READ_ONLY
public consumer entry-point path changed = false
visible output change expected          = false
```

The executable runtime and validator emit authoritative question-binding and browser-authority counts.

## Production consumer behavior

```text
public plan
→ application selection normalization when applicable
→ R07 Global authority cutover
→ existing shared production generator / validator / renderer
→ worksheet metadata records GLOBAL_PRIMARY
```

The old post-golden migration task ID is no longer required to activate Global authority for the 15-unit baseline. Existing IDs and explicit KP/PatternGroup selections remain valid.

## Scope boundary

```text
new generator created             = false
new validator created             = false
new renderer created              = false
parallel runtime created          = false
UI/HTML/PDF parity claimed        = false
UI/HTML/PDF parity next task      = R08_15UnitGlobalMigrationUIHTMLPDFCloseout
```

## Full-product sequence

```text
R08 migration close
→ P01–P08 delivery waves
→ P09 79-source public UI
→ P10 full worksheet / answer key / HTML / PDF / print close
→ recursive-improvement administration backend
```

The administration backend is explicitly deferred until the complete product line reaches P10.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D1
DISTANCE_REDUCED     = The 15-unit production consumer now resolves through Global authority by default while preserving all existing public identities and runtime implementations.
REMAINING_BLOCKERS   = [R08 UI/HTML/PDF/print parity after cutover, W1–W8 full product delivery, 79-source public UI integration]
NEXT_SHORTEST_STEP   = R08_15UnitGlobalMigrationUIHTMLPDFCloseout
```
