# S84 — G5A-U02 FormalMapping and Hidden PatternSpec Materialization

```text
TASK = S84_G5A_U02_FormalMappingAndHiddenPatternSpecMaterialization
STATUS = AUTHORITATIVE_MATERIALIZED_HIDDEN_NOT_ROUTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## 1. Scope

S84 consumes the merged S82 PatternSpec base and the higher-precedence S83 QA overlay, then materializes the first authoritative hidden runtime-neutral authority for G5A-U02.

```text
S80/S81 FormalMapping candidates and QA
+ S82 PatternSpec contracts
+ S83 QA overlay and closeout
→ 22 authoritative FormalMappings
→ 18 authoritative hidden PatternGroups
→ 22 authoritative hidden PatternSpecs
→ deeply frozen browser-neutral projection
```

S84 does not implement generation, blocking-validator runtime, public selectors, canonical routing, worksheet assembly, rendering, source-metadata correction or production promotion.

## 2. Materialized artifacts

```text
data/curriculum/mapping/S84_G5A_U02_FormalMapping.json
data/curriculum/pattern_specs/S84_G5A_U02_PatternSpecRegistry.json
site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js
```

Cardinality:

```text
KnowledgePoints             = 18
FormalMappings              = 22
PatternGroups               = 18
PatternSpecs                = 22
Answer models               = 16
Base template families      = 8
Effective template variants = 9
Class C PatternSpecs        = 14
Class D PatternSpecs        = 8
```

## 3. Effective-contract authority

Every S84 and later consumer must resolve:

```text
1. S82_G5A_U02_PatternSpecContractDesign
2. S83_G5A_U02_PatternSpecContractQA
```

S83 has higher precedence. Direct consumption of an uncorrected S82 contract is forbidden.

Mandatory S83 corrections:

1. all 16 answer schemas are closed and the factor quotient witness is conditional;
2. all controlled-template roles are exactly bound, with two closed equal-partition variants;
3. grouping and packaging do not impose cross-category equality, and area units are derived from length units;
4. problem-type classification uses a finite mutually exclusive decision table;
5. factor and complete-factor statements use a closed grammar with relation direction and Boolean-vector alignment;
6. all 64 blocking codes are assigned exactly once across nine stages, with required S81 and statement-grammar hook augmentations.

## 4. FormalMapping materialization

All 22 accepted candidate mappings retain one-to-one traceability:

```text
fmc_g5a_u02_*
→ fm_g5a_u02_*
→ ps_g5a_u02_*
```

Each materialized row preserves the candidate identity, KnowledgePoint, PatternGroup, mode, answer model, implementation class, controlled templates, source evidence, deterministic order and QA-overlay references.

No accepted mapping is removed, merged or renumbered.

## 5. Hidden PatternGroup and PatternSpec registry

Mode totals:

```text
concept                = 4
numeric                = 6
representation         = 1
reasoning              = 3
application            = 4
reasoning_application  = 2
geometry_application   = 2
---------------------------
total                  = 22
```

All 18 groups are complete and non-overlapping. A group may contain multiple controlled modes where the accepted S82 group does so; `pg_g5a_u02_factor_membership_judgement` therefore preserves its numeric-selection and concept-statement members without flattening their modes.

The browser-neutral projection is deeply frozen and exposes read-only accessors. S84 does not import it into any visible selector or canonical resolver.

## 6. Source identity boundary

The stable packet IDs remain:

```text
g5a_u02_5a02a
g5a_u02_5a02a1
```

Hidden materialization is allowed. Public catalog promotion remains blocked until `g5a_u02_5a02a1` metadata displays `公因數` and preserves `https://meow911.com/5a03b/`.

No source registry metadata is changed by S84.

## 7. Lifecycle boundary

```text
materializationStatus = authoritative_materialized_hidden_not_routed
selectorVisibility    = hidden
canonicalRouting      = disabled
generatorStatus       = hidden_not_implemented
validatorStatus       = contract_only_not_runtime
runtimeProjection     = materialized_not_routed
genericFallback       = forbidden
productionUse         = forbidden
```

FormalMappings, PatternGroups and PatternSpecs now exist as authoritative data but cannot generate, validate or publicly route a question.

## 8. Executable acceptance

The S84 gate verifies:

- merged S82 and S83 authority and correct overlay precedence;
- one-to-one materialization of all 22 accepted mappings;
- exact 18-group and 22-spec cardinality, ordering and Class C/D partition;
- S82 contract, S84 mapping and registry identity parity;
- all six S83 corrections remain mandatory;
- exact nine-stage and 64-code validator coverage;
- both packet IDs remain stable while public metadata correction stays pending;
- authoritative JSON and browser projection parity;
- deep freezing and stable read-only accessors;
- all rows remain hidden, unrouted and forbidden in production.

## 9. Distance

```text
GOAL_DISTANCE_BEFORE =
D2_G5A_U02_22_PATTERNSPEC_CONTRACTS_QA_LOCKED

GOAL_DISTANCE_AFTER =
D1_G5A_U02_FORMAL_MAPPING_AND_HIDDEN_PATTERNSPECS_MATERIALIZED

DISTANCE_REDUCED =
Converted all 22 QA-locked contracts into authoritative FormalMapping,
PatternGroup and PatternSpec data with a hidden browser-neutral projection.

REMAINING_BLOCKERS = [
  "Class C generator and blocking validator not implemented",
  "Class D semantic generator and validator not implemented",
  "g5a_u02_5a02a1 public metadata correction remains pending",
  "canonical resolver, selector and worksheet path not connected"
]

NEXT_SHORTEST_STEP =
S85_G5A_U02_ClassCGeneratorAndBlockingValidator

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
