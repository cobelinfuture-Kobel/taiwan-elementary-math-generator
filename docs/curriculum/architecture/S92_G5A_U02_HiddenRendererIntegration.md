# S92 — G5A-U02 Hidden Renderer Integration

```text
TASK = S92_G5A_U02_HiddenRendererIntegration
STATUS = IMPLEMENTED_PENDING_CI
UNIT = G5A-U02 因數與公因數
```

## 1. Scope

S92 connects the closed S91 hidden WorksheetDocument contract to a dedicated Traditional Chinese A4 HTML renderer.

```text
S90 canonical resolver
→ S91 exact-count hidden WorksheetDocument
→ S92 hidden renderer overlay
→ deterministic HTML string
```

S92 does not expose the unit through the public selector, does not modify the browser pipeline, does not run Chromium HTML/PDF smoke and does not permit production use.

## 2. Non-mutation rule

The S91 document remains authoritative and unchanged:

```text
S91 input lifecycle.rendererStatus = not_connected
```

The S92 renderer produces a separate output object:

```text
S92 output lifecycle.rendererStatus = hidden_html_integrated
```

This preserves the already-closed S91 contract while proving that it can be rendered.

## 3. Renderer API

```text
renderG5AU02HiddenWorksheetDocument(document, options)
buildAndRenderG5AU02HiddenWorksheet(input, options)
validateG5AU02HiddenRenderedWorksheet(rendered, document)
auditG5AU02HiddenRendererIntegration()
getG5AU02HiddenRendererProfiles()
```

Invalid or blocking source documents return:

```text
ok = false
renderedWorksheet = null
```

No partial HTML package is accepted.

## 4. Coverage

```text
PatternSpecs        = 22
Class C             = 14
Class D             = 8
Answer model shapes = 16
Renderer profiles   = 3
```

All S91 answer shapes use the canonical `answerText` record. The renderer only selects the Traditional Chinese label appropriate to each answer model.

## 5. Renderer profiles

### Compact

```text
profileId       = compact
questionColumns = 2
answerColumns   = 2
modes           = concept, numeric, representation
```

### Contextual

```text
profileId       = contextual
questionColumns = 2
answerColumns   = 1
modes           = application, geometry_application
```

### Reasoning

```text
profileId       = reasoning
questionColumns = 1
answerColumns   = 1
modes           = reasoning, reasoning_application
```

A page containing reasoning content selects the reasoning profile. Otherwise, contextual content takes precedence over compact content.

## 6. HTML contract

The rendered output requires:

- HTML5 doctype;
- `lang="zh-Hant"`;
- UTF-8 metadata;
- A4 `@page` print rule;
- deterministic question and answer page order;
- exact page counts matching S91 pagination;
- Traditional Chinese headings, student fields and response labels;
- optional answer-key section;
- answer section suppression when disabled;
- HTML escaping for title, subtitle, stylesheet URL, prompts and answers.

## 7. Information boundary

Visible HTML must not contain internal curriculum identifiers:

```text
PatternSpec IDs
FormalMapping IDs
FormalMapping candidate IDs
PatternGroup IDs
KnowledgePoint IDs
source packet IDs
```

Question pages never render answer records. Answer pages join by `questionNumber` and use the corresponding visible prompt only.

## 8. Security and validation

The renderer blocks or detects:

- malformed S91 documents;
- page-count mismatch;
- answer-page suppression failure;
- missing HTML or A4 contract;
- unescaped script tags;
- internal-ID leakage;
- unknown renderer profile;
- lifecycle mutation;
- public selector or browser-pipeline scope breach;
- premature HTML/PDF smoke status;
- production promotion.

## 9. Lifecycle boundary

```text
rendererStatus        = hidden_html_integrated
worksheetStatus       = hidden_exact_count_integrated
answerKeyStatus       = hidden_integrated_optional
selectorStatus        = hidden
canonicalRouting      = internal_explicit_only
browserPipelineStatus = not_connected
htmlPdfSmokeStatus    = not_run
productionUse         = forbidden
genericFallback       = forbidden
freeFormAI            = forbidden
```

## 10. Acceptance

Executable QA covers:

1. three renderer profiles;
2. all 16 answer models;
3. exact question and answer page counts;
4. Traditional Chinese A4 HTML;
5. answer-key suppression;
6. question/answer isolation;
7. internal-ID redaction;
8. hostile HTML escaping;
9. malformed source blocking;
10. lifecycle, page-count and profile mutation rejection;
11. deterministic rendering;
12. preservation of the closed S91 document.

## 11. Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G5A_U02_HIDDEN_WORKSHEET_AND_ANSWER_KEY_VERIFIED_AND_CLOSED

GOAL_DISTANCE_AFTER =
D1_G5A_U02_HIDDEN_RENDERER_IMPLEMENTED_PENDING_CI

DISTANCE_REDUCED =
Connected the exact-count S91 WorksheetDocument and all 16 answer-model shapes
to deterministic Traditional Chinese A4 HTML without exposing the unit publicly.

REMAINING_BLOCKERS = [
  "S92 PR CI and fresh-main closeout are pending",
  "Public selector remains hidden",
  "Browser pipeline is not connected",
  "HTML/PDF smoke has not run",
  "Production use remains forbidden"
]

NEXT_SHORTEST_STEP =
S92R1_G5A_U02_HiddenRendererIntegration_CIReadbackAndMerge
```
