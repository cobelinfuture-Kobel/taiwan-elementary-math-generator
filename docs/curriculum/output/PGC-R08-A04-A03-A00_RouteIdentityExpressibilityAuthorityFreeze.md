# PGC-R08 A04 A03 A00 — Route Identity Expressibility Authority Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A03-A00_RouteIdentityExpressibilityAuthorityFreeze
STATUS = PASS_ROUTE_IDENTITY_EXPRESSIBILITY_CLASSIFIED
```

## Purpose

Determine whether the 136 `ROUTE_BINDING_NOT_CONVERGED` rows require exact public PatternGroup binding, or whether some route IDs remain indistinguishable and require a public-equivalence acceptance rule.

## Exact CI evidence

```text
HEAD_SHA = 5b8819025e4615d6440bc5e93faef96af4ae4e6a
WORKFLOW_RUN_ID = 30605355751
ARTIFACT_ID = 8783385941
ARTIFACT_DIGEST = sha256:fd3e87bbf3131854becdea66fdacdfabf4a3b2fb1350e1d5fd195d71be3c1b8f
```

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

## Terminal result

```text
LEGAL_ROUTE_COUNT = 793
RUNTIME_ROUTE_JOIN = 793 / 793
RUNTIME_METADATA_MISMATCH = 0
RUNTIME_PUBLIC_PATTERN_GROUP_AGREEMENT = 793 / 793

FAILED_ROUTE_COUNT = 136
EXACT_PUBLIC_PATTERN_GROUP_SELECTION_REQUIRED = 136
PUBLIC_EQUIVALENCE_CLASS_REQUIRED = 0
FAILED_ROUTES_DISAMBIGUATED_BY_PATTERN_GROUPS = 54
```

Projection counts:

```text
WITHOUT_PATTERN_GROUP_DIMENSION = 726 public projection classes
WITH_PATTERN_GROUP_DIMENSION    = 793 exact projection classes
```

The 54 ambiguous failed routes become unique when the public PatternGroup dimension is restored. The remaining 82 failed routes were already unique in the other public fields, but still require exact PatternGroup binding to select the intended route identity.

## Root cause and authorization

```text
ROOT_CAUSE = R08_A01_BROWSER_MATRIX_STRIPPED_PUBLIC_PATTERN_GROUP_DIMENSION
EXACT_PATTERN_GROUP_BINDING_REPAIR = authorized
PUBLIC_EQUIVALENCE_ACCEPTANCE = not authorized
PRODUCT_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
PER_ROUTE_PATCH = false
AFFECTED_FAMILY_REPLAY = 136 routes
```

A03-A01 may modify the shared browser matrix and shared harness binding path only. It must preserve the canonical capacity authority and replay all 136 affected routes through the existing nine-gate executor.

## Hashes

```text
LEGAL_ROUTE_IDS_SHA256 = cfc77f036ed47ac9a12012c6b57c97414ba937e78e3e0f03d7fd8d9b6452cbed
FAILED_ROUTE_IDS_SHA256 = e0c0f758743c6c9669f0bc4de92af6dc52e4cd8354bb0e492550fed9341f34f6
FAILED_ROUTE_EXPRESSIBILITY_SHA256 = c83382036c86067f4cd91c8a1d06656cff1a74600a4141e9041c8ec43203f7a3
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_FAMILIES_CLOSED_ROUTE_BINDING_REPAIR_NEXT
GOAL_DISTANCE_AFTER  = D1_R08_ROUTE_BINDING_EXACT_PATTERN_GROUP_REPAIR_AUTHORIZED
DISTANCE_REDUCED     = all 136 route-binding failures now have a unique exact public PatternGroup identity; no equivalence-class exception is needed
REMAINING_BLOCKERS   = [ROUTE_BINDING_136_ROUTE_REPAIR_AND_REPLAY_PENDING, QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT_9, REGENERATE_IDENTITY_TIMEOUT_3, CAPACITY_EVIDENCE_RECONCILIATION_35, FULL_793_REPLAY_PENDING]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A03-A01_ExactPatternGroupBindingHarnessRepairAnd136RouteReplay
```
