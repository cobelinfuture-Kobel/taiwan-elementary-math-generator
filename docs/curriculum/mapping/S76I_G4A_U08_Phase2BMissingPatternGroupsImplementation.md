# S76I G4A-U08 Phase2B Missing PatternGroups Implementation

## Scope

This milestone materializes the four G4A-U08 source-authority extension PatternGroups that were intentionally left hidden and unimplemented by S76D-S76H.

Implemented:

1. `pg_g4a_u08_ext_comparison_chain`
2. `pg_g4a_u08_ext_equal_value_unit_price`
3. `pg_g4a_u08_ext_relative_difference`
4. `pg_g4a_u08_ext_two_cost_component_payment`

Each PatternGroup now has exactly one canonical PatternSpec, one deterministic hidden generator, one adapter contract, one validator contract, positive arithmetic evidence, and semantic mutation rejection evidence.

## Canonical identities

| PatternGroup | PatternSpec | Template | Reasoning role |
|---|---|---|---|
| `pg_g4a_u08_ext_comparison_chain` | `ps_g4a_u08_ext_comparison_chain` | `tpl_ext_comparison_chain` | two-link more/less relation chain |
| `pg_g4a_u08_ext_equal_value_unit_price` | `ps_g4a_u08_ext_equal_value_unit_price` | `tpl_ext_equal_value_unit_price` | equal total value, find target unit price |
| `pg_g4a_u08_ext_relative_difference` | `ps_g4a_u08_ext_relative_difference` | `tpl_ext_relative_difference` | same-direction relative increment |
| `pg_g4a_u08_ext_two_cost_component_payment` | `ps_g4a_u08_ext_two_cost_component_payment` | `tpl_ext_two_cost_component_payment` | payment minus two cost components |

## Validator fidelity

The contracts block mutation of:

- KnowledgePoint, PatternGroup, and PatternSpec identity;
- known and unknown quantity roles;
- required operation sequence;
- required intermediate quantities;
- extension semantic relations;
- hidden lifecycle, disabled routing, and forbidden production use.

Extension-specific semantic relations are:

- comparison chain: `more_than`, `less_than`;
- equal-value unit price: `equal_total_value`, `different_quantity`;
- relative difference: `same_direction`, `difference_not_sum`;
- two-cost payment: `two_cost_components`, `payment_covers_total`.

## Arithmetic acceptance

The executable QA independently recomputes every generated answer:

- comparison chain: `base + firstDifference - secondDifference`;
- equal-value unit price: `knownUnitPrice × knownQuantity ÷ targetQuantity`;
- relative difference: `(comparedUnitValue - baseUnitValue) × quantity`;
- two-cost payment: `payment - (unitCostA × quantityA + unitCostB × quantityB)`.

Generation is deterministic by seed, integer-only, and maintains nonnegative payment change.

## Compatibility and lifecycle

Preserved:

- the 12 S76F existing-scope adapter contracts remain available through the original getter;
- the 12 S76G existing-scope validator contracts remain available through the original getter;
- the S76H 193-case mutation matrix remains scoped to the original 12 PatternSpecs;
- no existing generator is modified.

New combined getters expose 16 contracts internally, while the four new PatternGroups remain:

```text
selectorVisibility = hidden
canonicalRouting = disabled
productionUse = forbidden
```

## Explicit exclusions

- public selector and resolver exposure;
- worksheet allocation;
- answer-key and renderer integration;
- HTML/PDF production smoke;
- numeric PatternSpec validator contracts;
- broad UI or style changes.

These remain assigned to S76J and S76K.

## Acceptance gate

- exactly four extension templates, PatternGroups, PatternSpecs, adapter contracts, and validator contracts;
- deterministic output for each seed;
- independent arithmetic recomputation passes;
- direction, equality, difference, and two-cost semantics pass;
- semantic/unknown-role/operation mutations block;
- batch generation reaches all four PatternGroups while routing stays disabled;
- full repository CI passes.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_EXISTING_SCOPE_MUTATION_REJECTION_PROVEN
GOAL_DISTANCE_AFTER  = D1_G4A_U08_PHASE2B_HIDDEN_GENERATOR_VALIDATOR_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = Four source-authority gaps now have executable PatternSpecs, deterministic generators, canonical adapters, validator contracts, and semantic rejection evidence.
REMAINING_BLOCKERS   = [public resolver/selector/worksheet reachability, production stress and semantic QA]
NEXT_SHORTEST_STEP   = S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration
```
