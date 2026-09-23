# P03F W3 Slice018 D0 Final Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice018Implementation
STATUS     = PASS_D0_CLOSED
```

## Frozen authority

- Queue position: `18`
- Queue entry: `p03e_q018_r7_g4a_u09_4a09_profile_decimal_c1`
- Source: `g4a_u09_4a09` / 4A-U09「2位小數」
- KnowledgePoint: `kp_g4a_u09_decimal_compose_decompose`
- PatternSpec: `ps_g4a_u09_decimal_compose_decompose_decimal_numeric`
- Required capabilities: `cap_decimal_domain_validator`, `cap_decimal_number_system`
- Application classification: `APPLICATION_NOT_APPLICABLE`

## Implementation evidence

### Core — PR #522

- Exact head: `6f23ff4310b5ffe17df8560d0397f8c4372d3201`
- Node run/job: `30790392563 / 91612479885` = `success`
- Merge: `34282b6282365b1f8b5b4bb8d8e2088523bbdce3`

### Current surfaces — PR #523

- Exact head: `15da923bee215008e3ec627abba6a2257e5996b7`
- Node run/job: `30791255848 / 91615071408` = `success`
- GLM-S07 run: `30791255843`
- Stuck shard job `91615127731` was cancelled during dependency setup.
- Single-job recovery `91618448152` = `success`.
- Final aggregate `91618633999` = `success`, validating all 90 answer-key boundary scenarios.
- Merge: `b678f5d1fc985d66f291d5e473dac19305824422`

### Chromium E6 — PR #524

- Acceptance head: `48f10912139874e2e1814063d13850cb8cfbdf0b`
- Run/job: `30793658443 / 91622334211` = `success`
- Artifact: `8848015560`
- Artifact API digest: `sha256:0d0b33c26615acbe06cc636f23019ab0af9bc9d379a97dadae2bfbe9eae46f21`
- HTML SHA-256: `f2cf43cc0d9c6920e7aa36ea12f115cc147bc0d27e96a19c41370c8892ee1c67`
- PDF SHA-256: `f490a7375d09a033ce3ccecc2290fb0466f6b39cc0f579fc9e306ee648edd045`
- PDF: 4 physical pages / 21,678 bytes
- Screenshots: 4
- Questions / answer-key items: 18 / 18
- PatternSpec witnesses: 18
- duplicate / overflow / console / page-error / semantic-scope findings: `0 / 0 / 0 / 0 / 0`
- Manual visual review: `PASS`
- Semantic review: `PASS`
- Answer-key review: `PASS`
- Temporary acceptance workflow retired.
- Cleanup head Node run/job: `6171f8be0c2677beb4b1c4b06a2abaaea47bf205 / 30793875184 / 91622995068` = `success`
- Merge: `cd5d9290366bdad3471aa3d3cd8c3018bb8e4c8d`

The E6 artifact contains two worksheet pages and two answer-key pages. All 18 witnesses use the single admitted compose/decompose PatternSpec. Manual review found no clipping, overlap, broken glyphs, or pagination defects. The answer key preserves exact two-decimal forms, including trailing-zero values such as `6.30`, `8.90`, and `2.50`.

### Pixel current-surface repair — PR #525

D0 preflight detected Pixel still importing the P03F17 selector. This was not accepted as a false D0.

- Pixel current selector advanced to P03F18.
- P03F10 historical selector remained frozen while its current-Pixel audit was made successor-safe.
- Exact head: `e1823675162c1a3c62ecea4a8be9432efde7b11f`
- Node run/job: `30795336068 / 91627566495` = `success`
- Merge: `9d10f8bd07c8eddc93806242811d3e1c19c902c8`

## Formal closeout — PR #526

- Exact head: `dce2d5a28ccaab6b2f1ee49c30cc3bffe3e7b17b`
- Node run/job: `30795972050 / 91629520667` = `success`
- Merge: `b5419c77f10eb0a3422f1f51dcdeaad7abc722d3`
- Main readback: `PASS`

## Evidence authority reconciliation

The post-merge D0 state was already closed by PR #528, but GitHub readback showed that several evidence identifiers in the candidate chain were not resolvable to the actual records. The canonical values above correct:

- core Node job `91612642473` → `91612479885`
- GLM-S07 final aggregate `91618525072` → `91618633999`
- E6 Chromium job `91622347441` → `91622334211`
- artifact API digest `sha256:593412...` → `sha256:0d0b33...`
- PR #524 merge SHA `cd5d9290bf...` → `cd5d9290366bdad3471aa3d3cd8c3018bb8e4c8d`

This correction changes evidence metadata only. It does not change runtime behavior or reopen Slice018 product acceptance.

## Product result

```text
Classic current surface = PASS
Pixel current surface   = PASS
Shared worksheet        = PASS
Validator               = PASS
Chromium E6             = PASS
Visual review           = PASS
Semantic review         = PASS
Answer key review       = PASS
Parallel pipeline       = NO
Application expansion   = NO
```

## Boundary

Slice019 has not started. Slice018 did not add decimal comparison, decimal sequence, missing-digit reasoning, decimal arithmetic, application/Global Context expansion, a new public source, or a parallel runtime pipeline.

## Final closeout

```text
GOAL_DISTANCE_BEFORE = D0_SLICE018_CLOSED_WITH_EVIDENCE_AUTHORITY_DRIFT
GOAL_DISTANCE_AFTER  = D0_SLICE018_PRODUCT_CLOSED_MAIN_RECONCILED
DISTANCE_REDUCED     = GitHub-authoritative job IDs, artifact digest, aggregate evidence and acceptance merge SHA replace stale candidate metadata without changing product scope.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice019Implementation
```
