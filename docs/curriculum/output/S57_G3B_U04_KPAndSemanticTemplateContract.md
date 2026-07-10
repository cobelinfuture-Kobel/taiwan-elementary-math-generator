# S57 — G3B-U04 KnowledgePoint and Semantic Template Contract

```text
CURRENT_MAJOR_TASK = S57_G3B_U04_KPAndSemanticTemplateContract
CURRENT_SUBTASK = S57A_SourceFieldKPMapping_S57B_TemplateRegistry_S57C_SemanticValidationContract
TASK_STATUS = IMPLEMENTED_PENDING_CI_READBACK
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

In scope:

```text
- Map all 18 visually reviewed PDF source fields to canonical KnowledgePoints.
- Replace the old 12-row candidate classification with 9 mathematical KnowledgePoints.
- Register at least 27 genuinely different semantic template families.
- Make semantic failures blocking rather than numeric-only warnings.
- Add structural tests for mappings, families, and semantic contracts.
```

Out of scope:

```text
- Runtime generator implementation.
- Runtime semantic validator implementation.
- Browser projection or selector changes.
- Worksheet or PDF generation changes.
- Production-use promotion.
- Other Batch A units.
```

The historical S43E6 artifact is preserved. S57 supersedes its candidate classification without rewriting the prior record.

## 2. Source Readback

The authority PDF contains 18 visible fields across two pages.

```text
page 1 fields = 10
page 2 fields = 8
source fields mapped = 18 / 18
```

One source heading mismatch is recorded as authoritative evidence:

```text
source field = g3b_u04_p1_r2_r
printed heading = 先加→再除
actual equation = (87×2)÷3
canonical mapping = 先乘再除：促銷實付總價後求平均單價
```

The known mismatch cannot be silently mapped to addition-then-division.

## 3. Approved KnowledgePoints

```text
1. kp_g3b_u04_add_then_divide
2. kp_g3b_u04_multiply_then_divide_average_unit_price
3. kp_g3b_u04_subtract_then_divide
4. kp_g3b_u04_divide_then_add
5. kp_g3b_u04_total_minus_shared_amount
6. kp_g3b_u04_group_total_minus_remaining
7. kp_g3b_u04_consecutive_multiplication
8. kp_g3b_u04_composite_multiplicative_ratio
9. kp_g3b_u04_multiplicative_quantity_chain
```

The old `divide_then_subtract` candidate is split because the PDF contains two different role structures:

```text
a-(b÷c) = personal initial amount minus personal equal share
(a÷b)-c = total group count minus remaining group count
```

These cannot share one semantic answer model.

## 4. Context and Representation Normalization

Five former S43E6 candidate rows are no longer treated as mathematical KnowledgePoints:

```text
line_segment_two_step_word_problem       → representation_tag:line_segment_model
equal_sharing_then_add_subtract          → context_tag:equal_sharing
packaging_then_add_subtract              → context_tag:packaging
multiplication_context_rows_boxes_groups → context_tags:rows|boxes|groups
multi_layer_multiplicative_reasoning     → difficulty_tag:multi_layer_relation
```

This prevents the same operation structure from being duplicated merely because the story uses a different object, package, or diagram.

## 5. Semantic Template Family Registry

```text
approved minimum = 27
implemented families = 32
minimum gate = PASS
```

Coverage:

| KnowledgePoint | Families |
|---|---:|
| add then divide | 5 |
| multiply then divide average unit price | 3 |
| subtract then divide | 4 |
| divide then add | 3 |
| personal total minus shared amount | 3 |
| total groups minus remaining groups | 3 |
| consecutive multiplication | 4 |
| composite multiplicative ratio | 3 |
| multiplicative quantity chain | 4 |

A different semantic family requires a different event causality, unknown role, quantity-role binding, unit flow, or student semantic decision. Names, nouns, numbers, and surface wording alone do not create a new family.

## 6. Blocking Semantic Contract

```text
validation stages = 8
blocking error codes = 25
style warning codes = 3
semantic failure policy = BLOCK
numeric-answer-only acceptance = FORBIDDEN
implausible-but-arithmetically-valid acceptance = FORBIDDEN
```

The eight validation stages are:

```text
1. structure
2. role binding
3. arithmetic
4. unit flow
5. event semantics
6. real-world plausibility
7. language readback
8. deterministic answer reconstruction
```

Blocking classes include:

```text
- equation / KnowledgePoint mismatch
- wrong unknown role
- missing or duplicated quantity roles
- actor ownership mismatch
- event-order mismatch
- unit-flow or answer-unit mismatch
- non-exact division
- promotion inconsistency
- quantity conservation failure
- reversed multiplicative comparison
- implausible age, package, container, or object action
- ambiguous referent or multiple unknowns
- semantic answer reconstruction failure
- fake new template family created by noun or wording substitution only
```

## 7. Artifacts

```text
data/curriculum/mapping/S57_G3B_U04_SourceFieldKnowledgePointMapping.json
data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json
data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json
tests/curriculum/g3b-u04-semantic-contract.test.js
docs/curriculum/output/S57_G3B_U04_KPAndSemanticTemplateContract.md
```

## 8. Gate Metrics

```text
18 source fields mapped = PASS
9 unique KnowledgePoints = PASS
minimum 27 semantic families = PASS (32)
all source-field template references resolve = PASS
all template KnowledgePoint references resolve = PASS
source heading mismatch isolated = PASS
former context rows normalized to tags = PASS
semantic errors configured as blocking = PASS
runtime / browser projection unchanged = PASS
```

## 9. Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_G3B_U04_SOURCE_FIELDS_AND_OLD_CANDIDATE_OVERLAY
GOAL_DISTANCE_AFTER  = D2_G3B_U04_FORMAL_KP_MAPPING_TEMPLATE_AND_SEMANTIC_VALIDATION_CONTRACT
DISTANCE_REDUCED     = source fields are formally mapped to nine KPs, 32 semantic families, and a blocking semantic validation contract
REMAINING_BLOCKERS   = [
  "PatternSpec rows are not materialized",
  "runtime application generator is not implemented",
  "runtime semantic validator is not implemented",
  "HTML worksheet and PDF smoke are not run"
]
NEXT_SHORTEST_STEP = S57D_G3B_U04_PatternSpecAndSemanticGeneratorImplementation_DesignScan
```

## 10. Closeout State

```text
S57_STATUS = IMPLEMENTED_PENDING_CI_READBACK
PUBLIC_RELEASE_GATE = NOT_REQUIRED
AUTO_CONTINUE_DECISION = WAIT_FOR_CI_READBACK
```
