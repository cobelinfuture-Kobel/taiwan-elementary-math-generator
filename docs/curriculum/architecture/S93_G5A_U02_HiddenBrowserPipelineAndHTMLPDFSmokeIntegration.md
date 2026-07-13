# S93 G5A-U02 Hidden Browser Pipeline and HTML/PDF Smoke Integration

## Status

`VERIFIED_ARTIFACT_COMMITTED_PENDING_PR_CI`

## Scope

S93 connects the closed S92 renderer to a dedicated hidden browser bundle and a Chromium HTML/PDF verification workflow.

Included:

- explicit internal browser bundle for G5A-U02;
- deterministic 22-question canonical smoke covering all PatternSpecs;
- 22 answer records and 44 one-record A4 pages;
- all 16 answer-model shapes;
- compact, contextual and reasoning renderer profiles;
- noindex browser HTML and an explicit hidden-pipeline marker;
- DOM overflow checks;
- Chromium A4 PDF generation;
- all-page raster/nonblank verification;
- PDF text bounding-box containment;
- Traditional Chinese text extraction;
- SHA-256, page-count and visual verification manifest;
- answer-key suppression and lifecycle mutation QA.

Excluded:

- public selector exposure;
- Classic or Pixel UI changes;
- public query-state changes;
- public preview routing;
- production promotion;
- generic fallback;
- free-form AI.

## Data flow

```text
S90 canonical resolver
→ S91 hidden WorksheetDocument
→ S92 hidden A4 HTML renderer
→ S93 hidden browser bundle
→ Chromium DOM containment
→ A4 PDF
→ raster, bbox and CJK verification
```

S93 does not mutate the S91 WorksheetDocument or S92 rendered worksheet. It adds a separate browser bundle lifecycle overlay.

## Canonical smoke contract

```text
questionCount       = 22
answerCount         = 22
questionRowsPerPage = 1
answerRowsPerPage   = 1
questionPageCount   = 22
answerPageCount     = 22
expectedPdfPages    = 44
PatternSpecs        = 22
answer-model shapes = 16
renderer profiles   = compact/contextual/reasoning
```

One record per page is intentional for this hidden smoke gate. It makes profile coverage, card containment and final-answer-page verification unambiguous. Print-density optimization remains outside S93.

## Browser bundle contract

`G5AU02HiddenBrowserBundle` carries:

- deterministic HTML;
- exact question/answer card counts;
- exact question/answer page counts;
- expected PDF page count;
- renderer profile coverage;
- answer-model coverage;
- hidden lifecycle status.

The validator blocks:

- schema or unit mismatch;
- source renderer validation failure;
- question, answer or page-count drift;
- invalid renderer profiles;
- missing noindex or pipeline markers;
- answer-key suppression failure;
- internal curriculum-ID leakage;
- unresolved placeholders;
- public or production lifecycle mutation.

## Chromium gate

Workflow: `.github/workflows/s93-g5a-u02-hidden-html-pdf-smoke.yml`

The workflow:

1. runs the full Node test suite;
2. generates the canonical hidden HTML and pending manifest;
3. loads the file in Chromium;
4. checks 22 question cards, 22 answer cards and 44 pages;
5. rejects DOM overflow;
6. verifies all three renderer profiles are present;
7. prints an A4 PDF;
8. rasterizes all pages and rejects blanks;
9. rejects PDF text bounding-box overflow;
10. verifies Traditional Chinese title and answer-page text;
11. finalizes SHA-256 and visual evidence;
12. commits the first verified HTML/PDF/manifest bundle to the implementation branch;
13. uploads HTML, PDF, manifest and page images as a workflow artifact.

## Verified artifact evidence

The branch workflow committed:

- `docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html`;
- `docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.pdf`;
- `docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.manifest.json`.

Verified manifest state:

```text
status                       = hidden_html_pdf_smoke_pass
questionCount                = 22
answerCount                  = 22
actualPdfPageCount           = 44
renderedPageImageCount       = 44
nonblankRenderedPageCount    = 44
domOverflowCount             = 0
pdfBoundingBoxOverflowCount  = 0
internalIdLeakCount          = 0
unresolvedPlaceholderCount   = 0
finalAnswerPageNonblank      = true
cjkGlyphRendering            = pass
visualRenderVerification     = all_pages_nonblank_and_bbox_contained
```

The bot-created verified-artifact commit intentionally requires a following user-authored documentation commit so GitHub can execute PR workflows on the final head.

## Lifecycle boundary

```text
rendererStatus        = hidden_html_integrated
worksheetStatus       = hidden_exact_count_integrated
answerKeyStatus       = hidden_integrated_optional
selectorStatus        = hidden
canonicalRouting      = internal_explicit_only
browserPipelineStatus = hidden_connected
htmlPdfSmokeStatus    = hidden_smoke_passed
productionUse         = forbidden
genericFallback       = forbidden
freeFormAI            = forbidden
```

The committed manifest reports `htmlPdfSmokeStatus = hidden_smoke_passed`. This does not change `selectorStatus` or `productionUse`.

## Acceptance

S93 is accepted only when:

- Node Test passes on the final PR head;
- Math CI Readback passes on the final PR head;
- S42 Branch Test passes on the final PR head;
- S93 hidden HTML/PDF smoke passes on the final PR head;
- the verified HTML/PDF/manifest bundle is committed;
- the implementation PR is merged;
- a fresh-main readback matches the merge commit.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_HIDDEN_RENDERER_VERIFIED_AND_CLOSED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_HIDDEN_BROWSER_AND_HTML_PDF_SMOKE_VERIFIED_PENDING_FINAL_PR_CI
```

This milestone advances the Worksheet Output node from deterministic HTML to browser-executed and PDF-verifiable output. Public exposure and production eligibility remain separate gates.

## Next shortest step

After final-head PR CI, merge and fresh-main closeout:

`S94_G5A_U02_PublicSelectorPrintAndQueryStateQA`
