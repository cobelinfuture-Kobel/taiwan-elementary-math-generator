# GCKG R04 Shared Runtime Capability Matrix Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R04_SharedRuntimeCapabilityMatrix
STATUS = PASS_R04_SHARED_RUNTIME_CAPABILITY_MATRIX_WITH_P01A1_CLASSIFICATION_CORRECTION
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

The matrix distinguishes `production_admitted`, `shadow_available`, and `contract_only`. Every KnowledgePoint receives required, optional, and forbidden capability sets plus an executable delivery-state readback.

## P01A1 semantic-collision correction

During W1 product admission, the source-backed KnowledgePoint:

```text
kp_g4a_u07_quantity_multiplicative_pattern
canonical name = 倍數型數量規律
capability     = identify a fixed multiplicative sequence relation
invariant      = the adjacent-stage ratio remains fixed
```

was found to contain both the lexical term `倍數` and the explicit semantic term `規律`. The original first-match policy selected `profile_factor_multiple`, although the canonical capability and invariant are pattern-relation semantics.

The corrected narrow rule is:

```text
when one KP matches both factor/multiple vocabulary and explicit pattern/relation semantics,
profile_pattern_relation takes precedence.
```

Ordinary factor, multiple, divisibility, GCD, and LCM KnowledgePoints keep `profile_factor_multiple`.

The corrected KP now requires:

```text
cap_pattern_sequence_reasoning
cap_pattern_relation_validator
cap_text_numeric_representation
+ common worksheet / answer-key / HTML capabilities
```

Because the pattern generator and validator are still `contract_only`, this KP is blocked by contract-only capabilities rather than production-ready.

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

## Boundary

```text
production consumer changed = false
parallel runtime created    = false
legacy Batch used           = false
profile correction scope    = one semantic-collision policy
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = A false production-capability classification is removed; runtime demand now follows the canonical mathematical invariant instead of a lexical substring collision.
REMAINING_BLOCKERS   = [delivery-wave rebase readback update, W1 product materialization, W2-W8 capabilities and products]
NEXT_SHORTEST_STEP   = P01A1_R04PatternRelationClassificationCorrectionAndW1Rebase
```
