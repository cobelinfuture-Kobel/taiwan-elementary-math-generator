# P03F W3 Direct Product Vertical Slice 008 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice008Implementation
```

## Frozen queue scope

```text
queue position = 8
slice ID       = p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1
source         = g3b_u09_3b09
KnowledgePoints =
  kp_g3b_u09_decimal_read_write
  kp_g3b_u09_decimal_compose_decompose
runtime profile = profile_decimal
predecessor    = slice007 E6 D0 merged
slice009       = forbidden
```

## Source-backed capabilities

The learner reads and writes one-decimal-place values while preserving every place value:

```text
decimalText = encodePlaceValue(digitsByPlace)
```

The learner also composes one-decimal-place values from whole units and tenths:

```text
decimal = whole + fractionalUnits × 0.1
```

Required W3 capabilities:

```text
cap_decimal_domain_validator
cap_decimal_number_system
```

## Product surface

```text
KnowledgePoints       = 2
PatternGroups         = 2
PatternSpecs          = 2
numeric               = required
application           = not applicable
Global Context        = not applicable
question witnesses    = 8 total, 4 per PatternSpec
answer-key witnesses  = 8
```

The exact admitted identities are:

```text
pg_g3b_u09_decimal_read_write_numeric
ps_g3b_u09_decimal_read_write_decimal_text_numeric
pg_g3b_u09_decimal_compose_decompose_numeric
ps_g3b_u09_decimal_compose_decompose_decimal_numeric
```

## Required lineage

```text
source evidence
→ two KnowledgePoints
→ Tag Registry
→ two FormalMappings
→ two hidden PatternSpec authorities
→ decimal W3 number-system/domain-validator consumers
→ shared operation-family generator/validator adapters
→ current Classic and Pixel selector surfaces
→ shared WorksheetDocument and answer key
→ production HTML renderer
→ Chromium A4 PDF
→ committed hashes and visual semantic review
→ exact-head CI
→ E6 D0 merge
```

## Acceptance invariants

1. Read/write witnesses preserve both standard decimal notation and the exact Chinese place-value reading.
2. Compose/decompose witnesses satisfy `coefficient = whole × 10 + fractionalUnits`.
3. Canonical scale is exactly `1` for all eight witnesses.
4. Allocation is exactly four read/write and four compose/decompose questions.
5. Eight deterministic prompts are unique and contain no placeholder or forbidden worksheet labels.
6. Numeric mode is the only public question mode.
7. G3B-U09 exposes exactly three public KnowledgePoints after admission; four remain hidden.
8. Existing slice004 tenth-representation output and historical selector snapshot remain unchanged.
9. No new generator core, validator core, renderer, application story engine or parallel pipeline is created.
10. Production admission remains fail-closed until committed HTML/PDF, physical page parity, zero overflow, exact hashes and visual semantic review all pass.

## D0 boundary

```text
queuePositionConsumed                 = 8 only after D0
slice008 KnowledgePoints admitted     = both or neither
slice009 started                      = false
other G3B-U09 KPs admitted            = false
application story generation          = false
shared renderer behavior changed      = false
parallel runtime pipeline             = false
next task requires separate approval  = true
```
