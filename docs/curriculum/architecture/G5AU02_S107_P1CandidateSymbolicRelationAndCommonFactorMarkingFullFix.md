# G5AU02-S107 P1 Candidate, Symbolic Relation and Common-Factor Marking FullFix

## Status

```text
TASK = G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_PROGRAM = G5AU02-S105_P1P2SourceParityMilestoneDefinition
PATTERN_ORDERS = 7,12,15
D0_ELIGIBLE = false
```

## Scope

| Order | PatternSpec | Required display model |
|---:|---|---|
| 7 | `ps_g5a_u02_divisor_candidate_selection` | `candidate_circle_selection_row` |
| 12 | `ps_g5a_u02_complete_factor_list_unknown_values` | `symbolic_complete_factor_relation_table` |
| 15 | `ps_g5a_u02_common_factor_concept_identification` | `marked_common_factor_row` |

Out of scope:

```text
order 14
orders 10,18,19
P0 and S106 behavior changes
PatternSpec or identity changes
cross-unit changes
GCTX changes
free-form AI
generic fallback
```

## Runtime overlay

`src/curriculum/g5a-u02/s107-candidate-symbolic-runtime.js` is a higher-precedence Class C overlay. Existing answer-model IDs remain stable:

```text
order 7  = selectionSetAnswer
order 12 = structuredInferenceAnswer
order 15 = selectionSetAnswer
```

### Order 7

The runtime retains every candidate and independently recomputes exact divisibility. `selectionAffordance = empty_circle_per_candidate` is blocking. Canonical selections are validator data only; the student renderer creates one empty circle per candidate and never pre-marks a correct value.

### Order 12

The runtime materializes:

```text
target
shownFactorList
unknownKeys
pairRelations
symbolEquations
solutionCount = 1
```

Unknown positions are chosen only where the symmetric partner remains visible, except a square midpoint which uses `代號 × 代號 = 原數`. Public labels use `甲、乙、丙…`; internal keys such as `p1` never appear on student pages. The final factor remains visible so the original number and every symbol have one solution.

### Order 15

The runtime generates distinct quantities with a nontrivial common factor and materializes:

```text
factorSetA
factorSetB
candidateRow = union(factorSetA,factorSetB)
commonFactors = intersection(factorSetA,factorSetB)
smallestCommonFactor
greatestCommonFactor
```

The student renderer shows both complete sets, an empty-circle candidate row and blank smallest/greatest fields. Intersection and extrema remain hidden validator data.

## Blocking validator codes

```text
G5AU02_P1_CANDIDATE_SELECTION_AFFORDANCE_MISSING
G5AU02_P1_CANDIDATE_DIVISIBILITY_CLASSIFICATION_MISMATCH
G5AU02_P1_SYMBOLIC_FACTOR_RELATION_INCOMPLETE
G5AU02_P1_SYMBOLIC_FACTOR_EQUATION_MISMATCH
G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE
G5AU02_P1_COMMON_FACTOR_MARKING_INCOMPLETE
G5AU02_P1_COMMON_FACTOR_MIN_MAX_MISMATCH
G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH
```

## Public answer boundary

Forbidden student-page output:

```text
filled or checked candidate marks
internal pN keys
resolved symbol values in unknown cells
pre-highlighted common factors
resolved smallest or greatest common factor
answer record fields
```

## Acceptance matrices

```text
canonical scenarios        = 3 × 64 = 192
public worksheet scenarios = 3 × 64 = 192
actual layout projections  = 3 × 18 = 54
answer boundary            = 3 × 3 × 2 = 18
bundled scenarios          = 3 × 64 = 192
```

The S107 workflow is read-only. Existing canonical bundle authority must synchronize the generated browser bundle; S107 blocks unless committed byte parity is exact.

## Invariants

```text
PatternSpec IDs remain stable
KnowledgePoint IDs remain stable
PatternGroup IDs remain stable
FormalMapping IDs remain stable
answer-model IDs remain stable
P0 and S106 accepted behavior remain immutable
canonical answers are independently recomputed
student answer leakage is forbidden
Traditional Chinese public symbols are required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S106_FACTOR_STRUCTURE_FIXED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S107_CANDIDATE_SYMBOLIC_COMMON_FACTOR_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = orders 7,12,15 moved from P1 display and reasoning gaps to deterministic runtime, validator and renderer candidates
REMAINING_BLOCKERS   = CI,bundle sync,merge,S108,S109,S110
NEXT_SHORT_STEP      = G5AU02-S108_P2RemainderTransferStoryRoleFullFix
```
