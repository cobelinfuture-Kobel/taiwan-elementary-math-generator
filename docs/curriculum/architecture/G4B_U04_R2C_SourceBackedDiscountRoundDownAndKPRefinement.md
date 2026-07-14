# G4B-U04 R2C — Source-Backed Discount Round-Down and KP Refinement

```text
TASK = G4B_U04_R2C_SourceBackedDiscountRoundDownAndKPRefinement
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## Source evidence

Primary source: `題型總覽-4b04-概數.pdf`, page 1, fourth row.

The source explicitly presents a dehumidifier priced at 7,699 dollars whose special price “only counts whole thousands,” then asks both the special payment amount and the number of thousand-dollar banknotes. The worked reasoning keeps the thousands digit and discards lower digits.

This is distinct from the existing payment-ceiling source family, where banknotes must cover the original price and therefore use unconditional entering.

```text
source discount wording
→ floor(price / 1000) × 1000
→ discounted payment amount
→ discounted banknote count
```

## Authority refinement

Added KnowledgePoint:

```text
kp_g4b_u04_discount_denomination_round_down
```

Added PatternGroup:

```text
pg_g4b_u04_discount_round_down
```

Added PatternSpecs:

```text
ps_g4b_u04_discount_payment_amount_round_down
ps_g4b_u04_discount_banknote_count_round_down
```

Effective authority counts:

```text
KnowledgePoints = 13
PatternGroups   = 13
PatternSpecs    = 19
Class C         = 9
Class D         = 10
Application     = 6
```

The prior 12 KnowledgePoints, 12 PatternGroups and 17 PatternSpecs retain their IDs, ordering, formulas and answer models. The new specs are appended as pattern order 18 and 19.

## Semantic boundary

Discount round-down:

```text
price = q × 1000 + r, where 1 ≤ r ≤ 999
discountedAmount = q × 1000
discountedBanknoteCount = q
```

Existing payment ceiling:

```text
paymentAmount = ceil(price / denomination) × denomination
minimumBanknoteCount = ceil(price / denomination)
```

The validator rejects any attempt to answer a discount question with the ceiling payment result, to use a denomination other than the source-backed thousand-dollar denomination, or to omit the nonzero discarded remainder.

## Effective pipeline

```text
source evidence
→ R2C mapping candidate overlay
→ R2C FormalMapping overlay
→ R2C PatternSpec overlay
→ hidden Class D generator
→ blocking Class D validator
→ S71 integration gate
→ promotion and visible selector
→ canonical worksheet runtime
```

No generic fallback, arbitrary PatternSpec injection, formula inference from wording, or reinterpretation of existing payment-ceiling questions is allowed.

## Acceptance target

```text
new authority IDs present once
new source evidence traceable
new Class D questions deterministic
amount formula validator accepted
banknote formula validator accepted
ceiling reinterpretation rejected
single-KP public routing accepted
mixed 19-spec authority accepted
whole-worksheet prompt dedup preserved
Node Test PASS
S42 Branch Test PASS
Math CI PASS
S75 HTML/PDF smoke PASS
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2B_CLOSED_NEXT_R2C

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2C_IMPLEMENTED_PENDING_CI

DISTANCE_REDUCED =
Added the missing source-backed discount round-down KnowledgePoint, FormalMappings, PatternSpecs, generator and blocking validator without changing the existing payment-ceiling semantics.

REMAINING_BLOCKERS = [
  "R2C CI and production smoke not completed",
  "R2D layout readback not completed",
  "R2E controlled context materialization not completed",
  "R2F D0 recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2C_CIAndProductionSmokeCloseout

STOP_REASON = NONE
```
