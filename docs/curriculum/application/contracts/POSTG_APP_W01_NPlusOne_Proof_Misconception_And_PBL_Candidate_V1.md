# POSTG-APP Wave 01 — N+1 Proof, Misconception and PBL Candidate V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-W01-A02_Golden15NPlusOneProofMisconceptionAndPBLCandidateContract
CONTRACT_ID = POSTG_APP_W01_NPLUSONE_PROOF_MISCONCEPTION_AND_PBL_CANDIDATE_V1
STATUS = SHADOW_CANDIDATE_CONTRACT_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

A02 consumes the A01 context-bound single-application candidate pack and materializes two restricted candidate sets:

```text
A. N+1 proof blueprints
B. PBL task-set blueprints
```

Only KnowledgePoints marked by A00 as `SINGLE_N_PLUS_1` or `PBL_TASK_SET` are included. A02 does not promote direct-only or not-applicable KnowledgePoints.

## 2. N+1 proof blueprint

Every N+1 candidate must state what additional interpretation is required beyond direct calculation.

Allowed acts:

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

Each blueprint includes:

```text
base capability
candidate capability
shortest semantic edge = 1
prerequisite closure candidate
paired-control blueprint
interpretation fork
interpretation witness blueprint
at least 3 misconception models
counterfactual blueprint
cross-context proof pair
validator delta candidate
pending fixture checks
```

The blueprint status is not `PROVEN_N_PLUS_1_CANDIDATE`. Numeric fixtures, answer uniqueness, witness execution and misconception execution remain required before proof admission.

## 3. Cross-context proof

A02 must prove that the semantic capability is not tied to one noun set or one large context.

For every N+1 blueprint:

```text
primary Atomic Task Episode
+ alternate eligible Atomic Task Episode in a different Macro Context Domain
+ same KnowledgePoint and Canonical Operation Model
+ same new interpretive act
+ same validator delta
```

This is the formal connection between large-context diversity and stable mathematical semantics.

## 4. Misconception minimum

Every N+1 blueprint includes at least three misconception candidates:

```text
one act-specific misconception
OPERATION_KEYWORD_MATCHING
COMPUTED_NOT_INTERPRETED
```

At least one must have:

```text
diagnosticClassification = CALCULATION_PASS_INTERPRETATION_FAIL
```

## 5. PBL candidate blueprint

Only A00 records containing `PBL_TASK_SET` produce PBL candidates.

A PBL candidate includes:

```text
one authentic driving problem candidate
one primary KnowledgePoint
one Canonical Operation Model
one M01 Atomic Task Episode
one final product type
3 or 5 dependent task nodes
at least 2 milestones
one final synthesis task
at least 3 misconception models
one counterfactual propagation candidate
one projection candidate
```

PBL candidates are blueprints, not production task sets. They may not be rendered or selected by the public generator.

## 6. Graph selection

```text
PBL5_BOUNDED_DECISION
  when the N+1 act is DUAL_CONSTRAINT_RESOLUTION or COMPARISON_DECISION

PBL3_LINEAR
  for the remaining admitted PBL candidates
```

Every non-first task must consume a previous milestone or a shared context constraint. The final task must consume at least two earlier milestones.

## 7. Final product selection

```text
commerce / budget        → PURCHASE_DECISION or BUDGET_RECOMMENDATION
transport                 → TRANSPORT_PLAN
logistics / packaging     → PACKAGING_PLAN
schedule / time           → SCHEDULE
comparison / public data  → COMPARISON_REPORT
other resource contexts   → RESOURCE_PLAN or ALLOCATION_PLAN
```

## 8. Fail-closed invariants

```text
A01 candidate pack must validate
N+1 blueprint count must equal A00 SINGLE_N_PLUS_1 candidate count
PBL blueprint count must equal A00 PBL_TASK_SET candidate count
all N+1 records must use one allowed interpretive act
all N+1 records must have a different-macro cross-context pair
all N+1 records must have at least 3 misconception candidates
all PBL records must have 3 or 5 tasks
all PBL final tasks must consume at least 2 milestones
all PBL non-first tasks must have dependencies
all selected context episodes must remain A00 eligible
all records must retain A01 lineage
no record may be production admitted
```

## 9. Scope boundary

Allowed:

```text
N+1 proof blueprint materialization
interpretive-act inference
paired-control and witness blueprints
misconception and counterfactual candidates
cross-context proof pairing
PBL driving problem and dependency blueprints
controller N_PLUS_1_CONTRACT_COMPLETE advancement
validation CLI and tests
```

Forbidden:

```text
claiming PROVEN_N_PLUS_1_CANDIDATE
fully instantiated numeric fixtures
executed misconception evidence
final PBL production admission
shared production generator changes
renderer changes
public UI changes
```

## 10. Acceptance

```text
all A00 N+1 candidates receive one proof blueprint
all A00 PBL candidates receive one PBL blueprint
cross-context macro domains differ for every N+1 blueprint
misconception minimum and diagnostic class pass
PBL dependency and final synthesis gates pass
production admission remains zero
controller completes N_PLUS_1_CONTRACT_COMPLETE
```
