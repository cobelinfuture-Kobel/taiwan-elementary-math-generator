# PBL Task Set SOP V1

```text
CONTRACT_ID = PBL_TASK_SET_SOP_V1
PARENT_CONTRACT = APPLICATION_PROBLEM_SOP_V1
MILESTONE = APP-SOP-A03_PBLTaskSetDependencyMilestoneAndFinalProductContract
STATUS = SCHEMA_CONTRACT_DRAFT_LOCKED_FOR_REVIEW
RUNTIME_CHANGE = false
QUESTION_CONTENT_ADDED = false
PRODUCTION_ADMISSION_CHANGED = false
```

## 1. Purpose

This SOP defines a PBL mathematics task set as a complete real-world problem-solving chain. It prevents a shared story with several unrelated exercises from being mislabeled as PBL.

A valid PBL task set contains:

```text
one driving problem
3–5 dependent tasks
necessary intermediate milestones
constraint-based synthesis
one usable final product or decision
```

## 2. Difference from a single application item

```text
Single application item:
one primary target, no cross-question dependency graph.

PBL task set:
one driving problem, multiple dependent tasks, milestone reuse,
final decision or product resolves the original problem.
```

A long single item is not automatically PBL. Several independent questions are not PBL.

## 3. Driving-problem contract

Required fields:

```text
stakeholder
realWorldGoal
problemStatement
constraints
successCriteria
consequenceOfIncorrectDecision
finalProductType
```

The driving problem must be meaningful without mentioning worksheet mechanics. It must describe a real task someone could act on.

Invalid:

```text
Answer questions 1 to 5 about division.
```

Valid structure:

```text
Plan how to package and transport all usable donated supplies
without exceeding box or vehicle capacity.
```

## 4. Mathematical authority

One `primaryKnowledgePointId` must be declared. Supporting KnowledgePoints are prerequisites or secondary tools.

```text
primaryKnowledgePointId
supportingKnowledgePointIds
canonicalOperationModelIds
applicationCapabilityIds
```

The PBL context may not invent unsupported operations, units, or relationships.

## 5. Allowed dependency graph types

### `PBL3_LINEAR`

```text
Q1 → Q2 → Q3
```

Use when one derived quantity flows through all later tasks.

### `PBL4_BRANCH_MERGE`

```text
Q1 → Q2
Q1 → Q3
Q2 + Q3 → Q4
```

Use when two options or constraint calculations merge into one decision.

### `PBL5_BOUNDED_DECISION`

```text
Q1 interpret data
→ Q2 establish required quantity
→ Q3 calculate option or resource
→ Q4 compare constraints
→ Q5 decide and justify
```

No other graph type is admitted in V1.

## 6. Task-node contract

Each task node requires:

```text
taskId
sequenceIndex
promptZh
inputRefs
outputMilestoneId
knowledgePointIds
operationModelIds
numericWitnessContract
interpretationWitnessContract
```

Task count must be between 3 and 5.

Every non-initial task must consume at least one previous milestone through `inputRefs`.

## 7. Milestone contract

A milestone is a necessary derived quantity, comparison, or decision state.

Required:

```text
milestoneId
producerTaskId
semanticRole
valueType
unit
requiredByTaskIds
canonicalReconstruction
```

Rules:

- every non-final milestone must be consumed later;
- later prompts may not directly reveal a milestone value;
- a milestone may be consumed by one or more tasks;
- orphan milestones are forbidden;
- missing required milestones block the final decision.

## 8. Dependency closure

The dependency graph must satisfy:

```text
all task IDs unique
all milestone IDs unique
all inputRefs resolve
all requiredByTaskIds resolve
no forward reference to an unproduced milestone
no cycles
one final task
all required paths reach the final task
```

A graph that passes arithmetic validation but fails dependency closure is rejected.

## 9. Final-product contract

Allowed V1 final products:

```text
ALLOCATION_PLAN
PURCHASE_DECISION
BUDGET_RECOMMENDATION
TRANSPORT_PLAN
PACKAGING_PLAN
SCHEDULE
COMPARISON_REPORT
RESOURCE_PLAN
```

Required final output:

```text
finalProductType
finalTaskId
requiredMilestoneIds
decisionOrProductModel
decisionWitness
constraintSatisfactionChecks
```

The final task must consume at least two prior milestones for `PBL4_BRANCH_MERGE` and `PBL5_BOUNDED_DECISION`.

## 10. Decision witness

The final response must show why the proposed product satisfies the real-world constraints.

A decision witness must include:

```text
selectedDecisionOrPlan
supportingMilestoneIds
constraintChecks
shortJustification
```

A raw number without a usable conclusion is not a final PBL product.

## 11. Context authenticity

The context must change what a valid decision means.

Required authenticity checks:

```text
contextNecessaryForDecision = true
removingContextDestroysTaskMeaning = true
finalProductUsableInContext = true
constraintsAreEventRealistic = true
```

Decorative noun substitution fails authenticity validation.

## 12. Interpretation and N+1 visibility

The primary PBL capability must expose at least one interpretation or decision behavior. Numeric computation alone is insufficient.

Required:

```text
primaryInterpretiveAct
interpretationWitnessTaskIds
calculationPassInterpretationFailModelExists = true
```

The primary capability may be N or N+1 depending on the admitted capability graph. The PBL format itself does not automatically make the content N+1.

## 13. Misconception models

At least three misconception models are required across the task set.

They must cover, when applicable:

```text
incorrect quantity-role mapping
correct arithmetic but wrong context interpretation
broken dependency or reused wrong milestone
constraint ignored in final decision
wrong answer unit or final-product role
```

Each misconception identifies the earliest task where the error can be detected.

## 14. Counterfactual variant

At least one context constraint must be changed while preserving the main numeric domain.

Required:

```text
changedConstraint
expectedAffectedTaskIds
expectedMilestoneChanges
expectedFinalProductChange
```

The variant must produce the predicted downstream change. If the final product remains unchanged despite a decisive constraint change, the task set fails semantic validation.

## 15. Validation layers

PBL validation runs in this order:

```text
1. IDENTITY_AND_AUTHORITY
2. MATH
3. SEMANTIC_ROLE
4. DEPENDENCY
5. MILESTONE_COMPLETENESS
6. DECISION
7. AUTHENTICITY
8. PROJECTION
9. ADMISSION_STATUS
```

Blocking error classes:

```text
PBL_TASK_COUNT_INVALID
PBL_GRAPH_TYPE_INVALID
PBL_INPUT_REF_UNRESOLVED
PBL_GRAPH_CYCLE
PBL_ORPHAN_MILESTONE
PBL_REQUIRED_MILESTONE_MISSING
PBL_FINAL_TASK_NOT_UNIQUE
PBL_FINAL_PRODUCT_MISSING
PBL_DECISION_NOT_SUPPORTED
PBL_CONSTRAINT_UNSATISFIED
PBL_DECORATIVE_CONTEXT
PBL_PROJECTION_UNAPPROVED
```

## 16. Worksheet projection

Allowed projections:

```text
APPROVED_COMPLETE_SINGLE_PAGE
APPROVED_COMPLETE_TWO_PAGE
```

A renderer may not split the task chain at an arbitrary point.

Two-page projection requires:

```text
page 1: complete driving problem, all shared data, first task segment
page 2: explicit continuation, remaining tasks, final product area
```

The final product and its required evidence must remain together.

## 17. Answer-key projection

The compact answer key must preserve dependency meaning:

```text
task number
milestone answer
interpretation witness
final decision or product
```

It must not present isolated answers that hide how later tasks depend on earlier results.

## 18. Production gate

A PBL candidate passes only when:

```text
AUTHENTIC_DRIVING_PROBLEM = true
PRIMARY_KNOWLEDGE_POINT_DEFINED = true
GLOBAL_CONTEXT_BINDING_VALID = true
TASK_COUNT_IN_RANGE = true
DEPENDENCY_GRAPH_COMPLETE = true
ALL_INPUT_REFS_RESOLVED = true
ALL_MILESTONES_NECESSARY = true
FINAL_PRODUCT_EXISTS = true
FINAL_PRODUCT_USES_REQUIRED_MILESTONES = true
CONSTRAINTS_SATISFIED = true
INTERPRETATION_VISIBLE = true
MISCONCEPTION_MODELS >= 3
COUNTERFACTUAL_TEST_PASS = true
MATH_VALIDATION_PASS = true
SEMANTIC_VALIDATION_PASS = true
APPROVED_PROJECTION_PASS = true
```

## 19. Admission lifecycle

```text
PBL_DRAFT
DRIVING_PROBLEM_VERIFIED
DEPENDENCY_GRAPH_VERIFIED
MILESTONE_CLOSURE_VERIFIED
FINAL_PRODUCT_VERIFIED
AUTHENTICITY_VERIFIED
PROJECTION_VERIFIED
PBL_VALIDATED_CANDIDATE
PBL_PRODUCTION_ADMITTED
```

`PBL_VALIDATED_CANDIDATE` is not production admission.

## 20. A03 scope boundary

A03 creates a normative SOP and JSON Schema only.

```text
production PBL authoring = forbidden
runtime generator modification = forbidden
runtime validator modification = forbidden
renderer modification = forbidden
public UI modification = forbidden
global context family authoring = forbidden
unit context binding admission = forbidden
single-item schema modification = forbidden
production admission change = forbidden
POST_GOLDEN migration controller modification = forbidden
```

Abstract fixtures may verify graph and schema rules but are not production content.

## 21. A03 acceptance

A03 passes only when:

```text
3–5 task boundary is machine locked
three V1 graph types are machine locked
every non-initial task must consume prior evidence
milestone closure is machine represented
final product and decision witness are mandatory
authenticity and counterfactual evidence are mandatory
only approved page projections are allowed
runtime and production behavior remain unchanged
```
