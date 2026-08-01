# PGC-R09 A00 — D0 Closeout Preflight and Canonical Acceptance Matrix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
EPIC_ID    = PGC-R09_PublicGenerationD0Closeout
TASK_ID    = PGC-R09-A00_D0CloseoutPreflightAndCanonicalAcceptanceMatrix
STATUS     = PASS_R09_A00_CANONICAL_D0_ACCEPTANCE_MATRIX_FROZEN
```

## Scope

This milestone freezes the single R09 terminal acceptance contract from already-merged R00–R08 authorities. It does not execute a new browser matrix, generate new terminal artifacts, change product runtime, or release Slice014.

## Canonical prerequisite readback

- Public source registry: 26 current public source units.
- Capacity authority: 1,155 routes = 793 legal + 362 illegal; hard ceiling 20; zero-capacity routes 0; diversity-gap routes 0; hard blockers 0.
- R07 output parity: 12/12 surface-output projections PASS; 4/4 renderer branches PASS; 14 real Chromium PDFs; repair queue 0.
- R08 route conformance: 793/793 legal routes PASS; 327/327 original failures closed; pending routes 0; pending failure families 0.
- Slice014 remains frozen through `PGC-R09_PublicGenerationD0Closeout`.

## Canonical D0 matrix

R09 terminal acceptance must reconcile these gates on one exact candidate lineage:

1. authority identity
2. R08 route conformance retention
3. public UI / capability parity
4. single generation path
5. question-count capacity through 20 without silent underfill/downgrade
6. semantic validation
7. answer-key coverage and identity
8. HTML / WorksheetDocument fidelity
9. real PDF / print fidelity
10. persistent lineage
11. determinism and regenerate semantics
12. full repository regression
13. real artifact archive
14. product-status re-determination
15. Slice014 release only after terminal R09 D0 merge

The machine-readable authority is:

`data/curriculum/public-generation/PGC-R09-A00.d0-closeout-preflight-and-canonical-acceptance-matrix.json`

## A00 frozen boundary

```text
browser matrix execution       = forbidden
new real artifact generation   = forbidden
product runtime mutation       = forbidden
capacity authority mutation    = forbidden
KnowledgePoint mutation        = forbidden
PatternGroup mutation          = forbidden
PatternSpec mutation           = forbidden
generator mutation             = forbidden
validator mutation             = forbidden
renderer mutation              = forbidden
Slice014                       = frozen
Batch expansion                = forbidden
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_ROUTE_CONFORMANCE_D0_CLOSED_R09_PRODUCT_D0_UNPROVEN
GOAL_DISTANCE_AFTER  = D1_R09_CANONICAL_D0_ACCEPTANCE_MATRIX_FROZEN

DISTANCE_REDUCED =
R00-R08 的 route、capacity、surface、renderer 與 browser acceptance authority
已整合為唯一 R09 terminal D0 驗收矩陣，避免把 R08 route D0 誤稱為整體產品 D0。

REMAINING_BLOCKERS =
- R09_TERMINAL_PRODUCT_ACCEPTANCE_NOT_EXECUTED
- R09_REAL_ARTIFACT_ARCHIVE_NOT_MATERIALIZED
- R09_EXACT_HEAD_FULL_REGRESSION_NOT_RECORDED
- R09_PRODUCT_STATUS_NOT_REDETERMINED

NEXT_SHORTEST_STEP =
PGC-R09-A01_CanonicalPublicProductAndArtifactAcceptanceExecution
```
