# P03F W3 Direct Product Vertical Slice 004 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice004Implementation
QUEUE      = 4 / p03e_q004_r5_g3b_u09_3b09_profile_decimal_c1
```

## Frozen scope

- source: `g3b_u09_3b09`
- KnowledgePoint: `kp_g3b_u09_tenth_representation`
- PatternGroup: `pg_g3b_u09_tenth_representation_numeric`
- PatternSpec: `ps_g3b_u09_tenth_representation_decimal_numeric`
- mode: numeric only
- application: not applicable
- required W3 capabilities: `cap_decimal_number_system`, `cap_decimal_domain_validator`

## Product invariant

```text
1 whole split into 10 equal parts
→ 1 part = 0.1
→ canonical decimal coefficient = 1, scale = 1
```

Every generated witness must preserve `whole=0`, `fractionalUnits=1`, `placeUnit=0.1`, answer `0.1`, and canonical identity `1e-1`.

## Required product path

```text
source evidence
→ Tag Registry
→ FormalMapping
→ hidden PatternSpec successor
→ shared planner / generator / validator
→ current Classic and Pixel selection
→ WorksheetDocument / answer key
→ production HTML
→ Chromium A4 PDF
→ visual and hash acceptance
→ D0 admission
```

## Forbidden expansion

- no decimal arithmetic capability
- no application stories or global context
- no other G3B-U09 KnowledgePoints
- no parallel generator, validator, worksheet or renderer pipeline
- no slice005 work

## D0 gate

Eight unique prompts, eight validated answers, one question page, one answer-key page, zero duplicate prompts, zero overflow/clipping/overlap/broken glyphs, committed HTML/PDF hash parity, full regression and exact-head CI must pass before queue position 4 is consumed.
