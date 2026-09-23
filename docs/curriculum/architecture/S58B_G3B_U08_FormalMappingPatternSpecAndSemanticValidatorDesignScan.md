# S58B G3B-U08 FormalMapping, PatternSpec and Semantic Validator Design Scan

## Scope lock

```text
CURRENT_MAJOR_TASK = S58B_G3B_U08_FormalMappingPatternSpecAndSemanticValidatorDesignScan
CURRENT_SUBTASK = design FormalMapping, PatternSpec, answer-model and blocking validator contracts
TASK_STATUS = DESIGNSCAN
OUTPUT = implementation-ready S58C contracts
```

This milestone is design-only. It does not materialize PatternSpecs or change generator, validator runtime, selector, worksheet, renderer, UI, HTML, PDF, or production eligibility.

## Inputs

- six approved public application KnowledgePoints;
- 24-family S58A registry;
- S58A1 accepted family freeze;
- horizontal-only representation;
- prior Batch A multiplication/division boundary;
- G3B-U04 two-step overlap guard.

## FormalMapping design

Each frozen family becomes exactly one hidden PatternSpec. Each of the six public KPs owns one PatternGroup and four PatternSpecs.

```text
6 KnowledgePoints
→ 6 PatternGroups
→ 24 frozen semantic families
→ 24 hidden PatternSpecs
```

The PatternSpec must copy the family semantic signature, equation shape, unknown role, quantity roles, context domains and constraints without free-form reinterpretation.

### PatternGroup design

| PatternGroup | KP | Equation family | Answer model | Family count |
|---|---|---|---|---:|
| `pg_g3b_u08_total_from_groups` | 求總量 | `a*b` | single integer + unit | 4 |
| `pg_g3b_u08_group_count_from_total` | 求組數 | `a/b` | single integer + unit | 4 |
| `pg_g3b_u08_per_group_from_total` | 求每組量 | `a/b` | single integer + unit | 4 |
| `pg_g3b_u08_reverse_base_from_multiple` | 倍數反求基準量 | `a/b` | single integer + unit | 4 |
| `pg_g3b_u08_shopping_estimation` | 購物估算 | rounding/benchmark × count | estimation judgment | 4 |
| `pg_g3b_u08_same_price_value_comparison` | 同價方案比較 | `a*b` versus `c*d` | comparison result | 4 |

## PatternSpec lifecycle

S58C materialization must set:

```text
kind = g3bU08SemanticApplication
representation = horizontal_only
selectorVisibility = hidden
productionUse = forbidden
freeFormAIGeneration = forbidden
```

PatternSpec materialization is not public promotion. No PatternSpec may enter the generic router before hidden generator and validator acceptance.

## Answer models

### 1. Single integer with unit

Used by KPs 1–4.

```text
equationModel
finalAnswer
finalAnswerUnit
finalAnswerWithUnit
semanticSnapshot
```

### 2. Estimation judgment with reason

Used by KP5.

```text
estimateEquationModel
estimateValue
judgment
exactEquationModel      # required for more/less difference families
exactDifference         # required for more/less difference families
finalAnswerWithUnit
semanticSnapshot
```

Allowed judgments:

```text
approximately
enough
not_enough
more_by
less_by
```

### 3. Same-price comparison

Used by KP6.

```text
optionAEquationModel
optionATotal
optionBEquationModel
optionBTotal
comparisonDimension
winner                  # option_a or option_b only
conclusionZh
semanticSnapshot
```

A tie is forbidden.

## Numeric boundary

```text
positive integers only
allowed multiplication = 1d×1d, 2d×1d, 3d×1d
allowed division = 2d÷1d exact, 3d÷1d exact
2-digit multiplier computation = forbidden
2-digit divisor computation = forbidden
public remainder application = forbidden
negative, decimal, fraction, percent = forbidden
maximum final/intermediate value = 999
```

The comparison PatternSpecs may contain two one-step products, but this does not promote a general mixed two-step operation family. Each option is independently evaluated and then compared.

## Eight-stage validator

1. identity and schema;
2. lifecycle and approved scope;
3. representation and numeric boundary;
4. equation and answer correctness;
5. semantic quantity roles;
6. unit, classifier and natural-language quality;
7. estimation/comparison specialized rules;
8. final public contract and no fallback.

The validator contract defines 44 blocking codes and three post-pass warnings. Any blocking error returns no question. Numeric fallback is forbidden.

## Mandatory S58A1 FullFix transfer

S58C/S58D must implement these frozen directives:

- use `每段長…`, not `每段剪成…`;
- generate natural score-event phrases such as `投進一球`, `答對一題`, `完成一關`;
- pair score-event verbs and answer classifiers;
- explicitly state same total price, keep dimensions comparable, avoid ties, and produce one unique winner.

## Implementation sequence

```text
S58C materialize 6 groups and 24 PatternSpecs
→ S58D implement hidden deterministic semantic generator with ≥72 variants
→ S58E implement blocking validator runtime and human readback FullFix
→ later promotion, resolver, worksheet, renderer and public UI gates
```

## Acceptance criteria for S58B

```text
PatternGroup design count = 6
PatternSpec design count = 24
answer model count = 3
validator stage count = 8
blocking code count = 44
vertical representation count = 0
public numeric mode count = 0
G3B-U04-style general two-step family count = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_G3B_U08_24_FAMILY_HUMAN_READBACK_FROZEN_READY_FOR_PATTERNSPEC_DESIGN
GOAL_DISTANCE_AFTER  = D2_G3B_U08_FORMALMAPPING_PATTERNSPEC_AND_VALIDATOR_CONTRACT_READY_FOR_MATERIALIZATION
DISTANCE_REDUCED     = converted the frozen six-KP/24-family plan into implementation-ready FormalMapping, PatternSpec, answer-model and eight-stage validator contracts
REMAINING_BLOCKERS   = [
  "24 PatternSpecs and six PatternGroups are not materialized",
  "hidden deterministic generator is not implemented",
  "blocking validator runtime is not implemented",
  "public selector and worksheet paths remain unchanged"
]
NEXT_SHORTEST_STEP   = S58C_G3B_U08_FormalMappingAndPatternSpecMaterialization
```
