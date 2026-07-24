# GCKG R08 15-Unit Global Migration Closeout Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R08_15UnitGlobalMigrationUIHTMLPDFCloseout
STATUS = PASS_PENDING_CI_GLOBAL_PRIMARY_UI_HTML_PDF_PRINT_ACCEPTANCE
```

## Acceptance target

```text
public units                        = 15
numeric HTML/PDF cases              = 15
application HTML/PDF cases          = 15
PBL HTML/PDF cases                  = 5
total Chromium cases                = 35
Global-primary metadata cases       = 35
page-overflow findings              = 0
live UI preview / print             = PASS
```

The branch name `closeout/15-unit-public-worksheet-v1` activates the repository's real Chromium and live-UI acceptance workflow.

## Authority requirement

A worksheet cannot pass R08 merely because it renders. Every numeric, application, and PBL document must prove:

```text
authorityMode       = GLOBAL_PRIMARY
legacyAuthorityRole = COMPATIBILITY_ALIAS_READ_ONLY
```

The authority evidence must appear in worksheet metadata, config snapshot, and public controls.

## Closeout boundary

```text
15-unit migration segment close = pending CI
full 79-source product close     = false
recursive-improvement admin      = forbidden before P10
```

## Full-product continuation

```text
P01 W1 existing-capability admission
→ P02 W2 shadow hardening
→ P03–P08 W3–W8 product delivery
→ P09 79-source public UI integration
→ P10 full UI / worksheet / answer key / HTML / PDF / print closeout
→ recursive-improvement administration backend
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_FULL_PRODUCT_LINE
GOAL_DISTANCE_AFTER  = D2_FULL_PRODUCT_LINE
DISTANCE_REDUCED     = The 15-unit migration blocker is removed only after Global-primary UI/HTML/PDF/print parity passes; W1–W8 product population remains.
REMAINING_BLOCKERS   = [W1–W8 capability and product delivery, 79-source public UI integration, P10 full-product closeout]
NEXT_SHORTEST_STEP   = P01_W1ExistingCapabilityProductAdmission
```
