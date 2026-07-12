# S72 — G4B-U04 Promotion Resolver and Public Selector Integration

```text
TASK = S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## Scope

S72 promotes the S68 authority through a separate public projection and connects visible KnowledgePoint/PatternGroup selection to the S71 blocking-validated mixed runtime.

```text
S68 hidden authority
→ S72 promotion overlay
→ visible selector projection
→ authority-derived resolver
→ S71 integrated generator and validator
→ visible canonical runtime
```

The hidden S68, S69, S70 and S71 authorities remain unchanged. WorksheetDocument, answer-key assembly, renderer profiles, public print UI, HTML/PDF smoke and production D0 remain outside S72.

## Promotion coverage

```text
KnowledgePoints               = 12
PatternGroups                 = 12
PatternSpecs                  = 17
Class C PatternSpecs          = 9
Class D PatternSpecs          = 8
Answer models                 = 9
Controlled template families = 9
```

Mode distribution:

```text
concept               = 4
numeric               = 3
application           = 4
operation_estimation  = 4
reasoning             = 2
-------------------------
total                 = 17
```

## Public selector

S72 adds all 12 G4B-U04 KnowledgePoints and 12 PatternGroups to the existing visible selector registry without replacing earlier public projections.

Public question modes:

```text
mixed
concept
numeric
application
operation_estimation
reasoning
```

Each public KnowledgePoint resolves only to its authoritative PatternGroup and PatternSpecs. Internal authority rows remain hidden, canonical-routing-disabled and production-forbidden.

## Resolver contract

Supported selection modes:

```text
singleKnowledgePoint
mixedKnowledgePointsSameUnit
```

The resolver:

- accepts only promoted G4B-U04 KnowledgePoints and linked PatternGroups;
- filters groups by the public question mode;
- derives PatternSpecs from visible authority rather than caller input;
- ignores arbitrary public PatternSpec injection;
- preserves canonical S68 PatternSpec order;
- balances exact question counts across selected authoritative PatternSpecs;
- rejects cross-unit and unlinked selections;
- permits counts from 1 through 1000;
- forbids generic fallback.

## Canonical runtime

The browser question router recognizes a valid G4B-U04 public plan and dispatches it to:

```text
generateG4BU04IntegratedBatch()
→ validateG4BU04IntegratedBatch()
→ S72 visible canonical projection
```

Blocking validation occurs before lifecycle promotion. A failed S69, S70 or S71 validator produces:

```text
questions = []
```

Accepted questions receive public canonical metadata:

```text
phase                 = S72
selectorStatus        = visible
visibilityStatus      = visible
canonicalRouting      = enabled
productionUse         = canonical_runtime_only
generatorRouting      = canonical_resolver_allocation
validationStatus      = accepted
```

This metadata does not promote worksheet or production eligibility.

## Acceptance

Executable QA covers:

1. exact 12/12/17 promotion and hidden-authority immutability;
2. prior selector projection preservation;
3. one authoritative group per KnowledgePoint;
4. six public question-mode values;
5. arbitrary PatternSpec injection ignored;
6. mode-filtered group and PatternSpec resolution;
7. cross-unit, unlinked and empty-mode rejection;
8. visible canonical lifecycle validation;
9. all 17 PatternSpecs and all five modes in mixed generation;
10. deterministic balanced 1000-question replay;
11. delegated integration-validator zero-output failure;
12. browser question-router canonical dispatch;
13. worksheet, renderer and production prohibition.

## Lifecycle boundary

```text
selector visibility        = visible
canonical resolver         = connected
canonical routing          = enabled
canonical runtime          = blocking_validated
worksheet eligible         = false
answer-key path             = not connected
renderer connected          = false
HTML/PDF smoke              = not implemented
production use              = forbidden
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_CLASS_C_AND_D_INTEGRATION_GATE_LOCKED_HIDDEN

GOAL_DISTANCE_AFTER =
D1_G4B_U04_PROMOTION_RESOLVER_AND_PUBLIC_SELECTOR_CONNECTED

DISTANCE_REDUCED =
Promoted all 12 KnowledgePoints, 12 PatternGroups and 17 PatternSpecs through
an immutable overlay and connected public selection to the blocking-validated
S71 canonical runtime without generic fallback.

REMAINING_BLOCKERS = [
  "Worksheet and answer-key model not connected",
  "Renderer and public print path not connected",
  "HTML/PDF smoke and production D0 closeout not completed"
]

NEXT_SHORTEST_STEP =
S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
