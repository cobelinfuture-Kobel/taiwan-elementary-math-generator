# S76G G4A-U08 ValidatorContract Rebase

```text
TASK = S76G_G4A_U08_ValidatorContractRebase
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76G adds the first blocking validator-contract layer for the 12 existing Phase2A canonical application PatternSpecs produced through S76F.

Included:

- schema, source and unit identity checks;
- legacy template to canonical KP / PatternGroup / PatternSpec fidelity;
- reasoning-role fidelity;
- known-role and unknown-role fidelity;
- required operation sequence fidelity;
- required intermediate-quantity declaration fidelity;
- prompt and answer-model presence;
- hidden lifecycle enforcement;
- canonical-routing and production-use blocking;
- assertion API for downstream consumers.

Excluded:

- numeric PatternSpec contracts;
- arithmetic answer recomputation from semantic quantities;
- unit-flow and semantic-relation deep validation;
- extension PatternGroups and generators;
- public selector, resolver, worksheet, renderer or production activation.

The excluded arithmetic and mutation depth remains assigned to S76H and later integration gates. Existing production runtime remains unchanged.

## Error surface

The validator returns deterministic blocking codes including:

```text
G4AU08_VALIDATOR_KP_MISMATCH
G4AU08_VALIDATOR_PATTERN_GROUP_MISMATCH
G4AU08_VALIDATOR_PATTERN_SPEC_MISMATCH
G4AU08_VALIDATOR_REASONING_ROLE_MISMATCH
G4AU08_VALIDATOR_KNOWN_ROLES_MISMATCH
G4AU08_VALIDATOR_UNKNOWN_ROLE_MISMATCH
G4AU08_VALIDATOR_OPERATION_SEQUENCE_MISMATCH
G4AU08_VALIDATOR_INTERMEDIATE_REQUIREMENT_MISMATCH
G4AU08_VALIDATOR_PUBLIC_ROUTING_FORBIDDEN
G4AU08_VALIDATOR_PRODUCTION_USE_FORBIDDEN
```

## Acceptance

- exactly 12 adapter/validator contracts;
- all 12 canonical S76F outputs pass;
- identity, role, operation and intermediate mutations block;
- schema, source, prompt, answer and lifecycle mutations block;
- unknown template identity blocks;
- no runtime routing or renderer changes.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_CANONICAL_ITEM_ADAPTER_IMPLEMENTED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_APPLICATION_VALIDATOR_CONTRACT_REBASED_PENDING_MUTATION_SUITE
DISTANCE_REDUCED     = The 12 existing application PatternSpecs now have deterministic KP/PG/PS and reasoning-role blocking validation.
REMAINING_BLOCKERS   = Arithmetic recomputation, unit-flow fidelity, semantic-relation fidelity, full mutation suite, extension PatternGroups, public reachability.
NEXT_SHORTEST_STEP   = S76H_G4A_U08_ExistingScopeMutationRejectionSuite
```
