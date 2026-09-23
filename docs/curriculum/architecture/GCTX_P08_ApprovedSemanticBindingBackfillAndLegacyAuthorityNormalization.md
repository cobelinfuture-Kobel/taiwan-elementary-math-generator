# GCTX-P08 Approved Semantic Binding Backfill and Legacy Authority Normalization

## 1. Milestone

P08 converts the P07 eligibility result into a deterministic admission manifest for exact P01 semantic bindings.

It does not claim that a PatternSpec already has a valid approved binding merely because it is eligible. The formal approved registry is materialized as an empty fail-closed envelope until exact semantic content and review evidence exist.

## 2. Inputs

- P01 exact ApprovedSemanticBinding schema;
- P07 selector-reachable semantic eligibility audit;
- S01 existing unit-local context authority inventory.

## 3. Candidate classes

| Class | Count | Meaning |
|---|---:|---|
| `legacy_authority_normalization` | 81 | Extract an exact P01 binding from existing production or partial unit authority. |
| `new_binding_backfill` | 17 | Author a new source-backed exact binding; no reusable unit authority exists. |

The 175 P07 `not_applicable_non_semantic` PatternSpecs remain excluded.

## 4. Source distribution

| Source | Candidates | Class |
|---|---:|---|
| G3B-U04 | 32 | legacy normalization |
| G3B-U08 | 24 | legacy normalization |
| G4A-U08 | 17 | new binding backfill |
| G4B-U04 | 6 | legacy normalization |
| G5A-U02 | 8 | legacy normalization |
| G5A-U08 | 11 | legacy normalization |

## 5. Formal registry boundary

The P01 target path now exists:

```text
data/curriculum/context/registry/approved-semantic-bindings.json
```

P08 requires:

```text
entries = []
production selection = forbidden
runtime resolution = forbidden
```

Candidate admission rows are not `approvedSemanticBindingEntry` objects. They deliberately omit unverified fields such as `contextFamilyId`, `eventFlow`, `quantityRoles`, `questionRole`, and `reviewEvidence`.

## 6. Legacy normalization evidence

For each of the 81 legacy candidates, the manifest retains:

- authority IDs;
- authority and consumer paths;
- migration priority and target;
- preservation rules;
- deterministic legacy replay keys.

No existing unit file is deleted or rewritten in P08.

## 7. Blocking behavior

P08 blocks on:

- P07 count or eligibility drift;
- missing public unit identity;
- missing S01 authority for an existing-authority candidate;
- duplicate candidate key or binding ID;
- an approved registry entry appearing prematurely;
- any candidate claiming approved lifecycle, production selection, or runtime resolution.

## 8. Acceptance

The focused test must prove:

```text
candidate count = 98
legacy normalization = 81
new backfill = 17
source count = 6
approved registry entries = 0
errors = 0
```

## 9. Scope boundary

```text
no exact P01 binding content yet
no production approval
no runtime validator
no runtime resolver
no unit adapter migration
no renderer or public-control change
```

## 10. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_EXISTING_PATTERNSPEC_ELIGIBILITY_AUDIT_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_BINDING_ADMISSION_AND_LEGACY_NORMALIZATION_PENDING_CI
DISTANCE_REDUCED     = 98 eligible PatternSpecs receive deterministic admission ownership and legacy extraction evidence
REMAINING_BLOCKERS   = [CI, merge, exact binding extraction, review, production admission, validator, resolver, adapters]
NEXT_SHORTEST_STEP   = GCTX-P09_G3BU04ExactSemanticBindingExtractionPilot
```
