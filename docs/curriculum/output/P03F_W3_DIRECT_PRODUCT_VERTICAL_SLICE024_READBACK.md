# P03F W3 Direct Product Vertical Slice024 — D0 Closeout Candidate Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice024Implementation
SLICE      = 024
SOURCE_REF = g3b_u07_3b07
STATUS     = READY_FOR_D0_CLOSEOUT_CI
```

## Frozen authority

Slice024 consumes queue position 24 (`p03e_q024_r8_g3b_u07_3b07_profile_fraction_c1`) and expands the existing public source `g3b_u07_3b07` with its final four hidden fraction-context KnowledgePoints. The source moves from `4 visible / 4 hidden` to `8 visible / 0 hidden`; public source count remains 29 and current public KnowledgePoint count becomes 211.

The slice reuses 20 existing W02 PatternSpecs: 10 numeric and 10 application across eight PatternGroups. Application rows retain the existing W02 A06 binding/proof/fixture lineage. No new Global Context ontology, parallel runtime pipeline, or new public source is created.

## Implementation and current-public reconciliation

```text
IMPLEMENTATION_PR          = #549
FINAL_IMPLEMENTATION_HEAD  = 091e4241c626379b35f57fc681b842985a0d7218
IMPLEMENTATION_MERGE_SHA   = 40fcb6859190abcd4c5cf5268297842e9ceac89b
FINAL_NODE_RUN             = 30976548085
FINAL_NODE_JOB             = 92211657710
FULL_REGRESSION            = 2934 / 2934 PASS
PGC_R02_RUN                = 30976548023 PASS
PGC_R06_RUN                = 30976548067 PASS
PUBLIC_SOURCE_COUNT        = 29
PUBLIC_KP_COUNT            = 211
G3B_U07_VISIBLE            = 8
G3B_U07_HIDDEN             = 0
```

The original six full-regression failures were closed by restoring existing PGC-R02 logic, limiting the selector change to the p03f24 successor, updating current-only expectations, rematerializing current artifacts, and preserving R06 A03/A07 overlays by binding identity. New Slice024 bindings do not inherit stale legacy capacity evidence.

## Chromium product acceptance and semantic QA

```text
ACCEPTANCE_RUN             = 30976345833
ARTIFACT_ID                = 8918396713
ARTIFACT_DIGEST            = sha256:47e2fdf8821c10e08cff2e5abd0c4a6f8ffe08eb3a6474b54b59a71a5da980b9
ACCEPTED_RUNTIME_BLOB      = ddbc771d7f4c4d6386986971f14f530c7d1ab106
CASE_COUNT                 = 2
QUESTION_COUNT             = 40
ANSWER_KEY_COUNT           = 40
PATTERN_SPEC_COVERAGE      = 20 / 20 (2 witnesses each)
PDF_PAGE_COUNT             = 11
SCREENSHOT_COUNT           = 11
DUPLICATE_PROMPTS          = 0
OVERFLOW_FINDINGS          = 0
CONSOLE_ERRORS             = 0
PAGE_ERRORS                = 0
SEMANTIC_SCOPE_FINDINGS    = 0
VISUAL_REVIEW              = 11 / 11 PASS
SEMANTIC_REVIEW            = PASS
ANSWER_KEY_REVIEW          = PASS
```

Product acceptance identified and repaired two real defects before closeout: deterministic prompt collisions in fraction-plus-count witnesses, and discrete-item/wording semantics. The final runtime performs deterministic per-PatternSpec collision resampling; box capacities are divisible by the admitted half/quarter fractions so `顆` counts remain integral; the ambiguous single-work-item wording was replaced by an explicit batch-of-work quantity phrasing. Permanent regression assertions protect all three conditions.

Artifact hashes:

```text
NUMERIC_HTML_SHA256      = 46fa0e9c17735662b06d3ed554a8f67c523210ae2ab004e9ac6ab3d37cd1c676
NUMERIC_PDF_SHA256       = 8c483cbf86dc58ff8b7a77094e90813ddfbb5cb26d3dcb54d1bf38ea4020c336
APPLICATION_HTML_SHA256  = 2ac1253de2f20fe55a5c70d2de3a0f251ec8a81306e4e9b27254d167a7ba7a9c
APPLICATION_PDF_SHA256   = 5668697190be9f97b3ac97410070a315ff23c7ae6b5bc0e128dd353b87922a97
```

## Closeout candidate boundary

The implementation is merged and product acceptance is complete. This closeout branch does not start Slice025. It only binds the already accepted implementation evidence into the formal D0 claim/manifest and requires one closeout Node CI gate before admission can become `PRODUCTION_ADMITTED_D0`.

```text
GOAL_DISTANCE_BEFORE = D1_SLICE024_IMPLEMENTATION_MERGED_PRODUCT_ACCEPTED
GOAL_DISTANCE_AFTER  = D1_SLICE024_D0_CLOSEOUT_CANDIDATE
DISTANCE_REDUCED     = Implementation, 211-KP current-public reconciliation, 20/20 PatternSpec coverage, exact Chromium evidence and manual semantic/visual review are bound into one closeout candidate.
REMAINING_BLOCKERS   = [SLICE024_CLOSEOUT_NODE_CI]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice024D0Closeout
```
