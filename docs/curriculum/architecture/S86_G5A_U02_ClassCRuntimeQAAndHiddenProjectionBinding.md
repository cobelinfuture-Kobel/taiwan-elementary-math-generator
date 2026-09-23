# S86 G5A-U02 Class C Runtime QA and Hidden Projection Binding

```text
TASK = S86_G5A_U02_ClassCRuntimeQAAndHiddenProjectionBinding
STATUS = IMPLEMENTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S86 binds the 14 S85 Class C runtime PatternSpecs to the S84 browser-neutral hidden projection and adds binding QA.

It does not implement the eight Class D PatternSpecs, correct source metadata, enable public selector visibility, connect canonical routing, integrate worksheet output, or permit production use.

## Runtime artifact

```text
src/curriculum/g5a-u02/class-c-hidden-projection-binding.js
```

The binding consumes:

```text
site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js
src/curriculum/g5a-u02/class-c-generator-validator.js
```

## Binding contract

Each bound Class C PatternSpec retains:

```text
patternSpecId
formalMappingId
patternGroupId
knowledgePointId
mode
answerModelId
implementationClass
sourceEvidence
qaOverlayRefs
```

The binding lifecycle remains:

```text
bindingStatus = class_c_runtime_bound_hidden
selectorStatus = hidden
canonicalRouting = disabled
productionUse = forbidden
genericFallback = forbidden
```

## QA gates

S86 passes only when:

- the hidden projection contains exactly 22 PatternSpecs;
- exactly 14 Class C PatternSpecs are bound;
- exactly 8 Class D PatternSpecs remain unbound;
- the ordered Class C IDs exactly match the S85 runtime IDs;
- every bound Class C PatternSpec generates and validates through projection metadata;
- generation remains deterministic for equal PatternSpec ID and seed;
- missing or mutated binding metadata blocks;
- binding PatternSpec mismatch blocks;
- wrong runtime answers remain blocked;
- Class D and unknown IDs never use a generic fallback;
- selector, canonical routing and production use remain disabled.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_CLASS_C_RUNTIME_IMPLEMENTED_HIDDEN
GOAL_DISTANCE_AFTER  = D1_G5A_U02_CLASS_C_RUNTIME_BOUND_TO_HIDDEN_PROJECTION_PENDING_CI
DISTANCE_REDUCED     = The 14 executable Class C PatternSpecs now carry authoritative hidden projection metadata and binding-level QA.
REMAINING_BLOCKERS   = Class D semantic runtime; metadata correction; canonical resolver; public selector; worksheet integration; production gate.
NEXT_SHORTEST_STEP   = S87_G5A_U02_ClassDSemanticGeneratorAndBlockingValidator
```
