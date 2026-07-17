# GCTX-P03 Readback

## Scope

```text
schema and contract only
no source corpus
no common-knowledge seed
no authentic-problem seed
no runtime
no unit migration
no P04 semantic breadth or deduplication
no renderer implementation
```

## Locked decisions

1. Source discovery is design-time only and a discovery record is never admissible evidence.
2. Every evidence reference resolves to a reviewed source authority with explicit permitted evidence kinds, uses and domains.
3. `discovery_only` sources cannot be the sole support for approved evidence; disallowed sources cannot support evidence.
4. OCR may create a candidate draft only. It cannot establish `sourceBacked`, `verified` or `approved` evidence.
5. AI cannot promote or approve evidence. Every status promotion requires auditable human review.
6. Visual PDF interpretation requires operator visual review; OCR-assisted review remains human-controlled.
7. General common knowledge requires at least one admissible reference.
8. Claims tied to a species, region, era or institution require at least two independent references.
9. Exact facts and statistics are source-bound and immutable; ordinary exercise numbers remain fictionalized by default.
10. Authentic problem evidence extracts project goal, milestones, event flow, decision criteria, terminal deliverable and mathematical composition only.
11. Authentic source wording, complete prompt and answer key cannot be copied into production assets.
12. Evidence freshness, review due dates, expiry, disputes and contradictions are blocking production concerns.
13. Unresolved contradictions and expired evidence are not production-admissible.
14. Approved evidence links to its consuming common-knowledge asset, ContextFamily, P01 binding or P02 chain through stable traceability.
15. P03 evidence cannot change unit mathematics, PatternSpec authority, P01 semantic bindings or P02 closure.
16. P04 exclusively owns semantic fingerprints, near-duplicate detection and breadth gates.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_SCENARIO_AND_BOUNDED_PBL_CLOSURE_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_SOURCE_EVIDENCE_GOVERNANCE_LOCKED_PENDING_CI
DISTANCE_REDUCED     = source discovery converted into admissible, reviewed, expiring and traceable evidence authority
REMAINING_BLOCKERS   = [CI acceptance, merge, semantic breadth, layout contracts, fixtures, validators, resolver, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract
```
