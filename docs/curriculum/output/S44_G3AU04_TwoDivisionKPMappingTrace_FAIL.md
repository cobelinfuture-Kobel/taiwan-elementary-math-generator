# S44 G3A-U04 Two Division KnowledgePoint Mapping Trace — FAIL

```text
TASK_STATUS = TRACE_FAIL_NEEDS_SOURCE_ID_CONFIRMATION
REQUESTED_SCOPE = g3a_u04 two division KnowledgePoints
OBSERVED_PDF_FILES = [
  "g3a_u04_整除檢查.pdf",
  "g3a_u04_三位數除以一位數整除.pdf"
]
```

## Findings

```text
1. The current public repository does not define g3a_u04 as a sourceId.
2. The visible selector rows currently map these two division items under sourceId g3a_u06_3a06, not g3a_u04.
3. The current repository has 二位數除以一位數整除 and 整除檢查; it does not have a G3A-U04 row for 三位數除以一位數整除.
4. The current base PatternSpec definitions for g3a_u06 exact division use dividend range 10..99 and divisor range 2..9.
5. Uploaded PDFs showed one-digit division outputs, which do not match the current public main definition ranges.
```

## Blocking Mismatch

```text
REQUESTED = g3a_u04 / 三位數除以一位數整除 / 整除檢查
CURRENT_REPO = g3a_u06_3a06 / 二位數除以一位數整除 / 整除檢查
```

## Required Decision

```text
Before implementing, confirm whether the next fix should:
A. patch the existing g3a_u06_3a06 division KPs, or
B. create/rename a new g3a_u04 sourceId with the two requested KPs, including 三位數除以一位數整除.
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3A_U04_TWO_KP_GENERATOR_MAPPING_BUG_CONFIRMED
GOAL_DISTANCE_AFTER  = D2_SOURCE_ID_AND_KP_MAPPING_MISMATCH_TRACED
DISTANCE_REDUCED     = traced repository mismatch: requested G3A-U04 is not represented as a sourceId in current public main; current rows point to G3A-U06
REMAINING_BLOCKERS   = [
  "Need operator choice: patch g3a_u06 existing rows or create/rename g3a_u04 sourceId",
  "Uploaded PDF output does not match current main PatternSpec ranges",
  "三位數除以一位數整除 is absent from current selector rows"
]
NEXT_SHORTEST_STEP   = operator confirms target sourceId and KP IDs, then implement the smallest mapping/generator fix
```
