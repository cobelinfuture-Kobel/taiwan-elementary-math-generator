# Single Application Item SOP V1

```text
CONTRACT_ID = SINGLE_APPLICATION_ITEM_SOP_V1
PARENT_CONTRACT = APPLICATION_PROBLEM_SOP_V1
MILESTONE = APP-SOP-A01_SingleApplicationItemDetailedSOPAndSchemaContract
STATUS = SCHEMA_CONTRACT_DRAFT_LOCKED_FOR_REVIEW
RUNTIME_CHANGE = false
QUESTION_CONTENT_ADDED = false
PRODUCTION_ADMISSION_CHANGED = false
```

## 1. Purpose

This SOP defines one independent application item. It covers:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
```

It does not define a PBL task set. A single item may contain a bounded internal relation chain, but it must have one primary target and no cross-question dependency graph.

## 2. Required authority inputs

A single application item cannot be authored from a story alone. It requires these prior authorities:

```text
sourceId
knowledgePointId
canonicalOperationModelId
KnowledgePoint.applicationCapability
operandRoles
unknownRoles
numberConstraints
validationInvariants
```

The item then binds to:

```text
globalContextFamilyId
unitContextBindingId
surfaceTemplateId
```

The global context provides event structure and language. It may not change the operation signature, role model, unit flow, or answer.

## 3. Single-item identity

Every item or item specification must have:

```text
itemId or patternSpecId
applicationMode
sourceId
knowledgePointId
canonicalOperationModelId
admissionStatus
```

Allowed `applicationMode` values:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
```

Allowed initial `admissionStatus` values:

```text
OBSERVED
SEMANTIC_MODEL_EXTRACTED
KNOWLEDGE_POINT_MAPPED
CONTEXT_BOUND
PATTERN_CANDIDATE
VALIDATOR_READY
QA_VALIDATED
PRODUCTION_ADMITTED
```

Rejected and deferred states remain those defined by the parent contract.

## 4. One-primary-target rule

A single item must have exactly one primary target role.

Valid:

```text
Find the minimum number of vehicles needed.
```

Invalid as one item:

```text
Find the full vehicles, remaining students, minimum vehicles,
and total price of the trip.
```

Supporting calculations are allowed only when they lead to one terminal target. They must be represented as a bounded relation chain inside one item, not as unrelated subquestions.

## 5. Semantic model

The item must store a semantic model independent of its final wording.

Required components:

```text
givenRoles
targetRole
relationGraph
operationOrder
contextConstraints
answerMeaning
```

Example:

```text
givenRoles:
- totalPeople = 50
- seatsPerVehicle = 6

targetRole:
- minimumVehicleCount

relationGraph:
- quotient = floor(totalPeople / seatsPerVehicle)
- remainder = totalPeople % seatsPerVehicle
- minimumVehicleCount = quotient + indicator(remainder > 0)

contextConstraints:
- every person must receive a seat
- capacity may not be exceeded

answerMeaning:
- count of vehicles required to transport everyone
```

## 6. Numeric prerequisites and application capability

Numeric difficulty and application capability are separate fields.

```text
numericDifficultyLevel
applicationCapabilityLevel
```

Suggested numeric values:

```text
EASY
STANDARD
ADVANCED
CHALLENGE
```

Allowed application capability values in V1:

```text
N
N_PLUS_1
```

A larger number, more digits, additional carry/borrow, or more arithmetic work cannot by itself raise the application capability level.

## 7. `SINGLE_DIRECT` contract

`SINGLE_DIRECT` uses an already admitted semantic model.

Required:

```text
one primary target
complete role bindings
valid global-context binding
unique answer
correct answer role and unit
no newInterpretiveAct claim
```

Typical examples:

- known total and amount per group, find group count;
- known total and group count, find amount per group;
- known unit price and quantity, find total price;
- known distance and equal segment length, find segment count.

## 8. `SINGLE_N_PLUS_1` contract

`SINGLE_N_PLUS_1` adds one nearest semantic capability while numeric prerequisites remain available.

Required fields:

```text
baseCapabilityId
candidateCapabilityId
sharedNumericPrerequisites
newInterpretiveAct
intermediateSemanticNodeRequired
pairedControlItem
interpretationWitness
misconceptionModels
counterfactualVariant
answerMeaningValidation
```

Hard requirements:

```text
intermediateSemanticNodeRequired = false
misconceptionModels.length >= 2
pairedControlItem uses equivalent numeric prerequisites
counterfactualVariant changes the expected interpretation or decision
```

If an intermediate semantic node is required, the item must be deferred rather than admitted as N+1.

## 9. Context-affordance matching

The item must derive required affordances before selecting a global context.

Example for minimum-container interpretation:

```text
requiredContextAffordances:
- fixed maximum capacity
- all items or people must be handled
- partial final container is permitted
- nonzero remainder requires an additional resource
```

A context binding is invalid when:

- the event does not support the operation;
- role ownership is unclear;
- the answer unit does not match the target role;
- a decorative SDG label is the only contextual difference;
- the context adds a second independent semantic delta;
- the context requires external knowledge not provided in the item.

## 10. Prompt structure

The prompt must contain:

```text
background event
necessary quantitative facts
necessary constraints
one terminal question
```

It must not explicitly reveal the intended operation sequence when the interpretation itself is being assessed.

Invalid over-scaffolded wording:

```text
First divide 50 by 6, then add one because there is a remainder.
```

Valid wording:

```text
Fifty students need seats. Each vehicle can carry at most six students.
How many vehicles are needed so every student has a seat?
```

## 11. Surface-template robustness

An admitted semantic pattern requires multiple surface formulations that preserve the same relation graph.

Keyword dependence is forbidden. The validator and binding must rely on roles and event constraints rather than fixed words such as:

```text
平均
一共
剩下
至少
最多
```

The same semantic model should remain valid under a natural paraphrase.

## 12. Answer model

Allowed answer shapes:

```text
QUANTITY_WITH_UNIT
QUOTIENT_REMAINDER
DECISION_WITH_REASON
COMPARISON_CHOICE
ERROR_DIAGNOSIS
```

Required answer fields:

```text
numericAnswer or structuredAnswer
answerRole
answerUnit
canonicalReconstruction
interpretationStatement
```

For decision tasks, also require:

```text
decisionRule
decisionWitness
```

## 13. Interpretation witness

An interpretation witness must be compact and observable.

Allowed forms:

```text
TARGET_ROLE_SELECTION
RELATION_ORDER_SELECTION
DECISION_REASON_SELECTION
COMPARISON_EVIDENCE
ERROR_DIAGNOSIS
SHORT_ANSWER_MEANING
```

The witness must target the new interpretive act, not merely repeat the arithmetic.

For `SINGLE_DIRECT`, a witness may be omitted when answer role and unit already demonstrate the base semantic capability.

For `SINGLE_N_PLUS_1`, one witness is mandatory.

## 14. Misconception models

Every N+1 item requires at least two semantic misconception models.

Each model contains:

```text
misconceptionId
misconceptionType
expectedWrongAnswer or expectedWrongDecision
diagnosticMeaning
```

Example:

```text
QUOTIENT_ONLY
wrongAnswer = 8 vehicles
diagnosticMeaning = ignores the students represented by the remainder
```

Random arithmetic distractors do not satisfy this requirement.

## 15. Counterfactual variant

The counterfactual must change one contextual condition while preserving the numeric prerequisite.

Example pair:

```text
all people must be transported
→ minimum vehicles = 9

count only completely filled vehicles
→ full vehicles = 8
```

The expected answer or decision must change as predicted. This proves the item uses context semantics rather than only the arithmetic expression.

## 16. Validation order

Validation runs in this order:

```text
1. IDENTITY_AND_AUTHORITY
2. NUMERIC
3. SEMANTIC_ROLE
4. OPERATION_RELATION
5. CONTEXT_BINDING
6. INTERPRETATION
7. ANSWER_MEANING
8. ADMISSION_STATUS
```

A blocking failure returns no production item.

## 17. Response classification

A learner response may be classified as:

```text
FULL_PASS
CALCULATION_PASS_INTERPRETATION_FAIL
INTERPRETATION_PASS_CALCULATION_FAIL
ANSWER_ROLE_OR_UNIT_FAIL
FULL_FAIL
```

Examples:

```text
50 ÷ 6 = 8 remainder 2; answer 8 vehicles
→ CALCULATION_PASS_INTERPRETATION_FAIL

answer 9 people
→ ANSWER_ROLE_OR_UNIT_FAIL
```

## 18. Generator contract

A generator may only fill parameters inside an admitted single-application specification.

Generator responsibilities:

```text
select admitted PatternSpec
select admitted context binding
sample legal parameters
construct semantic state
recompute canonical answer
render one surface template
attach lineage and witnesses
submit to validator
```

Forbidden:

```text
free-form story generation without an admitted PatternSpec
changing roles to fit a story
inventing an operation after selecting a context
returning an item after a blocking validator failure
```

## 19. Renderer contract

A single item uses one compact card or problem block.

Renderer input includes:

```text
prompt
answerShape
answerRole
answerUnit
optional interpretation witness control
```

The renderer must not add PBL milestone sections, dependency labels, or multi-page continuation rules to a single item.

Student-facing labels such as `算式` or `答` are not required by this SOP and must not be introduced merely to satisfy the answer model.

## 20. Production gate

A single item is blocked unless:

```text
KNOWLEDGE_POINT_COMPATIBLE = true
CANONICAL_OPERATION_VALID = true
GLOBAL_CONTEXT_BINDING_VALID = true
ROLE_BINDINGS_COMPLETE = true
ONE_PRIMARY_TARGET = true
UNIQUE_ANSWER = true
ANSWER_ROLE_VALID = true
ANSWER_UNIT_VALID = true
SEMANTIC_EVENT_COHERENT = true
MATH_VALIDATION_PASS = true
```

For `SINGLE_N_PLUS_1`, also require:

```text
BASE_CAPABILITY_DEFINED = true
NEW_INTERPRETIVE_ACT_DEFINED = true
INTERMEDIATE_SEMANTIC_NODE_REQUIRED = false
PAIRED_CONTROL_ITEM_EXISTS = true
MISCONCEPTION_MODELS >= 2
INTERPRETATION_WITNESS_EXISTS = true
COUNTERFACTUAL_TEST_PASS = true
```

## 21. A01 scope boundary

A01 creates a detailed SOP and JSON Schema only.

```text
single-item generator modification = forbidden
runtime validator modification = forbidden
renderer modification = forbidden
public UI modification = forbidden
question content authoring = forbidden
context family authoring = forbidden
PBL schema implementation = forbidden
production admission change = forbidden
POST_GOLDEN migration controller modification = forbidden
```

## 22. A01 acceptance

A01 passes only when:

```text
SINGLE_DIRECT and SINGLE_N_PLUS_1 are schema-distinguishable
one-primary-target rule is machine represented
math, role, context, interpretation, and answer-meaning fields are required
N+1 conditional fields are schema-required
PBL-only fields are forbidden from the single-item schema
runtime and production behavior remain unchanged
```
