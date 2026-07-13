# S76O — G4A-U08 Numeric Canonical Adapter, Validator and Mutation Closure

```text
TASK = S76O_G4A_U08_NumericCanonicalAdapterValidatorAndMutationClosure
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76O normalizes S76N hidden numeric samples into `G4AU08NumericCanonicalGeneratedItem`, validates all eleven numeric PatternGroups through L1–L5, and adds deterministic semantic mutation rejection. Public routing remains disabled.

## Implemented

```text
numeric PatternSpecs                 = 16
numeric KnowledgePoints              = 11
numeric PatternGroups                = 11
validator-covered PatternGroups      = 11
mutation-covered PatternGroups       = 11
minimum mutations per PatternGroup   = 2
publicly visible new numeric groups  = 0
```

The adapter emits canonical identity, expression tokens, operation trace, intermediate values, numeric answer model, reasoning role, PatternGroup-specific evidence, and hidden lifecycle metadata.

## Fidelity contracts

The validator checks:

- schema, source and unit identity;
- KnowledgePoint, PatternGroup, PatternSpec and reasoning-role identity;
- expression presence and arithmetic recomputation;
- operation trace presence;
- add/sub signed-term equivalence and useful grouping;
- left association;
- parentheses-first execution;
- repeated subtraction equivalence;
- safe multiplication/division reordering;
- repeated division equivalence;
- multiplication/division precedence;
- nonredundant parentheses;
- bounded compound-parentheses constraints;
- hidden routing and production-forbidden lifecycle.

## Mutation closure

Each numeric PatternGroup has at least two deterministic blocking mutations. Mutation families alter signs, terms, grouping, divisors, operation order, parentheses effect, AST bounds, or integer-division integrity. A simple expected-answer mutation is not used as the sole semantic proof.

## Scope boundary

No changes were made to:

- public selector or resolver;
- worksheet or answer-key assembly;
- renderer, CSS, HTML or PDF behavior;
- application generators;
- `app_cost_overlay`;
- production eligibility or D0 state.

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_NUMERIC_PATTERNS_AND_SAMPLERS_IMPLEMENTED_HIDDEN
GOAL_DISTANCE_AFTER  = D2_G4A_U08_NUMERIC_ADAPTER_VALIDATOR_MUTATION_CLOSED_HIDDEN
DISTANCE_REDUCED     = Added canonical normalization, L1–L5 fidelity validation and deterministic mutation rejection for all 11 numeric PatternGroups while retaining hidden lifecycle.
REMAINING_BLOCKERS   = [app_cost_overlay closure, 24 canonical public routes, full-source stress and D0 reevaluation]
NEXT_SHORTEST_STEP   = S76P_G4A_U08_AppCostOverlayClosure
STOP_REASON          = NONE
```
