# GCTX-P05 — Representative Positive and Negative Fixture Corpus

## 1. Purpose

P05 materializes the smallest replayable corpus that demonstrates the P02, P03 and P04 contracts together.

```text
P02 complete chain identity
+ P03 synthetic evidence traceability
+ P04 canonical fingerprint and breadth rules
→ deterministic positive and negative fixtures
```

The corpus is not a PBL content pack. It is test evidence for later validators.

## 2. Fixture-only boundary

Every corpus object declares:

```text
fixtureOnly = true
productionAdmissible = false
runtimeSelectable = false
```

The corpus:

- contains no real-world claims;
- contains no admitted P03 production evidence;
- contains no production P02 chains;
- cannot be loaded by runtime;
- cannot be promoted to production;
- cannot satisfy a unit population requirement by itself.

Fixture evidence IDs and projection IDs are synthetic references used only to prove traceability fields are structurally present.

## 3. Corpus structure

The resolved corpus contains:

```text
20 positive chain fixtures
5 pairwise classification fixtures
10 breadth-profile fixtures
```

The implementation is split across deterministic test modules because these are executable fixtures, not runtime registry rows.

```text
gctx-p05-fixture-helpers.js
gctx-p05-positive-chains-a.js
gctx-p05-positive-chains-b.js
gctx-p05-positive-chains.js
gctx-p05-pairwise-fixtures.js
gctx-p05-breadth-profile-fixtures.js
gctx-p05-representative-fixture-corpus.js
```

## 4. Twenty genuinely different positive chains

The positive corpus covers:

```text
5 archetypes
16 semantic families
20 approved-chain identities
5 context domains
20 event-flow signatures
20 decision models
```

The five archetypes are:

- planning;
- comparison;
- resource allocation;
- data investigation;
- controlled history/social task.

The five domains are:

- daily life;
- SDG;
- natural science;
- social studies;
- history.

Every positive chain owns all eight P04 identity dimensions:

```text
project archetype
project goal
required milestones
event flow
quantity dependency graph
decision model
mathematical composition
terminal deliverable
```

Each canonical identity key is unique. Surface and numeric capacity are stored separately.

## 5. Positive corpus metrics

The expected resolved metrics are:

```text
PBL_ARCHETYPE_COUNT          = 5
PBL_SEMANTIC_FAMILY_COUNT    = 16
PBL_APPROVED_CHAIN_COUNT     = 20
SURFACE_VARIANT_COUNT        = 450
NUMERIC_INSTANCE_CAPACITY    = 41000
CONTEXT_DOMAIN_COUNT         = 5
EVENT_FLOW_SIGNATURE_COUNT   = 20
DECISION_MODEL_COUNT         = 20
TOTAL_PROPOSED_CHAIN_COUNT   = 22
NEAR_DUPLICATE_CANDIDATES    = 2
REJECTED_DUPLICATES          = 2
NEAR_DUPLICATE_RATE          = 0.090909
UNIQUE_APPROVED_FINGERPRINTS = true
```

The positive profile passes every P04 blocking floor.

## 6. Pairwise fixtures

### 6.1 Exact surface reskin

The second candidate keeps all eight semantic dimensions unchanged but replaces actors, places, objects, wording, numbers and random seed.

```text
weighted score = 100
classification = exact_semantic_duplicate
surface reskin = true
blocking = true
```

This proves surface and numeric variation cannot create a new chain.

### 6.2 Near duplicate

The candidate adds a cost milestone and small decision wording changes while retaining nearly the same project architecture.

```text
weighted score = 87.25
classification = near_duplicate
blocking = true
```

### 6.3 Same-family distinct chain

Meal allocation and library-book allocation preserve a resource-allocation family while changing multiple material dimensions.

```text
weighted score = 59.5
classification = same_family_distinct_chain
counts as chain = true
counts as family = false
```

### 6.4 Distinct family

Transport comparison and rainfall investigation differ across goal, flow, graph, decision and deliverable.

```text
weighted score = 18
classification = distinct_family
counts as chain = true
counts as family = true
```

### 6.5 Distinct archetype

Emergency reserve planning and community budget selection differ in archetype and additional identity dimensions.

```text
weighted score = 20.5
classification = distinct_archetype
counts as chain = true
counts as family = true
```

## 7. Breadth-profile fixtures

One positive profile passes every floor. Nine negative profiles isolate each blocking condition:

1. archetype count below four;
2. semantic-family count below twelve;
3. approved-chain count below twenty;
4. context-domain count below three;
5. event-flow signature count below four;
6. decision-model count below three;
7. near-duplicate rate above twenty percent;
8. approved fingerprint collision;
9. numeric capacity incorrectly used to replace a missing chain.

The numeric-substitution fixture deliberately declares:

```text
approved chain count = 19
numeric instance capacity = 1,000,000
```

It remains blocked by both:

```text
PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT
PBL_NUMERIC_CAPACITY_COUNTING_FORBIDDEN
```

## 8. Why surface substitution is represented pairwise

Surface substitution is an identity-comparison failure rather than a population-metric failure. It is therefore tested as the exact surface-reskin pair instead of being duplicated as an eleventh breadth profile.

The schema and contract remain exact:

```text
pairwise fixtures = 5
breadth profiles = 10
```

## 9. P05 / P06 boundary

P05 provides expected inputs and outcomes.

P06 will define:

- fingerprint canonicalizer contract;
- weighted similarity calculator contract;
- near-duplicate classifier contract;
- breadth-gate validator contract;
- blocking-code execution contract.

P05 does not implement production validators or runtime indexes.

## 10. Scope exclusions

P05 does not:

- collect external sources;
- create real common-knowledge facts;
- author production PBL chains;
- calculate actual unit breadth;
- change P02, P03 or P04 authority;
- implement runtime hashing or similarity;
- change any unit, generator, validator, site or renderer.

## 11. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_PBL_SEMANTIC_BREADTH_AND_DEDUP_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_REPRESENTATIVE_FIXTURE_CORPUS_LOCKED_PENDING_CI
DISTANCE_REDUCED     = replayable positive and negative evidence materialized for semantic identity, duplicate classification and breadth gates
REMAINING_BLOCKERS   = [CI acceptance, merge, validator contracts, layout contracts, resolver, production population, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P06_ValidatorAndBlockingCodeContract
```
