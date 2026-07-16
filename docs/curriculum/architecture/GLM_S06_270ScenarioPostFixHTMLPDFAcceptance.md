# GLM-S06 — 270-Scenario Post-Fix HTML/PDF Acceptance

## Purpose

Validate the merged GLM-S05 global exact-layout runtime against every public completed unit and every approved question-page layout.

This is an acceptance gate, not a baseline capture. A scenario passes only when the requested layout is resolved exactly, 18 questions are generated, the current public runtime renders the worksheet, and both HTML and PDF inspections report no defects.

## Authority entering this gate

- Public units: 15.
- Approved layouts per unit: 18.
- Base matrix: 270 scenarios.
- GLM-S05 PR: #233.
- GLM-S05 final head: `b0109beb7414feaa535b7a43ca1ea9ebc309b31d`.
- GLM-S05 merge SHA: `eef74bb90cbe6da074be97c97b533a2fc2028f02`.
- GLM-S05 focused and full regression workflows: PASS.

## Scenario contract

Each scenario uses:

- public selection mode `sourceUnit`;
- 18 generated questions;
- grouped pattern ordering;
- deterministic `glm-s06:<sourceId>:<layoutId>` seed;
- answer key disabled for this gate;
- the exact requested approved layout;
- the current public `buildWorksheetDocumentFromState` pipeline;
- the current public HTML renderer.

G5A-U02 must use its post-fix dynamic public runtime. Static S93 HTML substitution is forbidden.

## Acceptance conditions

All 270 scenarios must satisfy all of the following:

1. Generation succeeds and returns a worksheet document.
2. The generated question count is exactly 18.
3. `layoutResolution.layoutExact === true`.
4. `layoutResolution.capped === false`.
5. Resolved columns and rows equal the requested approved layout.
6. HTML contains a nonzero question-page count.
7. HTML question-card and prompt counts equal 18.
8. No card, text, or page overflow is detected.
9. No inter-card overlap is detected.
10. No blank PDF page is detected.
11. No PDF text bounding box leaves the page.
12. HTML question-page count equals PDF page count.
13. No browser console or page errors occur.

## Execution design

The matrix is split into five parallel shards. Each shard contains three units and 54 scenarios. PDFs remain transient; shard JSON manifests and failure screenshots are retained as workflow artifacts. The aggregate authority contains all 270 scenario records, per-unit summaries, PDF page totals, hashes, and defect classifications.

## Final status

The only passing global status is:

```text
PASS_ACCEPTED
ALL_270_POSTFIX_HTML_PDF_PASS
270 / 270 acceptance passes
15 / 15 units each pass 18 / 18 layouts
0 render findings
```

Any deviation produces `ACCEPTANCE_FAILED` and routes to `GLM-S06_PostFixDefectFullFix`.

## Next gate

After acceptance passes:

```text
GLM-S07_AnswerKeyAndMaximumBoundaryStress
```
