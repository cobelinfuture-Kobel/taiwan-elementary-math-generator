# GCTX-P06 — Deterministic Validator and Blocking-Code Contract

## 1. Purpose

P06 converts the P02, P03 and P04 governance rules plus the P05 replayable fixtures into one deterministic validation contract.

```text
P02 complete-chain closure
+ P03 evidence admission
+ P04 fingerprint / duplicate / breadth governance
+ P05 expected positive and negative fixtures
→ seven-stage fail-closed validation contract
```

P06 defines validator behavior. It does not implement the validator.

## 2. Fixed scope

P06 owns:

- validator stage ordering;
- request and result shapes;
- recognized blocking-code union;
- warning-code registry;
- issue sorting and deduplication;
- deterministic replay and digest rules;
- production-eligibility consistency;
- P05 fixture acceptance expectations.

P06 does not:

- implement canonical hashing;
- implement pairwise similarity;
- implement breadth calculation;
- modify P02, P03 or P04 authority;
- migrate any existing unit;
- change generator, runtime, site or renderer behavior.

## 3. Seven-stage pipeline

Every validation run executes exactly seven stages in this order:

```text
1. ruleset_and_request
2. p02_chain_closure
3. p03_evidence_admission
4. p04_fingerprint_canonicalization
5. p04_pairwise_similarity
6. p04_breadth_gate
7. production_admission
```

All stages must run. A stage cannot mutate input. Validation is not fail-fast: every deterministic blocking error is collected.

## 4. Stage 1 — Ruleset and request

This stage validates:

- request shape;
- ruleset version `0.1.0`;
- fingerprint version `pbl-semantic-fingerprint-v1`;
- deterministic replay key;
- SHA-256 input digest;
- known blocking-code registry;
- deterministic output consistency.

Blocking codes:

```text
GCTX_VALIDATOR_REQUEST_INVALID
GCTX_VALIDATOR_RULESET_VERSION_MISMATCH
GCTX_VALIDATOR_INPUT_DIGEST_MISSING
GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE
GCTX_VALIDATOR_NONDETERMINISTIC_OUTPUT
```

## 5. Stage 2 — P02 chain closure

This stage owns the twelve P02 closure codes. It verifies:

- complete two-to-five-question profile;
- required milestones;
- dependency graph;
- quantity ledger;
- decision stage;
- terminal deliverable;
- runtime truncation prohibition;
- accounted omitted nodes;
- declared semantic page span.

P06 cannot repair a failed P02 chain.

## 6. Stage 3 — P03 evidence admission

This stage owns the nineteen P03 evidence codes. It verifies:

- admitted source authority and permitted use;
- discovery/evidence separation;
- required references;
- human review;
- OCR and AI promotion restrictions;
- visual-source review;
- freshness and expiry;
- dispute and contradiction state;
- source-bound exact claims;
- copyright-safe problem-structure use;
- consumer traceability.

Warning:

```text
GCTX_EVIDENCE_REVIEW_DUE_SOON
```

The warning does not override an approved and currently valid evidence state.

## 7. Stage 4 — P04 fingerprint canonicalization

This stage verifies:

- fingerprint presence;
- fingerprint version;
- canonicalization success;
- P02 closure reference;
- P03 evidence reference.

If this stage fails, `canonicalFingerprintHash` must be `null`.

If it passes, a SHA-256 canonical fingerprint is required.

## 8. Stage 5 — P04 pairwise similarity

This stage verifies pairwise comparisons against:

- all approved chains in the unit;
- the global same-family fingerprint index.

It owns exact duplicate, surface-reskin, near-duplicate, missing review and waiver-forbidden errors.

Pairwise assessment IDs are required when this stage passes.

## 9. Stage 6 — P04 breadth gate

This stage verifies:

- archetype floor;
- semantic-family floor;
- approved-chain floor;
- context-domain floor;
- event-flow floor;
- decision-model floor;
- near-duplicate rate;
- unique approved fingerprints;
- surface and numeric capacity counting boundaries.

Warnings:

```text
PBL_TARGET_CHAIN_BAND_NOT_REACHED
PBL_SURFACE_VARIETY_BELOW_TARGET
PBL_NUMERIC_CAPACITY_BELOW_TARGET
```

These warnings concern nonblocking targets. They cannot replace the blocking semantic floors.

## 10. Stage 7 — Production admission

Stage 7 verifies that the final result is internally consistent.

```text
valid =
  blockingErrors.length === 0
  AND every stage passed
```

```text
productionEligible =
  validationMode === production_gate
  AND valid === true
  AND all upstream production gates pass
```

Any blocking error forces:

```text
valid = false
productionEligible = false
```

Authoring and population modes always return `productionEligible = false`, even when valid.

Stage 7 codes:

```text
GCTX_VALIDATOR_STAGE_RESULT_MISSING
GCTX_VALIDATOR_PRODUCTION_ELIGIBILITY_INCONSISTENT
```

## 11. Blocking-code registry

P06 recognizes exactly 58 blocking codes:

```text
P02 closure codes      = 12
P03 evidence codes     = 19
P04 fingerprint codes  = 5
P04 pairwise codes     = 5
P04 breadth codes      = 10
P06 internal codes     = 7
---------------------------
Total                  = 58
```

Every code has exactly one stage owner. Unknown codes fail closed through:

```text
GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE
```

## 12. Warning registry

P06 recognizes exactly four nonblocking warnings:

```text
PBL_TARGET_CHAIN_BAND_NOT_REACHED
GCTX_EVIDENCE_REVIEW_DUE_SOON
PBL_SURFACE_VARIETY_BELOW_TARGET
PBL_NUMERIC_CAPACITY_BELOW_TARGET
```

Warnings:

- have severity `warning`;
- have `blocking = false`;
- do not alter `valid`;
- do not alter `productionEligible`;
- cannot override any blocking error.

## 13. Stable issue ordering

Issues are sorted by:

```text
stageOrder
→ code
→ path
→ entityId
```

Duplicate issue identity is:

```text
stageId|code|path|entityId
```

Duplicate issues collapse to one output record. This guarantees stable replay and diffable CI output.

## 14. Request contract

A request includes:

- validation run ID and mode;
- ruleset and fingerprint versions;
- candidate, unit and source IDs;
- P02 chain and projection IDs;
- P03 evidence IDs;
- P04 fingerprint and breadth profile IDs;
- deterministic replay key;
- SHA-256 input digest.

Unknown request fields are forbidden.

## 15. Result contract

A result includes:

- contract and ruleset versions;
- replay key;
- input and output digests;
- `valid` and `productionEligible`;
- exactly seven ordered stage results;
- blocking errors and warnings;
- canonical fingerprint hash or `null`;
- pairwise assessment IDs;
- breadth-gate result reference.

## 16. Deterministic replay

For the same replay key and input digest, the validator must produce:

- the same output digest;
- the same issue ordering;
- the same classifications;
- the same production eligibility.

The digest incorporates:

- validator contract version;
- ruleset version;
- fingerprint version.

Any mismatch is blocking.

## 17. P05 fixture acceptance

P06 locks P05 expectations as future implementation acceptance:

```text
positive chains = 20
pairwise fixtures = 5
breadth profiles = 10
pairwise scores = [100, 87.25, 59.5, 18, 20.5]
negative breadth profiles = 9
```

The positive breadth fixture must pass. All nine negative breadth fixtures must fail with their declared codes. Numeric capacity cannot substitute for semantic-chain breadth. Fixture-only records remain production-ineligible.

## 18. Production consistency examples

The following are always impossible:

```text
productionEligible = true with any blocking error
productionEligible = true with any failed stage
productionEligible = true with unknown code
productionEligible = true with expired evidence
productionEligible = true with incomplete P02 closure
productionEligible = true with missing fingerprint
productionEligible = true with near duplicate
productionEligible = true with breadth-floor failure
productionEligible = true for a P05 fixture
```

## 19. P06 / P07 / P08 boundary

P07 will audit existing PatternSpecs and units for semantic eligibility and migration readiness. It will not migrate them.

P08 will own implementation contracts and deterministic resolvers after the audit identifies the real compatibility surface.

P06 does not implement runtime validation before that audit.

## 20. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_REPRESENTATIVE_FIXTURE_CORPUS_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_VALIDATOR_AND_BLOCKING_CODE_CONTRACT_LOCKED_PENDING_CI
DISTANCE_REDUCED     = P02/P03/P04 governance and P05 fixtures converted into one deterministic seven-stage validation contract
REMAINING_BLOCKERS   = [CI acceptance, merge, PatternSpec eligibility audit, layout contracts, validator implementation, resolvers, population, unit migrations]
NEXT_SHORTEST_STEP   = GCTX-P07_ExistingPatternSpecSemanticEligibilityAudit
```
