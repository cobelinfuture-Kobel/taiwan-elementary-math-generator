# S76F G4A-U08 CanonicalGeneratedItem Adapter

```text
TASK = S76F_G4A_U08_CanonicalGeneratedItemAdapter
STATUS = IMPLEMENTED_HIDDEN_PENDING_CI
SOURCE_ID = g4a_u08_4a08
UNIT = 4A-U08 整數四則
```

## Scope

S76F adds a browser-neutral adapter that converts the twelve existing Phase2A application-template outputs into a canonical item shape suitable for the S76G ValidatorContract rebase.

The task does not change the existing generator, answer computation, public selector, resolver, worksheet, renderer, or production lifecycle.

## Canonical output

Each adapted item carries:

- source and unit identity;
- legacy template and legacy KP evidence;
- canonical KnowledgePoint, PatternGroup, and PatternSpec identity;
- reasoning role;
- known-quantity roles and unknown-quantity role;
- required operation sequence;
- required intermediate quantities;
- operands, operations, intermediate values, unit flow, and semantic relations when supplied by the legacy item;
- expression, answer model, context, and seed;
- hidden lifecycle state with validator status pending S76G.

## Blocking behavior

The adapter blocks rather than guessing when:

- the legacy item is not an object;
- template identity is absent;
- the template is not one of the twelve S76E mappings;
- prompt text is absent;
- answer or answer model is absent.

Template contracts provide deterministic semantic role names and operation requirements. Runtime evidence such as operands, units, expression, context, intermediate values, and answer remains sourced from the legacy item.

## Compatibility

```text
legacy generator changed = false
legacy answer computation changed = false
validator runtime changed = false
extension generator implemented = false
public routing changed = false
worksheet changed = false
renderer changed = false
```

## Acceptance

Executable QA checks:

- exactly twelve adapter contracts;
- all twelve existing template IDs adapt successfully;
- canonical KP/PG/PS identity is assigned deterministically;
- legacy evidence remains preserved;
- output is deeply frozen and detached from mutable input;
- missing/unknown template, prompt, or answer is blocking;
- lifecycle remains hidden, unrouted, and production-forbidden.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_EXISTING_PATTERNS_RECLASSIFIED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_CANONICAL_ITEM_ADAPTER_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = Existing Phase2A runtime output now has a deterministic bridge into the canonical KP/PatternGroup/PatternSpec and semantic-role model required by the new validator architecture.
REMAINING_BLOCKERS   = S76F CI; S76G ValidatorContract rebase; S76H mutation rejection; Phase2B extension generators; public integration and full-source QA.
NEXT_SHORTEST_STEP   = S76G_G4A_U08_ValidatorContractRebase
```
