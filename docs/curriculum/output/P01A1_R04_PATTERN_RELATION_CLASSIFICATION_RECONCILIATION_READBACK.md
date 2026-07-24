# P01A1 R04 Pattern-Relation Classification Reconciliation Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A1_R04PatternRelationClassificationCorrectionAndW1Rebase
STATUS = PASS_PENDING_CI_PATTERN_RELATION_CLASSIFICATION_RECONCILIATION
```

## Root cause

```text
KnowledgePoint = kp_g4a_u07_quantity_multiplicative_pattern
canonical name = 倍數型數量規律
source category = pattern
source invariant = adjacent-stage ratio remains fixed
```

The former first-match classifier encountered the lexical term `倍數` before the explicit pattern semantics and selected `profile_factor_multiple`.

## Correction

```text
old profile = profile_factor_multiple
new profile = profile_pattern_relation
old wave    = R05-W1
new wave    = R05-W6
```

The corrected runtime requirement contains:

```text
cap_pattern_sequence_reasoning = contract_only
cap_pattern_relation_validator = contract_only
```

Therefore the KP is not capability-ready for W1 product admission.

## Corrected wave and inventory counts

```text
W0 = 156
W1 = 21
W2 = 0
W3 = 84
W4 = 53
W5 = 79
W6 = 33
W7 = 32
W8 = 24
Total = 482
```

```text
P01A W1 product candidates = 21
P01A source nodes          = 4
P01A vertical slices       = 21
```

## Scope proof

```text
new capability implementation = false
new product unit               = false
production admission           = false
existing 15-unit baseline      = unchanged
W6 product implementation      = not started
admin backend                  = forbidden before P10
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_FULL_PRODUCT_LINE_WITH_FALSE_W1_CANDIDATE
GOAL_DISTANCE_AFTER  = D2_FULL_PRODUCT_LINE_WITH_CORRECTED_DELIVERY_AUTHORITY
DISTANCE_REDUCED     = A lexical collision no longer authorizes a pattern-relation KP through factor/multiple runtime evidence.
REMAINING_BLOCKERS   = [21 W1 vertical slices, W2-W8 capabilities/products, P09 UI, P10 full closeout]
NEXT_SHORTEST_STEP   = P01D1_G5BU05LargeNumberVerticalSlice
```
