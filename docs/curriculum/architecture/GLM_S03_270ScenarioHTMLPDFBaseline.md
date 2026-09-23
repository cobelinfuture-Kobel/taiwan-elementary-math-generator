# GLM-S03 — 270-Scenario HTML/PDF Baseline

```text
TASK = GLM-S03_270ScenarioHTMLPDFBaseline
STATUS = BASELINE_CAPTURED_AND_VALIDATED_PENDING_FINAL_HEAD_CI
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

GLM-S03 does not make the system appear healthier than it is.

- exact layouts remain `PASS` at the document layer;
- lower resolved dimensions remain `SILENTLY_CAPPED`;
- absent or non-authoritative layout handling remains `IGNORED`;
- failed public routes remain `GENERATION_BLOCKED`;
- generated output is rendered even when the document layer was capped or ignored;
- no per-unit patch is applied by the audit.

G4B-U04 source-unit failures remain visible even though its promoted KnowledgePoint route has separate R4 acceptance. G5A-U02 continues to use its fixed canonical static HTML, which is rendered once per unique HTML body and reused across its 18 ignored requests.

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
6. renders every PDF page to an image;
7. checks blank pages and PDF text bounding boxes;
8. writes JSON evidence and failure screenshots;
9. avoids retaining hundreds of PDFs in the repository.

## 4. Accepted workflow evidence

The first complete workflow passed all five shards and the aggregate gate:

```text
head SHA             = e8f0b1e90d24e7fa29b0f005ade8a5ba35cf5ad8
workflow run         = 29478399908
aggregate artifact   = 8367521965
artifact digest      = sha256:34183ff3176657ad681643e8c37397a517dada0f0f382e8b8d85dfe05422573a
full manifest digest = d23c0310edf9781225083eff7ad0c0ed8c480ab5fdbf790be2afbfdf278398a9
```

All shard jobs, aggregation, Node Test, Math CI and existing specialized HTML/PDF regressions passed on the accepted head.

## 5. Document-layer result

The exact GLM-S01 result was reproduced:

| Classification | Scenarios |
|---|---:|
| PASS | 225 |
| SILENTLY_CAPPED | 8 |
| GENERATION_BLOCKED | 19 |
| IGNORED | 18 |
| **Total** | **270** |

This proves the global contract is still incomplete even though current generated output is printable.

## 6. HTML/PDF result

Of the 270 scenarios, 251 generated a current output and all 251 were rendered and inspected.

| Measure | Result |
|---|---:|
| Generated scenarios | 251 |
| Rendered scenarios | 251 |
| Render-clean scenarios | 251 |
| Render-defect scenarios | 0 |
| Unique PDFs | 234 |
| Total PDF bytes | 9,566,220 |
| PDF pages | 1,531 |
| Rendered image pages | 1,531 |
| Nonblank PDF pages | 1,531 |
| Blank PDF pages | 0 |
| PDF bounding-box overflow | 0 |
| DOM question pages | 1,531 |
| DOM question cards | 4,590 |
| DOM overflow | 0 |
| Inter-card overlap | 0 |
| Missing prompts | 0 |
| Console errors | 0 |
| Page errors | 0 |
| DOM/PDF page mismatch | 0 |

The correct conclusion is:

```text
CURRENT_RENDER_SAFETY = PASS_FOR_ALL_GENERATED_BASELINE_OUTPUT
EXACT_LAYOUT_CONTRACT = INCOMPLETE
```

A capped or ignored output being visually clean does not convert it into an accepted exact layout.

## 7. HTML checks

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

The selectors cover the generic worksheet renderer and specialized G4B-U04, G5A-U08 and G5A-U02 surfaces. No failure screenshot was produced because no rendered baseline scenario had a DOM visual defect.

## 8. PDF checks

Every unique rendered HTML body produces an A4 Chromium PDF with CSS page size preferred. The PDF inspector records:

- PDF SHA-256 and byte size;
- PDF page count;
- rendered-image page count;
- nonblank and blank page counts;
- `pdftotext -bbox-layout` page count;
- text bounding-box overflow count and first overflow coordinates.

PDFs are transient CI material. The permanent authority stores cryptographic hashes and aggregate measurements.

## 9. Four gap units

### 4A-U01 — 1億以內的數

```text
PASS               = 12
SILENTLY_CAPPED    = 5
GENERATION_BLOCKED = 1
RENDERED            = 17 / 17 clean
```

Non-PASS layouts:

```text
3×5, 2×5, 2×6, 1×5, 1×6, 1×7
```

S04 must supersede the four-row profile cap for approved requests. The deterministic first-difference generation error must be repaired independently from layout resolution.

### 4A-U02 — 整數的乘法

```text
PASS            = 15
SILENTLY_CAPPED = 3
RENDERED         = 18 / 18 clean
```

Non-PASS layouts:

```text
2×6, 1×6, 1×7
```

S04 must supersede the five-row profile cap while retaining current visual containment.

### 4B-U04 — 概數

```text
GENERATION_BLOCKED = 18
RENDERED            = 0
```

S04 requires a valid sourceUnit-to-canonical selection adapter. It must reuse rather than bypass the already accepted KnowledgePoint-route layout resolver, inverse-long profile and production safety gates.

### 5A-U02 — 因數與公因數

```text
IGNORED  = 18
RENDERED = 18 / 18 clean fixed static output
```

Every request prints the same fixed 22-question, 22-page question section. S04 must make requested count and layout authoritative while retaining the existing compact, reasoning and contextual content safety.

## 10. Exact units

The following eleven units are 18/18 exact at the document layer and 18/18 clean at the HTML/PDF layer:

```text
3A-U01  3A-U02  3A-U03  3A-U06
3B-U01  3B-U04  3B-U08
4A-U04  4A-U08
4B-U01
5A-U08
```

They need regression protection in S05–S08, not unit-specific layout repair.

## 11. G5A-U02 handling

The source-unit release returns a commit-pinned canonical static worksheet rather than a shared dynamic WorksheetDocument. GLM-S03 renders:

```text
docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html
```

The answer section is suppressed for this question-only baseline. The fixed question count and missing layout authority remain classified as `IGNORED` for every requested layout.

## 12. Evidence

Each shard uploads its manifest and any failure screenshots. The aggregate job validates exact scenario membership and writes the expiring full authority:

```text
docs/curriculum/output/glm-s03-270-html-pdf-baseline/current.json
```

The persistent compact authority is:

```text
docs/curriculum/output/GLM_S03_270_HTML_PDF_BASELINE.json
```

It records workflow identity, full-manifest digest, aggregate measurements, exact units, gap units and S04 architecture inputs.

## 13. S02 worst-case authority

The S02 authority determines interpretation and S04 priorities. The 270 source-unit baseline does not replace focused canonical-route production evidence.

Priority shapes remain:

- G4B-U04 inverse possible values, burden 414;
- G5A-U08 long word-problem response areas, burden 131;
- 4A-U02 digit-card reasoning, burden 111;
- 4A-U01 place-value decomposition and cap boundaries, burden 95;
- G5A-U02 compact, reasoning and contextual static profile classes.

The S04 design must preserve focused production acceptance for these shapes while moving layout ownership to a global contract.

## 14. Architecture implications

The measured repair surface is bounded:

1. introduce one global approved-layout authority shared by all public units;
2. keep source-specific renderer profiles for typography and answer-page safety, but prevent them from silently reducing an approved question-page request;
3. add a G4B-U04 source-unit canonical adapter;
4. replace or adapt G5A-U02 fixed static source-unit behavior so count and layout are applied;
5. repair the separate 4A-U01 generation defect;
6. retain zero-overflow, zero-overlap, nonblank PDF and bounding-box gates;
7. leave the eleven exact units semantically unchanged.

## 15. Acceptance

GLM-S03 PASS means the baseline is complete and reproducible, not that all 270 scenarios pass.

```text
5 / 5 shard manifests
270 / 270 unique scenario IDs
15 / 15 units
18 / 18 layouts per unit
251 / 251 generated scenarios rendered and PDF-inspected
1,531 / 1,531 PDF pages nonblank
0 render defects
all blocked scenarios retain issue evidence
aggregate next task = GLM-S04_GlobalLayoutArchitectureDesign
```

## 16. Scope boundary

GLM-S03 changes no layout resolver, renderer profile, pagination semantics, public controls, query state, source-unit routing, generator, validator or curriculum authority.

FullFix remains GLM-S05, after S04 locks the architecture from measured evidence.

## 17. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_RENDERER_AND_WORST_CASE_AUTHORITY_CAPTURED_PENDING_HTML_PDF_BASELINE
GOAL_DISTANCE_AFTER  = D1_GLOBAL_270_HTML_PDF_BASELINE_CAPTURED_PENDING_ARCHITECTURE
DISTANCE_REDUCED     = 270 scenarios classified; 251 outputs and 1,531 PDF pages verified clean
REMAINING_BLOCKERS   = final-head CI, S04 architecture, S05 FullFix, S06-S08 acceptance
NEXT_SHORT_STEP      = GLM-S04_GlobalLayoutArchitectureDesign
STOP_REASON          = NONE
```
