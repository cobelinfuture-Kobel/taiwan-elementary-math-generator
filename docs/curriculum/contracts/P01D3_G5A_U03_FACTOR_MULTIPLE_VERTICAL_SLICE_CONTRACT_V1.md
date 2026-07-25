# P01D3 G5A-U03 Factor / Multiple Vertical Slice Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D3_G5AU03FactorMultipleVerticalSlice
SOURCE_NODES = g5a_u03_5a03a + g5a_u03_5a03a1
DELIVERY_WAVE = R05-W1
```

## Product scope

P01D3 admits the final twelve W1 KnowledgePoints through the existing full-product worksheet path.

```text
KnowledgePoints = 12
FormalMappings   = 12
PatternGroups    = 12
PatternSpecs     = 24
source split     = 7 + 5
```

The source-backed scope is:

- factor/multiple relation;
- divisibility by 2, 3, 5 and 10;
- exact grouping feasibility;
- multiple enumeration, bounded search and counting;
- divisor/multiple classification;
- common multiples and least common multiple;
- factor/multiple language;
- two-group common totals;
- divisibility-constrained number construction.

`kp_g5a_u03a1_rectangle_square_tiling` is not admitted by this task because its primary product capability belongs to the geometry delivery path rather than W1.

## Required lineage

```text
source evidence
→ canonical KnowledgePoint
→ FormalMapping / PatternGroup / PatternSpec
→ isolated full-product source authority
→ existing Batch A planner
→ shared number-theory primitives
→ deterministic factor/multiple domain runtime
→ stable validator facade
→ existing WorksheetDocument and answer key
→ existing HTML renderer
→ Chromium PDF and print evidence
```

## Acceptance

- 12 unique KPs, 12 PatternGroups and 24 PatternSpecs;
- exact 7/5 source split;
- source-unit and single-KP generation;
- deterministic replay;
- all 24 PatternSpecs exercised;
- answer reconstruction and tamper fail-closed;
- two worksheets with answer keys and paginated HTML;
- non-empty Chromium PDFs with zero overflow, page errors and console errors;
- P01A inventory reads 21 admitted and 0 remaining;
- protected 15-unit registry remains unchanged.

## Hard boundaries

```text
public source dropdown changed = false
application stories added      = false
parallel planner               = false
parallel validator             = false
parallel worksheet or renderer = false
W2-W8 implementation           = false
recursive improvement admin    = false before P10
```

Public UI selection and complete W1 HTML/PDF/print closeout remain owned by `P01E_W1PublicUIHTMLPDFPrintCloseout`.
