# POSTG-MIG-A01 G3A-U01 D0 Readback

```text
SOURCE_ID = g3a_u01_3a01
CONFORMANCE_STATE = GOLDEN_CONFORMANT
PRODUCTION_ELIGIBILITY = true
EVIDENCE_LEVEL = E5_PRODUCTION_ADMITTED
QUESTION_COUNT = 40
ANSWER_KEY_COUNT = 40
KNOWLEDGE_POINTS = 8
OPERATION_MODELS = 8
PATTERN_GROUPS = 8
PATTERN_SPECS = 20
VALIDATOR_ERRORS = 0
HTML_SHA256 = 5bb41242226bf3df0f742a2d4f8b036323deb3d63c51f2c14369e0b94d362506
PDF_SHA256 = b31ae99b578fc42e29552b2a05581e633f849b781d358e7c8dfe39dbf0f5e7f9
VERDICT = PASS_GOLDEN_CONFORMANT
```

## Authority lineage

Unit JSON → shared Golden adapter → existing generator and validator → shared worksheet and renderer → current HTML/PDF/hash/DOM readback.

## Queue transition

```text
G3A-U01 = COMPLETE
G3A-U02 = ACTIVE
PROGRAM_COMPLETED_COUNT = 2
PROGRAM_REMAINING_COUNT = 12
GOAL_DISTANCE = D12_POST_GOLDEN_MIGRATION_G3AU01_CONFORMANT_G3AU02_ACTIVE
```

Application-question expansion remains outside Program A.

## Evidence storage mode

```text
A01_PDF_STORAGE = EXACT_HEAD_GITHUB_ACTIONS_ARTIFACT
SUCCESSFUL_WORKFLOW_RUN_ID = 29728325405
SUCCESSFUL_ARTIFACT_ID = 8455194364
A01_HTML_STORAGE = EXACT_HEAD_GITHUB_ACTIONS_ARTIFACT
COMMITTED_A01_RUNTIME_READBACK = docs/curriculum/output/postg/a01-g3a-u01/POSTG_MIG_A01_G3AU01_RUNTIME_READBACK.json
SHARED_RENDERER_PDF_REGRESSION = docs/curriculum/output/smoke/S60L_G5A_U08_PublicWorksheet.pdf
```

The A01 HTML and PDF binaries remain in the immutable exact-head workflow artifact; its SHA-256 is committed above and revalidated by the final workflow. No bootstrap, payload, or self-modifying workflow is used.
