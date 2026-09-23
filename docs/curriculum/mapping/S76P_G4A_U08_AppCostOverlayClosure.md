# S76P — G4A-U08 App Cost Overlay Closure

```text
TASK = S76P_G4A_U08_AppCostOverlayClosure
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76P closes the single remaining canonical application PatternGroup named by S76L:

```text
KnowledgePoint = kp_g4a_u08_app_mul_div_before_add_sub
PatternGroup   = pg_g4a_u08_app_cost_overlay
PatternSpec    = ps_g4a_u08_app_cost_overlay
Template       = tpl_app_cost_component_plus_minus_overlay
```

This milestone remains hidden. It does not change selector, resolver, worksheet, renderer, public routing, production eligibility, or D0 state.

## Implemented semantics

Supported equation shapes:

```text
unitCost × quantity + overlayAmount
unitCost × quantity - overlayAmount
```

The unknown role is `adjustedCost`. It is not `changeAmount`, and payment-balance semantics are explicitly rejected.

Required canonical evidence:

- one unit cost;
- one quantity;
- one additive or subtractive overlay;
- `componentCost` as the required intermediate value;
- money unit flow;
- preserved overlay direction;
- exact integer answer in dollars.

## Generator

The hidden deterministic generator provides both:

- additional-fee contexts;
- discount contexts.

It reuses bounded money scenarios but does not reuse the payment/change PatternGroup.

## Validator and mutation closure

The validator checks L1–L6 identity, arithmetic, roles, operation sequence, intermediate value, unit flow, semantic relations, overlay direction, and hidden lifecycle.

Blocking mutations:

```text
overlay_direction_flipped
multiplication_component_omitted
payment_balance_semantics_injected
```

## Scope boundary

```text
public selector changed = false
resolver changed        = false
worksheet changed       = false
renderer changed        = false
production use          = forbidden
D0 declared             = false
```

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_NUMERIC_ADAPTER_VALIDATOR_MUTATION_CLOSED_HIDDEN
GOAL_DISTANCE_AFTER  = D2_G4A_U08_ALL_CANONICAL_GROUPS_IMPLEMENTED_VALIDATED_HIDDEN
DISTANCE_REDUCED     = Closed the final missing canonical PatternGroup with one bounded PatternSpec, deterministic generator, L1-L6 validator and semantic mutation rejection.
REMAINING_BLOCKERS   = [24 canonical PatternGroups remain publicly unreachable, full-source stress and D0 reevaluation]
NEXT_SHORTEST_STEP   = S76Q_G4A_U08_AllCanonicalGroupsPublicRoutingAndWorksheetReachability
STOP_REASON          = NONE
```
