# PGC-R08 Failed Combination Report

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization
STATUS = PENDING_BROWSER_EXECUTION
LEGAL_ROUTE_COUNT = 793
EXECUTED_ROUTE_COUNT = 0
PASS_ROUTE_COUNT = 0
FAILED_ROUTE_COUNT = 0
PREKNOWN_LIMITED_CAPACITY_RISK_COUNT = 69
```

No legal route has been executed through the public browser journey in A01. The 69 limited-capacity routes remain admitted to the matrix and are explicitly marked for canary qualification; they are not silently removed.

Full 793-row pending matrix evidence:

```text
WORKFLOW_RUN_ID = 30564781169
ARTIFACT_ID = 8768421486
ARTIFACT_DIGEST = sha256:05de91f1a9a61f172d65113d08b0826414ef0ecc1eda2818757f652b69fa6c75
FULL_JSON_SHA256 = b1b123970dd30c43b1fe8e63e02e38fd943598821db38a90874bce6d21d7d5a1
FULL_CSV_SHA256 = 608fd5e3a245ec9b0e00454b4945980352fd63ae1da169f322d7a163106ea2b4
```

A03 will populate route-level PASS/FAIL results. A04 will reconcile every failed combination to zero or stop fail-closed.
