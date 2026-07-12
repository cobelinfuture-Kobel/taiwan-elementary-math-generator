# S68 — G4B-U04 FormalMapping and Hidden PatternSpec Materialization

```text
TASK = S68_G4B_U04_FormalMappingAndHiddenPatternSpecMaterialization
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
```

## 1. Scope

S68 consumes the accepted S66 base contract and the higher-precedence S67 QA overlay, then materializes the first authoritative hidden runtime-neutral data for G4B-U04.

```text
S64/S65 FormalMapping candidates
+ S66 PatternSpec base contract
+ S67 QA overlay and closeout
→ authoritative FormalMapping
→ authoritative hidden PatternGroups
→ authoritative hidden PatternSpecs
→ deeply frozen browser-neutral projection
```

S68 does not implement question generation, blocking-validator runtime, canonical resolver routing, public selectors, worksheet assembly, renderer integration or production promotion.

## 2. Materialized authority

Created authoritative artifacts:

```text
data/curriculum/mapping/S68_G4B_U04_FormalMapping.json
data/curriculum/pattern_specs/S68_G4B_U04_PatternSpecRegistry.json
site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js
```

The materialized authority contains:

```text
KnowledgePoints       = 12
FormalMappings        = 17
PatternGroups         = 12
PatternSpecs          = 17
Answer models         = 9
Template families     = 9
Class C PatternSpecs  = 9
Class D PatternSpecs  = 8
```

## 3. Effective-contract rule

Every S68 and later consumer must resolve the effective contract in this order:

```text
1. S66_G4B_U04_PatternSpecContractDesign.json
2. S67_G4B_U04_PatternSpecContractQA.json
```

The S67 overlay has higher precedence. Materialization is invalid if a consumer reads S66 alone.

The following S67 corrections remain mandatory:

1. all nine answer schemas are closed;
2. all template placeholders have exact role bindings;
3. all four round-then-operate prompts expose original values, method labels and target-place labels;
4. inverse digit masks use the locked source-backed grammar;
5. all 44 blocking codes are assigned exactly once across eight validator stages.

## 4. FormalMapping materialization

All 17 accepted candidate IDs remain traceable:

```text
fmc_g4b_u04_*
→ fm_g4b_u04_*
→ ps_g4b_u04_*
```

Each FormalMapping row contains:

- source candidate ID;
- authoritative FormalMapping ID;
- PatternSpec, PatternGroup and KnowledgePoint IDs;
- mode and answer model;
- implementation class;
- source evidence;
- controlled template references where applicable;
- deterministic pattern order;
- hidden lifecycle.

No candidate was removed or merged.

## 5. Hidden PatternGroup and PatternSpec registry

Mode totals:

```text
concept               = 4
numeric               = 3
application           = 4
operation_estimation  = 4
reasoning             = 2
--------------------------
total                 = 17
```

All 12 PatternGroups are complete and non-overlapping. Every PatternSpec belongs to exactly one group, and group mode equals PatternSpec mode.

The browser-neutral projection is deeply frozen and exposes read-only accessors only. It is not imported into a public selector or canonical resolver by S68.

## 6. Lifecycle boundary

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

FormalMapping, PatternGroups and PatternSpecs now exist as authoritative data, but cannot generate or validate a question yet.

## 7. Executable acceptance

The S68 test gate verifies:

- accepted S67 closeout is mandatory;
- 17 candidate mappings materialize one-to-one;
- all identities and source evidence remain aligned;
- 12 groups and 17 specs are unique and complete;
- S66 identity and S67 overlay drift are rejected;
- all nine template families remain source-controlled;
- all five S67 corrections remain mandatory;
- browser projection exactly matches authoritative JSON;
- projection and nested values are deeply frozen;
- every row stays hidden, unrouted and forbidden in production.

## 8. CI and merge evidence

```text
implementation PR = #103
implementation merge commit = 23982e0765214973802d7ba8f72db0625d5fab40
main CI run = 29194826166
main CI readback commit = 351e9c55bfde70a7ab75f0cc4d41b983b7682e95
main tests = 1024
main pass = 1024
main fail = 0
main working tree = clean
```

Fresh-main closeout authority:

```text
data/curriculum/contracts/S68_G4B_U04_HiddenMaterializationCloseout.json
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE =
D2_G4B_U04_PATTERNSPEC_CONTRACT_QA_LOCKED

GOAL_DISTANCE_AFTER =
D1_G4B_U04_FORMAL_MAPPING_AND_HIDDEN_PATTERNSPECS_MATERIALIZED

DISTANCE_REDUCED =
Converted the reviewed design contracts into authoritative FormalMapping,
PatternGroup and PatternSpec data with a hidden browser-neutral projection.

REMAINING_BLOCKERS = [
  "Class C generator and blocking validator not implemented",
  "Class D semantic generator and validator not implemented",
  "canonical resolver, selector and worksheet path not connected"
]

NEXT_SHORTEST_STEP =
S69_G4B_U04_ClassCGeneratorAndBlockingValidator

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
