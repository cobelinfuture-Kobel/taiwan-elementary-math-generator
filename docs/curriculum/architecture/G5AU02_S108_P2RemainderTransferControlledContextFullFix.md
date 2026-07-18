# G5AU02-S108 P2 Remainder Transfer Controlled Context FullFix

## Status

```text
STATUS = IMPLEMENTED_PENDING_CI
UNIT = g5a_u02
PATTERN_ORDER = 14
PATTERN_SPEC = ps_g5a_u02_remainder_transfer
SOURCE_EVIDENCE = g5a_u02_5a02a:p2:right-lower-middle
```

## Locked Scope

S108 changes only the accepted S105 order-14 repair target.

Included:

```text
finite controlled source-like scenario families
explicit total / distribution / divisor / remainder roles
preserved divisor-multiple arithmetic authority
independently recomputed two-level distribution witness
structured question display model
public HTML renderer representation
browser bundle acceptance
focused and full regression
```

Frozen:

```text
PatternSpec ID
KnowledgePoint ID
PatternGroup ID
FormalMapping ID
answer-model ID
P0 accepted behavior
S106 and S107 accepted behavior
S109 orders 10,18,19
S110 all-22 closeout
other units
GCTX
free-form AI
generic fallback
runtime web search
```

## Finite Scenario Registry

Runtime selection is restricted to four static families:

```text
school_sticker_packets
classroom_card_bundles
art_bead_bags
library_book_carts
```

Each family owns its context domain, actor, item noun, item unit and large/small distribution containers. Runtime may select a family and deterministic numeric profile only; it may not invent or rewrite a new family.

## Canonical Arithmetic

For every generated item:

```text
largerDivisor = smallerDivisor × multiplier
1 <= remainder < smallerDivisor
total = largerDivisor × largerGroupCount + remainder
smallerGroupCount = largerGroupCount × multiplier
total = smallerDivisor × smallerGroupCount + remainder
canonical remainder = total mod smallerDivisor
```

The existing `remainderAnswer` remains authoritative.

## Structured Display Model

```text
kind = remainder_transfer_story_witness
```

Required public fields:

```text
scenarioFamilyId
scenarioText
quantityRoles
divisorRelation
distributionWitness
remainder response role
```

The learner page displays the source-like story, divisor relation, known distribution equation, transferred distribution equation and a blank remainder response. Canonical answer fields remain answer-key-only.

## Blocking Codes

```text
G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_FAMILY_UNKNOWN
G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_ROLE_MISSING
G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH
```

## Acceptance Matrix

```text
canonical scenarios         = 1 × 64 = 64
public worksheet scenarios  = 1 × 64 = 64
approved layout projections = 1 × 18 = 18
answer boundary projections = 1 × 3 × 2 = 6
browser bundle scenarios    = 1 × 64 = 64
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S107_SELECTION_SYMBOLIC_COMMON_FIXED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S108_REMAINDER_TRANSFER_CONTEXT_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = order 14 moved from abstract numeric wording to finite controlled story roles, deterministic distribution witnesses, blocking validation and structured public rendering
REMAINING_BLOCKERS   = [S108 CI acceptance, committed browser bundle parity, merge, S109, S110]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = accept and merge S108, then execute G5AU02-S109_P2RegressionOnlySourceParityLock
```
