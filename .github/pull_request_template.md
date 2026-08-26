## Scope

Describe the bounded milestone and the system node it advances.

## Change Impact / Validation Policy

For curriculum product changes, add exactly one machine-readable impact manifest:

`data/project/change-impact/<TASK_ID>.impact.json`

Declare:

- `currentScope`: `KP_LEAF` / `UNIT_INTEGRATION` / `SHARED_RUNTIME` / `GLOBAL_RELEASE`
- `expectedDerivedGate`
- `unitExpectedKnowledgePointIds`
- `unitKnowledgePointGateStatus`
- `changeImpact.sharedExecutableChange`
- `changeImpact.publicAuthorityCutover`
- `changeImpact.legalRouteSemanticsChanged`
- `changeImpact.affectedRoutes`
- `changeImpact.globalReleaseCheckpoint`
- `changeImpact.currentAuthorityChanged`

`KP_LEAF` must remain focused-only and may not cut over current/public authority or shared executable semantics.

## Milestone claim contract

Milestone Claim Manifest: `data/project/milestones/<TASK_ID>.claim.json`
Actual Evidence Level: `E0_PLANNING_ONLY`
Maximum Claim: `E0_PLANNING_ONLY`
Visible Output Changed: `false`
Human Review Type: `none`
Human Review Ready: `false`

## Acceptance evidence

List the exact generator, validator, renderer, HTML, PDF, focused PR check, or governance evidence paths used by this milestone.

## Distance

```text
GOAL_DISTANCE_BEFORE = D?
GOAL_DISTANCE_AFTER  = D?
DISTANCE_REDUCED     = ...
REMAINING_BLOCKERS   = [...]
NEXT_SHORTEST_STEP   = ...
```

## Scope boundary

State every production, runtime, renderer, other-unit, and D0 claim that remains false.
