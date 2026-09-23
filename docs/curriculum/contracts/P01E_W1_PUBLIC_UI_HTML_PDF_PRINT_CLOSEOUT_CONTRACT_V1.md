# P01E W1 Public UI / HTML / PDF / Print Closeout Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01E_W1PublicUIHTMLPDFPrintCloseout
DELIVERY_WAVE = R05-W1
```

## Closeout target

P01E converts the four isolated W1 source authorities admitted by P01D1-P01D3 into public Classic and Pixel product surfaces.

```text
protected baseline sources = 13
prior public sources        = 15
final public sources        = 19
W1 KnowledgePoints          = 21
numeric-public KPs          = 21
application-eligible KPs    = 13
application-ineligible KPs  = 8
new PBL admissions          = 0
```

## Public sources

- `g5b_u05_5b05a` - 億以上的數
- `g6a_u01_6a01` - 最大公因數與最小公倍數
- `g5a_u03_5a03a` - 倍數
- `g5a_u03_5a03a1` - 公倍數

## Application eligibility rule

Every W1 KnowledgePoint remains available as a numeric question.

Only thirteen source-backed KnowledgePoints whose mathematical relation can be represented by a stable life-context relation receive an application option. The remaining eight KnowledgePoints remain numeric-only. P01E must not create a story merely to increase application-question counts.

The application path is:

```text
existing numeric PatternSpec
→ deterministic numeric generation
→ exact answer retained
→ controlled semantic projection
→ shared Global Context lineage
→ existing validator / WorksheetDocument
→ answer key
→ HTML renderer
→ Chromium PDF / print
```

The projection may change only the learner-visible prompt and application metadata. It must preserve:

- sourceId;
- KnowledgePoint identity;
- exact PatternSpec;
- deterministic parameters;
- answerText;
- finalAnswer;
- validator compatibility.

## Public surface acceptance

Classic and Pixel must each provide:

- nineteen public source options;
- all four W1 sources;
- numeric/application mode selection for the four W1 sources;
- no PBL option for the four W1 sources;
- successful worksheet generation;
- answer-key pages;
- live HTML preview;
- enabled print control.

## Exact-head output acceptance

```text
PDF cases                  = 8
numeric PDF cases          = 4
application PDF cases      = 4
Classic live generations   = 8
Pixel live generations     = 8
overflow findings          = 0
console errors             = 0
page errors                = 0
```

## Hard boundaries

```text
W2-W8 implementation                         = forbidden
new PBL admission                            = forbidden
application-ineligible story coercion        = forbidden
parallel planner / validator                 = forbidden
parallel worksheet / HTML / PDF pipeline     = forbidden
free-form AI production generation           = forbidden
recursive-improvement administration         = forbidden before P10
```

## Closeout transition

```text
before = 21 W1 vertical slices admitted, public cutover pending
after  = 21 W1 KPs available through public UI, HTML, PDF and print
next   = P02_W2ProductAdmissionInventoryAndGapMatrix
```
