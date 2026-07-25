# W2 Prerequisite Readiness Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02D_W2PrerequisiteReadinessConsumerAdmission
CAPABILITY = cap_prerequisite_readiness
```

## 1. Authority lineage

```text
R02 Global KnowledgePoint authority
→ R03 direct prerequisite graph
→ P02B production Global authority lookup
→ P02D read-only prerequisite-readiness consumer
→ P02D fail-closed validator
→ P02D successor capability-promotion registry
```

R03 remains the only prerequisite-edge authority. P02D may materialize descriptors and readiness results, but must not add, remove, infer or rewrite graph edges.

## 2. Exact scope

```text
canonical KnowledgePoints = 482
direct edges              = 668
required edges            = 665
alternative edges         = 2
supporting edges          = 1
root KnowledgePoints      = 25
alternative groups        = 1
readiness mode            = MASTERED_SET_N_PLUS_ONE
```

Every canonical KnowledgePoint must have exactly one P02D readiness descriptor.

## 3. Request contract

A target readiness request contains:

```text
targetKnowledgePointId
masteredKnowledgePointIds[]
```

The mastered set is supplied by the caller. P02D does not persist learner state, mutate mastery, select a lesson, or schedule instruction.

The empty mastered set is valid and exposes only graph roots. A missing mastered-set field is invalid because implicit learner state is forbidden.

## 4. N+1 readiness rule

A target is `READY_N_PLUS_ONE` only when:

1. the target is canonical and is not already mastered;
2. every direct `required` prerequisite is mastered;
3. every direct `alternative` group meets its declared `minimumSatisfied` value;
4. `supporting` edges are ignored for blocking readiness.

A valid canonical target with unmet prerequisites returns a non-blocked `BLOCKED_BY_PREREQUISITES` result with exact missing requirements. Invalid identity or malformed state blocks the request entirely.

## 5. Fail-closed behavior

```text
missing target              → P02D_TARGET_KP_ID_REQUIRED
missing mastered-set field  → P02D_MASTERED_SET_REQUIRED
non-array mastered set      → P02D_MASTERED_SET_INVALID
duplicate mastered ID       → P02D_DUPLICATE_MASTERED_KP
unknown target              → P02D_UNKNOWN_TARGET_KP
unknown mastered ID         → P02D_UNKNOWN_MASTERED_KP
already-mastered target     → P02D_TARGET_ALREADY_MASTERED
missing alternative contract→ P02D_ALTERNATIVE_GROUP_CONTRACT_MISSING
```

Unknown identities must never be treated as roots or silently removed from the mastered set.

## 6. Production admission

P02D may promote only:

```text
cap_prerequisite_readiness
```

The following predecessor promotions remain effective:

```text
cap_kp_authority_lookup
cap_quantity_dimension_unit_identity
```

R04 and R03 remain immutable historical authorities. Effective status is recorded through the validated P02D successor registry.

## 7. Explicit exclusions

```text
learner profile storage        = forbidden
mastery persistence            = forbidden
mastery mutation               = forbidden
lesson planner implementation  = forbidden
lesson scheduling              = forbidden
quantity semantic roles        = forbidden
same-unit arithmetic           = forbidden
PatternSpec / generator        = forbidden
worksheet / renderer / UI      = forbidden
P03-P08                        = forbidden
```

## 8. Acceptance

Production admission requires:

- 482 / 482 descriptor materialization;
- 668 / 668 direct-edge preservation;
- 482 / 482 fully satisfied target readiness sweep;
- a blocking witness for each target having a required prerequisite;
- exactly 25 roots from an empty mastered set;
- alternative-group minimum enforcement;
- supporting-edge non-blocking enforcement;
- malformed and unknown identity fail-closed tests;
- predecessor promotion preservation;
- exactly one new P02D promotion;
- full Node regression PASS.
