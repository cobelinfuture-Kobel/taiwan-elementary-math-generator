# S59J G4B-U01 D0 Closeout Readback

G4B-U01 has completed the approved horizontal-only public worksheet path.

## Accepted production scope

- 9 visible KnowledgePoints;
- 9 visible PatternGroups;
- 12 promoted PatternSpecs;
- public count range 1-200;
- grouped and shuffled deterministic generation;
- answer-key control and stale-output invalidation;
- Classic, 404 fallback and Pixel UI paths;
- S59E blocking arithmetic validation;
- S59H production worksheet and renderer contract;
- no application mode, vertical representation, representation toggle, hidden-mode flag or generic fallback.

## Final stress and regression evidence

- accepted count matrix: 1, 9, 12, 72 and 200;
- rejected over-limit matrix: 201, 257, 600 and 1000;
- aggregate stress: 5 batches x 200 = 1000 questions;
- all 9 groups and all 12 PatternSpecs reached;
- group and within-group family spread at most one;
- all 24 blocking codes produced zero invalid output;
- both warning codes remained nonblocking;
- source-unit routes remained byte-for-byte delegated to the previous path;
- PR and main CI passed 869/869 with clean working trees.

## Public print artifact

- 72 questions and 72 answer records;
- 3 question pages and 3 answer pages;
- A4 3x8 question layout and 3x10 answer layout;
- 6/6 rendered pages nonblank;
- 72/72 question and answer expressions extracted from PDF;
- Noto Sans CJK TC glyph verification passed;
- no internal ID, unresolved placeholder, vertical mode or application wording leakage.

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_PUBLIC_UI_PRINT_CONTROLS_ACCEPTED_FINAL_PROMOTION_PENDING
GOAL_DISTANCE_AFTER  = D0_G4B_U01_HORIZONTAL_WORKSHEET_PUBLICLY_PRINTABLE
DISTANCE_REDUCED     = G4B-U01 now supports public KnowledgePoint selection, canonical generation, blocking validation, worksheet preview and printable Traditional Chinese HTML/PDF output.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = NONE_G4B_U01_CORE_UNIT_CLOSED
STOP_REASON          = UNIT_REACHED_D0
NEXT_RESUME_TASK     = SELECT_NEXT_BATCH_A_UNIT
```
