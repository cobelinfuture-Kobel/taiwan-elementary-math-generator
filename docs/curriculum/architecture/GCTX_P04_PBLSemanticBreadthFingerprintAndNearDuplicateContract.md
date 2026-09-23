# GCTX-P04 — PBL Semantic Breadth, Fingerprint and Near-Duplicate Contract

## 1. Purpose

P04 defines what counts as one genuinely different PBL semantic chain and what does not.

The core invariant is:

```text
one million numeric versions of one project structure
still equal one semantic chain
```

P04 prevents superficial reskins from inflating PBL breadth metrics.

## 2. Fixed authority boundary

P04 depends on:

```text
P02 = approved complete ScenarioChain / BoundedPBL closure
P03 = approved source and evidence authority
```

P04 owns:

- PBL semantic fingerprints;
- canonical fingerprint generation rules;
- semantic-family identity;
- pairwise near-duplicate assessment;
- PBL breadth metrics;
- per-unit breadth floors;
- cross-domain coverage accounting;
- duplicate and breadth blocking conditions.

P04 must not change:

- P02 project goals, milestones, dependency graphs, quantity ledgers, decisions or terminal deliverables;
- P03 source admission, evidence verification, freshness or contradiction status;
- KnowledgePoint or PatternSpec mathematics;
- runtime selection;
- generator, validator or renderer implementation.

## 3. Eight semantic identity dimensions

A PBL chain is identified by eight material dimensions:

```text
1. project_archetype
2. project_goal
3. required_milestones
4. event_flow
5. quantity_dependency_graph
6. decision_model
7. mathematical_composition
8. terminal_deliverable
```

A chain is not genuinely distinct unless its identity changes materially in these dimensions.

Examples of material differences:

- planning a feasible resource allocation versus comparing two completed plans;
- determining total supply and demand versus investigating a data trend;
- a linear dependency chain versus a branch-and-merge dependency graph;
- minimum-cost decision versus capacity-sufficiency decision;
- producing an allocation plan versus producing a ranked recommendation.

## 4. Surface and numeric variation are excluded

The fingerprint excludes:

```text
numeric values
numeric profile IDs
random seeds
actor names
place names
object names
language variant IDs
wording variants
cosmetic context nouns
context-domain labels
source URLs
```

Therefore the following do not create a new chain:

```text
bus → train
Taipei → Kaohsiung
Class A → Class B
120 students → 180 students
version A wording → version B wording
SDG label → daily-life label
```

These may increase surface variety, numeric capacity or domain coverage, but not semantic-chain count.

## 5. Canonicalization

Before hashing, each approved P02 chain is canonicalized.

```text
ordered milestones keep their order
ordered event flow keeps its order
dependency graph is canonicalized
unordered tag sets are sorted
raw wording is removed
numeric values are removed
stable IDs are required
```

The canonical representation is hashed with SHA-256 under:

```text
fingerprintVersion = pbl-semantic-fingerprint-v1
```

A changed fingerprint version requires explicit migration and comparison reprocessing.

## 6. Weighted similarity model

The eight dimensions use a total weight of 100:

| Dimension | Weight |
|---|---:|
| Project archetype | 15 |
| Project goal | 15 |
| Required milestones | 15 |
| Event flow | 15 |
| Quantity dependency graph | 15 |
| Decision model | 10 |
| Mathematical composition | 10 |
| Terminal deliverable | 5 |

Each pairwise comparison records every component score, weighted contribution and total similarity.

The model is deterministic and auditable. A single unstructured text similarity score is insufficient.

## 7. Classification

### 7.1 Exact semantic duplicate

```text
total score = 100
all eight identity dimensions equal
blocking = true
counts as approved chain = false
counts as semantic family = false
```

A surface reskin with the same canonical fingerprint is an exact semantic duplicate.

### 7.2 Near duplicate

```text
80 <= score < 100
blocking = true
counts as approved chain = false
counts as semantic family = false
waiver allowed = false
```

Near duplicates cannot be accepted merely because a reviewer likes the wording or context.

### 7.3 Same-family distinct chain

```text
50 <= score < 80
at least two material identity dimensions change
blocking = false
counts as approved chain = true
counts as new semantic family = false
```

### 7.4 Distinct semantic family

```text
score < 50
at least two family-defining dimensions change
blocking = false
counts as approved chain = true
counts as new semantic family = true
```

### 7.5 Distinct archetype

Changing the archetype label alone is insufficient. A distinct archetype requires:

```text
archetype change
+ at least one additional material identity-dimension change
```

## 8. Semantic-family identity

A semantic family is identified by:

```text
archetype ID
goal-class signature
milestone-pattern signature
decision-model class
terminal-deliverable class
mathematical-composition class
```

A new family requires material changes in at least two family dimensions.

The following cannot create a new family:

- new numbers;
- new language variants;
- new actors, places or objects;
- context-domain relabeling;
- cosmetic scenario nouns.

## 9. Pairwise assessment

Every candidate chain is compared against:

```text
all approved chains in the same unit
+ the global index for the same semantic family
```

Every assessment requires:

- all eight component scores;
- weighted total;
- classification;
- surface-reskin flag;
- exact-identity collision flag;
- human confirmation;
- review notes;
- retained audit record for rejected duplicates.

Near-duplicate waiver is forbidden.

## 10. Metrics are separated

P04 tracks distinct quantities separately:

```text
PBL_ARCHETYPE_COUNT
PBL_SEMANTIC_FAMILY_COUNT
PBL_APPROVED_CHAIN_COUNT
SURFACE_VARIANT_COUNT
NUMERIC_INSTANCE_CAPACITY
CONTEXT_DOMAIN_COUNT
EVENT_FLOW_SIGNATURE_COUNT
DECISION_MODEL_COUNT
NEAR_DUPLICATE_CANDIDATE_COUNT
REJECTED_DUPLICATE_COUNT
NEAR_DUPLICATE_RATE
```

The following are not production breadth metrics:

```text
THEORETICAL_COMBINATION_COUNT
surface variant count
numeric instance capacity
```

They may describe runtime capacity, but they cannot substitute for approved semantic-chain breadth.

## 11. Per-unit breadth gate

A production unit must meet these minimum floors:

```text
PBL_ARCHETYPE_COUNT >= 4
PBL_SEMANTIC_FAMILY_COUNT >= 12
PBL_APPROVED_CHAIN_COUNT >= 20
CONTEXT_DOMAIN_COUNT >= 3
EVENT_FLOW_SIGNATURE_COUNT >= 4
DECISION_MODEL_COUNT >= 3
NEAR_DUPLICATE_RATE <= 0.20
all approved fingerprint hashes unique
```

The target approved-chain band is:

```text
30 to 40 chains per production unit
```

The minimum floor is blocking. The target band is a production-planning target and is not independently blocking.

## 12. Cross-domain coverage

The available domains remain:

```text
daily_life
sdg
natural_science
social_studies
history
```

A production unit must cover at least three domains.

Domain breadth and chain breadth are separate:

```text
same semantic chain recontextualized across three domains
= one approved chain
= three-domain coverage only when each approved domain projection is admitted
```

A domain label change may raise domain coverage. It cannot raise semantic-chain count.

## 13. P02 and P03 traceability

Every fingerprint references:

- one approved P02 chain and its complete projection profiles;
- approved P03 evidence records supporting common knowledge or authentic problem structure.

A fingerprint cannot repair an incomplete P02 chain. A semantically distinct chain cannot use unapproved P03 evidence.

## 14. Production eligibility

A PBL population is production-eligible only when:

```text
P02 complete projections approved
P03 evidence approved and current
canonical fingerprints present
pairwise assessments complete
exact duplicates absent
near duplicates absent
surface reskins absent
all breadth floors pass
near-duplicate rate passes
all approved fingerprint hashes unique
```

Surface variety and numeric capacity cannot compensate for missing semantic breadth.

## 15. Blocking conditions

P04 reserves blocking conditions for:

- missing or version-mismatched fingerprints;
- failed canonicalization;
- exact duplicates;
- surface reskins;
- near duplicates;
- missing pairwise review;
- attempted near-duplicate waiver;
- insufficient archetype, family, chain, domain, event-flow or decision breadth;
- excessive near-duplicate rate;
- fingerprint collisions;
- counting surface variants or numeric capacity as chains;
- missing P02 closure or P03 evidence references.

## 16. P04 / P05 / P06 boundary

P04 defines the schema and governance contract.

P05 will provide representative fixtures:

- distinct archetypes;
- distinct families;
- same-family distinct chains;
- exact surface reskins;
- near duplicates;
- a representative unit breadth profile.

P06 will define executable validator and blocking-code contracts.

P04 does not populate production chains and does not implement the similarity engine.

## 17. Scope exclusions

This milestone does not:

- add PBL archetype seeds;
- add semantic-family seeds;
- add approved chains;
- calculate real unit breadth;
- implement fingerprint hashing;
- implement pairwise similarity;
- implement validators;
- modify existing G3–G6 units;
- modify generator, site or renderer behavior.

## 18. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_SOURCE_EVIDENCE_GOVERNANCE_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_PBL_SEMANTIC_BREADTH_AND_DEDUP_CONTRACT_LOCKED_PENDING_CI
DISTANCE_REDUCED     = genuine PBL semantic-chain breadth separated from surface and numeric capacity with blocking duplicate gates
REMAINING_BLOCKERS   = [CI acceptance, merge, representative fixtures, layout contracts, validators, resolver, population, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P05_RepresentativePositiveNegativeFixtureCorpus
```
