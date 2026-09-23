# P02 W2 Product Admission Inventory Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02_W2ProductAdmissionInventoryAndGapMatrix
STATUS     = PASS_W2_CAPABILITY_ONLY_DEPENDENCY_MATRIX
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Mainline correction

R05-W2 `SHADOW_FOUNDATION_HARDENING` is not a product KnowledgePoint cohort.

```text
direct R05-W2 KnowledgePoints = 0
R05-W2 shared capabilities     = 5
cross-wave dependent KPs       = 51
```

The initial assumption that P02 should inventory direct W2 KnowledgePoints was rejected by exact-head execution. P02 now inventories the five capability-plan rows and their dependents across the actual assigned delivery waves. The unrelated POSTG application-program label `W02` is not used as delivery authority.

## Five shared foundations

| Rank | Capability | All dependent KPs | Directly required KPs | Role |
|---:|---|---:|---:|---|
| 0 | `cap_kp_authority_lookup` | 0 | 0 | Global canonical authority infrastructure |
| 0 | `cap_quantity_dimension_unit_identity` | 51 | 37 | Quantity dimension and unit identity root |
| 1 | `cap_prerequisite_readiness` | 0 | 0 | Prerequisite readiness infrastructure |
| 1 | `cap_quantity_semantic_role_binding` | 26 | 26 | Quantity semantic-role binding |
| 1 | `cap_same_unit_quantity_arithmetic` | 2 | 2 | Same-unit quantity arithmetic |

Authority lookup and prerequisite readiness have no direct KnowledgePoint mappings, but remain mandatory shared infrastructure capabilities. They must not be removed merely because their dependent count is zero.

## Cross-wave dependency matrix

```text
dependent KnowledgePoints = 51
dependent source nodes     = 20
dependent delivery waves   = 5
```

| Assigned wave | Dependent KPs | Meaning |
|---|---:|---|
| `R05-W0` | 3 | Existing protected product KPs that already consume shadow quantity foundations |
| `R05-W4` | 41 | Quantity, measurement, unit and time delivery |
| `R05-W5` | 1 | Geometry/scale-related quantity dependency |
| `R05-W7` | 5 | Ratio, speed and rate delivery |
| `R05-W8` | 1 | Multi-domain completion |

The twenty source nodes are:

```text
g3a_u04_3a04  g3a_u08_3a08  g3b_u01_3b01  g3b_u02_3b02
g3b_u03_3b03  g3b_u06_3b06  g3b_u08_3b08  g3b_u09_3b09
g4a_u06_4a06  g4a_u09_4a09  g4a_u10_4a10  g4b_u03_4b03
g4b_u09_4b09  g5a_u04_5a04  g5a_u06_5a06  g5b_u09_5b09
g5b_u10_5b10a g6a_u08_6a08  g6a_u09_6a09  g6b_u02_6b02
```

## Current product coverage after capability hardening

```text
public KnowledgePoints already visible       = 3
public Pattern bindings already present      = 3
public selectable source nodes               = 2
admission-ready existing public patterns     = 3
partial PatternGroup/PatternSpec bindings     = 0
future public product vertical slices        = 48
```

The three existing public rows come from protected W0 sources `g3b_u01_3b01` and `g3b_u08_3b08`. They remain protected and are not re-admitted by P02.

The 48 unimplemented product vertical slices belong to their actual later-wave product programs, primarily P04/W4. P02 records these downstream blockers but does not implement them.

## Executable lineage

```text
R04 shared capability matrix
→ R05 W2 capability plan
→ all R05 KnowledgePoint assignments
→ effective W2 capability intersection
→ cross-wave dependent KP matrix
→ current 19-source product coverage
→ product gap classification
→ capability-first next actions
```

Each dependent row starts with one or more:

```text
HARDEN_AND_ADMIT_SHARED_CAPABILITY:<capabilityId>
```

Only after those shared foundations are admitted may the row proceed to FormalMapping, PatternSpec, source adapter, public UI, worksheet, answer key, HTML, PDF and print work in its assigned product wave.

## Validation

```text
full Node regression                       = PASS
direct W2 cohort fabricated                = fail closed
W2 capability identity drift               = fail closed
direct production admission                = fail closed
capability-first action order              = enforced
existing nineteen-source product modified  = false
Chromium required for inventory-only task  = false
```

## Scope boundary

```text
capability hardening started  = false
PatternSpec implementation    = false
production admission          = false
public UI changed             = false
W3-W8 implementation started  = false
existing 19-source product    = preserved
recursive improvement admin   = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_PUBLICLY_ADMITTED_W2_UNDIFFERENTIATED
GOAL_DISTANCE_AFTER  = D2_W2_CAPABILITY_ONLY_DEPENDENCY_MATRIX_CLOSED
DISTANCE_REDUCED     = W2 is no longer an ambiguous product wave. Its five shared foundations, dependency order, fifty-one cross-wave dependents, twenty sources, five delivery waves and downstream product gaps are now executable and fail-closed.
REMAINING_BLOCKERS   = [five shadow capabilities remain unadmitted, R04 evidence status may be stale relative to R07/P01E, 48 downstream vertical slices remain in their assigned later waves]
NEXT_SHORTEST_STEP   = P02A_W2ShadowFoundationHardeningOrderAndEvidenceReconciliation
```
