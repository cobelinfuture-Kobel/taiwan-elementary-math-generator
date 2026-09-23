# S76H G4A-U08 Existing Scope Mutation Rejection Suite

## Scope

This milestone proves blocking mutation rejection for the 12 existing Phase2A application PatternSpecs already adapted by S76F and governed by S76G.

It does not add new generators, new PatternGroups, public routing, worksheet integration, renderer changes, or production activation.

## Executable matrix

- 12 existing application templates
- 16 mutation classes per template
- 192 per-template mutations
- 1 global unmapped-template mutation
- 193 total blocking mutations

## Mutation classes

1. schema identity
2. source identity
3. unit identity
4. KnowledgePoint identity
5. PatternGroup identity
6. PatternSpec identity
7. reasoning role
8. known quantity roles
9. unknown quantity role
10. required operation sequence
11. required intermediate quantity
12. prompt presence
13. answer-model presence
14. hidden lifecycle
15. canonical routing
16. production use

Every mutation must produce `valid = false` and the corresponding S76G blocking error code. Generic fallback is forbidden.

## Acceptance

- all 12 unmodified canonical fixtures pass;
- all 192 per-template mutations are rejected;
- the unmapped-template mutation is rejected;
- mutation rejection rate is exactly 100%;
- matrix metadata and executable mutation definitions remain synchronized;
- no production-facing file is changed.

## Deferred

The following remain outside S76H:

- arithmetic answer recomputation;
- deep unit-flow validation;
- deep semantic-relation validation;
- numeric PatternSpec contracts;
- four Phase2B extension PatternGroups;
- selector, resolver, worksheet, renderer, HTML/PDF, and production lifecycle changes.

## Distance tracking

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_APPLICATION_VALIDATOR_CONTRACT_REBASED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_EXISTING_SCOPE_MUTATION_REJECTION_PROVEN_PENDING_CI
DISTANCE_REDUCED     = Existing Phase2A canonical contracts now have an executable 193-case negative-evidence suite rather than positive-path validation only.
REMAINING_BLOCKERS   = [CI, Phase2B missing PatternGroups]
NEXT_SHORTEST_STEP   = S76I_G4A_U08_Phase2BMissingPatternGroupsImplementation
```
