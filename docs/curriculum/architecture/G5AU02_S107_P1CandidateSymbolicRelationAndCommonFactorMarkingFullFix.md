# G5AU02-S107 P1 Candidate, Symbolic Relation and Common-Factor Marking FullFix

## Status

```text
TASK = G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix
STATUS = PASS_ACCEPTED_PENDING_MERGE
SOURCE_PROGRAM = G5AU02-S105_P1P2SourceParityMilestoneDefinition
PATTERN_ORDERS = 7,12,15
D0_ELIGIBLE = false
```

## Scope

S107 implements exactly three P1 patterns:

| Order | PatternSpec | Required display model |
|---:|---|---|
| 7 | `ps_g5a_u02_divisor_candidate_selection` | `candidate_circle_selection_row` |
| 12 | `ps_g5a_u02_complete_factor_list_unknown_values` | `symbolic_complete_factor_relation_table` |
| 15 | `ps_g5a_u02_common_factor_concept_identification` | `marked_common_factor_row` |

Out of scope: order 14, orders 10/18/19, P0 or S106 mutation, PatternSpec/ID changes, cross-unit changes, GCTX, free-form AI and generic fallback.

## Runtime outcomes

Order 7 materializes one unmarked circle affordance per candidate and recomputes the selected set from exact divisibility.

Order 12 uses Traditional Chinese symbols, a complete ordered factor table, two visible symmetric-pair equations and one unique symbolic solution. Each hidden symbol is paired with a visible factor, so the equation determines one value without exposing the answer directly.

Order 15 places the complete common-factor intersection in a markable candidate row, retains distractors, and derives the smallest and greatest common-factor roles from that intersection.

## Blocking codes

```text
G5AU02_P1_CANDIDATE_ROW_INCOMPLETE
G5AU02_P1_CANDIDATE_MARK_AFFORDANCE_INVALID
G5AU02_P1_CANDIDATE_DIVISIBILITY_MISMATCH
G5AU02_P1_SYMBOLIC_FACTOR_TABLE_INCOMPLETE
G5AU02_P1_SYMBOL_RELATION_MISMATCH
G5AU02_P1_PUBLIC_SYMBOL_POLICY_INVALID
G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE
G5AU02_P1_COMMON_FACTOR_ROW_INCOMPLETE
G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH
G5AU02_P1_COMMON_FACTOR_MARKING_MISMATCH
G5AU02_P1_COMMON_FACTOR_ROLE_MISMATCH
```

## Acceptance matrices

```text
canonical scenarios          = 3 × 64 = 192
public worksheet scenarios   = 3 × 64 = 192
actual layout projections    = 3 × 18 = 54
answer boundary projections  = 3 × 3 × 2 = 18
bundled scenarios            = 3 × 64 = 192
```

Accepted CI authority:

```text
source-contract + S97 supersession = PASS
browser-bundle audit and byte parity = PASS
complete Node regression = PASS
workflow permissions = contents: read
```

## Invariants

PatternSpec, KnowledgePoint, PatternGroup, FormalMapping and answer-model IDs remain stable. P0 and S106 accepted behavior remain immutable. Student questions contain blank marking/response affordances only; canonical answer records remain answer-key-only.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S106_FACTOR_STRUCTURE_FIXED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S107_SELECTION_SYMBOLIC_COMMON_FIXED
DISTANCE_REDUCED     = orders 7,12,15 now have deterministic runtime, blocking validators, structured public rendering, bundle parity and complete regression acceptance
REMAINING_BLOCKERS   = [merge,S108,S109,S110]
NEXT_SHORT_STEP      = G5AU02-S108_P2ControlledRemainderTransferContextFullFix
```
