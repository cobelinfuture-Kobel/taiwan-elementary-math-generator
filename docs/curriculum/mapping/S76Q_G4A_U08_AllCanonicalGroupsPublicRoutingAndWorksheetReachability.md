# S76Q — G4A-U08 All Canonical Groups Public Routing and Worksheet Reachability

```text
TASK = S76Q_G4A_U08_AllCanonicalGroupsPublicRoutingAndWorksheetReachability
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76Q promotes the already implemented and validated G4A-U08 canonical graph to the public selector, resolver, question router, WorksheetDocument, pagination and answer-key path.

No new KnowledgePoint, PatternGroup, PatternSpec, generator family, validator semantic, renderer template or CSS rule is introduced.

## Public graph

```text
KnowledgePoints  = 15
PatternGroups    = 28
PatternSpecs     = 33
numeric groups   = 11
application core = 13
application ext  = 4
```

The four Phase2B public routes remain available. Existing coarse application KnowledgePoint aliases remain valid. Eleven numeric KnowledgePoints become explicit selector rows rather than being represented only by the legacy source-unit route.

## Runtime bindings

- numeric canonical groups use the S76N sampler and S76O blocking validator;
- twelve Phase2A application groups use the existing application generator;
- `app_cost_overlay` uses the S76P hidden generator and L1–L6 validator;
- four extension groups retain the S76J Phase2B runtime;
- resolver allocation is balanced by PatternGroup and then PatternSpec;
- public PatternSpec injection and generic fallback remain forbidden.

## Public lifecycle

Generated records use:

```text
selectorStatus        = visible
canonicalRouting      = enabled
worksheetReachability = enabled
productionUse         = preview_only_pending_s76r
```

S76Q does not declare production D0. S76R must re-run full-source stress, mutation, semantic, worksheet and HTML/PDF gates.

## Worksheet acceptance

The executable QA verifies:

- every one of the 28 PatternGroups produces at least one validated public question;
- a 56-question mixed route reaches all 28 groups;
- question and answer-key counts remain equal;
- generic WorksheetDocument pagination accepts numeric and application records together;
- renderer behavior remains unchanged;
- an unregistered PatternGroup returns zero canonical output.

## Compatibility

Preserved:

- existing source-unit route;
- existing coarse application KnowledgePoint IDs;
- existing Phase2B PatternGroup IDs;
- legacy PatternSpec IDs;
- existing public URLs;
- existing renderer and print CSS behavior.

## Scope boundary

```text
new curriculum content = false
new generator family   = false
validator semantics    = unchanged
renderer visual change = false
production D0          = false
```

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_ALL_CANONICAL_GROUPS_IMPLEMENTED_VALIDATED_HIDDEN
GOAL_DISTANCE_AFTER  = D1_G4A_U08_ALL_28_CANONICAL_GROUPS_PUBLIC_WORKSHEET_REACHABLE_PENDING_STRESS
DISTANCE_REDUCED     = Promoted all 15 KnowledgePoints, 28 PatternGroups and 33 PatternSpecs through the public selector/resolver/question/worksheet/answer-key path while preserving compatibility aliases and renderer behavior.
REMAINING_BLOCKERS   = [S76R full-source stress, HTML/PDF smoke, S76B threshold reevaluation]
NEXT_SHORTEST_STEP   = S76R_G4A_U08_FullSourceStressHTMLPDFAndD0Reevaluation
```
