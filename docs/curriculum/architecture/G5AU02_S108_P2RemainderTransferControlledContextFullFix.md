# G5AU02-S108 P2 Remainder Transfer Controlled Context FullFix

## Status

```text
STATUS = PASS_ACCEPTED_PENDING_MERGE
UNIT = g5a_u02
PATTERN_ORDER = 14
PATTERN_SPEC = ps_g5a_u02_remainder_transfer
SOURCE_EVIDENCE = g5a_u02_5a02a:p2:right-lower-middle
ACCEPTED_HEAD = dc0ec4209169c1261f3e520e04643f99faec1200
ACCEPTANCE_RUN = 29647257252
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

The existing `remainderAnswer` remains authoritative. S87 legacy remainder error codes remain observable for backward-compatible negative mutation tests.

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

The learner page displays the source-like story, divisor relation and known distribution witness. The target smaller-distribution quotient and remainder remain blank response fields. Canonical answer fields and completed target arithmetic remain answer-key-only.

## Blocking Codes

```text
G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_FAMILY_UNKNOWN
G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_ROLE_MISSING
G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH
```

## Acceptance Matrix

```text
canonical scenarios         = 1 × 64 = 64 PASS
public worksheet scenarios  = 1 × 64 = 64 PASS
approved layout projections = 1 × 18 = 18 PASS
answer boundary projections = 1 × 3 × 2 = 6 PASS
browser bundle scenarios    = 1 × 64 = 64 PASS
full Node regression        = 1712 / 1712 PASS
```

## CI Evidence

Run `29647257252` on accepted head `dc0ec4209169c1261f3e520e04643f99faec1200`:

```text
source-contract = success
  S108 focused source / validator / renderer acceptance = success
  S107 predecessor regression = success
browser-bundle = success
  canonical build = success
  bundled S108 authority = success
  committed byte parity = success
full-regression = success
  tests = 1712
  pass = 1712
  fail = 0
```

## Closeout

```text
1. Distance shortened:
   order 14 moved from abstract numeric wording to source-like controlled context with learner-visible roles and validated witnesses.

2. System node advanced:
   PatternSpec -> deterministic generator -> blocking validator -> structured display -> public renderer -> browser bundle.

3. Blocker removed:
   G5AU02_S98_REMAINDER_TRANSFER_STORY_CONTEXT_COLLAPSED.

4. New blocker:
   none inside S108; unit-level blockers remain S109 and S110.

5. Next shortest effective step:
   merge PR #265, then execute G5AU02-S109_P2RegressionOnlySourceParityLock.
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S107_SELECTION_SYMBOLIC_COMMON_FIXED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S108_REMAINDER_TRANSFER_CONTEXT_FIXED
DISTANCE_REDUCED     = order 14 now has finite controlled context families, explicit quantity roles, deterministic distribution witnesses, blocking validation, structured public rendering, committed browser bundle parity and 1712/1712 regression acceptance
REMAINING_BLOCKERS   = [merge PR #265, S109, S110]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = merge S108 and execute G5AU02-S109_P2RegressionOnlySourceParityLock
STOP_REASON          = NONE
```
