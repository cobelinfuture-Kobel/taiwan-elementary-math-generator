# GCKG R02 Global KnowledgePoint Candidate Reconciliation Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R02_G3toG6_79SourceNodeKnowledgePointCandidateReconciliation
PARENT_MERGE_SHA = 3c2d3e634ba1a4eaa2958f9994af3a319bd00c85
PRODUCT_BASELINE_SHA = 9846627e1263d9dfb3e9e2318989cc5ae94c35dd
STATUS = ALL_79_SOURCE_NODES_RECONCILED_CANDIDATE_AUTHORITY_READY
MAINLINE_INTEGRATION_STATUS = SHADOW_CANDIDATE_AUTHORITY_READY_NOT_CUT_OVER
```

## Evidence partition

```text
79 source nodes
├─ 16 existing D0 production-authority source nodes
├─ 13 existing W02 page-evidenced candidate source nodes
└─ 50 newly full-page-reviewed source nodes
```

The 50 newly reviewed source PDFs contain 99 rendered pages. They produce 247 source candidate projections and 242 unique reviewed KnowledgePoint IDs. Raw private PDFs are not committed to the public repository.

## Reconciliation rules

- Existing D0 KnowledgePoint IDs and PatternSpec lineage are preserved.
- Existing W02 page-evidenced candidates are projected into the R01 contract.
- Byte-identical `g4a_u06_4a06` and `g4b_u03_4b03` source evidence is merged into six canonical semantic identities.
- `g6a_u08_6a08` and `g6b_u02_6b02` share five speed KnowledgePoint identities with two source references each.
- Batch A-E remains delivery provenance only.
- Prerequisite edges remain deferred to R03.
- Runtime capability mapping remains deferred to R04.
- Production consumer cutover remains forbidden before R07.

## Mainline lineage

```text
Drive source PDF / existing KnowledgeOperation authority
→ R02 source candidate view
→ reconciled global KnowledgePoint candidate registry
→ R03 prerequisite graph
→ R04 runtime capability matrix
→ R06 legacy compatibility migration
→ R07 existing consumer cutover
→ R08 worksheet runtime proof
```

Current production consumer remains unchanged:

```text
site/assets/browser/pipeline/build-worksheet-document.js
```

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_GLOBAL_KP_DECOMPOSITION_CONTRACT_READY
GOAL_DISTANCE_AFTER  = D2_ALL_79_SOURCE_NODES_GLOBAL_KP_CANDIDATE_AUTHORITY_READY
DISTANCE_REDUCED     = All 79 source nodes now resolve to machine-validated KnowledgePoint candidate views while existing D0 IDs and the production consumer remain intact.
REMAINING_BLOCKERS   = [
  R03_GLOBAL_PREREQUISITE_GRAPH_PENDING,
  R04_SHARED_RUNTIME_CAPABILITY_MATRIX_PENDING,
  R05_DELIVERY_WAVE_REBASE_PENDING,
  R06_EXISTING_15_UNIT_COMPATIBILITY_MIGRATION_PENDING,
  R07_EXISTING_CONSUMER_CUTOVER_PENDING
]
NEXT_SHORTEST_STEP   = R03_GlobalPrerequisiteGraph
```
