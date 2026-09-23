# Global Shared Runtime Capability Matrix Contract V1

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R04_SharedRuntimeCapabilityMatrix
AUTHORITY_MODE = SHADOW
```

## Purpose

R04 converts the 482-node curriculum graph into a software capability demand model. A runtime capability is a shared generator, validator, semantic, representation, answer-model, renderer, or orchestration facility. It is not a KnowledgePoint and is not a legacy Batch.

```text
KnowledgePoint
→ required / optional / forbidden shared runtime capabilities
→ delivery-state readback
```

## Invariants

1. All 482 R03 KnowledgePoints receive exactly one mapping.
2. Capabilities are shared; a capability may not be created only to mirror one KnowledgePoint identity.
3. Legacy Batch A–E values are provenance only and may not select a runtime profile.
4. Required, optional, and forbidden capability sets are disjoint.
5. `production_admitted`, `shadow_available`, and `contract_only` describe software evidence, not KnowledgePoint production admission.
6. Every KnowledgePoint remains `DEFERRED_TO_R06_R07`.
7. R04 may not assign delivery waves, replace the production consumer, or create a second generator/validator/renderer path.

## Capability delivery states

```text
production_admitted = existing public runtime evidence exists
shadow_available    = executable shared logic exists without global admission
contract_only       = requirement defined, admitted shared implementation absent
```

## KnowledgePoint matrix state

```text
ALL_REQUIRED_CAPABILITIES_PRODUCTION_ADMITTED
ALL_REQUIRED_CAPABILITIES_AVAILABLE_SHADOW
BLOCKED_BY_CONTRACT_ONLY_CAPABILITIES
```

These values only answer whether software capability implementations exist. They do not grant PatternSpec, source-unit, UI, or production admission.

## Classification

R04 uses semantic fields from the canonical KP: ID, canonical name, capability statement, indispensable concepts, reasoning invariant, misconceptions, and validator capability. The classification policy selects one primary runtime profile, then applies zero or more modifiers. `legacyBatchRefs` are copied for readback but forbidden as classification inputs.

## Quantity boundary

```text
mass unit identity + integer multiplication + same-unit quantity arithmetic
→ mass × integer capability demand

mass add/sub + kg↔g conversion + mixed-unit normalization
→ mixed-unit mass arithmetic capability demand
```

The first mapping explicitly forbids conversion capabilities. The second requires them. This prevents Batch C from becoming a monolithic blocker while preserving the conversion prerequisite.

## Mainline boundary

```text
current production consumer = site/assets/browser/pipeline/build-worksheet-document.js
production consumer changed = false
delivery wave rebased       = false
legacy compatibility moved  = false
production cutover allowed  = false
parallel runtime pipeline   = false
```

R05 may use the matrix to derive delivery waves. R06/R07 remain responsible for compatibility migration and consumer cutover.
