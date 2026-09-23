# GCTX-P07 Existing PatternSpec Semantic Eligibility — Readback

## Status

```text
PASS_ACCEPTED_PENDING_MERGE
```

## Accepted audit

| Metric | Result |
|---|---:|
| Public sources | 15 |
| Visible KnowledgePoints | 156 |
| Selector-reachable PatternSpecs | 273 |
| Eligible with existing authority | 81 |
| Eligible requiring binding backfill | 17 |
| Total eligible for P08 | 98 |
| Non-semantic / not applicable | 175 |
| Audit errors | 0 |

## Eligible distribution

| Source | PatternSpecs | Eligible |
|---|---:|---:|
| G3A-U01 | 20 | 0 |
| G3A-U02 | 10 | 0 |
| G3A-U03 | 7 | 0 |
| G3A-U06 | 6 | 0 |
| G3B-U01 | 23 | 0 |
| G3B-U04 | 33 | 32 |
| G3B-U08 | 24 | 24 |
| G4A-U01 | 18 | 0 |
| G4A-U02 | 9 | 0 |
| G4A-U04 | 7 | 0 |
| G4A-U08 | 33 | 17 |
| G4B-U01 | 12 | 0 |
| G4B-U04 | 19 | 6 |
| G5A-U02 | 22 | 8 |
| G5A-U08 | 30 | 11 |

The zero rows are not missing work. Their current selector-reachable PatternSpecs expose no controlled application/context signal and are therefore intentionally excluded from GCTX binding backfill. A later source-backed application PatternSpec may enter the audit when it becomes selector reachable.

## Identity correction

The first CI run exposed a source-key mismatch:

```text
incorrect evidence-packet alias: g5a_u02_5a02a
canonical selector source ID:    g5a_u02_5a02
```

The contract and tests now use the canonical selector ID while retaining packet IDs only as evidence aliases.

## Acceptance evidence

```text
Node Test run 29651898558: PASS
Math CI Readback run 29651898544: PASS
```

The focused audit verifies all 273 PatternSpecs, exact accepted counts, no duplicate/conflicting decision, and the closed P08 consumer boundary.

## Scope boundary

```text
runtime behavior changed = false
registry population changed = false
unit migration changed = false
renderer/UI changed = false
ApprovedSemanticBinding rows created = false
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_VALIDATOR_CONTRACT_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_EXISTING_PATTERNSPEC_ELIGIBILITY_AUDIT_ACCEPTED_PENDING_MERGE
DISTANCE_REDUCED     = 273 PatternSpecs now have deterministic semantic eligibility ownership; 98 may proceed and 175 are protected from forced context injection
REMAINING_BLOCKERS   = [merge, ApprovedSemanticBinding backfill, legacy authority normalization, production population, runtime validator, runtime resolver, unit migrations]
NEXT_SHORTEST_STEP   = GCTX-P08_ApprovedSemanticBindingBackfillAndLegacyAuthorityNormalization
```
