# P03F W3 Direct Product Vertical Slice018 — Final D0 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice018Implementation
SLICE      = 018
SOURCE_REF = g4a_u09_4a09
STATUS     = PASS_D0_CLOSEOUT_CANDIDATE
```

## Authority and product scope

Slice018 consumes queue position 18 (`p03e_q018_r7_g4a_u09_4a09_profile_decimal_c1`) and admits exactly one KnowledgePoint: `kp_g4a_u09_decimal_compose_decompose`. The product path contains one PatternGroup and one numeric PatternSpec: `ps_g4a_u09_decimal_compose_decompose_decimal_numeric`. It consumes only the shared decimal number-system and decimal domain-validator capabilities. Decimal compare, sequence, missing-digit reasoning, arithmetic, application expansion, Global Context expansion, renderer redesign, parallel pipelines, and Slice019 remain outside this milestone.

G4A-U09 was already a public source before Slice018, so this milestone adds no new public source. The accepted current surface now exposes both the historical Slice010 hundredth-representation KnowledgePoint and the new Slice018 compose/decompose KnowledgePoint without invalidating the historical selector contract.

## Core implementation evidence

```text
CORE_IMPLEMENTATION_PR        = #522
CORE_FINAL_HEAD               = 6f23ff4310b5ffe17df8560d0397f8c4372d3201
CORE_MERGE_SHA                = 34282b6282365b1f8b5b4bb8d8e2088523bbdce3
CORE_NODE_RUN                 = 30790392563
CORE_NODE_JOB                 = 91612479885
CORE_NODE_CONCLUSION          = success
```

The exact core head passed Node Test together with PGC-R04 and the active GLM layout/PDF gates. It froze the exact queue/source/hidden-PatternSpec authority, deterministic 18-witness two-decimal compose/decompose runtime, fail-closed decimal identity validator, and shared capability bindings.

## Current Classic/shared worksheet cutover evidence

```text
CURRENT_SURFACE_PR            = #523
CURRENT_SURFACE_FINAL_HEAD    = 15da923bee215008e3ec627abba6a2257e5996b7
CURRENT_SURFACE_MERGE_SHA     = b678f5d1fc985d66f291d5e473dac19305824422
CURRENT_SURFACE_NODE_RUN      = 30791255848
CURRENT_SURFACE_NODE_JOB      = 91615071408
CURRENT_SURFACE_NODE_RESULT   = success

GLM_S07_RUN                   = 30791255843
GLM_S07_RECOVERED_SHARD_JOB   = 91618448152
GLM_S07_RECOVERED_SHARD       = success
GLM_S07_AGGREGATE_JOB         = 91618633999
GLM_S07_AGGREGATE             = success
GLM_S07_SCENARIOS             = 90
```

The live Classic selector and shared worksheet entrypoint were advanced to P03F18 while preserving the successor chain. GLM-S07 recovered shard(2) passed and the aggregate validated all 90 answer-key boundary scenarios.

## Chromium E6 acceptance evidence

```text
ACCEPTANCE_PR                 = #524
ACCEPTANCE_EVIDENCE_HEAD      = 48f10912139874e2e1814063d13850cb8cfbdf0b
CHROMIUM_RUN                  = 30793658443
CHROMIUM_JOB                  = 91622334211
ARTIFACT_ID                   = 8848015560
ARTIFACT_DIGEST               = sha256:0d0b33c26615acbe06cc636f23019ab0af9bc9d379a97dadae2bfbe9eae46f21
PDF_PAGE_COUNT                = 4
PDF_BYTE_LENGTH               = 21678
SCREENSHOT_COUNT              = 4
QUESTION_COUNT                = 18
ANSWER_KEY_COUNT              = 18
PATTERN_SPEC_WITNESSES        = 18
HTML_SHA256                   = f2cf43cc0d9c6920e7aa36ea12f115cc147bc0d27e96a19c41370c8892ee1c67
PDF_SHA256                    = f490a7375d09a033ce3ccecc2290fb0466f6b39cc0f579fc9e306ee648edd045
DUPLICATE_PROMPT_FINDINGS     = 0
OVERFLOW_FINDINGS             = 0
CONSOLE_ERRORS                = 0
PAGE_ERRORS                   = 0
SEMANTIC_SCOPE_FINDINGS       = 0
VISUAL_REVIEW                 = PASS
SEMANTIC_REVIEW               = PASS
ANSWER_KEY_REVIEW             = PASS
```

The acceptance artifact contains two worksheet pages and two answer-key pages. All 18 witnesses use the single admitted compose/decompose PatternSpec. Automated acceptance found zero overflow, duplicate-prompt, console, page-error, or semantic-scope findings. Manual review of all four screenshots found no clipping, overlap, broken glyphs, or pagination defects. All 18 answer-key entries match the exact `whole + tenths*0.1 + hundredths*0.01` invariant, including preserved trailing-zero forms such as `6.30`, `8.90`, and `2.50`.

The temporary `.github/workflows/p03f18-product-acceptance.yml` workflow was retired before canonical closeout. Cleanup head `6171f8be0c2677beb4b1c4b06a2abaaea47bf205` passed Node Test run `30793875184`, job `91622995068`, and merged through PR #524 at `cd5d9290366bdad3471aa3d3cd8c3018bb8e4c8d`.

## Pixel parity repair evidence

```text
PIXEL_REPAIR_PR               = #525
PIXEL_REPAIR_FINAL_HEAD       = e1823675162c1a3c62ecea4a8be9432efde7b11f
PIXEL_REPAIR_MERGE_SHA        = 9d10f8bd07c8eddc93806242811d3e1c19c902c8
PIXEL_REPAIR_NODE_RUN         = 30795336068
PIXEL_REPAIR_NODE_JOB         = 91627566495
PIXEL_REPAIR_NODE_RESULT      = success
```

Closeout preflight found that Pixel still consumed the P03F17 selector authority. PR #525 advanced only the Pixel current selector to P03F18 and reconciled the stale P03F10 current-surface expectation into a successor-safe historical invariant. The exact repair head passed the full Node regression. Classic, shared worksheet, and Pixel now consume the same Slice018 authority without changing generator, validator, renderer, or source scope.

## D0 admission contract

```text
KNOWLEDGE_POINT_COUNT             = 1
PATTERN_GROUP_COUNT               = 1
PATTERN_SPEC_COUNT                = 1
NUMERIC_PATTERN_SPEC_COUNT        = 1
APPLICATION_PATTERN_SPEC_COUNT    = 0
GLOBAL_CONTEXT_BINDING_COUNT      = 0
REQUIRED_CAPABILITY_COUNT         = 2
QUESTION_WITNESS_COUNT            = 18
ANSWER_KEY_WITNESS_COUNT          = 18
NEW_PRODUCT_ADMISSION             = 1
NEW_PUBLIC_SOURCE                 = 0
CLASSIC_PUBLIC_SURFACE            = PASS
PIXEL_PUBLIC_SURFACE              = PASS
WORKSHEET_PRINTABLE               = PASS
ANSWER_KEY                        = PASS
CHROMIUM_PDF                      = PASS
ADMISSION_STATE                   = E6_ARTIFACT_ACCEPTED_D0
ADMISSION_DECISION                = ADMITTED_D0
```

## Frozen boundary

```text
SLICE019_STARTED                  = false
NEW_PUBLIC_SOURCE_ADDED           = false
DECIMAL_COMPARE_ADDED             = false
DECIMAL_SEQUENCE_ADDED            = false
MISSING_DIGIT_REASONING_ADDED     = false
DECIMAL_ARITHMETIC_ADDED          = false
APPLICATION_EXPANSION_ADDED       = false
GLOBAL_CONTEXT_EXPANDED           = false
PARALLEL_RUNTIME_PIPELINE_ADDED   = false
SHARED_RENDERER_BEHAVIOR_CHANGED  = false
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_SLICE018_IMPLEMENTATION_CURRENT_SURFACES_E6_ACCEPTED_PIXEL_REPAIRED_D0_NOT_MATERIALIZED
GOAL_DISTANCE_AFTER  = D0_SLICE018_PRODUCT_CLOSED_PENDING_CLOSEOUT_PR_CI_MERGE
DISTANCE_REDUCED     = Core authority, current Classic/shared worksheet cutover, recovered GLM-S07, E6 Chromium artifact/manual review, and Pixel parity repair are bound into one canonical Slice018 manifest/claim/readback chain.
REMAINING_BLOCKERS   = [CLOSEOUT_PR_CI_AND_MERGE]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice018Closeout_PR_CI_Merge_MainReadback
```

Final mainline D0 authority requires this closeout branch to pass exact-head CI, merge to `main`, and then reconcile the candidate metadata with the closeout PR/run/merge evidence. Slice019 must not start before that reconciliation.
