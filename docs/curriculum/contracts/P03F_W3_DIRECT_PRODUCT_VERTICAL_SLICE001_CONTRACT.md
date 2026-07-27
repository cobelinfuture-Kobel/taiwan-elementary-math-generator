# P03F W3 Direct Product Vertical Slice 001 Contract

## Scope

`P03F_W3DirectProductVerticalSlice001Implementation` consumes only queue position 1 from the frozen P03E authority:

```text
p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1
→ g3a_u08_3a08
→ kp_g3a_u08_part_whole_fraction
```

No second slice and no other G3A-U08 KnowledgePoint may start or be admitted by this task.

## Source and semantic authority

The source is the fully reviewed page-1 evidence for `3a08 分數`. The KnowledgePoint means:

```text
分母 = 整體的等分數
分子 = 所取的等份數
每一份必須等大
```

The authoritative classification is `APPLICATION_NOT_APPLICABLE`. P03F must not add a life story, SDG context or generic AI context.

## Identity preservation

P03F reuses and promotes the existing hidden semantic identities:

```text
KnowledgePoint = kp_g3a_u08_part_whole_fraction
OperationModel = op_g3a_u08_part_whole_fraction
PatternGroup   = pg_g3a_u08_part_whole_fraction_numeric
PatternSpec    = ps_g3a_u08_part_whole_fraction_fraction_numeric
```

The single PatternSpec deterministically covers both source-equivalent representations:

```text
CONTINUOUS_EQUAL_PARTITION
DISCRETE_SET_PARTITION
```

No duplicate PatternSpec may be created solely to represent those two presentation modes.

## Complete E6 D0 path

The slice passes only when every P03E-required node is present:

```text
Source evidence
→ KnowledgePoint identity
→ Tag Registry binding
→ FormalMapping
→ PatternSpec successor authority
→ Shared generator binding
→ deterministic browser validator
→ cap_fraction_number_system witness
→ cap_fraction_domain_validator witness
→ public source adapter
→ public Classic and Pixel selection
→ WorksheetDocument and answer key
→ production HTML
→ Chromium A4 PDF and print
→ product admission claim
```

Admission is fail closed until the full path passes. Partial admission is prohibited.

## Product rules

- Only numeric/structural mode is public.
- The public question-type control contains only `numeric`.
- Generated answers preserve the source representation numerator and denominator; canonical W3 reduction is retained as validator evidence and does not rewrite the displayed representation fraction.
- The generator and validator must be deterministic under a fixed seed.
- Numerator, denominator, answer and identity tampering must fail closed.
- The labels `算式`, `_____` and `答` are prohibited on the worksheet question surface.
- The shared worksheet assembler and production renderer must be used; a parallel product pipeline is forbidden.
- Chromium acceptance must produce an A4 PDF with zero horizontal or vertical overflow.

## Admission effect

On complete E6 closeout:

```text
new product admissions = 1
remaining direct queue slices = 52
remaining direct W3 KPs = 81
later-wave dependents = 33 unchanged
```

Slice 002 requires separate approval after slice 001 reaches D0.
