# GLM-S02 — Unit Renderer Profile and Worst-Case Question Audit

```text
TASK = GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
STATUS = IMPLEMENTED_PENDING_CI_EVIDENCE
DEPENDS_ON = GLM-S01_Current15UnitLayoutBehaviorAudit
PUBLIC_UNIT_COUNT = 15
AUDIT_SCOPE = SOURCE_UNIT_AND_PUBLIC_CANONICAL_PATTERN_GROUP_ROUTES
NEXT = GLM-S03_270ScenarioHTMLPDFBaseline
```

## 1. Goal

GLM-S02 identifies the actual question shapes and renderer constraints that the global 18-layout implementation must support. It is an audit milestone, not a repair milestone.

The audit must cover all 15 public units. The four S01 gap units receive explicit diagnosis, but the other eleven units are not assumed safe at DOM/PDF level merely because their worksheet-document layout readback was exact.

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

## 3. Captured renderer evidence

For every successful route, GLM-S02 records:

- renderer profile ID;
- question-sheet profile dimensions;
- answer-key profile dimensions;
- applied `printOptions`;
- layout-resolution metadata when present;
- requested and generated question count;
- question and answer page counts;
- route and validation issue codes.

Missing renderer or print-layout readback remains evidence and is not normalized away.

## 4. Worst-case question evidence

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

Text lengths are counted by Unicode code point. The audit calculates:

```text
promptLength
responsePromptLength
answerLength
burdenScore = promptLength + responsePromptLength + answerLength
```

For each unit it retains:

- the highest-burden representative for every distinct question-shape family;
- five longest prompts;
- five longest response prompts;
- five longest answers;
- ten highest combined burdens.

These records become the deterministic worst-case sample authority for GLM-S03 HTML/PDF testing.

## 5. Separation of defect classes

GLM-S02 must not merge unrelated defects.

### Renderer/layout defects

Examples include:

- 4A-U01 profile row cap at four rows;
- 4A-U02 profile row cap at five rows;
- missing renderer-profile or print-layout readback;
- multiple renderer profiles requiring shape-specific HTML/PDF scenarios.

### Generation/route defects

Examples include:

- 4A-U01 first-difference validation failures;
- G4B-U04 `sourceUnit` route blocked while promoted canonical PatternGroup routes remain available;
- G5A-U02 static source candidate ignoring requested question count and layout.

A generation error may block a scenario, but it is not evidence that a requested layout itself is unsafe.

## 6. Diagnosis vocabulary

The audit derives bounded diagnosis hints, including:

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
```

These are audit findings. Runtime behavior is unchanged.

## 7. Evidence

The workflow writes and uploads:

```text
docs/curriculum/output/glm-s02-unit-renderer-worst-case-audit/current.json
```

The manifest includes:

- all 15 unit summaries;
- all attempted route summaries;
- route success/failure and exact-question-count evidence;
- renderer profiles and print options;
- worst-case samples and shape families;
- carried-forward S01 gap evidence;
- the next required task.

## 8. Acceptance

GLM-S02 PASS means the audit is complete and trustworthy, not that the global layout feature is repaired.

```text
15 / 15 units audited
at least three route attempts per unit
at least one successful route and one question sample per unit
all S01 gap units carried forward
worst-case samples present for every unit
renderer and answer-key evidence retained
next task = GLM-S03_270ScenarioHTMLPDFBaseline
```

## 9. Scope boundary

GLM-S02 changes no:

- layout resolver;
- renderer profile;
- pagination behavior;
- browser control or query state;
- generator formula or validator semantics;
- curriculum authority.

FullFix remains reserved for GLM-S05 after S03 and S04.

## 10. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_DOCUMENT_LAYOUT_BASELINE_CAPTURED_PENDING_RENDERER_AND_PDF_AUDIT
GOAL_DISTANCE_AFTER  = D1_GLOBAL_RENDERER_AND_WORST_CASE_AUTHORITY_CAPTURED_PENDING_HTML_PDF_BASELINE
DISTANCE_REDUCED     = all public routes, renderer profiles and worst-case question shapes made measurable
REMAINING_BLOCKERS   = CI evidence, S03 HTML/PDF baseline, S04 architecture, S05-S08
NEXT_SHORT_STEP      = GLM-S03_270ScenarioHTMLPDFBaseline
STOP_REASON          = NONE
```
