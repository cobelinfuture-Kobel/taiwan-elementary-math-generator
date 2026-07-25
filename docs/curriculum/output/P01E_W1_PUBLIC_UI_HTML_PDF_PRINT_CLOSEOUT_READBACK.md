# P01E W1 Public UI / HTML / PDF / Print Closeout Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01E_W1PublicUIHTMLPDFPrintCloseout
STATUS = IMPLEMENTED_PENDING_EXACT_HEAD_CI_AND_COMMITTED_OUTPUT_EVIDENCE
```

## Implemented public capability

```text
protected baseline source count = 13
public source count              = 19
new public W1 sources            = 4
W1 KnowledgePoints               = 21
numeric-public KnowledgePoints   = 21
application-eligible KPs         = 13
application-ineligible KPs       = 8
new PBL admissions               = 0
```

Classic and Pixel now consume the same nineteen-source registry and the same public-control profile authority.

## Application policy

Only source-backed, semantically stable relations receive application projections. The eight ineligible W1 KnowledgePoints remain numeric-only.

```text
numeric PatternSpec
→ deterministic question
→ unchanged answer
→ controlled Global Context prompt
→ shared WorksheetDocument
→ answer key
→ HTML / PDF / print
```

## Pending exact-head gate

The current implementation must still pass:

- full Node regression;
- P01E focused validator;
- eight Chromium PDF cases;
- Classic 8-generation live UI smoke;
- Pixel 8-generation live UI smoke;
- cumulative P01D1/P01D2/P01D3 PDF regressions;
- global GLM and POSTG workflows;
- committed exact HTML/PDF evidence and final E5 claim hash chain.

## Scope boundary

```text
W2-W8 started                    = false
new PBL added                    = false
parallel runtime created         = false
ineligible KP story coercion     = false
recursive improvement admin      = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_21_VERTICAL_SLICES_ADMITTED_PUBLIC_CLOSEOUT_PENDING
GOAL_DISTANCE_AFTER  = D2_W1_PUBLIC_CLOSEOUT_IMPLEMENTED_PENDING_EXACT_HEAD_EVIDENCE
DISTANCE_REDUCED     = Classic and Pixel public source, numeric/application, worksheet and print routes are implemented; exact-head acceptance and committed artifacts remain.
REMAINING_BLOCKERS   = [exact-head Node/Chromium/GLM/POSTG, committed HTML/PDF evidence, E5 claim upgrade]
NEXT_SHORTEST_STEP   = P01E_ExactHeadCIArtifactCommitAndMerge
```
