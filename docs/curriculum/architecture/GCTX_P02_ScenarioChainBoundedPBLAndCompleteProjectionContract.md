# GCTX-P02 — ScenarioChain, BoundedPBL and Complete Projection Contract

## 1. Purpose

P02 defines the semantic ownership required for approved two-to-five-question item sets.

```text
ApprovedSemanticBinding (P01)
→ complete question-count projection
→ explicit dependency graph
→ explicit quantity ledger
→ required milestone coverage
→ terminal outcome
```

P02 does not generate questions, migrate units or implement rendering. It establishes the schema that later authoring, resolver, validator and worksheet tasks must follow.

## 2. Fixed scope

```text
schema and contract only
no seed content
no runtime behavior
no unit migration
no source-admission implementation
no semantic-breadth implementation
no renderer implementation
no G5A-U02 file changes
```

## 3. Item-structure classes

The global ruleset distinguishes four structures:

| Class | Meaning |
|---|---|
| `independent_application` | A single independent application item. Not owned by P02. |
| `common_scenario_independent` | Two-to-five questions share a story or data source but do not depend on one another. |
| `scenario_chain_dependent` | A later question consumes a result or state established by an earlier question. |
| `bounded_pbl_closed` | A controlled project task with a goal, required milestones, deterministic criteria and a terminal deliverable. |

A shared story, table or label such as “素養題” does not by itself make an item set PBL.

## 4. Complete question-count profiles

A request for two, three, four or five questions selects an approved complete profile.

```text
QUESTION COUNT SELECTS
AN APPROVED COMPLETE PROJECTION

QUESTION COUNT MUST NOT
TRUNCATE A CHAIN
```

Each profile owns its exact:

- subquestion nodes;
- approved P01 semantic bindings;
- dependency graph;
- quantity ledger;
- milestone coverage;
- deterministic decision criteria;
- terminal outcome;
- approved semantic page-span declaration.

A four-question chain does not automatically support a two-question worksheet. A two-question compact version must be separately authored, reviewed and approved as a complete profile.

## 5. Subquestion nodes

Each subquestion node declares:

```text
stable subquestion ID
strict order
approved P01 binding ID
question function
upstream question dependencies
consumed quantities
produced quantities
covered milestones
terminal status
```

Runtime cannot replace a node, rearrange nodes or combine nodes from different profiles.

## 6. Dependency graph types

P02 supports these reviewed graph families:

```text
common_scenario_independent
linear_dependency
branch_merge
parallel_comparison
constraint_merge
```

Examples:

```text
Linear:
Q1 → Q2 → Q3 → Q4

Branch merge:
Q1 → Q2
 └──→ Q3
Q2 + Q3 → Q4

Parallel comparison:
Q1 → option A result
Q2 → option B result
Q1 + Q2 → Q3 decision

Constraint merge:
capacity + cost + time → feasible option
```

The graph must be acyclic. Every referenced node must exist. A dependent question cannot consume a quantity that has not been made available.

## 7. Quantity ledger

Every complete profile owns a closed quantity ledger.

Each ledger entry records:

- semantic role;
- unit dimension;
- origin;
- visibility;
- consumers;
- derivation rule where applicable;
- immutability within the projection.

Allowed origins are:

```text
stimulus
precomputed_visible
subquestion_output
```

A later question may use an earlier result only when the dependency edge and ledger entry both declare it. Hidden or unavailable values cannot be consumed.

## 8. Required milestones

A bounded PBL chain declares the steps that must be completed for the project goal to be reached.

Examples include:

```text
establish supply
establish demand
establish capacity
establish cost
compare options
apply constraint
make decision
complete deliverable
```

Every approved profile must account for every required milestone.

### Allowed coverage modes

```text
question
supplied_as_stimulus
merged_into_question
precomputed_and_visible
```

The following mode does not exist:

```text
silently_removed
```

When a compact profile does not ask the learner to calculate an early milestone, the relevant information must be visibly provided or deliberately merged into another approved question.

## 9. Bounded PBL closure

A `bounded_pbl_closed` entry requires:

```text
projectArchetypeId
projectGoal
shared entities
at least two required milestones
at least one deterministic decision criterion
terminal deliverable
one or more approved complete question-count profiles
whole-chain approval
```

A PBL decision cannot be a free opinion. The selection or conclusion must follow declared deterministic criteria such as:

- minimum cost;
- sufficient capacity;
- budget limit;
- time limit;
- least waste;
- fair distribution;
- safety reserve.

The final question must produce the declared terminal deliverable. Removing that question makes the chain incomplete.

## 10. ScenarioChain closure

A non-PBL ScenarioChain may end with a complete answer set, computed value set or comparison conclusion. It does not need a project goal or project decision.

The distinction is structural:

```text
shared data + several answers
= ScenarioChain or common-stimulus set

project goal + milestones + criteria + final deliverable
= BoundedPBL
```

## 11. Semantic projection span

P02 records only the approved semantic span:

```text
single_page_complete
approved_two_page_complete
```

For a two-page profile, the break must be explicitly declared after a named subquestion. Renderer code may not move the break, split the semantic block elsewhere or remove milestones to make the layout fit.

Physical page dimensions, writing-space measurements, density, overflow and answer-key rendering remain GLM-APP responsibilities.

## 12. Blocking validation contract

Production validators must block when any of the following occurs:

- profile question count and actual node count differ;
- subquestion IDs are duplicated;
- dependency references are invalid or cyclic;
- a consumed quantity is unavailable;
- the ledger remains open;
- a required milestone is missing;
- a milestone was silently removed;
- a question is orphaned;
- the terminal outcome is missing;
- a PBL decision stage is missing;
- the project goal is not reached;
- runtime truncation is attempted;
- runtime question assembly is attempted;
- an undeclared page split is attempted;
- a referenced P01 binding is not approved;
- canonical per-question or chain-level recomputation fails.

Reserved codes include:

```text
PBL_CHAIN_INCOMPLETE
PBL_REQUIRED_MILESTONE_MISSING
PBL_TERMINAL_DELIVERABLE_MISSING
PBL_DECISION_STAGE_MISSING
PBL_DEPENDENCY_PATH_BROKEN
PBL_UNAPPROVED_QUESTION_COUNT_PROFILE
PBL_RUNTIME_TRUNCATION_FORBIDDEN
PBL_OMITTED_NODE_UNACCOUNTED
PBL_PROJECT_GOAL_NOT_REACHED
SCENARIO_QUANTITY_LEDGER_OPEN
SCENARIO_ORPHAN_SUBQUESTION
SCENARIO_UNDECLARED_PAGE_SPLIT
```

P06 will formalize the complete validator-code registry. P02 reserves the semantic meanings.

## 13. Deferred ownership

### P03

```text
source admission
common-knowledge evidence
web verification
expiry and maintenance
```

### P04

```text
PBL semantic fingerprints
near-duplicate detection
semantic-family registry
per-unit breadth gates
```

### GLM-APP

```text
physical layout
application-page density
writing-space size
question-sheet rendering
answer-key rendering
overflow measurement
```

### Runtime milestones

```text
approved-profile resolver
chain generator
blocking chain validator
worksheet integration
```

## 14. Non-negotiable invariants

```text
RUNTIME MAY SELECT AN APPROVED COMPLETE PROFILE
RUNTIME MUST NOT CONSTRUCT A PROFILE

FOUR-QUESTION CHAIN != AUTOMATIC TWO-QUESTION CHAIN

MISSING MILESTONE MUST BE VISIBLE OR MERGED
MISSING MILESTONE MUST NOT BE SILENT

BOUNDED PBL IS APPROVED AS A WHOLE

UNAPPROVED PAGE SPLIT IS FORBIDDEN
```

## 15. Distance

```text
GOAL_DISTANCE_BEFORE = D3_GCTX_APPROVED_SEMANTIC_BINDING_SCHEMA_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_SCENARIO_AND_BOUNDED_PBL_CLOSURE_CONTRACT_LOCKED_PENDING_CI
DISTANCE_REDUCED     = added complete 2–5 question dependency, ledger, milestone and terminal-outcome ownership
REMAINING_BLOCKERS   = [source governance, semantic breadth, layout contracts, fixtures, validator implementation, runtime resolver, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P03_SourceMiningCommonKnowledgeAndEvidenceGovernance
```
