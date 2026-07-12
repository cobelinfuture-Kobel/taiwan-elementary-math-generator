# S66 — G4B-U04 PatternSpec Contract Design

```text
TASK = S66_G4B_U04_PatternSpecContractDesign
STATUS = PASS_DESIGN_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## 1. Scope

S66 converts the 17 S65-approved FormalMapping candidates into implementation-ready PatternSpec contracts.

```text
S65 QA-locked FormalMapping candidate
→ final PatternGroup ID
→ final PatternSpec ID
→ input and generation contract
→ answer-model schema
→ controlled semantic template contract
→ future blocking-validator contract
```

This task is design-only. It does not materialize PatternGroups or PatternSpecs, implement a generator or validator, expose a selector, enable canonical routing, or authorize production use.

## 2. Contract artifact

```text
data/curriculum/contracts/S66_G4B_U04_PatternSpecContractDesign.json
```

The artifact contains:

```text
KnowledgePoints                 = 12
PatternGroups                   = 12
PatternSpec contracts           = 17
answer-model schemas            = 9
controlled template families    = 9
Class C contracts               = 9
Class D contracts               = 8
validator stages                = 8
blocking codes                  = 44
warnings                        = 3
```

## 3. Final PatternGroup and PatternSpec identity

S66 removes the candidate-only `pgc_` prefix and locks final future PatternGroup IDs using `pg_`.

| PatternGroup | KnowledgePoint | PatternSpecs |
|---|---|---:|
| `pg_g4b_u04_approximation_language` | 概數語意與精確數辨識 | 1 |
| `pg_g4b_u04_approximation_symbol` | 約等號與讀法 | 1 |
| `pg_g4b_u04_method_comparison` | 三種方法比較 | 2 |
| `pg_g4b_u04_round_down` | 無條件捨去 | 1 |
| `pg_g4b_u04_round_up` | 無條件進入 | 1 |
| `pg_g4b_u04_round_half_up` | 四捨五入 | 1 |
| `pg_g4b_u04_context_floor_ceiling` | 最多完整數量與最少需求 | 2 |
| `pg_g4b_u04_payment_ceiling` | 鈔票面額與足額付款 | 2 |
| `pg_g4b_u04_estimate_add_subtract` | 先取概數再加減 | 2 |
| `pg_g4b_u04_estimate_multiply_divide` | 先取概數再乘除 | 2 |
| `pg_g4b_u04_inverse_digit_set` | 推回未知數字 | 1 |
| `pg_g4b_u04_inverse_original_values` | 推回可能原數 | 1 |

All 17 PatternSpec IDs are the S64 proposed IDs accepted by S65.

## 4. PatternSpec modes

```text
concept              = 4
numeric              = 3
application          = 4
operation_estimation = 4
reasoning            = 2
```

### Concept contracts

```text
ps_g4b_u04_approx_language_classify
ps_g4b_u04_approx_symbol_reading
ps_g4b_u04_method_compare_outputs
ps_g4b_u04_method_identify_from_result
```

### Direct numeric contracts

```text
ps_g4b_u04_unconditional_round_down
ps_g4b_u04_unconditional_round_up
ps_g4b_u04_round_half_up
```

### Controlled application contracts

```text
ps_g4b_u04_floor_complete_groups
ps_g4b_u04_ceiling_minimum_required
ps_g4b_u04_payment_amount_ceiling
ps_g4b_u04_payment_banknote_count
```

### Round-then-operate contracts

```text
ps_g4b_u04_round_then_add
ps_g4b_u04_round_then_subtract
ps_g4b_u04_round_then_multiply
ps_g4b_u04_round_then_divide
```

### Inverse-reasoning contracts

```text
ps_g4b_u04_inverse_digit_set
ps_g4b_u04_inverse_original_values
```

## 5. Required PatternSpec fields

Every future PatternSpec must provide:

```text
patternSpecId
sourceMappingCandidateId
sourceId
unitCode
unitTitle
kind
patternGroupId
knowledgePointId
mode
equationShape
inputContract
generationContract
promptContract
answerModel
answerSchemaRef
validatorHooks
sourceEvidence
implementationClass
patternOrder
lifecycle
```

Fixed identity:

```text
sourceId = g4b_u04_4b04
unitCode = 4B-U04
unitTitle = 概數
kind = g4bU04RoundingApproximation
canonicalSkillParent = rounding_approximation
```

## 6. Numeric and formula boundary

```text
input range           = 0..99,999,999
target place units    = 10 / 100 / 1,000 / 10,000
context group sizes   = 10 / 100 / 1,000
payment denominations = 100 / 1,000
factor or divisor     = 2..9
maximum answer        = 999,999,999
integer only          = true
negative answer       = forbidden
```

Accepted formulas:

```text
unconditional down  = floor(v/u) × u
unconditional up    = ceil(v/u) × u
round half up       = floor((v+u/2)/u) × u
maximum full groups = floor(t/g)
minimum required    = ceil(t/g)
minimum payment     = ceil(p/d) × d
banknote count      = ceil(p/d)
inverse interval    = intersect([y-u/2,y+u/2-1], [0,maxInput])
```

## 7. Method-choice contract

`roundHalfUp` always shares its result with either unconditional down or unconditional up for the same value and target unit. Therefore the unique-choice PatternSpec must show only the opposite result.

```text
inputNotMultipleOfUnit = true
shownResultMatchesExactlyOneMethod = true
shownResultDiffersFromHalfUpOutput = true
```

The answer enum is deliberately limited to:

```text
unconditional_down
unconditional_up
```

A unique `round_half_up` answer is impossible under this question shape.

## 8. Answer-model schemas

S66 materializes design schemas for all nine answer models:

```text
classificationAnswer
symbolReadingAnswer
methodComparisonAnswer
methodChoiceAnswer
numericAnswer
moneyAmountAnswer
banknoteCountAnswer
digitSetAnswer
possibleValuesAnswer
```

Important shape locks:

```text
moneyAmountAnswer:
  amount + currency=TWD + unitLabel=元

banknoteCountAnswer:
  count + denomination in [100,1000] + currency=TWD + unitLabel=張

digitSetAnswer:
  sorted unique nonempty digits 0..9

possibleValuesAnswer:
  explicit sorted unique nonempty integer values
  maximum 100 values
  interval-only output is forbidden when a digit mask is present
```

## 9. Controlled semantic templates

All eight Class D PatternSpecs forbid free-form AI generation and require allowlisted template families.

Nine source-backed template families are defined:

```text
packing — maximum complete groups
packing — minimum containers for all items
saving — minimum months
payment — minimum payable amount
payment — minimum banknote count
population — approximate total
population — approximate difference
recurring cost — approximate multiplication
equal share — approximate division
```

Every family locks:

```text
templateFamilyId
source mapping ownership
context domain
Traditional Chinese prompt skeleton
required semantic roles
answer-unit role
```

No generic semantic fallback is allowed.

## 10. Inverse-reasoning contracts

### One unknown digit

```text
placeholderCount = 1
enumerate digits = 0..9
visible digits preserved = true
leading zero forbidden = true
answer = sorted unique digitSetAnswer
```

### Possible original values

The source-backed base shape uses two contiguous unknown digits with visible digits before and after them.

```text
placeholderCount = 2
placeholdersContiguous = true
preimageClampedToInputRange = true
explicitValueListRequired = true
maximumSolutions = 100
answer = possibleValuesAnswer
```

## 11. Future validator contract

Validation mode:

```text
blocking_before_question_return
```

Eight stages:

```text
1. identity_and_schema
2. lifecycle_and_scope
3. integer_domain_and_boundary
4. formula_and_operation
5. answer_model
6. semantic_template_and_units
7. ambiguity_and_inverse
8. final_surface_contract
```

The contract freezes 44 unique blocking codes and three nonblocking warnings. Blocking coverage includes:

- identity and source-mapping drift;
- premature materialization, routing or production use;
- integer and numeric boundaries;
- rounding, floor, ceiling and payment formulas;
- round-then-operate correctness;
- method-choice ambiguity;
- inverse interval and solution completeness;
- answer-model mismatch;
- semantic-template and unit mismatch;
- unresolved placeholders, internal IDs and fallback leakage.

## 12. Lifecycle boundary

Every PatternSpec contract remains:

```text
contractStatus = designed_not_materialized
selectorVisibility = hidden
canonicalRouting = disabled
generatorStatus = not_implemented
validatorStatus = contract_only
productionUse = forbidden
```

Explicit scope state:

```text
FormalMapping materialized = false
PatternGroups materialized = false
PatternSpecs materialized = false
Generator implemented = false
Validator implemented = false
Public selector enabled = false
Canonical routing enabled = false
Production use = forbidden
```

## 13. Acceptance gate

```text
17 / 17 S65 mappings projected one-to-one
12 unique PatternGroups
17 unique PatternSpec contracts
9 answer-model schemas
9 controlled template families
9 Class C contracts
8 Class D contracts
8 validator stages
44 unique blocking codes
all PatternSpecs source-evidenced
all Class D PatternSpecs controlled-template only
no materialization or runtime activation
```

## 14. Distance and next step

```text
GOAL_DISTANCE_BEFORE = D2_G4B_U04_FORMAL_MAPPING_CANDIDATES_QA_LOCKED
GOAL_DISTANCE_AFTER  = D2_G4B_U04_PATTERNSPEC_AND_ANSWER_CONTRACTS_DESIGNED
DISTANCE_REDUCED     = Converted all 17 QA-accepted FormalMapping candidates into implementation-ready PatternSpec, answer-model, controlled semantic-template and validator contracts without materializing runtime artifacts.
REMAINING_BLOCKERS   = [
  "PatternSpec contract QA not completed",
  "PatternGroups and PatternSpecs not materialized",
  "generator and blocking validator not implemented"
]
NEXT_SHORTEST_STEP   = S67_G4B_U04_PatternSpecContractQA
STOP_REASON          = NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
