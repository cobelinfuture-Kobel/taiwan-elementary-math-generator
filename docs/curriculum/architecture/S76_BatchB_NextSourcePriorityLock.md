# S76 — Batch B Next Source Priority Lock

```text
TASK = S76_BatchB_NextSourcePriorityLock
STATUS = PASS_CI_SYNCED_AND_MERGED
MODE = PLANNING_ONLY
```

## Scope

S76 resumes the S61 Batch B priority order after G4B-U04 reached D0. It locks the next source, confirms source readiness, preserves the split-source boundary, and resolves the public `Batch A` labeling ambiguity reported after G4B-U04 became publicly selectable.

S76 does not inspect PDF pages, extract KnowledgePoints, alter PatternSpecs, change generators or validators, modify the public UI, or change production behavior.

## Completed source checkpoint

```text
sourceId       = g4b_u04_4b04
sourceTitle    = 概數
distance       = D0_G4B_U04_PRODUCTION_READY_AND_CLOSED
productionUse  = allowed
```

The completed G4B-U04 path proves that Batch B sources can be projected through the existing public worksheet infrastructure without creating a separate learner-facing product catalog.

## Locked next source

S61 priority 2 remains valid and is now reconfirmed:

```text
NEXT_SOURCE_ID       = g5a_u02_5a02a
SOURCE_CODE          = 5a02a
TITLE                = 因數
GRADE                = 5
SEMESTER             = 五年級上學期
WAVE                 = B1
SOURCE_FILE          = meow911_5a02a_source.pdf
ORIGINAL_FILE_NAME   = 題型總覽-5a02a-因數.pdf
SOURCE_STORED        = true
MANUAL_REVIEWED      = false
EXTRACTION_STATUS    = pending
OCR_AUTHORITY        = forbidden
```

Selection rationale:

1. It is the first unit in the S61 factor → multiple → GCD/LCM prerequisite ladder.
2. It remains in the stable integer domain before decimal and fraction engines.
3. Factor enumeration and divisibility relationships can be represented with deterministic, uniquely validated answers.
4. It is the shortest curriculum-progressing step after the completed rounding bridge.

## Split-source boundary

```text
FOLLOW_UP_SOURCE_ID = g5a_u02_5a02a1
TITLE               = 因數
RELATIONSHIP        = split_source_packet
MERGE_WITH_5A02A    = false
```

`g5a_u02_5a02a1` remains priority 3. It may be reviewed adjacent to `5a02a`, but it must keep a distinct sourceId, source evidence boundary, extraction record, KnowledgePoint review and promotion decision.

## Public catalog decision

The current public Classic surface still uses:

```text
Batch A browser worksheet path
台灣小學數學 Batch A 練習題產生器
Batch A 單元
```

That terminology became inaccurate when `g4b_u04_4b04`, a Batch B production source, entered the same public selector.

### Decision

```text
PUBLIC_BATCH_A_B_TOGGLE = false
PUBLIC_CATALOG_POLICY   = neutral_public_catalog_labels
KEEP_CLASSIC_PIXEL_TOGGLE = true
```

Batch A and Batch B are internal source-assignment and release waves. They are not mathematical domains, grade levels, semesters, difficulty levels, or learner choices. Adding an A/B toggle would:

- expose implementation architecture to students and teachers;
- split a catalog that already shares one worksheet pipeline;
- add unnecessary query-state and deep-link branches;
- create ambiguity when future units share common generators or promotions;
- require users to know which internal batch contains a curriculum unit.

The public catalog should instead be organized by curriculum dimensions:

```text
年級 → 學期 → 單元 → 知識點 / 題目形式
```

Recommended public labels:

```text
Document / hero title = 台灣小學數學練習題產生器
Eyebrow               = Taiwan Elementary Math Worksheet
Unit section          = 單元選擇
Controls aria label   = 練習題設定
Preview empty state   = 尚未產生新的練習題。
```

The existing Classic / Pixel Beta switch remains because it represents a real learner-facing interface choice.

### Compatibility boundary

The next UI correction should change visible text and accessibility labels only. Existing `batch-a-*` DOM ids, query keys and internal module names may remain temporarily to avoid breaking established routes, tests and saved links. Internal naming migration is a separate optional refactor, not required for the public correction.

## Locked handoff

```text
S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix
→ S78_G5A_U02A_ManualPDFKnowledgePointExtraction
```

S77 is intentionally placed first because the screenshot exposes a current production-facing naming defect. S77 must be a narrow compatibility-preserving label correction, not a registry or selector rewrite. After S77 passes, S78 begins manual visual extraction of `g5a_u02_5a02a`.

## Acceptance

S76 is accepted only when:

1. next source is exactly `g5a_u02_5a02a`;
2. the source metadata and Drive PDF are confirmed present;
3. `g5a_u02_5a02a1` remains separate;
4. public A/B toggle is explicitly rejected;
5. neutral public labels and curriculum filters are recorded;
6. Classic/Pixel interface switching remains unchanged;
7. no PDF extraction or runtime/UI implementation occurs in S76.

## CI and merge evidence

```text
planning PR             = #120
merge commit            = e5319baaed6e095fc7aae9889e2bbb137c810c6e
PR Math CI run          = 29220206521
fresh-main Math CI run  = 29220305618
fresh-main readback     = 6f55ea11fd3fa8889e148ecb4b50e2b9db45ca65
tests                   = 1106
pass                    = 1106
fail                    = 0
working tree            = clean
```

All existing Node, S42, G4B-U01, G5A-U08 and G4B-U04 smoke workflows passed. The merged changes remain planning artifacts and executable contract tests only.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D4_BATCH_B_FIRST_SOURCE_D0_NEXT_SOURCE_NOT_RECONFIRMED

GOAL_DISTANCE_AFTER =
D4_BATCH_B_NEXT_SOURCE_AND_PUBLIC_CATALOG_POLICY_LOCKED

DISTANCE_REDUCED =
Removed the next-source decision blocker and the public Batch A/Batch B
presentation ambiguity. Locked G5A-U02A 因數 as the next curriculum source
while preserving a single learner-facing catalog.

REMAINING_BLOCKERS = [
  "Public catalog still displays Batch A labels around a mixed Batch A/Batch B source catalog",
  "g5a_u02_5a02a manual visual PDF verification has not started",
  "g5a_u02_5a02a KnowledgePoint extraction has not started"
]

NEXT_SHORTEST_STEP =
S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix

STOP_REASON =
PLANNING_TO_IMPLEMENTATION_APPROVAL_REQUIRED
```
