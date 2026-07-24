# GCKG R03 Global KnowledgePoint Prerequisite Graph Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R03_GlobalPrerequisiteGraph
STATUS = PASS_R03_GLOBAL_KP_PREREQUISITE_GRAPH
MAINLINE_INTEGRATION_STATUS = MAPPING_ONLY
```

## Result

R03 materializes a single shadow prerequisite graph over the merged R02 authority:

```text
canonical KnowledgePoints = 482
direct edges             = 668
required edges           = 665
alternative edges        = 2
supporting edges         = 1
approved roots           = 25
boundary review          = 0
```

## Executable gates

```text
all edge endpoints exist
no self-loop
no duplicate edge
distance-bearing graph is a DAG
required graph has no redundant transitive edge
alternative groups are valid
all 482 nodes are accounted for
root nodes have no incoming distance edge
supporting edges do not block readiness
existing production consumer remains unchanged
artifact archive SHA-256 = cda67fa8389d28b80e8fd8a935f4ae0d399607559e5346820a046786a003db1d
focused graph test / validator CLI / governance = PASS
```

## Mainline effect

This task replaces Batch-based isolation as the curriculum dependency model, but does not replace the current worksheet runtime.

The graph now provides the formal basis for:

```text
mastered set
→ direct prerequisite satisfaction
→ one or more N+1-ready KnowledgePoints
→ R04 runtime capability requirements
→ R05 delivery-wave rebase
```

## Cross-Batch proof

The graph proves the originally discussed distinction:

```text
integer multiplication + mass unit understanding
→ same-unit weight multiplication candidate ready

integer add/sub without kg↔g conversion
→ mixed-unit weight arithmetic not ready

integer add/sub + kg↔g conversion
→ mixed-unit weight arithmetic ready
```

## Boundary

```text
production consumer changed = false
production cutover allowed  = false
parallel authority allowed  = false
runtime capability mapping  = deferred to R04
delivery-wave rebase        = deferred to R05
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = 482 個 canonical KP 已由平面候選清冊轉成可機器驗證的直接能力依賴圖，解除跨 Batch 前置關係無權威資料的 blocker
REMAINING_BLOCKERS   = [
  runtime capability matrix 尚未建立,
  delivery waves 尚未依 graph 重排,
  15-unit legacy compatibility 尚未遷移,
  production consumer 尚未 cut over
]
NEXT_SHORTEST_STEP   = R04_SharedRuntimeCapabilityMatrix
```
