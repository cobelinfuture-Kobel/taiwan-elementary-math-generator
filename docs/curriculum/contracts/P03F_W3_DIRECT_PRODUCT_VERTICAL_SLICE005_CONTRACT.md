# P03F W3 Direct Product Vertical Slice 005 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice005Implementation
QUEUE      = 5
SLICE_ID   = p03e_q005_r5_g4b_u08_4b08_profile_fraction_c1
```

## Frozen scope

Only `g4b_u08_4b08` / `kp_g4b_u08_generate_equivalent_fraction` is admitted.

- KnowledgePoints: 1
- PatternGroups: 1
- numeric PatternSpecs: 3
- application PatternSpecs: 0
- global-context bindings: 0
- next slice started: false

The other six G4B-U08 KnowledgePoints remain hidden.

## Mathematical contract

For expansion:

```text
equivalentNumerator   = numerator × factor
equivalentDenominator = denominator × factor
```

For reduction, the larger numerator and denominator are both divided by the same positive integer factor.

Every generated item must satisfy exact rational identity:

```text
numerator / denominator
=
equivalentNumerator / equivalentDenominator
```

## Runtime contract

The vertical slice must consume, not duplicate:

```text
cap_fraction_number_system
cap_fraction_domain_validator
cap_fraction_arithmetic
```

It must use the shared planner, generator adapter, validator adapter, WorksheetDocument, answer-key projection and HTML/PDF renderer.

## Product acceptance

D0 requires:

- 9 deterministic unique numeric witnesses;
- all 3 PatternSpecs represented;
- 9 answer-key items;
- one A4 question page and one A4 answer page;
- no duplicate, overflow, clipping, overlap, broken glyph or semantic-scope findings;
- committed HTML/PDF with SHA256 parity;
- exact-head full regression and Chromium acceptance;
- PR merge and merged-state reconciliation.

Slice006 is outside this contract.
