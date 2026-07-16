# GLM-S02 — Unit Renderer Profile and Worst-Case Question Audit

```text
TASK = GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
STATUS = AUDIT_CAPTURED_AND_VALIDATED_PENDING_FULL_CI
DEPENDS_ON = GLM-S01_Current15UnitLayoutBehaviorAudit
PUBLIC_UNIT_COUNT = 15
AUDIT_SCOPE = SOURCE_UNIT_AND_PUBLIC_CANONICAL_PATTERN_GROUP_ROUTES
NEXT = GLM-S03_270ScenarioHTMLPDFBaseline
```

## 1. Goal

GLM-S02 identifies the actual question shapes and renderer constraints that the global 18-layout implementation must support. It is an audit milestone, not a repair milestone.

All 15 public units are covered. The four S01 gap units receive explicit diagnosis, but the other eleven units are not assumed safe at DOM/PDF level merely because their worksheet-document layout readback was exact.

## 2. Route coverage

For every unit, the audit attempts:

- three deterministic `sourceUnit` runs requesting 40 questions;
- three deterministic one-question runs for every visible PatternGroup through its public single-KnowledgePoint route;
- three deterministic all-KnowledgePoint/all-PatternGroup mixed runs when at least two visible KnowledgePoints exist.

Every route uses:

```text
question layout = 1 column × 1 row
answer key = enabled
question mode = mixed
reasoning depth = mixed
context mode = mixed
```

The 1×1 layout minimizes layout-cap interference while collecting the complete question, response-prompt and answer shape.

## 3. Accepted audit result

The dedicated workflow passed at head `20203c6df40c3f8b2929d866a468cfa0140eb91d`.

```text
workflow run          = 29477395336
artifact ID           = 8367084346
artifact digest       = sha256:0ec1e23375124149e7334fd02527f616940880c4c676b9c26c52a1be72f58bf9
full manifest SHA-256 = d8d2157ffebfe244e3f6d7717575852d6200820fe2d8566733a36817b0471bca
```

Totals:

| Measure | Result |
|---|---:|
| Public units | 15 |
| Attempted routes | 618 |
| Successful routes | 615 |
| Failed routes | 3 |
| Question samples | 3,340 |
| Units without samples | 0 |

The only failed routes are the three deterministic G4B-U04 `sourceUnit` attempts. Its promoted canonical PatternGroup routes remain available and produced 117 question samples across 11 shape families.

## 4. G5A-U02 static HTML enrichment

The first audit pass correctly recorded G5A-U02's route limitations but could not recover question text from the static release document object because that object contains a commit-pinned `staticHtmlUrl` rather than shared `questionDisplayModels`.

The accepted audit therefore performs a second, non-mutating enrichment over the committed canonical artifact:

```text
docs/curriculum/output/smoke/S93_G5A_U02_HiddenWorksheet.html
```

It recovered:

- 22 canonical prompts;
- their response prompts and answers;
- compact, reasoning and contextual profile classes;
- eight distinct static question-shape families.

This does not hide the product limitation: the static source route still ignores requested question count and layout, lacks print-layout readback and does not offer arbitrary browser regeneration.

## 5. Captured renderer evidence

For every successful route, GLM-S02 records:

- renderer profile ID when exposed;
- question-sheet profile dimensions;
- answer-key profile dimensions;
- applied `printOptions`;
- layout-resolution metadata when present;
- requested and generated question count;
- question and answer page counts;
- route and validation issue codes.

Missing renderer or print-layout readback remains evidence and is not normalized away. Several legacy source routes expose exact pagination but no renderer-profile authority; S03 must test their actual HTML/PDF output rather than infer safety from missing metadata.

## 6. Worst-case question evidence

Every generated question is projected into:

```text
prompt text
response prompt
answer text
render kind
answer model shape
mode
application flag
KnowledgePoint / PatternGroup / PatternSpec IDs
```

Text lengths are counted by Unicode code point:

```text
burdenScore = promptLength + responsePromptLength + answerLength
```

For each unit, the audit retains the highest-burden representative for every distinct shape family plus ranked prompt, response and answer extremes.

### Highest global burdens

| Unit | Pattern / shape | Prompt | Response | Answer | Total burden |
|---|---|---:|---:|---:|---:|
| 4B-U04 | inverse possible values | 68 | 66 | 299 | **414** |
| 5A-U08 | long word problem | 56 | 54 | 23 | **131** |
| 4A-U02 | digit-card multiplication reasoning | 72 | 0 | 39 | **111** |
| 4A-U08 | word problem | 65 | 54 | 8 | **100** |
| 5A-U02 | static contextual application | 51 | 33 | 69 | **100** |
| 4A-U01 | place-value decomposition | 63 | 0 | 34 | **95** |

The G4B-U04 inverse-possible-values answer is the global maximum and must be tested independently from its shorter compact and contextual profiles.

## 7. Unit/profile findings

### Multiple shape/profile families requiring separate S03 scenarios

```text
3B-U04
3B-U08
4A-U08
4B-U01
4B-U04
5A-U02
5A-U08
```

### S01 caps carried forward

```text
4A-U01: approved row requests above 4 are currently capped
4A-U02: approved row requests above 5 are currently capped
```

### Route and generation findings

- G4B-U04: `sourceUnit` remains blocked; canonical PatternGroup routes work.
- G5A-U02: static source route produces the fixed 22-question canonical release and ignores requested count/layout; dynamic selector routes work.
- 4A-U01: the S01 first-difference validation defect remains open even though the S02 seed set did not reproduce it; it must be handled separately from layout caps.

## 8. Diagnosis vocabulary

The audit uses bounded findings:

```text
renderer_or_profile_row_cap_confirmed_by_s01
source_unit_route_gap_with_canonical_route_available
source_unit_question_count_not_honored
renderer_profile_readback_missing
print_layout_readback_missing
generation_validation_defect_separate_from_layout_cap
no_question_shape_sample_available
multiple_renderer_profiles_require_shape_specific_s03_matrix
static_source_candidate_ignores_requested_count_and_layout
static_canonical_html_question_shapes_recovered
```

These are audit findings. Runtime behavior is unchanged.

## 9. Evidence

Full evidence is uploaded from:

```text
docs/curriculum/output/glm-s02-unit-renderer-worst-case-audit/current.json
```

The persistent compact baseline is:

```text
docs/curriculum/output/GLM_S02_UNIT_RENDERER_WORST_CASE_BASELINE.json
```

The evidence includes all unit summaries, all attempted route summaries, renderer/readback metadata, worst-case samples, carried-forward S01 gaps and the next required task.

## 10. S03 priorities

GLM-S03 must use the S02 worst-case authority rather than arbitrary short questions. Priority order:

1. G4B-U04 inverse possible values across the approved matrix;
2. G5A-U08 long word-problem response areas;
3. 4A-U02 digit-card reasoning with long answer;
4. 4A-U01 decomposition plus cap boundaries;
5. G5A-U02 compact/reasoning/contextual static profile classes;
6. every unit whose renderer-profile readback is missing;
7. all remaining unit/layout combinations to complete 270 scenarios.

## 11. Acceptance

GLM-S02 PASS means the audit is complete and trustworthy, not that the global layout feature is repaired.

```text
15 / 15 units audited
618 routes attempted
615 routes successful
3,340 questions sampled
0 units without samples
all S01 gap units carried forward
G5A-U02 static prompts recovered without changing route conclusions
worst-case samples present for every unit
next task = GLM-S03_270ScenarioHTMLPDFBaseline
```

## 12. Scope boundary

GLM-S02 changes no layout resolver, renderer profile, pagination behavior, browser control, query state, generator formula, validator semantics or curriculum authority.

FullFix remains reserved for GLM-S05 after S03 and S04.

## 13. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_DOCUMENT_LAYOUT_BASELINE_CAPTURED_PENDING_RENDERER_AND_PDF_AUDIT
GOAL_DISTANCE_AFTER  = D1_GLOBAL_RENDERER_AND_WORST_CASE_AUTHORITY_CAPTURED_PENDING_HTML_PDF_BASELINE
DISTANCE_REDUCED     = 618 public routes and 3,340 question samples made measurable across all 15 units
REMAINING_BLOCKERS   = final-head CI, S03 HTML/PDF baseline, S04 architecture, S05-S08
NEXT_SHORT_STEP      = GLM-S03_270ScenarioHTMLPDFBaseline
STOP_REASON          = NONE
```
