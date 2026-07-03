# S42 Batch A Web Worksheet Production Path — Closeout Readiness

## Current State

```text
CURRENT_MAJOR_TASK = S42_BatchA_WebWorksheetProductionPath
CURRENT_STATUS = POST_MERGE_CLOSEOUT_READINESS
BATCH_A_WEB_WORKSHEET_PATH = CI_GREEN
```

S42 advances the stable repository from the earlier V1 generic expression worksheet stage to a Batch A browser worksheet path.

The current browser path is:

```text
Batch A sourceId selection
→ browser-safe Batch A generator
→ browser-safe validator
→ worksheet document assembly
→ HTML renderer
→ iframe preview
→ print / answer key output
```

## Batch A Source Coverage

The browser worksheet path is covered for 13 Batch A sourceIds:

```text
g3a_u01_3a01
g3a_u02_3a02
g3a_u03_3a03
g3a_u06_3a06
g3b_u01_3b01
g3b_u04_3b04
g3b_u08_3b08
g4a_u01_4a01
g4a_u02_4a02
g4a_u04_4a04
g4a_u08_4a08
g4b_u01_4b01
g5a_u08_5a08
```

## Verified Gates

```text
S42 Branch Test = PASS
Node Test        = PASS
```

Verified on head commit:

```text
8998ca9befd2539da34697383ab2c9fa2167b531
```

Merged through PR #2:

```text
merge_commit_sha = bd2a3eec824d43e8430f91061dd14ed3dd542f49
merged_at        = 2026-07-03T14:47:15Z
```

## QA Coverage Added

```text
S42B19 = Batch A 13 sourceId browser smoke QA
S42B20 = iframe preview runtime smoke QA
S42B21 = validator contract registry exact parity restored
S42B23 = S42 closeout readiness note added
```

The QA coverage verifies:

```text
- all 13 Batch A sourceIds generate worksheet documents
- groupedByPattern and shuffleAcrossPatterns both generate
- answer key can be included or suppressed
- unsupported sourceId leakage is rejected
- rendered worksheet HTML is written into iframe srcdoc
- answer key appears when enabled and disappears when disabled
- print path calls iframe contentWindow.focus() and contentWindow.print()
```

## Artifact Parity Status

```text
validator_contracts.batch_a.json = exact dev parity restored
production-eligibility.js        = accepted as S42 browser scope guard, not a dev parity artifact
```

## Release Boundary

S42 is limited to Batch A browser worksheet output. It does not release:

```text
- Batch B/C/D/E
- decimal / fraction / geometry / chart generators
- AI literacy fusion questions
- unsupported visual generators
- student accounts or cloud records
```

## PR State

```text
PR #2 = merged / closed / not draft
PR #2 purpose = S42B19-B23 QA, parity, and closeout readiness
```

No further PR #2 merge action is pending.

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_PR2_MERGED_POST_MERGE_DOC_STALENESS_REMAINS
GOAL_DISTANCE_AFTER  = D1_POST_MERGE_CLOSEOUT_NOTE_UPDATED
DISTANCE_REDUCED     = Post-merge PR state is recorded on main; S42 closeout note no longer says PR #2 is draft/unmerged
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "README may still say S20 / V1 / old test count",
  "S42 final closeout readback still required"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S42B27_FinalMainReadbackAndCloseout
```
