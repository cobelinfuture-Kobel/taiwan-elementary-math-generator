# S76J — G4A-U08 Resolver, Selector and Worksheet Integration

```text
TASK = S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76J promotes only the four S76I Phase2B application PatternGroups through an immutable public projection and connects them to the Batch A browser resolver, canonical router and WorksheetDocument allocation path.

```text
S76D hidden authority
→ S76I hidden generator + validator
→ S76J visible selector projection
→ visible PatternGroup resolver
→ blocking-validated canonical browser runtime
→ WorksheetDocument + answer-key allocation
→ existing generic renderer profile
```

The existing Phase2A twelve application PatternSpecs and eleven numeric PatternGroups are not promoted by this milestone.

## Promoted coverage

```text
KnowledgePoints = 3
PatternGroups   = 4
PatternSpecs    = 4
Question mode   = application
Answer shape    = numericAnswer
```

Promoted PatternGroups:

1. `pg_g4a_u08_ext_comparison_chain`
2. `pg_g4a_u08_ext_equal_value_unit_price`
3. `pg_g4a_u08_ext_relative_difference`
4. `pg_g4a_u08_ext_two_cost_component_payment`

## Selector contract

Public KnowledgePoints:

- `kp_g4a_u08_app_add_sub_sequence`;
- `kp_g4a_u08_app_mul_div_sequence`;
- `kp_g4a_u08_app_mul_div_before_add_sub`.

The selector appends these rows to the existing Batch A projection without replacing G5A-U08, G4B-U04 or earlier public rows.

Public modes:

```text
mixed
application
```

## Resolver contract

Supported selection modes:

```text
singleKnowledgePoint
mixedKnowledgePointsSameUnit
```

The resolver:

- accepts only the three promoted G4A-U08 KnowledgePoints;
- derives linked PatternGroups and PatternSpecs from the visible authority;
- balances exact counts across selected authoritative groups;
- ignores caller-supplied PatternSpec IDs;
- rejects cross-source selections;
- forbids generic fallback;
- permits question counts from 1 through 1000.

## Browser runtime

The site runtime mirrors the S76I deterministic generator contract for deployment inside `site/`.

Executable QA cross-checks browser and source outputs for the same template and seed:

- prompt;
- operands;
- intermediate values;
- semantic relations;
- answer model;
- PatternSpec identity.

Before public promotion, every generated hidden item passes the S76I-compatible blocking validator. A blocking failure produces zero public questions.

Public canonical questions contain:

```text
phase            = S76J
selectorStatus   = visible
canonicalRouting = enabled
productionUse    = preview_only_pending_s76k
```

## Worksheet allocation

S76J adds a wrapper after the existing S73 worksheet chain. Other sources continue through their existing implementations.

G4A-U08 Phase2B output now includes:

- `worksheet-document-v1`;
- generated question records;
- question display models;
- answer-key items;
- question and answer-key pagination;
- allocation and generation reports;
- provenance and curriculum metadata.

The worksheet path uses the existing generic long-text profile:

```text
question sheet = A4, 2 columns, 4 rows per page
answer key     = A4, 1 column, 6 rows per page
```

This is an allocation/profile binding only. Renderer source, CSS, HTML templates and visual behavior are unchanged.

## Blocking boundaries

S76J blocks:

- invalid or cross-source KnowledgePoint selections;
- unpromoted PatternGroups and PatternSpecs;
- invalid question counts;
- public PatternSpec injection;
- generic fallback;
- hidden-generator validation failures;
- canonical lifecycle mutations;
- unsupported answer shapes;
- missing prompt or answer text;
- curriculum ID leakage into public prompt or answer text.

## Explicit exclusions

- promotion of the twelve existing Phase2A application PatternSpecs;
- promotion of numeric PatternSpecs;
- renderer visual or CSS changes;
- public HTML/PDF stress closeout;
- production eligibility;
- full-source D0 declaration.

These remain outside S76J.

## Acceptance gate

- exact 3/4/4 promotion counts;
- selector projection preserves earlier sources;
- browser runtime matches S76I source generation for fixed seeds;
- all four groups reachable through mixed selection;
- single-KP allocation reaches only linked groups;
- arbitrary PatternSpec injection is ignored;
- cross-source selection returns zero output;
- generated arithmetic independently recomputes;
- worksheet question and answer-key counts match exactly;
- renderer behavior remains unchanged;
- full repository CI passes.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2B_HIDDEN_GENERATOR_VALIDATOR_IMPLEMENTED
GOAL_DISTANCE_AFTER  = D1_G4A_U08_PHASE2B_RESOLVER_SELECTOR_WORKSHEET_CONNECTED_PENDING_CI
DISTANCE_REDUCED     = Four Phase2B application groups are now reachable through visible selection, authority-derived resolution, blocking canonical generation and WorksheetDocument allocation.
REMAINING_BLOCKERS   = [full-source stress and semantic QA, HTML/PDF production closeout, D0 closeout]
NEXT_SHORTEST_STEP   = S76K_G4A_U08_FullSourceStressAndSemanticQA
```
