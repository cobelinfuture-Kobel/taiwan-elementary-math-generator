# S76B Batch A Validator Ontology Rebase Standard

## Status

- task: `S76B_BatchA_ValidatorOntologyRebaseStandard`
- mode: planning-only
- status: `PASS_STANDARD_FROZEN`
- pilot unit: `g4a_u08_4a08`
- runtime changes: none

## Purpose

Define one migration contract for earlier Batch A units so their validators can support a future knowledge graph without rewriting stable generators, renderers, or worksheet paths by default.

## Canonical layer model

```text
SourceEvidence
→ KnowledgePoint
→ PatternGroup
→ PatternSpec
→ CanonicalGeneratedItem
→ ValidatorContract
→ ValidationResult
→ WorksheetReachabilityEvidence
```

## Layer responsibilities

### SourceEvidence

Records the source page/section and the grade-level boundary. It is authoritative for curriculum coverage, not for runtime implementation details.

### KnowledgePoint

Represents a stable mathematical learning objective. It must not be created solely for wording variation, scenario theme, or operand-size variation.

Required fields:

```json
{
  "knowledgePointId": "string",
  "sourceId": "string",
  "gradeBand": "string",
  "title": "string",
  "objective": "string",
  "prerequisiteIds": [],
  "lifecycle": "candidate|approved|production|deprecated",
  "sourceEvidenceRefs": []
}
```

### PatternGroup

Represents one reasoning role under a KnowledgePoint. Different unknown roles, semantic relations, or mandatory intermediate quantities require different PatternGroups even when they use the same operators.

Required fields:

```json
{
  "patternGroupId": "string",
  "knowledgePointId": "string",
  "reasoningRole": "string",
  "knownQuantityRoles": [],
  "unknownQuantityRole": "string",
  "requiredIntermediateQuantities": [],
  "semanticRelations": [],
  "unitFlow": [],
  "depth": "N|N+1|N+2",
  "publicEligibility": "hidden|candidate|production"
}
```

### PatternSpec

Defines a concrete generative structure within one PatternGroup.

Required fields:

```json
{
  "patternSpecId": "string",
  "patternGroupId": "string",
  "templateFamily": "string",
  "requiredOperationSequence": [],
  "expressionShape": "string",
  "answerModel": {},
  "operandConstraints": {},
  "intermediateConstraints": {},
  "contextModes": [],
  "blockingMutations": []
}
```

### CanonicalGeneratedItem

All migrated validators consume this normalized shape. Legacy generators may use an adapter.

Required fields:

```json
{
  "sourceId": "string",
  "knowledgePointId": "string",
  "patternGroupId": "string",
  "patternSpecId": "string",
  "prompt": "string",
  "operands": [],
  "operations": [],
  "knownQuantities": [],
  "unknownQuantityRole": "string",
  "intermediateValues": [],
  "unitFlow": [],
  "semanticRelations": [],
  "answerModel": {},
  "metadata": {}
}
```

Missing canonical metadata must block or quarantine the item. Validators must not silently infer a KnowledgePoint or unknown role from prompt text.

## Validator contract levels

```text
L1 schema validity
L2 arithmetic correctness
L3 PatternSpec fidelity
L4 PatternGroup reasoning fidelity
L5 KnowledgePoint fidelity
L6 semantic and context integrity
```

A production-eligible PatternSpec must pass all applicable levels.

## Minimum validation result

```json
{
  "valid": true,
  "knowledgePointId": "string",
  "patternGroupId": "string",
  "patternSpecId": "string",
  "errors": [],
  "warnings": [],
  "validatedLevels": ["L1", "L2", "L3", "L4", "L5"]
}
```

Minimum blocking error families:

- `SCHEMA_INVALID`
- `ANSWER_INCORRECT`
- `PATTERN_SPEC_MISMATCH`
- `UNKNOWN_ROLE_MISMATCH`
- `OPERATION_SEQUENCE_MISMATCH`
- `INTERMEDIATE_QUANTITY_MISSING`
- `UNIT_FLOW_INVALID`
- `SEMANTIC_RELATION_VIOLATION`
- `EQUIVALENCE_RULE_VIOLATION`
- `DEPTH_DOWNGRADE_DETECTED`
- `KNOWLEDGE_POINT_FIDELITY_MISMATCH`

## Mutation standard

Each production PatternGroup requires:

- at least one positive canonical fixture;
- at least two blocking mutations;
- one role mutation when roles exist;
- one operation or relation mutation;
- one unit mutation when units exist.

Mutation rejection must be deterministic. A test that merely changes the expected answer is not sufficient for semantic coverage.

## Compatibility rules

1. Stable generator logic may remain unchanged behind an adapter.
2. Existing public IDs may remain as aliases during migration.
3. Deprecated coarse mappings must not be removed until all selectors, URLs, and worksheet routes have migration evidence.
4. No new public mode becomes eligible without resolver, worksheet, answer-key, and renderer reachability evidence.
5. Existing subset D0 markers remain historically valid but must be scoped explicitly.

## Coverage metrics

Every migrated unit reports:

```text
SOURCE_KP_COVERAGE
KP_PATTERN_COVERAGE
KP_VALIDATOR_COVERAGE
KP_MUTATION_COVERAGE
PUBLIC_WORKSHEET_REACHABILITY
```

Definitions:

- `SOURCE_KP_COVERAGE`: source-authoritative KP represented canonically.
- `KP_PATTERN_COVERAGE`: canonical KP with at least one approved PatternGroup and PatternSpec.
- `KP_VALIDATOR_COVERAGE`: canonical KP whose groups have fidelity contracts, not merely answer hooks.
- `KP_MUTATION_COVERAGE`: canonical groups with required mutation rejection.
- `PUBLIC_WORKSHEET_REACHABILITY`: production-eligible canonical groups reachable through the public worksheet chain.

## Completion gates

### Planning gate

- source authority frozen;
- canonical schema frozen;
- reuse/adapt/replace inventory frozen;
- prohibited files listed.

### Implementation gate

- canonical registries valid;
- adapter deterministic;
- validator contracts implemented;
- mutation rejection passes;
- no legacy regression.

### Full-source D0 gate

Recommended minimums:

```text
SOURCE_KP_COVERAGE >= 90%
KP_PATTERN_COVERAGE >= 90%
KP_VALIDATOR_COVERAGE >= 85%
KP_MUTATION_COVERAGE >= 80%
PUBLIC_WORKSHEET_REACHABILITY >= 85%
```

Any excluded source objective must be named and justified; it cannot disappear from the denominator silently.

## Anti-scope-creep constraints

- One pilot unit first: G4A-U08.
- No migration of the other Batch A units before the pilot cost readback.
- No broad UI redesign.
- No generator rewrite unless the reuse audit proves an adapter cannot preserve fidelity.
- No cross-grade objective import.

## Acceptance checks

- [x] KP, PatternGroup, and PatternSpec responsibilities are separate.
- [x] Unknown roles and semantic relations are first-class fields.
- [x] Validators trace results back to KP / PG / PS.
- [x] Legacy runtime reuse is allowed through a blocking adapter.
- [x] Mutation rejection is mandatory.
- [x] Coverage metrics distinguish hook coverage from source-KP fidelity.
- [x] Pilot scope remains G4A-U08 only.

## Closeout

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_SOURCE_AUTHORITY_FROZEN
GOAL_DISTANCE_AFTER  = D2_BATCHA_VALIDATOR_ONTOLOGY_STANDARD_FROZEN
DISTANCE_REDUCED     = A reusable knowledge-graph-compatible migration contract is now fixed for the G4A-U08 pilot and later Batch A decisions.
REMAINING_BLOCKERS   = [G4A-U08 asset reuse scope not frozen, implementation approval gate]
NEXT_SHORTEST_STEP   = S76C_G4A_U08_ExistingAssetReuseAudit
STOP_REASON          = NONE
```
