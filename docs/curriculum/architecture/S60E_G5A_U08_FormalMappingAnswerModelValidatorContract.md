# S60E — G5A-U08 FormalMapping, Answer Models and Validator Contract

```text
TASK = S60E_G5A_U08_FormalMappingAnswerModelValidatorContract
STATUS = FULLFIXED_BY_S60F_R1_PENDING_CI
FULLFIX_TASK = S60F_R1_G5A_U08_AverageReasoningModeConsistency_FullFix
```

## FormalMapping result

```text
PatternSpecs = 30
numeric = 16
reasoning = 5
application = 9
contextual reasoning = 2
KnowledgePoints = 11
PatternGroups = 17
TemplateFamilies = 10
```

All PatternSpecs remain hidden, canonical routing is disabled and production use is forbidden.

## Average reasoning mode FullFix

`ps_g5a_u08_app_average_inverse` and `ps_g5a_u08_app_average_update` belong to `pg_g5a_u08_average_reasoning`. Their canonical mode is therefore `reasoning`, not `application`.

Both remain contextual reasoning items and preserve `tf_g5a_u08_average_inverse_or_update`. The mode contract now explicitly permits a reasoning PatternSpec to carry a TemplateFamily only when `contextualReasoning = true`.

The FormalMapping test now verifies every PatternSpec against its registered PatternGroup mode, preventing the original upstream mismatch from recurring.

## Answer models

Core:

- `numericAnswer`
- `expressionAnswer`
- `operatorSequenceAnswer`
- `equalityJudgementAnswer`
- `averageInverseAnswer`
- `allocationTransferAnswer`

Nonblocking S60X1 challenge extension:

- `missingValueAnswer`
- `blankEquationAnswer`

Expression validation uses canonical structure and exact integer evaluation rather than literal string equality.

## Mathematical guards

- subtraction is not treated as associative;
- division is neither associative nor commutative;
- continuous division may normalize only as `a÷b÷c = a÷(b×c)`;
- a numerically coincidental expression is rejected when its semantic model is invalid;
- source panels requiring one expression must use every required fact exactly once;
- operator inference must have one unique operator sequence;
- averages, inverse values, population updates and transfer results must remain integral and unique.

## Validator contract

```text
blocking errors = 36
warnings = 3
validation stages = 6
required negative mutations = 20
zero output on blocking error = true
generic fallback = forbidden
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_TEMPLATE_SDG_CONTRACT_FROZEN_FORMAL_RUNTIME_CONTRACT_UNDEFINED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_30_PATTERN_FORMAL_MAPPING_AND_VALIDATOR_CONTRACT_FROZEN
DISTANCE_REDUCED     = Thirty deterministic PatternSpec candidates have explicit identity, answer, boundary, semantic and validation contracts; average inverse/update now match their reasoning group.
REMAINING_BLOCKERS   = [
  "PatternSpecs require S60F CI and merge",
  "Generators and validators are not implemented",
  "Promotion, UI, worksheet and print are pending"
]
NEXT_SHORTEST_STEP = S60F_G5A_U08_HiddenPatternSpecMaterialization
```
