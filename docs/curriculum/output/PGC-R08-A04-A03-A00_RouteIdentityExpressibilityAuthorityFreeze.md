# PGC-R08 A04 A03 A00 — Route Identity Expressibility Authority Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A03-A00_RouteIdentityExpressibilityAuthorityFreeze
STATUS = PASS_ROUTE_IDENTITY_EXPRESSIBILITY_FROZEN
```

## Exact deterministic evidence

```text
SOURCE_HEAD_SHA = 5b8819025e4615d6440bc5e93faef96af4ae4e6a
WORKFLOW_RUN_ID = 30605355751
WORKFLOW_JOB_ID = 91076358794
ARTIFACT_ID = 8783385941
ARTIFACT_DIGEST = sha256:fd3e87bbf3131854becdea66fdacdfabf4a3b2fb1350e1d5fd195d71be3c1b8f
REPORT_SHA256 = 23e136bb683e12a0a0d4cf846bb0148d100205505e21ec6d1594b52071103d75
```

## Result

```text
LEGAL_ROUTE_JOIN = 793 / 793
RUNTIME_METADATA_MISMATCH = 0
PUBLIC_FIELD_PROJECTION_CLASSES = 726
EXACT_PATTERN_GROUP_PROJECTION_CLASSES = 793
ROUTE_BINDING_FAILURES = 136
```

Before restoring public PatternGroup identity, 54 of the 136 failed routes shared the same source, selection mode, KnowledgePoints, question type, depth and context with another route. The remaining 82 were already unique on those public fields.

After restoring the runtime `publicPatternGroupIds` dimension:

```text
EXACTLY_SELECTABLE = 136 / 136
DISAMBIGUATED_BY_PATTERN_GROUP = 54
PUBLIC_EQUIVALENCE_CLASS_REQUIRED = 0
```

## Root cause

R03 retained exact public PatternGroup identity in `public-generator-capacity-registry.js`, keyed by canonical `routeId`. R08 A01 removed that dimension when materializing browser matrix rows. The A03 browser harness then attempted to reconstruct route identity by greedily clicking the first compatible unselected PatternGroup, which cannot guarantee the canonical group set.

## Authorized repair

```text
ENRICH_BROWSER_ROWS_WITH_PUBLIC_PATTERN_GROUP_IDS = required
SELECT_EXACT_PUBLIC_PATTERN_GROUP_SET = required
DESELECT_ALL_NON_TARGET_PATTERN_GROUPS = required
GREEDY_FIRST_COMPATIBLE_SELECTION = forbidden
PUBLIC_EQUIVALENCE_TOLERANCE = forbidden
PER_ROUTE_PATCH = forbidden
PRODUCT_MUTATION = false
```

All 136 failures share one repair contract. No route requires an equivalence-class exception.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_FAMILIES_CLOSED_ROUTE_BINDING_REPAIR_NEXT
GOAL_DISTANCE_AFTER  = D1_R08_ROUTE_IDENTITY_EXPRESSIBILITY_FROZEN_EXACT_BINDING_REPAIR_PENDING
DISTANCE_REDUCED     = 793/793 route identity recovery proved; all 136 binding failures reduced to one shared exact PatternGroup selection defect
REMAINING_BLOCKERS   = [EXACT_PATTERN_GROUP_BINDER_NOT_IMPLEMENTED_136, QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT_9, REGENERATE_IDENTITY_TIMEOUT_3, CAPACITY_EVIDENCE_RECONCILIATION_35]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A03-A01_ExactPatternGroupBindingHarnessRepairAnd136RouteReplay
```
