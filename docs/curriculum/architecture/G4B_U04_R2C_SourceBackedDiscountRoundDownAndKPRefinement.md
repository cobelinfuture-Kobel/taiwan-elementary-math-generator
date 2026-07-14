# G4B-U04 R2C — Source-Backed Discount Round-Down and KP Refinement

```text
TASK = G4B_U04_R2C_SourceBackedDiscountRoundDownAndKPRefinement
STATUS = PASS_CI_SYNCED_AND_IMPLEMENTATION_MERGED
SOURCE_ID = g4b_u04_4b04
IMPLEMENTATION_PR = 208
IMPLEMENTATION_MERGE_SHA = e95561415a0525fe77ec24935265a78a4967729d
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
→ S73 worksheet projection
→ S74 public UI and query state
→ S75 production projection and HTML/PDF smoke
```

No generic fallback, arbitrary PatternSpec injection, formula inference from wording, or reinterpretation of existing payment-ceiling questions is allowed.

## R2C1 downstream effective-authority synchronization

The implementation initially exposed the correct 13／13／19 authority but S73, S74 and S75 validation contracts still compared against the historical 12／12／17 counts. R2C1 corrected only those downstream effective-count gates.

```text
S68 historical authority = 12 / 12 / 17, unchanged
S73 effective worksheet authority = 13 / 13 / 19
S74 public UI authority = 13 / 13 / 19
S75 production authority = 13 / 13 / 19
```

The historical S68–S75 JSON artifacts and existing worksheet, renderer, query-state and production lifecycle values were not rewritten.

## Acceptance evidence

```text
Node Test
run = 29340886225
result = PASS

S42 Branch Test
run = 29340890635
result = PASS

Math CI Readback
run = 29340891047
result = PASS

S96D Focused Test and full-suite enforcement
run = 29340890447
result = PASS

S75 G4B-U04 HTML/PDF Smoke
run = 29340887003
result = PASS
full Node suite = PASS
68-question canonical HTML = PASS
DOM containment = PASS
PDF print = PASS
all rendered pages nonblank = PASS
A4 bounding-box containment = PASS
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2B_CLOSED_NEXT_R2C

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2C_CLOSED_NEXT_R2D

DISTANCE_REDUCED =
Added and production-validated the missing source-backed discount round-down KnowledgePoint, FormalMappings, PatternSpecs, generator and blocking validator, then synchronized S73–S75 effective authority contracts without changing historical base authority or payment-ceiling semantics.

REMAINING_BLOCKERS = [
  "R2D layout readback not completed",
  "R2E controlled context materialization not completed",
  "R2F D0 recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA

STOP_REASON = NONE
```
