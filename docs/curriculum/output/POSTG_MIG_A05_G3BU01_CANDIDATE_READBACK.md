# POSTG-MIG-A05 G3B-U01 Candidate Readback

```text
PROGRAM_ID = POST_GOLDEN_UNIT_CONFORMANCE_MIGRATION_V1
TASK_ID = POSTG-MIG-A05_G3B_U01_GoldenConformanceAndKnowledgeOperationMigration
SOURCE_ID = g3b_u01_3b01
PROGRAM_DISTANCE = D9_POST_GOLDEN_MIGRATION_G3AU06_CONFORMANT_G3BU01_ACTIVE
CANDIDATE_EVIDENCE_LEVEL = E2_CONTENT_AUTHORED
```

## Effective authority inventory

```text
KnowledgePoints = 10
OperationModels = 10
PatternGroups = 10
Unique PatternSpecs = 23
ConformanceState = IN_PROGRESS_GOLDEN_NATIVE
KnowledgeRegistryState = QUESTION_BINDINGS_COMPLETE
ProductionEligibility = false
```

The candidate follows the current composed selector and PatternSpec authority. It registers:

- two-digit exact division place-value cases;
- three-digit exact division and place-value cases;
- quotient-zero cases;
- two- and three-digit division with remainder;
- partitive and quotative division;
- quotient/remainder application semantics;
- floor/ceil remainder interpretation;
- four two-step division semantic shapes.

Three quotient-zero PatternSpecs appear in broader selector groups as well as the dedicated quotient-zero KnowledgePoint. The authoritative registry binds each question identity exactly once to the dedicated KnowledgePoint, preventing duplicate question identities without changing the selector.

## Authority lineage

```text
batch-a-selector-equation-extension.js
+ source-pattern-extension.js
+ source-pattern-submiddle-extension.js
→ g3b_u01_3b01.knowledge-operation.json
→ global post-Golden adapter descriptor
→ existing shared generator / validator / renderer
```

## Candidate gate

```text
schema validation = pending exact-head CI
focused generation / validation = pending exact-head CI
production HTML / PDF / hash / DOM = pending exact-head CI
designer Excel / CSV = pending exact-head CI
GOLDEN_CONFORMANT promotion = forbidden until all gates pass
```

## Scope

No new PatternSpec, scenario family, generator, validator, renderer, workflow, public layout or student-page label is introduced.
