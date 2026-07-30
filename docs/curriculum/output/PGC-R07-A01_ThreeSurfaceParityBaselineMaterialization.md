# PGC-R07 A01 Three-Surface Parity Baseline Materialization

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R07-A01_ThreeSurfaceParityBaselineMaterialization
STATUS = PASS_BASELINE_MATERIALIZED_WITH_BLOCKING_GAPS
```

## Baseline policy

This milestone does not treat registry metadata, an existing PatternSpec, or an old committed PDF as browser parity evidence.

```text
Browser evidence is required for PASS.
An output not reached because of an upstream UI failure is BLOCKED_UPSTREAM.
A surface without current same-config/seed browser evidence is UNPROVEN.
```

## Matrix

```text
Surfaces           = 3
Output projections = 4
Baseline rows      = 12
Renderer branches  = 4
```

Surface/output status:

| Surface | Preview HTML | Print HTML | Chromium PDF | Answer Key |
|---|---|---|---|---|
| Classic | FAIL | BLOCKED_UPSTREAM | UNPROVEN | BLOCKED_UPSTREAM |
| 404 fallback | UNPROVEN | UNPROVEN | UNPROVEN | UNPROVEN |
| Pixel | UNPROVEN | UNPROVEN | UNPROVEN | UNPROVEN |

## First reproduced blocker

The deployed main smoke was replayed after the earlier transient 503 evidence. Attempt 2 reached the page and controls without console or page errors, but failed at:

```text
selector = #g5a-u08-question-mode
requested option = mixed
failure = did not find some options
workflow run = 30534871170
attempt = 2
```

Therefore the current blocker is classified as:

```text
SURFACE_CONTROL_OPTION_MISMATCH
```

It is not classified as a network failure, generator failure, validator failure, or renderer failure because the renderer was never reached.

## Repair queue

```text
1. CLASSIC G5A-U08 question-mode option mismatch
2. 404 fallback current browser baseline missing
3. Pixel current browser baseline missing
4. Four renderer branches lack unified identity-parity witnesses
5. Real Chromium PDF and answer-key identity matrix missing
```

## Scope protection

```text
Generator modified   = false
Validator modified   = false
Renderer modified    = false
UI modified          = false
KnowledgePoint change = false
PatternGroup change   = false
PatternSpec change    = false
Slice014 started      = false
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_R07_SURFACE_RENDERER_PRINT_SCOPE_AND_PARITY_CONTRACT_FROZEN
GOAL_DISTANCE_AFTER  = D1_R07_THREE_SURFACE_BASELINE_AND_REPAIR_QUEUE_MATERIALIZED
DISTANCE_REDUCED     = unknown surface/print parity converted into a twelve-row baseline and five-item evidence-backed repair queue
REMAINING_BLOCKERS   = [PUBLIC_QUESTION_MODE_OPTION_MISSING, FALLBACK_404_BROWSER_BASELINE_MISSING, PIXEL_BROWSER_BASELINE_MISSING, RENDERER_BRANCH_PARITY_UNPROVEN, REAL_PRINT_AND_ANSWER_KEY_MATRIX_MISSING]
NEXT_SHORTEST_STEP   = PGC-R07-A02_SharedRendererAndLegacyBranchParityFullFix
```

## Task closeout

```text
1. Distance segment shortened = unclassified R07 parity uncertainty to deterministic baseline and repair queue
2. System nodes advanced = surface acceptance / renderer routing / print evidence governance
3. Blocker removed = transient 503 ambiguity
4. New blocker added = none; current missing evidence is explicitly classified
5. Next shortest effective step = repair the first public surface mismatch and establish branch parity witnesses
```
