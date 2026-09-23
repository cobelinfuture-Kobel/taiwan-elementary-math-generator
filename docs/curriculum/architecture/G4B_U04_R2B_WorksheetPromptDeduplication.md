# G4B-U04 R2B — Worksheet Prompt Deduplication

```text
TASK = G4B_U04_R2B_WorksheetPromptDeduplication
STATUS = PASS_CI_SYNCED_AND_MERGED
STATUS_EFFECTIVE_WHEN = THIS_CLOSEOUT_COMMIT_IS_MERGED_TO_MAIN
SOURCE_ID = g4b_u04_4b04
IMPLEMENTATION_PR = 206
IMPLEMENTATION_MERGE_SHA = d9e762b3e617ebfd1ba42ecdc4f18f889f924c91
```

## Scope

R2B adds a whole-worksheet normalized-prompt uniqueness gate to the existing public canonical runtime.

```text
visible resolver
→ capacity-aware PatternSpec allocation
→ hidden S71 authority validation
→ deterministic bounded resampling
→ per-question S71 validation
→ whole-worksheet prompt-signature gate
→ canonical questions
→ worksheet / answer key / renderer
```

No arithmetic formula, KnowledgePoint, PatternGroup, PatternSpec, answer model, renderer profile or public control was added by this milestone.

## Prompt signature

```text
Unicode NFKC
→ trim
→ collapse whitespace
→ preserve digit-comma-digit thousands separators
→ canonicalize ASCII sentence punctuation to Chinese punctuation
→ remove whitespace around Chinese punctuation and brackets
→ preserve all numbers, units and semantic nouns
```

Exact duplicate normalized prompts are forbidden across the entire worksheet.

## Capacity-aware allocation

The following PatternSpecs have finite unique prompt pools:

```text
ps_g4b_u04_approx_symbol_reading   = 1
ps_g4b_u04_inverse_digit_set       = 12
ps_g4b_u04_inverse_original_values = 12
reasoning mode combined capacity   = 24
```

The inverse capacities are validator-backed cases with distinct `mask`, `targetUnit`, `roundedValue` and computed solution sets. They are not wording-only variants.

Mixed worksheets allocate round-robin until a finite pool is exhausted, then redistribute later questions to PatternSpecs with remaining capacity. A request restricted to a finite PatternSpec is blocked when the requested count exceeds capacity. Generic fallback, silent duplication and arbitrary PatternSpec injection remain forbidden.

## Deterministic retry

Each allocated question receives bounded deterministic retries. Every candidate is delegated to the existing S71 Class C or Class D validator before its prompt signature can be accepted.

```text
max retries per allocated question = 128
failure after retry exhaustion      = blocking
output on blocking failure          = zero questions
```

## Acceptance

```text
40-question mixed worksheet      = exact count, 0 duplicate prompts
170-question authority mix       = 17 PatternSpecs, 0 duplicate prompts
1000-question stress             = deterministic, 0 duplicate prompts
24-question reasoning mode       = exact count, 0 duplicates, validator accepted
symbol-reading count             = maximum 1 per worksheet
single finite-pool overflow      = blocking error
Node Test                        = PASS
S42 Branch Test                  = PASS
Math CI Readback                 = PASS
S75 68-question HTML/PDF smoke   = PASS
S75 DOM containment              = PASS
S75 PDF render and A4 bounds     = PASS
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_DUPLICATE_PROMPT_BLOCKER_OPEN

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2B_CLOSED_NEXT_R2C

DISTANCE_REDUCED =
Closed the whole-worksheet duplicate-prompt blocker with deterministic, validator-backed unique generation and production HTML/PDF verification.

REMAINING_BLOCKERS = [
  "R2C source-backed discount round-down and KP refinement not implemented",
  "R2D resolved layout readback not implemented",
  "R2E controlled SDG context materialization not implemented",
  "R2F production recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2C_SourceBackedDiscountRoundDownAndKPRefinement

STOP_REASON = NONE
```
