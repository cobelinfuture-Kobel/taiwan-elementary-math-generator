# S59B — G4B-U01 Tag Registry, FormalMapping and Boundary Design

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign
TASK_STATUS = DESIGN_CONTRACT
OUTPUT = one authoritative tag, FormalMapping, numeric-boundary and validator-contract artifact
```

## Scope

S59B consumes the accepted S59A contract and defines the full deterministic design boundary for all 9 public KnowledgePoints and 12 candidate PatternSpecs. It does not materialize PatternSpecs or change runtime behavior.

```text
REPRESENTATION = horizontal_only
APPLICATION_PROBLEMS = forbidden_in_core
VERTICAL_ALGORITHM = evidence_only
MISSING_DIGIT = deferred_extension
NUMBER_DOMAIN = positive safe integers
MAXIMUM_FINAL_VALUE = 9,999,999
GENERIC_FALLBACK = forbidden
```

## Canonical tags

```text
canonicalSkillTags:
- multi_digit_multiplication
- multi_digit_division

answerModels:
- numericAnswer
- quotientRemainderAnswer

representationTags:
- horizontal_expression
- numeric_answer_blank
- quotient_remainder_answer_blank
```

The complete subskill and difficulty tag registry is stored in:

```text
data/curriculum/contracts/S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign.json
```

## FormalMapping summary

| PatternSpec | Core boundary | Answer model |
|---|---|---|
| `ps_g4b_u01_3digit_by_3digit` | 3-digit × 3-digit | `numericAnswer` |
| `ps_g4b_u01_4digit_by_3digit` | 4-digit × 3-digit; result ≤ 9,999,999 | `numericAnswer` |
| `ps_g4b_u01_multiplier_internal_zero` | multiplier has internal zero and nonzero leading/ones digits | `numericAnswer` |
| `ps_g4b_u01_multiplier_trailing_zero` | only multiplier has 1–3 trailing zeros | `numericAnswer` |
| `ps_g4b_u01_multiplicand_trailing_zero` | only multiplicand has 1–3 trailing zeros | `numericAnswer` |
| `ps_g4b_u01_both_factors_trailing_zero` | both factors have trailing zeros | `numericAnswer` |
| `ps_g4b_u01_power10_multiplication` | base product × 10^n | `numericAnswer` |
| `ps_g4b_u01_3digit_div_3digit` | quotient 1–9; remainder 0..divisor−1 | `quotientRemainderAnswer` |
| `ps_g4b_u01_4digit_div_3digit_2digit_quotient` | quotient 10–99 | `quotientRemainderAnswer` |
| `ps_g4b_u01_4digit_div_3digit_1digit_quotient` | quotient 1–9 | `quotientRemainderAnswer` |
| `ps_g4b_u01_trailing_zero_division_exact` | common trailing-zero reduction; remainder 0 | `numericAnswer` |
| `ps_g4b_u01_trailing_zero_division_remainder_restore` | reduced remainder > 0 and restored by 10^k | `quotientRemainderAnswer` |

## Division invariants

Every division question must satisfy:

```text
dividend = divisor × quotient + remainder
0 ≤ remainder < original divisor
quotient digit count matches PatternSpec
```

For remainder restoration:

```text
commonZeroCount = k
reducedRemainder > 0
originalRemainder = reducedRemainder × 10^k
```

A reduced remainder must never be shown as the original remainder.

## Multiplication zero policies

```text
internal-zero:
- zero occurs between leading and ones digits
- leading digit != 0
- ones digit != 0

trailing-zero role variants:
- multiplier only
- multiplicand only
- both factors
- base product scaled by powers of ten
```

Each role is a separate PatternSpec so the generator and validator can audit exact family coverage.

## Validator contract

S59B defines 24 future blocking codes covering:

- identity and public scope;
- horizontal-only representation;
- operand and digit boundaries;
- multiplication result correctness;
- internal/trailing-zero placement;
- division identity, quotient digits and remainder bounds;
- exact-division and required-remainder policies;
- common-zero reduction and remainder restoration;
- answer model and no-fallback enforcement.

Two warnings remain nonblocking:

```text
G4B_U01_REPEATED_SIGNATURE_WARNING
G4B_U01_LOW_CARRY_COMPLEXITY_WARNING
```

## Acceptance target

```text
knowledgePointMappingCount = 9
formalMappingCount = 12
plannedBlockingCodeCount = 24
warningCodeCount = 2
allMappingsDeterministic = true
applicationProblems = 0
verticalPublicPatterns = 0
```

## Distance update

```text
GOAL_DISTANCE_BEFORE = D3_G4B_U01_HORIZONTAL_SOURCE_KP_CONTRACT_FROZEN
GOAL_DISTANCE_AFTER  = D2_G4B_U01_TAG_FORMAL_MAPPING_AND_BOUNDARIES_LOCKED
DISTANCE_REDUCED     = defined canonical tags, answer models, numeric boundaries, quotient/remainder policies and validator contracts for all 9 KPs and 12 candidate PatternSpecs
REMAINING_BLOCKERS   = ["PatternSpecs not materialized", "Generator and Validator runtime not implemented", "Selector, Worksheet, UI and print not connected"]
NEXT_SHORTEST_STEP   = S59C_G4B_U01_HiddenPatternSpecMaterialization
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
