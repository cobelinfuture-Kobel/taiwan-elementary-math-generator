# P03F W3 Direct Product Vertical Slice031 — D0 Closeout Candidate Readback

## Status

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P03F_W3DirectProductVerticalSlice031Implementation
E6_MILESTONE_ID = P03F_W3DirectProductVerticalSlice031_E6_D0Closeout

STATUS = D0_CLOSEOUT_CANDIDATE
GOAL_DISTANCE = D1
ADMISSION_STATE = PENDING_D0_RECONCILIATION
```

This candidate records the immutable implementation evidence for W3 queue position 31. It does **not** authorize Slice032. Final D0 requires candidate PR CI/merge followed by post-merge reconciliation.

## Admitted Slice031 identity

```text
QUEUE_POSITION = 31
QUEUE_ENTRY = p03e_q031_r8_g5b_u04_5b04_profile_decimal_c1
SOURCE = g5b_u04_5b04
TITLE = 小數的乘法

KNOWLEDGE_POINT =
kp_g5b_u04_decimal_times_integer

PATTERN_GROUP =
pg_g5b_u04_decimal_times_integer_numeric

PATTERN_SPEC =
ps_g5b_u04_decimal_times_integer_product_numeric

SOURCE_WITNESS =
0.672 × 18 = 12.096
```

Scope remains numeric-only decimal × integer. Integer × decimal, decimal × decimal, application, estimation, Global Context expansion, and Slice032 are outside this candidate.

## Implementation evidence

```text
IMPLEMENTATION_PR = #575
EXACT_HEAD = 15c43769fb6fe44f26efa0d50cd2427bfd49bb30
IMPLEMENTATION_MERGE_SHA = 7f0a49902cfbd5d9946118f2644c5e64de31513d
MERGE_METHOD = squash

RUNTIME_PATH =
site/modules/curriculum/batch-a/g5b-u04-rank8-decimal-times-integer-runtime-p03f31.js

MAIN_RUNTIME_BLOB =
82545716500194faab7da86d66b5455575d65663
```

### Node full regression

```text
RUN = 31396488175
JOB = 93480538465
TESTS = 3014
PASS = 3014
FAIL = 0
SKIPPED = 0

DIAGNOSTICS_ARTIFACT = 9065910152
DIAGNOSTICS_DIGEST =
sha256:075924fb9d55742ae0518bfc969a4e7abab745fa670996d2aeceb6e9e1a4ab00
```

## Product acceptance

```text
RUN = 31396488012
JOB = 93480537013
ARTIFACT = 9065854822
DIGEST =
sha256:c152bd3186738cf205401e5d26dc391be5ca521e914afb15cac35146574387f9

QUESTIONS = 24
ANSWERS = 24
QUESTION_PAGES = 3
ANSWER_PAGES = 3
PDF_PAGES = 6
SCREENSHOTS = 6

HTML_SHA256 =
a00e75d4fe499780fbad6e0d019035e75f6a033841149279b8294be2575229b7

PDF_SHA256 =
a68aa03b7e8c0ef4e5f0049baa6155c45657264017320a751f65f339252577c9

ARITHMETIC_FINDINGS = 0
CROSS_LAYER_MISMATCHES = 0
DUPLICATE_PROMPTS = 0
OVERFLOW_FINDINGS = 0
CONSOLE_ERRORS = 0
PAGE_ERRORS = 0
SEMANTIC_SCOPE_FINDINGS = 0
APPLICATION_LEAK_FINDINGS = 0

MANUAL_VISUAL_REVIEW = PASS
PAGES_REVIEWED = 6 / 6
CLIPPED_TEXT = 0
OVERLAP = 0
BROKEN_GLYPHS = 0
SOURCE_WITNESS_AND_ANSWER_ALIGNMENT = PASS
```

## Frozen R00 / R09 A01 exact replay

```text
RUN = 31396488182
JOB = 93480537836
ARTIFACT = 9066455214
DIGEST =
sha256:48b28fff71b5577580a92ed407900baee7619425ab29f4bb582d2661c5920a8a

STATUS = PASS_ALL_793_LEGAL_ROUTES
LEGAL = 793
EXECUTED = 793
PASS = 793
FAIL = 0
FULL_NINE_GATE = 793
EXIT_CODE = 0
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

The frozen 793-route contract is preserved. Slice031 current inventory expansion does not redefine the frozen R09 replay authority.

## Main authority readback

```text
R01_PUBLIC_SOURCES = 31
R01_VISIBLE_KPS = 225
R01_CAPABILITY_ROWS = 1413
R01_GAPS = 0

R02_PUBLIC_SOURCES = 31
R02_VISIBLE_KPS = 225
R02_BINDING_ROWS = 1218
R02_VERIFIED_LIMITED = 1062
R02_STRUCTURAL_FALLBACK = 156
R02_GAPS = 0
R02_BINDING_REVISION = pgc-r02-r04-p03f31
```

## Candidate boundary

```text
CANDIDATE_CLOSEOUT_PR = PENDING
CANDIDATE_CLOSEOUT_CI = PENDING
CANDIDATE_CLOSEOUT_MERGE = PENDING
FINAL_RECONCILIATION = NOT_STARTED

SLICE031_ADMITTED_D0 = false
SLICE032_MAY_START = false
```

## Next shortest step

```text
P03F_W3DirectProductVerticalSlice031_D0CloseoutCandidate
→ candidate PR CI
→ candidate merge
→ P03F_W3DirectProductVerticalSlice031_D0PostMergeReconciliation
```
