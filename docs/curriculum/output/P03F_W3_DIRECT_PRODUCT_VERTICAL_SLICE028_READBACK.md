# P03F W3 Direct Product Vertical Slice028 — Final D0 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice028Implementation
SLICE      = 028
SOURCE_REF = g5a_u01_5a01
STATUS     = PASS_D0_CLOSED
```

## Frozen authority

Slice028 consumes queue position 28 (`p03e_q028_r8_g5a_u01_5a01_profile_decimal_c1`) and expands the existing public source `g5a_u01_5a01` with one rank-8 KnowledgePoint:

- `kp_g5a_u01_decimal_compose_decompose`

The current public projection is `2 visible / 6 hidden` for G5A-U01. Public source count remains 29 and current public KnowledgePoint count is 219.

The admitted product contract is numeric-only: one new numeric PatternGroup and one deterministic numeric PatternSpec. Required shared capabilities are `cap_decimal_domain_validator` and `cap_decimal_number_system`. Application is `APPLICATION_NOT_APPLICABLE`; Slice028 does not expand Global Context, decimal arithmetic, comparison, or rounding.

## Implementation and current-public reconciliation

```text
IMPLEMENTATION_PR          = #564
FINAL_IMPLEMENTATION_HEAD  = d6edf1c17c10b522b1e77e1e5a00b46de3f25d06
IMPLEMENTATION_MERGE_SHA   = fa1cc0adcc7bf5f4891249ccf623d9e5e99e93dd
FINAL_NODE_RUN             = 31235704359
FINAL_NODE_JOB             = 93047680291
FULL_REGRESSION            = 2983 / 2983 PASS
NODE_DIAGNOSTICS           = 9015345888
NODE_DIAGNOSTICS_DIGEST    = sha256:985e52a3c25bbb99e25f6c490340d25e6e0e03e3b125a6dcb2bbf5a9bca08d40
PGC_R02_RUN                = 31235704339 PASS
PGC_R06_REASONING_RUN      = 31235704345 PASS
PGC_R06_A01_HISTORICAL     = 31235704334 PASS
PGC_R06_A03_RUN            = 31235704325 PASS
PUBLIC_SOURCE_COUNT        = 29
PUBLIC_KP_COUNT            = 219
G5A_U01_VISIBLE            = 2
G5A_U01_HIDDEN             = 6
R02_GAPS                   = 0
R06_HISTORICAL_LINEAGE     = PRESERVED
```

The intended current-side monotonic expansion from 218 to 219 KPs was reconciled by deterministic R02 materialization. Historical Slice identities remain fixed; no application or context authority was promoted.

## PGC-R00 / R09 exact-route acceptance

```text
PGC_R00_RUN                   = 31235704342 PASS
FINAL_793_ARTIFACT            = 9015524580
FINAL_793_ARTIFACT_DIGEST     = sha256:2681eaf8d2092eb413aeef70e8ab62b9810fcee95a9663a0f06673ce00e03698
LEGAL_ROUTES                  = 793
EXECUTED_ROUTES               = 793
PASS_ROUTES                   = 793
FAIL_ROUTES                   = 0
FULL_NINE_GATE_PASS           = 793
BROWSER_CONSOLE_ERRORS        = 0
BROWSER_PAGE_ERRORS           = 0
```

## Slice028 Chromium product acceptance

The final implementation head itself produced the Slice028 product artifact in Node Test. The artifact mixes the existing G5A-U01 read/place PatternSpec and the new compose/decompose PatternSpec so the current two-KP public surface is verified end-to-end.

```text
ACCEPTANCE_RUN                    = 31235704359
ACCEPTANCE_JOB                    = 93047680291
ACCEPTANCE_EVIDENCE_HEAD          = d6edf1c17c10b522b1e77e1e5a00b46de3f25d06
ARTIFACT_ID                       = 9015346361
ARTIFACT_DIGEST                   = sha256:8a2b72de43ef6cc712abe9ed2c1402df5b6be5e914e24da27fabac67f8c67ede
ACCEPTED_RUNTIME_BLOB             = 6648b583e9d25e01dff6e6dc06d3d0474cffaf97
MAIN_RUNTIME_BLOB                 = 6648b583e9d25e01dff6e6dc06d3d0474cffaf97
CASE_COUNT                        = 1
QUESTION_COUNT                    = 24
ANSWER_KEY_COUNT                  = 24
PATTERN_SPEC_COVERAGE             = 2 / 2 (12 witnesses each)
NEW_PATTERN_SPEC_WITNESSES        = 12
INTERNAL_ZERO_WITNESSES           = 2
TRAILING_ZERO_WITNESSES           = 4
CROSS_LAYER_MISMATCH              = 0
PDF_PAGE_COUNT                    = 6
SCREENSHOT_COUNT                  = 6
DUPLICATE_PROMPTS                 = 0
OVERFLOW_FINDINGS                 = 0
CONSOLE_ERRORS                    = 0
PAGE_ERRORS                       = 0
SEMANTIC_SCOPE_FINDINGS           = 0
APPLICATION_LEAK_FINDINGS         = 0
HIDDEN_LINEAGE_PRESERVED          = true
SHARED_PAGINATION                 = true
SHARED_RENDERER                   = true
PARALLEL_PIPELINE                 = false
VISUAL_REVIEW                     = 6 / 6 PASS
ANSWER_KEY_REVIEW                 = PASS
CLIPPED_TEXT_FINDINGS             = 0
OVERLAP_FINDINGS                  = 0
BROKEN_GLYPH_FINDINGS             = 0
HTML_SHA256                       = 764ebf3ab0fceb840c1c9ede752dd0e490991ea17c3f523f6451efa4a2857d93
PDF_SHA256                        = de17e226d0c16756c12bd57c5e87654367c638f92da9e56a2b4c5b371271a380
```

All six screenshots were manually read back: three worksheet pages and three answer-key pages. No clipping, overlap, broken glyph, or pagination overflow was found.

## Formal closeout evidence

The closeout contains exactly four files: final milestone claim, product-admission manifest, readback, and closeout contract test. It does not modify runtime, selector, PatternSpec, validator, worksheet, renderer, workflow, or current public-generation authority.

```text
CLOSEOUT_PR                   = #567
CLOSEOUT_CANDIDATE_HEAD       = f8f205c5c35738c1de036c8f4f4d26ab864cb4e9
CLOSEOUT_NODE_RUN             = 31240734854
CLOSEOUT_NODE_JOB             = 93061135378
CLOSEOUT_REGRESSION           = 2984 / 2984 PASS
CLOSEOUT_DIAGNOSTICS          = 9016956546
CLOSEOUT_DIAGNOSTICS_DIGEST   = sha256:369498a475286e7474da658c4153bf3ec27190b1bc52aed9d841f4d46eaf21b4
CLOSEOUT_MERGE_SHA            = 9677c0e9c77bab40457557f3610f96a81503d7d5
```

## Boundary and final state

Slice028 expands an existing public source by one numeric KnowledgePoint. Application remains not applicable, no Global Context is added, and no parallel runtime pipeline or shared renderer behavior is introduced. Slice029 remains unstarted and is outside the currently approved scope.

```text
GOAL_DISTANCE_BEFORE = D1_SLICE028_D0_CLOSEOUT_CANDIDATE
GOAL_DISTANCE_AFTER  = D0_SLICE028_FINAL_PRODUCTION_ADMISSION_CLOSED
DISTANCE_REDUCED     = closeout 2984/2984 Node CI, current 219-KP R02 authority with preserved R06 lineage, 793/793 global replay, exact-head Chromium/visual evidence, and the actual closeout merge SHA are bound into the final Slice028 D0 authority.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice029Implementation
```
