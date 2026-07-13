# S76C G4A-U08 Existing Asset Reuse Audit

## Status

- task: `S76C_G4A_U08_ExistingAssetReuseAudit`
- sourceId: `g4a_u08_4a08`
- mode: planning-only / implementation scope lock
- status: `PASS_REUSE_SCOPE_FROZEN`
- dependency: S76A and S76B

## Evidence baseline

The existing closeout proves that the approved subset already supports numeric generation, Phase2A application generation, hybrid worksheets, answer keys, 200-question output, and regression coverage. The closeout also names Phase2B comparison/rate-difference and multi-component applications as outside the closed scope.

## Decision rule

```text
KEEP    = stable behavior remains authoritative and should not be rewritten.
ADAPT   = preserve behavior but emit or consume canonical ontology metadata.
REPLACE = obsolete coarse contract or misleading coverage declaration.
ADD     = source-authoritative capability absent from the closed subset.
DO_NOT_TOUCH = unrelated system surface outside the pilot.
```

## KEEP inventory

The following component classes remain authoritative unless implementation inspection proves a fidelity blocker:

1. Phase1 numeric sampling and arithmetic generation.
2. Phase2A positive-path application generation.
3. Existing operand bounds, non-zero divisor rules, exact-division policy, and answer calculation.
4. Hybrid numeric/application allocation behavior.
5. Worksheet assembly and question-count handling through 200 items.
6. Existing answer-key production.
7. Existing HTML/PDF rendering behavior.
8. Existing public source-unit route and legacy query compatibility.
9. Existing regression tests as non-regression fixtures.
10. Existing scenario banks after previously accepted semantic fixes.

KEEP does not mean the existing KP labels are canonical. It means the generated behavior is retained and reclassified through the ontology adapter.

## ADAPT inventory

### Generator metadata boundary

Legacy templates must emit or be mapped to:

- canonical `knowledgePointId`;
- `patternGroupId`;
- `patternSpecId`;
- known and unknown quantity roles;
- required intermediate quantities;
- unit flow;
- semantic relations;
- depth and context metadata.

### Existing template reclassification

At minimum, preserve and reclassify these known template families:

| Existing family | Canonical destination |
|---|---|
| add three quantities | `kp_g4a_u08_app_add_sub_sequence` / add-add PatternGroup |
| add then subtract state change | same KP / add-subtract PatternGroup |
| subtract then add state change | same KP / subtract-add PatternGroup |
| subtract twice state change | same KP / subtract-subtract PatternGroup |
| adjusted amount then subtract | `kp_g4a_u08_app_parentheses_grouping` |
| divide by group product | repeated-division or grouped-divisor PatternGroup |
| multiply after difference then overlay | grouped-difference PatternGroup |
| multiply then share | `pg_g4a_u08_multiply_then_share` |
| unit rate then scale | `pg_g4a_u08_unit_rate_then_scale` |
| divide then divide | `pg_g4a_u08_divide_then_divide` |
| payment minus unit cost times quantity | payment-balance PatternGroup |
| subtract/add divided amount | divided-amount overlay PatternGroup |

### Validator entry point

The existing validator entry point may remain, but it must accept `CanonicalGeneratedItem` and run the S76B validation levels. Legacy direct-template inference becomes compatibility-only and must not grant production eligibility.

### Resolver and selector projection

Existing IDs remain aliases during migration. Canonical IDs become authoritative only after resolver and worksheet reachability tests pass.

## REPLACE inventory

1. The coarse assumption that one application KP is sufficient for all multiply/divide unknown roles.
2. Validator contracts that prove only arithmetic correctness or template membership.
3. Silent inference of KP/PatternGroup from prompt wording.
4. D0 wording that could be read as full-source closure.
5. Coverage reports that use PatternSpec hook coverage as a proxy for source-KP validator coverage.

Historical markers remain immutable; a later full-source closeout adds a new scoped marker instead of rewriting history.

## ADD inventory

The pilot implementation must add:

1. canonical KP, PatternGroup, and PatternSpec registries for G4A-U08;
2. a deterministic legacy-to-canonical GeneratedItem adapter;
3. PatternGroup-level ValidatorContracts;
4. blocking mutation fixtures;
5. the four source-authoritative extension groups:
   - comparison chain;
   - equal-value unit price;
   - relative difference;
   - two-cost-component payment;
6. source, validator, mutation, and worksheet reachability reports.

## DO_NOT_TOUCH inventory

Unless a direct integration test proves necessity, this pilot must not modify:

- unrelated grade/unit registries;
- G5A-U08 ontology or validator behavior;
- global worksheet visual design;
- unrelated public selectors;
- shared arithmetic semantics for other units;
- repository-wide error code renaming;
- source PDFs;
- historical closeout markers;
- decimal/fraction capability;
- broad renderer or CSS redesign.

## Implementation sequence lock

```text
S76D registry rebase
S76E existing PatternSpec reclassification
S76F canonical GeneratedItem adapter
S76G ValidatorContract rebase
S76H existing-scope mutation rejection
S76I Phase2B missing PatternGroups
S76J resolver/selector/worksheet integration
S76K full-source stress and semantic QA
S76L full-source D0 closeout and migration cost readback
```

## Implementation preflight requirements

Before S76D writes code, the implementation branch must inventory exact repository paths for:

- G4A-U08 generator and mirror files;
- G4A-U08 registries and browser projections;
- validator entry points and tests;
- resolver, selector, and worksheet routing;
- renderer and answer-key integration;
- current authoritative test command.

Path discovery is implementation preflight, not permission to broaden scope. Any required change outside KEEP/ADAPT/REPLACE/ADD categories is a stop condition.

## Acceptance checks

- [x] Stable runtime assets are retained.
- [x] Ontology and validator contracts are identified for rebase.
- [x] Missing source capabilities are bounded.
- [x] Historical D0 remains immutable and explicitly scoped.
- [x] Unrelated units and UI redesign are prohibited.
- [x] Implementation sequence is fixed.
- [x] Exact path inventory is required before code writes.

## Planning gate result

```text
SOURCE_AUTHORITY_FROZEN = true
REBASE_STANDARD_FROZEN  = true
REUSE_SCOPE_FROZEN      = true
PROHIBITED_SCOPE_LISTED = true
PLANNING_GATE            = PASS
```

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_BATCHA_VALIDATOR_ONTOLOGY_STANDARD_FROZEN
GOAL_DISTANCE_AFTER  = D2_G4A_U08_IMPLEMENTATION_SCOPE_LOCKED
DISTANCE_REDUCED     = Stable runtime assets, adapter boundaries, replacement contracts, missing source groups, and prohibited scope are now fixed.
REMAINING_BLOCKERS   = [implementation preflight exact-path inventory, implementation approval gate]
NEXT_SHORTEST_STEP   = S76D_G4A_U08_KnowledgePointAndPatternGroupRegistryRebase
STOP_REASON          = IMPLEMENTATION_APPROVAL_GATE
BLOCKER_TYPE         = POLICY_GATE
LAST_COMPLETED_STATUS = PASS_REUSE_SCOPE_FROZEN
REQUIRED_OPERATOR_ACTION = Approve transition from planning-only S76A-S76C into implementation S76D-S76L.
NEXT_RESUME_TASK      = S76D_G4A_U08_KnowledgePointAndPatternGroupRegistryRebase
```
