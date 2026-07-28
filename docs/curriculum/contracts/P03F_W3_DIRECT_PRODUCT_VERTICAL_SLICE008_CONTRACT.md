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
KnowledgePoint = kp_g3b_u09_decimal_compose_decompose
runtime profile = profile_decimal
predecessor    = slice007 E6 D0 merged
slice009       = forbidden
```

## Source-backed capability

The learner composes one-decimal-place values from whole units and tenths:

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
PatternGroups        = 1
PatternSpecs         = 1
numeric              = required
application          = not applicable
Global Context       = not applicable
question witnesses   = 8
answer-key witnesses = 8
```

The exact admitted identities are:

```text
pg_g3b_u09_decimal_compose_decompose_numeric
ps_g3b_u09_decimal_compose_decompose_decimal_numeric
```

## Required lineage

```text
source evidence
→ KnowledgePoint
→ Tag Registry
→ FormalMapping
→ hidden PatternSpec authority
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

1. Every generated value satisfies `coefficient = whole × 10 + fractionalUnits`.
2. Canonical scale is exactly `1` and canonical text is `whole.fractionalUnits`.
3. Eight deterministic witnesses are unique and contain no placeholder or forbidden worksheet labels.
4. Numeric mode is the only public question mode.
5. G3B-U09 exposes exactly two public KnowledgePoints after admission; five remain hidden.
6. Existing slice004 tenth-representation output remains unchanged.
7. No new generator core, validator core, renderer, application story engine or parallel pipeline is created.
8. Production admission remains fail-closed until committed HTML/PDF, physical page parity, zero overflow, exact hashes and visual semantic review all pass.

## D0 boundary

```text
queuePositionConsumed                 = 8 only after D0
slice009 started                      = false
other G3B-U09 KPs admitted            = false
application story generation          = false
shared renderer behavior changed      = false
parallel runtime pipeline             = false
next task requires separate approval  = true
```
