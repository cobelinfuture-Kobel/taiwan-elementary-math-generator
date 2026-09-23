# POSTG-APP Master Controller — 79 Unit Registry and Wave Admission V1

```text
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-M00_MasterController79UnitRegistryAndWaveAdmissionContract
CONTRACT_ID = POSTG_APP_MASTER_CONTROLLER_79_UNIT_WAVE_ADMISSION_V1
STATUS = FIXED_QUEUE_AND_SHADOW_CONTROLLER_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

This milestone establishes one machine-readable controller for the complete 79-source-unit application-capability program. It consumes the fused global-context authority produced by M01 and prevents later tasks from treating the current 15 golden units as the complete curriculum universe.

```text
M01 Global Context Authority
→ M00 79-Unit Master Registry
→ Fixed Wave Queue
→ Per-Wave Application Capability Assessment
→ Single-Application / N+1 / PBL Admission
→ Shared Runtime
→ Validator
→ Worksheet Output
```

## 2. Authoritative source scope

The source-unit universe is frozen as:

```text
Batch A = 13  number sense and integer expression
Batch B = 24  decimal, fraction, factor/multiple and rounding
Batch C = 17  measurement, unit conversion and geometry formula
Batch D = 16  visual geometry, number line, chart and table
Batch E =  9  ratio, speed, relationship, word problem and fusion
Total   = 79
```

Every source node must occur exactly once in the source registry and exactly once in the fixed wave coverage.

## 3. Current golden baseline

Wave 01 contains the 15 currently golden-conformant runtime units. It is a baseline assessment wave, not a claim that only 15 source nodes exist.

One explicit composite mapping is required:

```text
goldenUnitId = g5a_u02_5a02
sourceNodeRefs = [
  g5a_u02_5a02a,
  g5a_u02_5a02a1
]
```

Therefore:

```text
Wave 01 golden unit count = 15
Wave 01 source-node coverage = 16
Remaining source nodes = 63
```

No parent/subnode relationship may be inferred automatically.

## 4. Fixed waves

```text
W01 = 15 golden units / 16 source nodes
W02 = 13 source nodes
W03 = 13 source nodes
W04 = 13 source nodes
W05 = 12 source nodes
W06 = 12 source nodes
```

W02–W06 preserve the deterministic S29C source-node order after removing source nodes already covered by W01.

A wave may not start production work merely because its predecessor is merged. It must satisfy the machine admission gate.

## 5. Admission gate

Each source node or explicit composite golden unit progresses through these gates:

```text
SOURCE_NODE_REGISTERED
KNOWLEDGE_OPERATION_AVAILABLE_OR_PLANNED
KP_APPLICATION_CLASSIFICATION_COMPLETE
CANONICAL_OPERATION_MODEL_COMPLETE
SINGLE_APPLICATION_ADMISSION_COMPLETE
GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE
N_PLUS_1_CONTRACT_COMPLETE
VALIDATOR_CONTRACT_COMPLETE
POSITIVE_NEGATIVE_FIXTURES_COMPLETE
SHARED_RUNTIME_SHADOW_PASS
PRODUCTION_ADMISSION_REVIEWED
```

M00 freezes the gate names and ordering. M00 does not satisfy the per-unit gates.

## 6. Controller states

```text
BASELINE_READY
QUEUED
BLOCKED_BY_PREVIOUS_WAVE
ASSESSMENT_IN_PROGRESS
SHADOW_READY
PRODUCTION_REVIEW_REQUIRED
PRODUCTION_ADMITTED
CLOSED
```

Initial state:

```text
W01 = BASELINE_READY
W02 = QUEUED
W03..W06 = BLOCKED_BY_PREVIOUS_WAVE
```

`BASELINE_READY` means the current golden KnowledgeOperation files exist and M01 context authority validates. It does not authorize new public application output.

## 7. M01 dependency

The controller must execute the M01 resolver and require:

```text
macroDomainCount = 16
mesoSituationCount = 48
microScenarioCount = 48
atomicEpisodeCount = 96
facetCount = 48
legacyFamilyMappingCount = 18
productionAdmittedNodeCount = 0
```

A missing or invalid context authority fails M00 closed.

## 8. Producer → state → consumer → readback

```text
Producer:
  S29C 79-source-unit assignment
  POSTG-APP-M01 fused context authority
  15 golden KnowledgeOperation registries

Authoritative state:
  postg-app-79-unit-registry.json
  postg-app-wave-plan.json
  postg-app-master-controller-state.json

Runtime consumer:
  src/curriculum/application/postg-app-master-controller.mjs

Readback:
  tools/curriculum/validate-postg-app-m00-master-controller.mjs
  tests/curriculum/postg-app-m00-master-controller.test.js
```

## 9. Fail-closed invariants

```text
source node total must equal 79
batch totals must equal 13/24/17/16/9
source node IDs must be unique
queue ordinals must be contiguous 1..79
golden baseline unit total must equal 15
W01 source-node coverage must equal 16
fixed wave source coverage must equal 79 without duplication
W02..W06 total must equal 63
all 15 golden KnowledgeOperation files must exist
all 15 golden registries must be GOLDEN_CONFORMANT and VALIDATED_COMPLETE
M01 authority validation must pass
production-admitted application unit count must remain 0
```

## 10. Scope boundary

Allowed:

```text
79-unit source registry
15-unit golden baseline mapping
fixed six-wave queue
admission gate contract
read-only shadow controller
validation CLI and regression tests
```

Forbidden:

```text
per-KP application classification
new PatternSpec authoring
new context bindings
question generation
public UI changes
renderer changes
production admission
automatic source-node hierarchy inference
```

## 11. Acceptance

```text
79/79 source nodes registered exactly once
15/15 golden baseline units verified
16 source nodes explicitly covered by W01
63 remaining source nodes assigned once to W02..W06
M01 resolver consumed and validated
controller returns READY_FOR_WAVE01_ASSESSMENT
production application admission count remains zero
```
