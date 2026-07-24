# GCKG R04 Shared Runtime Capability Matrix Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R04_SharedRuntimeCapabilityMatrix
STATUS = PASS_R04_SHARED_RUNTIME_CAPABILITY_MATRIX
MAINLINE_INTEGRATION_STATUS = MAPPING_ONLY
```

## Result

```text
canonical KnowledgePoints = 482
shared capabilities       = 58
runtime profiles          = 18
classification rules      = 18
capability modifiers      = 14
matrix rows               = 482
```

The matrix distinguishes `production_admitted`, `shadow_available`, and `contract_only`. Every KnowledgePoint receives required, optional, and forbidden capability sets plus an executable delivery-state readback. KnowledgePoint production admission remains deferred to R06/R07.

## Existing product evidence

The existing single product path remains authoritative:

```text
public plan
→ source-unit / KP resolver
→ existing numeric, application, or PBL generator
→ existing validators
→ worksheet and answer-key assembly
→ global layout overlay
→ HTML / browser print
```

R04 records these facilities as shared capabilities; it does not copy them.

## Cross-Batch proof

```text
kp_mass_times_integer
requires quantity identity, integer multiplication, same-unit arithmetic
forbids unit conversion and mixed-unit normalization
```

```text
kp_mass_mixed_unit_add_sub
requires quantity identity, integer add/sub, unit conversion, mixed-unit normalization
```

Software delivery therefore depends on the exact capability set rather than the legacy Batch C label.

## Boundary

```text
production consumer changed = false
delivery wave rebased       = false
production cutover allowed  = false
parallel runtime created    = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = 482 KnowledgePoints now have machine-readable shared runtime capability demands and missing-capability readback; runtime delivery is no longer inferred from Batch A-E membership.
REMAINING_BLOCKERS   = [delivery waves not recomputed, legacy 15-unit identities not migrated, production consumer not cut over]
NEXT_SHORTEST_STEP   = R05_DeliveryWaveRebase
```
