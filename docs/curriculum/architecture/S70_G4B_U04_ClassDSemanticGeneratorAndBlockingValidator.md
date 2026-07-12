# S70 — G4B-U04 Class D Semantic Generator and Blocking Validator

```text
TASK = S70_G4B_U04_ClassDSemanticGeneratorAndBlockingValidator
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## Scope

S70 consumes the S66 base contract, S67 higher-precedence QA overlay, S68 hidden authority and S69 shared rounding runtime. It implements deterministic controlled-semantic generation and blocking validation for the eight Class D PatternSpecs only.

```text
8 Class D PatternSpecs
→ 9 controlled template families
→ deterministic semantic role binding
→ formula and unit validation
→ batch zero-output gate
```

Public selectors, canonical routing, worksheet assembly, answer-key rendering and production promotion remain outside S70.

## Coverage

```text
application PatternSpecs          = 4
operation-estimation PatternSpecs = 4
Class D total                     = 8
controlled template families      = 9
answer models used                = 3
validator stages                  = 8
blocking-code registry            = 44
```

Covered PatternSpecs:

```text
ps_g4b_u04_floor_complete_groups
ps_g4b_u04_ceiling_minimum_required
ps_g4b_u04_payment_amount_ceiling
ps_g4b_u04_payment_banknote_count
ps_g4b_u04_round_then_add
ps_g4b_u04_round_then_subtract
ps_g4b_u04_round_then_multiply
ps_g4b_u04_round_then_divide
```

## Controlled semantic templates

The runtime implements all nine S67 allowlisted families:

```text
packing floor
packing ceiling
saving-period ceiling
minimum payment amount
minimum banknote count
population total estimation
population difference estimation
recurring-cost multiplication
shared-cost division
```

Every generated question carries:

```text
semanticTemplateId
templateFamilyIds
templateRoles
templateRoleBindings
context
input
derived
```

The validator requires:

```text
prompt = deterministic rendering of allowlisted template roles
placeholder keys = requiredRoles = roleBindings keys
mappingCandidateId = PatternSpec source mapping
```

Free-form AI and generic fallback are forbidden.

## Formula contract

```text
maximum complete groups = floor(total / groupSize)
minimum required groups = ceil(total / capacityOrIncrement)
minimum payment amount  = ceil(price / denomination) × denomination
minimum banknote count  = ceil(price / denomination)

estimated addition       = round(a) + round(b)
estimated difference     = abs(round(a) - round(b))
estimated product        = round(value) × factor
estimated quotient       = round(value) / divisor
```

Generation preserves nonzero remainders for floor, ceiling and payment tasks. Estimated division is generated only when the rounded value is divisible by the divisor.

## S67 prompt-visibility correction

The four operation-estimation templates expose:

```text
original value or operands
rounding method labels
target-place labels
factor or divisor where applicable
```

Derived-only prompts that reveal only pre-rounded values are not generated and are rejected by exact controlled-template validation.

## Answer models

```text
numericAnswer
moneyAmountAnswer
banknoteCountAnswer
```

All schemas are closed. Numeric semantic answers require a nonempty unit label.

## Blocking behavior

S70 preserves the exact S67 eight-stage / 44-code registry and actively enforces Class D-relevant rules:

- authority identity and traceability;
- hidden lifecycle and production prohibition;
- integer, unit, group-size, denomination and factor boundaries;
- floor/ceiling semantics;
- payment sufficiency and minimality;
- recomputation of rounded operands;
- nontrivial estimated subtraction;
- integer estimated division;
- exact template role bindings and deterministic rendering;
- closed answer models and unit classifiers;
- unresolved-placeholder, internal-ID and fallback rejection.

Any blocking error causes:

```text
acceptedQuestions = []
```

## Acceptance

Executable QA covers:

- exact 8/8 Class D PatternSpecs and 9/9 template families;
- deterministic rendering and role-binding parity;
- representative source formulas;
- original-input/method/place visibility for all four estimation patterns;
- deterministic balanced 1,000-question stress;
- exact 44-code and eight-stage registry;
- template, boundary, floor, ceiling, payment, estimation, unit and surface mutations;
- zero accepted batch output on any blocking error;
- explicit Class C and public-runtime rejection.

## Lifecycle boundary

```text
Class C runtime           = unchanged
Class D generator         = implemented_hidden
Class D blocking validator = implemented_hidden
selector visibility       = hidden
canonical routing         = disabled
worksheet eligible        = false
renderer connected        = false
production use            = forbidden
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_CLASS_C_GENERATOR_VALIDATOR_IMPLEMENTED_HIDDEN

GOAL_DISTANCE_AFTER =
D1_G4B_U04_CLASS_C_AND_D_RUNTIME_IMPLEMENTED_HIDDEN

DISTANCE_REDUCED =
Implemented deterministic controlled-semantic generation and blocking
validation for all eight Class D PatternSpecs and nine template families.

REMAINING_BLOCKERS = [
  "Class C and Class D integration gate not completed",
  "canonical resolver and public selector not connected",
  "worksheet, answer key and renderer path not connected"
]

NEXT_SHORTEST_STEP =
S71_G4B_U04_ClassCAndDIntegrationGate

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
