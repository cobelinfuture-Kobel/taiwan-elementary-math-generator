# G5AU02-S106 P1 Factor Pair, Symmetry and Masked Table FullFix

## Status

```text
TASK = G5AU02-S106_P1FactorPairSymmetryAndMaskedTableFullFix
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_PROGRAM = G5AU02-S105_P1P2SourceParityMilestoneDefinition
PATTERN_ORDERS = 3,5,6
D0_ELIGIBLE = false
```

## Scope

S106 implements exactly three P1 patterns from the merged S105 program:

| Order | PatternSpec | Required display model |
|---:|---|---|
| 3 | `ps_g5a_u02_factor_pair_enumeration` | `factor_pair_search_stop_boundary` |
| 5 | `ps_g5a_u02_factor_order_and_symmetry` | `u_shaped_factor_symmetry_record` |
| 6 | `ps_g5a_u02_missing_factor_reconstruction` | `masked_factor_table_with_pair_cues` |

Out of scope:

```text
orders 7,12,15
order 14
orders 10,18,19
P0 runtime changes
PatternSpec or ID changes
cross-unit changes
GCTX changes
free-form AI
generic fallback
```

## Runtime overlay

`src/curriculum/g5a-u02/s106-factor-structure-runtime.js` is a higher-precedence Class C overlay. It preserves the existing answer-model IDs and canonical routes.

### Order 3

The runtime materializes:

```text
target
searchRows
searchEnd = floor(sqrt(target))
crossingBoundary = searchEnd + 1
factorPairs
```

Every search row is deterministic and records candidate factor, paired factor when exact, product, exactness and boundary status. The crossed-boundary row is retained as a stop witness but is not treated as a new factor pair.

### Order 5

The runtime materializes:

```text
orderedFactors
symmetricPairs
outerToInnerLinks
midpointPolicy
```

Non-square targets use paired outer-to-inner links. Square targets use one `single_square_root_center` midpoint and never duplicate the square root.

### Order 6

The runtime materializes:

```text
visibleValues
hiddenPositions
pairLinks
solutionCount = 1
```

The existing `missingValueMapAnswer` is retained. Pair links make the source symmetry method learner-observable, while the validator independently recomputes every missing value from the known target and ordered factor structure.

## Public display boundary

Student pages expose scaffolds but not completed answers:

- order 3 shows candidate multiplication rows with blank partners and an explicit stop boundary;
- order 5 shows blank U-shaped pair records and a distinct square midpoint policy;
- order 6 shows the partially filled ordered factor table and position-based pair cues.

Exact factor pairs and missing values remain in the hidden answer record only.

## Blocking validator codes

```text
G5AU02_P1_FACTOR_PAIR_SEARCH_ROWS_INCOMPLETE
G5AU02_P1_FACTOR_PAIR_STOP_BOUNDARY_INVALID
G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH
G5AU02_P1_FACTOR_SYMMETRY_ORDER_INVALID
G5AU02_P1_U_RECORD_LINK_MISMATCH
G5AU02_P1_FACTOR_SYMMETRY_MIDPOINT_INVALID
G5AU02_P1_MASKED_FACTOR_TABLE_INCOMPLETE
G5AU02_P1_PAIR_SYMMETRY_CUE_INVALID
G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE
```

## Acceptance matrices

```text
canonical scenarios       = 3 × 64 = 192
public worksheet scenarios = 3 × 64 = 192
actual layout projections = 3 × 18 = 54
answer boundary           = 3 × 3 × 2 = 18
bundled scenarios         = 3 × 64 = 192
```

The browser workflow rebuilds the canonical bundle and blocks unless the committed bundle is byte-equivalent to the generated output.

## Invariants

```text
PatternSpec IDs remain stable
KnowledgePoint IDs remain stable
PatternGroup IDs remain stable
FormalMapping IDs remain stable
answer-model IDs remain stable
P0 accepted behavior remains immutable
runtime generation is deterministic
canonical answers are independently recomputed
student answer leakage is forbidden
Traditional Chinese public notation is required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_P1_P2_SOURCE_PARITY_PROGRAM_LOCKED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S106_FACTOR_STRUCTURE_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = orders 3,5,6 moved from P1 representation gaps to deterministic runtime, validator and renderer candidates
REMAINING_BLOCKERS   = CI,bundle sync,merge,S107,S108,S109,S110
NEXT_SHORT_STEP      = G5AU02-S107_P1CandidateSymbolicRelationAndCommonFactorMarkingFullFix
```
