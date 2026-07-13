# S88 G5A-U02 Class D Hidden Projection Binding and QA

```text
TASK = S88_G5A_U02_ClassDHiddenProjectionBindingAndQA
STATUS = IMPLEMENTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S88 binds the eight S87 Class D semantic runtimes to the S84 browser-neutral hidden projection and adds projection parity QA.

It does not correct source metadata, modify the fourteen Class C bindings, connect canonical routing, enable a public selector, integrate worksheet output, or permit production use.

## Runtime artifact

```text
src/curriculum/g5a-u02/class-d-hidden-projection-binding.js
```

The binding consumes:

```text
site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js
src/curriculum/g5a-u02/class-d-semantic-generator-validator.js
```

## Binding contract

Each bound Class D PatternSpec retains:

```text
patternSpecId
formalMappingId
sourceMappingCandidateId
patternGroupId
knowledgePointId
mode
answerModelId
implementationClass
templateFamilyIds
sourceEvidence
patternOrder
qaOverlayRefs
```

The runtime template family must exactly equal the single template family declared by the hidden projection.

## Lifecycle

```text
bindingStatus = class_d_runtime_bound_hidden
selectorStatus = hidden
canonicalRouting = disabled
productionUse = forbidden
genericFallback = forbidden
freeFormAI = forbidden
```

## QA gates

S88 passes only when:

- the projection still contains exactly 22 PatternSpecs;
- exactly eight Class D PatternSpecs are bound;
- the ordered Class D IDs match the S87 runtime IDs;
- all fourteen Class C PatternSpecs remain outside the Class D binding;
- FormalMapping, source mapping candidate, PatternGroup, KnowledgePoint, answer model, template family, source evidence, pattern order and QA overlays remain aligned;
- all eight Class D items generate and validate through projection metadata;
- equal seed and PatternSpec ID remain deterministic;
- missing or mutated bindings block;
- PatternSpec mismatch blocks;
- template-family drift blocks at binding and runtime layers;
- S87 semantic arithmetic and source-unique-answer validators remain blocking;
- selector, routing, production, generic fallback and free-form AI remain disabled.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_ALL_22_PATTERNS_HAVE_HIDDEN_RUNTIME
GOAL_DISTANCE_AFTER  = D1_G5A_U02_ALL_22_RUNTIMES_BOUND_TO_HIDDEN_PROJECTION_PENDING_CI
DISTANCE_REDUCED     = The remaining eight Class D semantic runtimes now carry authoritative S84 projection metadata and template-family parity QA.
REMAINING_BLOCKERS   = metadata correction; canonical resolver; public selector; worksheet integration; production gate.
NEXT_SHORTEST_STEP   = S89_G5A_U02_SourceMetadataCorrectionAndFullRuntimeProjectionAudit
```
