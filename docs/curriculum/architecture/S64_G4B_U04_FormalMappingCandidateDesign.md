# S64 — G4B-U04 FormalMapping Candidate Design

```text
TASK = S64_G4B_U04_FormalMappingCandidateDesign
STATUS = PASS_DESIGN_PENDING_CI
SOURCE_ID = g4b_u04_4b04
KNOWLEDGE_POINTS = 12
PATTERN_GROUP_CANDIDATES = 12
FORMAL_MAPPING_CANDIDATES = 17
```

## 1. Scope

S64 translates the 12 S63-approved KnowledgePoint boundaries into candidate mappings that can later become PatternSpecs.

```text
S63 KnowledgePoint boundary
→ PatternGroup candidate
→ FormalMapping candidate
→ answer-model candidate
→ validator-rule candidate
```

This task is design-only. It does not materialize FormalMapping, create PatternSpecs, implement a generator or validator, expose selectors, or authorize production use.

## 2. Canonical parent and global boundary

All mappings remain under:

```text
canonicalSkillParent = rounding_approximation
```

Candidate numeric boundary:

```text
input = nonnegative integer, 0..99,999,999
target place units = 10 / 100 / 1,000 / 10,000
context group sizes = 10 / 100 / 1,000
multiplication factor or divisor = 2..9
maximum candidate answer = 999,999,999
decimal input = forbidden
negative answer = forbidden
generic fallback = forbidden
```

## 3. Formal rules

```text
unconditional down = floor(value / unit) × unit
unconditional up   = ceil(value / unit) × unit
round half up      = floor((value + unit/2) / unit) × unit
maximum full groups = floor(total / groupSize)
minimum required groups = ceil(total / groupSize)
minimum payment amount = ceil(price / denomination) × denomination
minimum banknote count = ceil(price / denomination)
```

For integer half-up inverse reasoning:

```text
rounded result y at unit u
possible source interval = [y - u/2, y + u/2 - 1]
```

## 4. Mapping plan

| KnowledgePoint | PatternGroup candidate | Mapping candidates |
|---|---|---:|
| Approximation language cues | `pgc_g4b_u04_approximation_language` | 1 |
| Approximation symbol and reading | `pgc_g4b_u04_approximation_symbol` | 1 |
| Three-method comparison | `pgc_g4b_u04_method_comparison` | 2 |
| Unconditional round down | `pgc_g4b_u04_round_down` | 1 |
| Unconditional round up | `pgc_g4b_u04_round_up` | 1 |
| Round half up by place | `pgc_g4b_u04_round_half_up` | 1 |
| Context floor / ceiling | `pgc_g4b_u04_context_floor_ceiling` | 2 |
| Payment denomination ceiling | `pgc_g4b_u04_payment_ceiling` | 2 |
| Round then add / subtract | `pgc_g4b_u04_estimate_add_subtract` | 2 |
| Round then multiply / divide | `pgc_g4b_u04_estimate_multiply_divide` | 2 |
| Inverse unknown digit set | `pgc_g4b_u04_inverse_digit_set` | 1 |
| Inverse possible originals | `pgc_g4b_u04_inverse_original_values` | 1 |

Total:

```text
12 PatternGroup candidates
17 FormalMapping candidates
```

## 5. Why five KnowledgePoints split into two mappings

### Method comparison

```text
compute all three outputs
≠
identify the method from a shown result
```

The second form requires a unique-method generation guard because different methods can coincide when the value is already a multiple of the target unit.

### Context floor / ceiling

```text
maximum complete groups → floor
minimum required groups or periods → ceiling
```

These use opposite quotient-remainder semantics and must not share one underspecified mapping.

### Payment

```text
minimum payable amount
≠
minimum banknote count
```

The first returns money; the second returns a count and must prove that one fewer note is insufficient.

### Operation estimation

Add, subtract, multiply and divide remain separate mapping candidates because their operand constraints and validator hooks differ. Subtraction must stay nonnegative; division must generate an integer estimated quotient.

## 6. Answer-model candidates

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

The two inverse mappings remain distinct:

```text
unknown digit → exact set of digits 0..9
possible original value → constrained set / interval of full integers
```

## 7. Implementation classes

At mapping level:

```text
Class C deterministic candidates = 9
Class D controlled semantic-template candidates = 8
```

Class C includes concepts, direct numeric rounding and inverse constraints. Class D includes packaging / saving / payment contexts and round-then-operate application mappings.

These are feasibility candidates only, not support or production declarations.

## 8. Source evidence

Every mapping candidate includes one or more S62 visual evidence references using:

```text
s62:p<page>:<panel>
```

The recorded PDF header URL mismatch remains non-blocking. Source identity remains `g4b_u04_4b04` because the uploaded filename, title and curriculum assignment agree on G4B-U04. The uploaded PDF remains the source authority; OCR is not authoritative.

## 9. Data artifact

```text
data/curriculum/mapping/g4b_u04_formal_mapping_candidates.json
```

The artifact contains:

- 12 KnowledgePoint-to-PatternGroup candidate mappings;
- 17 candidate mappings with proposed future PatternSpec IDs;
- source evidence, answer model and validator-rule candidates;
- global numeric and semantic boundaries;
- an explicit candidate-only lifecycle.

## 10. Acceptance gate

```text
KnowledgePoints covered exactly once at mapping-index level = 12 / 12
PatternGroup candidate IDs unique = 12
FormalMapping candidate IDs unique = 17
Proposed PatternSpec IDs unique = 17
Class C mapping candidates = 9
Class D mapping candidates = 8
Answer-model candidates = 9
All mappings source-evidenced = true
All mappings candidate-only = true
FormalMapping materialized = false
PatternSpecs created = false
Generator implemented = false
Validator implemented = false
Production use = forbidden
```

## 11. Distance and next step

```text
GOAL_DISTANCE_BEFORE = D3_G4B_U04_12_KNOWLEDGE_POINT_BOUNDARIES_QA_LOCKED
GOAL_DISTANCE_AFTER  = D3_G4B_U04_17_FORMAL_MAPPING_CANDIDATES_DESIGNED
DISTANCE_REDUCED     = Converted all 12 approved KnowledgePoints into 12 PatternGroup and 17 source-evidenced FormalMapping candidates with deterministic formulas, answer shapes and validator guards.
REMAINING_BLOCKERS   = [
  "FormalMapping candidate QA and formula mutation review",
  "PatternSpec contract not materialized",
  "generator and validator not implemented"
]
NEXT_SHORTEST_STEP   = S65_G4B_U04_FormalMappingCandidateQA
```
