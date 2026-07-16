# GLM-S03 — 270-Scenario HTML/PDF Baseline

```text
TASK = GLM-S03_270ScenarioHTMLPDFBaseline
STATUS = IMPLEMENTED_PENDING_CI_EVIDENCE
DEPENDS_ON = GLM-S00 + GLM-S01 + GLM-S02
PUBLIC_UNIT_COUNT = 15
APPROVED_LAYOUT_COUNT_PER_UNIT = 18
BASE_SCENARIO_COUNT = 270
NEXT = GLM-S04_GlobalLayoutArchitectureDesign
```

## 1. Purpose

GLM-S03 measures the current public output at the rendered HTML and Chromium PDF layers. It does not repair current layout caps, ignored controls, route failures or renderer defects.

The baseline is:

```text
15 public units × 18 approved layouts = 270 scenarios
```

Every scenario uses the same deterministic source-unit seed as GLM-S01, requests 18 questions, disables the answer key and preserves the current runtime behavior.

## 2. No pre-repair normalization

GLM-S03 must not make the system appear healthier than it is.

- exact layouts remain `PASS` at the document layer;
- lower resolved dimensions remain `SILENTLY_CAPPED`;
- absent or non-authoritative layout handling remains `IGNORED`;
- failed public routes remain `GENERATION_BLOCKED`;
- generated output is rendered even when the document layer was capped or ignored;
- no per-unit patch is applied by the audit.

G4B-U04 source-unit failures therefore remain visible even though its promoted KnowledgePoint route has separate R4 acceptance. G5A-U02 continues to use its fixed canonical static HTML, which is rendered once per unique HTML body and reused across its 18 ignored requests.

## 3. Parallel execution

The 270 scenarios are split deterministically into five shards:

```text
5 shards × 3 units × 18 layouts = 54 scenarios per shard
```

Each shard installs Chromium, Traditional Chinese fonts and Poppler, then:

1. builds the public worksheet document;
2. renders current HTML when generation succeeds;
3. emulates print media;
4. checks DOM containment and card geometry;
5. creates a transient A4 PDF;
6. renders every PDF page to a low-resolution image;
7. checks blank pages and PDF text bounding boxes;
8. writes JSON evidence and failure screenshots;
9. removes the need to retain hundreds of PDFs in the repository.

## 4. HTML checks

For every rendered scenario, the audit records:

- question-page count;
- question-card count;
- prompt and response-prompt counts;
- card overflow;
- prompt or response overflow;
- page overflow;
- inter-card overlap;
- missing prompt text;
- browser console errors;
- page errors.

The selectors cover the generic worksheet renderer and specialized G4B-U04, G5A-U08 and G5A-U02 surfaces.

A failure screenshot is retained only when a DOM visual defect is detected.

## 5. PDF checks

Every unique rendered HTML body produces an A4 Chromium PDF with CSS page size preferred. The PDF inspector records:

- PDF SHA-256 and byte size;
- PDF page count;
- rendered-image page count;
- nonblank and blank page counts;
- `pdftotext -bbox-layout` page count;
- text bounding-box overflow count and first overflow coordinates.

PDFs are transient CI material. The permanent authority stores their cryptographic hashes and measured results.

## 6. Render findings

Document classification remains separate from render findings. Render findings include:

```text
OVERFLOW
OVERLAP
BLANK_PAGE
PDF_BOUNDING_BOX_OVERFLOW
PDF_PAGE_COUNT_MISMATCH
QUESTION_CARD_COUNT_MISMATCH
QUESTION_PROMPT_MISSING
CONSOLE_ERROR
PAGE_ERROR
```

A capped or ignored scenario may still have a clean rendered PDF; that does not convert it into an exact-layout PASS.

## 7. G5A-U02 handling

The source-unit release returns a commit-pinned canonical static worksheet rather than a shared dynamic WorksheetDocument. GLM-S03 therefore renders:

```text
docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html
```

The answer section is suppressed for this question-only baseline. Its current fixed question count and missing layout authority remain classified as `IGNORED` for every requested layout.

## 8. Evidence

Each shard uploads:

```text
docs/curriculum/output/glm-s03-270-html-pdf-baseline/shard-N/manifest.json
failure screenshots, when present
```

The aggregate job validates exact scenario membership and writes:

```text
docs/curriculum/output/glm-s03-270-html-pdf-baseline/current.json
```

The aggregate authority includes:

- all 270 scenarios;
- document-classification totals;
- render-finding totals;
- per-unit summaries;
- renderer profiles;
- exact non-PASS layouts;
- HTML/PDF hashes and measurements.

## 9. S02 worst-case authority

The S02 authority determines interpretation and S04 priorities. The 270 source-unit baseline is not allowed to substitute short questions for known high-risk shapes.

Particular attention is required for:

- G4B-U04 inverse possible values, burden 414;
- G5A-U08 long word-problem response areas, burden 131;
- 4A-U02 digit-card reasoning, burden 111;
- 4A-U01 place-value decomposition and cap boundaries, burden 95;
- G5A-U02 compact, reasoning and contextual static profile classes.

Existing focused production gates remain valid evidence for those canonical routes, while GLM-S03 establishes the global source-unit baseline needed before architecture design.

## 10. Acceptance

GLM-S03 PASS means the baseline is complete and reproducible, not that all 270 scenarios pass.

```text
5 / 5 shard manifests
270 / 270 unique scenario IDs
15 / 15 units
18 / 18 layouts per unit
all generated scenarios receive HTML and PDF measurements
all blocked scenarios retain issue evidence
no unclassified scenario
aggregate next task = GLM-S04_GlobalLayoutArchitectureDesign
```

## 11. Scope boundary

GLM-S03 changes no:

- layout resolver or profile caps;
- pagination semantics;
- public controls or query state;
- source-unit routing;
- generator or validator behavior;
- curriculum authority.

FullFix remains GLM-S05, after S04 locks the architecture from measured evidence.

## 12. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_RENDERER_AND_WORST_CASE_AUTHORITY_CAPTURED_PENDING_HTML_PDF_BASELINE
GOAL_DISTANCE_AFTER  = D1_GLOBAL_270_HTML_PDF_BASELINE_CAPTURED_PENDING_ARCHITECTURE
DISTANCE_REDUCED     = all public unit/layout combinations made measurable at DOM and PDF layers
REMAINING_BLOCKERS   = CI evidence, S04 architecture, S05 FullFix, S06-S08 acceptance
NEXT_SHORT_STEP      = GLM-S04_GlobalLayoutArchitectureDesign
STOP_REASON          = NONE
```
