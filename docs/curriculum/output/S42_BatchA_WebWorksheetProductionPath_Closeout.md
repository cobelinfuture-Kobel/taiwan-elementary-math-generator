# S42 Batch A Web Worksheet Production Path — Closeout Readiness

## Current State

```text
CURRENT_MAJOR_TASK = S42_BatchA_WebWorksheetProductionPath
CURRENT_STATUS = CLOSEOUT_READINESS
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
453126d612e2047eb1f26802144a0ff62c85bc30
```

## QA Coverage Added

```text
S42B19 = Batch A 13 sourceId browser smoke QA
S42B20 = iframe preview runtime smoke QA
S42B21 = validator contract registry exact parity restored
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
PR #2 = open / draft / unmerged
PR #2 purpose = S42B19-B21 QA, parity, and closeout readiness
```

No merge is authorized by this note. Merge still requires explicit operator approval.

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_REDUCED_ARTIFACT_PARITY_RESOLVED
GOAL_DISTANCE_AFTER  = D1_FINAL_DOCS_READINESS_RECORDED
DISTANCE_REDUCED     = Final S42 docs blocker reduced by recording current scope, gates, parity status, and PR state
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "PR #2 尚未 ready for review",
  "PR #2 尚未 merge",
  "S42 尚未 final closeout"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S42B24_PR2ReadyOrMergeApproval
```
