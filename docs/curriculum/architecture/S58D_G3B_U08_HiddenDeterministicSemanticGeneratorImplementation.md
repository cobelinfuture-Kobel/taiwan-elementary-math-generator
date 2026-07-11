# S58D G3B-U08 Hidden Deterministic Semantic Generator Implementation

## Scope lock

```text
CURRENT_MAJOR_TASK = S58D_G3B_U08_HiddenDeterministicSemanticGeneratorImplementation
TASK_STATUS = IMPLEMENTATION
PUBLIC_SELECTOR = unchanged
CANONICAL_ROUTER = unchanged
WORKSHEET_RENDERER = unchanged
PRODUCTION_USE = forbidden
```

This milestone implements only the hidden deterministic generator layer for the six approved G3B-U08 application KnowledgePoints and the 24 S58C PatternSpecs.

## Runtime path

```text
S58C hidden PatternSpec
→ approved S58D context variant
→ deterministic numeric binding
→ horizontal prompt and equation
→ answer-model projection
→ generator structural self-check
→ hidden question output
```

This is not the S58E 44-code semantic validator runtime. S58D contains only generator-local structural checks required to prevent malformed hidden output.

## Coverage

```text
approved KnowledgePoints = 6
hidden PatternGroups = 6
hidden PatternSpecs = 24
context variants per family = 3
total context variants = 72
answer models = 3
```

Each PatternSpec has exactly three registered context variants. Context selection may be deterministic by seed, constrained by an approved context domain, or pinned by an explicit contextVariantId.

## Answer models

### Single integer with unit

Used by total, group-count, per-group and reverse-base families.

### Estimation judgment

Supports:

```text
approximately
enough
more_by
less_by
```

The output preserves the estimate equation, exact equation, estimate value and exact difference.

### Same-price comparison

Both option totals are generated with one-digit package counts and two- or three-digit per-package quantities. The equations are rendered as prior-scope multiplication, for example `102 × 2`, not as an unsupported two-digit multiplier calculation. Ties are forbidden and one winner is required.

## Numeric boundary

```text
positive integers only
maximum final/intermediate value = 999
multiplication = 1d×1d, 2d×1d, 3d×1d
division = 2d÷1d or 3d÷1d, exact only
2-digit divisor = forbidden
public remainder application = forbidden
decimal/fraction/percent = forbidden
representation = horizontal_only
```

## Human-readback FullFix transfer

The generator implements all frozen S58A1 directives:

- segment prompts use `每段長…`, never `每段剪成…`;
- score events use natural phrases such as `投進一球`, `答對一題`, and `完成一關`;
- score-event verbs and classifiers remain paired;
- same-price prompts explicitly state equal price, compare one measure dimension, reject ties, and return one winner.

## Determinism and batch behavior

Single-question replay is keyed by:

```text
seed + PatternSpec + sequenceNumber + contextVariant
```

The hidden batch API:

- accepts registered PatternSpecs only;
- rejects duplicates;
- balances by round-robin family allocation;
- preserves the exact requested count;
- supports stable order and deterministic `shuffledAcrossPatterns` order;
- returns no partial batch and performs no numeric fallback when one question fails.

## Hidden lifecycle

Every generated question remains:

```text
selectorStatus = hidden
generatorRouting = hidden_only_not_canonical
productionUse = forbidden
```

No selector, canonical router, worksheet, renderer, UI, HTML, PDF or production eligibility file is changed by S58D.

## Acceptance criteria

```text
72/72 explicit family-context variants generated
24/24 PatternSpecs reachable
deterministic replay = PASS
240-question balanced batch = PASS
horizontal-only = PASS
unresolved placeholders = 0
fallback questions = 0
public routing changes = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G3B_U08_24_PATTERNSPECS_AND_6_GROUPS_MATERIALIZED_HIDDEN_GENERATOR_NOT_IMPLEMENTED
GOAL_DISTANCE_AFTER  = D2_G3B_U08_24_FAMILY_HIDDEN_DETERMINISTIC_GENERATOR_CONNECTED_VALIDATOR_RUNTIME_PENDING
DISTANCE_REDUCED     = connected all 24 hidden PatternSpecs to 72 approved deterministic context variants, three answer models, exact arithmetic and no-fallback hidden batch generation
REMAINING_BLOCKERS   = [
  "the S58E eight-stage 44-code semantic validator runtime is not implemented",
  "full family-context human semantic readback has not been completed",
  "selector, canonical router, worksheet, renderer and public UI remain unchanged"
]
NEXT_SHORTEST_STEP   = S58E_G3B_U08_SemanticValidatorRuntimeAndHumanReadbackQA_FullFix
```
