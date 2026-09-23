# PGC-R08-A01 Legal Route Browser Acceptance Matrix Materialization

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization
PR         = 484
STATUS     = PASS_MATRIX_MATERIALIZED_PENDING_BROWSER_EXECUTION
```

## Scope result

A01 converted the current `generator_capacity_contract.routes` legal view into a deterministic browser acceptance authority. It did not execute the public UI or Chromium.

```text
CAPACITY_ROUTE_COUNT                 = 1155
LEGAL_ROUTE_COUNT                    = 793
VERIFIED_20_ROUTE_COUNT              = 724
VERIFIED_LIMITED_COUNT               = 69
PREKNOWN_LIMITED_CAPACITY_RISK_COUNT = 69
REQUESTED_QUESTION_COUNT             = 20
SHARD_SIZE                           = 50
SHARD_COUNT                          = 16
PENDING_ROUTE_COUNT                  = 793
EXECUTED_ROUTE_COUNT                 = 0
```

## Anti-duplication authority design

The repository does not store a second 1 MB copy of all 793 capacity rows.

```text
Canonical row authority
= generator_capacity_contract.json legal routes

Repository R08 authority
= compact manifest + 16-shard route-ID hashes

Full 793-row pending matrix
= immutable CI artifact with SHA-256 evidence
```

This keeps capacity facts in one canonical location while preserving an independently reproducible matrix witness.

## Matrix row contract

Every full artifact row preserves:

```text
routeId
sourceId
selectionMode
selectedKnowledgePointIds
questionType
depthMode
contextMode
capacityStatus
verifiedMaxQuestionCount
requestedQuestionCount
```

Every route receives nine `PENDING` gates:

```text
UI_OPTIONS_PASS
GENERATE_BUTTON_PASS
QUESTION_COUNT_PASS
QUESTION_IDENTITY_PASS
ANSWER_VALIDATION_PASS
REGENERATE_PASS
HTML_PASS
PDF_PASS
ANSWER_KEY_PASS
```

The 69 `VERIFIED_LIMITED` routes remain admitted and carry explicit pre-execution risk codes. They were not silently removed.

## Committed outputs

```text
data/curriculum/public-generation/public_generate_button_acceptance.json
docs/curriculum/output/public_capability_e2e_matrix.csv
docs/curriculum/output/failed_combination_report.md
```

The CSV is a 16-shard index. The full 793-row CSV remains in the CI artifact and is bound by its digest.

## Artifact evidence

```text
ACCEPTED_HEAD_SHA  = 2876add31259e3c33169e6651707bca9be6580a4
WORKFLOW_RUN_ID    = 30564781169
WORKFLOW_RUN_NO    = 4413
ARTIFACT_ID        = 8768421486
ARTIFACT_DIGEST    = sha256:05de91f1a9a61f172d65113d08b0826414ef0ecc1eda2818757f652b69fa6c75
ARTIFACT_BYTES     = 52063
FULL_JSON_BYTES    = 1043643
FULL_JSON_SHA256   = b1b123970dd30c43b1fe8e63e02e38fd943598821db38a90874bce6d21d7d5a1
FULL_CSV_BYTES     = 267978
FULL_CSV_SHA256    = 608fd5e3a245ec9b0e00454b4945980352fd63ae1da169f322d7a163106ea2b4
REPORT_SHA256      = 668d50feb0fcd0ee39c85c9d5554dd7a2bf26d106c8c62e500421d3a351080c8
NODE_TEST          = PASS
POSTG_GATE         = PASS
```

## CI hygiene

The branch-specific builder and artifact upload were temporary read-only wiring. They were removed after artifact inspection. Final `.github/workflows/node-test.yml` is byte-identical to `main`; A01 adds no permanent workflow fan-out.

## Frozen boundary

```text
Browser execution       = not started
Product UI modified     = false
Generator modified      = false
Validator modified      = false
Renderer modified       = false
Capacity routes mutated = false
New workflow retained   = false
Slice014 started        = false
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_AND_MATRIX_CONTRACT_FROZEN
GOAL_DISTANCE_AFTER  = D1_R08_LEGAL_ROUTE_BROWSER_ACCEPTANCE_MATRIX_MATERIALIZED
DISTANCE_REDUCED     = all 793 legal public routes materialized into a deterministic 16-shard browser acceptance authority without duplicating canonical capacity rows
REMAINING_BLOCKERS   = [PUBLIC_GENERATE_BUTTON_CANARY_NOT_QUALIFIED, ALL_793_LEGAL_ROUTES_NOT_EXECUTED, FAILED_COMBINATION_QUEUE_NOT_RECONCILED]
NEXT_SHORTEST_STEP   = PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification
```
