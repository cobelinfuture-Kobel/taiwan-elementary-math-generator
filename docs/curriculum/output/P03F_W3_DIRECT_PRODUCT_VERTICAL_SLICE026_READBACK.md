# P03F W3 Direct Product Vertical Slice026 — Final D0 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice026Implementation
SLICE      = 026
SOURCE_REF = g4a_u09_4a09
STATUS     = PASS_D0_CLOSED
```

## Frozen authority

Slice026 consumes queue position 26 (`p03e_q026_r8_g4a_u09_4a09_profile_decimal_c1`) and expands the existing public source `g4a_u09_4a09` with four rank-8 decimal KnowledgePoints:

1. `kp_g4a_u09_decimal_compare`
2. `kp_g4a_u09_decimal_sequence`
3. `kp_g4a_u09_missing_digit_column_operation`
4. `kp_g4a_u09_place_value_factor_relation`

The current public projection is `6 visible / 2 hidden` for G4A-U09. Public source count remains 29 and current public KnowledgePoint count is 216.

The admitted product contract is numeric-only: four numeric PatternGroups and five deterministic numeric PatternSpecs. Required shared capabilities are `cap_decimal_arithmetic`, `cap_decimal_domain_validator`, and `cap_decimal_number_system`; decimal arithmetic is required only for missing-column-digit reasoning. The existing decimal-comparison application PatternSpec remains hidden and is not production-admitted by Slice026.

## Implementation and current-public reconciliation

```text
IMPLEMENTATION_PR          = #555
FINAL_IMPLEMENTATION_HEAD  = 0bad04ab589055557fbc3a50d3ca490b09bedf8d
IMPLEMENTATION_MERGE_SHA   = 188b119aad4c66b8b26010d341407483fddf4a79
FINAL_NODE_RUN             = 31146839536
FINAL_NODE_JOB             = 92767885624
FULL_REGRESSION            = 2953 / 2953 PASS
NODE_DIAGNOSTICS           = 8981834173
NODE_DIAGNOSTICS_DIGEST    = sha256:67ccff1a663670dd0ada8d5950df8a9e0624f6819c17af12c493cf4a8e930a4f
PGC_R02_RUN                = 31146839944 PASS
PGC_R06_RUN                = 31146839798 PASS
PUBLIC_SOURCE_COUNT        = 29
PUBLIC_KP_COUNT            = 216
G4A_U09_VISIBLE            = 6
G4A_U09_HIDDEN             = 2
R02_GAPS                   = 0
R06_A07_TERMINAL_LINEAGE   = PRESERVED
```

The implementation repair did not rerun or rewrite R06 runtime authority. It corrected the shared R02 materializer so current 216-KP rematerialization preserves the already-verified R06 A07 terminal D0 lineage. Historical Slice025 identity remains fixed while current Pixel/current public expectations advance to 216 KPs.

## PGC-R00 / R09 exact-route acceptance

The first PGC-R00 attempt reached a deployed GitHub Pages HTTP 503 during R09 A03 public-site smoke. No Slice026 assertion failed. A zero-code-change rerun passed the deployed-site smoke and all subsequent exact-route gates.

```text
PGC_R00_RUN                   = 31146840420 PASS
FINAL_793_ARTIFACT            = 8983138301
FINAL_793_ARTIFACT_DIGEST     = sha256:649786f057807c87c921391ed4d06a0d12b26ae0fb98f28bd41d313ee92fcc96
LEGAL_ROUTES                  = 793
EXECUTED_ROUTES               = 793
PASS_ROUTES                   = 793
FAIL_ROUTES                   = 0
FULL_NINE_GATE_PASS           = 793
BROWSER_CONSOLE_ERRORS        = 0
BROWSER_PAGE_ERRORS           = 0
PRODUCT_CODE_CHANGE_REQUIRED  = false
```

## Slice026 Chromium product acceptance

A temporary PR-only exact-head workflow was used solely to produce missing Slice026-specific product evidence. Its first attempt failed before product execution because the harness had not installed the `playwright` package. The harness was aligned to the existing P03F25 dependency-install contract; the second attempt executed the unchanged Slice026 product runner and passed. The temporary workflow was then removed and is absent from the final closeout diff.

```text
ACCEPTANCE_RUN                 = 31151104775
ACCEPTANCE_JOB                 = 92780737546
ACCEPTANCE_EVIDENCE_HEAD       = ba1c88e38a73782c670a2cc98658dde316a7ffb3
ARTIFACT_ID                    = 8983322713
ARTIFACT_DIGEST                = sha256:22f2e31d285e62171f1087a4864f0fc8792e6dd8e433f3af306d93e2dec9158a
ACCEPTED_RUNTIME_BLOB          = 699b90ef1868c7cfbd5ca28d2600d07e19958b77
MAIN_RUNTIME_BLOB              = 699b90ef1868c7cfbd5ca28d2600d07e19958b77
CASE_COUNT                     = 1
QUESTION_COUNT                 = 25
ANSWER_KEY_COUNT               = 25
PATTERN_SPEC_COVERAGE          = 5 / 5 (5 witnesses each)
TRAILING_ZERO_EQUALITY_WITNESS = 1
MISSING_DIGIT_ADD_WITNESSES    = 3
MISSING_DIGIT_SUB_WITNESSES    = 2
PDF_PAGE_COUNT                 = 7
SCREENSHOT_COUNT               = 7
DUPLICATE_PROMPTS              = 0
OVERFLOW_FINDINGS              = 0
CONSOLE_ERRORS                 = 0
PAGE_ERRORS                    = 0
SEMANTIC_SCOPE_FINDINGS        = 0
VISUAL_REVIEW                  = 7 / 7 PASS
ANSWER_KEY_REVIEW              = PASS
CLIPPED_TEXT_FINDINGS          = 0
OVERLAP_FINDINGS               = 0
BROKEN_GLYPH_FINDINGS          = 0
HTML_SHA256                    = c791035ea8cde1427006c14434bda03eac5034da1e2e4b0850fe91c22a7be194
PDF_SHA256                     = b41735684dc0400334ebffa060b34a2cb1b03d08bf94647777bf62a37c398282
```

The fourth question page contains only question 25 because 25 questions are paginated at eight question cells per page; the empty cells are expected pagination, not overflow or clipping.

## Formal closeout evidence

The closeout contains exactly four files: final milestone claim, product-admission manifest, readback, and closeout contract test. It does not modify runtime, selector, PatternSpec, validator, worksheet, renderer, workflow, or current public-generation authority.

```text
CLOSEOUT_PR                   = #558
CLOSEOUT_CANDIDATE_HEAD       = c6114b48824c2396390c37c4c685f9ebfb1bd773
CLOSEOUT_NODE_RUN             = 31151529863
CLOSEOUT_NODE_JOB             = 92782056090
CLOSEOUT_REGRESSION           = 2954 / 2954 PASS
CLOSEOUT_DIAGNOSTICS          = 8983531632
CLOSEOUT_DIAGNOSTICS_DIGEST   = sha256:d7765de502c209471ed7e51d3bf997e4c9764d965b9e36f84c8e0db47f7f2483
CLOSEOUT_MERGE_SHA            = f2cdbedfd57acd9fde8aa4b6d03c73750cb03cc5
```

## Boundary and final state

Slice026 expands an existing public source. It does not add a public source, admit the hidden application PatternSpec, expand Global Context, create a parallel runtime pipeline, or change shared worksheet/renderer behavior. Slice027 remains unstarted in this closeout.

```text
GOAL_DISTANCE_BEFORE = D1_SLICE026_D0_CLOSEOUT_CANDIDATE
GOAL_DISTANCE_AFTER  = D0_SLICE026_PRODUCT_CLOSED
DISTANCE_REDUCED     = closeout Node CI, 793/793 exact browser evidence, current 216-KP R02 authority with preserved R06 A07 terminal lineage, accepted Chromium/visual evidence, and actual closeout merge SHA are bound into the formal Slice026 D0 authority.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice027Implementation
```
