# PGC-R09 A00 D0 Closeout Preflight and Canonical Acceptance Matrix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R09-A00_D0CloseoutPreflightAndCanonicalAcceptanceMatrix
STATUS = PASS_R09_A00_D0_CLOSEOUT_PREFLIGHT_FROZEN
```

## Precondition

R08 is terminal D0 at route level: 793/793 legal routes conformant, zero pending repairs, and the recorded full regression is 2796/2796 PASS. R09 does not reopen those repairs; it performs product-level D0 reconciliation.

## Canonical D0 acceptance

R09 may close only when all of the following are true: public UI options map to supported capabilities; every public capability has canonical Generator and Validator consumers; legal routes satisfy required capacity; all 793 legal UI combinations generate successfully; HTML/PDF/Print and answer-key parity remain valid; all required R09 regression suites pass; deployed public-site smoke passes; CI is green; the PR is merged; and main readback is updated.

## Required execution suites

```text
FULL_NODE_REGRESSION
CAPABILITY_MATRIX_VALIDATOR
GENERATOR_CAPACITY_TESTS
SEMANTIC_APPLICATION_TESTS
REASONING_TESTS
MIXED_ALLOCATION_TESTS
BROWSER_UI_TESTS
CHROMIUM_HTML_PDF_TESTS
VISUAL_GEOMETRY_TESTS
PUBLIC_SITE_SMOKE
```

## Required archive fields

```text
PR
commit SHA
merge SHA
workflow run IDs
artifact IDs
HTML SHA256
PDF SHA256
question count
answer count
unique question count
seed count
page count
overflow metrics
semantic review result
```

## Frozen boundary

No new KnowledgePoint, PatternGroup, PatternSpec, Generator, second Validator, second Renderer, Batch expansion, UI visual redesign, or acceptance-gate relaxation is allowed. Slice014 remains frozen until final R09 D0 closeout.

## Ordered R09 milestones

```text
A00 D0 closeout preflight and canonical acceptance matrix
A01 exact-head regression and capability gate execution
A02 real artifact archive and hash manifest
A03 public-site smoke and release-candidate readback
A04 final D0 reconciliation, merge and Slice014 unfreeze
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_ALL_793_LEGAL_ROUTES_CONFORMANT_R09_PRODUCT_D0_NOT_RECONCILED
GOAL_DISTANCE_AFTER  = D1_R09_D0_ACCEPTANCE_MATRIX_AND_CLOSEOUT_EVIDENCE_CONTRACT_FROZEN
DISTANCE_REDUCED     = route-level D0 is now bound to one product-level closeout matrix and evidence contract
REMAINING_BLOCKERS   = [R09_EXACT_HEAD_REGRESSION_NOT_EXECUTED, R09_ARTIFACT_MANIFEST_NOT_MATERIALIZED, R09_DEPLOYED_PUBLIC_SITE_SMOKE_NOT_RECONCILED, R09_FINAL_D0_NOT_MERGED]
NEXT_SHORTEST_STEP   = PGC-R09-A01_ExactHeadRegressionAndCapabilityGateExecution
```
