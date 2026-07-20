# GS04 G5A-U08 Shared Runtime and Batch Adapter Readback

## Status

```text
PROGRAM_ID = G5AU08_GOLDEN_SAMPLE_V1
TASK = GS04_G5AU08_SharedRuntimeAndBatchAdapter
STATUS = PASS_E3_SHARED_RUNTIME_CONNECTED_PENDING_MERGE
EVIDENCE_LEVEL = E3_SHADOW_RUNTIME_INTEGRATED
```

## Capability delivered

The frozen `G5AU08_GOLDEN_V1@1.0.0` contract is now consumable through a generic multi-unit source adapter registry and an explicit shadow runtime consumer.

```text
Frozen Golden contract
→ shared Golden runtime consumer
→ generic source-unit adapter registry
→ explicit shadow contract opt-in
→ existing G5A-U08 S60J generator / validator / worksheet runtime
```

The default public G5A-U08 source-unit route remains unchanged. A Golden shadow request must provide all three fields:

```text
goldenContractId      = G5AU08_GOLDEN_V1
goldenContractVersion = 1.0.0
goldenRuntimeMode     = shadow
```

Partial or invalid activation blocks before fallback.

## Shared adapter coverage

| sourceId | role | KnowledgePoints | PatternGroups | Golden conformance claimed |
|---|---|---:|---:|---|
| `g4b_u04_4b04` | legacy compatibility consumer | 13 | 13 | no |
| `g5a_u02_5a02` | legacy compatibility consumer | 18 | 18 | no |
| `g5a_u08_5a08` | Golden V1 shadow-connected consumer | 11 | 17 | no |

The existing legacy adapter IDs and exact enumerable audit return shape were preserved.

## Runtime reuse and anti-duplication

```text
new per-unit generator = 0
new per-unit validator = 0
new per-unit renderer  = 0
new per-unit workflow  = 0
affected unit count    = 3
```

GS04 reuses the existing S60J runtime. It does not production-admit GS02 contexts and does not claim HTML/PDF verification, Human Review readiness, production admission or D0.

## CI evidence

Exact-head acceptance before closeout metadata:

- `GS04 G5A-U08 Shared Runtime and Batch Adapter`: PASS
  - focused Golden descriptor parity
  - supported/unsupported contract handling
  - legacy adapter compatibility
  - default public behavior unchanged
  - real S60J shadow runtime generation
  - bounded changed-file scope
- `Milestone Claim Integrity`: PASS
- `Node Test`: PASS
- `Math CI Readback`: PASS

The first CI attempt exposed two bounded defects and both were corrected inside PR #287:

1. the aggregate adapter audit added an enumerable field and broke the legacy exact return shape;
2. the GS04 test incorrectly expected production admission instead of the correct E3 `preview_only_pending_s60l` status.

No runtime authority file for the G5A-U08 generator, validator or renderer was modified.

## Scope readback

```text
visible output changed                  = false
default public G5A-U08 route changed    = false
GS02 contexts production selectable     = false
GS02 contexts runtime resolvable        = false
cross-unit conformance verdict issued   = false
production admitted                     = false
D0 complete                             = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G5AU08_GOLDEN_V1_CONTRACT_FROZEN
GOAL_DISTANCE_AFTER  = D2_G5AU08_GOLDEN_V1_SHARED_RUNTIME_CONNECTED
DISTANCE_REDUCED     = The frozen Golden authority is now executable through a fail-closed shared shadow consumer and generic batch adapter while preserving legacy and public behavior.
REMAINING_BLOCKERS   = [final closeout exact-head CI, merge]
NEXT_SHORTEST_STEP   = GS05_G5AU08_CrossUnitConformancePilot
STOP_REASON          = NONE
```
