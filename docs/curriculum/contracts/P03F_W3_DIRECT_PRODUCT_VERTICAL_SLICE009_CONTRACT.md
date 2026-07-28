# P03F W3 Direct Product Vertical Slice 009 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice009Implementation
QUEUE_POSITION = 9
SLICE_ID = p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1
```

## Frozen scope

```text
source = g3b_u09_3b09
KnowledgePoint = kp_g3b_u09_tenths_fraction_decimal
canonical name = 十分之幾與一位小數互換
profile = profile_fraction
question mode = NUMERIC_ONLY
application / Global Context = NOT_APPLICABLE
slice010 started = false
```

## Capability contract

```text
cap_fraction_number_system
cap_fraction_domain_validator
```

No decimal arithmetic, decimal-domain validator substitution, generic fallback, application story route, or parallel worksheet pipeline is permitted.

## Formal relation

```text
numerator / 10 = decimalTenths
1 <= numerator <= 9
denominator = 10
decimal scale = 1
```

Fraction-number normalization may reduce the canonical rational value internally, but the public source representation and decimal-to-fraction answer must preserve denominator 10 because the curriculum target is tenths representation.

## PatternSpec

```text
PatternGroup = pg_g3b_u09_tenths_fraction_decimal_numeric
PatternSpec  = ps_g3b_u09_tenths_fraction_decimal_conversion_numeric
allocation   = 4 fraction_to_decimal + 4 decimal_to_fraction
question count = 8
```

## Product lineage

```text
source evidence
→ KnowledgePoint / Tag Registry
→ FormalMapping
→ PatternSpec
→ shared generator adapter
→ deterministic validator adapter
→ fraction number-system / domain-validator witnesses
→ current Classic / Pixel selector
→ shared WorksheetDocument / answer key
→ production HTML
→ Chromium A4 PDF
→ reviewed artifact hashes
→ exact-head CI
→ E6 D0 claim
```

## Acceptance

- Eight unique prompts and answers.
- Four witnesses in each direction.
- Every public fraction has denominator 10.
- Every decimal has exactly one decimal place.
- Classic and Pixel expose four G3B-U09 KPs; three remain hidden.
- One question page and one answer-key page; physical PDF page count is two.
- No clipping, overlap, broken glyph, forbidden response labels, semantic drift, or duplicate prompts.
- q009 adds exactly one product admission; q010 remains unstarted.
