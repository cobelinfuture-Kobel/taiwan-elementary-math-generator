# S43F6 — GeneratorValidatorReadbackQA

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F6_GeneratorValidatorReadbackQA
TASK_STATUS = PASS_READBACK_QA
```

## Readback Scope

```text
S43F1 DesignScan = PASS
S43F2 MaterializationPlan = PASS
S43F3 PatternSpecMaterialization = PASS
S43F4 GeneratorSupportExpansion = PASS
S43F5 ValidatorSupportExpansion = PASS
```

## Alpha PatternSpec Readback

```text
ALPHA_PATTERN_SPEC_COUNT = 5
```

```text
ps_g4a_u01_within_100million_compare
ps_g4a_u02_3digit_by_2digit
ps_g4a_u04_3digit_by_2digit_exact
ps_g4a_u08_add_sub_three_terms
ps_g5a_u08_left_to_right_add_sub
```

## Generator / Validator Readback

```text
GENERATOR_SUPPORTED_PATTERN_SPEC_COUNT = 5
VALIDATOR_SUPPORTED_PATTERN_SPEC_COUNT = 5
```

## Projection and Runtime Safety

```text
RUNTIME_CODE_CHANGED = false
BROWSER_PROJECTION_CHANGED = false
MIXED_KP_MODE_CHANGED = false
NPM_TEST = NOT_RUN_THIS_STEP
REASON = contract and registry artifacts only; no runtime source files changed
```

## Gate

```text
S43F6_GATE = PASS_READBACK_QA
S43F_STATUS = PASS_ALPHA_CONTRACT_GENERATOR_VALIDATOR_MAPPING
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43E_COMPLETE_BUT_GENERATOR_VALIDATOR_NOT_STARTED
GOAL_DISTANCE_AFTER  = D1_S43F_ALPHA_GENERATOR_VALIDATOR_CONTRACT_READY
DISTANCE_REDUCED     = completed first bounded generator/validator expansion contract for 5 B-class PatternSpecs
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "S43F Alpha contracts are not browser-projected",
  "Runtime source-pattern-index was not updated in this contract step",
  "C-class generator and validator models are still blocked",
  "D-class rows remain not_selectable",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43F7_RuntimeProjectionDecisionGate
```

## Closeout

```text
TASK = S43F6_GeneratorValidatorReadbackQA
STATUS = PASS_READBACK_QA
GOAL_DISTANCE_UPDATED = YES
NEXT = S43F7_RuntimeProjectionDecisionGate
```
