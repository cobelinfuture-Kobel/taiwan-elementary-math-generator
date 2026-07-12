# S60E — G5A-U08 FormalMapping, Answer Models and Validator Contract

```text
TASK = S60E_G5A_U08_FormalMappingAnswerModelValidatorContract
STATUS = IMPLEMENTED_PENDING_CI
```

## FormalMapping result

```text
PatternSpecs = 30
numeric = 16
reasoning = 3
application = 11
KnowledgePoints = 11
PatternGroups = 17
TemplateFamilies = 10
```

All PatternSpecs remain hidden, canonical routing is disabled and production use is forbidden.

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
DISTANCE_REDUCED     = Thirty deterministic PatternSpec candidates now have explicit identity, answer, boundary, semantic and validation contracts.
REMAINING_BLOCKERS   = [
  "PatternSpecs are not materialized into authority and projection",
  "Generators and validators are not implemented",
  "Promotion, UI, worksheet and print are pending"
]
NEXT_SHORTEST_STEP = S60F_G5A_U08_HiddenPatternSpecMaterialization
```
