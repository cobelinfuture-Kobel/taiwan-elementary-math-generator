# S76N — G4A-U08 Numeric Canonical PatternSpec and Sampler Binding Implementation

```text
TASK = S76N_G4A_U08_NumericCanonicalPatternSpecAndSamplerBindingImplementation
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76N implements the hidden numeric PatternSpec and sampler layer frozen by S76M. It does not implement validator contracts, public selector projection, resolver routing, worksheet integration, renderer changes, or production eligibility.

## Implemented registry

```text
primary preserve-ID PatternSpecs = 10
supplemental PatternSpecs        = 6
numeric canonical PatternSpecs   = 16
covered numeric KnowledgePoints  = 11
covered numeric PatternGroups    = 11
new expression families          = 1
```

All registry rows carry:

```text
registryStatus       = implemented_hidden
samplerStatus        = implemented_hidden
validatorStatus      = pending_s76o
selectorVisibility   = hidden
canonicalRouting     = disabled
worksheetReachability = disabled
productionUse        = forbidden
```

## Primary bindings

The ten existing numeric PatternSpec IDs are preserved. Their generator output is sampled through the existing G4A-U08 numeric generator and then annotated with authoritative numeric KnowledgePoint, PatternGroup, and reasoning-role identity.

No existing expression grammar, operand bound, answer calculation, public ID, source-unit allocation, or overlay rate is rewritten.

## Supplemental bindings

Five supplemental PatternSpecs reuse existing shapes:

- add grouping and rounding;
- signed-term movement;
- repeated subtraction grouping;
- safe multiplication/division reordering;
- repeated division grouping.

The samplers attach deterministic canonical evidence such as signed-term vectors, useful grouping indexes, safe permutations, factor/reciprocal vectors, grouped expressions, and equivalence-rule IDs.

The sixth supplemental PatternSpec adds the single S76M-approved bounded family:

```text
(a + b) × c - d ÷ (e - f)
```

It guarantees:

- two parenthetical groups;
- all four arithmetic operators;
- exact integer division;
- AST depth no greater than 4;
- integer intermediate values in `0..9999`.

## Public compatibility

The current public surface remains unchanged:

```text
visible G4A-U08 KnowledgePoints = 8
new numeric canonical KPs visible = 0
new numeric PatternGroups public  = 0
```

The source-unit route continues to expose the existing ten numeric PatternSpecs. S76N hidden IDs cannot be selected through the public resolver or worksheet chain.

## Deferred to S76O

S76N does not claim fidelity validation. The following remain pending:

- numeric CanonicalGeneratedItem contract normalization;
- eleven PatternGroup validator contracts;
- deterministic blocking mutation rejection;
- validator lifecycle promotion.

## Acceptance

```text
hidden registry validation       = 16 PatternSpecs / 11 KPs / 11 PatternGroups
legacy primary ID preservation   = 10/10
supplemental sampler coverage     = 6/6
public selector count unchanged  = true
legacy arithmetic recomputation  = pass
add-group equivalence            = pass
signed-term equivalence          = pass
repeated subtraction equivalence = pass
mul/div rational equivalence     = pass
repeated division equivalence    = pass
compound family bounded          = pass
production use                    = forbidden
```

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_NUMERIC_AND_COST_OVERLAY_CLOSURE_DESIGN_FROZEN
GOAL_DISTANCE_AFTER  = D2_G4A_U08_NUMERIC_PATTERNS_AND_SAMPLERS_IMPLEMENTED_HIDDEN
DISTANCE_REDUCED     = Implemented all 16 planned numeric canonical PatternSpecs and deterministic sampler bindings across all 11 numeric KnowledgePoints and PatternGroups without changing the public runtime surface.
REMAINING_BLOCKERS   = [numeric canonical adapter and validator closure, numeric mutation rejection, app_cost_overlay closure, 24 canonical public routes]
NEXT_SHORTEST_STEP   = S76O_G4A_U08_NumericCanonicalAdapterValidatorAndMutationClosure
STOP_REASON          = NONE
```
