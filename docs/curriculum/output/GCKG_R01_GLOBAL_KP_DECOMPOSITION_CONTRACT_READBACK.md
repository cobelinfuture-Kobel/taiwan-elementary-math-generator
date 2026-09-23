# GCKG R01 Global KnowledgePoint Decomposition Contract Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R01_GlobalKnowledgePointDecompositionContract_From_PR350MergeSHA
BASELINE_PR = #350
BASELINE_MERGE_SHA = 9846627e1263d9dfb3e9e2318989cc5ae94c35dd
STATUS = GLOBAL_KP_DECOMPOSITION_CONTRACT_READY
MAINLINE_INTEGRATION_STATUS = CONTRACT_BOUND_NOT_CUT_OVER
```

## Verified scope

```text
curriculum source nodes = 79
legacy Batch A nodes = 13
legacy Batch B nodes = 24
legacy Batch C nodes = 17
legacy Batch D nodes = 16
legacy Batch E nodes = 9
merged public D0 units = 15
completed Batch A public units = 13
completed Batch B public units = 2
golden baseline source nodes = 16
remaining source nodes = 63
```

## Contract result

- A source unit may decompose into multiple KnowledgePoint candidates.
- A KnowledgePoint may reference multiple source units.
- Legacy Batch A-E membership is delivery provenance only.
- Source titles, difficulty changes, representation changes and application context changes cannot independently establish a new KnowledgePoint.
- Every candidate must be independently teachable, diagnosable and validator-bound.
- R01/R02 prerequisite edges are fail-closed and deferred to R03.
- R01/R02 runtime capability mappings are fail-closed and deferred to R04.
- Production authority and the existing worksheet consumer remain unchanged.
- A second production resolver or generator/validator/worksheet pipeline is forbidden.

## Producer → authority → consumer → readback

```text
R02 candidate producer
→ data/curriculum/global/candidates/r02
→ future canonical reconciliation
→ existing buildWorksheetDocumentFromPlan consumer after R07 cutover
→ generated worksheet / validator / HTML / print runtime proof in R08
```

R01 does not claim candidate population, graph materialization, runtime mapping or production cutover.

## Closeout

```text
GOAL_DISTANCE_BEFORE = D3_SOURCE_BATCH_ASSIGNMENT_WITHOUT_GLOBAL_KP_BOUNDARY_CONTRACT
GOAL_DISTANCE_AFTER  = D2_GLOBAL_KP_DECOMPOSITION_CONTRACT_READY
DISTANCE_REDUCED     = 79 source nodes now have one machine-checkable decomposition boundary tied to the merged 15-unit D0 product mainline.
REMAINING_BLOCKERS   = [
  R02_79_SOURCE_NODE_CANDIDATE_MATERIALIZATION_PENDING,
  R03_PREREQUISITE_GRAPH_PENDING,
  R04_RUNTIME_CAPABILITY_MATRIX_PENDING,
  R06_LEGACY_ID_COMPATIBILITY_MIGRATION_PENDING,
  R07_EXISTING_CONSUMER_CUTOVER_PENDING
]
NEXT_SHORTEST_STEP   = R02_G3toG6_79SourceNodeKnowledgePointCandidateReconciliation
```
