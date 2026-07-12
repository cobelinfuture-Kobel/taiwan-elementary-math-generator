# S69 — G4B-U04 Class C Generator and Blocking Validator

```text
TASK = S69_G4B_U04_ClassCGeneratorAndBlockingValidator
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## Scope

S69 consumes the S68 authoritative hidden materialization and implements deterministic generation plus blocking validation for the nine Class C PatternSpecs only.

```text
S68 hidden PatternSpecs
→ deterministic Class C generator
→ eight-stage blocking validator
→ batch zero-output gate
```

Class D contextual generation, public selectors, canonical resolver routing, worksheet assembly, renderer integration and production promotion remain outside S69.

## Runtime coverage

```text
concept PatternSpecs   = 4
numeric PatternSpecs   = 3
reasoning PatternSpecs = 2
--------------------------
Class C total          = 9
```

Covered PatternSpecs:

```text
ps_g4b_u04_approx_language_classify
ps_g4b_u04_approx_symbol_reading
ps_g4b_u04_method_compare_outputs
ps_g4b_u04_method_identify_from_result
ps_g4b_u04_unconditional_round_down
ps_g4b_u04_unconditional_round_up
ps_g4b_u04_round_half_up
ps_g4b_u04_inverse_digit_set
ps_g4b_u04_inverse_original_values
```

## Generator contract

The generator provides:

- deterministic seed replay;
- exact question counts from 1 through 1000;
- balanced PatternSpec allocation;
- grouped and deterministic shuffled ordering;
- source-backed approximation cues and symbol readings;
- unique method-choice generation that never shares the shown result with round-half-up;
- direct down, up and half-up formulas;
- source-grammar inverse digit masks;
- explicit complete inverse solution sets;
- deeply frozen question and batch outputs;
- no generic fallback.

## Validator contract

The blocking validator exports the exact S67 registry:

```text
validator stages = 8
blocking codes   = 44
```

Stage code counts:

```text
identity_and_schema              8
lifecycle_and_scope              3
integer_domain_and_boundary      7
formula_and_operation           14
answer_model                     2
semantic_template_and_units      3
ambiguity_and_inverse            5
final_surface_contract           2
----------------------------------
total                           44
```

S69 actively validates all Class C-relevant identity, lifecycle, domain, formula, closed-answer-schema, ambiguity, inverse-mask, complete-solution-set and public-surface rules. Class D-only codes remain reserved for S70 while retaining exact registry parity.

Any blocking error causes the batch gate to return:

```text
acceptedQuestions = []
```

## Effective contract

Every runtime consumer must preserve:

```text
S66 base contract
→ S67 higher-precedence QA overlay
→ S68 hidden materialization authority
→ S69 Class C runtime
```

## Lifecycle boundary

```text
Class C generator         = implemented_hidden
Class C blocking validator = implemented_hidden
Class D generator         = not implemented
Class D semantic validator = not implemented
selector visibility       = hidden
canonical routing         = disabled
worksheet eligible        = false
production use            = forbidden
```

## Acceptance

Executable QA verifies:

- exact 9/9 Class C authority coverage;
- all seven used answer-model shapes;
- source examples and 649/650 threshold behavior;
- 200 unique method-choice samples;
- source-grammar inverse masks and complete answer sets;
- deterministic balanced 1000-question stress;
- exact 44-code and eight-stage registry;
- identity, boundary, formula, ambiguity, inverse, placeholder, internal-ID and fallback mutations;
- zero accepted output on any batch blocking error;
- explicit Class D rejection and production prohibition.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_FORMAL_MAPPING_AND_HIDDEN_PATTERNSPECS_MATERIALIZED

GOAL_DISTANCE_AFTER =
D1_G4B_U04_CLASS_C_GENERATOR_VALIDATOR_IMPLEMENTED_HIDDEN

DISTANCE_REDUCED =
Enabled deterministic generation and blocking validation for all nine
non-contextual Class C PatternSpecs while retaining hidden lifecycle.

REMAINING_BLOCKERS = [
  "Class D semantic generator and blocking validator not implemented",
  "canonical resolver and public selector not connected",
  "worksheet, answer key and renderer path not connected"
]

NEXT_SHORTEST_STEP =
S70_G4B_U04_ClassDSemanticGeneratorAndBlockingValidator

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
