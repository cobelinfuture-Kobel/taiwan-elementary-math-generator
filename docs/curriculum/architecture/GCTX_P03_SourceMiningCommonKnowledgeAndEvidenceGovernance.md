# GCTX-P03 — Source Mining, Common Knowledge and Evidence Governance

## 1. Purpose

P03 defines the only admissible path from an external or uploaded source to a reusable GCTX evidence record.

```text
source discovery
→ source-authority admission
→ evidence extraction
→ human review
→ verification
→ approval
→ traceable consumer use
→ scheduled re-review / expiry / dispute handling
```

P03 is governance only. It does not populate a source corpus, common-knowledge bank, authentic-problem registry, unit binding, ScenarioChain or BoundedPBL chain.

## 2. Fixed authority boundary

P00 assigns source admission, verification evidence, review metadata, expiry metadata and exact source-bound claims to global governance.

P03 may own:

- source-authority admission;
- discovery records;
- source references and evidence locators;
- common-knowledge evidence;
- authentic problem-structure evidence;
- human verification records;
- freshness and expiry policy;
- contradiction handling;
- evidence-to-consumer traceability.

P03 must not own:

- unit mathematics;
- operation signatures;
- quantity dependencies;
- answer models;
- PatternSpec generation rules;
- approved semantic bindings;
- approved ScenarioChain or BoundedPBL closure;
- runtime selection;
- renderer layout.

## 3. Discovery is not evidence

A search result, URL, citation lead or uploaded file begins as a `discoveryRecord`.

```text
discoveryRecord.admissibleEvidence = false
discoveryRecord.requiresAdmissionReview = true
discoveryRecord.runtimeDiscovered = false
```

A discovery record can lead to source-authority review and evidence extraction. It cannot support production content by itself.

Runtime source discovery and runtime web search are forbidden.

## 4. Source-authority admission

Every cited reference must resolve to a reviewed `sourceAuthorityEntry`.

Authority tiers are:

```text
official_public_authority
museum_library_university
education_or_science_institution
trusted_reference
discovery_only
disallowed
```

Each authority declares:

- permitted evidence kinds;
- permitted uses;
- approved context domains;
- admission status;
- review timestamp;
- lifecycle status.

`discovery_only` sources may help locate stronger references, but cannot be the sole support for approved evidence. `disallowed` sources cannot support evidence.

## 5. Human verification and OCR boundary

The formal invariant is:

```text
OCR may create a candidate draft.
OCR may not establish source-backed or verified evidence.
AI may not approve or promote evidence.
Visual PDF interpretation requires operator visual review.
```

Accepted review roles are:

- `operator_visual_reviewer`;
- `source_governance_reviewer`;
- `curriculum_reviewer`.

Accepted review methods include direct text review, operator visual review, cross-source confirmation, official dataset lookup, archived snapshot review and OCR-assisted human review.

Every review object fixes:

```text
aiSoleReviewer = false
ocrSoleEvidence = false
humanReviewRequired = true
```

Status promotion requires an auditable verification event.

## 6. Common-knowledge evidence

A `commonKnowledgeEvidenceEntry` owns one reviewable claim and its evidence boundary.

Required claim scopes:

### 6.1 General common knowledge

- minimum one admissible reference;
- claim must stay within the cited evidence scope;
- production approval still requires human review and freshness metadata.

### 6.2 Specific species, region, era or institution

- minimum two independent references;
- scope, region, era and grade-band applicability must be explicit;
- unresolved source disagreement blocks approval.

### 6.3 Exact fact or statistic

- exact value is source-bound;
- value mutation is forbidden;
- exact value text is retained in the evidence record;
- exercise numbers use `source_bound_exact_values_only`;
- a primary source is preferred.

For ordinary practice items, exercise numbers remain fictionalized by default. Common knowledge supplies semantic background and constraints, not mathematical answers.

## 7. Authentic problem-structure evidence

An `authenticProblemEvidenceEntry` records the structure of a real instructional, civic, scientific, historical or planning task.

The extracted structure contains:

- project-goal summary;
- project-archetype candidate;
- at least two required milestone functions;
- event-flow summary;
- deterministic decision-criteria summary;
- terminal-deliverable summary;
- mathematical-composition tags.

The evidence record is not an approved PBL chain.

```text
originalWordingReuseAllowed = false
extractionIsApprovedPblChain = false
structureOnlyParaphrase = true
fullPromptCopyAllowed = false
answerKeyCopyAllowed = false
```

P02 remains the authority for approved complete question-count projections, dependencies, quantity ledgers, decisions and terminal outcomes.

## 8. Freshness and expiry

Every approved evidence record has:

- `verifiedAt`;
- `reviewDueAt`;
- a freshness class;
- `validUntil` when time-bounded or rapidly changing;
- `autoApproveOnRefresh = false`.

Freshness classes are:

```text
stable
slow_changing
time_bounded
rapidly_changing
```

Expired evidence is not production-admissible. Reuse requires human reverification and a new verification event.

## 9. Contradiction handling

Every evidence record declares one contradiction state:

```text
none
unresolved
resolved
```

An unresolved contradiction:

- lists at least two conflicting references;
- cannot be production-admissible;
- cannot be hidden by fallback;
- requires a human resolution decision or rejection.

A resolved contradiction requires a resolution note and a referenced human review.

## 10. Production admission

Production use requires all of the following:

```text
lifecycleStatus = approved
productionAdmissible = true
source authority admitted for the evidence kind and use
audit-ready references present
human review present
freshness valid
contradiction state = none or resolved
consumer traceability present when consumed
```

Candidate, reviewed, verified, expired, disputed, blocked, deprecated and rejected evidence are not production-admissible.

## 11. Consumer traceability

Approved evidence can be linked to:

- common-knowledge assets;
- ContextFamilies;
- P01 ApprovedSemanticBindings;
- P02 ScenarioChains;
- P02 BoundedPBL chains.

Every link declares the consumer ID and use mode. Deprecation, expiry or dispute therefore supports an impact audit instead of silently leaving stale facts in production assets.

## 12. Blocking conditions

P03 reserves blocking conditions for:

- non-admitted or impermissible sources;
- discovery records used as evidence;
- missing references or human review;
- OCR-only or AI-only promotion;
- missing visual review;
- insufficient references for specific claims;
- expired or disputed evidence;
- unresolved contradictions;
- non-source-bound exact claims;
- exact-value mutation;
- verbatim authentic-problem copying;
- runtime web search;
- unapproved evidence fallback;
- evidence changing unit mathematics;
- missing consumer traceability.

## 13. P03 / P04 boundary

P03 answers:

```text
Is this source admissible?
What exactly does it support?
Who verified it?
When must it be reviewed again?
Is there a contradiction?
Which approved asset consumes it?
```

P04 answers:

```text
Does this proposed PBL chain represent a genuinely different semantic chain?
Is it a surface reskin or near duplicate?
Does the unit have sufficient archetype, family and chain breadth?
```

P03 does not define semantic fingerprints, near-duplicate thresholds or per-unit breadth gates.

## 14. Scope exclusions

This milestone does not:

- browse or collect sources at runtime;
- add source-authority seeds;
- add common-knowledge facts;
- add authentic problem examples;
- modify any G3–G6 unit;
- change generator, validator, site or renderer behavior;
- implement P04 semantic breadth;
- implement evidence registry loading.

## 15. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_SCENARIO_AND_BOUNDED_PBL_CLOSURE_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_SOURCE_EVIDENCE_GOVERNANCE_LOCKED_PENDING_CI
DISTANCE_REDUCED     = source discovery converted into admissible, reviewed, expiring and traceable evidence authority
REMAINING_BLOCKERS   = [CI acceptance, merge, semantic breadth, layout contracts, fixtures, validators, resolver, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract
```
