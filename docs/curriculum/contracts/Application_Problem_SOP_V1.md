# Application Problem SOP V1

```text
CONTRACT_ID = APPLICATION_PROBLEM_SOP_V1
MILESTONE = APP-SOP-A00_ScopeDefinitionsAndAdmissionBoundary
STATUS = CONTRACT_DRAFT_LOCKED_FOR_REVIEW
RUNTIME_CHANGE = false
QUESTION_CONTENT_ADDED = false
PRODUCTION_ADMISSION_CHANGED = false
```

## 1. Purpose

This contract defines how the Taiwan Elementary Math Generator distinguishes, designs, admits, generates, validates, and renders three application-problem products:

```text
SINGLE_DIRECT
SINGLE_N_PLUS_1
PBL_TASK_SET
```

It prevents the following failures:

- wrapping an arithmetic expression in a story and calling it an application problem;
- calling a larger number or an extra operation `N+1`;
- calling several unrelated questions under one story `PBL`;
- allowing a global context to change the mathematical relationship;
- accepting a numerically correct answer whose role, unit, decision, or real-world meaning is wrong;
- forcing application or PBL content onto KnowledgePoints that are not suitable for contextualization.

## 2. Authority separation

The authority chain is fixed:

```text
Taiwan Curriculum Unit
→ KnowledgePoint
→ Canonical Operation Model
→ Application Capability
→ Global Context Binding
→ Application PatternSpec or PBL TaskSpec
→ Generator
→ Validator
→ Worksheet / Answer Key / Renderer
```

Ownership is divided as follows.

| Layer | Owns |
|---|---|
| KnowledgeOperation authority | operation signature, operand roles, unknown roles, numeric constraints, answer type, validation invariants |
| Application capability | application mode, base semantic node, new interpretive act, interpretation witness, misconception models |
| Global context family | event structure, actors, place, objects, activities, surface templates, safety restrictions |
| Unit/context binding | eligible KnowledgePoints, PatternGroups, PatternSpecs, role binding, unit flow, forbidden combinations |
| Generator | deterministic parameter filling inside admitted specifications |
| Validator | arithmetic, semantic roles, interpretation, dependency, decision, answer meaning |
| Renderer | admitted answer shape and approved single-item or complete PBL projection |

A global context may not own or alter the operation signature, quantity roles, unit flow, or canonical answer. Existing global-context authority remains under:

```text
data/curriculum/context/registry/
```

Existing unit mathematics remains under:

```text
data/curriculum/knowledge/units/<sourceId>.knowledge-operation.json
```

## 3. Product classification

### 3.1 `SINGLE_DIRECT`

A single independent real-world problem that requires the learner to identify quantity roles, choose an admitted mathematical relation, and return one unique answer with the correct role and unit.

Required closure:

```text
read context
→ identify given roles
→ identify target role
→ apply one admitted relation or bounded relation chain
→ interpret answer role and unit
```

This mode does not require a new interpretive capability beyond the admitted base application node.

### 3.2 `SINGLE_N_PLUS_1`

A single independent real-world problem that retains already-mastered numeric prerequisites but adds one nearest, teachable, independently verifiable interpretive capability.

`N+1` is not defined by larger values, more digits, or one additional operator. It is defined by a new interpretive act with no missing intermediate semantic node.

Examples of admitted interpretive acts:

```text
UNKNOWN_ROLE_SHIFT
REMAINDER_INTERPRETATION
RELATION_CHAIN
DUAL_CONSTRAINT_RESOLUTION
CONSERVATION_OR_TRANSFER
COMPARISON_DECISION
UNIT_ROLE_INTERPRETATION
IRRELEVANT_INFORMATION_FILTER
```

Mandatory evidence:

```text
baseCapabilityId
candidateCapabilityId
sharedNumericPrerequisites
newInterpretiveAct
intermediateSemanticNodeRequired = false
pairedControlItem
interpretationWitness
misconceptionModels >= 2
counterfactualVariant
answerMeaningValidation
```

### 3.3 `PBL_TASK_SET`

A real-world driving problem with three to five dependent mathematical tasks. Intermediate results must be necessary inputs to later tasks, and the final task must produce an actionable plan, allocation, comparison, recommendation, schedule, decision, or other usable outcome.

Required closure:

```text
Driving Problem
→ necessary data interpretation
→ milestone calculations
→ constraint comparison
→ final product or decision
```

A multi-question set is not PBL when the questions are independent, when later questions restate earlier answers, or when the final task does not resolve the original real-world problem.

## 4. Application suitability of KnowledgePoints

Every KnowledgePoint must be classified before application authoring:

```text
APPLICATION_REQUIRED
APPLICATION_COMPATIBLE
APPLICATION_NOT_APPLICABLE
UNASSESSED
```

Rules:

- `APPLICATION_REQUIRED`: the intended competency includes semantic interpretation or real-world decision-making;
- `APPLICATION_COMPATIBLE`: the KnowledgePoint may support an application problem but remains primarily numeric, visual, or procedural;
- `APPLICATION_NOT_APPLICABLE`: contextualization would obscure or falsify the target competency;
- `UNASSESSED`: no application claim may be made until assessed.

KnowledgePoints such as partitive division, quotative division, remainder interpretation, budget comparison, capacity planning, time planning, measurement conversion, and multi-step relation chains are typical candidates. Procedural targets such as quotient-zero placeholding or vertical missing-digit reconstruction are not automatically contextualized.

## 5. Shared single-application SOP

A single item must pass the following sequence.

### SA-00 KnowledgePoint admission

Confirm the KnowledgePoint application capability and the exact operation model.

### SA-01 Application depth

Classify the item as:

```text
N
N_PLUS_1
N_PLUS_2_CANDIDATE
```

`N_PLUS_2_CANDIDATE` is not production admitted by this contract.

### SA-02 Mathematical relation lock

Lock:

```text
canonicalOperationModelId
operandRoles
unknownRole
answerRole
answerUnit
numericConstraints
validationInvariants
```

### SA-03 Global context binding

Derive required context affordances from the mathematics, then select only compatible context families. Do not start with an SDG label or a decorative story.

### SA-04 Single-question closure

The item must contain one primary target. Multiple supporting calculations may be internal to the same item, but the item must not be split into unrelated mini-questions.

### SA-05 Answer model

The answer must include more than a raw number where the context requires it:

```text
numericAnswer
answerRole
answerUnit
decisionRule
interpretationStatement
```

### SA-06 Interpretation witness

An admitted N+1 item must expose one compact, observable witness such as:

- target-role selection;
- relation-order selection;
- decision reason;
- comparison evidence;
- error diagnosis;
- one-sentence answer-meaning statement.

The student page must not require verbose prose when a bounded choice or short witness is sufficient.

### SA-07 Misconception and counterfactual evidence

Distractors must represent semantic misconceptions, not random arithmetic errors. At least one counterfactual change must alter the expected interpretation or decision while preserving the numeric prerequisite.

### SA-08 Validation

Validation layers:

```text
NUMERIC
SEMANTIC_ROLE
OPERATION_RELATION
INTERPRETATION
ANSWER_MEANING
```

A response can therefore be classified as:

```text
FULL_PASS
CALCULATION_PASS_INTERPRETATION_FAIL
INTERPRETATION_PASS_CALCULATION_FAIL
ANSWER_ROLE_OR_UNIT_FAIL
FULL_FAIL
```

### SA-09 Worksheet projection

Single items use one compact problem block and one answer area. They do not receive PBL milestone tables or multi-page task-chain projection.

### SA-10 Production gate

No single application item becomes production selectable until all required bindings and validators pass.

## 6. `SINGLE_N_PLUS_1` proof standard

The strongest proof uses paired controls:

```text
same numbers
+ same numeric prerequisites
+ same or equivalent surface load
+ different semantic target or decision
```

Example family:

```text
N:
50 items, capacity 6; report full groups and remainder.

N+1:
50 items, capacity 6; all items must be contained; report minimum containers.
```

The arithmetic is unchanged. The new capability is interpreting a nonzero remainder as requiring one additional resource.

An N+1 claim is rejected when:

- only the number range, digit count, carry/borrow count, or wording length changes;
- the candidate requires an unmastered intermediate semantic capability;
- no observable interpretation witness exists;
- the same validator as N can admit the item without additional semantic checks;
- the item relies on keyword matching rather than quantity-role reasoning.

## 7. PBL SOP

### PB-00 KnowledgePoint and primary capability admission

Exactly one primary capability is declared. Other KnowledgePoints are supporting prerequisites.

### PB-01 Driving problem

Define:

```text
stakeholder
realWorldGoal
constraints
finalDecisionOrProduct
consequenceOfIncorrectDecision
```

### PB-02 Global context binding

The context must provide all required event affordances and must not introduce unsupported mathematics.

### PB-03 Dependency graph

Allowed initial structures:

```text
PBL3_LINEAR
Q1 → Q2 → Q3

PBL4_BRANCH_MERGE
Q1 → Q2
Q1 → Q3
Q2 + Q3 → Q4

PBL5_BOUNDED_DECISION
interpret data
→ establish quantities
→ calculate options
→ compare constraints
→ decide
```

### PB-04 Milestones

Every non-initial task must consume a prior result or prior derived quantity. Later prompts may not directly reveal an earlier milestone answer.

### PB-05 Final product

Allowed final products include:

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

### PB-06 Evidence

Each task stores both:

```text
numericWitness
interpretationWitness
```

The final task stores a `decisionWitness` that demonstrates all constraints are satisfied.

### PB-07 Misconception and counterfactual evidence

At least three misconception models and one counterfactual variant are required.

### PB-08 Validation

PBL validation layers:

```text
MATH
SEMANTIC
DEPENDENCY
DECISION
COMPLETENESS
AUTHENTICITY
```

### PB-09 Worksheet projection

Only these projections are permitted initially:

```text
APPROVED_COMPLETE_SINGLE_PAGE
APPROVED_COMPLETE_TWO_PAGE
```

Unapproved automatic page splitting across the dependency chain is forbidden.

### PB-10 Production gate

A PBL task set is blocked when the dependency graph is broken, a necessary milestone is absent, the final decision does not use prior evidence, the context is decorative, or the final product does not resolve the driving problem.

## 8. Global-context integration

The binding order is mandatory:

```text
KnowledgePoint
→ Canonical Operation Model
→ Application Capability
→ requiredContextAffordances
→ compatible Global Context Family
→ roleBindings
→ surface template
```

The following order is forbidden:

```text
choose SDG or story
→ insert numbers
→ infer an operation afterward
```

Every binding must preserve:

```text
operation signature
quantity roles
unknown role
unit flow
answer witness
new interpretive act
```

A context family may provide several surface templates, but noun substitution alone does not create a new family.

## 9. Admission lifecycle

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

Rejected or deferred states:

```text
REJECTED_DECORATIVE_CONTEXT
REJECTED_ROLE_MISMATCH
REJECTED_NON_UNIQUE_ANSWER
REJECTED_MISSING_INTERPRETATION
REJECTED_BROKEN_DEPENDENCY
DEFERRED_MISSING_PREREQUISITE
DEFERRED_N_PLUS_2
```

## 10. Production fail-closed rules

The runtime must reject:

- application items without a KnowledgePoint and operation-model lineage;
- contexts without an admitted unit/context binding;
- an N+1 claim without a base capability and new interpretive act;
- numerically correct but semantically invalid answer roles or units;
- PBL task sets with fewer than three or more than five tasks;
- PBL task sets with independent task rows or missing final products;
- free-form AI runtime composition outside an admitted PatternSpec or TaskSpec;
- global contexts that own or mutate mathematics;
- public N+2 application content until a later contract explicitly admits it.

## 11. Bounded implementation roadmap

```text
APP-SOP-A00  Scope definitions and admission boundary
APP-SOP-A01  SingleApplicationItem detailed SOP and schema contract
APP-SOP-A02  N+1 interpretation proof, paired controls, and misconception contract
APP-SOP-A03  PBLTaskSet dependency, milestone, and final-product contract
APP-SOP-A04  Global-context binding and machine-readable admission registries
APP-SOP-A05  Validator / CI gates and G3B-U01 pilot fixtures
APP-SOP-A06  Shared runtime integration, worksheet QA, and closeout
```

Only one milestone may be implemented per primary PR. CI corrections remain inside the same milestone and do not create new milestones.

## 12. A00 scope boundary

A00 creates normative scope and machine-verifiable contract structure only.

```text
generator modification = forbidden
runtime validator modification = forbidden
renderer modification = forbidden
public UI modification = forbidden
new application question content = forbidden
new context family authoring = forbidden
production admission change = forbidden
POST_GOLDEN migration controller modification = forbidden
```

## 13. First pilot target

The first proposed pilot is:

```text
SOURCE_ID = g3b_u01_3b01
```

The unit already separates:

- partitive division;
- quotative division;
- quotient and remainder interpretation;
- maximum complete groups versus minimum containers;
- two-step division operation order.

The pilot is not implemented in A00. It is reserved for APP-SOP-A05 after schemas and validators are locked.

## 14. A00 acceptance

A00 passes only when:

```text
three product modes are mutually exclusive and defined
single-item and PBL boundaries are explicit
N+1 is interpretation-based rather than numeric-load-based
KnowledgePoint application suitability states are fixed
global-context mathematical ownership is forbidden
admission and rejected states are fixed
runtime and production changes remain absent
bounded A00–A06 roadmap is fixed
```
