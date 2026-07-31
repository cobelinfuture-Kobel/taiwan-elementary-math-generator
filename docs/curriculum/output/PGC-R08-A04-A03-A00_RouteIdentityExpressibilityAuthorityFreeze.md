# PGC-R08 A04 A03 A00 — Route Identity Expressibility Authority Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A03-A00_RouteIdentityExpressibilityAuthorityFreeze
STATUS = PENDING_DETERMINISTIC_CI_READBACK
```

## Purpose

Determine whether the 136 `ROUTE_BINDING_NOT_CONVERGED` rows can be addressed through exact public PatternGroup selection, or whether some route IDs are intentionally indistinguishable on the public UI and must be accepted as an equivalence class.

## Authority chain

```text
generator_capacity_contract.json
+ public-generator-capacity-registry.js
+ PGC-R08-A04.active-repair-state.json
+ route-binding-not-converged.json
→ routeId join
→ public PatternGroup identity restoration
→ expressibility classification
```

R03 retains the exact public PatternGroup key in the runtime registry. R08 A01 removed this dimension when constructing browser rows, so A03 must classify the missing identity before changing the harness.

## Frozen scope

```text
LEGAL_ROUTES = 793
ROUTE_BINDING_FAILURES = 136
PRODUCT_MUTATION = false
HARNESS_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
PER_ROUTE_PATCH = false
```

## Terminal classifications

```text
EXACT_PUBLIC_PATTERN_GROUP_SELECTION_REQUIRED
PUBLIC_EQUIVALENCE_CLASS_REQUIRED
```

The first class authorizes a shared exact PatternGroup binding repair. The second class does not authorize arbitrary route selection; it requires an equivalence-aware acceptance rule grounded in identical public controls and PatternGroup projection.

## Acceptance

```text
RUNTIME_ROUTE_JOIN = 793 / 793
RUNTIME_METADATA_MISMATCH = 0
FAILED_ROUTE_CLASSIFICATION = 136 / 136
CLASSIFICATION_TOTAL = 136
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_FAMILIES_CLOSED_ROUTE_BINDING_REPAIR_NEXT
GOAL_DISTANCE_AFTER  = D1_R08_ROUTE_IDENTITY_EXPRESSIBILITY_READBACK_PENDING
DISTANCE_REDUCED     = deterministic routeId-to-PatternGroup reconciliation is executable without product mutation
REMAINING_BLOCKERS   = [ROUTE_IDENTITY_EXPRESSIBILITY_NOT_TERMINAL, ROUTE_BINDING_NOT_CONVERGED_136, QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT_9, REGENERATE_IDENTITY_TIMEOUT_3, CAPACITY_EVIDENCE_RECONCILIATION_35]
NEXT_SHORTEST_STEP   = READ_A03_A00_EXPRESSIBILITY_ARTIFACT_AND_FREEZE_REPAIR_PARTITION
```
