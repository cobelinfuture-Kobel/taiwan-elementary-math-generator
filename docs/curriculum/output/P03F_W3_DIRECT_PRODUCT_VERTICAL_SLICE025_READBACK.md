# P03F W3 Direct Product Vertical Slice025 — D0 Closeout Candidate Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice025Implementation
SLICE      = 025
SOURCE_REF = g4a_u06_4a06
STATUS     = D0_CLOSEOUT_CANDIDATE
```

## Frozen authority

Slice025 consumes queue position 25 (`p03e_q025_r8_g4a_u06_4a06_profile_fraction_c1`) and expands the existing public source `g4a_u06_4a06` with `kp_fraction_improper_mixed_integer_conversion`.

The current public projection moves G4A-U06 from `1 visible / 5 hidden` to `2 visible / 4 hidden`. Public source count remains 29 and current public KnowledgePoint count becomes 212.

The product contract is numeric-only: one PatternGroup and three deterministic PatternSpecs:

1. improper fraction → mixed number or integer
2. mixed number → improper fraction
3. integer → improper fraction with specified denominator

Required capabilities are `cap_fraction_domain_validator` and `cap_fraction_number_system`. Fraction arithmetic, application/Global Context expansion, a parallel runtime pipeline, and Slice026 are outside this closeout.

## Implementation and current-public reconciliation

```text
IMPLEMENTATION_PR          = #552
FINAL_IMPLEMENTATION_HEAD  = a0aec21da893147636d6a92342315972947b4315
IMPLEMENTATION_MERGE_SHA   = 2e51effd085ee5b0237506089f00e7b3871a361e
FINAL_NODE_RUN             = 31014126078
FINAL_NODE_JOB             = 92333608758
FULL_REGRESSION            = 2942 / 2942 PASS
NODE_DIAGNOSTICS           = 8933826437
PGC_R02_RUN                = 31014126040 PASS
PGC_R06_RUN                = 31014127184 PASS
PUBLIC_SOURCE_COUNT        = 29
PUBLIC_KP_COUNT            = 212
G4A_U06_VISIBLE            = 2
G4A_U06_HIDDEN             = 4
```

Two pre-closeout compatibility blockers were resolved on the implementation PR without widening Slice025:

- terminal R06 A00 authority is read-only after R06 A07 D0, so historical materialization cannot strip later terminal metadata;
- the shared public UI capability consumer now joins verified production application aliases to their base selector PatternGroup capacity, closing the six exact-ten-route regenerate-identity residuals without per-unit patches.

## PGC-R00 / R09 A01R classification

The first exact 793-route replay completed `792 / 793` with one G5A-U02 `common_factor_enumeration` mixed route timing out while Playwright was performing the `#regenerate-button` click. The element was visible, enabled, and stable; there were no console or page errors.

Source/readback classification ruled out a deterministic Slice025 or G5A-U02 product defect:

- the same KP has multiple mixed routes that passed;
- the failing and passing variants resolve to the same PatternSpec;
- the common-factor generator is bounded and contains no unbounded retry/search path;
- R09-A01R policy forbids timeout extension, product-runtime modification, capacity mutation, and per-route patching.

A second job attempt did not reach the 793-route replay because the deployed GitHub Pages smoke received HTTP 503. The same head had passed that smoke earlier, and a third zero-code-change attempt passed the deployed-site smoke, exact ten-route replay, exact three-route replay, and the complete exact 793-route final verifier.

```text
PGC_R00_RUN                   = 31014126028 PASS
FINAL_793_ARTIFACT            = 8936342581
FINAL_793_ARTIFACT_DIGEST     = sha256:26c2ab7dcdfa4e0cf4fce00d87aa56fd97edd1c73db4042a8c1e7cfebf33643b
EXECUTED_ROUTES               = 793
PASS_ROUTES                   = 793
FAIL_ROUTES                   = 0
FULL_NINE_GATE_PASS           = 793
BROWSER_CONSOLE_ERRORS        = 0
BROWSER_PAGE_ERRORS           = 0
CLASSIFICATION                = NON_DETERMINISTIC_AGGREGATE_BROWSER_CLICK_DISPATCH_STALL_NOT_PRODUCT_DEFECT
PRODUCT_CODE_CHANGE_REQUIRED  = false
TIMEOUT_EXTENSION_REQUIRED    = false
PER_ROUTE_PATCH_REQUIRED      = false
```

## Chromium product acceptance

```text
ACCEPTANCE_RUN             = 31014127688
ARTIFACT_ID                = 8933725140
ARTIFACT_DIGEST            = sha256:9662f49912c759c538f1f6230203d98466c853dcc4d89bf3ac71a28e0fe7333c
ACCEPTED_RUNTIME_BLOB      = a997ee32665f2edd3081d0390fa6ee50dac28d66
CASE_COUNT                 = 1
QUESTION_COUNT             = 24
ANSWER_KEY_COUNT           = 24
PATTERN_SPEC_COVERAGE      = 3 / 3 (8 witnesses each)
PDF_PAGE_COUNT             = 6
SCREENSHOT_COUNT           = 6
DUPLICATE_PROMPTS          = 0
OVERFLOW_FINDINGS          = 0
CONSOLE_ERRORS             = 0
PAGE_ERRORS                = 0
SEMANTIC_SCOPE_FINDINGS    = 0
VISUAL_REVIEW              = 6 / 6 PASS
ANSWER_KEY_REVIEW          = PASS
HTML_SHA256                = 981e421eeec26bfad1a895152222509207f0fc8650020db367aadd9781179f95
PDF_SHA256                 = f14ebc6b3fafb1b0f80314af9525d120a68ee97bf95be0c3558f5bd9edf55c11
```

The automated artifact status was `PASS_AUTOMATED_PENDING_VISUAL_REVIEW`; all six rendered pages were subsequently reviewed manually and passed with no clipping, overlap, broken glyph, or answer-key readability issue.

## Closeout candidate

This candidate adds only the Slice025 final milestone claim, product-admission manifest, readback, and closeout contract test. It does not change runtime, selector, PatternSpec, validator, worksheet, renderer, workflow, or public-generation authority.

```text
GOAL_DISTANCE_BEFORE = D1_SLICE025_IMPLEMENTATION_MERGED
GOAL_DISTANCE_AFTER  = D1_SLICE025_D0_CLOSEOUT_CANDIDATE
DISTANCE_REDUCED     = Merged implementation, exact 793/793 global browser evidence, and accepted Chromium product evidence are now bound into a formal closeout candidate.
REMAINING_BLOCKERS   = [CLOSEOUT_NODE_CI_AND_MERGE]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice025D0Closeout
```
