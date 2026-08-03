# P03F W3 Direct Product Vertical Slice017 — Final D0 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice017Implementation
SLICE      = 017
SOURCE_REF = g4a_u06_4a06
STATUS     = PASS_D0_CLOSEOUT_CANDIDATE
```

## Authority and product scope

Slice017 consumes queue position 17 (`p03e_q017_r7_g4a_u06_4a06_profile_fraction_c1`) and admits exactly one KnowledgePoint: true/proper, improper, and mixed-number classification. The product path contains one PatternGroup and three numeric PatternSpecs. It consumes the shared fraction number-system and fraction domain-validator capabilities only; fraction arithmetic is explicitly not required. Improper/mixed conversion, compare/order, number line, mixed-number arithmetic, application expansion, Global Context expansion, parallel pipelines, and Slice018 remain outside this milestone.

## Implementation and final CI evidence

```text
IMPLEMENTATION_PR          = #518
FINAL_IMPLEMENTATION_HEAD  = 22e2894986d00650bea442de0dad59eb36c9e561
IMPLEMENTATION_MERGE_SHA   = 27a11f571819eabca4f9344c2e937e304fcceba9
FINAL_NODE_RUN             = 30776663657
FINAL_NODE_JOB             = 91573365966
FINAL_NODE_CONCLUSION      = success
```

The exact clean implementation head passed Node Test after bootstrap and one-shot materializers were removed. Shared GLM layout/PDF gates, PGC-R01/R02/R03/R04/R05 and R06-A03 were also successful; the remaining historical fanout failures did not block PR #518 from merging and were outside Slice017 product logic.

## Chromium E6 acceptance evidence

```text
ACCEPTANCE_PR              = #520
ACCEPTANCE_EVIDENCE_HEAD   = f8fb4e1dfd6541813f253870fb278e5ee1304a09
CHROMIUM_RUN               = 30777237958
CHROMIUM_JOB               = 91574922743
ARTIFACT_ID                = 8842440677
ARTIFACT_DIGEST            = sha256:35f2826dccb35762210a3c52980edadb74e31eedca788a628710d84b686a7d6c
PDF_PAGE_COUNT             = 4
PDF_BYTE_LENGTH            = 35766
SCREENSHOT_COUNT           = 4
QUESTION_COUNT             = 18
ANSWER_KEY_COUNT           = 18
PATTERN_SPEC_WITNESSES     = 6 / 6 / 6
VISUAL_REVIEW              = PASS
SEMANTIC_REVIEW            = PASS
ANSWER_KEY_REVIEW          = PASS
```

The acceptance artifact contains two worksheet pages and two answer-key pages. Each classification PatternSpec has six witnesses. Automated browser acceptance found zero overflow, duplicate prompts, console errors, page errors, or semantic-scope findings. Manual review of all four screenshots found no clipping, overlap, or broken glyphs, and all 18 answers match the proper/improper/mixed-number invariants.

## D0 admission contract

```text
KNOWLEDGE_POINT_COUNT            = 1
PATTERN_GROUP_COUNT              = 1
PATTERN_SPEC_COUNT               = 3
NUMERIC_PATTERN_SPEC_COUNT       = 3
APPLICATION_PATTERN_SPEC_COUNT   = 0
QUESTION_WITNESS_COUNT           = 18
ANSWER_KEY_WITNESS_COUNT         = 18
NEW_PRODUCT_ADMISSION            = 1
NEW_PUBLIC_SOURCE                = 1
```

The candidate D0 state is `E6_ARTIFACT_ACCEPTED_D0` / `ADMITTED_D0`. The temporary Slice017 E6 workflow was retired before this canonical closeout branch was materialized.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_SLICE017_IMPLEMENTATION_MERGED_E6_ACCEPTED_D0_NOT_MATERIALIZED
GOAL_DISTANCE_AFTER  = D0_SLICE017_PRODUCT_CLOSED_PENDING_CLOSEOUT_PR_CI_MERGE
DISTANCE_REDUCED     = Slice017 E6 artifact, exact clean implementation CI, and product-admission evidence are bound into the canonical manifest/claim/readback chain.
REMAINING_BLOCKERS   = [CLOSEOUT_PR_CI_AND_MERGE]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice017Closeout_PR_CI_Merge_MainReadback
```

Final D0 is authoritative only after this closeout branch passes exact-head CI, merges to `main`, and the claim/manifest/readback are reconciled from main.
