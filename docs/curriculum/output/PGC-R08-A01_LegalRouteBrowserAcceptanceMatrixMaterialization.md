# PGC-R08-A01 Legal Route Browser Acceptance Matrix Materialization

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization
STATUS     = PENDING_CI_ARTIFACT_MATERIALIZATION
```

## Scope

A01 converts the current `generator_capacity_contract.routes` legal view into browser acceptance rows. It does not execute the public UI or Chromium.

```text
CAPACITY_ROUTE_COUNT      = 1155
LEGAL_ROUTE_COUNT         = 793
VERIFIED_20_ROUTE_COUNT   = 724
VERIFIED_LIMITED_COUNT    = 69
REQUESTED_QUESTION_COUNT  = 20
SHARD_SIZE                = 50
EXPECTED_SHARD_COUNT      = 16
```

## Matrix row contract

Every row preserves:

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

Every row receives nine `PENDING` gates:

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

The 69 `VERIFIED_LIMITED` routes remain in the matrix and receive explicit pre-execution risk codes. A01 does not silently remove them.

## Read-only materialization

The existing Node workflow runs the deterministic builder and uploads an artifact. It does not commit or push from CI. After artifact inspection, the generated JSON, CSV and report will be committed to this PR and the temporary workflow wiring removed.

## Expected outputs

```text
data/curriculum/public-generation/public_generate_button_acceptance.json
docs/curriculum/output/public_capability_e2e_matrix.csv
docs/curriculum/output/failed_combination_report.md
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_AND_MATRIX_CONTRACT_FROZEN
GOAL_DISTANCE_AFTER  = D1_R08_LEGAL_ROUTE_BROWSER_ACCEPTANCE_MATRIX_PENDING_MATERIALIZATION
DISTANCE_REDUCED     = deterministic matrix builder and sharding contract created
REMAINING_BLOCKERS   = [CI_ARTIFACT_PENDING, MATRIX_OUTPUTS_NOT_COMMITTED, PUBLIC_GENERATE_BUTTON_CANARY_NOT_QUALIFIED, ALL_793_LEGAL_ROUTES_NOT_EXECUTED]
NEXT_SHORTEST_STEP   = PGC-R08-A01_ExactHeadMaterializationArtifactReadback
```
